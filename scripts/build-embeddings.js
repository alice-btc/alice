// Precomputes one embedding vector per knowledge chunk (the bundled curated
// pack, every locale variant: a translated fiche is its own row, fused back
// onto its concept at retrieval) using the same multilingual model the client
// will use for queries, so query and passage vectors live in the same space.
// Run this after build-curated-rag.mjs whenever the selected corpus or one of
// its translations changes: the index must list the generated chunks exactly.
//
// Output: apps/app-web/public/core-embeddings/index.json (chunk ids, dim,
// model id) + embeddings.f32 (row-major Float32Array, L2-normalized rows).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { build } = require('esbuild');

const BATCH_SIZE = 32;
const TARGET = process.env.ALICE_EMBEDDING_TARGET ?? 'web';
const TARGETS = {
  web: {
    modelId: 'Xenova/multilingual-e5-small',
    outputDir: path.join(__dirname, '..', 'apps', 'app-web', 'public', 'core-embeddings'),
  },
};

function normalize(values) {
  const vector = Float32Array.from(values);
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) return vector;
  for (let index = 0; index < vector.length; index += 1) vector[index] /= magnitude;
  return vector;
}

async function createEmbedder(target) {
  {
    const { pipeline, env } = await import('@huggingface/transformers');
    if (process.env.ALICE_EMBEDDING_MODEL_CACHE) env.cacheDir = process.env.ALICE_EMBEDDING_MODEL_CACHE;
    if (process.env.ALICE_EMBEDDING_OFFLINE === '1') env.allowRemoteModels = false;
    // A directory laid out like the shipped /semantic-model/ (prepare-semantic-model.mjs)
    // embeds without any download, with the same quantized weights the browser
    // uses for queries. ALICE_EMBEDDING_DTYPE names the ONNX file to load
    // ("q8" is onnx/model_quantized.onnx); unset, the hub default applies.
    if (process.env.ALICE_EMBEDDING_LOCAL_MODEL_DIR) {
      env.allowLocalModels = true;
      env.localModelPath = process.env.ALICE_EMBEDDING_LOCAL_MODEL_DIR;
    }
    const options = process.env.ALICE_EMBEDDING_DTYPE ? { dtype: process.env.ALICE_EMBEDDING_DTYPE } : {};
    const extractor = await pipeline('feature-extraction', target.modelId, options);
    return async texts => {
      const output = await extractor(texts, { pooling: 'mean', normalize: true });
      const dim = output.dims[1];
      return Array.from({ length: texts.length }, (_, row) => (
        Float32Array.from(output.data.slice(row * dim, (row + 1) * dim))
      ));
    };
  }
}

async function main() {
  const configuredTarget = TARGETS[TARGET];
  const target = configuredTarget && { ...configuredTarget, outputDir: process.env.ALICE_EMBEDDING_OUTPUT_DIR ?? configuredTarget.outputDir };
  if (!target) throw new Error(`Unknown embedding target: ${TARGET}. Expected web.`);
  // Bundle the TypeScript entry explicitly. Direct TS imports depend on Node's
  // evolving ESM extension rules and previously made this release tool fail on
  // a clean machine even though application builds were valid.
  const bundled = await build({
    stdin: {
      contents: [
        "export { loadRagCorpus } from './packages/alice-ai/src/rag.ts';",
        "export { getBundledKnowledgeChunks } from './packages/alice-ai/src/knowledge-packs.ts';",
      ].join('\n'),
      resolveDir: path.join(__dirname, '..'),
      sourcefile: 'embedding-corpus-entry.ts',
      loader: 'ts',
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    external: ['react-native', '@huggingface/transformers'],
  });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].contents).toString('base64')}`;
  const { getBundledKnowledgeChunks, loadRagCorpus } = await import(moduleUrl);
  // The corpus loads on demand since 0.2.0: ask for it before reading.
  await loadRagCorpus();

  const chunks = getBundledKnowledgeChunks();
  const locales = {};
  for (const chunk of chunks) locales[chunk.locale ?? 'unknown'] = (locales[chunk.locale ?? 'unknown'] ?? 0) + 1;
  console.log(`Embedding ${chunks.length} chunks (${JSON.stringify(locales)}) for ${TARGET} with ${target.modelId}...`);
  const embed = await createEmbedder(target);

  const ids = [];
  const vectors = [];
  let dim = null;

  for (let start = 0; start < chunks.length; start += BATCH_SIZE) {
    const batch = chunks.slice(start, start + BATCH_SIZE);
    const texts = batch.map(chunk => `passage: ${chunk.title}. ${chunk.content}`);
    const output = await embed(texts);
    dim = dim ?? output[0]?.length;
    if (!dim || output.some(vector => vector.length !== dim)) {
      throw new Error('Embedding dimensions are inconsistent.');
    }
    for (let row = 0; row < batch.length; row += 1) {
      ids.push(batch[row].id);
      vectors.push(output[row]);
    }
    process.stdout.write(`\r  ${Math.min(start + BATCH_SIZE, chunks.length)}/${chunks.length}`);
  }
  process.stdout.write('\n');

  const matrix = new Float32Array(ids.length * dim);
  vectors.forEach((vector, row) => matrix.set(vector, row * dim));

  fs.mkdirSync(target.outputDir, { recursive: true });
  fs.writeFileSync(path.join(target.outputDir, 'embeddings.f32'), Buffer.from(matrix.buffer));
  fs.writeFileSync(
    path.join(target.outputDir, 'index.json'),
    JSON.stringify({
      model: target.modelId,
      dim,
      ids,
      corpusHash: crypto.createHash('sha256').update(chunks.map(chunk => (
        `${chunk.id}\n${chunk.sourceHash ?? ''}\n${chunk.title}\n${chunk.content}`
      )).join('\n\n')).digest('hex'),
    }, null, 2),
  );

  console.log(`Wrote ${ids.length} vectors (dim=${dim}) to ${target.outputDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
