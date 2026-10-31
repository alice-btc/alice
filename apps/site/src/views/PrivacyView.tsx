import type { Metadata } from 'next';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import type { Locale } from '@/i18n/config';
import { pageMetadata } from '@/i18n/metadata';
import { RichText } from '@/i18n/rich';
import { privacyCopy } from '@/i18n/dictionaries/privacy';

export function privacyMetadata(locale: Locale): Metadata {
  const { meta } = privacyCopy[locale];
  return pageMetadata(locale, '/privacy/', meta);
}

const link = 'text-[var(--alice-primary)] hover:underline';

export function PrivacyView({ locale }: { locale: Locale }) {
  const t = privacyCopy[locale];
  return (
    <>
      <SiteNav locale={locale} path="/privacy/" />
      <main id="main" className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
          {t.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.12] sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--alice-text)]">
          <RichText value={t.intro} locale={locale} linkClassName={link} />
        </p>

        {/* The product promises come first: a visitor lands here to know what
            Alice does with their data in the app, not what the brochure site
            logs. */}
        <h2 className="mt-12 text-2xl font-semibold sm:text-3xl">
          {t.inAppTitle}
        </h2>
        <dl className="mt-6 divide-y divide-[var(--alice-border)]">
          {t.inApp.map((item) => (
            <div key={item.title} className="py-5">
              <dt className="text-lg font-semibold text-[var(--alice-heading)]">{item.title}</dt>
              <dd className="mt-2 leading-relaxed text-[var(--alice-text)]">
                <RichText value={item.detail} locale={locale} linkClassName={link} />
              </dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-12 text-2xl font-semibold sm:text-3xl">{t.siteTitle}</h2>
        <ul className="mt-4 flex flex-col gap-2 leading-relaxed text-[var(--alice-text)]">
          {t.wedont.map((w) => (
            <li key={w} className="flex gap-3">
              <span aria-hidden className="text-[var(--alice-primary)]">✓</span>
              {w}
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-2xl font-semibold sm:text-3xl">{t.analyticsTitle}</h2>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">
          {t.analytics}
        </p>
      </main>
      <SiteFooter locale={locale} path="/privacy/" />
    </>
  );
}
