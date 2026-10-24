import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_SECURITY_HEADERS, prepareWebDeployment } from './prepare-web-deployment.mjs';

const realConfigPath = fileURLToPath(new URL('../apps/app-web/vercel.json', import.meta.url));

async function fixture(t, config) {
  const root = await mkdtemp(join(tmpdir(), 'alice-deploy-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(root, 'out');
  for (const dir of ['about', '_next/static/chunks']) await mkdir(join(source, dir), { recursive: true });
  await writeFile(join(source, 'index.html'), '<html>home</html>');
  await writeFile(join(source, '404.html'), '<html>missing</html>');
  await writeFile(join(source, 'about/index.html'), '<html>about</html>');
  await writeFile(join(source, '_next/static/chunks/app.js'), 'console.log(1)');
  const vercelConfig = join(root, 'vercel.json');
  const text = config === undefined ? await readFile(realConfigPath, 'utf8')
    : typeof config === 'string' ? config : JSON.stringify(config);
  if (config !== null) await writeFile(vercelConfig, text);
  return { root, source, output: join(root, 'output'), vercelConfig };
}

async function realConfig() {
  return JSON.parse(await readFile(realConfigPath, 'utf8'));
}

test('every configured header reaches every response before any terminating route', async t => {
  const paths = await fixture(t);
  assert.equal(await prepareWebDeployment(paths), 2);
  const { version, routes } = JSON.parse(await readFile(join(paths.output, 'config.json'), 'utf8'));
  assert.equal(version, 3);

  // Parity with vercel.json, read independently of the script.
  const expected = {};
  for (const rule of (await realConfig()).headers) {
    for (const { key, value } of rule.headers) expected[key] = value;
  }
  for (const name of REQUIRED_SECURITY_HEADERS) assert.ok(expected[name], `${name} is configured`);
  const [security, ...rest] = routes;
  assert.deepEqual(security.headers, expected);
  assert.equal(security.continue, true);
  assert.equal(security.dest, undefined);
  assert.equal(security.status, undefined);
  for (const path of ['/', '/about/', '/about', '/index.html', '/404.html', '/missing/deep', '/_next/static/chunks/app.js']) {
    assert.ok(new RegExp(security.src).test(path), `${path} receives the security headers`);
  }

  // Cache behavior and the 404 fallback are unchanged, and no other route
  // sets a security header that could disagree with vercel.json.
  assert.deepEqual(rest, [
    { src: '/_next/static/(.*)', headers: { 'Cache-Control': 'public,max-age=31536000,immutable' }, continue: true },
    { src: '^/about/?$', dest: '/about/index.html', headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } },
    { src: '^/$', dest: '/index.html', headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/404.html', status: 404 },
  ]);

  // Only the static export is uploaded.
  const uploaded = (await readdir(join(paths.output, 'static'), { recursive: true })).sort();
  assert.deepEqual(uploaded, (await readdir(paths.source, { recursive: true })).sort());
  assert.deepEqual((await readdir(paths.output)).sort(), ['config.json', 'static']);
});

test('missing, malformed or unsupported header configuration fails before any output', async t => {
  const base = await realConfig();
  const headers = base.headers[0].headers;
  const variant = change => { const copy = structuredClone(base); change(copy); return copy; };
  const cases = {
    missing: null,
    'invalid JSON': '{"headers": [',
    'no headers': variant(c => { delete c.headers; }),
    'empty headers': variant(c => { c.headers = []; }),
    'missing CSP': variant(c => { c.headers[0].headers = headers.filter(h => h.key !== 'Content-Security-Policy'); }),
    'narrower source': variant(c => { c.headers[0].source = '/app/(.*)'; }),
    'second scope': variant(c => { c.headers.push({ source: '/learn/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] }); }),
    'conditional rule': variant(c => { c.headers[0].has = [{ type: 'host', value: 'example.invalid' }]; }),
    'unknown setting': variant(c => { c.rewrites = [{ source: '/a', destination: '/b' }]; }),
    'cache override': variant(c => { c.headers[0].headers.push({ key: 'cache-control', value: 'no-store' }); }),
    duplicate: variant(c => { c.headers[0].headers.push({ key: 'x-frame-options', value: 'SAMEORIGIN' }); }),
    'header injection': variant(c => { c.headers[0].headers[0].value = 'DENY\r\nSet-Cookie: a=b'; }),
    'empty value': variant(c => { c.headers[0].headers[0].value = ' '; }),
    'non-string value': variant(c => { c.headers[0].headers[0].value = 1; }),
  };
  const errors = {
    missing: /ENOENT/,
    'invalid JSON': /JSON/,
    'no headers': /defines no response headers/,
    'empty headers': /defines no response headers/,
    'missing CSP': /missing required headers: Content-Security-Policy/,
    'narrower source': /Unsupported vercel.json header source/,
    'second scope': /Unsupported vercel.json header source/,
    'conditional rule': /Unsupported vercel.json header rule field "has"/,
    'unknown setting': /setting "rewrites" is not carried/,
    'cache override': /Cache-Control is set by the deployment script/,
    duplicate: /Duplicate header x-frame-options/,
    'header injection': /Invalid value for header/,
    'empty value': /Invalid value for header/,
    'non-string value': /Invalid value for header/,
  };
  for (const [name, config] of Object.entries(cases)) {
    const paths = await fixture(t, config);
    await assert.rejects(prepareWebDeployment(paths), errors[name], `${name} is refused for its configuration error`);
    await assert.rejects(stat(paths.output), { code: 'ENOENT' }, `${name} creates no output`);
  }
});

test('an existing destination is refused and left as it was', async t => {
  const paths = await fixture(t);
  await mkdir(paths.output);
  await writeFile(join(paths.output, 'stale.js'), 'old chunk');
  await assert.rejects(prepareWebDeployment(paths), { code: 'EEXIST' });
  assert.deepEqual(await readdir(paths.output), ['stale.js']);
  assert.equal(await readFile(join(paths.output, 'stale.js'), 'utf8'), 'old chunk');
});
