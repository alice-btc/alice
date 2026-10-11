import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { loadCorpus, importSnapshot, generateModule, build, DEFAULT_CORPUS_DIR, DEFAULT_OUTPUT } from './build-curated-rag.mjs';

const hash = text => createHash('sha256').update(text).digest('hex');
const policy = { primary_first: true, quality: { accepted_status: 'reviewed', require_eligible_for_retrieval: true, review_methods: { semantic_light: 'Cohérence uniquement' } } };
async function fixture() {
  const dir = await mkdtemp(path.join(tmpdir(), 'curated-rag-test-'));
  await mkdir(path.join(dir, 'examples'));
  const entries = [];
  for (const [id, tier, parents] of [['base', 'primary', []], ['detail', 'secondary', ['base']]]) {
    const metadata = { id, title: id === 'base' ? 'Le socle français' : 'Le détail', language: 'fr', tier, status: 'reviewed', aliases: ['alias utile'], topics: ['bitcoin'], parent_ids: parents, related_ids: id === 'base' ? ['detail'] : [], sources: ['https://example.org/users/guide'], human_reviewed_in_full: false, exhaustive_external_fact_check: false, review_method: 'semantic_light', reviewed_at: '2026-10-11' };
    const text = `---\n${Object.entries(metadata).map(([k,v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n# ${metadata.title}\n\n## Questions couvertes\n\n- Une question précise ?\n\n## Réponse courte\n\nUne réponse conservée.\n\n## Explication\n\nUn mécanisme détaillé.\n\n## Limites et confusions\n\nUne limite importante sans garantie.\n\n## Approfondissements\n\n- [[${id === 'base' ? 'detail' : 'base'}.fr|Lien]]\n\n## Références\n\n- Référence à ne pas injecter.\n`;
    const entry = { ...metadata, path: `examples/${id}.fr.md`, eligible_for_retrieval: true, sha256: hash(text) };
    entries.push(entry);
    await writeFile(path.join(dir, entry.path), text);
  }
  const manifest = { schema_version: '0.2', counts: { primary: 1, secondary: 1 }, entries };
  await writeFile(path.join(dir, 'corpus-manifest.json'), JSON.stringify(manifest));
  await writeFile(path.join(dir, 'retrieval-policy.json'), JSON.stringify(policy));
  return { dir, manifest, async save() { await writeFile(path.join(dir, 'corpus-manifest.json'), JSON.stringify(manifest)); } };
}
async function alterFiche(f, id, replace) {
  const entry = f.manifest.entries.find(e => e.id === id);
  const file = path.join(f.dir, entry.path);
  const text = replace(await readFile(file, 'utf8'));
  await writeFile(file, text);
  entry.sha256 = hash(text);
  await f.save();
}

test('selected snapshot preserves French content, limitations and independent tier/level', async () => {
  const f = await fixture();
  const { chunks, version } = generateModule(await loadCorpus(f.dir));
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].id, 'curated-base');
  assert.equal(chunks[0].conceptId, 'base');
  assert.equal(chunks[1].tier, 'secondary');
  assert.equal(chunks[1].level, 'beginner');
  assert.deepEqual(chunks[1].parentIds, ['base']);
  assert.equal(chunks[0].translationStatus, 'source');
  assert.ok(chunks[0].keywords.includes('Une question précise ?'));
  assert.match(chunks[0].content, /Une limite importante sans garantie/);
  assert.doesNotMatch(chunks[0].content, /Référence à ne pas injecter|Questions couvertes|\[\[/);
  assert.match(version, /^curated-[a-f0-9]{20}$/);
});

test('import excludes archived and ineligible notes without opening them or copying private provenance', async () => {
  const f = await fixture();
  f.manifest.entries.push({ id: 'archived', status: 'archived', eligible_for_retrieval: false, path: '/private/not-readable.md' });
  await f.save();
  await writeFile(path.join(f.dir, 'private-provenance.json'), '{"private":true}');
  const destination = path.join(await mkdtemp(path.join(tmpdir(), 'curated-import-test-')), 'snapshot');
  const imported = await importSnapshot(f.dir, destination);
  assert.equal(imported.records.length, 2);
  assert.deepEqual((await readdir(destination)).sort(), ['corpus-manifest.json', 'examples', 'retrieval-policy.json']);
  assert.equal(imported.manifest.entries.length, 2);
});

test('hash mismatch blocks generation', async () => {
  const f = await fixture();
  await writeFile(path.join(f.dir, 'examples/base.fr.md'), 'Changed without review');
  await assert.rejects(loadCorpus(f.dir), /source hash mismatch/);
});

test('eligibility cannot override archived or draft status', async () => {
  for (const status of ['archived', 'draft', 'needs_review']) {
    const f = await fixture(); f.manifest.entries[0].status = status; await f.save();
    await assert.rejects(loadCorpus(f.dir), /eligible entry must be reviewed/);
  }
});

test('duplicate concept IDs fail closed', async () => {
  const f = await fixture(); f.manifest.entries.push(f.manifest.entries[0]); await f.save();
  await assert.rejects(loadCorpus(f.dir), /Duplicate concept ID/);
});

test('frontmatter must agree with the reviewed manifest', async () => {
  const f = await fixture(); await alterFiche(f, 'base', t => t.replace('tier: "primary"', 'tier: "secondary"'));
  await assert.rejects(loadCorpus(f.dir), /manifest\/frontmatter mismatch for tier/);
});

test('links may only target eligible concepts', async () => {
  const f = await fixture(); await alterFiche(f, 'base', t => t.replace('[[detail.fr|Lien]]', '[[absent.fr|Lien]]'));
  await assert.rejects(loadCorpus(f.dir), /unresolved wikilink/);
});

test('secondary entries must retain a primary parent', async () => {
  const f = await fixture(); f.manifest.entries[1].parent_ids = []; await alterFiche(f, 'detail', t => t.replace('parent_ids: ["base"]', 'parent_ids: []'));
  await assert.rejects(loadCorpus(f.dir), /secondary needs a primary parent/);
});

test('missing limitation section is not silently dropped', async () => {
  const f = await fixture(); await alterFiche(f, 'base', t => t.replace('## Limites et confusions', '## Autre'));
  await assert.rejects(loadCorpus(f.dir), /unexpected or missing sections/);
});

test('local private paths and escaping source paths fail closed', async () => {
  const f = await fixture();
  // The private path is assembled at run time: a literal one would trip the
  // public snapshot's own guard against local paths in the published tree.
  const privatePath = ['', 'Users', 'private', 'secret.md'].join('/');
  await alterFiche(f, 'base', t => t.replace('Un mécanisme détaillé.', `Un fichier ${privatePath}.`));
  await assert.rejects(loadCorpus(f.dir), /private local path/);
  const g = await fixture(); g.manifest.entries[0].path = '../outside.md'; await g.save();
  await assert.rejects(loadCorpus(g.dir), /invalid source path/);
});

test('symlinks cannot import a document outside the selected corpus', async () => {
  const f = await fixture();
  const { rename } = await import('node:fs/promises');
  const source = path.join(f.dir, 'examples/base.fr.md');
  const external = path.join(await mkdtemp(path.join(tmpdir(), 'curated-external-')), 'base.fr.md');
  await rename(source, external); await symlink(external, source);
  await assert.rejects(loadCorpus(f.dir), /source escapes corpus directory/);
});

test('untracked files in standalone snapshot are rejected', async () => {
  const f = await fixture(); await writeFile(path.join(f.dir, 'examples/private.fr.md'), 'Private');
  await assert.rejects(loadCorpus(f.dir), /extra or missing files/);
});

test('check is deterministic and detects an edited generated module', async () => {
  const f = await fixture(); const output = path.join(await mkdtemp(path.join(tmpdir(), 'curated-output-')), 'curated.ts');
  const a = await build({ corpusDir: f.dir, output });
  assert.deepEqual(await build({ corpusDir: f.dir, output, check: true }), a);
  await writeFile(output, '// stale');
  await assert.rejects(build({ corpusDir: f.dir, output, check: true }), /stale/);
});

test('committed snapshot contains 200 primary and 203 secondary reviewed fiches and reproduces generated module', async () => {
  const corpus = await loadCorpus(DEFAULT_CORPUS_DIR);
  assert.deepEqual(corpus.counts, { primary: 200, secondary: 203 });
  assert.equal(corpus.records.length, 403);
  assert.deepEqual(await build({ check: true, output: DEFAULT_OUTPUT }), { version: generateModule(corpus).version, counts: corpus.counts, total: 403 });
});
