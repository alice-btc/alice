// The site's languages. English is the default and lives at the root, with no
// prefix; every other locale lives under /<code>/. Adding a language means
// adding its code here, then its entry in every dictionary under
// ./dictionaries: each one is typed Record<Locale, …>, so TypeScript lists
// every dictionary still missing it.

export const LOCALES = ['en', 'fr'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Locales served under a /<code>/ prefix, the ones [locale] generates. */
export const PREFIXED_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

/** The language's own name, as the language switch shows it. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

/** OpenGraph wants a territory as well as a language. */
export const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
};

/** BCP 47 tag for number formatting. */
export const NUMBER_LOCALES: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
