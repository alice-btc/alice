import { SITE_ROUTES } from '@/lib/site';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/config';

// URLs per locale. English keeps the root (/pricing/), every other locale
// gets a prefix (/fr/pricing/). Paths are the site's own routes, trailing
// slash included, exactly as SITE_ROUTES lists them.

export type SitePath = (typeof SITE_ROUTES)[number];

const ROUTES: readonly string[] = SITE_ROUTES;

/** The URL of a site route in a locale: localePath('fr', '/trust/') → '/fr/trust/'. */
export function localePath(locale: Locale, path: SitePath | string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}/` : `/${locale}${path}`;
}

/**
 * The same, for an href that may carry a fragment and may not be a page at
 * all. Only the site's own pages are prefixed: '/trust/#status' becomes
 * '/fr/trust/#status', while '/licenses/OFL.txt', external URLs and bare
 * fragments are returned untouched.
 */
export function localizeHref(locale: Locale, href: string): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith('/')) return href;
  const hash = href.indexOf('#');
  const path = hash === -1 ? href : href.slice(0, hash);
  const fragment = hash === -1 ? '' : href.slice(hash);
  if (!ROUTES.includes(path)) return href;
  return `${localePath(locale, path)}${fragment}`;
}

/**
 * Canonical and hreflang links for one page: every locale, plus x-default
 * on the English page, which is the one served without a prefix.
 */
export function pageAlternates(locale: Locale, path: SitePath) {
  const languages: Record<string, string> = {};
  for (const each of LOCALES) languages[each] = localePath(each, path);
  languages['x-default'] = localePath(DEFAULT_LOCALE, path);
  return { canonical: localePath(locale, path), languages };
}
