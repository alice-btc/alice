#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { loadRagEvaluationRuntime } from './rag-eval-runtime.mjs';

const args = process.argv.slice(2);
const value = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const fixturePath = value('--fixture', 'scripts/data/rag-query-eval/curated-routing-cases-2026-10-11.json');
const outputPath = value('--output', '/tmp/alice-curated-routing-report.json');
const semanticMode = value('--semantic', 'off');
const budget = value('--budget', 'cloud');
if (!['cloud', 'local'].includes(budget)) throw new Error('Use --budget cloud or local');
if (!['off', 'web', 'native'].includes(semanticMode)) throw new Error('Use --semantic off, web or native');
const fixtureText = await readFile(fixturePath, 'utf8');
const fixture = JSON.parse(fixtureText);
const runtimeFiles = [
  'packages/alice-ai/src/rag.ts', 'packages/alice-ai/src/curated-retrieval.ts',
  'packages/alice-ai/src/turn-knowledge.ts', 'packages/alice-ai/src/rag-query-policy.ts',
  'packages/alice-ai/src/knowledge-context-budget.ts', 'packages/alice-ai/src/generated/curated-rag.ts',
];
const runtimeSha256 = Object.fromEntries(await Promise.all(runtimeFiles.map(async file =>
  [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
const runtime = await loadRagEvaluationRuntime(`
 export { loadRagCorpus, retrieveContextHybridWithDiagnostics, isTechnicalRagQuery } from './packages/alice-ai/src/rag.ts';
 export { ragQueryChunkBudget } from './packages/alice-ai/src/rag-query-policy.ts';
 export { knowledgeContextCharLimit } from './packages/alice-ai/src/knowledge-context-budget.ts';
 export { getRegisteredPacks, getBundledKnowledgeChunks } from './packages/alice-ai/src/knowledge-packs.ts';
 export { rankBySimilarity, toQueryText } from './packages/alice-ai/src/semantic-search.ts';
`);
const start = performance.now();
await runtime.loadRagCorpus();
const corpusLoadMs = performance.now() - start;
let extractor;
let semanticIndexHash;
let semanticCalls = 0;
let semanticSuccesses = 0;
const semanticErrors = [];
if (semanticMode !== 'off') {
  const directory = semanticMode === 'web' ? 'apps/app-web/public/core-embeddings' : 'apps/wallet-mobile/assets/core-embeddings';
  const metadataBytes = await readFile(`${directory}/index.json`);
  const meta = JSON.parse(metadataBytes);
  const vectorsBytes = await readFile(`${directory}/embeddings.f32`);
  const vectors = new Float32Array(vectorsBytes.buffer.slice(vectorsBytes.byteOffset, vectorsBytes.byteOffset + vectorsBytes.byteLength));
  const chunks = runtime.getBundledKnowledgeChunks();
  const corpusHash = createHash('sha256').update(chunks.map(c => `${c.id}\n${c.sourceHash ?? ''}\n${c.title}\n${c.content}`).join('\n\n')).digest('hex');
  if (JSON.stringify(meta.ids) !== JSON.stringify(chunks.map(c => c.id)) || meta.corpusHash !== corpusHash) throw new Error('Semantic index does not match the active corpus');
  if (vectors.length !== meta.ids.length * meta.dim) throw new Error('Semantic vector dimensions mismatch');
  semanticIndexHash = createHash('sha256').update(metadataBytes).update(vectorsBytes).digest('hex');
  if (semanticMode === 'web') {
    const { pipeline, env } = await import('@huggingface/transformers');
    env.allowRemoteModels = false;
    const cache = value('--model-cache', null);
    if (!cache) throw new Error('Web evaluation requires an existing --model-cache');
    env.cacheDir = cache;
    extractor = await pipeline('feature-extraction', meta.model, { local_files_only: true });
  }
  runtime.setEvaluationSemanticMatcher(async (query, topK) => {
    semanticCalls += 1;
    try {
    let vector;
    if (extractor) vector = (await extractor([runtime.toQueryText(query)], { pooling: 'mean', normalize: true })).data;
    else {
      const response = await fetch('http://127.0.0.1:18082/v1/embeddings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: [runtime.toQueryText(query)], model: meta.model }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`Local E5 returned ${response.status}`);
      vector = (await response.json()).data[0].embedding;
    }
    const norm = Math.hypot(...vector);
    if (vector.length !== meta.dim || !Number.isFinite(norm) || norm === 0) throw new Error('Invalid semantic query vector');
      semanticSuccesses += 1;
      return runtime.rankBySimilarity(Float32Array.from(vector, x => x / norm), { dim: meta.dim, ids: meta.ids, vectors }, topK);
    } catch (error) {
      semanticErrors.push(String(error));
      throw error;
    }
  });
}
const rows = [];
for (const row of fixture.cases) {
  const before = performance.now();
  const maxChunks = runtime.ragQueryChunkBudget(row.question, budget === 'local', () => runtime.isTechnicalRagQuery(row.question));
  const maxContextChars = runtime.knowledgeContextCharLimit(budget === 'local');
  const result = await runtime.retrieveContextHybridWithDiagnostics(row.question, { maxChunks, maxContextChars, targetLanguage: row.language ?? 'fr' });
  const found = result.diagnostics.map(chunk => chunk.conceptId ?? chunk.id);
  const secondary = result.diagnostics.filter(chunk => chunk.tier === 'secondary');
  const errors = [];
  if (row.kind === 'general') {
    if (!row.primary_candidates.includes(found[0])) errors.push('primary_introduction_not_first');
    if (secondary.length) errors.push('secondary_noise_in_general_question');
  } else if (row.kind === 'unsupported-live-data' || row.kind === 'unrelated') {
    if (found.length) errors.push('unsupported_question_retrieved_documentary_answer');
  } else if (row.secondary_candidates.length) {
    if (!secondary.some(chunk => row.secondary_candidates.includes(chunk.conceptId ?? chunk.id))) errors.push('expected_secondary_missing');
  } else if (!row.primary_candidates.some(id => found.includes(id))) {
    errors.push('expected_primary_missing');
  }
  if (row.required_concepts?.some(id => !found.includes(id))) errors.push('comparison_subject_missing');
  if (row.id === 'case-24' && !row.secondary_candidates.every(id => found.includes(id))) errors.push('comparison_subject_missing');
  if (result.diagnostics.some(chunk => !chunk.id.startsWith('curated-'))) errors.push('legacy_or_unapproved_corpus_leak');
  rows.push({ id: row.id, question: row.question, kind: row.kind, maxChunks, maxContextChars, found, diagnostics: result.diagnostics, passed: !errors.length, errors, durationMs: performance.now() - before });
}
const report = {
  fixture: fixturePath, fixtureSha256: createHash('sha256').update(fixtureText).digest('hex'),
  runtimeSha256,
  evaluation: 'real retrieval runtime; no generated answers or external inference',
  semanticMode, budget, semanticIndexHash,
  semanticCalls, semanticSuccesses, semanticErrors,
  corpusLoadMs, caseCount: rows.length, passed: rows.filter(row => row.passed).length,
  failed: rows.filter(row => !row.passed).length,
  counts: runtime.getRegisteredPacks().map(pack => ({ id: pack.id, chunks: pack.chunks.length })),
  rows,
};
await extractor?.dispose();
await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, rows: rows.filter(row => !row.passed).map(({ diagnostics, ...row }) => row) }, null, 2));
if (args.includes('--check') && (report.failed || semanticErrors.length || (semanticMode !== 'off' && !semanticSuccesses))) process.exitCode = 1;
