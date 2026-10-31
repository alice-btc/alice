import type { SupportedLanguage } from '@alice-wallet/alice-ai/languages';
import { en } from './en.ts';
import { fr } from './fr.ts';

// The interface's words, outside React. A locale is one of the languages the
// registry in packages/alice-ai/src/languages.ts declares; each has one
// dictionary file here, typed against en.ts, so a missing key is a type
// error. Keys name a place on a screen (`settings.general.language`), not an
// English sentence.

export type Locale = SupportedLanguage;

export type MessageKey = keyof typeof en;

/** The keys counted with `plural`: `x.one` and `x.other` both exist. */
export type PluralKey = {
  [K in MessageKey]: K extends `${infer Base}.other` ? (`${Base}.one` extends MessageKey ? Base : never) : never;
}[MessageKey];

type ExtraPluralForm = 'zero' | 'two' | 'few' | 'many';

/**
 * A language's dictionary: every English key, plus any extra plural form its
 * grammar needs (`x.few`, `x.many`) beside `x.one` and `x.other`.
 */
export type Dictionary = Record<MessageKey, string> & Partial<Record<`${PluralKey}.${ExtraPluralForm}`, string>>;

export type MessageParams = Record<string, string | number>;

export const DICTIONARIES: Record<Locale, Dictionary> = { en, fr };

/** The BCP 47 tag numbers and dates are formatted with in each locale. */
export const FORMAT_LOCALES: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR' };

const PLACEHOLDER = /\{(\w+)\}/g;

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(PLACEHOLDER, (whole, name: string) => (name in params ? String(params[name]) : whole));
}

/** The text of a key in a locale, English when the locale lacks it. */
export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const dictionary: Partial<Record<string, string>> = DICTIONARIES[locale] ?? en;
  return interpolate(dictionary[key] ?? en[key] ?? key, params);
}

const pluralRules = new Map<Locale, Intl.PluralRules>();

/**
 * The form of a counted key that matches `count` in that language, with
 * `{count}` filled in: plural('en', 'learn.chapters', 1) reads
 * `learn.chapters.one`. A form the dictionary lacks falls back to `other`.
 */
export function translatePlural(locale: Locale, key: PluralKey, count: number, params?: MessageParams): string {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  const dictionary: Partial<Record<string, string>> = DICTIONARIES[locale] ?? en;
  const form = rules.select(count);
  const template = dictionary[`${key}.${form}`] ?? dictionary[`${key}.other`] ?? en[`${key}.other` as MessageKey];
  return interpolate(template, { count, ...params });
}

// The locale the interface currently shows, for code that runs outside a
// component (a toast raised by a store, a label built in lib/). The
// LanguageProvider keeps it in step; it is English until then, which is also
// what node tests see.
let current: Locale = 'en';
const listeners = new Set<(locale: Locale) => void>();

export function currentLocale(): Locale {
  return current;
}

export function setCurrentLocale(locale: Locale): void {
  if (locale === current) return;
  current = locale;
  for (const listener of [...listeners]) listener(locale);
}

export function subscribeLocale(listener: (locale: Locale) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** `translate` in the current locale. Call it when the text is shown, never at module load. */
export function t(key: MessageKey, params?: MessageParams): string {
  return translate(current, key, params);
}

/** The BCP 47 tag for numbers and dates in a locale, the current one by default. */
export function formatLocale(locale: Locale = current): string {
  return FORMAT_LOCALES[locale] ?? FORMAT_LOCALES.en;
}

/** `translatePlural` in the current locale. */
export function tn(key: PluralKey, count: number, params?: MessageParams): string {
  return translatePlural(current, key, count, params);
}
