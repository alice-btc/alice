import test from 'node:test';
import assert from 'node:assert/strict';
import { en } from './en.ts';
import { DICTIONARIES, translate, translatePlural, type Locale } from './translate.ts';

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
const EXTRA_PLURAL = /\.(zero|two|few|many)$/;

for (const [locale, dictionary] of Object.entries(DICTIONARIES) as [Locale, Record<string, string>][]) {
  test(`${locale}: the same keys as English, none empty`, () => {
    const extra = Object.keys(dictionary).filter(key => !(key in en) && !EXTRA_PLURAL.test(key));
    const missing = Object.keys(en).filter(key => !(key in dictionary));
    assert.deepEqual(extra, []);
    assert.deepEqual(missing, []);
    for (const [key, value] of Object.entries(dictionary)) assert.ok(value.trim().length > 0, key);
  });

  test(`${locale}: every key fills the same placeholders as English`, () => {
    for (const [key, value] of Object.entries(dictionary)) {
      const source = en[key as keyof typeof en] ?? en[key.replace(EXTRA_PLURAL, '.other') as keyof typeof en];
      assert.deepEqual(placeholders(value), placeholders(source), key);
    }
  });
}

test('English: a counted key has both forms', () => {
  for (const key of Object.keys(en)) {
    if (key.endsWith('.one')) assert.ok(`${key.slice(0, -4)}.other` in en, key);
  }
});

test('French: typography', () => {
  for (const [key, value] of Object.entries(DICTIONARIES.fr)) {
    // A non-breaking space before : ; ? ! that end a word, and inside « ».
    assert.doesNotMatch(value, /[^ \s][:;?!](?=$|\s)/, `${key}: mark glued to the word`);
    assert.doesNotMatch(value, / [:;?!»]|« /, `${key}: breaking space`);
    assert.doesNotMatch(value, /"/, `${key}: straight double quote, use « »`);
    assert.doesNotMatch(value, /\p{L}'\p{L}/u, `${key}: straight apostrophe, use ’`);
  }
});

test('translate fills placeholders and falls back to English', () => {
  assert.equal(translate('en', 'common.close'), 'Close');
  assert.equal(translate('fr', 'common.close'), 'Fermer');
  const sample = Object.entries(en).find(([, value]) => placeholders(value).length > 0);
  if (sample) {
    const [key, value] = sample as [keyof typeof en, string];
    const params = Object.fromEntries(placeholders(value).map(name => [name, 'X']));
    assert.doesNotMatch(translate('en', key, params), /\{\w+\}/);
  }
});

test('translatePlural picks the form of the count', () => {
  const dictionary: Record<string, string> = en;
  const key = Object.keys(en)
    .filter(k => k.endsWith('.one'))
    .map(k => k.slice(0, -4))
    .find(base => dictionary[`${base}.one`] !== dictionary[`${base}.other`] && !/1/.test(DICTIONARIES.fr[`${base}.one` as keyof typeof en]));
  assert.ok(key, 'a counted key whose forms differ');
  const one = translatePlural('en', key as never, 1);
  const many = translatePlural('en', key as never, 5);
  assert.notEqual(one, many);
  // French counts 0 and 1 as singular.
  assert.equal(translatePlural('fr', key as never, 0), translatePlural('fr', key as never, 1).replace('1', '0'));
});
