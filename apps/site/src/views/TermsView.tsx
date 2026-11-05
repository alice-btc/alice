import type { Metadata } from 'next';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import type { Locale } from '@/i18n/config';
import { pageMetadata } from '@/i18n/metadata';
import { RichText } from '@/i18n/rich';
import { termsCopy } from '@/i18n/dictionaries/terms';

export function termsMetadata(locale: Locale): Metadata {
  return pageMetadata(locale, '/terms/', termsCopy[locale].meta);
}

const link = 'text-[var(--alice-primary)] hover:underline';

export function TermsView({ locale }: { locale: Locale }) {
  const copy = termsCopy[locale];
  return (
    <>
      <SiteNav locale={locale} path="/terms/" />
      <main id="main" className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.12] sm:text-5xl">{copy.title}</h1>
        <p className="mt-3 text-sm text-[var(--alice-muted)]">{copy.updated}</p>
        <p className="mt-5 text-lg leading-relaxed text-[var(--alice-text)]">
          <RichText value={copy.intro} locale={locale} linkClassName={link} />
        </p>

        {copy.sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <h2 id={section.id} className="mt-12 scroll-mt-24 text-2xl font-semibold sm:text-3xl">
              {section.heading}
            </h2>
            {section.body.map((paragraph, index) => (
              <p key={index} className="mt-3 leading-relaxed text-[var(--alice-text)]">
                <RichText value={paragraph} locale={locale} linkClassName={link} />
              </p>
            ))}
            {section.list && (
              <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-[var(--alice-text)]">
                {section.list.map((item, index) => (
                  <li key={index}>
                    <RichText value={item} locale={locale} linkClassName={link} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
      <SiteFooter locale={locale} path="/terms/" />
    </>
  );
}
