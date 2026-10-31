// Browser regression checks against a locally served production build.
// Install the existing scripts/csp-crawl dev dependencies first. No real
// addresses, wallet secrets or payments are needed; every external response
// is intercepted. Real-operator smoke checks are separate.
// Usage: node scripts/verify-arkade-explorer.mjs http://127.0.0.1:3047 /tmp/arkade-check
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Transaction } from '@scure/btc-signer';
import { ARKADE_TEST_ADDRESS, ARKADE_TEST_SCRIPT, wireVtxo, wireTxid } from '../apps/app-web/src/lib/explorer/arkade-indexer-fixture.ts';

const require = createRequire(new URL('./csp-crawl/package.json', import.meta.url));
const { chromium, webkit } = require('playwright');
const [base = 'http://127.0.0.1:3047', output = '/tmp/alice-arkade-browser'] = process.argv.slice(2);
const origin = new URL(base).origin;
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Use a local test build.');
await mkdir(output, { recursive: true });
const COMMIT = 'c'.repeat(64);
const COIN = wireTxid(1);
const script = Uint8Array.from(Buffer.from(ARKADE_TEST_SCRIPT, 'hex'));
const tx = new Transaction({ allowUnknown: true });
tx.addInput({ txid: COMMIT, index: 0, witnessUtxo: { script, amount: 1000n } });
tx.addOutput({ script, amount: 1000n });
const psbt = Buffer.from(tx.toPSBT(0)).toString('base64');
const info = { version: 'fixture', network: 'bitcoin', signerPubkey: '038202bebddeb1f7442803897a85eaf3ce9254d07df0172fc3725ab5f0d097779c', forfeitAddress: '', sessionDuration: '60', dust: '330', vtxoMinAmount: '330', vtxoMaxAmount: '0', unilateralExitDelay: '1024', maxTxWeight: '400000' };

const scenarios = [
  { name: 'three-pages', count: 1001, size: 500 },
  { name: 'full-last-page', count: 1000, size: 500 },
  { name: 'server-smaller-pages', count: 250, size: 100 },
  { name: 'page-two-fails', count: 1001, size: 500, fail: true },
  { name: 'date-height-unknown', count: 3, size: 500, locale: 'en' },
  { name: 'height-french', count: 3, size: 500, locale: 'fr' },
  { name: 'vtxo-exit-height', detail: true, count: 1, size: 500 },
];
const results = [];
const engine = process.env.ARKADE_BROWSER === 'webkit' ? 'webkit' : 'chromium';
const browser = engine === 'webkit' ? await webkit.launch() : await chromium.launch({ channel: 'chrome' });
try {
  for (const scenario of scenarios) {
    const locale = scenario.locale ?? 'en';
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: locale === 'fr' ? 'fr-FR' : 'en-US' });
    await context.addInitScript(({ locale }) => {
      localStorage.setItem('alice_app_language', locale);
      localStorage.setItem('explorer.intro-dismissed.v1', '1');
    }, { locale });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const requests = [];
    const coins = Array.from({ length: scenario.count }, (_, i) => wireVtxo({ n: i + 1, expiresAt: i % 3 === 0 ? '950000' : i % 3 === 1 ? '1789357275' : null }));
    await context.route('**/*', async route => {
      const u = new URL(route.request().url());
      if (u.origin === origin) return route.continue();
      if (u.hostname !== 'arkade.computer') return route.fulfill({ status: 404, json: { message: 'Outside this fixture' } });
      const json = body => route.fulfill({ json: body });
      if (u.pathname === '/v1/info') return json(info);
      if (u.pathname === '/v1/indexer/vtxos') {
        if (u.searchParams.has('outpoints')) {
          const matches = u.searchParams.getAll('outpoints').includes(`${COIN}:0`) ? [coins[0]] : [];
          return json({ vtxos: matches });
        }
        const index = Math.max(1, Number(u.searchParams.get('page.index') ?? 1));
        const size = Math.min(scenario.size, Number(u.searchParams.get('page.size') ?? 500));
        requests.push(index);
        if (scenario.fail && index === 2) return route.fulfill({ status: 400, json: { code: 3, message: 'Fixture page 2 failed' } });
        const total = Math.ceil(coins.length / size);
        return json({ vtxos: coins.slice((index - 1) * size, index * size), page: { current: index, next: Math.min(index + 1, total), total } });
      }
      if (u.pathname.endsWith('/chain')) return json({ chain: [
        { txid: COIN, type: 'INDEXER_CHAINED_TX_TYPE_TREE', expiresAt: '950000', spends: [COMMIT] },
        { txid: COMMIT, type: 'INDEXER_CHAINED_TX_TYPE_COMMITMENT', expiresAt: '950000', spends: [] },
      ] });
      if (u.pathname === `/v1/indexer/virtualTx/${COIN}`) return json({ txs: [psbt] });
      return route.fulfill({ status: 404, json: { code: 5, message: 'not found' } });
    });
    const result = { engine, scenario: scenario.name, requests, errors, passed: false };
    try {
      const subject = scenario.detail ? `vtxo=${COIN}:0` : `address=${ARKADE_TEST_ADDRESS}`;
      await page.goto(`${base}/explorer/?network=arkade&${subject}`, { waitUntil: 'domcontentloaded' });
      if (scenario.fail) {
        await page.getByText(/Fixture page 2 failed|Failed to fetch vtxos/i).waitFor({ timeout: 20000 });
        assert.equal(await page.getByText('TOTAL VTXOS', { exact: true }).count(), 0, 'no partial metrics');
        assert.deepEqual(requests, [1, 2]);
      } else if (scenario.detail) {
        await page.getByText('EXPIRES', { exact: true }).waitFor({ timeout: 20000 });
        const metric = await page.getByText('EXPIRES', { exact: true }).locator('..').innerText();
        assert.match(metric, /block\s+950[\s,]?000/i);
      } else {
        const label = locale === 'fr' ? 'TOTAL VTXO' : 'TOTAL VTXOS';
        // The translated metric label is read from the dictionary below when needed.
        const { fr } = await import('../apps/app-web/src/i18n/fr.ts');
        const actualLabel = locale === 'fr' ? fr['explorerArk.address.totalVtxos'] : label;
        await page.getByText(actualLabel, { exact: true }).locator('..').getByText(scenario.count.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US'), { exact: true }).waitFor({ timeout: 20000 });
        const metric = await page.getByText(actualLabel, { exact: true }).locator('..').innerText();
        assert.equal(Number(metric.replace(actualLabel, '').replace(/[^0-9]/g, '')), scenario.count, 'complete VTXO count');
        const { en } = await import('../apps/app-web/src/i18n/en.ts');
        const spendableLabel = (locale === 'fr' ? fr : en)['explorerArk.address.spendable'];
        const balance = await page.getByText(spendableLabel, { exact: true }).locator('..').innerText();
        assert.equal(Number(balance.replace(spendableLabel, '').replace(/[^0-9]/g, '')), scenario.count * 1000, 'complete balance');
        assert.deepEqual(requests, Array.from({ length: Math.ceil(scenario.count / scenario.size) }, (_, i) => i + 1));
      }
      const text = await page.locator('body').innerText();
      if (!scenario.fail) {
        assert.match(text, locale === 'fr' ? /bloc\s+950[\s\u202f\u00a0,]?000/i : /block\s+950[\s,]?000/i);
        assert.doesNotMatch(text, /1970/, 'height never renders as epoch date');
        if (scenario.name === 'date-height-unknown') {
          assert.match(text, /2026/, 'timestamp still renders as a date');
          assert.match(text, /unknown/i, 'missing expiry explicitly unknown');
        }
      }
      assert.deepEqual(errors, [], 'no JavaScript runtime error');
      result.passed = true;
      await writeFile(path.join(output, `${engine}-${scenario.name}.txt`), text);
    } catch (e) { result.failure = e.message; }
    await page.screenshot({ path: path.join(output, `${engine}-${scenario.name}.png`), fullPage: true });
    results.push(result);
    console.log(JSON.stringify(result));
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(path.join(output, `${engine}-results.json`), JSON.stringify(results, null, 2));
if (results.some(r => !r.passed)) process.exitCode = 1;
