import type {
  DictionaryDefinition,
  DictionaryIndex,
  DictionaryLetterPack,
  DictionarySource,
} from '@alice-wallet/alice-content/src/dictionary-types';
import { currentLocale } from '../../i18n/translate.ts';
import { letterOfSlug } from './dictionary.ts';

// The dictionary packs are static JSON under public/dictionary/<lang>/: the
// French original, built by scripts/build-dictionary-pack.mjs, and its
// unofficial English translation, built by scripts/build-dictionary-pack-en.mjs.
// They are served from the app's own origin: same bytes in the browser, in the
// Tauri webview and offline on desktop. An index is loaded once; a letter's
// bodies are fetched when a term of that letter is opened or quoted.

export type DictionaryLang = 'en' | 'fr';

/** The pack a language reads: the English translation for English, the French original for any other. */
export function dictionaryLanguage(lang: string | undefined): DictionaryLang {
  return lang === 'en' ? 'en' : 'fr';
}

/** Author and licence as a source names them, and the translation when the pack is one. */
export function dictionaryAttribution(source: DictionarySource): string {
  const translation = source.translation ? `, ${source.translation.status} translation` : '';
  return `${source.author}, ${source.license}${translation}`;
}

/** How an English sentence sent to the model names the dictionary of a pack. */
export function dictionaryWorkName(lang: DictionaryLang): string {
  return lang === 'en'
    ? 'the unofficial English translation of the Dictionnaire de Bitcoin by Loïc Pandul'
    : 'the Dictionnaire de Bitcoin by Loïc Pandul';
}

const cache = new Map<string, Promise<unknown>>();

function fetchJson<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached) return cached as Promise<T>;
  const pending = fetch(url).then(async response => {
    if (!response.ok) throw new Error(`Dictionary pack unavailable (${response.status}): ${url}`);
    return (await response.json()) as T;
  });
  // A failed fetch must not poison the cache: the next call tries again.
  pending.catch(() => { cache.delete(url); });
  cache.set(url, pending);
  return pending;
}

export function fetchDictionaryIndex(lang: DictionaryLang): Promise<DictionaryIndex> {
  return fetchJson<DictionaryIndex>(`/dictionary/${lang}/index.json`);
}

export function fetchDictionaryLetter(letter: string, lang: DictionaryLang): Promise<DictionaryLetterPack> {
  if (!/^[a-z]$/.test(letter)) return Promise.reject(new Error(`Not a dictionary letter: ${letter}`));
  return fetchJson<DictionaryLetterPack>(`/dictionary/${lang}/letters/${letter}.json`);
}

/**
 * One definition by slug, or null when the dictionary has no such term. Both
 * packs file a definition under the letter of its slug, whatever its title.
 */
export async function fetchDefinition(slug: string, lang: DictionaryLang): Promise<DictionaryDefinition | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const pack = await fetchDictionaryLetter(letterOfSlug(slug), lang);
  return pack.entries.find(entry => entry.slug === slug) ?? null;
}

/**
 * Warm the index of the app language when the browser is idle, so the first
 * question of a chat finds it in memory: the turn-context bridge gives a
 * provider 1.5 s, and a cold fetch of the index would spend most of it.
 */
export function prefetchDictionaryIndex(): void {
  if (typeof window === 'undefined') return;
  const start = () => { fetchDictionaryIndex(dictionaryLanguage(currentLocale())).catch(() => { /* the dictionary is optional */ }); };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(start, { timeout: 4_000 });
  else setTimeout(start, 2_500);
}
