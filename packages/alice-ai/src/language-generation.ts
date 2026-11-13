import { coinbaseArithmeticAntecedent } from './coinbase-arithmetic.ts';
import type { AIBackend } from './ai-backend';
import type { Message } from './llm';
import { generateWithContinuation, type GenerationOutcome } from './generate-with-continuation.ts';
import { parseAliceMemoryResponse, type AliceMemoryCandidate } from './alice-memory-core.ts';
import { groundedModelMemoryCandidates } from './alice-memory-capture.ts';
import { withLiveValueCaveat } from './live-value-caveat.ts';
import { answerRepairHistory, ANSWER_REPAIR_FAILURE } from './answer-repair.ts';
import { answerRuleNoteIdsInMessages, answerRuleNoteIdsOnSubject, answerRuleViolationsIn, withAnswerRuleCorrections } from './answer-rules.ts';
import {
  detectTextLanguage,
  isResponseLanguageAcceptable,
  localizedLanguageFailure,
  type SupportedLanguage,
} from './language-policy.ts';

const MEMORY_MARKER = '<alice_memory>';
const LANGUAGE_GATE_CHARACTERS = 96;
/** Generations tried before WrongResponseLanguageError. */
export const LANGUAGE_CHECKED_ATTEMPTS = 2;
/**
 * Sampling ceiling for an answer grounded in retrieved notes, on on-device
 * and custom backends. At the balanced preset (0.7) the 4B model contradicted
 * rules it had in its prompt (2 evaluation runs of 2026-11-06);
 * 0.3 is the fast preset's own temperature.
 */
export const GROUNDED_TEMPERATURE_CAP = 0.3;
const RETRY_TEMPERATURE = 0.1;
const RETRIEVED_KNOWLEDGE_HEADER = '[Retrieved knowledge]';

function now(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

/**
 * The model writes private memory metadata at the end of its answer. Hold only
 * a possible partial marker, so visible text can stream without ever flashing
 * protocol output when the marker is split across network chunks.
 */
export function visibleStreamingText(text: string): string {
  const lower = text.toLowerCase();
  const markerStart = lower.indexOf(MEMORY_MARKER);
  if (markerStart >= 0) return text.slice(0, markerStart).trimEnd();
  for (let length = MEMORY_MARKER.length - 1; length > 0; length -= 1) {
    if (lower.endsWith(MEMORY_MARKER.slice(0, length))) {
      return text.slice(0, -length).trimEnd();
    }
  }
  return text;
}

export class WrongResponseLanguageError extends Error {
  readonly targetLanguage: SupportedLanguage;

  constructor(targetLanguage: SupportedLanguage) {
    super(localizedLanguageFailure(targetLanguage));
    this.name = 'WrongResponseLanguageError';
    this.targetLanguage = targetLanguage;
  }
}

export async function generateLanguageChecked(input: {
  backend: AIBackend;
  history: Message[];
  allowContinuation: boolean;
  targetLanguage: SupportedLanguage;
  requestId?: string;
  onText?: (visibleText: string) => void;
}): Promise<GenerationOutcome & {
  memoryCandidates: AliceMemoryCandidate[];
  attempts: number;
  firstDisplayMs?: number;
  /** Never-claim checks (answer-rules.ts) whose correction was appended. */
  answerRuleCorrections: string[];
  /** Checks that fired on a first answer which was then generated again. */
  answerRuleRetry?: string[];
  /** Detected violations whose draft was withheld after bounded repair. */
  answerRuleFailure?: string[];
}> {
  const started = now();
  // The rule notes are read from the system turns actually sent, kept only
  // when the user's recent turns name their subject, and the question lets a
  // check defer to what the user stated (a threshold).
  const userTurns = input.history.filter(message => message.role === 'user').map(message => message.content);
  const answerRuleNoteIds = answerRuleNoteIdsOnSubject(answerRuleNoteIdsInMessages(input.history), userTurns.slice(-4).join('\n'));
  const question = userTurns.at(-1) ?? '';
  const previousUserQuestion = coinbaseArithmeticAntecedent(userTurns.slice(0, -1));
  // A turn grounded in retrieved notes is sampled more conservatively, and a
  // first answer that contradicts a never-claim rule is generated once more
  // with targeted feedback before it is displayed. Private Cloud keeps
  // its preset and its appended corrections: it is billed per generation and
  // was not part of these measurements.
  const grounded = input.history.some(message => message.role !== 'assistant' && message.content.includes(RETRIEVED_KNOWLEDGE_HEADER));
  const ruleRetryAllowed = input.backend.type !== 'cloud';
  let firstDisplayMs: number | undefined;
  let retry: 'language' | 'rules' | null = null;
  let ruleRetry: { result: GenerationOutcome; applied: string[] } | null = null;
  let generationHistory = input.history;
  let requiredAnswerRepairContext: string | undefined;
  // Always-on capability checks also apply without retrieved notes. Local
  // and custom drafts must pass these checks before any text is displayed.
  const holdForChecks = ruleRetryAllowed;
  for (let attempt = 0; attempt < LANGUAGE_CHECKED_ATTEMPTS; attempt += 1) {
    let released = false;
    const streamVisible = (fullText: string) => {
      if (!input.onText || holdForChecks || ruleRetry) return;
      const visible = visibleStreamingText(fullText);
      if (!visible) return;
      if (!released) {
        const detected = detectTextLanguage(visible);
        if (detected && detected.language !== input.targetLanguage) return;
        if (!detected && visible.length < LANGUAGE_GATE_CHARACTERS) return;
        released = true;
        firstDisplayMs ??= now() - started;
      }
      input.onText(visible);
    };
    let result: GenerationOutcome;
    try {
      result = await generateWithContinuation(
        input.backend,
        generationHistory,
        input.allowContinuation,
        streamVisible,
        {
          responseLanguage: input.targetLanguage,
          requestId: input.requestId,
          strictLanguageRetry: retry === 'language',
          temperatureOverride: retry ? RETRY_TEMPERATURE : undefined,
          temperatureCap: grounded ? GROUNDED_TEMPERATURE_CAP : undefined,
          ...(requiredAnswerRepairContext ? { requiredAnswerRepairContext } : {}),
        },
      );
    } catch (error) {
      if (!ruleRetry || error instanceof Error && error.name === 'AbortError') throw error;
      return failure(ruleRetry.result, attempt + 1, ruleRetry.applied);
    }
    const parsed = parseAliceMemoryResponse(result.text);
    if (isResponseLanguageAcceptable(parsed.visibleText, input.targetLanguage)) {
      // Output guard: a claim the retrieved note rules out gets a correction
      // (Private Cloud) or a second generation (local, custom).
      const corrected = withAnswerRuleCorrections(parsed.visibleText, input.targetLanguage, answerRuleNoteIds, question, previousUserQuestion);
      const violations = ruleRetryAllowed ? answerRuleViolationsIn(parsed.visibleText, answerRuleNoteIds, question, previousUserQuestion) : [];
      if (violations.length > 0) {
        if (retry === null && attempt + 1 < LANGUAGE_CHECKED_ATTEMPTS) {
          const repaired = answerRepairHistory(input.history, violations, input.targetLanguage, answerRuleNoteIds);
          const repairContext = repaired?.find(message => message.role === 'system' && !input.history.includes(message))?.content;
          if (repaired && repairContext) {
            requiredAnswerRepairContext = repairContext;
            ruleRetry = { result, applied: violations };
            generationHistory = repaired;
            retry = 'rules';
            if (released) input.onText?.('');
            continue;
          }
        }
        return failure(result, attempt + 1, violations);
      }
      // A truncated repair is not an accepted correction of a rejected draft.
      if (ruleRetry && (result.truncated || !parsed.visibleText.trim())) {
        return failure(result, attempt + 1, ruleRetry.applied);
      }
      return finish(result, corrected.text, parsed.visibleText, parsed.candidates, attempt + 1, corrected.applied, released);
    }
    if (ruleRetry) return failure(result, attempt + 1, ruleRetry.applied);
    retry = 'language';
  }

  throw new WrongResponseLanguageError(input.targetLanguage);

  function failure(result: GenerationOutcome, attempts: number, ids: string[]) {
    const failed = [...new Set([...(ruleRetry?.applied ?? []), ...ids])];
    return {
      ...finish({ ...result, truncated: false }, ANSWER_REPAIR_FAILURE[input.targetLanguage], '', [], attempts, [], false),
      answerRuleFailure: failed,
    };
  }

  function finish(
    result: GenerationOutcome,
    correctedText: string,
    streamedText: string,
    candidates: AliceMemoryCandidate[],
    attempts: number,
    applied: string[],
    released: boolean,
  ) {
    // Output guard: a present-tense network figure or state is invented,
    // since no such feed exists; the caveat rides with the final text on
    // every backend, streamed or buffered.
    const visibleText = withLiveValueCaveat(correctedText, input.targetLanguage);
    if (input.onText && visibleText && (!released || visibleText !== streamedText)) {
      firstDisplayMs ??= now() - started;
      input.onText(visibleText);
    }
    return {
      ...result,
      text: visibleText,
      memoryCandidates: groundedModelMemoryCandidates(candidates, question),
      attempts,
      firstDisplayMs,
      answerRuleCorrections: applied,
      ...(ruleRetry ? { answerRuleRetry: ruleRetry.applied } : {}),
    };
  }
}
