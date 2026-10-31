import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// The dialog reads its words from the interface dictionary.
const read = (relative: string) => readFileSync(decodeURIComponent(new URL(relative, import.meta.url).pathname), 'utf8');
const webSource = read('../../../apps/app-web/src/components/AccountPasswordDialog.tsx')
  + read('../../../apps/app-web/src/i18n/en.ts');

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
