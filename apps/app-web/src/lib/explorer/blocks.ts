// Pure display helpers for the live block ribbon. No React, no fetch: the
// provider returns NormalizedBlock / ProjectedBlock, these turn numbers into a
// colour and human strings, and are unit tested in isolation. Each string
// helper takes the locale to speak (the caller's, during a render), the
// current interface locale otherwise.

import { currentLocale, translate, type Locale } from '../../i18n/translate.ts';

// English keeps the formats it always had; another locale gets its own
// separators ("943 210", "1,50 Mo", "14/08/2026 à 10:32").
const NUMBER_TAGS: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR' };
const DATE_TAGS: Record<Locale, string> = { en: 'en-GB', fr: 'fr-FR' };

/** A whole count with the locale's grouping: 943,210 or 943 210. */
export function formatCount(value: number, locale: Locale = currentLocale()): string {
  return value.toLocaleString(NUMBER_TAGS[locale]);
}

/** `toFixed` with the locale's decimal mark; English is exactly `toFixed`. */
export function formatFixed(value: number, digits: number, locale: Locale = currentLocale()): string {
  if (locale === 'en') return value.toFixed(digits);
  return value.toLocaleString(NUMBER_TAGS[locale], { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** A plain number as `String()` writes it in English, with the locale's decimal mark otherwise. */
function formatPlain(value: number, locale: Locale): string {
  return locale === 'en' ? String(value) : value.toLocaleString(NUMBER_TAGS[locale], { maximumFractionDigits: 20, useGrouping: false });
}

// A green-to-red heat scale by median fee (sat/vB), the convention every block
// explorer uses. Semantic, so it stays a heat scale rather than a brand tint.
const FEE_TIERS: { max: number; color: string }[] = [
  { max: 1, color: '#3fa46a' },
  { max: 4, color: '#6aa84f' },
  { max: 10, color: '#b7a53f' },
  { max: 20, color: '#d1943a' },
  { max: 50, color: '#d1703a' },
  { max: 100, color: '#d1503a' },
  { max: Infinity, color: '#c83a3a' },
];

export function feeColor(medianFeeSatVb?: number): string {
  if (medianFeeSatVb === undefined || medianFeeSatVb <= 0) return 'var(--alice-muted)';
  return (FEE_TIERS.find(t => medianFeeSatVb <= t.max) ?? FEE_TIERS[FEE_TIERS.length - 1]).color;
}

// Same heat scale but always a concrete hex, for canvas fillStyle where CSS
// variables cannot be used. A zero/undefined rate falls back to a muted blue.
export function feeColorHex(rateSatVb: number): string {
  if (!(rateSatVb > 0)) return '#3a5578';
  return (FEE_TIERS.find(t => rateSatVb <= t.max) ?? FEE_TIERS[FEE_TIERS.length - 1]).color;
}

// Compact relative age from a block timestamp. `nowSec` is injectable for tests.
export function formatBlockAge(timestampSec: number, nowSec: number, locale: Locale = currentLocale()): string {
  const diff = Math.max(0, Math.floor(nowSec - timestampSec));
  if (diff < 45) return translate(locale, 'explorerBlocks.age.justNow');
  if (diff < 3600) return translate(locale, 'explorerBlocks.age.minutes', { n: Math.round(diff / 60) });
  if (diff < 86400) return translate(locale, 'explorerBlocks.age.hours', { n: Math.round(diff / 3600) });
  return translate(locale, 'explorerBlocks.age.days', { n: Math.round(diff / 86400) });
}

// The confirmation moment, absolute and in the viewer's local time: relative
// ages ("176d ago") get vague fast, so the exact date rides along everywhere a
// confirmation is shown. One shared formatter keeps the style uniform.
export function formatDateTime(timestampSec: number, locale: Locale = currentLocale()): string {
  return new Date(timestampSec * 1000).toLocaleString(DATE_TAGS[locale], {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** Numeric date only (dd/mm/yyyy), for tight spots like the block ribbon. */
export function formatDateNum(timestampSec: number, locale: Locale = currentLocale()): string {
  return new Date(timestampSec * 1000).toLocaleDateString(DATE_TAGS[locale], {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

/** The ribbon's age label: relative while fresh, the plain numeric date once
 *  a week old (a "176d ago" says less than 14/08/2026). */
export function formatBlockAgeOrDate(timestampSec: number, nowSec: number, locale: Locale = currentLocale()): string {
  return nowSec - timestampSec >= 7 * 86400 ? formatDateNum(timestampSec, locale) : formatBlockAge(timestampSec, nowSec, locale);
}

// Byte size to a short human string, binary units.
export function formatBytes(bytes: number, locale: Locale = currentLocale()): string {
  if (bytes < 1024) return translate(locale, 'explorerBlocks.bytes.b', { value: formatPlain(bytes, locale) });
  if (bytes < 1024 * 1024) return translate(locale, 'explorerBlocks.bytes.kb', { value: formatFixed(bytes / 1024, 0, locale) });
  return translate(locale, 'explorerBlocks.bytes.mb', { value: formatFixed(bytes / (1024 * 1024), 2, locale) });
}

// A block's fee spread as "low - high sat/vB", from the feeRange percentiles.
export function formatFeeRange(feeRange?: number[], locale: Locale = currentLocale()): string | null {
  if (!feeRange || feeRange.length === 0) return null;
  const lo = feeRange[0];
  const hi = feeRange[feeRange.length - 1];
  const r = (n: number) => formatPlain(n >= 10 ? Math.round(n) : Math.round(n * 10) / 10, locale);
  return lo === hi ? `${r(hi)} sat/vB` : `${r(lo)} - ${r(hi)} sat/vB`;
}
