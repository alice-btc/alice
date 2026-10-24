import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { secureHtml } from './secure-app-export.mjs';

test('the policy precedes scripts and only authorizes their exact contents', () => {
  const script = 'self.__next_f.push([1,"hello"])';
  const html = secureHtml(`<html><head><script src="/_next/main.js"></script></head><body><script>${script}</script></body></html>`);
  const hash = createHash('sha256').update(script).digest('base64');
  assert.ok(html.indexOf('http-equiv') < html.indexOf('<script'));
  assert.ok(html.includes(`'sha256-${hash}'`));
  assert.ok(!html.includes("'unsafe-inline'"));
  assert.ok(!html.includes("'unsafe-eval'"));
  assert.ok(html.includes("script-src-attr 'none'"));
  assert.throws(() => secureHtml(html), /already/);
});
test('rejects unsupported output and remote scripts instead of silently weakening the policy', () => {
  assert.throws(() => secureHtml('<body></body>'), /no head/);
  assert.throws(() => secureHtml('<head><script src="https://evil.invalid/a.js"></script></head>'), /third-party/);
  assert.throws(() => secureHtml('<head><script src="//evil.invalid/a.js"></script></head>'), /third-party/);
});
test('hashes normalized HTML line endings while preserving output text', () => {
  const html = secureHtml('<head><script>a\r\nb</script></head>');
  assert.ok(html.includes(createHash('sha256').update('a\nb').digest('base64')));
});
test('keeps blob workers available while blocking injected scripts', () => {
  const html = secureHtml('<head><script data-src="metadata">hello</script></head>');
  assert.ok(html.includes("worker-src 'self' blob:"));
  assert.ok(html.includes(createHash('sha256').update('hello').digest('base64')));
});
test('the CLI still secures an export when invoked through a symlink', async () => {
  const { mkdtemp, writeFile, readFile, symlink, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { execFileSync } = await import('node:child_process');
  const root = await mkdtemp(join(tmpdir(), 'alice-export-test-'));
  try {
    const cli = join(root, 'secure.mjs');
    await symlink(fileURLToPath(new URL('./secure-app-export.mjs', import.meta.url)), cli);
    await writeFile(join(root, 'index.html'), '<head><script>hello</script></head>');
    execFileSync(process.execPath, [cli, root]);
    assert.ok((await readFile(join(root, 'index.html'), 'utf8')).includes('alice-script-policy'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
