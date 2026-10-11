import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

async function freshRuntime(label: string) {
  return loadRagEvaluationRuntime(`
    export const isolatedRuntime = ${JSON.stringify(label)};
    export { prepareAliceTurn } from './packages/alice-ai/src/turn-engine';
    export { retrieveTurnKnowledge } from './packages/alice-ai/src/turn-knowledge';
    export { getRegisteredPacks } from './packages/alice-ai/src/knowledge-packs';
    export { isTechnicalRagQuery } from './packages/alice-ai/src/rag';
    export { createAliceMemory } from './packages/alice-ai/src/alice-memory-core';
    export { createPedagogicalProfile } from './packages/alice-ai/src/pedagogical-profile-core';
  `);
}

async function prepare(runtime: any, query: string) {
  let knowledge: any = null;
  const turn = await runtime.prepareAliceTurn({
    history: [{ role: 'user', content: query }], userMessage: query,
    backendType: 'local', targetLanguage: 'fr',
  }, {
    recordPedagogicalSignal: async () => runtime.createPedagogicalProfile(),
    getMemory: async () => ({ ...runtime.createAliceMemory(), enabled: false }),
    rememberMemoryCandidates: async () => ({ memory: runtime.createAliceMemory(), saved: true }),
    pedagogicalContext: () => '', memoryContext: () => '', memoryCaptureInstruction: '',
    retrieveKnowledge: async (rewritten: string) => {
      knowledge = await runtime.retrieveTurnKnowledge(rewritten, 'local', 'fr');
      return knowledge;
    },
  });
  return { turn, knowledge };
}

test('first local turn loads the corpus before choosing the specialist budget', async () => {
  const runtime = await freshRuntime('cold-specialist');
  const query = 'Comment ajouter des fonds à mon canal sans le fermer ?';
  assert.deepEqual(runtime.getRegisteredPacks(), []);
  assert.equal(runtime.isTechnicalRagQuery(query), false);
  const { turn, knowledge } = await prepare(runtime, query);
  assert.equal(turn.directResponse, null);
  assert.ok(turn.diagnostics.retrievedChunkIds.includes('curated-lightning-splicing'));
  assert.ok(knowledge.diagnostics.some((d: { tier: string }) => d.tier === 'primary'));
  assert.equal(knowledge.diagnostics.length, 2);
  assert.ok((knowledge.ragContext?.length ?? 0) + (knowledge.learnContext?.length ?? 0) <= 6000);
});

test('first local introduction still uses one primary after loading', async () => {
  const runtime = await freshRuntime('cold-introduction');
  assert.deepEqual(runtime.getRegisteredPacks(), []);
  const { turn, knowledge } = await prepare(runtime, 'C’est quoi Lightning ?');
  assert.equal(turn.directResponse, null);
  assert.deepEqual(turn.diagnostics.retrievedChunkIds, ['curated-lightning-network']);
  assert.equal(knowledge.diagnostics[0].tier, 'primary');
});

test('a cold live-wallet request is rejected before retrieval or corpus loading', async () => {
  const runtime = await freshRuntime('cold-wallet-guard');
  const { turn, knowledge } = await prepare(runtime, 'Quel est mon solde ?');
  assert.ok(turn.directResponse);
  assert.equal(knowledge, null);
  assert.deepEqual(runtime.getRegisteredPacks(), []);
});
