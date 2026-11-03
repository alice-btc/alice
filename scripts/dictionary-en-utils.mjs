// The English Learn dictionary pack: an unofficial translation of the
// "Dictionnaire de Bitcoin" by Loïc Pandul, joined to the French pack by uuid.
// scripts/build-dictionary-pack-en.mjs builds it and
// scripts/validate-dictionary-pack-en.mjs checks it against the French text;
// both use the functions below, and so do the pack tests.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FRENCH_ROOT = path.join(REPO_ROOT, 'apps/app-web/public/dictionary/fr');
export const ENGLISH_ROOT = path.join(REPO_ROOT, 'apps/app-web/public/dictionary/en');
export const TRANSLATIONS_FILE = path.join(REPO_ROOT, 'data/dictionary-en/translations.json');

/** v1.0 of the dictionary, the commit the French pack and the translations come from. */
export const EXPECTED_COUNT = 1408;
export const SOURCE_COMMIT = 'bab568e32351cc9f1240f49f5feedc242123d101';
/** Fixed, so that the same inputs always build the same bytes. */
export const BUILT_AT = '2026-11-02';

/** The dictionary's 19 categories, one English name each, everywhere. */
export const CATEGORIES = {
  'ATTAQUE': 'ATTACK',
  'BIP': 'BIP',
  'COMMUNAUTÉ': 'COMMUNITY',
  'CONFIDENTIALITÉ': 'PRIVACY',
  'COUCHE SUPÉRIEURE': 'UPPER LAYER',
  'CRYPTOGRAPHIE': 'CRYPTOGRAPHY',
  'HISTOIRE': 'HISTORY',
  'INFORMATIQUE': 'COMPUTING',
  'LIGHTNING NETWORK': 'LIGHTNING NETWORK',
  'MINAGE': 'MINING',
  'ORGANISATION': 'ORGANIZATION',
  'OUTIL': 'TOOL',
  'PORTEFEUILLE': 'WALLET',
  'PROTOCOLE': 'PROTOCOL',
  'RGB': 'RGB',
  'RÉSEAU': 'NETWORK',
  'SCRIPT': 'SCRIPT',
  'SIDECHAIN': 'SIDECHAIN',
  'ÉCONOMIE ET RÉGULATION': 'ECONOMICS AND REGULATION',
};

/** `source.translation` of the English index. */
export const TRANSLATION = {
  originalTitle: 'Dictionnaire de Bitcoin',
  originalLanguage: 'fr',
  language: 'en',
  status: 'unofficial',
  permissionDate: '2026-11-02',
  reviewedByAuthor: false,
  replacement: "To be replaced by the author's own English translation once it is published.",
};

/**
 * Reviewed occurrences of a scanned French word judged not to
 * be French prose: a name, a quotation. Each one is narrow: one definition,
 * the exact text, and the reason, e.g.
 *   { slug: '<slug>', text: 'La Casa de Satoshi', reason: 'name of a place, not French prose' }
 * @type {{ slug: string, text: string, reason: string }[]}
 */
export const REVIEWED_FRENCH_WORDS = [
  { slug: 'blocksize-war', text: 'guerre des blocs', reason: 'French equivalent explicitly quoted by the original definition' },
  { slug: 'blocksize-war', text: 'guerre de la taille des blocs', reason: 'French equivalent explicitly quoted by the original definition' },
  { slug: 'psan', text: 'Autorité des Marchés Financiers', reason: 'Official name of the French regulator' },
];

/** Unreviewed occurrences the validation lets through, all of them listed. One more fails it. */
export const FRENCH_WORD_TOLERANCE = 0;

/**
 * Inline code that holds French words, not code, and is translated: the
 * only exception to inline code kept byte for byte. Each one is narrow: one
 * definition, the French span, the English span that replaces it, the reason.
 * @type {{ slug: string, fr: string, en: string, reason: string }[]}
 */
export const TRANSLATED_CODE_WORDS = [
  { slug: 'bit', fr: '`oui`', en: '`yes`', reason: 'an answer a bit can stand for, a French word set as code' },
  { slug: 'bit', fr: '`non`', en: '`no`', reason: 'an answer a bit can stand for, a French word set as code' },
  { slug: 'bit', fr: '`vrai`', en: '`true`', reason: 'a Boolean value named in French and set as code' },
  { slug: 'bit', fr: '`faux`', en: '`false`', reason: 'a Boolean value named in French and set as code' },
  { slug: 'xor', fr: '`vrai`', en: '`true`', reason: 'a Boolean value named in French and set as code' },
  { slug: 'xor', fr: '`vraie`', en: '`true`', reason: 'a Boolean value named in French and set as code, feminine agreement' },
  { slug: 'xor', fr: '`faux`', en: '`false`', reason: 'a Boolean value named in French and set as code' },
];

/** A French body with its translated code words already in English, as the translation must carry them. */
function withTranslatedCodeWords(slug, body, translated = TRANSLATED_CODE_WORDS) {
  return translated.filter(word => word.slug === slug).reduce((text, word) => text.split(word.fr).join(word.en), body);
}

export const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');

/** The letter file a definition sits in, as letterOfSlug in apps/app-web/src/lib/learn/dictionary.ts. */
export const folderLetter = slug => (/^[a-z]/.test(slug) ? slug.charAt(0) : 'a');

/** The A–Z letter a term is listed under: the first letter of its title, accents folded, A for a leading digit ("51% ATTACK"). */
export function titleLetter(title) {
  const first = title.toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').match(/[a-z0-9]/)?.[0] ?? '';
  return /^[a-z]$/.test(first) ? first : 'a';
}

const isTitle = text => typeof text === 'string' && text.length > 0 && text === text.trim() && text === text.toUpperCase();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
const byListing = (a, b) => a.letter.localeCompare(b.letter) || collator.compare(a.title, b.title) || a.slug.localeCompare(b.slug);

function failOn(problems, label) {
  if (problems.length === 0) return;
  const shown = problems.slice(0, 50);
  const more = problems.length > shown.length ? `\n  and ${problems.length - shown.length} more` : '';
  throw new Error(`${label}: ${problems.length} problem(s)\n  ${shown.join('\n  ')}${more}`);
}

function frenchProblems(frIndex, frDefinitions, expectedCount) {
  const problems = [];
  if (frIndex.lang !== 'fr') problems.push(`the French index says lang "${frIndex.lang}"`);
  if (frIndex.source?.commit !== SOURCE_COMMIT) problems.push(`the French pack comes from commit ${frIndex.source?.commit}, the translations from ${SOURCE_COMMIT}`);
  if (frIndex.count !== expectedCount || frIndex.entries.length !== expectedCount || frDefinitions.length !== expectedCount) {
    problems.push(`the French pack counts ${frIndex.count} terms, indexes ${frIndex.entries.length} and holds ${frDefinitions.length} definitions, ${expectedCount} expected`);
  }
  const slugs = new Set();
  const uuids = new Set();
  for (const definition of frDefinitions) {
    if (slugs.has(definition.slug)) problems.push(`French slug ${definition.slug} appears twice`);
    if (uuids.has(definition.uuid)) problems.push(`French uuid ${definition.uuid} appears twice`);
    if (definition.letter !== folderLetter(definition.slug)) problems.push(`French ${definition.slug} is filed under ${definition.letter}`);
    slugs.add(definition.slug);
    uuids.add(definition.uuid);
  }
  for (const entry of frIndex.entries) if (!slugs.has(entry.slug)) problems.push(`French index entry ${entry.slug} has no definition`);
  for (const definition of frDefinitions) {
    for (const ref of definition.seeAlso) if (!slugs.has(ref.slug)) problems.push(`French ${definition.slug} refers to ${ref.slug}, which is not in the pack`);
  }
  return problems;
}

/**
 * Joins the French pack and the translations ({ <uuid>: { title, body,
 * category, frSha256 } }) into the English index and letter packs. Throws,
 * listing every problem, when a definition has no translation, a translation
 * has no definition, a French body changed since it was translated, or a
 * title or category breaks the rules.
 */
export function buildEnglishPack(frIndex, frDefinitions, translations, { expectedCount = EXPECTED_COUNT } = {}) {
  const label = 'English dictionary pack not built';
  const problems = frenchProblems(frIndex, frDefinitions, expectedCount);
  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) problems.push('the translations are not an object keyed by uuid');
  failOn(problems, label);

  const uuids = new Set(frDefinitions.map(definition => definition.uuid));
  for (const uuid of Object.keys(translations)) if (!uuids.has(uuid)) problems.push(`translation ${uuid} matches no French definition`);
  const english = new Map();
  for (const fr of frDefinitions) {
    const where = `${fr.slug} (${fr.uuid})`;
    const translation = Object.hasOwn(translations, fr.uuid) ? translations[fr.uuid] : undefined;
    if (!translation) { problems.push(`${where}: no translation`); continue; }
    const fields = ['body', 'category', 'frSha256', 'title'];
    if (typeof translation !== 'object' || !same(Object.keys(translation).sort(), fields) || fields.some(field => typeof translation[field] !== 'string')) {
      problems.push(`${where}: a translation is { title, body, category, frSha256 }, all strings`);
      continue;
    }
    if (translation.frSha256 !== sha256(fr.body)) problems.push(`${where}: stale, frSha256 is not the hash of the French body; translate the current text again`);
    const category = CATEGORIES[fr.category];
    if (!category) problems.push(`${where}: French category "${fr.category}" is not in the fixed table`);
    else if (translation.category !== category) problems.push(`${where}: category "${translation.category}", "${category}" expected for ${fr.category}`);
    if (!isTitle(translation.title)) problems.push(`${where}: title "${translation.title}" is empty, padded or not uppercase`);
    if (fr.english !== undefined && !isTitle(fr.english)) problems.push(`${where}: the dictionary's English title "${fr.english}" is not uppercase`);
    if (!translation.body.trim()) problems.push(`${where}: empty body`);
    english.set(fr.uuid, { title: fr.english || translation.title, category, body: translation.body.trim() });
  }
  failOn(problems, label);

  const titleBySlug = new Map(frDefinitions.map(fr => [fr.slug, english.get(fr.uuid).title]));
  const definitions = frDefinitions.map(fr => {
    const { title, category, body } = english.get(fr.uuid);
    return {
      slug: fr.slug,
      title,
      letter: fr.letter,
      category,
      french: fr.title,
      ...(fr.french && fr.french !== fr.title ? { frenchAliases: [fr.french] } : {}),
      uuid: fr.uuid,
      body,
      seeAlso: fr.seeAlso.map(ref => ({ slug: ref.slug, title: titleBySlug.get(ref.slug) })),
    };
  });
  const entries = definitions
    .map(({ slug, title, category, french, frenchAliases }) => ({ slug, title, letter: titleLetter(title), category, french, ...(frenchAliases ? { frenchAliases } : {}) }))
    .sort(byListing);
  const rank = new Map(entries.map((entry, position) => [entry.slug, position]));
  definitions.sort((a, b) => rank.get(a.slug) - rank.get(b.slug));

  const { author, license, licenseUrl, repository, commit, definitionsBase } = frIndex.source;
  const index = {
    lang: 'en',
    source: { title: 'Bitcoin Dictionary', author, license, licenseUrl, repository, commit, definitionsBase, builtAt: BUILT_AT, translation: { ...TRANSLATION } },
    count: entries.length,
    letters: [...new Set(entries.map(entry => entry.letter))].sort(),
    entries,
  };
  const packs = [...new Set(definitions.map(definition => definition.letter))].sort()
    .map(letter => ({ lang: 'en', letter, entries: definitions.filter(definition => definition.letter === letter) }));
  return { index, packs };
}

/** The files of the pack, as [path relative to the pack folder, content]. */
export function renderPackFiles({ index, packs }) {
  return [
    ['README.md', readme(index)],
    ['index.json', JSON.stringify(index)],
    ...packs.map(pack => [`letters/${pack.letter}.json`, JSON.stringify(pack)]),
  ];
}

function readme(index) {
  const { source } = index;
  const categories = Object.entries(CATEGORIES).map(([fr, en]) => `    ${fr} → ${en}`).join('\n');
  return `# Bitcoin Dictionary, Learn pack in English

This folder holds an unofficial English translation of the ${index.count}
definitions of the *${TRANSLATION.originalTitle}* by ${source.author}, as static
JSON for the Learn section of Alice App. The original is in French.
Copyright (c) 2024 Loïc Morel (Pandul), the notice the work is supplied with.

- Original: *${TRANSLATION.originalTitle}*, ${source.repository}, commit
  \`${source.commit}\`, the text of the French pack in ../fr/.
- Licence: ${source.license}, ${source.licenseUrl}. This translation is an
  adaptation of the work and is shared under the same licence, with the
  author's attribution.
- Permission: on 17 October 2026 Loïc Pandul agreed to the dictionary being
  shipped in Alice and quoted in its replies, which settles the NonCommercial
  clause for this use, and on 2 November 2026 to this English translation,
  made for Alice. The exchanges are kept by Marius Farashi, outside this
  repository.
- Status: unofficial. The author has not reviewed this translation. It stands
  in until the author's own English translation is published, which will
  replace it.
- Modifications, so that the licence's notice is kept:
  - as in the French pack, the YAML metadata and Markdown bodies were parsed
    into JSON; relative image paths were replaced by absolute URLs to the
    same images at the source commit; LaTeX blocks and inline formulas were
    turned into code blocks and inline code; the cross-references given as
    UUIDs were resolved to the terms they name;
  - the definitions were translated from French into English, paragraph by
    paragraph, without adding, summarising or correcting anything, but for
    two slips: in sigops-signature-operations, \`OP_CHECKMULTISIG\` is
    preceded by \`OP_n\`, as the original's next paragraph says, and in
    bitcoin-unlimited Roger Ver is named "with" the big blockers where the
    original reads "avant"; Gregory Maxwell's words, which the original
    quotes in French in coinjoin and chaumian-coinjoin, are given as he
    wrote them in English; code
    blocks, inline code, link destinations and image URLs are those of the
    French text, except French words set as inline code in bit and xor
    (\`vrai\`, \`faux\`, \`oui\`, \`non\`), translated; image descriptions and
    visible link text are translated;
  - a title is the English equivalent the dictionary gives, when it gives
    one, and otherwise a translation of the French title; every term keeps
    its French title in the \`french\` field and any additional French
    equivalent in \`frenchAliases\`;
  - the categories follow one fixed table:
${categories}
  - terms are listed from A to Z by the first letter of their English title,
    A for a title starting with a digit; the files in \`letters/\` keep the
    letter of the slug, as in the French pack.

The translations are kept in \`data/dictionary-en/translations.json\`, each
with the SHA-256 of the French body it was made from. Rebuild with
\`node scripts/build-dictionary-pack-en.mjs\` and check with
\`node scripts/validate-dictionary-pack-en.mjs\`. Do not edit these files by
hand.
`;
}

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

/** A pack folder as it is on disk: its index, every letters/<a-z>.json, and any other file in letters/. */
export function readPack(root) {
  const names = fs.readdirSync(path.join(root, 'letters')).sort();
  const isLetterFile = name => /^[a-z]\.json$/.test(name);
  const packs = names.filter(isLetterFile).map(name => readJson(path.join(root, 'letters', name)));
  return {
    index: readJson(path.join(root, 'index.json')),
    packs,
    definitions: packs.flatMap(pack => pack.entries),
    unexpected: names.filter(name => !isLetterFile(name)).map(name => `letters/${name}`),
  };
}

/** Every file under a folder, as paths relative to it with forward slashes. */
export function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { recursive: true })
    .map(name => String(name))
    .filter(name => fs.statSync(path.join(root, name)).isFile())
    .map(name => name.split(path.sep).join('/'))
    .sort();
}

// What a translation must carry over byte for byte. Each pattern is removed
// from the prose once read, keeping the text's length, so that positions in
// the prose are positions in the body.
const FENCED_CODE = /^[ \t]*(`{3,}|~{3,})[^\n]*\n(?:[\s\S]*?\n)?[ \t]*\1[ \t]*$/gm;
const INLINE_CODE = /(?<!`)(`+)(?!`)([^\n]*?[^`\n])\1(?!`)/g;
const IMAGE = /!\[([^\]\n]*)\]\(\s*([^)\s]+)[^)\n]*\)/g;
const LINK = /(\[[^\]\n]*\])\(\s*([^)\s]+)[^)\n]*\)/g;
const BARE_URL = /https?:\/\/[^\s<>()[\]"'`]+/g;
const blank = text => text.replace(/[^\n]/g, ' ');

/** Code, images, links and URLs of a Markdown body, and the prose left around them. */
export function protectedContent(body) {
  const codeBlocks = [];
  const inlineCode = [];
  const images = [];
  const alts = [];
  const links = [];
  const urls = [];
  let prose = body.replace(FENCED_CODE, block => { codeBlocks.push(block); return blank(block); });
  prose = prose.replace(INLINE_CODE, span => { inlineCode.push(span); return blank(span); });
  prose = prose.replace(IMAGE, (image, alt, url) => { images.push(url); alts.push(alt); return blank(image); });
  prose = prose.replace(LINK, (link, text, url) => { links.push(url); return text + blank(link.slice(text.length)); });
  prose = prose.replace(BARE_URL, url => { urls.push(url.replace(/[.,;:!?*_]+$/, '')); return blank(url); });
  const paragraphs = body.trim().split(/\n[ \t]*\n/).filter(paragraph => paragraph.trim()).length;
  return { codeBlocks, inlineCode, images, alts, links, urls, paragraphs, prose };
}

function difference(expected, actual) {
  const extra = [...actual];
  const missing = [];
  for (const item of expected) {
    const at = extra.indexOf(item);
    if (at === -1) missing.push(item);
    else extra.splice(at, 1);
  }
  if (missing.length === 0 && extra.length === 0) return '(same items, another order)';
  return `(missing ${JSON.stringify(missing)}, extra ${JSON.stringify(extra)})`;
}

/**
 * What a translated body changed of what it must keep: code blocks and image
 * URLs in the same order, inline code, links and URLs as the same set (a
 * sentence may move them), and as many paragraphs.
 */
export function compareProtected(frBody, enBody) {
  const fr = protectedContent(frBody);
  const en = protectedContent(enBody);
  const sorted = list => [...list].sort();
  const problems = [];
  if (!same(fr.codeBlocks, en.codeBlocks)) problems.push(`code blocks differ ${difference(fr.codeBlocks, en.codeBlocks)}`);
  if (!same(sorted(fr.inlineCode), sorted(en.inlineCode))) problems.push(`inline code differs ${difference(fr.inlineCode, en.inlineCode)}`);
  if (!same(fr.images, en.images)) problems.push(`image URLs differ ${difference(fr.images, en.images)}`);
  if (!same(sorted(fr.links), sorted(en.links))) problems.push(`links differ ${difference(fr.links, en.links)}`);
  if (!same(sorted(fr.urls), sorted(en.urls))) problems.push(`URLs differ ${difference(fr.urls, en.urls)}`);
  if (fr.paragraphs !== en.paragraphs) problems.push(`${en.paragraphs} paragraphs, ${fr.paragraphs} in French`);
  const emphasis = text => (text.match(/\*/g) ?? []).length;
  const blocks = text => text.match(/^(?:[ \t]*[-*+] |[ \t]*\d+[.)] |#{1,6} |> ?)/gm) ?? [];
  if (emphasis(fr.prose) !== emphasis(en.prose)) problems.push(`emphasis markers differ (${emphasis(en.prose)}, ${emphasis(fr.prose)} in French)`);
  if (!same(blocks(fr.prose), blocks(en.prose))) problems.push('Markdown block markers differ');
  if (frBody.split('\n').length !== enBody.split('\n').length) problems.push('line breaks differ');
  return problems;
}

const FRENCH_WORD = /(?<![\p{L}\p{N}_-])(?:le|la|les|des|est|une|pour|avec)(?![\p{L}\p{N}_-])/giu;

/**
 * Common French words left in an English title, body or image text. Code and
 * URLs are not read; a reviewed occurrence is skipped in its own definition
 * only. `used` holds the index of the reviewed entry behind each skip.
 */
export function scanFrenchWords(slug, title, body, reviewed = REVIEWED_FRENCH_WORDS) {
  const content = protectedContent(body);
  const fields = [
    { where: 'title', original: title, text: title },
    { where: 'body', original: body, text: content.prose },
    ...content.alts.map(alt => ({ where: 'image text', original: alt, text: alt })),
  ];
  const findings = [];
  const used = [];
  for (const field of fields) {
    let text = field.text;
    reviewed.forEach((review, position) => {
      if (review.slug !== slug) return;
      const parts = text.split(review.text);
      for (let count = 1; count < parts.length; count += 1) used.push(position);
      text = parts.join(blank(review.text));
    });
    for (const match of text.matchAll(FRENCH_WORD)) {
      const start = Math.max(0, match.index - 40);
      const context = field.original.slice(start, match.index + match[0].length + 40).replace(/\s+/g, ' ').trim();
      findings.push({ slug, where: field.where, word: match[0], context });
    }
  }
  return { findings, used };
}

function reviewProblems(reviewed) {
  const problems = [];
  reviewed.forEach((review, position) => {
    const where = `reviewed French word #${position + 1}`;
    if (![review.slug, review.text, review.reason].every(value => typeof value === 'string' && value.trim())) problems.push(`${where}: slug, text and reason are required`);
    else if (review.text.length > 80) problems.push(`${where}: "${review.text}" is longer than a name or a short quotation`);
    else if (!review.text.match(FRENCH_WORD)) problems.push(`${where}: "${review.text}" holds none of the scanned words`);
  });
  return problems;
}

function translatedCodeProblems(frDefinitions, translated) {
  const bodies = new Map(frDefinitions.map(fr => [fr.slug, fr.body]));
  const problems = [];
  translated.forEach((word, position) => {
    const where = `translated code word #${position + 1}`;
    const isWordSpan = span => typeof span === 'string' && /^`\p{L}+`$/u.test(span);
    if (!isWordSpan(word.fr) || !isWordSpan(word.en) || typeof word.reason !== 'string' || !word.reason.trim()) problems.push(`${where}: fr and en are one word as inline code, and a reason is required`);
    else if (!bodies.get(word.slug)?.includes(word.fr)) problems.push(`${where}: ${word.fr} is not in the French text of ${word.slug}`);
  });
  return problems;
}

/**
 * Checks an English pack against the French one: counts, slugs and uuids,
 * letters, titles, categories, cross-references, what each body must keep,
 * and the French words left. The translated code words are compared in
 * English. `ok` is false on any error, or when more unreviewed French words
 * are found than the tolerance.
 */
export function validateEnglishPack({ frIndex, frDefinitions, enIndex, enPacks, reviewed = REVIEWED_FRENCH_WORDS, translatedCode = TRANSLATED_CODE_WORDS, expectedCount = EXPECTED_COUNT, tolerance = FRENCH_WORD_TOLERANCE }) {
  const errors = frenchProblems(frIndex, frDefinitions, expectedCount);
  const enDefinitions = enPacks.flatMap(pack => pack.entries);
  const source = enIndex.source ?? {};

  if (enIndex.lang !== 'en') errors.push(`the English index says lang "${enIndex.lang}"`);
  if (source.title !== 'Bitcoin Dictionary') errors.push(`source.title is "${source.title}"`);
  for (const key of ['author', 'license', 'licenseUrl', 'repository', 'commit', 'definitionsBase']) {
    if (source[key] !== frIndex.source?.[key]) errors.push(`source.${key} differs from the French pack`);
  }
  if (source.builtAt !== BUILT_AT) errors.push(`source.builtAt is ${source.builtAt}, ${BUILT_AT} expected`);
  if (!same(source.translation, TRANSLATION)) errors.push('source.translation does not describe the unofficial translation');
  if (enIndex.count !== expectedCount || enIndex.entries.length !== expectedCount || enDefinitions.length !== expectedCount) {
    errors.push(`the English pack counts ${enIndex.count} terms, indexes ${enIndex.entries.length} and holds ${enDefinitions.length} definitions, ${expectedCount} expected`);
  }

  const frLetters = [...new Set(frDefinitions.map(fr => fr.letter))].sort();
  const enLetters = enPacks.map(pack => pack.letter);
  if (!same(enLetters, frLetters)) errors.push(`letter files ${enLetters.join('')}, ${frLetters.join('')} expected`);
  for (const pack of enPacks) {
    if (pack.lang !== 'en') errors.push(`letters/${pack.letter}.json says lang "${pack.lang}"`);
    for (const en of pack.entries) {
      if (en.letter !== pack.letter || folderLetter(en.slug) !== pack.letter) errors.push(`${en.slug} is filed in ${pack.letter}.json with letter ${en.letter}, ${folderLetter(en.slug)} expected`);
    }
  }

  const frSlugs = new Set(frDefinitions.map(fr => fr.slug));
  const enBySlug = new Map();
  for (const en of enDefinitions) {
    if (enBySlug.has(en.slug)) errors.push(`${en.slug} appears twice in the letter files`);
    if (!frSlugs.has(en.slug)) errors.push(`${en.slug} is not a French slug`);
    enBySlug.set(en.slug, en);
  }
  const entryBySlug = new Map();
  for (const entry of enIndex.entries) {
    if (entryBySlug.has(entry.slug)) errors.push(`${entry.slug} appears twice in the index`);
    if (!frSlugs.has(entry.slug)) errors.push(`index entry ${entry.slug} is not a French slug`);
    entryBySlug.set(entry.slug, entry);
  }
  const listed = [...enIndex.entries].sort(byListing).map(entry => entry.slug);
  if (!same(listed, enIndex.entries.map(entry => entry.slug))) errors.push('the index is not sorted by letter and English title');
  const navigation = [...new Set(enIndex.entries.map(entry => entry.letter))].sort();
  if (!same(enIndex.letters, navigation)) errors.push(`index letters ${enIndex.letters?.join('')}, ${navigation.join('')} expected`);

  const findings = [];
  const used = [];
  for (const fr of frDefinitions) {
    const en = enBySlug.get(fr.slug);
    const entry = entryBySlug.get(fr.slug);
    if (!en || !entry) { errors.push(`${fr.slug}: missing from the English ${en ? 'index' : 'letter files'}`); continue; }
    const where = fr.slug;
    if (en.uuid !== fr.uuid) errors.push(`${where}: uuid ${en.uuid}, ${fr.uuid} in French`);
    if (!isTitle(en.title)) errors.push(`${where}: title "${en.title}" is empty, padded or not uppercase`);
    if (fr.english && en.title !== fr.english) errors.push(`${where}: title "${en.title}", the dictionary gives "${fr.english}"`);
    if (typeof en.body !== 'string' || !en.body.trim()) errors.push(`${where}: empty body`);
    if (en.category !== CATEGORIES[fr.category]) errors.push(`${where}: category "${en.category}", "${CATEGORIES[fr.category]}" expected for ${fr.category}`);
    if (en.french !== fr.title) errors.push(`${where}: french "${en.french}", the French title is "${fr.title}"`);
    const aliases = fr.french && fr.french !== fr.title ? [fr.french] : undefined;
    if (!same(en.frenchAliases, aliases)) errors.push(`${where}: French aliases differ from the original`);
    if (!same(entry.frenchAliases, aliases)) errors.push(`${where}: index French aliases differ from the original`);
    for (const key of ['title', 'category', 'french']) if (entry[key] !== en[key]) errors.push(`${where}: index ${key} differs from the definition`);
    if (entry.letter !== titleLetter(en.title ?? '')) errors.push(`${where}: listed under ${entry.letter}, ${titleLetter(en.title ?? '')} expected for "${en.title}"`);

    const refs = (en.seeAlso ?? []).map(ref => ref.slug);
    const frRefs = fr.seeAlso.map(ref => ref.slug);
    if (!same(refs, frRefs)) errors.push(`${where}: seeAlso ${refs.join(', ')}, ${frRefs.join(', ')} expected`);
    for (const ref of en.seeAlso ?? []) {
      const target = enBySlug.get(ref.slug);
      if (!target || ref.title !== target.title) errors.push(`${where}: seeAlso ${ref.slug} titled "${ref.title}", "${target?.title}" expected`);
    }

    if (typeof en.body !== 'string') continue;
    errors.push(...compareProtected(withTranslatedCodeWords(fr.slug, fr.body, translatedCode), en.body).map(problem => `${where}: ${problem}`));
    const scan = scanFrenchWords(fr.slug, en.title ?? '', en.body, reviewed);
    findings.push(...scan.findings);
    used.push(...scan.used);
  }
  errors.push(...reviewProblems(reviewed), ...translatedCodeProblems(frDefinitions, translatedCode));

  return {
    count: enDefinitions.length,
    errors,
    findings,
    tolerance,
    reviewedOccurrences: used.length,
    reviewedFindings: reviewed.filter((_, position) => used.includes(position)),
    unusedReviews: reviewed.filter((_, position) => !used.includes(position)),
    ok: errors.length === 0 && findings.length <= tolerance,
  };
}
