#!/usr/bin/env node
/** Build the selected Alice corpus. Never scan or import the personal vault. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_CORPUS_DIR = path.join(ROOT, 'data/alice-corpus');
export const DEFAULT_OUTPUT = path.join(ROOT, 'packages/alice-ai/src/generated/curated-rag.ts');
const SECTIONS = ['Questions couvertes', 'Réponse courte', 'Explication', 'Limites et confusions', 'Approfondissements', 'Références'];
const PRIVATE_PATH = /(?:\/Users\/|\/home\/|\/private\/|\/opt\/data\/Obsidian\/|file:\/\/|[A-Z]:\\Users\\)/i;
const hasPrivatePath = text => PRIVATE_PATH.test(text.replace(/https?:\/\/[^\s\"<>]+/g, ''));
const sha256 = text => createHash('sha256').update(text).digest('hex');
const ensure = (test, message) => { if (!test) throw new Error(message); };
const unique = values => [...new Set(values)];
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const stringList = value => Array.isArray(value) && value.every(item => typeof item === 'string');

export function parseFiche(text, label = 'fiche') {
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
  ensure(headings.length === SECTIONS.length && headings.every((h, i) => h[1].trim() === SECTIONS[i]), `${label}: unexpected or missing sections`);
  const sections = Object.fromEntries(headings.map((h, i) => [h[1].trim(), body.slice(h.index + h[0].length, headings[i + 1]?.index ?? body.length).trim()]));
  for (const section of SECTIONS) ensure(sections[section], `${label}: empty ${section}`);
  const questions = sections['Questions couvertes'].split(/\r?\n/).filter(line => /^- /.test(line)).map(line => line.slice(2).trim());
  ensure(questions.length > 0, `${label}: no questions`);
  return { metadata, body, sections, questions };
}

export async function loadCorpus(corpusDir, { allowExcludedFiles = false } = {}) {
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
    records.push({ entry, text, ...fiche });
  }
  const counts = { primary: records.filter(r => r.entry.tier === 'primary').length, secondary: records.filter(r => r.entry.tier === 'secondary').length };
  ensure(manifest.counts?.primary === counts.primary && manifest.counts?.secondary === counts.secondary, 'Manifest counts do not match eligible entries');
  if (!allowExcludedFiles) {
    ensure(manifest.entries.length === selected.length, 'Standalone snapshot must not contain excluded manifest entries');
    const actualFiles = (await readdir(path.join(root, 'examples'))).sort();
    const expectedFiles = records.map(r => path.basename(r.entry.path)).sort();
    ensure(JSON.stringify(actualFiles) === JSON.stringify(expectedFiles), 'Standalone snapshot contains extra or missing files');
    const rootFiles = (await readdir(root)).sort();
    ensure(JSON.stringify(rootFiles) === JSON.stringify(['corpus-manifest.json', 'examples', 'retrieval-policy.json']), 'Standalone snapshot contains unexpected files');
  }
  return { manifest, policy, records, counts };
}

function snapshotManifest(corpus) {
  return {
    schema_version: '0.2', status: 'selected_snapshot',
    scope: 'Alice App et Bitcoin ; Alice Wallet hors périmètre.',
    counts: corpus.counts,
    reviewed_meaning: 'Revue éditoriale selon review_method ; ni approbation humaine intégrale ni fact-check externe exhaustif.',
    policy: 'retrieval-policy.json',
    entries: corpus.records.map(({ entry, metadata: m }) => ({
      id: entry.id, title: m.title, tier: m.tier, status: m.status,
      parent_ids: m.parent_ids, related_ids: m.related_ids, path: entry.path,
      review_method: m.review_method, language: m.language, eligible_for_retrieval: true,
      reviewed_at: m.reviewed_at, human_reviewed_in_full: m.human_reviewed_in_full,
      exhaustive_external_fact_check: m.exhaustive_external_fact_check, sha256: entry.sha256,
    })),
  };
}

export async function importSnapshot(sourceDir, destinationDir = DEFAULT_CORPUS_DIR) {
  const corpus = await loadCorpus(sourceDir, { allowExcludedFiles: true });
  ensure(path.resolve(sourceDir) !== path.resolve(destinationDir), 'Import source and destination must differ');
  // Do not silently leave previously selected documents accessible, nor delete
  // arbitrary files. A changed selection with stale files must be reconciled.
  const expected = new Set(corpus.records.map(r => path.basename(r.entry.path)));
  let existing = [];
  try { existing = await readdir(path.join(destinationDir, 'examples')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  ensure(existing.every(name => expected.has(name)), 'Destination contains stale or unmanaged fiches; reconcile the snapshot explicitly before importing');
  await mkdir(path.join(destinationDir, 'examples'), { recursive: true });
  for (const record of corpus.records) await writeFile(path.join(destinationDir, record.entry.path), record.text);
  await writeFile(path.join(destinationDir, 'corpus-manifest.json'), json(snapshotManifest(corpus)));
  await writeFile(path.join(destinationDir, 'retrieval-policy.json'), json(corpus.policy));
  return loadCorpus(destinationDir);
}

export function generateModule(corpus) {
  const manifest = snapshotManifest(corpus);
  const chunks = corpus.records.map(({ entry, metadata: m, sections, questions }) => ({
    id: `curated-${entry.id}`, conceptId: entry.id, title: m.title,
    keywords: unique([m.title, ...m.aliases, ...questions, ...m.topics, entry.id.replaceAll('-', ' ')]),
    // Tier governs access to depth; it must not silently set reader proficiency.
    level: m.level ?? 'beginner', tier: m.tier,
    locale: 'fr', sourceLocale: 'fr', translationStatus: 'source',
    content: ['Réponse courte', 'Explication', 'Limites et confusions'].map(name => `${name}\n${sections[name]}`).join('\n\n'),
    parentIds: m.parent_ids, relatedIds: m.related_ids, reviewMethod: m.review_method,
    sources: m.sources, questions, status: 'reviewed', sourceHash: entry.sha256,
    sourcePath: `data/alice-corpus/${entry.path}`, theme: m.topics[0] ?? 'bitcoin',
  }));
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
  return { version: generated.version, counts: corpus.counts, total: generated.chunks.length };
}

async function main(args) {
  let check = false;
  let importFrom;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--check') check = true;
    else if (args[i] === '--import-from' && args[i + 1]) importFrom = args[++i];
    else if (args[i] === '--help') { console.log('node scripts/build-curated-rag.mjs [--check | --import-from <selected-corpus-directory>]'); return; }
    else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  ensure(!(check && importFrom), '--check cannot import or write source files');
  if (importFrom) await importSnapshot(importFrom);
  console.log(JSON.stringify(await build({ check })));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
