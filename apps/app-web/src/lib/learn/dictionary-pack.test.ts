import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { DictionaryIndex, DictionaryLetterPack } from '@alice-wallet/alice-content/src/dictionary-types';
import { matchDictionaryTerm, sortEntries } from './dictionary.ts';

// Contract of the generated pack (scripts/build-dictionary-pack.mjs): the
// index and the letter files describe the same terms, every cross-reference
// resolves, and the technical rewrites the README promises were all applied.

const ROOT = path.resolve(import.meta.dirname, '../../../public/dictionary/fr');
const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'index.json'), 'utf8')) as DictionaryIndex;
const packs = index.letters.map(letter => JSON.parse(fs.readFileSync(path.join(ROOT, 'letters', `${letter}.json`), 'utf8')) as DictionaryLetterPack);
const definitions = packs.flatMap(pack => pack.entries);

describe('the dictionary pack', () => {
  it('names its source, licence and commit', () => {
    assert.equal(index.source.title, 'Dictionnaire de Bitcoin');
    assert.equal(index.source.license, 'CC BY-NC-SA 4.0');
    assert.match(index.source.commit, /^[0-9a-f]{40}$/);
    assert.ok(index.source.definitionsBase.includes(index.source.commit));
    assert.ok(fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8').includes(index.source.commit));
  });

  it('indexes every definition once, in the dictionary order', () => {
    assert.equal(index.count, index.entries.length);
    assert.equal(definitions.length, index.count);
    assert.ok(index.count >= 1_400, `${index.count} definitions`);
    const slugs = new Set(index.entries.map(entry => entry.slug));
    assert.equal(slugs.size, index.count, 'slugs are unique');
    assert.deepEqual(definitions.map(entry => entry.slug), index.entries.map(entry => entry.slug));
    assert.deepEqual(sortEntries(index.entries).map(entry => entry.slug), index.entries.map(entry => entry.slug));
    for (const pack of packs) assert.ok(pack.entries.every(entry => entry.letter === pack.letter), `letter ${pack.letter}`);
  });

  it('resolves every cross-reference to a term of the pack', () => {
    const slugs = new Set(index.entries.map(entry => entry.slug));
    for (const definition of definitions) {
      for (const ref of definition.seeAlso) assert.ok(slugs.has(ref.slug), `${definition.slug} -> ${ref.slug}`);
      assert.ok(!definition.seeAlso.some(ref => ref.slug === definition.slug), `${definition.slug} points at itself`);
    }
  });

  it('carries bodies the Learn renderer can show: no relative image, no bare formula', () => {
    for (const definition of definitions) {
      assert.ok(definition.body.trim().length > 0, `${definition.slug} is empty`);
      assert.ok(!/\]\((\.\/)?assets\//.test(definition.body), `${definition.slug} keeps a relative image`);
      assert.ok(!/^\$\$/m.test(definition.body), `${definition.slug} keeps a display formula`);
      assert.ok(!/\*\*/.test(definition.body), `${definition.slug} uses bold, which the dictionary forbids`);
    }
    assert.ok(definitions.some(definition => definition.body.includes('```math')), 'formulas became code blocks');
    assert.ok(definitions.some(definition => definition.body.includes('raw.githubusercontent.com')), 'images point at the source commit');
  });

  it('lets a plain question find its term', () => {
    assert.equal(matchDictionaryTerm(index.entries, "C'est quoi un UTXO ?")?.entry.slug, 'utxo');
    assert.equal(matchDictionaryTerm(index.entries, 'What is a Merkle root?')?.entry.slug, 'racine-de-merkle');
    assert.equal(matchDictionaryTerm(index.entries, 'Explique-moi le coinjoin')?.entry.slug, 'coinjoin');
    assert.equal(matchDictionaryTerm(index.entries, 'Is bitcoin money?'), null);
  });
});
