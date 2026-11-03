// Sizes in the interface language's units and decimal mark: 2.7 GB in
// English, 2,7 Go in French. English keeps exactly what alice-ai's
// formatSize and the earlier inline formatters wrote.

import { currentLocale, formatLocale, translate, type Locale } from '../i18n/translate.ts';

/** `toFixed` with the locale's decimal mark; English is exactly `toFixed`. */
export function formatDecimal(value: number, digits: number, locale: Locale = currentLocale()): string {
  if (locale === 'en') return value.toFixed(digits);
  return value.toLocaleString(formatLocale(locale), { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** A file or download size in decimal units, as alice-ai's formatSize: 2.7 GB, 2,7 Go. */
export function formatModelSize(bytes: number, locale: Locale = currentLocale()): string {
  if (bytes >= 1_000_000_000) return translate(locale, 'common.size.gb', { value: formatDecimal(bytes / 1_000_000_000, 1, locale) });
  return translate(locale, 'common.size.mb', { value: formatDecimal(bytes / 1_000_000, 0, locale) });
}

/** A size counted in binary units, for what this device stores: 512 B, 12 KB, 3.4 MB. */
export function formatStorageSize(bytes: number, locale: Locale = currentLocale()): string {
  if (bytes < 1024) return translate(locale, 'common.size.b', { value: bytes });
  if (bytes < 1024 * 1024) return translate(locale, 'common.size.kb', { value: Math.ceil(bytes / 1024) });
  return translate(locale, 'common.size.mb', { value: formatDecimal(bytes / (1024 * 1024), 1, locale) });
}

/** A size in gigabytes with one decimal, as the phone memory notices count: 0.8 GB, 0,8 Go. */
export function formatGigabytes(bytes: number, locale: Locale = currentLocale()): string {
  return translate(locale, 'common.size.gb', { value: formatDecimal(bytes / 1_000_000_000, 1, locale) });
}
