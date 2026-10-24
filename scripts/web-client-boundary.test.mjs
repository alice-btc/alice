import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const compiledWebpack = require('next/dist/compiled/webpack/webpack');
compiledWebpack.init();
const webpack = compiledWebpack.webpack;
const { WebClientBoundaryPlugin } = require('./web-client-boundary.cjs');

const MARKER = 'Web client boundary passed: braces and node-forge are absent.';

async function compileFixture(t, files) {
  const root = await mkdtemp(join(tmpdir(), 'alice-boundary-test-'));
  try {
    for (const [name, source] of Object.entries(files)) {
      await mkdir(dirname(join(root, name)), { recursive: true });
      await writeFile(join(root, name), source);
    }
    const logs = [];
    t.mock.method(console, 'log', (line) => logs.push(line));
    const compiler = webpack({
      mode: 'production',
      target: 'web',
      context: root,
      entry: './src/index.js',
      output: { path: join(root, 'out') },
      cache: false,
      optimization: { minimize: false },
      infrastructureLogging: { level: 'none' },
      plugins: [new WebClientBoundaryPlugin()],
    });
    const stats = await new Promise((resolve, reject) => {
      compiler.run((error, result) => {
        compiler.close(() => (error ? reject(error) : resolve(result)));
      });
    });
    return { errors: stats.compilation.errors.map((e) => e.message), logs };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('a client graph without the audit-exception packages passes and prints the marker', async (t) => {
  const { errors, logs } = await compileFixture(t, {
    'src/index.js': "module.exports = require('safe-pkg');",
    'node_modules/safe-pkg/index.js': 'module.exports = 1;',
  });
  assert.deepEqual(errors, []);
  assert.ok(logs.includes(MARKER));
});

for (const pkg of ['braces', 'node-forge']) {
  test(`${pkg} in the client graph fails with the boundary error`, async (t) => {
    const { errors, logs } = await compileFixture(t, {
      'src/index.js': `module.exports = require('${pkg}');`,
      [`node_modules/${pkg}/index.js`]: 'module.exports = 1;',
    });
    assert.equal(errors.length, 1, errors.join('\n'));
    assert.match(errors[0], /Tooling-only audit exception entered the web client/);
    assert.ok(!logs.includes(MARKER));
  });

  test(`nested ${pkg} in the client graph fails with the boundary error`, async (t) => {
    const { errors, logs } = await compileFixture(t, {
      'src/index.js': "module.exports = require('safe-pkg');",
      'node_modules/safe-pkg/index.js': `module.exports = require('${pkg}');`,
      [`node_modules/safe-pkg/node_modules/${pkg}/index.js`]: 'module.exports = 1;',
    });
    assert.equal(errors.length, 1, errors.join('\n'));
    assert.match(errors[0], /Tooling-only audit exception entered the web client/);
    assert.ok(!logs.includes(MARKER));
  });
}
