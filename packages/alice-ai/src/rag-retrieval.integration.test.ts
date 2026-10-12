import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { build } from 'esbuild';

async function loadBundledRag(): Promise<any> {
  const result = await build({
    stdin: {
      contents: [
        "export * from './packages/alice-ai/src/rag.ts';",
        "export { getAllChunks } from './packages/alice-ai/src/knowledge-packs.ts';",
      ].join('\n'),
      resolveDir: process.cwd(),
      sourcefile: 'rag-test-entry.ts',
      loader: 'ts',
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    external: ['react-native', '@huggingface/transformers'],
  });
  const source = Buffer.from(result.outputFiles[0].contents).toString('base64');
  return import(`data:text/javascript;base64,${source}`);
}

test('the selected corpus keeps the primary base bounded and exposes only reviewed secondary knowledge', async () => {
  const rag = await loadBundledRag();
  await rag.loadRagCorpus();
  const chunks = rag.getAllChunks();
  const primary = chunks.filter((chunk: { tier?: string }) => chunk.tier === 'primary');
  const secondary = chunks.filter((chunk: { tier?: string }) => chunk.tier === 'secondary');
  assert.equal(primary.length, 200);
  assert.equal(secondary.length, 203);
  assert.equal(chunks.length, 403);
  assert.equal(new Set(chunks.map((chunk: { conceptId: string }) => chunk.conceptId)).size, chunks.length);
  const primaryIds = new Set(primary.map((chunk: { conceptId: string }) => chunk.conceptId));
  for (const chunk of chunks) {
    assert.equal(chunk.status, 'reviewed');
    assert.equal(chunk.locale, 'fr');
    assert.equal(chunk.translationStatus, 'source');
    assert.ok(chunk.id.startsWith('curated-'));
    if (chunk.tier === 'secondary') assert.ok(chunk.parentIds.some((id: string) => primaryIds.has(id)), chunk.id);
  }
});

async function readSemanticIndex(basePath: string) {
  const indexPath = decodeURIComponent(new URL(`${basePath}/index.json`, import.meta.url).pathname);
  const vectorsPath = decodeURIComponent(new URL(`${basePath}/embeddings.f32`, import.meta.url).pathname);
  return {
    metadata: JSON.parse(await readFile(indexPath, 'utf8')) as {
      model: string;
      dim: number;
      ids: string[];
      corpusHash: string;
    },
    vectors: await readFile(vectorsPath),
  };
}

test('the web and native semantic indexes exactly match the active core corpus', async () => {
  const rag = await loadBundledRag();
  await rag.loadRagCorpus();
  const chunks = rag.getAllChunks();
  const expectedIds = chunks.map((chunk: { id: string }) => chunk.id);
  const expectedCorpusHash = createHash('sha256').update(chunks.map((chunk: {
    id: string;
    sourceHash?: string;
    title: string;
    content: string;
  }) => `${chunk.id}\n${chunk.sourceHash ?? ''}\n${chunk.title}\n${chunk.content}`).join('\n\n')).digest('hex');
  const indexes = await Promise.all([
    readSemanticIndex('../../../apps/app-web/public/core-embeddings'),
    readSemanticIndex('../../../apps/wallet-mobile/assets/core-embeddings'),
  ]);

  assert.equal(indexes[0].metadata.model, 'Xenova/multilingual-e5-small');
  assert.equal(indexes[1].metadata.model, 'TwinSunsLLC/multilingual-e5-small-gguf@b6cac9615d4ecce28d7f22539b7322d695fc2886');
  for (const { metadata, vectors } of indexes) {
    assert.deepEqual(metadata.ids, expectedIds);
    assert.equal(vectors.byteLength, metadata.ids.length * metadata.dim * Float32Array.BYTES_PER_ELEMENT);
    assert.equal(metadata.corpusHash, expectedCorpusHash);
  }
});

test('definition queries return their dedicated beginner introductions', async () => {
  const rag = await loadBundledRag();
  for (const [query, expected] of [
    ['What is a UTXO?', 'bitcoin-utxo'],
    ['What is Ark?', 'ark-vtxos'],
    ['Explain Proof of Work', 'proof-of-work'],
  ]) {
    const result = await rag.retrieveContextHybridWithDiagnostics(query, { maxChunks: 3, targetLanguage: 'en' });
    const accepted = query === 'What is Ark?' ? ['ark-vtxos', 'ark-payments'] : [expected];
    assert.ok(accepted.includes(result.diagnostics[0]?.conceptId), `${query}: ${result.diagnostics[0]?.conceptId}`);
  }
});

test('wallet recovery paraphrases prefer the canonical recovery explanation', async () => {
  const rag = await loadBundledRag();
  for (const query of [
    'Pourquoi les mots secrets servent a recuperer mon argent ?',
    'How can 12 secret words restore my funds?',
  ]) {
    const result = await rag.retrieveContextHybridWithDiagnostics(query, { maxChunks: 1, targetLanguage: 'fr' });
    assert.equal(result.diagnostics[0]?.conceptId, 'wallet-recovery-phrase', query);
  }
});
