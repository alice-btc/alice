import type { Metadata } from 'next';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { SOURCE_URL } from '@/lib/site';
import { externalLinkProps } from '@/lib/links';
import type { Locale } from '@/i18n/config';
import { pageMetadata } from '@/i18n/metadata';
import { RichText } from '@/i18n/rich';
import { trustCopy } from '@/i18n/dictionaries/trust';

export function trustMetadata(locale: Locale): Metadata {
  return pageMetadata(locale, '/trust/', trustCopy[locale].meta);
}

const link = 'text-[var(--alice-primary)] hover:underline';

function H({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-24 text-2xl font-semibold sm:text-3xl">
      {children}
    </h2>
  );
}

export function TrustView({ locale }: { locale: Locale }) {
  const t = trustCopy[locale];
  return (
    <>
      <SiteNav locale={locale} path="/trust/" />
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

        <div className="mt-6 rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-card-bg)] p-4 text-sm text-[var(--alice-muted)]">
          <RichText value={t.notice} locale={locale} linkClassName={link} />
        </div>

        <H>{t.privateTitle}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">
          <RichText value={t.privateBody} locale={locale} linkClassName={link} />
        </p>

        <H>{t.partiesTitle}</H>
        <div className="mt-4 overflow-x-auto rounded-[4px] border border-[var(--alice-border)]">
          <table className="w-full text-left text-[15px]">
            <tbody>
              {t.parties.map(([who, what]) => (
                <tr key={who} className="border-b border-[var(--alice-border)] align-top last:border-0">
                  <th scope="row" className="w-1/3 p-4 font-semibold text-[var(--alice-heading)]">{who}</th>
                  <td className="p-4 text-[var(--alice-text)]">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <H>{t.failTitle}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">
          {t.failLead}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {t.refusals.map((r) => (
            <span key={r} className="rounded-[4px] border border-[var(--alice-border)] px-3 py-1.5 text-[13px] text-[var(--alice-text)]">
              {r}
            </span>
          ))}
        </div>
        <p className="mt-4 leading-relaxed text-[var(--alice-muted)]">
          {t.failAfter}
        </p>

        <H id="status">{t.statusTitle}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">
          {t.statusLead}
        </p>
        <div className="mt-4 overflow-x-auto rounded-[4px] border border-[var(--alice-border)]">
          <table className="w-full text-left text-[15px]">
            <tbody>
              {t.statusRows.map(([item, state]) => (
                <tr key={item} className="border-b border-[var(--alice-border)] align-top last:border-0">
                  <th scope="row" className="w-1/2 p-4 font-semibold text-[var(--alice-heading)]">{item}</th>
                  <td className="p-4 text-[var(--alice-text)]">{state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 leading-relaxed text-[var(--alice-muted)]">
          <RichText value={t.statusAfter} locale={locale} linkClassName={link} />
        </p>

        <H>{t.limitsTitle}</H>
        <ul className="mt-3 flex flex-col gap-2 leading-relaxed text-[var(--alice-text)]">
          {t.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>

        <p className="mt-12 text-sm text-[var(--alice-muted)]">
          {t.sourceBefore}
          <a href={SOURCE_URL} {...externalLinkProps(SOURCE_URL)} className="underline underline-offset-4">{t.sourceLink}</a>
          {t.sourceAfter}
        </p>
      </main>
      <SiteFooter locale={locale} path="/trust/" />
    </>
  );
}
