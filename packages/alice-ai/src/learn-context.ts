// Bridge between the chat turn and the Learn library. The AI core cannot
// depend on the app's Learn plumbing (packs live on the app side, with their
// own language and caching rules), so the app REGISTERS a provider and the
// turn pipeline asks it: "does a course speak to this question, and what does
// it say?". Surfaces without a Learn section simply never register one.
//
// Same posture as semantic search: a relevance nicety, never a gate. The
// provider is bounded in time and size, and every failure reads as "no course
// context", a broken pack can slow nothing and break nothing.

/**
 * One piece of Learn material the excerpt was drawn from, so the answer can
 * say so and the reader can open it: the chapter of a course, a tutorial, a
 * dictionary definition. The path is a route of the app's Learn section; the
 * attribution is what the licence asks to be named.
 */
export type LearnSource = {
  kind: 'course' | 'tutorial' | 'definition';
  /** Shown to the reader, e.g. "BTC101 · Wallets and self-custody" or "UTXO". */
  label: string;
  /** App route, e.g. "/learn/?course=btc101&chapter=…" or "/learn/?definition=utxo". */
  path: string;
  /** Author and licence, e.g. "Plan ₿ Network, CC BY-SA 4.0". */
  attribution: string;
};

export type LearnTurnContext = {
  /** e.g. "The Bitcoin Journey · Wallets and self-custody (Plan ₿ Academy)" */
  label: string;
  /** Course text, already trimmed to a context-sized excerpt. */
  excerpt: string;
  /**
   * Where the excerpt comes from, first the material whose label heads the
   * excerpt, then any other quoted after it (its own label line inside the
   * excerpt). Absent for a provider that predates sources.
   */
  sources?: LearnSource[];
};

export type LearnContextOptions = { targetLanguage?: 'fr' | 'en' };

export type LearnContextProvider = (query: string, options?: LearnContextOptions) => Promise<LearnTurnContext | null>;

const PROVIDER_TIMEOUT_MS = 1_500;
/** Room for a dictionary definition (1,200) and the start of a tool's
 *  walkthrough (3,600) together, with their headings: at 4,000 the end of the
 *  walkthrough was cut whenever the tool had a dictionary entry (Coldcard,
 *  2026-11-18). The turn's budget fits a whole prefix of it
 *  (knowledge-context-budget.ts). */
const MAX_EXCERPT_CHARS = 5_200;

// A tutorial can open on a security warning (funds at risk on a device, a
// version to avoid). A model given it among other text does not reliably pass
// it on, so the app shows it itself: the provider frames the warning with
// these marks, the model is told the app displays it, and the answer is led by
// the warning's own words (language-generation.ts).
const SECURITY_NOTICE_OPEN = '[Security notice of this tutorial. The app shows it above your answer: do not repeat it, and write nothing that contradicts it.]';
const SECURITY_NOTICE_CLOSE = '[End of security notice]';

/** Frames a tutorial's opening warning inside a Learn excerpt. */
export function markSecurityNotice(notice: string): string {
  const text = notice.replace(/\s*\n+\s*/g, ' ').trim();
  return text ? `${SECURITY_NOTICE_OPEN}\n${text}\n${SECURITY_NOTICE_CLOSE}` : '';
}

/** The warning framed in the context a turn sends, or null. */
export function securityNoticeIn(messages: readonly { role: string; content: string }[]): string | null {
  for (const message of messages) {
    if (message.role === 'assistant') continue;
    const start = message.content.indexOf(SECURITY_NOTICE_OPEN);
    if (start < 0) continue;
    const from = start + SECURITY_NOTICE_OPEN.length;
    const end = message.content.indexOf(SECURITY_NOTICE_CLOSE, from);
    if (end < 0) continue;
    const text = message.content.slice(from, end).replace(/\s*\n+\s*/g, ' ').trim();
    if (text) return text;
  }
  return null;
}

// A name several tutorials carry ("Trezor") is asked about. A model told to
// list them drops some or rewrites their titles (Qwen3.5 4B kept 4 of 6,
// 2026-11-18), so the app lists them itself: the provider frames their names
// with these marks, the model is told the app displays the list, and the
// answer is followed by it (language-generation.ts).
const TUTORIAL_CHOICES_OPEN = '[Several tutorials carry this name. None is the subject on its own. The app lists their names under your answer: do not list them.]';
const TUTORIAL_CHOICES_CLOSE = '[End of the tutorials that carry this name]';

/** Frames the tutorials a name stands for: each name alone on its line, so
 *  the reply can also offer every one of them to open. */
export function markTutorialChoices(tutorials: readonly { name: string; description?: string }[]): string {
  return [
    TUTORIAL_CHOICES_OPEN,
    ...tutorials.flatMap(({ name, description }) => (description ? [name.trim(), `  (${description.trim()})`] : [name.trim()])),
    TUTORIAL_CHOICES_CLOSE,
  ].join('\n');
}

/** The framed tutorial names in a context, or none when the budget cut the list. */
export function tutorialChoicesIn(text: string): string[] {
  const start = text.indexOf(TUTORIAL_CHOICES_OPEN);
  if (start < 0) return [];
  const from = start + TUTORIAL_CHOICES_OPEN.length;
  const end = text.indexOf(TUTORIAL_CHOICES_CLOSE, from);
  if (end < 0) return [];
  return text.slice(from, end).split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('('));
}

/** The framed tutorial names in the context a turn sends. */
export function tutorialChoicesInTurn(messages: readonly { role: string; content: string }[]): string[] {
  for (const message of messages) {
    if (message.role === 'assistant') continue;
    const names = tutorialChoicesIn(message.content);
    if (names.length > 0) return names;
  }
  return [];
}

const LIST_LINE = /^\s*(?:[-*•]|\d+[.)])\s+/;

/** The answer without the list it ends on: the app shows the full one. */
export function withoutClosingList(text: string): string {
  const lines = text.trimEnd().split('\n');
  let end = lines.length;
  while (end > 0 && (LIST_LINE.test(lines[end - 1]) || !lines[end - 1].trim())) end -= 1;
  const kept = lines.slice(0, end).join('\n').trimEnd();
  return kept || text;
}

/** The words that carry a sentence's subject, by their first 5 letters, so a
 *  plural or a conjugated form counts as the same word. */
function subjectWords(text: string): Set<string> {
  const words = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z]{5,}/g) ?? [];
  return new Set(words.map(word => word.slice(0, 5)));
}

/** A paragraph this long, made at least half of the warning's own words, is the warning again. */
const RESTATED_MIN_WORDS = 8;
const RESTATED_SHARE = 0.5;

/**
 * The answer without the paragraphs that only say the warning again. The app
 * shows the warning above the answer; a model asked not to repeat it still
 * closes on a summary of it, and the reader would meet it twice. A step that
 * mentions the risk in passing stays: it is mostly about something else.
 */
export function withoutRestatedNotice(answer: string, notice: string): string {
  const warned = subjectWords(notice);
  if (warned.size === 0) return answer;
  const kept = answer.split(/\n\s*\n/).filter(paragraph => {
    const words = subjectWords(paragraph);
    if (words.size < RESTATED_MIN_WORDS) return true;
    const shared = [...words].filter(word => warned.has(word)).length;
    return shared / words.size < RESTATED_SHARE;
  });
  const text = kept.join('\n\n').trim();
  return text || answer;
}

let provider: LearnContextProvider | null = null;

export function registerLearnContextProvider(next: LearnContextProvider): void {
  provider = next;
}

// The second half of the bridge, for the turn planner: does a short message
// name a subject the Learn library covers, a tool with a tutorial or a
// dictionary term? The planner cannot wait, so the check is synchronous and a
// failure reads as "not a known name".
let knownTopicNames: (message: string) => boolean = () => false;

export function registerKnownTopicNames(check: (message: string) => boolean): void {
  knownTopicNames = check;
}

export function namesKnownLearnTopic(message: string): boolean {
  try {
    return knownTopicNames(message);
  } catch {
    return false;
  }
}

export async function learnContextFor(query: string, options?: LearnContextOptions): Promise<LearnTurnContext | null> {
  if (!provider) return null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      provider(query, options),
      new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), PROVIDER_TIMEOUT_MS); }),
    ]);
    if (!result) return null;
    // Keep a complete prefix. A character cut can remove a safety qualifier at
    // the end of the same paragraph. Scan only the bounded head of a pack.
    const head = result.excerpt.slice(0, MAX_EXCERPT_CHARS + 2);
    const boundary = head.lastIndexOf('\n\n');
    const excerpt = (result.excerpt.length <= MAX_EXCERPT_CHARS
      ? result.excerpt
      : boundary >= 0 ? head.slice(0, boundary) : '').trim();
    if (!excerpt) return null;
    return {
      label: result.label,
      excerpt,
      ...(result.sources && result.sources.length > 0 ? { sources: result.sources } : {}),
    };
  } catch {
    return null;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
