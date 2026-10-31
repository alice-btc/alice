import {
  LEARN_EMBED_LANGS,
  LEARN_LANGUAGES,
} from '@alice-wallet/alice-content/src/generated/planb-learn-catalog';

// The reading language is its own setting, persisted separately from the app
// language. Until the user picks one in Learn it follows the app language:
// the device language by default, and Settings › General seeds a change,
// marked as followed, until a choice is made here. fr/en ship with the app; every other
// whitelisted corpus language can be added from the PlanB-style language
// picker (packs are fetched on demand, the "download" marks the language as
// installed here).
const STORAGE_KEY = 'alice.learn.language.v1';
const INSTALLED_KEY = 'alice.learn.languages.v1';
// '1' chosen in Learn, '0' following the app language. Absent beside a saved
// language means a choice saved before this marker existed: a choice.
const CHOSEN_KEY = 'alice.learn.language.chosen.v1';
const CHANGE_EVENT = 'alice:learn-language';

export type LearnLang = string;

/** Native names for every whitelisted corpus language. */
export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  sv: 'Svenska',
  cs: 'Čeština',
  vi: 'Tiếng Việt',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
  'sr-Latn': 'Srpski',
  'nb-NO': 'Norsk',
  rn: 'Ikirundi',
  sw: 'Kiswahili',
  et: 'Eesti',
  fi: 'Suomi',
  fa: 'فارسی',
  bg: 'Български',
  th: 'ไทย',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
};

export function languageName(lang: string): string {
  return LANGUAGE_NAMES[lang] ?? lang;
}

export function isWhitelistedLang(value: unknown): value is LearnLang {
  return typeof value === 'string' && LEARN_LANGUAGES.some((l) => l.lang === value);
}

export function isEmbeddedLang(lang: string): boolean {
  return (LEARN_EMBED_LANGS as readonly string[]).includes(lang);
}

export function defaultLearnLanguage(navigatorLanguage: string | undefined): LearnLang {
  const base = (navigatorLanguage ?? 'en').slice(0, 2).toLowerCase();
  return isEmbeddedLang(base) ? base : 'en';
}

export function loadLearnLanguage(): LearnLang | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isWhitelistedLang(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Saves the reading language the user picked; it no longer follows the app language. */
export function saveLearnLanguage(lang: LearnLang, { chosen = true }: { chosen?: boolean } = {}): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
    window.localStorage.setItem(CHOSEN_KEY, chosen ? '1' : '0');
  } catch {
    // Best-effort, same policy as the rest of the app.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** True once the user picked a reading language in Learn (or before the marker existed). */
export function hasChosenLearnLanguage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const marker = window.localStorage.getItem(CHOSEN_KEY);
    if (marker !== null) return marker === '1';
    return loadLearnLanguage() !== null;
  } catch {
    return false;
  }
}

/** The app language changed: Learn reads in it too, unless a reading language was picked. */
export function followAppLanguage(appLanguage: string): void {
  if (hasChosenLearnLanguage() || !isWhitelistedLang(appLanguage)) return;
  saveLearnLanguage(appLanguage, { chosen: false });
}

/** Called after any save, so an open Learn panel follows a change made in Settings. */
export function subscribeLearnLanguage(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

/** Languages available in the quick toggle: the embedded pair plus whatever
 *  the user added from the picker, in a stable order. */
export function installedLanguages(): LearnLang[] {
  const base = [...LEARN_EMBED_LANGS] as string[];
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(INSTALLED_KEY);
    const extra: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(extra)) {
      for (const lang of extra) {
        if (isWhitelistedLang(lang) && !base.includes(lang)) base.push(lang);
      }
    }
  } catch {
    // Fall back to the embedded pair.
  }
  return base;
}

export function addInstalledLanguage(lang: LearnLang): void {
  if (typeof window === 'undefined' || !isWhitelistedLang(lang) || isEmbeddedLang(lang)) return;
  try {
    const current = installedLanguages().filter((l) => !isEmbeddedLang(l));
    if (!current.includes(lang)) current.push(lang);
    window.localStorage.setItem(INSTALLED_KEY, JSON.stringify(current));
  } catch {
    // Best-effort.
  }
}

export function removeInstalledLanguage(lang: LearnLang): void {
  if (typeof window === 'undefined' || isEmbeddedLang(lang)) return;
  try {
    const current = installedLanguages().filter((l) => !isEmbeddedLang(l) && l !== lang);
    window.localStorage.setItem(INSTALLED_KEY, JSON.stringify(current));
  } catch {
    // Best-effort.
  }
}
