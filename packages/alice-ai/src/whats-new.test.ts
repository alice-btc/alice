import test from 'node:test';
import assert from 'node:assert/strict';
import { WHATS_NEW, whatsNewFor, whatsNewHighlights } from './whats-new.ts';

test('a translated release says every highlight, line for line', () => {
  for (const entry of WHATS_NEW) {
    for (const [language, lines] of Object.entries(entry.translations ?? {})) {
      assert.equal(lines?.length, entry.highlights.length, `${entry.version} ${language}`);
    }
  }
});

test('a language without its lines reads the English highlights', () => {
  const entry = { version: '9.9.9', highlights: ['One thing.'] };
  assert.deepEqual(whatsNewHighlights(entry, 'fr'), ['One thing.']);
  const translated = { ...entry, translations: { fr: ['Une chose.'] } };
  assert.deepEqual(whatsNewHighlights(translated, 'fr'), ['Une chose.']);
  assert.deepEqual(whatsNewHighlights(translated, 'en'), ['One thing.']);
});

test('the current release has its French highlights', () => {
  const latest = whatsNewFor(WHATS_NEW[0].version);
  assert.ok(latest?.translations?.fr, WHATS_NEW[0].version);
});
