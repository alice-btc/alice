import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DictionaryIndexEntry } from '@alice-wallet/alice-content/src/dictionary-types';
import {
  definitionExcerpt,
  entriesForLetter,
  letterOfSlug,
  matchDictionaryTerm,
  normalizeTerm,
  searchDictionary,
  sortEntries,
} from './dictionary.ts';

const ENTRIES: DictionaryIndexEntry[] = [
  { slug: 'utxo', title: 'UTXO', letter: 'u', category: 'PROTOCOLE' },
  { slug: 'utxo-set', title: 'UTXO SET', letter: 'u', category: 'PROTOCOLE' },
  { slug: 'racine-de-merkle', title: 'RACINE DE MERKLE', letter: 'r', category: 'CRYPTOGRAPHIE', english: 'MERKLE ROOT' },
  { slug: 'etiquetage', title: 'ÉTIQUETAGE', letter: 'e', category: 'CONFIDENTIALITÉ' },
  { slug: 'ecole-autrichienne', title: 'ÉCOLE AUTRICHIENNE', letter: 'e', category: 'ÉCONOMIE ET RÉGULATION' },
  { slug: 'bitcoin', title: 'BITCOIN', letter: 'b', category: 'PROTOCOLE' },
  { slug: 'noeud', title: 'NŒUD', letter: 'n', category: 'RÉSEAU', english: 'NODE' },
  { slug: 'cle-privee', title: 'CLÉ PRIVÉE', letter: 'c', category: 'CRYPTOGRAPHIE', english: 'PRIVATE KEY' },
  { slug: 'bip-0032', title: 'BIP-0032', letter: 'b', category: 'BIP' },
];

describe('normalizeTerm', () => {
  it('folds accents, case, ligatures and punctuation', () => {
    assert.equal(normalizeTerm('ÉTIQUETAGE'), 'etiquetage');
    assert.equal(normalizeTerm('NŒUD'), 'noeud');
    assert.equal(normalizeTerm("Réutilisation d'adresse (ext.)"), 'reutilisation d adresse ext');
    assert.equal(normalizeTerm('BIP-0032'), 'bip 0032');
  });
});

describe('ordering', () => {
  it('sorts by letter then by title, accents and case aside', () => {
    assert.deepEqual(sortEntries(ENTRIES).map(entry => entry.slug), [
      'bip-0032', 'bitcoin', 'cle-privee', 'ecole-autrichienne', 'etiquetage', 'noeud', 'racine-de-merkle', 'utxo', 'utxo-set',
    ]);
  });

  it('lists one letter in order', () => {
    assert.deepEqual(entriesForLetter(ENTRIES, 'e').map(entry => entry.title), ['ÉCOLE AUTRICHIENNE', 'ÉTIQUETAGE']);
    assert.deepEqual(entriesForLetter(ENTRIES, 'z'), []);
  });

  it('files a definition under the first letter of its slug', () => {
    assert.equal(letterOfSlug('etiquetage'), 'e');
    assert.equal(letterOfSlug('51-attack'), 'a');
  });
});

describe('searchDictionary', () => {
  it('ranks the exact title first, then prefixes, then word starts, then substrings', () => {
    assert.deepEqual(searchDictionary(ENTRIES, 'utxo').map(entry => entry.slug), ['utxo', 'utxo-set']);
    assert.deepEqual(searchDictionary(ENTRIES, 'merkle').map(entry => entry.slug), ['racine-de-merkle']);
    assert.deepEqual(searchDictionary(ENTRIES, 'ecole').map(entry => entry.slug), ['ecole-autrichienne']);
  });

  it('finds a term through its English equivalent and ignores accents in the query', () => {
    assert.deepEqual(searchDictionary(ENTRIES, 'private key').map(entry => entry.slug), ['cle-privee']);
    assert.deepEqual(searchDictionary(ENTRIES, 'étiquet').map(entry => entry.slug), ['etiquetage']);
  });

  it('needs two characters and respects the limit', () => {
    assert.deepEqual(searchDictionary(ENTRIES, 'u'), []);
    assert.equal(searchDictionary(ENTRIES, 'e', 1).length, 0);
    assert.equal(searchDictionary(ENTRIES, 'bi', 1).length, 1);
  });
});

describe('matchDictionaryTerm', () => {
  it('finds the term a question names, as whole words, accents aside', () => {
    assert.equal(matchDictionaryTerm(ENTRIES, "C'est quoi un UTXO ?")?.entry.slug, 'utxo');
    assert.equal(matchDictionaryTerm(ENTRIES, 'Comment fonctionne la racine de Merkle dans un bloc ?')?.entry.slug, 'racine-de-merkle');
    assert.equal(matchDictionaryTerm(ENTRIES, "qu'est-ce que l'etiquetage de mes coins")?.entry.slug, 'etiquetage');
  });

  it('prefers the longest name and accepts a plural', () => {
    assert.equal(matchDictionaryTerm(ENTRIES, 'What is the UTXO set exactly?')?.entry.slug, 'utxo-set');
    assert.equal(matchDictionaryTerm(ENTRIES, 'Pourquoi regrouper mes UTXOs ?')?.entry.slug, 'utxo');
  });

  it('matches an English or French equivalent and reports which name matched', () => {
    const match = matchDictionaryTerm(ENTRIES, 'Where is my private key stored?');
    assert.equal(match?.entry.slug, 'cle-privee');
    assert.equal(match?.name, 'PRIVATE KEY');
    assert.equal(matchDictionaryTerm(ENTRIES, 'Do I need to run a node?')?.entry.slug, 'noeud');
  });

  it('never fires on "bitcoin" alone, on a fragment of a word, or on nothing', () => {
    assert.equal(matchDictionaryTerm(ENTRIES, 'Is bitcoin a good idea?'), null);
    assert.equal(matchDictionaryTerm(ENTRIES, 'What about the utxoid field?'), null);
    assert.equal(matchDictionaryTerm(ENTRIES, '???'), null);
  });
});

describe('definitionExcerpt', () => {
  it('turns a body into plain prose and cuts at a sentence end', () => {
    const body = 'Sigle de *Unspent Transaction Output*. Un UTXO est une sortie non dépensée (`scriptPubKey`).\n\n```math\nP = p * G\n```\n\n![schéma](https://example.test/a.png)\n\nVoir [la suite](https://example.test). Fin.';
    assert.equal(definitionExcerpt(body), 'Sigle de Unspent Transaction Output. Un UTXO est une sortie non dépensée (scriptPubKey). Voir la suite. Fin.');
    const long = Array.from({ length: 40 }, (_, i) => `Phrase numéro ${i} qui remplit le texte.`).join(' ');
    const cut = definitionExcerpt(long, 300);
    assert.ok(cut.length <= 300 && cut.endsWith('.'), cut);
  });
});
