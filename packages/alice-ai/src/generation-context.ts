import type { LearnSource } from './learn-context';
import type { Message } from './llm';
import type { RagTurnContext } from './rag';

/*
 * How much of the conversation goes back to the model on every turn.
 *
 * Every backend receives the real alternating user/assistant history: the
 * APIs are stateless, and the model is trained on prior turns in their own
 * roles. Private Cloud is no exception since 2026-10-29: the Venice enclave
 * decrypts an encrypted `assistant` turn exactly like a `user` turn (verified
 * against the production proxy, HTTP 200 with the prior turn used by the
 * model, HTTP 400 for the same turn in clear), so the earlier single-shot
 * design, which re-encoded only the last exchange as a user-role transcript
 * and lost anything older, is gone. Private Cloud forgot a name given 2 turns
 * earlier and read a lone first name as the user's own.
 *
 * The window is a character budget, never a fixed number of turns: one long
 * answer must not push the request past the context, and short exchanges
 * should all fit. 96 000 characters is roughly 24 000 tokens, a fraction of
 * the cloud model's 128K context, leaving room for the system prompt, the
 * retrieved notes and the answer. Hex-encoded ciphertext doubles the bytes,
 * so a window filled to the brim sits close to the proxy's 256 KiB limit on
 * a free-plan request; in an ordinary conversation the message cap applies
 * long before that, 20 exchanges of about 900 characters make 18 000
 * characters, about 4 500 tokens. Downstream, the Private Cloud client
 * measures the exact encrypted size and drops the oldest turns beyond a
 * 252 KiB byte cap (venice-e2ee-request-budget.ts). The cap stays under the proxy's limit of
 * 64 messages per request. The local backend fits the result again against
 * its own, far smaller, context (local-context-budget.ts).
 */
export const CONVERSATION_WINDOW_MAX_CHARS = 96_000;
export const CONVERSATION_WINDOW_MAX_MESSAGES = 40;

/**
 * The most recent turns that fit the window, the latest message always
 * included. Older turns are dropped whole, and the kept history starts on a
 * user turn so the model never opens on an orphaned reply.
 */
export function windowConversationHistory(
  history: Message[],
  maxChars = CONVERSATION_WINDOW_MAX_CHARS,
  maxMessages = CONVERSATION_WINDOW_MAX_MESSAGES,
): Message[] {
  const latest = history.at(-1);
  if (!latest) return [];
  let start = history.length - 1;
  let chars = latest.content.length;
  while (start > 0) {
    const candidate = history[start - 1];
    if (history.length - (start - 1) > maxMessages) break;
    if (chars + candidate.content.length > maxChars) break;
    chars += candidate.content.length;
    start -= 1;
  }
  while (start < history.length - 1 && history[start].role !== 'user') start += 1;
  return history.slice(start);
}

/** The instruction that heads a Learn excerpt, naming its authors and licences. */
export function learnExcerptNotice(sources: LearnSource[] | undefined): string {
  const attributions = [...new Set((sources ?? []).map(source => source.attribution))];
  const origin = attributions.length > 0
    ? `Learn excerpt${(sources?.length ?? 0) > 1 ? 's' : ''}, quoted from ${attributions.join(' and ')}`
    : 'Course excerpt, Plan B Academy, CC BY-SA 4.0';
  return `${origin}. Ground your answer in it when relevant, and end with one short sentence saying which source helped, named exactly as labelled here, never a course code or a term you were not given; the user can open each source in the Learn section.`;
}

export function composeGenerationHistory(
  history: Message[],
  context: RagTurnContext,
  pedagogicalContext: string,
  memoryContext = '',
  memoryCaptureInstruction = '',
  turnDirective = '',
  answerRules = '',
): Message[] {
  const outboundHistory = windowConversationHistory(history);
  const latest = outboundHistory.at(-1);
  if (!latest || latest.role !== 'user') return [...history];

  const internalContext = [
    context.ragContext ? `[Retrieved knowledge]\n${context.ragContext}` : null,
    // Learn text is someone else's teaching material, quoted with its source:
    // Alice explains it and says where it comes from, she never claims it as
    // hers. The reply also shows the sources with a way to open them, so the
    // sentence asked for here is the voice, not the only attribution.
    context.learnContext
      ? `[${learnExcerptNotice(context.learnSources)}]\n${context.learnContext}`
      : null,
    context.localContext ? `[Device-local summary]\n${context.localContext}` : null,
    pedagogicalContext ? `[Pedagogical context]\n${pedagogicalContext}` : null,
    memoryContext ? `[Personal memory]\n${memoryContext}` : null,
    memoryCaptureInstruction ? `[Private memory protocol]\n${memoryCaptureInstruction}` : null,
    turnDirective ? `[Current turn intent]\n${turnDirective}` : null,
    // Mandatory points and ruled-out claims of the retrieved notes
    // (answer-rules.ts); the block carries its own header.
    answerRules || null,
  ].filter(Boolean).join('\n\n');

  if (!internalContext) return outboundHistory;
  return [
    ...outboundHistory.slice(0, -1),
    { role: 'system', content: internalContext },
    latest,
  ];
}
