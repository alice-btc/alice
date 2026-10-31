'use client';

import { useEffect, useState } from 'react';
import { APP_URL, PROXY_URL } from '@/lib/site';
import { externalLinkProps } from '@/lib/links';
import { NUMBER_LOCALES, type Locale } from '@/i18n/config';
import type { PricingCopy } from '@/i18n/dictionaries/pricing';

type PlansCopy = PricingCopy['plans'];

/**
 * The price list, quoted the way Alice charges: satoshis first, the euro
 * anchor underneath as a landmark with a "roughly" sign.
 *
 * The satoshi figures are fetched from the same public endpoint the app quotes
 * from, so the site can never show a different price than checkout asks for.
 * While the rate is loading, or if the endpoint is unreachable, the status is explicit and the euro anchor stays: a wrong price is worse than a late one.
 */

type PlanQuote = {
  plan: string;
  price_sats: number | null;
  price_minor: number;
};

// Straight to the account panel of the app, where the top-up happens.
const ACCOUNT_URL = `${APP_URL}/?settings=account`;

const FALLBACK_ANCHOR: Record<'cloud', number> = {
  cloud: 500,
};

// English keeps plain spaces around the figures; French binds them to the
// number with a no-break space, as French typography wants before a unit.
const UNIT_SPACE: Record<Locale, string> = { en: ' ', fr: '\u00a0' };

function formatSats(sats: number, locale: Locale): string {
  return `${sats.toLocaleString(NUMBER_LOCALES[locale])}${UNIT_SPACE[locale]}sats`;
}

function formatAnchor(minor: number, locale: Locale): string {
  const whole = minor % 100 === 0;
  const major = new Intl.NumberFormat(NUMBER_LOCALES[locale], {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(minor / 100);
  return `≈${UNIT_SPACE[locale]}${major}${UNIT_SPACE[locale]}€`;
}

function PriceLine({
  quote,
  plan,
  loading,
  locale,
  copy,
}: {
  quote: PlanQuote | null;
  plan: 'cloud';
  loading: boolean;
  locale: Locale;
  copy: PlansCopy;
}) {
  return (
    <div>
      <div className="text-3xl font-semibold text-[var(--alice-heading)]">
        {quote?.price_sats != null ? formatSats(quote.price_sats, locale) : <span className="text-base font-normal text-[var(--alice-muted)]" role="status">{loading ? copy.loading : copy.unavailable}</span>}
        {quote?.price_sats != null && <span className="ml-2 text-base font-normal text-[var(--alice-muted)]">{copy.perMonth}</span>}
      </div>
      <div className="mt-1 text-sm text-[var(--alice-muted)]">
        {formatAnchor(quote?.price_minor ?? FALLBACK_ANCHOR[plan], locale)}
      </div>
    </div>
  );
}

export function PricingPlans({ locale, copy }: { locale: Locale; copy: PlansCopy }) {
  const [quotes, setQuotes] = useState<PlanQuote[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${PROXY_URL}/billing/plans`)
      .then(response => response.ok ? response.json() : null)
      .then((body: { plans?: PlanQuote[] } | null) => {
        if (!cancelled && body?.plans) setQuotes(body.plans);
      })
      .catch(() => { /* Keep the euro reference when the live quote is unavailable. */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const quoteFor = (plan: 'cloud') =>
    quotes?.find(quote => quote.plan === plan) ?? null;

  const cardClass =
    'flex flex-col gap-5 rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-card-bg)] p-8';

  // Two cards since Cloud+ was withdrawn. Three columns would leave a gap
  // that reads as a plan still loading.
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Free: the AI you already have, not a trial of the paid one. */}
      <div className={cardClass}>
        <div>
          <h3 className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
            {copy.free.name}
          </h3>
          <div className="mt-4 text-3xl font-semibold text-[var(--alice-heading)]">
            {copy.free.amount}<span className="ml-2 text-base font-normal text-[var(--alice-muted)]">{copy.free.period}</span>
          </div>
        </div>
        <ul className="flex flex-col gap-3 text-[15px] leading-relaxed text-[var(--alice-text)]">
          {copy.free.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-auto text-sm text-[var(--alice-muted)]">
          {copy.free.note}
        </p>
      </div>

      {/* Cloud */}
      <div className={cardClass}>
        <div>
          <h3 className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
            {copy.cloud.name}
          </h3>
          <div className="mt-4">
            <PriceLine quote={quoteFor('cloud')} plan="cloud" loading={loading} locale={locale} copy={copy} />
          </div>
        </div>
        <ul className="flex flex-col gap-3 text-[15px] leading-relaxed text-[var(--alice-text)]">
          {copy.cloud.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-auto text-sm text-[var(--alice-muted)]">
          {copy.cloud.note}
        </p>
      </div>

      <div className="lg:col-span-2">
        <a
          href={ACCOUNT_URL}
          {...externalLinkProps(ACCOUNT_URL)}
          className="cta px-6 py-3 text-[15px]"
        >
          {copy.cta}
        </a>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--alice-muted)]">
          {copy.footnote}
        </p>
      </div>
    </div>
  );
}
