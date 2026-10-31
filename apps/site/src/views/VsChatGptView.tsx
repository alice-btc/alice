import type { Metadata } from 'next';
import { APP_URL } from '@/lib/site';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { externalLinkProps } from '@/lib/links';
import type { Locale } from '@/i18n/config';
import { pageMetadata } from '@/i18n/metadata';
import { vsChatGptCopy } from '@/i18n/dictionaries/vs-chatgpt';

export function vsChatGptMetadata(locale: Locale): Metadata {
  const { meta } = vsChatGptCopy[locale];
  return pageMetadata(locale, '/vs/chatgpt/', {
    title: meta.title,
    description: meta.description,
    share: { title: meta.title, description: meta.shareDescription, type: 'article' },
  });
}

export function VsChatGptView({ locale }: { locale: Locale }) {
  const t = vsChatGptCopy[locale];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteNav locale={locale} path="/vs/chatgpt/" />
      <main id="main" className="mx-auto max-w-4xl px-5 py-16">
        <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
          {t.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.12] sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--alice-text)]">
          {t.intro}
        </p>

        {/* Comparison table */}
        <div className="mt-10 overflow-x-auto rounded-[4px] border border-[var(--alice-border)]">
          <table className="w-full border-collapse text-left text-[15px]">
            <caption className="sr-only">{t.caption}</caption>
            <thead>
              <tr className="bg-[var(--alice-bg-soft)]">
                <th scope="col" className="p-4 font-semibold text-[var(--alice-muted)]">
                  &nbsp;
                </th>
                <th scope="col" className="p-4 font-semibold text-[var(--alice-primary)]">
                  {t.columns.alice}
                </th>
                <th scope="col" className="p-4 font-semibold text-[var(--alice-heading)]">
                  {t.columns.chatgpt}
                </th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r) => (
                <tr key={r.dimension} className="border-t border-[var(--alice-border)] align-top">
                  <th scope="row" className="p-4 font-semibold text-[var(--alice-heading)]">
                    {r.dimension}
                  </th>
                  <td className="p-4 text-[var(--alice-text)]">{r.alice}</td>
                  <td className="p-4 text-[var(--alice-muted)]">{r.chatgpt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Where ChatGPT wins, credibility */}
        <section className="mt-12 rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-card-bg)] p-7">
          <h2 className="text-2xl font-semibold">{t.winsTitle}</h2>
          <p className="mt-3 leading-relaxed text-[var(--alice-text)]">
            {t.winsBody}
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{t.faqTitle}</h2>
          <dl className="mt-6 divide-y divide-[var(--alice-border)]">
            {t.faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-lg font-semibold text-[var(--alice-heading)]">{f.q}</dt>
                <dd className="mt-2 leading-relaxed text-[var(--alice-text)]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="mt-12 flex flex-col items-start gap-4 rounded-[4px] border border-[var(--alice-primary)] p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t.ctaTitle}</h2>
            <p className="mt-1 text-sm text-[var(--alice-muted)]">{t.ctaLead}</p>
          </div>
          <a
            href={APP_URL}
            {...externalLinkProps(APP_URL)}
            className="shrink-0 rounded-[3px] border border-[var(--alice-primary)] bg-[var(--alice-primary)] px-5 py-3 font-semibold text-[var(--alice-on-primary)] transition-colors hover:bg-[var(--alice-primary-dark)]"
          >
            {t.cta}
          </a>
        </section>
      </main>
      <SiteFooter locale={locale} path="/vs/chatgpt/" />
    </>
  );
}
