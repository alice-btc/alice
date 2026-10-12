import type { AIBackendType } from './ai-backend';
import type { ChatStorageCipher } from './chat-storage';
import type { SupportedLanguage } from './language-policy';
import { knowledgeContextCharLimit } from './knowledge-context-budget';
import { ragQueryChunkBudget } from './rag-query-policy';
import { buildRagTurnContext, isTechnicalRagQuery, loadRagCorpus } from './rag';

/** Production adapter used by prepareAliceTurn's retrieveKnowledge service. */
export async function retrieveTurnKnowledge(
  query: string,
  backendType: AIBackendType,
  targetLanguage: SupportedLanguage,
  storageCipher?: ChatStorageCipher,
) {
  // Budget classification is synchronous and depends on the loaded corpus.
  // On the first turn, classify only after loading; otherwise an empty index
  // would shrink a targeted secondary request to the one-note local budget.
  const started = globalThis.performance?.now?.() ?? Date.now();
  await loadRagCorpus();
  const corpusMs = Math.max(0, (globalThis.performance?.now?.() ?? Date.now()) - started);
  const isLocal = backendType === 'local';
  const result = await buildRagTurnContext(query, storageCipher, {
    maxChunks: ragQueryChunkBudget(query, isLocal, () => isTechnicalRagQuery(query)),
    maxContextChars: knowledgeContextCharLimit(isLocal),
    targetLanguage,
  });
  return { ...result, timingMs: result.timingMs ? { ...result.timingMs,
    corpus: result.timingMs.corpus + corpusMs, total: result.timingMs.total + corpusMs,
  } : undefined };
}
