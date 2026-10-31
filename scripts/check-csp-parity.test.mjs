import assert from 'node:assert/strict';
import test from 'node:test';
import { compareCsp, extractCsp, loadRepository, parseCsp } from './check-csp-parity.mjs';

test('parseCsp splits directives and keeps the sources in order', () => {
  const parsed = parseCsp("default-src 'self'; connect-src 'self' https://a.example wss://b.example;  img-src 'self' data:");
  assert.deepEqual([...parsed.keys()], ['default-src', 'connect-src', 'img-src']);
  assert.deepEqual(parsed.get('connect-src'), ["'self'", 'https://a.example', 'wss://b.example']);
  assert.deepEqual(parsed.get('img-src'), ["'self'", 'data:']);
});

test('extractCsp reads a vercel.json header and a tauri.conf.json policy', () => {
  const vercel = { headers: [{ source: '/(.*)', headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'" },
  ] }] };
  assert.deepEqual(extractCsp(vercel), { csp: "default-src 'self'", mode: 'report-only' });
  const enforced = { headers: [{ headers: [{ key: 'content-security-policy', value: "default-src 'none'" }] }] };
  assert.deepEqual(extractCsp(enforced), { csp: "default-src 'none'", mode: 'enforced' });
  const tauri = { app: { security: { csp: "default-src 'self' tauri:" } } };
  assert.deepEqual(extractCsp(tauri), { csp: "default-src 'self' tauri:", mode: 'tauri' });
  assert.throws(() => extractCsp({ headers: [{ headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] }] }), /no Content Security Policy/);
});

const web = parseCsp("default-src 'self'; connect-src 'self' https://shared.example https://web.example; frame-ancestors 'none'");
const desktop = parseCsp("default-src 'self' tauri:; connect-src 'self' https://shared.example");

test('identical sources need no exception, every other difference does', () => {
  const findings = compareCsp({ web, desktop }, []);
  assert.deepEqual(findings.map(finding => `${finding.kind} ${finding.directive} ${finding.source}`), [
    'undocumented connect-src https://web.example',
    'undocumented default-src tauri:',
    "undocumented frame-ancestors 'none'",
  ]);
  assert.match(findings[0].message, /present in web, missing from desktop/);
});

test('a documented exception covers a difference only when its policy set matches exactly', () => {
  const exceptions = [
    { directive: 'connect-src', sources: ['https://web.example'], expectedIn: ['web'], reason: 'web only' },
    { directive: 'default-src', sources: ['tauri:'], expectedIn: ['desktop'], reason: 'desktop only' },
    { directive: 'frame-ancestors', sources: ['*'], expectedIn: ['web'], reason: 'no fallback on desktop' },
  ];
  assert.deepEqual(compareCsp({ web, desktop }, exceptions), []);

  const wrongSet = [{ ...exceptions[0], expectedIn: ['desktop'] }, exceptions[1], exceptions[2]];
  const findings = compareCsp({ web, desktop }, wrongSet);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, 'mismatch');
  assert.match(findings[0].message, /expects it in desktop, found in web/);
});

test('an exception that matches no difference is reported as stale', () => {
  const exceptions = [
    { directive: 'connect-src', sources: ['https://web.example'], expectedIn: ['web'], reason: 'web only' },
    { directive: 'default-src', sources: ['tauri:'], expectedIn: ['desktop'], reason: 'desktop only' },
    { directive: 'frame-ancestors', sources: ["'none'"], expectedIn: ['web'], reason: 'no fallback on desktop' },
    { directive: 'connect-src', sources: ['https://gone.example'], expectedIn: ['web'], reason: 'removed last month' },
  ];
  const findings = compareCsp({ web, desktop }, exceptions);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, 'stale');
  assert.match(findings[0].message, /gone\.example/);
});

test('the repository policies hold parity under the documented exceptions', () => {
  const { policies, modes, exceptions } = loadRepository();
  assert.deepEqual(Object.keys(policies), ['site', 'app-web', 'desktop', 'android', 'ios']);
  assert.equal(modes.desktop, 'tauri');
  assert.equal(modes.android, 'tauri');
  assert.equal(modes.ios, 'tauri');
  for (const name of ['site', 'app-web']) assert.match(modes[name], /^(report-only|enforced)$/);
  const findings = compareCsp(policies, exceptions);
  assert.deepEqual(findings.map(finding => finding.message), []);
});

test('no policy allows eval; WebAssembly goes through wasm-unsafe-eval in script-src', () => {
  const { policies } = loadRepository();
  for (const [name, directives] of Object.entries(policies)) {
    for (const [directive, sources] of directives) {
      assert.ok(!sources.includes("'unsafe-eval'"), `${name} ${directive} allows 'unsafe-eval'`);
    }
  }
  for (const name of ['app-web', 'desktop']) {
    assert.ok(policies[name].get('script-src')?.includes("'wasm-unsafe-eval'"), name);
  }
});
