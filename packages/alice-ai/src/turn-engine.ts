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

import { tutorialChoicesIn, type LearnSource } from './learn-context.ts';

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
 * A question that no checked note, Learn excerpt or reference speaks to is
 * answered from the model's own recall, where menu names and procedures of a
 * product are the first thing it gets wrong. The model is told, and asked to
 * tell the reader.
 */
export function unsourcedAnswerBlock(): string {
  return `[No checked source on this question]\nAlice's checked notes and the Learn library returned nothing on this question, so the answer can only come from general recall. Open the answer with one short sentence, in the answer language, saying that it is given from memory, without a checked source, and may be inexact or out of date. For a named product or tool, do not present menu names, button labels, settings, version numbers or step-by-step procedures as established: describe the general approach and send the reader to the tool's official documentation. For a greeting, small talk or a question unrelated to Bitcoin, money, security or a tool, ignore this block.`;
}

/**
 * A turn whose Learn excerpt quotes a tutorial's walkthrough (the provider
 * says so in the excerpt, turn-context-score.ts) is asked to stay inside it.
 * The excerpt's own heading already says so in English; the on-device model
 * follows the turn's intent line, in the answer language, far better (it
 * invented a PIN length and a step beside the quoted ones on 2026-11-18).
 */
export function walkthroughDirective(learnContext: string | null | undefined, language: 'fr' | 'en'): string {
  if (!learnContext) return '';
  const partial = /^Quoted below, from the start of the walkthrough/m.test(learnContext);
  if (!partial && !/^The walkthrough is quoted below in full/m.test(learnContext)) return '';
  // "All the steps, numbered" and "no title of an unquoted section": asked only
  // to stay inside the excerpt, Private Cloud detailed its first section and
  // listed the tutorial's other headings as empty bullets (2026-11-18).
  if (language === 'fr') {
    return `L'extrait Learn cite ${partial ? 'le début du' : 'le'} pas-à-pas d'un tutoriel. Donne toutes les étapes qu'il contient, dans son ordre, en liste numérotée, à l'impératif et en tutoyant (« vérifie », « ouvre »), avec ses noms de menus, de boutons et ses valeurs. N'ajoute aucune étape, aucun réglage ni aucun chiffre qui n'y figure pas${partial ? ", et n'écris pas les titres des sections qu'il ne cite pas. Termine par 1 phrase qui dit ce que la suite couvre et qu'elle se trouve dans le tutoriel listé sous la réponse." : '.'}`;
  }
  return `The Learn excerpt quotes ${partial ? 'the start of ' : ''}a tutorial's walkthrough. Give every step it contains, in its order, as a numbered list, with its menu names, button labels and values. Add no step, setting or figure that is not in it${partial ? ', and do not write the titles of the sections it does not quote. End with one sentence saying what the rest covers and that it is in the tutorial listed under the reply.' : '.'}`;
}

/**
 * A name the Learn library cannot pin on one thing: several tutorials carry
 * it ("Trezor"), or it is only part of a tutorial's title and a word of its
 * own ("Mint" and "Linux Mint"). The provider says so in the excerpt
 * (turn-context.ts). The turn then asks which one is meant instead of
 * choosing. One short instruction of its own: folded into the instruction for
 * a name on its own as a condition, the on-device model described the brand
 * and asked nothing (2026-11-18).
 */
export function ambiguousNameDirective(learnContext: string | null | undefined, language: 'fr' | 'en'): string {
  if (!learnContext) return '';
  // Numbered sentences: the on-device model follows a shape it can count
  // better than a condition it has to weigh.
  if (tutorialChoicesIn(learnContext).length > 1) {
    return language === 'fr'
      ? "Plusieurs tutoriels portent ce nom. Réponds en 3 phrases au plus. Phrase 1 : la marque ou l'outil que ce nom désigne. Phrase 2, seulement si le contexte fourni donne aussi un autre sens à ce mot : cet autre sens. Dernière phrase : une question courte qui demande lequel intéresse l'utilisateur. Ne cite pas les tutoriels : l'application affiche leur liste juste sous ta question. N'ajoute rien que le contexte fourni ne soutient pas."
      : 'Several tutorials carry this name. Answer in 3 sentences at most. Sentence 1: the brand or tool the name stands for. Sentence 2, only if the provided context also gives the word another meaning: that other meaning. Last sentence: a short question asking which one the user is interested in. Do not name the tutorials: the app shows their list right under your question. Add nothing the provided context does not support.';
  }
  const part = /^The message is only part of this tutorial's name \("([^"\n]{1,80})"(?:, ([^\n]{1,200}?))?\):/m.exec(learnContext);
  if (!part) return '';
  const tutorial = part[2] ? `${part[1]} » (${part[2]})` : `${part[1]} »`;
  return language === 'fr'
    ? `Ce mot est aussi une partie du nom d'un tutoriel. Réponds en 3 phrases. Phrase 1 : ce que ce mot veut dire seul, d'après le contexte fourni. Phrase 2 : il existe aussi le tutoriel « ${tutorial}. Phrase 3 : une question qui demande lequel des 2 intéresse l'utilisateur. N'ajoute rien que le contexte fourni ne soutient pas.`
    : `This word is also part of a tutorial's name. Answer in 3 sentences. Sentence 1: what the word means on its own, from the provided context. Sentence 2: there is also the tutorial "${part[2] ? `${part[1]}" (${part[2]})` : `${part[1]}"`}. Sentence 3: a question asking which of the 2 the user is interested in. Add nothing the provided context does not support.`;
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
  // A follow-up leans on the conversation, and a diagram or image request is
  // not a factual answer: neither is announced as unsourced.
  const unsourced = Boolean(retrievalQuery)
    && (plan.kind === 'question' || plan.kind === 'mixed')
    && plan.requestedCapability === 'text-generation'
    && !plan.needsConversationContext
    && !retrieval.value.ragContext && !retrieval.value.learnContext && !retrieval.value.localContext
    && !verifiedReference && !arithmeticEvidence;
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
    [
      // A name the library cannot pin on one thing is asked about, not described.
      ambiguousNameDirective(retrieval.value.learnContext, input.targetLanguage) || turnResponseDirective(plan, input.targetLanguage),
      walkthroughDirective(retrieval.value.learnContext, input.targetLanguage),
    ].filter(Boolean).join(' '),
    [
      answerRulesBlock(answerRuleNoteIds, input.targetLanguage, undefined, input.userMessage),
      arithmeticEvidence,
      verifiedReference && !fixedOnDevice ? verifiedReferenceBlock(verifiedReference.text) : '',
      unsourced ? unsourcedAnswerBlock() : '',
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
