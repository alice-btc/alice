// "Don't trust, verify", a terminal-styled checklist where every claim links
// to its proof. On-brand with the pixel/terminal aesthetic. Every entry must
// point at something a reader can open: a claim whose proof is only promised
// is the one thing this block cannot contain.
import { SOURCE_URL } from '@/lib/site';
import { externalLinkProps } from '@/lib/links';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/i18n/paths';
import type { HomeCopy } from '@/i18n/dictionaries/home';

// Where each claim's proof lives. The claims and the link labels are in the
// home dictionary, in this order.
const PROOFS = ['/trust/', '/#sovereignty', '/privacy/', '/trust/#status', SOURCE_URL];

// Width-agnostic: the parent decides the column. Today it renders inside the
// hero's left column (HeroTour), right under the claims it backs up.
export function VerifyBlock({ locale, copy }: { locale: Locale; copy: HomeCopy['verify'] }) {
  const claims = copy.claims.map((claim, i) => ({ ...claim, href: localizeHref(locale, PROOFS[i]) }));
  return (
    <section id="verify" className="pt-16">
      <h2 className="text-3xl font-semibold">{copy.title}</h2>
      <p className="mt-3 text-lg text-[var(--alice-muted)]">
        {copy.lead}
      </p>

      <div className="mt-8 overflow-hidden rounded-[4px] border border-[var(--alice-border)] bg-transparent">
        <ul className="divide-y divide-[var(--alice-border)]">
          {claims.map((c) => (
            <li key={c.claim} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <span aria-hidden className="text-[var(--alice-primary)]">✓</span>
              <span className="min-w-[160px] flex-1 text-[14px] text-[var(--alice-heading)]">{c.claim}</span>
              <a
                href={c.href}
                // Off-site proofs open in a new tab, and no referrer follows
                // the reader there: a privacy page that leaks where you came
                // from would undercut the claim right above it.
                {...externalLinkProps(c.href)}
                className="shrink-0 text-[13px] text-[var(--alice-primary)] hover:underline"
              >
                {c.proof} →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
