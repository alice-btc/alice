import type { Metadata } from 'next';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import type { Locale } from '@/i18n/config';
import { pageMetadata } from '@/i18n/metadata';
import { accountDeletionCopy } from '@/i18n/dictionaries/account-deletion';
import { CONTACT_EMAIL } from '@/lib/site';

export function accountDeletionMetadata(locale: Locale): Metadata {
  return pageMetadata(locale, '/account-deletion/', accountDeletionCopy[locale].meta);
}

function H({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-24 text-2xl font-semibold sm:text-3xl">
      {children}
    </h2>
  );
}

function Rows({ rows }: { rows: { title: string; body: string }[] }) {
  return (
    <dl className="mt-4 divide-y divide-[var(--alice-border)]">
      {rows.map((row) => (
        <div key={row.title} className="py-5">
          <dt className="text-lg font-semibold text-[var(--alice-heading)]">{row.title}</dt>
          <dd className="mt-2 leading-relaxed text-[var(--alice-text)]">{row.body}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AccountDeletionView({ locale }: { locale: Locale }) {
  const copy = accountDeletionCopy[locale];
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.byEmail.mailSubject)}`;
  return (
    <>
      <SiteNav locale={locale} path="/account-deletion/" />
      <main id="main" className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.12] sm:text-5xl">{copy.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--alice-text)]">{copy.intro}</p>

        <H id="in-app">{copy.inApp.heading}</H>
        <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-[var(--alice-text)]">
          {copy.inApp.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 leading-relaxed text-[var(--alice-text)]">{copy.inApp.after}</p>

        <H id="by-email">{copy.byEmail.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">
          {copy.byEmail.before}{' '}
          <a href={mailto} className="text-[var(--alice-primary)] hover:underline">
            {CONTACT_EMAIL}
          </a>{' '}
          {copy.byEmail.subject}, {copy.byEmail.after}
        </p>

        <H id="erased">{copy.erased.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{copy.erased.lead}</p>
        <Rows rows={copy.erased.rows} />

        <H id="kept">{copy.kept.heading}</H>
        <Rows rows={copy.kept.rows} />

        <H id="device">{copy.device.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{copy.device.body}</p>

        <H id="timing">{copy.timing.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{copy.timing.body}</p>
      </main>
      <SiteFooter locale={locale} path="/account-deletion/" />
    </>
  );
}
