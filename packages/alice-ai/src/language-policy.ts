import {
  languageDefinition,
  languageFromLocale,
  type SupportedLanguage,
} from './languages.ts';

export type { SupportedLanguage } from './languages.ts';
/**
 * 'app' (the default, nothing stored) answers in the app language; 'auto'
 * follows the conversation, for bilingual users; a language code pins it.
 */
export type ResponseLanguagePreference = 'app' | 'auto' | SupportedLanguage;
export type LanguageDecisionSource = 'explicit' | 'preference' | 'app' | 'message' | 'history' | 'interface';

export type LanguageDecision = {
  targetLanguage: SupportedLanguage;
  source: LanguageDecisionSource;
  confidence: number;
};

type Detection = { language: SupportedLanguage; confidence: number } | null;

const FRENCH_WORDS = new Set([
  'alors', 'avec', 'avoir', 'bonjour', 'car', 'ce', 'ces', 'comment', 'dans', 'des', 'donc',
  'elle', 'est', 'et', 'faire', 'francais', 'il', 'je', 'la', 'langue', 'le', 'les', 'mais',
  'nous', 'ou', 'par', 'pas', 'peux', 'pour', 'pourquoi', 'que', 'quel', 'quelle', 'qui',
  'repondre', 'reponse', 'reponses', 'compris', 'concis', 'concise', 'vais', 'aider', 'accord',
  'sans', 'sur', 'tu', 'une', 'vous', 'quoi', 'bitcoin',
]);

const ENGLISH_WORDS = new Set([
  'about', 'answer', 'are', 'bitcoin', 'can', 'could', 'do', 'does', 'english', 'explain', 'for',
  'from', 'got', 'have', 'help', 'how', 'in', 'is', 'it', 'keep', 'language', 'me', 'next', 'of',
  'please', 'reply', 'replies', 'concise', 'should', 'that', 'the', 'this', 'to', 'understood',
  'what', 'when', 'where', 'which', 'why', 'will', 'with', 'you', 'your',
]);

// Asking for a language, or to go back to one ("reviens au français",
// "switch back to English"). Saying which languages one speaks, or asking for
// a translation, is not one.
const EXPLICIT_FRENCH = /\b(?:reponds?|repondez|answer|reply|continue|parle|ecris|reviens|repasse|switch|speak)\b[\s\S]{0,30}\b(?:en\s+|au\s+|to\s+)?fran[cç]ais\b|\b(?:switch|go)\s+back\b[\s\S]{0,10}\bfrench\b/i;
const EXPLICIT_ENGLISH = /\b(?:answer|reply|continue|speak|write|switch|reponds?|repondez|reviens|repasse)\b[\s\S]{0,30}\b(?:in\s+|en\s+|to\s+|a\s+l'?\s*)?(?:english|anglais)\b|\bgo\s+back\b[\s\S]{0,10}\benglish\b/i;

function normalizedWords(text: string): string[] {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/^>.*$/gm, ' ')
    .replace(/[«“"][^»”"\n]{2,}[»”"]/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z]+/g) ?? [];
}

export function detectExplicitResponseLanguage(text: string): SupportedLanguage | null {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (EXPLICIT_FRENCH.test(normalized)) return 'fr';
  if (EXPLICIT_ENGLISH.test(normalized)) return 'en';
  return null;
}

/**
 * The language a conversation keeps after `message`: the one the message asks
 * for, otherwise the one it already had (null follows Settings).
 */
export function conversationLanguageAfter(
  message: string,
  current: SupportedLanguage | null,
): SupportedLanguage | null {
  return detectExplicitResponseLanguage(message) ?? current;
}

export function detectTextLanguage(text: string): Detection {
  const words = normalizedWords(text);
  if (words.length === 0) return null;

  let french = 0;
  let english = 0;
  for (const word of words) {
    if (FRENCH_WORDS.has(word)) french += 1;
    if (ENGLISH_WORDS.has(word)) english += 1;
  }
  if (/[àâçéèêëîïôùûüÿœ]/i.test(text)) french += 2;

  const strongest = Math.max(french, english);
  const difference = Math.abs(french - english);
  if (strongest < 2 || difference < 1) return null;

  return {
    language: french > english ? 'fr' : 'en',
    confidence: Math.min(0.99, 0.55 + difference / Math.max(6, words.length)),
  };
}

/** User turns read by Auto when the current message is not conclusive. */
export const AUTO_HISTORY_USER_TURNS = 5;

/**
 * The dominant language of the last user turns: the most detected one, the
 * most recent of them on a tie, null when no turn is conclusive.
 */
export function dominantHistoryLanguage(
  history: readonly { role: string; content: string }[],
  turns = AUTO_HISTORY_USER_TURNS,
): Detection {
  const detections = history
    .filter(message => message.role === 'user')
    .slice(-turns)
    .map(message => detectTextLanguage(message.content))
    .filter((detection): detection is NonNullable<Detection> => detection !== null);
  if (detections.length === 0) return null;

  const counts = new Map<SupportedLanguage, number>();
  for (const detection of detections) counts.set(detection.language, (counts.get(detection.language) ?? 0) + 1);
  const best = Math.max(...counts.values());
  const winner = detections.findLast(detection => counts.get(detection.language) === best)!.language;
  return { language: winner, confidence: Math.min(0.9, 0.5 + best / (2 * detections.length)) };
}

/**
 * The language of the next answer. Alice answers in the app language; the
 * exceptions are voluntary: an explicit request in the message, a pinned
 * response language (or a per-conversation override passed as the
 * preference), and the opt-in Auto mode, which reads the current message,
 * then the recent user turns, then the interface locale.
 */
export function resolveResponseLanguage(input: {
  message: string;
  preference?: ResponseLanguagePreference;
  /** The language chosen in Settings; derived from the interface locale when absent. */
  appLanguage?: SupportedLanguage;
  /** The conversation so far; only user turns are read, and only by Auto. */
  history?: readonly { role: string; content: string }[];
  interfaceLanguage?: string;
}): LanguageDecision {
  const explicit = detectExplicitResponseLanguage(input.message);
  if (explicit) return { targetLanguage: explicit, source: 'explicit', confidence: 1 };

  const preference = input.preference ?? 'app';
  if (preference !== 'app' && preference !== 'auto') {
    return { targetLanguage: preference, source: 'preference', confidence: 1 };
  }

  if (preference === 'auto') {
    const current = detectTextLanguage(input.message);
    if (current) return { targetLanguage: current.language, source: 'message', confidence: current.confidence };

    const dominant = dominantHistoryLanguage(input.history ?? []);
    if (dominant) return { targetLanguage: dominant.language, source: 'history', confidence: dominant.confidence };

    return { targetLanguage: languageFromLocale(input.interfaceLanguage), source: 'interface', confidence: 0.5 };
  }

  return {
    targetLanguage: input.appLanguage ?? languageFromLocale(input.interfaceLanguage),
    source: 'app',
    confidence: 1,
  };
}

export function isResponseLanguageAcceptable(text: string, target: SupportedLanguage): boolean {
  const detected = detectTextLanguage(text);
  // Very short answers, code, URLs, and proper nouns do not provide enough
  // evidence for a safe rejection. The prompt policy remains authoritative.
  if (!detected) return true;
  return detected.language === target;
}

export function languageName(language: SupportedLanguage): string {
  return languageDefinition(language).englishName;
}

export function localizedLanguageFailure(language: SupportedLanguage): string {
  return languageDefinition(language).answerFailure;
}
