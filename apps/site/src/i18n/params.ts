import { notFound } from 'next/navigation';
import { PREFIXED_LOCALES, isLocale, type Locale } from '@/i18n/config';

// The [locale] segment: one static export per prefixed locale, and nothing
// else (dynamicParams = false in its layout), so /de/ or /xx/ is a 404
// rather than a page rendered in no language.

export type LocaleParams = { params: Promise<{ locale: string }> };

export function prefixedLocaleParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}

export async function localeFrom(params: LocaleParams['params']): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
