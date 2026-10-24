#!/usr/bin/env node
// Compare the Content Security Policies of the three Vercel hosts with each
// other and with the desktop app's policy, and fail when a source is present
// on one side and missing on another without a documented reason.
//
// The web policies live in the `vercel.json` of each app (enforced on Alice
// Web, report-only on the site); the desktop policy lives in
// `apps/app-desktop/src-tauri/tauri.conf.json` under `app.security.csp`.
// Legitimate differences (the desktop's `tauri:` scheme, the site's
// analytics) are listed with a reason in
// `scripts/csp-parity-exceptions.json`. Every other difference, and every
// exception that no longer matches the files, fails the check.
//
// Usage:
//   node scripts/check-csp-parity.mjs            compare, exit 1 on a difference
//   node scripts/check-csp-parity.mjs --list     also print every directive
//
// Documentation: docs/security/csp-tools.md
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The four policies, by the name the exceptions file uses. */
export const POLICY_FILES = {
  site: 'apps/site/vercel.json',
  'app-web': 'apps/app-web/vercel.json',
  desktop: 'apps/app-desktop/src-tauri/tauri.conf.json',
};

export const EXCEPTIONS_FILE = 'scripts/csp-parity-exceptions.json';

/**
 * Parse a CSP string into a map of directive name to the list of its
 * sources, in file order. Directive names are lower-cased; sources keep
 * their spelling, so `'self'` and `https://A.example` compare as written.
 */
export function parseCsp(value) {
  const directives = new Map();
  for (const part of String(value).split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const [name, ...sources] = tokens;
    directives.set(name.toLowerCase(), sources);
  }
  return directives;
}

/**
 * Read the CSP out of a `vercel.json` (the first header whose key is
 * `Content-Security-Policy` or `Content-Security-Policy-Report-Only`) or a
 * `tauri.conf.json` (`app.security.csp`). Returns the policy text and, for
 * the web, whether it is enforced or report-only.
 */
export function extractCsp(json) {
  if (json && json.app && json.app.security && typeof json.app.security.csp === 'string') {
    return { csp: json.app.security.csp, mode: 'desktop' };
  }
  for (const rule of json?.headers ?? []) {
    for (const header of rule.headers ?? []) {
      const key = String(header.key).toLowerCase();
      if (key === 'content-security-policy') return { csp: header.value, mode: 'enforced' };
      if (key === 'content-security-policy-report-only') return { csp: header.value, mode: 'report-only' };
    }
  }
  throw new Error('no Content Security Policy found in this file');
}

function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

function setLabel(set) {
  return [...set].sort().join(', ') || 'none';
}

/**
 * Compare parsed policies (`{ name: Map<directive, sources[]> }`) under the
 * exceptions. A source that every policy carries needs no exception. Any
 * other source needs an exception whose `expectedIn` is exactly the set of
 * policies carrying it. An exception may name several `sources`, or `"*"`
 * for every source of the directive. Returns the list of findings; an empty
 * list means parity holds.
 */
export function compareCsp(policies, exceptions) {
  const names = Object.keys(policies);
  const all = new Set(names);
  const findings = [];
  const used = new Set();

  const directiveNames = new Set();
  for (const name of names) for (const directive of policies[name].keys()) directiveNames.add(directive);

  const rulesFor = (directive, source) => {
    const matches = [];
    exceptions.forEach((exception, index) => {
      if (exception.directive !== directive) return;
      const sources = exception.sources ?? (exception.source ? [exception.source] : []);
      if (sources.includes(source)) matches.push({ exception, index, wildcard: false });
      else if (sources.includes('*')) matches.push({ exception, index, wildcard: true });
    });
    // An explicit source rule wins over a wildcard rule for the directive.
    return matches.find(match => !match.wildcard) ?? matches[0] ?? null;
  };

  for (const directive of [...directiveNames].sort()) {
    const sources = new Set();
    for (const name of names) for (const source of policies[name].get(directive) ?? []) sources.add(source);

    for (const source of [...sources].sort()) {
      const presentIn = new Set(names.filter(name => (policies[name].get(directive) ?? []).includes(source)));
      if (sameSet(presentIn, all)) continue;
      const match = rulesFor(directive, source);
      const missing = names.filter(name => !presentIn.has(name));
      if (!match) {
        findings.push({
          kind: 'undocumented',
          directive,
          source,
          presentIn: [...presentIn],
          message: `${directive} ${source}: present in ${setLabel(presentIn)}, missing from ${missing.join(', ')}, no documented exception`,
        });
        continue;
      }
      used.add(match.index);
      const expected = new Set(match.exception.expectedIn ?? []);
      if (!sameSet(presentIn, expected)) {
        findings.push({
          kind: 'mismatch',
          directive,
          source,
          presentIn: [...presentIn],
          expectedIn: [...expected],
          message: `${directive} ${source}: the exception expects it in ${setLabel(expected)}, found in ${setLabel(presentIn)}`,
        });
      }
    }
  }

  exceptions.forEach((exception, index) => {
    if (used.has(index)) return;
    const sources = exception.sources ?? (exception.source ? [exception.source] : []);
    findings.push({
      kind: 'stale',
      directive: exception.directive,
      source: sources.join(' '),
      message: `${exception.directive} ${sources.join(' ')}: the exception matches no difference any more, remove it or fix the policies`,
    });
  });

  return findings;
}

/** Load the four policies and the exceptions from the repository. */
export function loadRepository(root = ROOT) {
  const policies = {};
  const modes = {};
  for (const [name, file] of Object.entries(POLICY_FILES)) {
    const json = JSON.parse(readFileSync(join(root, file), 'utf8'));
    const { csp, mode } = extractCsp(json);
    policies[name] = parseCsp(csp);
    modes[name] = mode;
  }
  const exceptions = JSON.parse(readFileSync(join(root, EXCEPTIONS_FILE), 'utf8')).exceptions;
  for (const exception of exceptions) {
    if (typeof exception.directive !== 'string' || !Array.isArray(exception.expectedIn) || typeof exception.reason !== 'string' || !exception.reason.trim()) {
      throw new Error(`malformed exception in ${EXCEPTIONS_FILE}: ${JSON.stringify(exception)}`);
    }
    for (const name of exception.expectedIn) {
      if (!(name in POLICY_FILES)) throw new Error(`unknown policy "${name}" in ${EXCEPTIONS_FILE}`);
    }
  }
  return { policies, modes, exceptions };
}

function main() {
  const list = process.argv.includes('--list');
  const { policies, modes, exceptions } = loadRepository();

  for (const [name, mode] of Object.entries(modes)) {
    console.log(`${name.padEnd(14)} ${POLICY_FILES[name]} (${mode}, ${policies[name].size} directives)`);
  }
  if (list) {
    for (const [name, directives] of Object.entries(policies)) {
      console.log(`\n[${name}]`);
      for (const [directive, sources] of directives) console.log(`  ${directive}: ${sources.join(' ')}`);
    }
    console.log('');
  }

  const findings = compareCsp(policies, exceptions);
  if (findings.length === 0) {
    console.log(`CSP parity holds across ${Object.keys(policies).length} policies with ${exceptions.length} documented exceptions.`);
    return 0;
  }
  console.error(`\n${findings.length} CSP parity finding(s):`);
  for (const finding of findings) console.error(`  - [${finding.kind}] ${finding.message}`);
  console.error(`\nDocument a legitimate difference in ${EXCEPTIONS_FILE}, or align the policies.`);
  return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
