import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { DictionaryIndex, DictionaryLetterPack } from '@alice-wallet/alice-content/src/dictionary-types';
import {
  BUILT_AT,
  ENGLISH_ROOT,
  SOURCE_COMMIT,
  TRANSLATION,
  TRANSLATIONS_FILE,
  buildEnglishPack,
  compareProtected,
  readPack,
  renderPackFiles,
  scanFrenchWords,
  sha256,
  titleLetter,
  validateEnglishPack,
} from '../../../../../scripts/dictionary-en-utils.mjs';
import { letterOfSlug, matchDictionaryTerm, sortEntries } from './dictionary.ts';

// Contract of the generated packs (scripts/build-dictionary-pack.mjs and
// scripts/build-dictionary-pack-en.mjs): the index and the letter files
// describe the same terms, every cross-reference resolves, the technical
// rewrites the README promises were all applied, and the English pack is the
// French one translated, term for term.

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

describe('the English dictionary pack', () => {
  let loaded: ReturnType<typeof readPack> | undefined;
  const english = () => (loaded ??= readPack(ENGLISH_ROOT));

  it('is the build of the French pack and the versioned translations, byte for byte', () => {
    const translations = JSON.parse(fs.readFileSync(TRANSLATIONS_FILE, 'utf8'));
    const files = renderPackFiles(buildEnglishPack(index, definitions, translations));
    for (const [name, content] of files) {
      assert.ok(fs.readFileSync(path.join(ENGLISH_ROOT, name)).equals(Buffer.from(content, 'utf8')), `${name} differs from a fresh build`);
    }
    assert.deepEqual(english().unexpected, []);
    assert.equal(english().packs.length, files.length - 2);
  });

  it('names the original, the licence and the unofficial translation', () => {
    const source = english().index.source;
    assert.equal(english().index.lang, 'en');
    assert.equal(source.title, 'Bitcoin Dictionary');
    assert.equal(source.license, 'CC BY-NC-SA 4.0');
    assert.equal(source.commit, index.source.commit);
    assert.equal(source.builtAt, BUILT_AT);
    assert.deepEqual(source.translation, {
      originalTitle: 'Dictionnaire de Bitcoin',
      originalLanguage: 'fr',
      language: 'en',
      status: 'unofficial',
      permissionDate: '2026-11-02',
      reviewedByAuthor: false,
      replacement: TRANSLATION.replacement,
    });
    const readme = fs.readFileSync(path.join(ENGLISH_ROOT, 'README.md'), 'utf8');
    for (const needle of [index.source.commit, 'Loïc Pandul', 'CC BY-NC-SA 4.0', 'unofficial', '2 November 2026', 'not reviewed']) {
      assert.ok(readme.includes(needle), `README names ${needle}`);
    }
  });

  it('keeps the French slugs and uuids, filed by slug, listed by English title', () => {
    const { index: en, packs: enPacks, definitions: enDefinitions } = english();
    assert.equal(en.count, 1408);
    assert.equal(enDefinitions.length, 1408);
    const identities = (list: { slug: string; uuid: string }[]) => list.map(({ slug, uuid }) => `${slug} ${uuid}`).sort();
    assert.deepEqual(identities(enDefinitions), identities(definitions));
    for (const pack of enPacks) assert.ok(pack.entries.every((entry: { slug: string }) => letterOfSlug(entry.slug) === pack.letter), `letter file ${pack.letter}`);
    assert.deepEqual(sortEntries(en.entries).map(entry => entry.slug), en.entries.map((entry: { slug: string }) => entry.slug));
    const frenchTitles = new Map(index.entries.map(entry => [entry.slug, entry.title]));
    for (const entry of en.entries) {
      assert.equal(entry.letter, titleLetter(entry.title), entry.slug);
      assert.equal(entry.french, frenchTitles.get(entry.slug), entry.slug);
    }
  });

  it('keeps what the French text must keep, with French words under the tolerance', () => {
    const report = validateEnglishPack({ frIndex: index, frDefinitions: definitions, enIndex: english().index, enPacks: english().packs });
    assert.deepEqual(report.errors, []);
    const listed = report.findings.map(finding => `${finding.slug} [${finding.where}] ${finding.word}: ${finding.context}`).join('\n');
    assert.ok(report.findings.length <= report.tolerance, `${report.findings.length} French words:\n${listed}`);
  });

  it('lets only the listed French code words of bit and xor differ from the French text', () => {
    const report = validateEnglishPack({ frIndex: index, frDefinitions: definitions, enIndex: english().index, enPacks: english().packs, translatedCode: [] });
    assert.deepEqual([...new Set(report.errors.map(error => error.split(':')[0]))], ['bit', 'xor']);
    assert.ok(report.errors.every(error => error.includes('inline code differs')), report.errors.join('\n'));
  });

  it('lets an English or a French question find its term', () => {
    const entries = english().index.entries;
    assert.equal(matchDictionaryTerm(entries, 'What is a Merkle root?', 'en')?.entry.slug, 'racine-de-merkle');
    assert.equal(matchDictionaryTerm(entries, 'What does racine de Merkle mean?', 'en')?.entry.slug, 'racine-de-merkle');
    assert.equal(matchDictionaryTerm(entries, 'What is a UTXO?', 'en')?.entry.slug, 'utxo');
    assert.equal(matchDictionaryTerm(entries, "What is usurpation d'adresse?", 'en')?.entry.slug, 'address-spoofing');
  });

  it('does not read an everyday English word as the French title it shares', () => {
    const entries = english().index.entries;
    assert.notEqual(matchDictionaryTerm(entries, 'Which part should I read first?', 'en')?.entry.slug, 'shares');
    assert.notEqual(matchDictionaryTerm(entries, 'Is there any chance I lose my coins?', 'en')?.entry.slug, 'luck');
    assert.notEqual(matchDictionaryTerm(entries, 'Should I pile up sats every week?', 'en')?.entry.slug, 'pile');
    assert.equal(matchDictionaryTerm(entries, 'What are shares?', 'en')?.entry.slug, 'shares');
  });
});

// A French pack of three terms and their translations: one listed under
// another letter in English, one whose English title comes from the
// dictionary, one with an image, a formula and a URL to carry over.
const IMAGE = 'https://raw.githubusercontent.com/LoicPandul/Dictionnaire-de-Bitcoin/x/definitions/fr/a/arbre-de-merkle/assets/1.webp';

function fixture() {
  const frDefinitions = [
    {
      slug: 'arbre-de-merkle', title: 'ARBRE DE MERKLE', letter: 'a', category: 'CRYPTOGRAPHIE', english: 'MERKLE TREE', uuid: 'u-arbre',
      body: `Structure de données hachée avec \`SHA256\`.\n\n![Arbre de Merkle](${IMAGE})`,
      seeAlso: [{ slug: 'racine-de-merkle', title: 'RACINE DE MERKLE' }],
    },
    {
      slug: 'ecole-autrichienne', title: 'ÉCOLE AUTRICHIENNE', letter: 'e', category: 'ÉCONOMIE ET RÉGULATION', uuid: 'u-ecole',
      body: 'École de pensée économique, voir https://mises.org.',
      seeAlso: [],
    },
    {
      slug: 'racine-de-merkle', title: 'RACINE DE MERKLE', letter: 'r', category: 'CRYPTOGRAPHIE', english: 'MERKLE ROOT', uuid: 'u-racine',
      body: "Empreinte au sommet de l'arbre :\n\n```math\nH(a || b)\n```",
      seeAlso: [{ slug: 'arbre-de-merkle', title: 'ARBRE DE MERKLE' }],
    },
  ];
  const frIndex = {
    lang: 'fr',
    source: {
      title: 'Dictionnaire de Bitcoin', author: 'Loïc Pandul', license: 'CC BY-NC-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      repository: 'https://github.com/LoicPandul/Dictionnaire-de-Bitcoin', commit: SOURCE_COMMIT,
      definitionsBase: `https://github.com/LoicPandul/Dictionnaire-de-Bitcoin/blob/${SOURCE_COMMIT}/definitions/fr`, builtAt: '2026-10-11',
    },
    count: 3,
    letters: ['a', 'e', 'r'],
    entries: frDefinitions.map(({ slug, title, letter, category, english }) => ({ slug, title, letter, category, ...(english ? { english } : {}) })),
  };
  const english: Record<string, { title: string; category: string; body: string }> = {
    'u-arbre': { title: 'HASH TREE', category: 'CRYPTOGRAPHY', body: `Data structure hashed with \`SHA256\`.\n\n![Merkle tree](${IMAGE})` },
    'u-ecole': { title: 'AUSTRIAN SCHOOL', category: 'ECONOMICS AND REGULATION', body: 'School of economic thought, see https://mises.org.' },
    'u-racine': { title: 'MERKLE ROOT', category: 'CRYPTOGRAPHY', body: 'Fingerprint at the top of the tree:\n\n```math\nH(a || b)\n```' },
  };
  const translations: Record<string, Record<string, string>> = Object.fromEntries(
    frDefinitions.map(fr => [fr.uuid, { ...english[fr.uuid], frSha256: sha256(fr.body) }]),
  );
  return { frIndex, frDefinitions, translations };
}

type Fixture = ReturnType<typeof fixture>;
const build = (f: Fixture, expectedCount = 3) => buildEnglishPack(f.frIndex, f.frDefinitions, f.translations, { expectedCount });

describe('building the English dictionary pack', () => {
  it('joins each French definition to its translation by uuid', () => {
    const { index: en, packs: enPacks } = build(fixture());
    assert.deepEqual(en.entries, [
      { slug: 'ecole-autrichienne', title: 'AUSTRIAN SCHOOL', letter: 'a', category: 'ECONOMICS AND REGULATION', french: 'ÉCOLE AUTRICHIENNE' },
      { slug: 'racine-de-merkle', title: 'MERKLE ROOT', letter: 'm', category: 'CRYPTOGRAPHY', french: 'RACINE DE MERKLE' },
      { slug: 'arbre-de-merkle', title: 'MERKLE TREE', letter: 'm', category: 'CRYPTOGRAPHY', french: 'ARBRE DE MERKLE' },
    ]);
    assert.deepEqual(en.letters, ['a', 'm']);
    assert.deepEqual(enPacks.map(pack => [pack.letter, pack.entries.map((entry: { slug: string }) => entry.slug)]), [
      ['a', ['arbre-de-merkle']],
      ['e', ['ecole-autrichienne']],
      ['r', ['racine-de-merkle']],
    ]);
    const tree = enPacks[0].entries[0];
    assert.equal(tree.letter, 'a');
    assert.equal(tree.uuid, 'u-arbre');
    assert.deepEqual(tree.seeAlso, [{ slug: 'racine-de-merkle', title: 'MERKLE ROOT' }]);
    assert.equal(en.source.title, 'Bitcoin Dictionary');
    assert.equal(en.source.commit, SOURCE_COMMIT);
    assert.equal(en.source.builtAt, BUILT_AT);
    assert.deepEqual(en.source.translation, TRANSLATION);
  });

  it('builds the same bytes twice', () => {
    assert.deepEqual(renderPackFiles(build(fixture())), renderPackFiles(build(fixture())));
  });

  const refuses = (change: (f: Fixture) => void, message: RegExp) => {
    const f = fixture();
    change(f);
    assert.throws(() => build(f), message);
  };

  it('refuses a missing translation', () => refuses(f => { delete f.translations['u-ecole']; }, /ecole-autrichienne \(u-ecole\): no translation/));
  it('refuses a translation of a French body that changed since', () => refuses(f => { f.frDefinitions[1].body += ' Modifiée.'; }, /ecole-autrichienne \(u-ecole\): stale/));
  it('refuses a translation no French definition has', () => refuses(f => { f.translations['u-autre'] = { ...f.translations['u-ecole'] }; }, /translation u-autre matches no French definition/));
  it('refuses a category outside the fixed table', () => refuses(f => { f.translations['u-ecole'].category = 'ECONOMY'; }, /category "ECONOMY", "ECONOMICS AND REGULATION" expected/));
  it('refuses a title that is not uppercase', () => refuses(f => { f.translations['u-ecole'].title = 'Austrian school'; }, /not uppercase/));
  it('refuses an empty body', () => refuses(f => { f.translations['u-ecole'].body = '  '; }, /ecole-autrichienne \(u-ecole\): empty body/));
  it('refuses a translation with other fields', () => refuses(f => { f.translations['u-ecole'].note = 'draft'; }, /\{ title, body, category, frSha256 \}/));
  it('refuses a French pack of another size', () => assert.throws(() => build(fixture(), 4), /4 expected/));
});

describe('validating the English dictionary pack', () => {
  const validate = (f: Fixture, en: ReturnType<typeof build>) =>
    validateEnglishPack({ frIndex: f.frIndex, frDefinitions: f.frDefinitions, enIndex: en.index, enPacks: en.packs, reviewed: [], translatedCode: [], expectedCount: 3 });

  it('accepts a faithful pack', () => {
    const f = fixture();
    const report = validate(f, build(f));
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.findings, []);
    assert.equal(report.ok, true);
  });

  it('reports code, images, URLs, paragraphs and cross-references that differ from the French text', () => {
    const f = fixture();
    const en = build(f);
    const [[tree], [school], [root]] = en.packs.map(pack => pack.entries);
    tree.body = tree.body.replace('`SHA256`', '`SHA-256`').replace(IMAGE, `${IMAGE}?v=2`);
    tree.seeAlso = [{ slug: 'racine-de-merkle', title: 'RACINE DE MERKLE' }];
    school.body = 'School of economic thought, see https://mises.org/en.';
    root.body = 'Fingerprint at the top of the tree:\n```math\nH(a | b)\n```';
    const { errors, ok } = validate(f, en);
    for (const expected of [
      /^arbre-de-merkle: inline code differs/,
      /^arbre-de-merkle: image URLs differ/,
      /^arbre-de-merkle: seeAlso racine-de-merkle titled "RACINE DE MERKLE", "MERKLE ROOT" expected/,
      /^ecole-autrichienne: URLs differ/,
      /^racine-de-merkle: code blocks differ/,
      /^racine-de-merkle: 1 paragraphs, 2 in French/,
    ]) assert.ok(errors.some(error => expected.test(error)), `${expected}\n${errors.join('\n')}`);
    assert.equal(ok, false);
  });

  it('reports lost emphasis, list markers and line breaks', () => {
    const errors = compareProtected('Un *terme* (*term*).\n* Exemple', 'A term. Example');
    assert.ok(errors.some(error => error.startsWith('emphasis markers differ')));
    assert.ok(errors.some(error => error.startsWith('Markdown block markers differ')));
    assert.ok(errors.some(error => error.startsWith('line breaks differ')));
  });

  it('lists French words left in titles, prose and image text, not in code or URLs', () => {
    const body = 'A key, `la` and `les`, see https://example.org/la/des and [the page](https://example.org/pour). Avec la clé.\n\n![la racine](https://example.org/une.png)';
    const { findings } = scanFrenchWords('x', 'LA CLÉ', body, []);
    assert.deepEqual(findings.map(finding => [finding.where, finding.word]), [['title', 'LA'], ['body', 'Avec'], ['body', 'la'], ['image text', 'la']]);
  });

  it('lets a reviewed name through in its own definition only', () => {
    const reviewed = [{ slug: 'x', text: 'La Casa de Satoshi', reason: 'a proper name, not French prose' }];
    assert.deepEqual(scanFrenchWords('x', 'X', 'Met at La Casa de Satoshi.', reviewed), { findings: [], used: [0] });
    assert.deepEqual(scanFrenchWords('y', 'Y', 'Met at La Casa de Satoshi.', reviewed).findings.map(finding => finding.word), ['La']);
  });
});
