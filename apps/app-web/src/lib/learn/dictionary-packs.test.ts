import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DictionarySource } from '@alice-wallet/alice-content/src/dictionary-types';
import {
  dictionaryAttribution,
  dictionaryLanguage,
  dictionaryWorkName,
  fetchDefinition,
  fetchDictionaryIndex,
} from './dictionary-packs.ts';

const FRENCH: DictionarySource = {
  title: 'Dictionnaire de Bitcoin',
  author: 'Loïc Pandul',
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  repository: 'https://github.com/LoicPandul/Dictionnaire-de-Bitcoin',
  commit: 'bab568e32351cc9f1240f49f5feedc242123d101',
  definitionsBase: 'https://github.com/LoicPandul/Dictionnaire-de-Bitcoin/blob/bab568e32351cc9f1240f49f5feedc242123d101/definitions/fr',
  builtAt: '2026-10-11',
};

const ENGLISH: DictionarySource = {
  ...FRENCH,
  title: 'Bitcoin Dictionary',
  translation: {
    originalTitle: 'Dictionnaire de Bitcoin',
    originalLanguage: 'fr',
    language: 'en',
    status: 'unofficial',
    permissionDate: '2026-11-02',
    reviewedByAuthor: false,
    replacement: 'The author’s own English translation',
  },
};

function letterPack(lang: string, letter: string, slug: string, title: string) {
  return { lang, letter, entries: [{ slug, title, letter, category: 'X', uuid: slug, body: `${title}.`, seeAlso: [] }] };
}

describe('dictionaryLanguage', () => {
  it('reads English in English and the French original for every other language', () => {
    assert.equal(dictionaryLanguage('en'), 'en');
    assert.equal(dictionaryLanguage('fr'), 'fr');
    assert.equal(dictionaryLanguage('de'), 'fr');
    assert.equal(dictionaryLanguage(undefined), 'fr');
  });
});

describe('fetching a pack', () => {
  it('fetches each language from its own folder, once', async t => {
    const urls: string[] = [];
    t.mock.method(globalThis, 'fetch', async (url: string) => {
      urls.push(url);
      return new Response(JSON.stringify({ lang: url.split('/')[2], source: FRENCH, count: 0, letters: [], entries: [] }), { status: 200 });
    });
    assert.equal((await fetchDictionaryIndex('en')).lang, 'en');
    assert.equal((await fetchDictionaryIndex('fr')).lang, 'fr');
    await fetchDictionaryIndex('en');
    assert.deepEqual(urls, ['/dictionary/en/index.json', '/dictionary/fr/index.json']);
  });

  it('loads a definition from the letter of its slug, whatever its translated title starts with', async t => {
    const urls: string[] = [];
    t.mock.method(globalThis, 'fetch', async (url: string) => {
      urls.push(url);
      if (url === '/dictionary/en/letters/r.json') return new Response(JSON.stringify(letterPack('en', 'r', 'racine-de-merkle', 'MERKLE ROOT')), { status: 200 });
      return new Response('', { status: 404 });
    });
    const definition = await fetchDefinition('racine-de-merkle', 'en');
    assert.equal(definition?.title, 'MERKLE ROOT');
    assert.equal(definition?.letter, 'r');
    assert.equal(await fetchDefinition('reseau-absent', 'en'), null);
    assert.equal(await fetchDefinition('../x', 'en'), null);
    assert.deepEqual(urls, ['/dictionary/en/letters/r.json']);
  });

  it('tries again after a failed fetch', async t => {
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async () => {
      calls += 1;
      return calls === 1
        ? new Response('', { status: 503 })
        : new Response(JSON.stringify(letterPack('fr', 'z', 'zero-conf', 'ZERO-CONF')), { status: 200 });
    });
    await assert.rejects(fetchDefinition('zero-conf', 'fr'), /503/);
    assert.equal((await fetchDefinition('zero-conf', 'fr'))?.title, 'ZERO-CONF');
    assert.equal(calls, 2);
  });
});

describe('naming the source', () => {
  it('names the author and licence, and the translation status when there is one', () => {
    assert.equal(dictionaryAttribution(FRENCH), 'Loïc Pandul, CC BY-NC-SA 4.0');
    assert.equal(dictionaryAttribution(ENGLISH), 'Loïc Pandul, CC BY-NC-SA 4.0, unofficial translation');
  });

  it('tells the model when an English context quotes the translation', () => {
    assert.equal(dictionaryWorkName('en'), 'the unofficial English translation of the Dictionnaire de Bitcoin by Loïc Pandul');
    assert.equal(dictionaryWorkName('fr'), 'the Dictionnaire de Bitcoin by Loïc Pandul');
  });
});
