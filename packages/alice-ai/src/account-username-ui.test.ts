import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const webSource = readFileSync(
  decodeURIComponent(
    new URL('../../../apps/app-web/src/components/AccountPasswordDialog.tsx', import.meta.url).pathname,
  ),
  'utf8',
);

for (const [surface, source] of [
  ['web', webSource],
] as const) {
  test(`${surface} account settings expose the supported username rotation`, () => {
    assert.match(source, /CHANGE USERNAME/);
    assert.match(source, /SAVE USERNAME/);
    assert.match(source, /account\.updateProfile\(\{/);
    assert.match(source, /once every 30 days/);
  });
}
