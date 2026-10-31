// The greeting is UI chrome, not conversation. It is shown on a fresh chat but
// is never saved into a session and never replayed to the model, including
// sessions saved by earlier versions, which did store it. These pure helpers
// are the single place that rule is enforced, so it can be tested directly
// (chat-context.tsx cannot: it pulls in React and react-native).

import type { SupportedLanguage } from './languages';

/** The greeting in each app language; it is typed in the one chosen when shown. */
export const GREETINGS: Record<SupportedLanguage, string> = {
  fr: 'Salut\u00a0! Que souhaites-tu apprendre aujourd’hui\u00a0?',
  en: 'Hi! What would you like to learn about today?',
};

/** The English greeting, kept for callers that predate the app language. */
export const GREETING = GREETINGS.en;
export const GREETING_ID = 'greeting';

export function greetingFor(language: SupportedLanguage): string {
  return GREETINGS[language] ?? GREETING;
}

export const isGreeting = (m: { id: string }) => m.id === GREETING_ID;

// The greeting bubble shown at the start of a new conversation. Starts empty;
// the animation fills it in. Every path below strips it back out.
export function createGreetingMessage(now: Date = new Date()) {
  return { id: GREETING_ID, role: 'assistant' as const, content: '', time: now };
}

// Remove the greeting before a list is saved or replayed.
export function stripGreeting<T extends { id: string }>(messages: T[]): T[] {
  return messages.filter(m => !isGreeting(m));
}

// A conversation with no real user turn is not a session, and the greeting
// alone never makes one, it is dropped before the check. This is the guard
// that keeps an untouched "New Chat" from becoming a ghost session on disk.
export function isPersistableSession(messages: { id: string; role: string }[]): boolean {
  return stripGreeting(messages).some(m => m.role === 'user');
}

// The model history: greeting removed, only user/assistant turns, reduced to
// role + content.
export function toHistory<T extends { id: string; role: string; content: string }>(
  messages: T[],
): { role: 'user' | 'assistant'; content: string }[] {
  return messages
    .filter(m => !isGreeting(m) && (m.role === 'user' || m.role === 'assistant'))
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
}
