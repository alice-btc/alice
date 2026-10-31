import type { Metadata } from 'next';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { MemoryFlowDiagram } from '@/components/MemoryFlowDiagram';
import { externalLinkProps } from '@/lib/links';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/i18n/paths';
import { pageMetadata } from '@/i18n/metadata';
import { memoryCopy } from '@/i18n/dictionaries/memory';

export function memoryMetadata(locale: Locale): Metadata {
  return pageMetadata(locale, '/memory/', memoryCopy[locale].meta);
}


function H({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-24 text-2xl font-semibold sm:text-3xl">
      {children}
    </h2>
  );
}

const link = 'text-[var(--alice-primary)] hover:underline';

export function MemoryView({ locale }: { locale: Locale }) {
  const copy = memoryCopy[locale];
  return (
    <>
      <SiteNav locale={locale} path="/memory/" />
      <main id="main" className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.12] sm:text-5xl">{copy.title}</h1>

        {/* The warning comes before everything else on purpose, and its text is
            the one agreed in the maintainer's note, not a softened version. */}
        <div
          role="note"
          aria-labelledby="memory-warning-label"
          className="mt-8 rounded-[4px] border border-[var(--alice-border)] border-l-4 border-l-[#d7bd8a] bg-[var(--alice-bg-soft)] p-5 sm:p-6"
        >
          <p id="memory-warning-label" className="font-pixel text-[11px] uppercase tracking-widest text-[#d7bd8a]">
            {copy.warningEyebrow}
          </p>
          <p className="mt-3 text-[17px] leading-relaxed text-[var(--alice-text)]">
            <strong className="text-[var(--alice-heading)]">{copy.warningLead}</strong> {copy.warningBody}
          </p>
        </div>

        {copy.intro.map((paragraph) => (
          <p key={paragraph} className="mt-5 text-lg leading-relaxed text-[var(--alice-text)]">
            {paragraph}
          </p>
        ))}

        <H id="capture">{copy.capture.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{copy.capture.lead}</p>
        <dl className="mt-4 divide-y divide-[var(--alice-border)]">
          {copy.capture.paths.map((path) => (
            <div key={path.title} className="py-5">
              <dt className="text-lg font-semibold text-[var(--alice-heading)]">{path.title}</dt>
              <dd className="mt-2 leading-relaxed text-[var(--alice-text)]">{path.body}</dd>
            </div>
          ))}
        </dl>
        <figure className="mt-8 rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-card-bg)] p-3 sm:p-6">
          <MemoryFlowDiagram copy={copy.diagram} id="memory-flow" />
          <figcaption className="mt-4 text-sm leading-relaxed text-[var(--alice-muted)]">{copy.capture.caption}</figcaption>
        </figure>

        <H id="refused">{copy.refused.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{copy.refused.lead}</p>
        <dl className="mt-4 divide-y divide-[var(--alice-border)]">
          {copy.refused.filters.map((filter) => (
            <div key={filter.title} className="py-5">
              <dt className="text-lg font-semibold text-[var(--alice-heading)]">{filter.title}</dt>
              <dd className="mt-2 leading-relaxed text-[var(--alice-text)]">{filter.body}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 leading-relaxed text-[var(--alice-text)]">{copy.refused.limits}</p>
        <p className="mt-4 leading-relaxed text-[var(--alice-text)]">{copy.refused.guards}</p>

        <H id="stored">{copy.stored.heading}</H>
        <div className="mt-4 overflow-x-auto rounded-[4px] border border-[var(--alice-border)]">
          <table className="w-full text-left text-[15px]">
            <tbody>
              {copy.stored.rows.map((row) => (
                <tr key={row.title} className="border-b border-[var(--alice-border)] align-top last:border-0">
                  <th scope="row" className="w-2/5 p-4 font-semibold text-[var(--alice-heading)]">{row.title}</th>
                  <td className="p-4 text-[var(--alice-text)]">{row.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 leading-relaxed text-[var(--alice-text)]">
          {copy.stored.after}
          <a href={localizeHref(locale, '/trust/#status')} className={link}>{copy.stored.trustLabel}</a>
          {copy.stored.afterTrust}
        </p>

        <H id="use">{copy.used.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{copy.used.p1}</p>
        <p className="mt-4 leading-relaxed text-[var(--alice-text)]">{copy.used.notLead}</p>
        <ul className="mt-2 flex flex-col gap-2 leading-relaxed text-[var(--alice-text)]">
          {copy.used.nots.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="text-[var(--alice-primary)]">×</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 leading-relaxed text-[var(--alice-muted)]">{copy.used.local}</p>

        <H id="control">{copy.control.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{copy.control.lead}</p>
        <ul className="mt-3 flex flex-col gap-2 leading-relaxed text-[var(--alice-text)]">
          {copy.control.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="text-[var(--alice-primary)]">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <H id="coming">{copy.coming.heading}</H>
        <p className="mt-3 leading-relaxed text-[var(--alice-text)]">{copy.coming.lead}</p>
        <ul className="mt-3 flex flex-col gap-3 leading-relaxed text-[var(--alice-text)]">
          {copy.coming.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="shrink-0 font-pixel text-[9px] leading-[1.9] uppercase tracking-widest text-[var(--alice-muted)]">
                {copy.comingTag}
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 leading-relaxed text-[var(--alice-muted)]">{copy.coming.outOfPlan}</p>

        <p className="mt-12 text-sm text-[var(--alice-muted)]">
          {copy.closing.before}
          <a href={copy.docUrl} {...externalLinkProps(copy.docUrl)} className="underline underline-offset-4">
            {copy.closing.docLabel}
          </a>
          {copy.closing.between}
          <a href={localizeHref(locale, '/privacy/')} className="underline underline-offset-4">{copy.closing.privacyLabel}</a>
          {copy.closing.and}
          <a href={localizeHref(locale, '/trust/')} className="underline underline-offset-4">{copy.closing.trustLabel}</a>
          {copy.closing.after}
        </p>
      </main>
      <SiteFooter locale={locale} path="/memory/" />
    </>
  );
}
