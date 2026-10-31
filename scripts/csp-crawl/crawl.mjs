#!/usr/bin/env node
// Drive a browser through Alice's web surfaces and report two things: the
// servers each surface contacted, and every Content Security Policy
// violation the pages raised. A development tool, run by hand against a
// local server or a preview deployment whenever a policy changes. Nothing
// here ships to users and no violation ever leaves the machine that runs it.
//
// Install once (not a workspace, on purpose: Playwright stays out of the
// app dependency tree):
//   cd scripts/csp-crawl && npm install
//   npx playwright install chromium        (or pass --channel chrome to use
//                                           the Google Chrome already installed)
//
// Usage, every target is optional and a missing one is skipped:
//   node crawl.mjs --site https://alicebtc.com \
//                  --app https://app.alicebtc.com
//
// Options:
//   --channel chrome        use the installed Google Chrome instead of Playwright's Chromium
//   --headed                show the browser
//   --inject-csp            on a local server that sends no headers, add the repository's
//                           policy to every document response, under the header its
//                           vercel.json uses (enforced or report-only), so violations can
//                           be observed against `next dev` or a static server
//   --no-send               on the app: open the chat without sending the question, so the
//                           crawl makes no Private Cloud request
//   --pay                   on the app: create a throwaway account and open the plan
//                           checkout up to the BTCPay page (nothing is paid). Creates one
//                           account on the target's Worker.
//   --model-wait <s>        how long to wait for the semantic model download (default 90)
//   --settle <ms>           idle time after each page (default 4000)
//   --json <file>           also write the full report as JSON
//   --fail-on-violation     exit 1 when at least one violation was recorded
//
// Documentation: docs/security/csp-tools.md
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

// ---------------------------------------------------------------- options

function parseArgs(argv) {
  const options = {
    site: process.env.CSP_CRAWL_SITE ?? null,
    app: process.env.CSP_CRAWL_APP ?? null,
    channel: process.env.CSP_CRAWL_CHANNEL ?? null,
    headed: false,
    injectCsp: false,
    pay: false,
    noSend: false,
    modelWait: 90,
    settle: 4000,
    json: null,
    failOnViolation: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) throw new Error(`${arg} needs a value`);
      return argv[index];
    };
    switch (arg) {
      case '--site': options.site = next(); break;
      case '--app': options.app = next(); break;
      case '--channel': options.channel = next(); break;
      case '--headed': options.headed = true; break;
      case '--inject-csp': options.injectCsp = true; break;
      case '--pay': options.pay = true; break;
      case '--no-send': options.noSend = true; break;
      case '--model-wait': options.modelWait = Number(next()); break;
      case '--settle': options.settle = Number(next()); break;
      case '--json': options.json = next(); break;
      case '--fail-on-violation': options.failOnViolation = true; break;
      case '--help': case '-h': options.help = true; break;
      default: throw new Error(`unknown option ${arg}`);
    }
  }
  return options;
}

function usage() {
  console.log('Usage: node crawl.mjs [--site URL] [--app URL] [options]\nSee the header of this file or docs/security/csp-tools.md for the options.');
}

// ----------------------------------------------------------------- report

const report = {
  startedAt: new Date().toISOString(),
  targets: {},
  steps: [],
  violations: new Map(),
  requests: new Map(),
  consoleCsp: new Map(),
};

function stripUrl(url) {
  // Keep the path, drop query strings and fragments: they can carry
  // identifiers and matter nothing to the policy.
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'blob:' || parsed.protocol === 'data:') return `${parsed.protocol}…`;
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function originOf(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'blob:' || parsed.protocol === 'data:') return parsed.protocol;
    return parsed.origin;
  } catch {
    return url;
  }
}

function recordRequest(target, url, type) {
  const origin = originOf(url);
  const key = `${target} ${origin}`;
  const entry = report.requests.get(key) ?? { target, origin, count: 0, types: new Set(), samples: new Set() };
  entry.count += 1;
  entry.types.add(type);
  if (entry.samples.size < 3) entry.samples.add(stripUrl(url));
  report.requests.set(key, entry);
}

function recordViolation(target, payload) {
  const directive = payload.effectiveDirective || payload.violatedDirective || '?';
  const blocked = payload.blockedURI || '?';
  const documentURL = stripUrl(payload.documentURL || '');
  const key = `${target}|${directive}|${blocked}|${documentURL}|${payload.disposition}`;
  const entry = report.violations.get(key) ?? {
    target,
    directive,
    blockedURI: blocked,
    documentURL,
    disposition: payload.disposition,
    sourceFile: payload.sourceFile ? stripUrl(payload.sourceFile) : null,
    line: payload.lineNumber ?? null,
    sample: payload.sample ? String(payload.sample).slice(0, 80) : null,
    count: 0,
  };
  entry.count += 1;
  report.violations.set(key, entry);
}

function recordConsoleCsp(target, text) {
  const key = `${target}|${text.slice(0, 200)}`;
  const entry = report.consoleCsp.get(key) ?? { target, text: text.slice(0, 300), count: 0 };
  entry.count += 1;
  report.consoleCsp.set(key, entry);
}

function log(message) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${message}`);
}

async function step(target, name, run) {
  const started = Date.now();
  try {
    const detail = await run();
    const status = detail && typeof detail === 'object' && detail.skipped ? 'skipped' : 'ok';
    const text = detail && typeof detail === 'object' ? detail.skipped ?? detail.note ?? '' : detail ?? '';
    report.steps.push({ target, name, status, detail: String(text), ms: Date.now() - started });
    log(`${target} · ${name}: ${status}${text ? ` (${text})` : ''}`);
  } catch (error) {
    const text = error instanceof Error ? error.message.split('\n')[0] : String(error);
    report.steps.push({ target, name, status: 'failed', detail: text, ms: Date.now() - started });
    log(`${target} · ${name}: failed (${text})`);
  }
}

// ---------------------------------------------------------------- browser

// Runs in every page and frame before any page script: the event is the
// only signal a report-only policy gives inside the page, and it fires for
// the enforced mode too.
const INIT_SCRIPT = `
  document.addEventListener('securitypolicyviolation', (event) => {
    const payload = {
      documentURL: event.documentURI,
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      effectiveDirective: event.effectiveDirective,
      disposition: event.disposition,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      sample: event.sample,
    };
    if (typeof window.__aliceCspReport === 'function') window.__aliceCspReport(payload);
  });
`;

async function openContext(browser, target, options, policy) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-US',
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  await context.exposeBinding('__aliceCspReport', (_source, payload) => recordViolation(target, payload));
  await context.addInitScript(INIT_SCRIPT);
  context.on('request', request => recordRequest(target, request.url(), request.resourceType()));
  context.on('page', page => {
    page.on('websocket', socket => recordRequest(target, socket.url(), 'websocket'));
    page.on('console', message => {
      const text = message.text();
      if (/content security policy/i.test(text)) recordConsoleCsp(target, text);
    });
  });
  if (options.injectCsp && policy) {
    // A local dev server sends no headers: add the repository's policy to
    // every document, in the mode its vercel.json declares, so the listener
    // above has something to see.
    const header = policy.mode === 'enforced' ? 'content-security-policy' : 'content-security-policy-report-only';
    await context.route('**/*', async route => {
      if (route.request().resourceType() !== 'document') return route.continue();
      const response = await route.fetch();
      const headers = { ...response.headers(), [header]: policy.csp };
      return route.fulfill({ response, headers });
    });
  }
  return context;
}

async function settle(page, options, extraMs = 0) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(options.settle + extraMs);
}

async function clickIfVisible(locator, timeout = 1_500) {
  try {
    const target = locator.first();
    if (await target.isVisible({ timeout })) {
      await target.click({ timeout });
      return true;
    }
  } catch {
    // Not there: nothing to dismiss.
  }
  return false;
}

async function dismissIntros(page) {
  for (const name of ['Close introduction', 'Close', 'Fermer', 'Dismiss']) {
    await clickIfVisible(page.getByRole('button', { name, exact: true }));
  }
}

// ------------------------------------------------------------------- site

async function crawlSite(browser, base, options, policy) {
  const target = 'site';
  const context = await openContext(browser, target, options, policy);
  const page = await context.newPage();
  for (const path of ['/', '/memory', '/pricing', '/privacy', '/trust', '/credits', '/vs/chatgpt']) {
    await step(target, `open ${path}`, async () => {
      const response = await page.goto(new URL(path, base).href, { waitUntil: 'domcontentloaded' });
      await settle(page, options);
      return `HTTP ${response?.status() ?? '?'}`;
    });
  }
  await context.close();
}

// -------------------------------------------------------------------- app

async function crawlApp(browser, base, options, policy) {
  const target = 'app';
  const context = await openContext(browser, target, options, policy);
  const page = await context.newPage();
  const open = async path => {
    const response = await page.goto(new URL(path, base).href, { waitUntil: 'domcontentloaded' });
    await settle(page, options);
    await dismissIntros(page);
    return response?.status() ?? '?';
  };

  await step(target, 'home, chat', async () => {
    const status = await open('/');
    const input = page.getByLabel('Message Alice');
    await input.fill('What is a UTXO?', { timeout: 10_000 });
    if (options.noSend) return `HTTP ${status}, question typed, not sent (--no-send)`;
    await input.press('Enter');
    await settle(page, options, 20_000);
    return `HTTP ${status}, one question sent`;
  });

  await step(target, 'explorer', async () => {
    const status = await open('/explorer');
    await settle(page, options, 4_000);
    // A block tile shows its height; open the first one so a block page and
    // its providers are exercised too.
    const latest = page.getByRole('button', { name: /^Open the latest .* block$/ });
    let opened = await clickIfVisible(latest, 3_000);
    if (!opened) opened = await clickIfVisible(page.locator('main button[data-block-height]'), 3_000);
    if (opened) await settle(page, options, 4_000);
    return `HTTP ${status}${opened ? ', a block opened' : ', no block tile seen'}`;
  });

  await step(target, 'learn', async () => {
    const status = await open('/learn');
    await settle(page, options, 4_000);
    // The catalog is one page and its courses are buttons: open the first
    // one that is not a labelled control (scroll arrows, close, search).
    const course = page.locator('main button:not([aria-label])').filter({ hasText: /\S/ });
    let entered = false;
    if (await course.count()) {
      await course.first().click({ timeout: 5_000 });
      await settle(page, options, 4_000);
      entered = true;
    }
    return `HTTP ${status}${entered ? ', first course opened' : ', catalog only'}`;
  });

  await step(target, 'settings, AI tab, semantic model download', async () => {
    const status = await open('/settings?tab=ai');
    const download = page.getByRole('button', { name: /^(DOWNLOAD |LOAD NOW|RETRY)/ });
    if (!(await clickIfVisible(download, 3_000))) {
      return { note: `HTTP ${status}, no download button (model already present, or the section is off)` };
    }
    const bar = page.getByRole('progressbar', { name: 'Downloading semantic search model' });
    await bar.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    await bar.waitFor({ state: 'hidden', timeout: options.modelWait * 1_000 }).catch(() => {});
    await settle(page, options);
    const stillDownloading = await bar.isVisible().catch(() => false);
    return `HTTP ${status}, ${stillDownloading ? `download still running after ${options.modelWait}s` : 'download finished or stopped'}`;
  });

  await step(target, 'settings, AI tab, local models', async () => {
    const details = page.getByRole('button', { name: 'Open details' });
    if (await details.count()) return 'local model list present (downloads are desktop only, not exercised here)';
    return { skipped: 'local models are desktop only' };
  });

  await step(target, 'settings, account tab, plan prices', async () => {
    const status = await open('/settings?tab=account');
    await settle(page, options, 2_000);
    return `HTTP ${status}`;
  });

  await step(target, 'payment up to BTCPay', async () => {
    if (!options.pay) return { skipped: 'pass --pay to create a throwaway account and open the checkout' };
    const pay = page.getByRole('button', { name: /^(PAY|CREATE ACCOUNT AND PAY) / });
    await pay.first().waitFor({ state: 'visible', timeout: 15_000 });
    const label = (await pay.first().textContent())?.trim() ?? '';
    if (label.startsWith('CREATE ACCOUNT')) {
      await pay.first().click();
      // The account dialog: choose "create", a name part, a generated password.
      const create = page.getByRole('group', { name: 'Account access' }).getByRole('button', { name: 'CREATE ACCOUNT' });
      await clickIfVisible(create, 5_000);
      await page.getByLabel('Username name part').fill('cspcrawl', { timeout: 10_000 });
      const password = `Crawl-${randomBytes(12).toString('base64url')}`;
      await page.getByPlaceholder('Password, 15+ characters').fill(password);
      await page.getByRole('button', { name: 'CREATE ACCOUNT', exact: true }).last().click();
      await settle(page, options, 3_000);
      await pay.first().waitFor({ state: 'visible', timeout: 20_000 });
    }
    const popupPromise = context.waitForEvent('page', { timeout: 30_000 });
    await pay.first().click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded').catch(() => {});
    await settle(popup, options, 3_000);
    const where = originOf(popup.url());
    await popup.close();
    return `checkout opened at ${where}, nothing paid`;
  });

  for (const path of ['/what-alice-knows', '/playground', '/privacy', '/test-wallet']) {
    await step(target, `open ${path}`, async () => `HTTP ${await open(path)}`);
  }

  await context.close();
}

// ------------------------------------------------------------------- main

async function loadRepositoryPolicies() {
  try {
    const { loadRepository } = await import('../check-csp-parity.mjs');
    const { policies, modes } = loadRepository();
    const render = directives => [...directives].map(([name, sources]) => `${name} ${sources.join(' ')}`).join('; ');
    return {
      site: { csp: render(policies.site), mode: modes.site },
      app: { csp: render(policies['app-web']), mode: modes['app-web'] },
    };
  } catch (error) {
    log(`could not load the repository policies for --inject-csp: ${error instanceof Error ? error.message : error}`);
    return {};
  }
}

function printReport(options) {
  const targets = Object.keys(report.targets);
  console.log('\n==================== Servers contacted ====================');
  for (const target of targets) {
    console.log(`\n[${target}] ${report.targets[target]}`);
    const rows = [...report.requests.values()].filter(row => row.target === target).sort((a, b) => b.count - a.count);
    for (const row of rows) {
      console.log(`  ${row.origin.padEnd(48)} ${String(row.count).padStart(5)}  ${[...row.types].sort().join(',')}`);
    }
  }

  console.log('\n==================== CSP violations ====================');
  const violations = [...report.violations.values()];
  if (violations.length === 0) console.log('\n  none recorded by the securitypolicyviolation listener');
  for (const target of targets) {
    const rows = violations.filter(row => row.target === target);
    if (rows.length === 0) continue;
    console.log(`\n[${target}]`);
    for (const row of rows) {
      const where = row.sourceFile ? ` from ${row.sourceFile}${row.line ? `:${row.line}` : ''}` : '';
      console.log(`  ${row.directive.padEnd(16)} ${row.blockedURI.padEnd(44)} x${row.count} (${row.disposition}) on ${row.documentURL}${where}`);
      if (row.sample) console.log(`      sample: ${row.sample}`);
    }
  }
  const consoleRows = [...report.consoleCsp.values()];
  if (consoleRows.length) {
    console.log('\n  Console messages mentioning the policy (may repeat the list above, and may come from workers the listener cannot see):');
    for (const row of consoleRows) console.log(`  [${row.target}] x${row.count} ${row.text}`);
  }

  console.log('\n==================== Steps ====================\n');
  for (const row of report.steps) {
    console.log(`  ${row.status.padEnd(7)} ${row.target.padEnd(6)} ${row.name}${row.detail ? ` — ${row.detail}` : ''}`);
  }
  if (Object.values(report.targets).some(url => /localhost|127\.0\.0\.1/.test(url))) {
    console.log('\n  Local targets: a Next dev server evaluates code with eval (script-src eval above is dev only), and the dev build may');
    console.log('  point at the development Worker host instead of proxy.alicebtc.com. Read those violations as local artefacts and confirm on a preview deployment.');
  }
  const failed = report.steps.filter(row => row.status === 'failed').length;
  console.log(`\n${report.steps.length} steps, ${failed} failed, ${violations.length} distinct violation(s), ${report.requests.size} origin/target pairs.`);
  console.log('A failed step means the crawl could not drive that screen; the requests and violations seen up to that point are still listed.');

  if (options.json) {
    const json = {
      ...report,
      finishedAt: new Date().toISOString(),
      violations,
      requests: [...report.requests.values()].map(row => ({ ...row, types: [...row.types], samples: [...row.samples] })),
      consoleCsp: consoleRows,
    };
    writeFileSync(options.json, `${JSON.stringify(json, null, 2)}\n`);
    console.log(`Report written to ${options.json}`);
  }
  return violations.length;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return 0;
  }
  if (!options.site && !options.app) {
    usage();
    console.error('\nAt least one of --site, --app (or CSP_CRAWL_SITE / CSP_CRAWL_APP) is required.');
    return 2;
  }
  const policies = options.injectCsp ? await loadRepositoryPolicies() : {};

  const launch = { headless: !options.headed };
  if (options.channel) launch.channel = options.channel;
  let browser;
  try {
    browser = await chromium.launch(launch);
  } catch (error) {
    console.error(`Could not launch the browser: ${error instanceof Error ? error.message.split('\n')[0] : error}`);
    console.error('Run `npx playwright install chromium` in scripts/csp-crawl, or pass --channel chrome to use the installed Google Chrome.');
    return 2;
  }
  log(`browser ${browser.version()}${options.channel ? ` (${options.channel})` : ''}${options.injectCsp ? ', repository CSP injected on documents' : ''}`);

  try {
    if (options.site) {
      report.targets.site = options.site;
      await crawlSite(browser, options.site, options, policies.site);
    }
    if (options.app) {
      report.targets.app = options.app;
      await crawlApp(browser, options.app, options, policies.app);
    }
  } finally {
    await browser.close();
  }

  const violations = printReport(options);
  return options.failOnViolation && violations > 0 ? 1 : 0;
}

main().then(code => process.exit(code), error => {
  console.error(error);
  process.exit(2);
});
