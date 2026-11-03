import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DictionaryIndexEntry } from '@alice-wallet/alice-content/src/dictionary-types';
import { buildTermMatcher, chooseLinkedTerms, linkTerms, MAX_LINKS_PER_REPLY } from './term-links.ts';

const ENTRIES: DictionaryIndexEntry[] = [
  { slug: 'multisig', title: 'MULTISIG', letter: 'm', category: 'PORTEFEUILLE' },
  { slug: 'cle-publique', title: 'CLÉ PUBLIQUE', letter: 'c', category: 'CRYPTOGRAPHIE', english: 'PUBLIC KEY' },
  { slug: 'chemin-de-derivation', title: 'CHEMIN DE DÉRIVATION', letter: 'c', category: 'PORTEFEUILLE', english: 'DERIVATION PATH' },
  { slug: 'utxo', title: 'UTXO', letter: 'u', category: 'PROTOCOLE' },
  { slug: 'bitcoin', title: 'BITCOIN', letter: 'b', category: 'PROTOCOLE' },
  { slug: 'change', title: 'CHANGE', letter: 'c', category: 'PORTEFEUILLE' },
];

const matcher = buildTermMatcher(ENTRIES);

function linksIn(text: string): string[] {
  const chosen = chooseLinkedTerms(text, matcher);
  return linkTerms(text, matcher, chosen, new Set()).filter(segment => segment.slug).map(segment => `${segment.slug}:${segment.text}`);
}

describe('dictionary terms in a reply', () => {
  it('links a term once, at its first appearance, keeping the reply text as written', () => {
    assert.deepEqual(linksIn('Un multisig 2-de-3, puis un autre multisig.'), ['multisig:multisig']);
  });

  it('finds plurals, accents and names of several words', () => {
    assert.deepEqual(linksIn('Les clés publiques et le chemin de dérivation.'), [
      'cle-publique:clés publiques',
      'chemin-de-derivation:chemin de dérivation',
    ]);
  });

  it('reads the English equivalents too', () => {
    assert.deepEqual(linksIn('Share the public key, keep the derivation path.'), [
      'cle-publique:public key',
      'chemin-de-derivation:derivation path',
    ]);
  });

  it('never links bitcoin itself nor a name that is an everyday word', () => {
    assert.deepEqual(linksIn('Bitcoin rend la monnaie : le change revient au portefeuille.'), []);
  });

  it('does not join words across punctuation', () => {
    assert.deepEqual(linksIn('Le chemin, de dérivation douteuse.'), []);
  });

  it('keeps every character of the text in the segments', () => {
    const text = 'Un UTXO, des clés publiques, un multisig.';
    const segments = linkTerms(text, matcher, chooseLinkedTerms(text, matcher), new Set());
    assert.equal(segments.map(segment => segment.text).join(''), text);
  });

  it('links one term only once across the lines of a reply', () => {
    const chosen = chooseLinkedTerms('UTXO\nUTXO', matcher);
    const linked = new Set<string>();
    assert.equal(linkTerms('UTXO', matcher, chosen, linked).filter(s => s.slug).length, 1);
    assert.equal(linkTerms('UTXO', matcher, chosen, linked).filter(s => s.slug).length, 0);
  });

  it('caps the links of a reply and keeps names of several words first', () => {
    const many: DictionaryIndexEntry[] = Array.from({ length: 10 }, (_, i) => ({ slug: `t${i}`, title: `TERME${i}`, letter: 't', category: 'X' }));
    const wide = buildTermMatcher([...many, ENTRIES[2]]);
    const text = `${many.map(entry => entry.title.toLowerCase()).join(' ')} chemin de dérivation`;
    const chosen = chooseLinkedTerms(text, wide);
    assert.equal(chosen.size, MAX_LINKS_PER_REPLY);
    assert.ok(chosen.has('chemin-de-derivation'));
  });
});

describe('dictionary terms inside longer ones', () => {
  it('leaves out a name already inside a linked one', () => {
    const nodes = buildTermMatcher([
      { slug: 'noeud', title: 'NŒUD', letter: 'n', category: 'X' },
      { slug: 'noeud-complet', title: 'NŒUD COMPLET', letter: 'n', category: 'X' },
    ]);
    const text = 'Un nœud complet vérifie tout, un nœud léger non.';
    assert.deepEqual([...chooseLinkedTerms(text, nodes)], ['noeud-complet']);
  });
});

describe('the definition a reply drew on', () => {
  it('is linked first, even over longer names', () => {
    const many: DictionaryIndexEntry[] = Array.from({ length: 8 }, (_, i) => ({ slug: `t${i}`, title: `TERME LONG ${i}`, letter: 't', category: 'X' }));
    const wide = buildTermMatcher([...many, ENTRIES[0]]);
    const text = `${many.map(entry => entry.title.toLowerCase()).join(', ')} et un multisig`;
    assert.ok(!chooseLinkedTerms(text, wide).has('multisig'));
    assert.ok(chooseLinkedTerms(text, wide, new Set(['multisig'])).has('multisig'));
  });
});

describe('the English pack', () => {
  const english: DictionaryIndexEntry[] = [
    { slug: 'engagement', title: 'COMMITMENT', letter: 'c', category: 'PROTOCOL', french: 'ENGAGEMENT' },
    { slug: 'cle-publique', title: 'PUBLIC KEY', letter: 'p', category: 'CRYPTOGRAPHY', french: 'CLÉ PUBLIQUE' },
  ];

  it('leaves out a French name that reads as an everyday English word', () => {
    const matcher = buildTermMatcher(english, 'en');
    assert.deepEqual([...chooseLinkedTerms('Your engagement with the public key matters.', matcher)], ['cle-publique']);
  });

  it('leaves out an English title used in its everyday sense, and reads the French aliases', () => {
    const matcher = buildTermMatcher([
      { slug: 'tweak', title: 'TWEAK', letter: 't', category: 'CRYPTOGRAPHY' },
      { slug: 'address-spoofing', title: 'ADDRESS SPOOFING', letter: 'a', category: 'PRIVACY', frenchAliases: ["USURPATION D'ADRESSE"] },
    ], 'en');
    assert.deepEqual([...chooseLinkedTerms("Tweak the fee, and beware of usurpation d'adresse.", matcher)], ['address-spoofing']);
  });

  it('still links that French name in the French pack', () => {
    const matcher = buildTermMatcher(english, 'fr');
    assert.ok(chooseLinkedTerms('L’engagement est publié dans le bloc.', matcher).has('engagement'));
  });
});
