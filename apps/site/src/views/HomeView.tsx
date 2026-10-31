import type { Metadata } from 'next';
import { ExperimentalWallet } from '@/components/ExperimentalWallet';
import { DESKTOP_RELEASE_URL, DESKTOP_VERSION, SITE_URL } from '@/lib/site';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { HeroTour } from '@/components/HeroTour';
import { SovereigntyScroll } from '@/components/SovereigntyScroll';
import { Missions } from '@/components/Missions';
import { Faq } from '@/components/Faq';
import { LanguageNotice } from '@/components/LanguageNotice';
import { DEFAULT_LOCALE, PREFIXED_LOCALES, type Locale } from '@/i18n/config';
import { localePath, localizeHref } from '@/i18n/paths';
import { pageMetadata } from '@/i18n/metadata';
import { commonCopy } from '@/i18n/dictionaries/common';
import { homeCopy } from '@/i18n/dictionaries/home';

export function homeMetadata(locale: Locale): Metadata {
  return pageMetadata(locale, '/', { description: homeCopy[locale].meta.description });
}

export function HomeView({ locale }: { locale: Locale }) {
  const t = homeCopy[locale];
  const common = commonCopy[locale];
  // SoftwareApplication schema for the product itself, on the home page.
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Alice',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, macOS, Windows, Linux',
    url: SITE_URL,
    description: t.appSchemaDescription,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    softwareVersion: DESKTOP_VERSION,
    releaseNotes: DESKTOP_RELEASE_URL,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <SiteNav locale={locale} path="/" />
      {/* The English home offers each translation to a browser set to its
          language; the translated homes offer nothing. */}
      {locale === DEFAULT_LOCALE && (
        <LanguageNotice
          offers={PREFIXED_LOCALES.map((other) => ({
            locale: other,
            href: localePath(other, '/'),
            label: commonCopy[other].language.switchAria,
            message: commonCopy[other].language.notice,
            close: commonCopy[other].language.noticeClose,
          }))}
        />
      )}
      <main id="main">
        {/* Hero, proofs, and the app tour as one continuous object: on
            desktop the right column is a single pinned Alice screen that
            starts as a working ask interface and becomes the tour captures. */}
        <HeroTour
          locale={locale}
          hero={t.hero}
          tour={t.tour}
          verify={t.verify}
          ctas={common.ctas}
          noticeCopy={common.downloadNotice}
        />

        {/* Sovereignty, pinned scrollytelling (Local or Private Cloud is a
            choice; Bitcoin self-custody is a constant) */}
        <SovereigntyScroll copy={t.sovereignty} />

        {/* Alice's mission, slogan + mission tiles + who it's for */}
        <Missions copy={t.missions} />

        {/* FAQ (with FAQPage schema) */}
        <Faq copy={t.faq} />

        {/* vs ChatGPT teaser */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="flex flex-col items-start gap-5 rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-card-bg)] p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold">{t.teaser.title}</h2>
              <p className="mt-2 text-[var(--alice-muted)]">{t.teaser.body}</p>
            </div>
            <a
              href={localizeHref(locale, '/vs/chatgpt/')}
              className="shrink-0 rounded-[3px] border border-[var(--alice-primary)] px-5 py-3 font-semibold text-[var(--alice-primary)] transition-colors hover:bg-[var(--alice-primary)] hover:text-[var(--alice-on-primary)]"
            >
              {t.teaser.cta}
            </a>
          </div>
        </section>
        <ExperimentalWallet copy={t.wallet} noticeCopy={common.downloadNotice} />
      </main>
      <SiteFooter locale={locale} path="/" />
    </>
  );
}
