// Home FAQ. Answers the common objections and feeds a FAQPage schema, which
// helps AI answer engines (Google AI Overviews, ChatGPT, Perplexity) cite Alice.
// The questions and answers are in the home dictionary.
import type { HomeCopy } from '@/i18n/dictionaries/home';

export function Faq({ copy }: { copy: HomeCopy['faq'] }) {
  const faqs = copy.items;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="text-3xl font-semibold sm:text-4xl">{copy.title}</h2>
      <dl className="mt-8 divide-y divide-[var(--alice-border)]">
        {faqs.map((f) => (
          <div key={f.q} className="py-5">
            <dt className="text-lg font-semibold text-[var(--alice-heading)]">{f.q}</dt>
            <dd className="mt-2 leading-relaxed text-[var(--alice-text)]">
              {f.a}
              {f.link && (
                <>
                  {' '}
                  <a
                    href={f.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--alice-primary)] hover:underline"
                  >
                    {f.link.label} →
                  </a>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
