import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

// ai-preferences imports React Native and storage; the evaluation runtime
// bundles it with in-memory stubs, so the shipped catalog itself is checked.
test('every catalog model is pinned to a commit with its SHA-256, the previous catalog is refused', async () => {
  const runtime = await loadRagEvaluationRuntime(`
    export { MODEL_CATALOG, LEGACY_MODELS } from './packages/alice-ai/src/ai-preferences.ts';
    export { modelDownloadRefusal } from './packages/alice-ai/src/local-model-registry.ts';
  `, { evaluationPreferences: {} });
  assert.ok(runtime.MODEL_CATALOG.length > 0);
  for (const entry of runtime.MODEL_CATALOG) {
    assert.match(entry.sha256 ?? '', /^[0-9a-f]{64}$/, entry.id);
    assert.ok(entry.url.endsWith(`/${entry.filename}`), entry.id);
    assert.equal(runtime.modelDownloadRefusal(entry), null, entry.id);
  }
  assert.equal(new Set(runtime.MODEL_CATALOG.map((entry: { sha256: string }) => entry.sha256)).size, runtime.MODEL_CATALOG.length);
  for (const entry of runtime.LEGACY_MODELS) {
    assert.ok(runtime.modelDownloadRefusal(entry), entry.id);
  }
});
