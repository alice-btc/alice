import type { Metadata } from 'next';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { CONTACT_EMAIL, FOUNDER_X_URL, NOSTR_URL, OFFCHAIN_URL, SOURCE_URL, X_URL } from '@/lib/site';
import { externalLinkProps } from '@/lib/links';
import type { Locale } from '@/i18n/config';
import { pageMetadata } from '@/i18n/metadata';
import { aboutCopy } from '@/i18n/dictionaries/about';

export function aboutMetadata(locale: Locale): Metadata {
  return pageMetadata(locale, '/about/', aboutCopy[locale].meta);
}

const link = 'text-[var(--alice-primary)] hover:underline';

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 text-2xl font-semibold sm:text-3xl">{children}</h2>;
}

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} {...externalLinkProps(href)} className={link}>
      {children}
    </a>
  );
}

export function AboutView({ locale }: { locale: Locale }) {
  const t = aboutCopy[locale];
  return (
    <>
      <SiteNav locale={locale} path="/about/" />
      <main id="main" className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
          {t.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.12] sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--alice-text)]">
          {t.intro}
        </p>

        <H>{t.whoTitle}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{t.who}</p>
        <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <External href={OFFCHAIN_URL}>{t.whoLinks.offchain}</External>
          <External href={FOUNDER_X_URL}>{t.whoLinks.x}</External>
        </p>

        <H>{t.whyTitle}</H>
        {t.why.map((paragraph) => (
          <p key={paragraph} className="mt-3 leading-relaxed text-[var(--alice-text)]">{paragraph}</p>
        ))}

        <H>{t.contactTitle}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{t.contactLead}</p>
        <ul className="mt-4 flex flex-col gap-2">
          <li><External href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</External></li>
          <li><External href={X_URL}>{t.contactLinks.x}</External></li>
          <li><External href={NOSTR_URL}>{t.contactLinks.nostr}</External></li>
          <li><External href={SOURCE_URL}>{t.contactLinks.source}</External></li>
        </ul>
      </main>
      <SiteFooter locale={locale} path="/about/" />
    </>
  );
}
