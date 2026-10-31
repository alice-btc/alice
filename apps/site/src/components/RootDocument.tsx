import type { ReactNode } from 'react';
import { CONTACT_EMAIL, NOSTR_URL, SITE_NAME, SITE_URL, SOURCE_URL, X_URL } from '@/lib/site';
import { StickyAsk } from '@/components/StickyAsk';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/paths';
import { commonCopy } from '@/i18n/dictionaries/common';

// The document shell every root layout renders: English at the root and each
// other locale under its prefix are separate root layouts, so each page is
// exported with the right <html lang> and no script has to correct it.

// Set at build time to the token from the Cloudflare Web Analytics dashboard.
// Not a secret: the beacon carries it in the page's own HTML, like every
// analytics site tag. Unset means no beacon at all.
const CF_ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN?.trim();

export function RootDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = commonCopy[locale];
  // Organization + WebSite structured data, sitewide. Helps search engines and
  // AI answer engines attribute content to Alice and understand the brand.
  const orgSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#org`,
        name: SITE_NAME,
        url: SITE_URL,
        description: t.meta.tagline,
        email: CONTACT_EMAIL,
        sameAs: [X_URL, NOSTR_URL, SOURCE_URL],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#org` },
      },
    ],
  };

  return (
    <html lang={locale} className="dark">
      <body>
        {/* Every page has a <main id="main">; the link is the first thing a
            keyboard reaches and stays invisible until it has the focus. */}
        <a href="#main" className="skip-link">{t.skipLink}</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {children}
        <StickyAsk copy={t.ask} homePath={localePath(locale, '/')} />
        {/* Cloudflare Web Analytics: page-view counts with no cookie, no
            localStorage and no fingerprint, so nothing follows a visitor
            across sites or sessions. Loaded only when a token is configured
            (NEXT_PUBLIC_CF_ANALYTICS_TOKEN at build time), which keeps dev
            builds and forks entirely beacon-free. What it collects is
            described on /privacy: that page and this script must always
            agree. */}
        {CF_ANALYTICS_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CF_ANALYTICS_TOKEN })}
          />
        )}
      </body>
    </html>
  );
}
