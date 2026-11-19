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

test('Gemma is offered after Qwen, on computers only, and never as the default', async () => {
  const runtime = await loadRagEvaluationRuntime(`
    export { MODEL_CATALOG, DEFAULT_LOCAL_MODEL_ID } from './packages/alice-ai/src/ai-preferences.ts';
    export { mobileModelRefusal } from './packages/alice-ai/src/local-model-memory.ts';
  `, { evaluationPreferences: {} });
  const ids: string[] = runtime.MODEL_CATALOG.map((entry: { id: string }) => entry.id);
  const gemma = ids.filter(id => id.startsWith('gemma-'));
  assert.ok(gemma.length > 0);
  assert.equal(runtime.DEFAULT_LOCAL_MODEL_ID, 'qwen3.5-4b');
  assert.ok(ids.indexOf(gemma[0]) > ids.indexOf('qwen3.5-9b'), 'Gemma comes after the Qwen series');
  for (const entry of runtime.MODEL_CATALOG) {
    if (entry.id.startsWith('gemma-')) assert.ok(runtime.mobileModelRefusal(entry), `${entry.id} is not offered on a phone`);
  }
});

