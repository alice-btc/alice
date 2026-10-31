import type { Metadata } from 'next';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { PricingPlans } from '@/components/PricingPlans';
import type { Locale } from '@/i18n/config';
import { pageMetadata } from '@/i18n/metadata';
import { pricingCopy } from '@/i18n/dictionaries/pricing';

export function pricingMetadata(locale: Locale): Metadata {
  const { meta } = pricingCopy[locale];
  return pageMetadata(locale, '/pricing/', {
    title: meta.title,
    description: meta.description,
    share: { title: meta.title, description: meta.shareDescription, type: 'website' },
  });
}

export function PricingView({ locale }: { locale: Locale }) {
  const t = pricingCopy[locale];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteNav locale={locale} path="/pricing/" />
      <main id="main">
        <section className="mx-auto max-w-6xl px-5 pt-16 pb-10 sm:pt-24">
          <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
            {t.eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--alice-text)]">
            {t.lead}
          </p>
          {/* The site-wide beta notice talks about mainnet and test coins,
              which is wallet territory. This page is about the AI alone, so
              it carries its own one-line status instead. */}
          <p className="mt-4 text-sm text-[var(--alice-muted)]">
            {t.status}
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <PricingPlans locale={locale} copy={t.plans} />
        </section>

        {/* The questions a price page creates, answered where they arise. */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="text-2xl font-semibold text-[var(--alice-heading)]">
            {t.faqTitle}
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {t.faqs.map(faq => (
              <div
                key={faq.q}
                className="rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-card-bg)] p-6"
              >
                <h3 className="text-[16px] font-semibold text-[var(--alice-heading)]">
                  {faq.q}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--alice-text)]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} path="/pricing/" />
    </>
  );
}
