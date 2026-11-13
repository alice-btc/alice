import { utxoArithmeticEvidence } from './utxo-arithmetic.ts';
import { coinbaseArithmeticAntecedent, coinbaseArithmeticEvidence } from './coinbase-arithmetic.ts';
import { withSelectedFeePreference, selectedMemoryExplanation } from './selected-memory-answer.ts';
import { feeCalculation, hasFeeCalculationParameters } from './fee-calculation.ts';
import { groundedExplanation } from './grounded-explanations.ts';
import { pendingLightningPayment } from './pending-lightning-payment.ts';
import { groundedRecoveryConfirmations } from './grounded-recovery-confirmations.ts';
import { groundedRbfRecipient } from './grounded-rbf-recipient.ts';
import { isUnconfirmedReceiptReplacementQuestion } from './retrieval-topic-cues.ts';
import { groundedLightningLiquidity, onchainLightningInvoiceExplanation } from './grounded-lightning-liquidity.ts';
import type { AIBackendType } from './ai-backend.ts';
import { answerRuleNoteIdsIn, answerRuleNoteIdsOnSubject, answerRulesBlock } from './answer-rules.ts';
import { aliceMemoryRefusalMessage, type AliceMemory, type AliceMemoryCandidate, type AliceMemoryWrite } from './alice-memory-core.ts';
import { composeGenerationHistory } from './generation-context.ts';
import type { LanguageDecisionSource, SupportedLanguage } from './language-policy.ts';
import type { Message } from './llm.ts';
import { inferPedagogicalConcepts, type PedagogicalProfile } from './pedagogical-profile-core.ts';
import { rewriteRetrievalQuery } from './rag-query-rewrite.ts';
import type { RagTurnContext, RagTimingMs, SemanticSearchUse } from './rag.ts';
import {
  directPersonalAcknowledgement,
  directDisabledPersonalContextResponse,
  directRequestedNoteResponse,
  directWalletActionResponse,
  directWalletStateResponse,
  planAliceTurn,
  turnResponseDirective,
  type AliceTurnPlan,
} from './turn-planner.ts';
import { liveNetworkValueResponse } from './live-network-request.ts';
import { directWalletTroubleshootingResponse } from './wallet-troubleshooting.ts';

import type { LearnSource } from './learn-context';

/** How the answer language was chosen. Never carries text from the turn. */
export type TurnLanguageDiagnostics = {
  target: SupportedLanguage;
  source: LanguageDecisionSource;
  /** Generations needed to get an answer in the target language; 0 before generating. */
  attempts: number;
};

export type TurnPreparationDiagnostics = {
  kind: AliceTurnPlan['kind'];
  requestedCapability: AliceTurnPlan['requestedCapability'];
  retrieval: 'none' | 'lexical-or-semantic';
  retrievedChunkIds: string[];
  /** Rule notes (answer-rules.ts) present in the retrieved text of this turn. */
  answerRuleNoteIds: string[];
  /** Learn material quoted in this turn's context: the answer names it and
      the reply shows a way to open it. */
  learnSources?: LearnSource[];
  ragTimingMs?: RagTimingMs;
  /** Whether the semantic model ranked this turn's retrieval (rag.ts). */
  semanticSearch?: SemanticSearchUse;
  language?: TurnLanguageDiagnostics;
  phaseMs: {
    plan: number;
    rewrite: number;
    compose: number;
    pedagogy: number;
    retrieval: number;
    memory: number;
    total: number;
  };
};

export type PreparedAliceTurn = {
  history: Message[];
  plan: AliceTurnPlan;
  /** Shown as the answer, without a generation: a refusal, a capability
      limit, an acknowledgement or, on a local or custom model, the checked
      text of a LOCAL_FIXED_TEXT subject. */
  directResponse: string | null;
  /** Checked facts on the subject of the question, given to the model with
      the retrieved notes. The model still writes the answer. */
  verifiedReference?: { id: VerifiedReferenceId; text: string } | null;
  diagnostics: TurnPreparationDiagnostics;
  explicitMemoryCandidates: AliceMemoryCandidate[];
};

export type VerifiedReferenceId =
  | 'pending-lightning-payment' | 'fee-calculation' | 'recovery-confirmations'
  | 'rbf-recipient' | 'unconfirmed-receipt' | 'lightning-liquidity' | 'onchain-lightning-invoice'
  | 'selected-memory' | 'grounded-explanation';

/**
 * The checked text rides with the context under its own header. The model is
 * asked to answer the question that was put, because the text was written
 * for a subject, and a neighbouring question on that subject is not answered
 * by reciting it.
 */
export function verifiedReferenceBlock(text: string): string {
  return `[Verified reference on this subject]\n${text}\n\nThe reference above was checked against primary sources. Answer the user's actual question in your own words and in the answer language. Use the facts that bear on the question, leave out the rest, add nothing that contradicts them, and do not mention that a reference was provided.`;
}

/**
 * Subjects on which the on-device model contradicted the reference it was
 * given (measured on 2026-11-12, Qwen3.5 4B: a pending Lightning payment was
 * said to have "probably already arrived"). On a local or custom model the
 * checked text is displayed instead of generating; Private Cloud keeps the
 * reference and writes its own answer. The recipient of an unconfirmed
 * payment is here as well: with the reference the model answered "yes" in
 * both languages, but in French it added that a replacement leaves amounts
 * and addresses unchanged, and a merchant acts on that answer. Remove an
 * entry once a measurement on unseen questions shows the model holds the
 * subject.
 */
const LOCAL_FIXED_TEXT: ReadonlySet<VerifiedReferenceId> = new Set(['pending-lightning-payment', 'unconfirmed-receipt']);

export type TurnPreparationServices = {
  recordPedagogicalSignal(message: string): Promise<PedagogicalProfile>;
  retrieveKnowledge(query: string): Promise<RagTurnContext>;
  getMemory(): Promise<AliceMemory>;
  rememberMemoryCandidates(candidates: AliceMemoryCandidate[]): Promise<AliceMemoryWrite>;
  pedagogicalContext(profile: PedagogicalProfile, message: string, language: SupportedLanguage): string;
  memoryContext(memory: AliceMemory, userMessage: string): string;
  memoryCaptureInstruction: string;
};

function now(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function rounded(value: number): number {
  return Math.max(0, Math.round(value * 10) / 10);
}

async function measured<T>(run: () => Promise<T>): Promise<{ value: T; durationMs: number }> {
  const started = now();
  const value = await run();
  return { value, durationMs: rounded(now() - started) };
}

export async function prepareAliceTurn(input: {
  history: Message[];
  userMessage: string;
  backendType: AIBackendType;
  targetLanguage: SupportedLanguage;
  /** How targetLanguage was chosen, reported in the diagnostics. */
  languageSource?: LanguageDecisionSource;
}, services: TurnPreparationServices): Promise<PreparedAliceTurn> {
  const started = now();
  const language = input.languageSource
    ? { language: { target: input.targetLanguage, source: input.languageSource, attempts: 0 } }
    : {};
  const planStarted = now();
  const plan = planAliceTurn(input.userMessage);
  const planMs = rounded(now() - planStarted);

  // No live wallet-state or payment-execution tool is wired into chat.
  // Explicit payment-execution requests are guarded alongside asks for
  // the user's actual balance, holdings or transaction history. They never
  // reach RAG or the model, which could fabricate amounts or actions; answers
  // are deterministic, before the rewrite below can pull a retrievable
  // topic back in from history (e.g. a guarded follow-up after a technical
  // discussion). A matched wallet request + educational message is also fully
  // short-circuited: the bounded response wins and the educational part goes
  // unanswered, a known limitation of this guard.
  if (plan.walletStateReason || plan.walletActionReason || plan.walletTroubleshootingReason || plan.liveNetworkReason) {
    return {
      history: input.history,
      plan,
      directResponse: plan.walletActionReason
        ? directWalletActionResponse(input.targetLanguage, plan.walletActionReason === 'share-secret')
        : plan.walletStateReason
          ? directWalletStateResponse(input.targetLanguage, plan.walletStateReason)
          : plan.walletTroubleshootingReason
            ? directWalletTroubleshootingResponse(plan.walletTroubleshootingReason, input.targetLanguage)
            : liveNetworkValueResponse(plan.liveNetworkReason!, input.targetLanguage),
      explicitMemoryCandidates: [],
      diagnostics: {
        kind: plan.kind,
        requestedCapability: plan.requestedCapability,
        retrieval: 'none',
        retrievedChunkIds: [],
        answerRuleNoteIds: [],
        ...language,
        phaseMs: {
          plan: planMs,
          rewrite: 0,
          compose: 0,
          pedagogy: 0,
          retrieval: 0,
          memory: 0,
          total: rounded(now() - started),
        },
      },
    };
  }

  // "Retiens que …" / "Remember that …" alone is the whole turn. A sentence
  // the filters refuse gets the reason back and is never written; an accepted
  // one is written first and confirmed only from a successful write. The
  // learning signal is recorded as on the usual path, so "souviens-toi que je
  // débute avec Lightning" still updates the profile. A request followed by a
  // question is not handled here: it takes the usual path below, the note
  // riding along as an explicit candidate.
  if (plan.requestedNote?.standalone) {
    const note = plan.requestedNote;
    const pedagogy = await measured(() => services.recordPedagogicalSignal(input.userMessage));
    const remembered = note.refusal
      ? null
      : await measured(() => services.rememberMemoryCandidates(plan.explicitMemoryCandidates));
    return {
      history: input.history,
      plan,
      directResponse: note.refusal
        ? aliceMemoryRefusalMessage(note.refusal, input.targetLanguage)
        : directRequestedNoteResponse(remembered!.value, note.text, input.targetLanguage),
      explicitMemoryCandidates: plan.explicitMemoryCandidates,
      diagnostics: {
        kind: plan.kind,
        requestedCapability: plan.requestedCapability,
        retrieval: 'none',
        retrievedChunkIds: [],
        answerRuleNoteIds: [],
        ...language,
        phaseMs: {
          plan: planMs,
          rewrite: 0,
          compose: 0,
          pedagogy: pedagogy.durationMs,
          retrieval: 0,
          memory: remembered?.durationMs ?? 0,
          total: rounded(now() - started),
        },
      },
    };
  }

  // A follow-up such as "Pourquoi ?" or "Développe" cannot be retrieved on its
  // own. The query, and only the query, is rewritten from the recent in-memory
  // history; the user message below stays raw (rag-query-rewrite.ts).
  const rewriteStarted = now();
  const retrievalQuery = rewriteRetrievalQuery({
    history: input.history,
    userMessage: input.userMessage,
    plan,
  });

  const rewriteMs = rounded(now() - rewriteStarted);

  const [pedagogy, retrieval, memory] = await Promise.all([
    measured(() => services.recordPedagogicalSignal(input.userMessage)),
    measured(() => retrievalQuery
      ? services.retrieveKnowledge(retrievalQuery)
      : Promise.resolve<RagTurnContext>({ ragContext: null, localContext: null, learnContext: null, diagnostics: [] })),
    measured(async () => plan.explicitMemoryCandidates.length > 0
      ? (await services.rememberMemoryCandidates(plan.explicitMemoryCandidates)).memory
      : services.getMemory()),
  ]);

  // The pedagogical context is keyed on concepts inferred from the message.
  // A follow-up like "so how do I actually do it?" carries no keywords, and a
  // profile that only speaks when the current sentence names a topic goes
  // silent exactly when continuity matters. When the message infers nothing,
  // fall back to the concepts of the recent user turns; the definition-question
  // heuristic still reads the real message, never the stitched history.
  const composeStarted = now();
  const recentUserTurns = input.history
    .filter(message => message.role === 'user')
    .slice(-3)
    .map(message => message.content)
    .concat(input.userMessage)
    .join('\n');
  // The notes that carry answer rules are read from the retrieved text the
  // model will see, so a note dropped by the context fit brings no rule, and
  // a rule about a subject the user has not raised stays out.
  const answerRuleNoteIds = answerRuleNoteIdsOnSubject(answerRuleNoteIdsIn(retrieval.value.ragContext ?? ''), recentUserTurns);
  const conceptSource = inferPedagogicalConcepts(input.userMessage).length > 0 ? input.userMessage : recentUserTurns;

  const selectedMemoryContext = services.memoryContext(memory.value, input.userMessage);
  const previousUserTurns = input.history.filter(message => message.role === 'user');
  if (previousUserTurns.at(-1)?.content === input.userMessage) previousUserTurns.pop();
  const disabledMemoryResponse = !memory.value.enabled && plan.asksAboutUserMemory && previousUserTurns.length === 0
    ? directDisabledPersonalContextResponse(input.userMessage, input.targetLanguage)
    : null;
  // Checked facts on the subject of the question go to the model as a
  // reference: displayed as the answer, a text written for one question would
  // also be served to its neighbours. The LOCAL_FIXED_TEXT subjects are the
  // exception, on a local or custom model.
  const ragText = retrieval.value.ragContext ?? '';
  const referenceSources: Array<[VerifiedReferenceId, () => string | null]> = plan.kind === 'question' && !plan.asksAboutUserMemory && !disabledMemoryResponse
    ? [
      ['pending-lightning-payment', () => pendingLightningPayment(input.userMessage, input.targetLanguage, ragText, input.history)],
      ['fee-calculation', () => feeCalculation(input.userMessage, input.targetLanguage, input.history)],
      ...(hasFeeCalculationParameters(input.userMessage) ? [] : [
        ['recovery-confirmations', () => groundedRecoveryConfirmations(input.userMessage, input.targetLanguage, ragText, input.history)],
        [isUnconfirmedReceiptReplacementQuestion(input.userMessage) ? 'unconfirmed-receipt' : 'rbf-recipient', () => groundedRbfRecipient(input.userMessage, input.targetLanguage, ragText, input.history)],
        ['lightning-liquidity', () => groundedLightningLiquidity(input.userMessage, input.targetLanguage, ragText, input.history)],
        ['onchain-lightning-invoice', () => onchainLightningInvoiceExplanation(input.userMessage, input.targetLanguage, ragText)],
        ['selected-memory', () => selectedMemoryExplanation(input.userMessage, input.targetLanguage, selectedMemoryContext, memory.value.enabled, ragText)],
        ['grounded-explanation', () => groundedExplanation(input.userMessage, input.targetLanguage, ragText, input.history)],
      ] as Array<[VerifiedReferenceId, () => string | null]>),
    ]
    : [];
  let verifiedReference: { id: VerifiedReferenceId; text: string } | null = null;
  for (const [id, read] of referenceSources) {
    const text = read();
    if (!text) continue;
    verifiedReference = {
      id,
      text: withSelectedFeePreference(text, input.userMessage, input.targetLanguage, selectedMemoryContext, memory.value.enabled) ?? text,
    };
    break;
  }
  const onDevice = input.backendType === 'local' || input.backendType === 'custom';
  const fixedOnDevice = onDevice && verifiedReference !== null && LOCAL_FIXED_TEXT.has(verifiedReference.id);
  const arithmeticEvidence = onDevice
    ? [coinbaseArithmeticEvidence(input.userMessage, input.targetLanguage, answerRuleNoteIds, coinbaseArithmeticAntecedent(previousUserTurns.map(turn => turn.content))), utxoArithmeticEvidence(input.userMessage, input.targetLanguage, answerRuleNoteIds, previousUserTurns.at(-1)?.content ?? '')].filter(Boolean).join('\n\n')
    : '';
  const history = composeGenerationHistory(
    input.history,
    retrieval.value,
    plan.kind === 'personal-statement' || plan.asksAboutUserMemory
      ? ''
      : services.pedagogicalContext(pedagogy.value, conceptSource, input.targetLanguage),
    // Memory rides on every backend since 2026-08-20. It used to be injected
    // on the local model only, while the capture instruction still went to the
    // cloud: Alice was asked to extract memories there that she would never be
    // shown again, which is why cloud answers read as if she had learned
    // nothing. The items were extracted from conversations that already
    // transit the same end-to-end encrypted enclave, so showing them back
    // adds no exposure a cloud conversation had not already accepted; they
    // remain on-device, inspectable and erasable in "What Alice knows".
    selectedMemoryContext,
    memory.value.enabled ? services.memoryCaptureInstruction : '',
    turnResponseDirective(plan, input.targetLanguage),
    [
      answerRulesBlock(answerRuleNoteIds, input.targetLanguage, undefined, input.userMessage),
      arithmeticEvidence,
      verifiedReference && !fixedOnDevice ? verifiedReferenceBlock(verifiedReference.text) : '',
    ].filter(Boolean).join('\n\n'),
  );

  return {
    history,
    plan,
    directResponse: disabledMemoryResponse
      ?? (plan.kind === 'personal-statement' ? directPersonalAcknowledgement(input.targetLanguage) : null)
      ?? (fixedOnDevice ? verifiedReference!.text : null),
    verifiedReference,
    explicitMemoryCandidates: plan.explicitMemoryCandidates,
    diagnostics: {
      kind: plan.kind,
      requestedCapability: plan.requestedCapability,
      retrieval: retrievalQuery ? 'lexical-or-semantic' : 'none',
      retrievedChunkIds: retrieval.value.diagnostics?.map(chunk => chunk.id) ?? [],
      answerRuleNoteIds,
      ...(retrieval.value.learnSources && retrieval.value.learnSources.length > 0 ? { learnSources: retrieval.value.learnSources } : {}),
      ...(retrieval.value.timingMs ? { ragTimingMs: retrieval.value.timingMs } : {}),
      ...(retrieval.value.semanticSearch ? { semanticSearch: retrieval.value.semanticSearch } : {}),
      ...language,
      phaseMs: {
        plan: planMs,
        rewrite: rewriteMs,
        compose: rounded(now() - composeStarted),
        pedagogy: pedagogy.durationMs,
        retrieval: retrieval.durationMs,
        memory: memory.durationMs,
        total: rounded(now() - started),
      },
    },
  };
}
