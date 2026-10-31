import type { Metadata } from 'next';
import { SITE_IS_PUBLIC, SITE_NAME, SITE_URL } from '@/lib/site';
import { DEFAULT_LOCALE, OG_LOCALES, type Locale } from '@/i18n/config';
import { localePath, pageAlternates, type SitePath } from '@/i18n/paths';
import { commonCopy } from '@/i18n/dictionaries/common';

// Metadata for the two kinds of root layout (English at the root, every other
// locale under its prefix) and for each page. Every page states its own
// canonical and hreflang links: the layout carries none, so a page that
// forgot them would have none rather than the home page's.

/** The shared link-preview card, named with the page language's alt text. */
function ogImage(locale: Locale) {
  return { url: '/opengraph-image.png', width: 1200, height: 630, alt: commonCopy[locale].meta.ogAlt };
}

export function rootMetadata(locale: Locale): Metadata {
  const t = commonCopy[locale].meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t.defaultTitle,
      template: '%s · Alice',
    },
    description: t.tagline,
    applicationName: SITE_NAME,
    keywords: t.keywords,
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${localePath(locale, '/')}`,
      siteName: SITE_NAME,
      title: t.defaultTitle,
      description: t.tagline,
      locale: OG_LOCALES[locale],
      // English keeps the card that app/opengraph-image.png declares, with
      // the alt text of its .alt.txt file; another language names the same
      // card again so its alt text is in that language.
      ...(locale === DEFAULT_LOCALE ? {} : { images: [ogImage(locale)] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: t.defaultTitle,
      description: t.tagline,
    },
    robots: SITE_IS_PUBLIC
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    icons: {
      icon: [{ url: '/alice-symbol.svg', type: 'image/svg+xml' }, { url: '/favicon.png', sizes: '32x32', type: 'image/png' }],
      shortcut: '/alice-symbol.svg',
      apple: '/apple-touch-icon.png',
    },
  };
}

type PageMeta = {
  title?: string;
  description: string;
  /** Set to give the page its own link preview instead of the site's. */
  share?: { title: string; description: string; type: 'website' | 'article' };
};

export function pageMetadata(locale: Locale, path: SitePath, meta: PageMeta): Metadata {
  const metadata: Metadata = {
    ...(meta.title ? { title: meta.title } : {}),
    description: meta.description,
    alternates: pageAlternates(locale, path),
  };
  if (meta.share) {
    // Declaring openGraph here replaces the root one wholesale, so the shared
    // card from app/opengraph-image.png has to be named again or this page
    // ships with no preview image at all.
    metadata.openGraph = {
      title: meta.share.title,
      description: meta.share.description,
      url: `${SITE_URL}${localePath(locale, path)}`,
      type: meta.share.type,
      locale: OG_LOCALES[locale],
      images: [ogImage(locale)],
    };
    metadata.twitter = {
      card: 'summary_large_image',
      title: meta.share.title,
      description: meta.share.description,
      images: [{ url: '/opengraph-image.png', alt: commonCopy[locale].meta.ogAlt }],
    };
  }
  return metadata;
}
