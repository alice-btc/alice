// On a phone the Ask-Alice dock has no room beside the page, so the Explorer,
// the Playground and Learn hand the active page over to the main chat
// instead: this module carries the page's attachment (its signals, its
// identified-mode description or Learn's text, the chip label and the page
// note) to the chat page, plus the Explorer tabs open at that moment so the
// conversation can be linked to them.
//
// Memory only, on purpose: the signals can describe identifiers, so they are
// never written anywhere by the hand-over itself. A reload drops the
// attachment, and the chat composer says so by simply not showing a chip.

import { useSyncExternalStore } from 'react';
import type { FullContext } from './ask-alice.ts';
import type { PrivacySignal } from './signals.ts';
import type { Tab } from './tabs.ts';

export type AskHandoff = {
  /** Identity of the page the signals come from (the Explorer tab id). */
  contextId: string;
  /** The chip's short name: shown locally, never sent. */
  contextLabel: string;
  /** Identity-free sentence naming the page, sent in the de-identified block. */
  pageNote?: string;
  signals: PrivacySignal[];
  fullContext: FullContext | null;
  /** Learn's attachment instead of signals: the exact prefix sent before
      the question (public catalog metadata, see learn/LearnAskAlice.tsx). */
  text?: string;
  /** The surface's own suggested questions. */
  defaultQuestions?: readonly string[];
  /** The Explorer tabs open at hand-over, recorded against the conversation
      on its first send, as the dock does through onActivity. */
  tabs?: Tab[];
  activeTabId?: string;
};

let current: AskHandoff | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function setAskHandoff(handoff: AskHandoff | null): void {
  current = handoff;
  listeners.forEach(listener => listener());
}

export function getAskHandoff(): AskHandoff | null {
  return current;
}

/** The attachment handed over by the Explorer, if any (null on the server). */
export function useAskHandoff(): AskHandoff | null {
  return useSyncExternalStore(subscribe, getAskHandoff, () => null);
}

/** Below this width the dock would cover the page: the chat takes over. */
const PHONE_QUERY = '(max-width: 767px)';

function subscribePhone(listener: () => void): () => void {
  const query = matchMedia(PHONE_QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

/** True on a phone-sized viewport; false on the server and until hydration. */
export function usePhoneLayout(): boolean {
  return useSyncExternalStore(subscribePhone, () => matchMedia(PHONE_QUERY).matches, () => false);
}
