import type { Message } from './llm';
import type { SupportedLanguage } from './languages.ts';
import { ANSWER_RULES, answerRuleNoteIdsInMessages, answerRuleRepairGuidance } from './answer-rules.ts';

export const ANSWER_REPAIR_MAX_CHARS = 2400;
export const ANSWER_REPAIR_FAILURE: Record<SupportedLanguage, string> = {
  en: "I couldn't produce a reliable answer to this question from the available information. Try asking it again with more detail.",
  fr: "Je n’ai pas réussi à produire une réponse fiable à cette question à partir des informations disponibles. Tu peux la reformuler avec plus de détails, et je réessaie.",
};

/** Only canonical check guidance enters this instruction, never the rejected
 * draft or user text. The original question and retrieved sources stay intact.
 * Attach it to its source context so context fitting cannot keep the repair
 * while dropping the evidence it names. A large repair fails closed whole. */
export function answerRepairHistory(
  history: Message[], checkIds: readonly string[], language: SupportedLanguage,
  activeNoteIds: readonly string[],
): Message[] | null {
  const guidance = answerRuleRepairGuidance(checkIds, language, activeNoteIds);
  if (guidance.length !== new Set(checkIds).size || guidance.length === 0) return null;
  const sourceIds = new Set(guidance.flatMap(item => item.noteIds));
  const sources = ANSWER_RULES.filter(rule => sourceIds.has(rule.noteId));
  const feedback = [
    '[Answer repair]',
    language === 'fr'
      ? 'Le brouillon précédent contredisait les références ci-dessous. Réponds de nouveau à la question originale en français, avec une réponse complète et cohérente corrigée. Ne conserve pas une affirmation fausse suivie de sa correction. Ne mentionne pas ce contrôle interne. Traite seulement les points demandés. Si un de ces points manque dans les sources, précise cette limite ; n’ajoute pas de question hypothétique ni de conclusion spéculative.'
      : 'The previous draft contradicted the references below. Answer the original question again in English with a complete, coherent corrected answer. Do not retain a false claim followed by its correction. Do not mention this internal check. Address only the requested points. If the sources do not support one of those points, state that specific limitation; do not add a hypothetical question or speculative conclusion.',
    ...sources.map(rule => `Retrieved source: ${rule.noteId} — ${rule.title}`),
    ...guidance.map(item => `Detected error: ${item.id}\nRequired correction: ${item.correction}`),
  ].join('\n');
  if (feedback.length > ANSWER_REPAIR_MAX_CHARS) return null;
  if (sourceIds.size > 0) {
    const index = history.findLastIndex(message => message.role === 'system'
      && [...sourceIds].every(id => answerRuleNoteIdsInMessages([message]).includes(id)));
    if (index < 0) return null;
    return history.map((message, at) => at === index
      ? { ...message, content: `${message.content}\n\n${feedback}` } : message);
  }
  // Always-on capability checks use application rules, not a fabricated source.
  const index = history.findLastIndex(message => message.role === 'user');
  if (index < 0) return null;
  return [...history.slice(0, index), { role: 'system', content: feedback }, ...history.slice(index)];
}
