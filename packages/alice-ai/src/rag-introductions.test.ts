import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

const runtime = await loadRagEvaluationRuntime(`
  export { loadRagCorpus, retrieveContextHybridWithDiagnostics } from './packages/alice-ai/src/rag.ts';
  export { getAllChunks } from './packages/alice-ai/src/knowledge-packs.ts';
`);
await runtime.loadRagCorpus();

const INTRODUCTIONS = [
  ['What is a UTXO?', 'bitcoin-utxo'],
  ['What is coin control?', 'coin-control'],
  ['What is CoinJoin?', 'coinjoin'],
  ['What is PayJoin?', 'payjoin'],
  ['Explain Proof of Work', 'proof-of-work'],
  ['What is Lightning?', 'lightning-network'],
  ['What is multisig?', 'multisig'],
  ['What is Ark?', 'ark-vtxos'],
  ['What is a VTXO?', 'ark-vtxos'],
];

test('broad covered Bitcoin concepts keep a dedicated beginner introduction', () => {
  for (const [, concept] of INTRODUCTIONS) {
    const chunk = runtime.getAllChunks().find((c: { conceptId?: string }) => c.conceptId === concept);
    assert.ok(chunk, `Missing introduction: ${concept}`);
    assert.equal(chunk.level, 'beginner', concept);
    assert.equal(chunk.tier, 'primary', concept);
    assert.equal(chunk.locale, 'fr', concept);
  }
});

test('definition retrieval prefers the directly matched introduction', async () => {
  for (const [query, concept] of INTRODUCTIONS) {
    const result = await runtime.retrieveContextHybridWithDiagnostics(query, { maxChunks: 1 });
    const accepted = query === 'What is Ark?' ? ['ark-vtxos', 'ark-payments'] : [concept];
    assert.ok(accepted.includes(result.diagnostics[0]?.conceptId), `${query}: ${result.diagnostics[0]?.conceptId}`);
  }
});

test('Miniscript and L402 omitted from this selected release never revive retired introductions', async () => {
  // These 2 subjects are outside the approved 403-fiche release. Keeping their
  // questions guards the boundary without silently reintroducing legacy prose.
  for (const [query, retired] of [['What is Miniscript?', 'miniscript-introduction'], ['What is L402?', 'l402-introduction']]) {
    const result = await runtime.retrieveContextHybridWithDiagnostics(query, { maxChunks: 1 });
    assert.ok(!runtime.getAllChunks().some((c: { id: string }) => c.id === retired));
    assert.ok(result.diagnostics.every((c: { id: string }) => c.id.startsWith('curated-')));
    assert.ok(!result.diagnostics.some((c: { id: string }) => c.id === retired));
    if (result.context) assert.doesNotMatch(result.context, /\[Knowledge: (?:miniscript-introduction|l402-introduction)\]/);
  }
});
