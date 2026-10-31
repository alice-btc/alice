// The languages Alice speaks. Adding one is an addition, not a refactor: an
// entry here, then every `Record<SupportedLanguage, …>` the type checker
// flags as incomplete (system prompts, deterministic replies, guards), the
// interface dictionary and a corpus folder.

export type LanguageDistribution = 'bundled' | 'downloadable';

export type LanguageDefinition = {
  /** ISO 639-1 code, also the prefix matched against a browser locale. */
  code: string;
  /** Used inside model instructions ("Output only French"). */
  englishName: string;
  /** Shown to the user when choosing a language. */
  nativeName: string;
  /** Bundled ships with the app; downloadable arrives as a pack later. */
  distribution: LanguageDistribution;
  /** Shown when two attempts in a row came back in another language. */
  answerFailure: string;
  /** The same failure on Alice Local, which points at Private Cloud. */
  localAnswerFailure: string;
  /** Final line appended to the user turn sent to a local model. */
  localAnswerLine: string;
};

export const SUPPORTED_LANGUAGES = [
  {
    code: 'fr',
    englishName: 'French',
    nativeName: 'Français',
    distribution: 'bundled',
    answerFailure: "Alice n'a pas pu produire une réponse fiable en français. Réessayez dans un instant.",
    localAnswerFailure: "Alice Local n'a pas pu produire une réponse fiable en français. Private Cloud peut répondre en français. Rien n'a été envoyé au cloud.",
    localAnswerLine: '(Réponds en français.)',
  },
  {
    code: 'en',
    englishName: 'English',
    nativeName: 'English',
    distribution: 'bundled',
    answerFailure: 'Alice could not produce a reliable answer in English. Try again in a moment.',
    localAnswerFailure: 'Alice Local could not produce a reliable answer in English. Private Cloud can answer in English. Nothing was sent to the cloud.',
    localAnswerLine: '(Answer in English.)',
  },
] as const satisfies readonly LanguageDefinition[];

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];

/** Used when nothing else names a language. */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const SUPPORTED_LANGUAGE_CODES: readonly SupportedLanguage[] = SUPPORTED_LANGUAGES.map(language => language.code);

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(value);
}

const BY_CODE = new Map<string, LanguageDefinition>(SUPPORTED_LANGUAGES.map(language => [language.code, language]));

export function languageDefinition(code: SupportedLanguage): LanguageDefinition {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_LANGUAGE)!;
}

/** "fr-FR" → 'fr', "en-GB" → 'en', anything unsupported → the default. */
export function languageFromLocale(locale: string | null | undefined): SupportedLanguage {
  const prefix = (locale ?? '').trim().toLowerCase().split(/[-_]/)[0];
  return isSupportedLanguage(prefix) ? prefix : DEFAULT_LANGUAGE;
}
