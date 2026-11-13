import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';
import { prepareAliceTurn } from './turn-engine.ts';
import { createAliceMemory } from './alice-memory-core.ts';
import { createPedagogicalProfile } from './pedagogical-profile-core.ts';
import type { Message } from './llm.ts';
import type { SupportedLanguage } from './languages.ts';

// This checks production retrieval and routing, not the quality of an LLM.
// Generated answers are not checked here.
const fixture = JSON.parse(readFileSync(new URL('../../../scripts/data/memory-relevance/free-response-cases-2026-11-06.json', import.meta.url), 'utf8'));
const runtime = await loadRagEvaluationRuntime(`export { loadRagCorpus, buildRagTurnContext } from './packages/alice-ai/src/rag.ts';`, { evaluationPreferences: {} });
await runtime.loadRagCorpus();
const ids = new Set(['fr-bip39-passphrase-recovery', 'fr-confirmations-reorg', 'fr-lightning-directional-liquidity', 'fr-recipient-cpfp-rbf', 'en-live-price-then-network-switch']);

for (const backendType of ['local', 'custom'] as const) {
  test(`${backendType}: verified explanations require actual production sources across user follow-ups`, async () => {
    for (const conversation of fixture.conversations.filter((entry: { id: string }) => ids.has(entry.id))) {
      const history: Message[] = [];
      for (let index = 0; index < conversation.turns.length; index++) {
        const question = conversation.turns[index].question;
        const targetLanguage = conversation.language as SupportedLanguage;
        const result = await prepareAliceTurn({ history, userMessage: question, targetLanguage, backendType }, {
          recordPedagogicalSignal: async () => createPedagogicalProfile(),
          getMemory: async () => ({ ...createAliceMemory(), enabled: false }),
          rememberMemoryCandidates: async () => ({ memory: createAliceMemory(), saved: false }),
          memoryContext: () => '', memoryCaptureInstruction: '', pedagogicalContext: () => '',
          retrieveKnowledge: query => runtime.buildRagTurnContext(query, undefined, { maxChunks: backendType === 'local' ? 1 : 3, targetLanguage, maxContextChars: 6000 }),
        });
        const label = `${conversation.id} turn ${index + 1}`;
        if (conversation.id === 'fr-recipient-cpfp-rbf' && index === 0) {
          assert.equal(result.directResponse, null, `${label}: ordinary CPFP explanation remains generated`);
          assert.equal(result.verifiedReference, null, `${label}: no reference for an ordinary CPFP explanation`);
        } else if (conversation.id === 'en-live-price-then-network-switch' && index === 0) {
          assert.ok(result.directResponse?.trim(), `${label}: a live price stays a fixed capability answer`);
        } else {
          assert.equal(result.directResponse, null, `${label}: an explanation is generated`);
          assert.ok(result.verifiedReference?.text.trim(), `${label}: checked reference missing`);
          assert.ok(result.diagnostics.retrievedChunkIds.length > 0, `${label}: missing source`);
        }
        history.push({ role: 'user', content: question }, { role: 'assistant', content: result.directResponse ?? 'Synthetic unit-test answer: not evidence for the next question.' });
      }
    }
  });
}
