#!/usr/bin/env node
/** Build the selected Alice corpus. Never scan or import the personal vault. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_CORPUS_DIR = path.join(ROOT, 'data/alice-corpus');
export const DEFAULT_OUTPUT = path.join(ROOT, 'packages/alice-ai/src/generated/curated-rag.ts');
// Section headings per locale, in their required order: questions, the three
// injected sections (short answer, explanation, limits), further reading, references.
export const SECTIONS = {
  fr: ['Questions couvertes', 'Réponse courte', 'Explication', 'Limites et confusions', 'Approfondissements', 'Références'],
  en: ['Questions covered', 'Short answer', 'Explanation', 'Limits and confusions', 'Further reading', 'References'],
};
const TRANSLATION_LOCALES = ['en'];
const TRANSLATION_STATUSES = ['machine', 'reviewed'];
// A translation copies these frontmatter values from its French source unchanged.
const TRANSLATION_INVARIANTS = ['id', 'type', 'tier', 'status', 'level', 'parent_ids', 'related_ids', 'sources', 'reviewed_at', 'review_due', 'review_method', 'human_reviewed_in_full', 'exhaustive_external_fact_check'];
const PRIVATE_PATH = /(?:\/Users\/|\/home\/|\/private\/|\/opt\/data\/Obsidian\/|file:\/\/|[A-Z]:\\Users\\)/i;
const hasPrivatePath = text => PRIVATE_PATH.test(text.replace(/https?:\/\/[^\s\"<>]+/g, ''));
const sha256 = text => createHash('sha256').update(text).digest('hex');
const ensure = (test, message) => { if (!test) throw new Error(message); };
const unique = values => [...new Set(values)];
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const stringList = value => Array.isArray(value) && value.every(item => typeof item === 'string');

export function parseFiche(text, label = 'fiche', locale = 'fr') {
  const names = SECTIONS[locale];
  ensure(names, `${label}: unsupported locale ${locale}`);
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
  ensure(match, `${label}: missing frontmatter`);
  // The corpus contract deliberately uses one JSON value per YAML key. Fail on
  // unsupported YAML instead of guessing a value or introducing a YAML loader.
  const metadata = {};
  for (const line of match[1].split(/\r?\n/).filter(line => line.trim())) {
    const field = /^([a-z_]+):\s*(.+)$/.exec(line);
    ensure(field && !Object.hasOwn(metadata, field[1]), `${label}: invalid or duplicate frontmatter key`);
    try { metadata[field[1]] = JSON.parse(field[2]); }
    catch { throw new Error(`${label}: frontmatter value for ${field[1]} must be JSON`); }
  }
  const body = match[2];
  const headings = [...body.matchAll(/^## (.+)\r?$/gm)];
  ensure(headings.length === names.length && headings.every((h, i) => h[1].trim() === names[i]), `${label}: unexpected or missing sections`);
  const sections = Object.fromEntries(headings.map((h, i) => [h[1].trim(), body.slice(h.index + h[0].length, headings[i + 1]?.index ?? body.length).trim()]));
  for (const section of names) ensure(sections[section], `${label}: empty ${section}`);
  const questions = sections[names[0]].split(/\r?\n/).filter(line => /^- /.test(line)).map(line => line.slice(2).trim());
  ensure(questions.length > 0, `${label}: no questions`);
  return { metadata, body, sections, questions };
}

const translationPath = (id, locale) => `examples/${id}.${locale}.md`;
const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Loads one translation of a reviewed French fiche. `tracked` is the manifest
 * record ({ path, sha256, source_sha256 }); without one the file is only read
 * when `discover` is set (--record-translations). A tracked translation whose
 * French source changed since it was recorded is stale and fails closed.
 */
async function loadTranslation(root, entry, source, selectedIds, locale, { tracked = null, discover = false } = {}) {
  const label = `${entry.id} (${locale})`;
  const relative = translationPath(entry.id, locale);
  if (tracked) {
    ensure(tracked.path === relative, `${label}: invalid translation path`);
    ensure(/^[a-f0-9]{64}$/.test(tracked.sha256) && /^[a-f0-9]{64}$/.test(tracked.source_sha256), `${label}: invalid translation hash`);
    ensure(tracked.source_sha256 === entry.sha256, `${label}: translation is stale, the French source changed since it was translated; retranslate it, then run --record-translations`);
  } else if (!discover) return null;
  let resolved;
  try { resolved = await realpath(path.join(root, relative)); }
  catch (error) {
    if (error.code === 'ENOENT' && !tracked) return null;
    if (error.code === 'ENOENT') throw new Error(`${label}: tracked translation file is missing`);
    throw error;
  }
  ensure(resolved.startsWith(`${root}${path.sep}`), `${label}: source escapes corpus directory`);
  const bytes = await readFile(resolved);
  const hash = sha256(bytes);
  if (tracked) ensure(hash === tracked.sha256, `${label}: translation hash mismatch`);
  const text = bytes.toString('utf8');
  ensure(!hasPrivatePath(text), `${label}: private local path must not enter the snapshot`);
  const fiche = parseFiche(text, label, locale);
  const m = fiche.metadata;
  const s = source.metadata;
  ensure(m.language === locale && m.source_language === s.language, `${label}: translation language mismatch`);
  ensure(TRANSLATION_STATUSES.includes(m.translation_status), `${label}: invalid translation_status`);
  for (const key of TRANSLATION_INVARIANTS) ensure(sameValue(m[key], s[key]), `${label}: translation/source mismatch for ${key}`);
  ensure(typeof m.title === 'string' && m.title.length > 0, `${label}: missing title`);
  ensure(stringList(m.aliases) && stringList(m.topics) && m.topics.length === s.topics.length, `${label}: missing aliases or topics`);
  ensure(fiche.questions.length === source.questions.length, `${label}: question count differs from the source`);
  for (const link of fiche.body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
    ensure(selectedIds.has(link[1].replace(new RegExp(`\\.${locale}$`), '')), `${label}: unresolved wikilink ${link[1]}`);
  }
  return { locale, path: relative, sha256: hash, text, ...fiche };
}

export async function loadCorpus(corpusDir, { allowExcludedFiles = false, discoverTranslations = false } = {}) {
  const root = await realpath(corpusDir);
  const readJson = async name => JSON.parse(await readFile(path.join(root, name), 'utf8'));
  const manifest = await readJson('corpus-manifest.json');
  const policy = await readJson('retrieval-policy.json');
  ensure(manifest.schema_version === '0.2' && Array.isArray(manifest.entries), 'Unsupported corpus manifest');
  ensure(policy.primary_first === true && policy.quality?.accepted_status === 'reviewed' && policy.quality?.require_eligible_for_retrieval === true, 'Unsupported retrieval policy');
  ensure(!hasPrivatePath(JSON.stringify(policy)), 'Private path in retrieval policy');
  const ids = new Set();
  for (const entry of manifest.entries) {
    ensure(typeof entry.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id), 'Invalid concept ID');
    ensure(!ids.has(entry.id), `Duplicate concept ID: ${entry.id}`);
    ids.add(entry.id);
    ensure(typeof entry.eligible_for_retrieval === 'boolean', `${entry.id}: missing eligibility decision`);
    if (entry.translations !== undefined) {
      ensure(entry.translations && typeof entry.translations === 'object' && !Array.isArray(entry.translations)
        && Object.keys(entry.translations).every(locale => TRANSLATION_LOCALES.includes(locale)), `${entry.id}: invalid translations record`);
    }
  }
  const selected = manifest.entries.filter(entry => entry.eligible_for_retrieval);
  ensure(selected.length > 0, 'Empty eligible corpus');
  const selectedIds = new Set(selected.map(entry => entry.id));
  const records = [];
  for (const entry of selected.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) {
    ensure(entry.status === 'reviewed', `${entry.id}: eligible entry must be reviewed`);
    ensure(['primary', 'secondary'].includes(entry.tier), `${entry.id}: invalid tier`);
    ensure(entry.language === 'fr', `${entry.id}: unsupported source language`);
    ensure(entry.path === `examples/${entry.id}.fr.md`, `${entry.id}: invalid source path`);
    ensure(/^[a-f0-9]{64}$/.test(entry.sha256), `${entry.id}: invalid source hash`);
    const resolved = await realpath(path.join(root, entry.path));
    ensure(resolved.startsWith(`${root}${path.sep}`), `${entry.id}: source escapes corpus directory`);
    const bytes = await readFile(resolved);
    ensure(sha256(bytes) === entry.sha256, `${entry.id}: source hash mismatch`);
    const text = bytes.toString('utf8');
    ensure(!hasPrivatePath(text), `${entry.id}: private local path must not enter the snapshot`);
    const fiche = parseFiche(text, entry.id);
    const m = fiche.metadata;
    for (const key of ['id', 'title', 'language', 'tier', 'status', 'review_method']) {
      ensure(m[key] === entry[key] && typeof m[key] === 'string' && m[key].length > 0, `${entry.id}: manifest/frontmatter mismatch for ${key}`);
    }
    for (const key of ['parent_ids', 'related_ids']) {
      ensure(stringList(m[key]) && JSON.stringify(m[key]) === JSON.stringify(entry[key]), `${entry.id}: manifest/frontmatter mismatch for ${key}`);
      for (const target of m[key]) ensure(selectedIds.has(target), `${entry.id}: unresolved eligible ${key} link ${target}`);
    }
    ensure(stringList(m.sources) && m.sources.length > 0 && stringList(m.aliases) && stringList(m.topics), `${entry.id}: missing sources, aliases or topics`);
    ensure(typeof m.human_reviewed_in_full === 'boolean' && typeof m.exhaustive_external_fact_check === 'boolean', `${entry.id}: missing review limitations`);
    ensure(Object.hasOwn(policy.quality.review_methods ?? {}, m.review_method), `${entry.id}: unrecognized review method`);
    if (m.tier === 'secondary') ensure(m.parent_ids.some(id => selected.find(e => e.id === id)?.tier === 'primary'), `${entry.id}: secondary needs a primary parent`);
    if (m.level !== undefined) ensure(['beginner', 'intermediate', 'advanced'].includes(m.level), `${entry.id}: invalid knowledge level`);
    for (const link of fiche.body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
      ensure(selectedIds.has(link[1].replace(/\.fr$/, '')), `${entry.id}: unresolved wikilink ${link[1]}`);
    }
    const record = { entry, text, ...fiche, translations: {} };
    records.push(record);
  }
  // Translations are validated against the complete French selection (links).
  for (const record of records) {
    for (const locale of TRANSLATION_LOCALES) {
      const translation = await loadTranslation(root, record.entry, record, selectedIds, locale,
        // Discovery (--record-translations) reads files regardless of records; the recorder judges staleness.
        { tracked: discoverTranslations ? null : record.entry.translations?.[locale] ?? null, discover: discoverTranslations });
      if (translation) record.translations[locale] = translation;
    }
  }
  const counts = { primary: records.filter(r => r.entry.tier === 'primary').length, secondary: records.filter(r => r.entry.tier === 'secondary').length };
  ensure(manifest.counts?.primary === counts.primary && manifest.counts?.secondary === counts.secondary, 'Manifest counts do not match eligible entries');
  if (!allowExcludedFiles) {
    ensure(manifest.entries.length === selected.length, 'Standalone snapshot must not contain excluded manifest entries');
    const actualFiles = (await readdir(path.join(root, 'examples'))).sort();
    const expectedFiles = records.flatMap(r => [r.entry.path, ...Object.values(r.translations).map(t => t.path)]).map(p => path.basename(p)).sort();
    if (!discoverTranslations) {
      const expected = new Set(expectedFiles);
      const untracked = actualFiles.filter(name => !expected.has(name) && /\.(?:en)\.md$/.test(name)
        && records.some(r => `${r.entry.id}.en.md` === name));
      ensure(!untracked.length, `${untracked.length} untracked translation(s), e.g. ${untracked[0]}; run node scripts/build-curated-rag.mjs --record-translations`);
    }
    ensure(JSON.stringify(actualFiles) === JSON.stringify(expectedFiles), 'Standalone snapshot contains extra or missing files');
    const rootFiles = (await readdir(root)).sort();
    ensure(JSON.stringify(rootFiles) === JSON.stringify(['corpus-manifest.json', 'examples', 'retrieval-policy.json']), 'Standalone snapshot contains unexpected files');
  }
  return { manifest, policy, records, counts };
}

const translationRecords = record => {
  const locales = Object.keys(record.translations).sort();
  return locales.length ? Object.fromEntries(locales.map(locale => {
    const t = record.translations[locale];
    return [locale, { path: t.path, sha256: t.sha256, source_sha256: record.entry.sha256 }];
  })) : undefined;
};

function snapshotManifest(corpus) {
  return {
    schema_version: '0.2', status: 'selected_snapshot',
    scope: 'Alice App et Bitcoin.',
    counts: corpus.counts,
    reviewed_meaning: 'Revue éditoriale selon review_method ; ni approbation humaine intégrale ni fact-check externe exhaustif.',
    policy: 'retrieval-policy.json',
    entries: corpus.records.map(record => [record, translationRecords(record)]).map(([{ entry, metadata: m }, translations]) => ({
      id: entry.id, title: m.title, tier: m.tier, status: m.status,
      parent_ids: m.parent_ids, related_ids: m.related_ids, path: entry.path,
      review_method: m.review_method, language: m.language, eligible_for_retrieval: true,
      reviewed_at: m.reviewed_at, human_reviewed_in_full: m.human_reviewed_in_full,
      exhaustive_external_fact_check: m.exhaustive_external_fact_check, sha256: entry.sha256,
      ...(translations ? { translations } : {}),
    })),
  };
}

export async function importSnapshot(sourceDir, destinationDir = DEFAULT_CORPUS_DIR) {
  const corpus = await loadCorpus(sourceDir, { allowExcludedFiles: true });
  ensure(path.resolve(sourceDir) !== path.resolve(destinationDir), 'Import source and destination must differ');
  // Do not silently leave previously selected documents accessible, nor delete
  // arbitrary files. A changed selection with stale files must be reconciled.
  const expected = new Set(corpus.records.flatMap(r => [r.entry.path, ...Object.values(r.translations).map(t => t.path)]).map(p => path.basename(p)));
  let existing = [];
  try { existing = await readdir(path.join(destinationDir, 'examples')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  ensure(existing.every(name => expected.has(name)), 'Destination contains stale or unmanaged fiches; reconcile the snapshot explicitly before importing');
  await mkdir(path.join(destinationDir, 'examples'), { recursive: true });
  for (const record of corpus.records) {
    await writeFile(path.join(destinationDir, record.entry.path), record.text);
    for (const t of Object.values(record.translations)) await writeFile(path.join(destinationDir, t.path), t.text);
  }
  await writeFile(path.join(destinationDir, 'corpus-manifest.json'), json(snapshotManifest(corpus)));
  await writeFile(path.join(destinationDir, 'retrieval-policy.json'), json(corpus.policy));
  return loadCorpus(destinationDir);
}

/**
 * Chunk ids: the French source keeps `curated-<id>`; a translation is
 * `curated-<id>.<locale>`, mirroring its file name. Concept ids never contain
 * a dot, so no translation id can collide with a source id. Every variant
 * shares conceptId and sourceHash (the French file's hash), so a French
 * change also changes the translation's chunk and the embedding corpus hash.
 */
function chunkFor(record, variant, locale) {
  const { entry, metadata: source } = record;
  const m = variant.metadata;
  const translated = locale !== source.language;
  return {
    id: translated ? `curated-${entry.id}.${locale}` : `curated-${entry.id}`, conceptId: entry.id, title: m.title,
    keywords: unique([m.title, ...m.aliases, ...variant.questions, ...m.topics, entry.id.replaceAll('-', ' ')]),
    // Tier governs access to depth; it must not silently set reader proficiency.
    level: source.level ?? 'beginner', tier: source.tier,
    locale, sourceLocale: source.language, translationStatus: translated ? m.translation_status : 'source',
    content: SECTIONS[locale].slice(1, 4).map(name => `${name}\n${variant.sections[name]}`).join('\n\n'),
    parentIds: source.parent_ids, relatedIds: source.related_ids, reviewMethod: source.review_method,
    sources: source.sources, questions: variant.questions, status: 'reviewed', sourceHash: entry.sha256,
    sourcePath: `data/alice-corpus/${translated ? variant.path : entry.path}`, theme: source.topics[0] ?? 'bitcoin',
  };
}

export function localeCounts(corpus) {
  const counts = { fr: corpus.records.length };
  for (const locale of TRANSLATION_LOCALES) counts[locale] = corpus.records.filter(r => r.translations[locale]).length;
  return counts;
}

export function generateModule(corpus) {
  const manifest = snapshotManifest(corpus);
  // Variants of one concept stay adjacent, source first, so the semantic
  // index and lexical tie-breaks keep the source corpus order.
  const chunks = corpus.records.flatMap(record => [chunkFor(record, record, record.metadata.language),
    ...TRANSLATION_LOCALES.filter(locale => record.translations[locale]).map(locale => chunkFor(record, record.translations[locale], locale))]);
  ensure(new Set(chunks.map(chunk => chunk.id)).size === chunks.length, 'Duplicate generated chunk ID');
  const version = `curated-${sha256(json({ manifest, policy: corpus.policy, chunks })).slice(0, 20)}`;
  return {
    version, chunks,
    text: `// Rebuild with: node scripts/build-curated-rag.mjs\n// Selected corpus; review methods do not imply exhaustive fact-checking.\nimport type { KnowledgeChunk } from '../knowledge-packs';\n\nexport const CURATED_CORPUS_VERSION = ${JSON.stringify(version)};\n\nexport const GENERATED_CURATED_KNOWLEDGE_BASE: KnowledgeChunk[] = ${JSON.stringify(chunks, null, 2)};\n`,
  };
}

export async function build({ corpusDir = DEFAULT_CORPUS_DIR, output = DEFAULT_OUTPUT, check = false } = {}) {
  const corpus = await loadCorpus(corpusDir);
  const generated = generateModule(corpus);
  if (check) {
    ensure(await readFile(output, 'utf8') === generated.text, 'Generated curated corpus is stale; run node scripts/build-curated-rag.mjs');
  } else {
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, generated.text);
  }
  const locales = localeCounts(corpus);
  return { version: generated.version, counts: corpus.counts, total: generated.chunks.length, locales, without_en: corpus.records.length - locales.en };
}

/**
 * Writes the manifest translation records for every valid translation file of
 * an eligible entry. A record is added for a new file and refreshed when the
 * translation file changed; a translation whose French source changed while
 * its own text did not is stale and is refused, never re-blessed. A record
 * whose file was removed is dropped.
 */
export async function recordTranslations(corpusDir = DEFAULT_CORPUS_DIR) {
  const corpus = await loadCorpus(corpusDir, { discoverTranslations: true });
  const manifestPath = path.join(corpusDir, 'corpus-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const byId = new Map(corpus.records.map(r => [r.entry.id, r]));
  const changes = { added: 0, updated: 0, removed: 0, unchanged: 0 };
  const stale = [];
  for (const entry of manifest.entries) {
    const record = byId.get(entry.id);
    if (!record) continue;
    const next = {};
    for (const locale of TRANSLATION_LOCALES) {
      const previous = entry.translations?.[locale];
      const found = record.translations[locale];
      if (!found) { if (previous) changes.removed += 1; continue; }
      if (previous && previous.sha256 === found.sha256 && previous.source_sha256 !== entry.sha256) { stale.push(`${entry.id}.${locale}`); next[locale] = previous; continue; }
      if (!previous) changes.added += 1;
      else if (previous.sha256 !== found.sha256 || previous.source_sha256 !== entry.sha256) changes.updated += 1;
      else changes.unchanged += 1;
      next[locale] = { path: found.path, sha256: found.sha256, source_sha256: entry.sha256 };
    }
    if (Object.keys(next).length) entry.translations = next;
    else delete entry.translations;
  }
  ensure(!stale.length, `${stale.length} stale translation(s), French source changed but translation did not: ${stale.slice(0, 10).join(', ')}`);
  await writeFile(manifestPath, json(manifest));
  return changes;
}

async function main(args) {
  let check = false;
  let importFrom;
  let record = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--check') check = true;
    else if (args[i] === '--import-from' && args[i + 1]) importFrom = args[++i];
    else if (args[i] === '--record-translations') record = true;
    else if (args[i] === '--help') { console.log('node scripts/build-curated-rag.mjs [--check | --record-translations | --import-from <selected-corpus-directory>]'); return; }
    else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  ensure(!(check && importFrom), '--check cannot import or write source files');
  ensure(!(check && record), '--check cannot record translations');
  if (importFrom) await importSnapshot(importFrom);
  if (record) console.log(JSON.stringify({ translations: await recordTranslations() }));
  console.log(JSON.stringify(await build({ check })));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
