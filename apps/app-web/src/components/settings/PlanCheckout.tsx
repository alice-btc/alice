'use client';

import { useCallback, useEffect, useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import { CHECK_ICON, CLOCK_ICON } from '@/lib/atelier-icons';
import {
  getPlanQuotes,
  useAccount,
  type AlicePaidPlan,
  type AlicePendingCheckout,
  type AlicePlanQuotes,
} from '@alice-wallet/alice-ai';
import { isBillingPreview } from './billing-preview';
import { translate, useT, type Locale, type MessageKey } from '@/i18n';
import { SectionHint, SectionLabel, sectionStyle } from './ui';
import { openExternalUrl } from '@/lib/open-external';

const MONTH_CHOICES = [1, 3, 6, 12];

const PLANS: {
  id: AlicePaidPlan;
  name: string;
  pitch: MessageKey;
}[] = [
  {
    id: 'cloud',
    name: 'CLOUD',
    pitch: 'settings.checkout.cloudPitch',
  },
];

/** The digit grouping of each interface language. */
const NUMBER_LOCALES: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR' };

/**
 * The price. Satoshis, because that is the unit the invoice is in and the unit
 * the buyer pays in.
 */
function formatSats(sats: number, locale: Locale): string {
  return translate(locale, 'settings.checkout.sats', { amount: sats.toLocaleString(NUMBER_LOCALES[locale]) });
}

const CURRENCY_SYMBOL: Record<string, string> = { EUR: '\u20ac', USD: '$', CHF: 'CHF' };

/**
 * The same price read a second way, for people who still think in fiat.
 *
 * It carries a "roughly" sign and it is never the figure charged. The satoshi
 * amount is rounded and pinned to a rate that only moves a few times a day, so
 * the two agree closely and not exactly, and pretending otherwise would be the
 * one dishonest thing this line could do. The day fiat payment exists, this
 * stops being a landmark and becomes a price the buyer can choose.
 */
function formatAnchor(minor: number, currency: string, locale: Locale): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  const major = minor / 100;
  const digits = minor % 100 === 0 ? 0 : 2;
  const amount = new Intl.NumberFormat(NUMBER_LOCALES[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: false,
  }).format(major);
  return `\u2248 ${amount} ${symbol}`;
}

/**
 * Buying a plan, and then waiting for it.
 *
 * The waiting half is not a detail. A Bitcoin payment does not settle when the
 * buyer closes the payment page: the plan appears only once BTCPay's signed
 * webhook reaches the server, which can be minutes later and after the app has
 * been closed. Without a visible pending state, a paid user sees a free
 * account and concludes Alice took the money.
 */
export function PlanCheckout() {
  const t = useT();
  const account = useAccount();
  const [plan, setPlan] = useState<AlicePaidPlan>('cloud');
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** A purchase waiting on the account creation it triggered. */
  const [intent, setIntent] = useState<{ plan: AlicePaidPlan; months: number } | null>(null);

  // The price list. Fetched rather than hardcoded: the satoshi figure follows
  // an exchange rate, and only the server knows which one is pinned.
  const [quotes, setQuotes] = useState<AlicePlanQuotes | null>(null);
  useEffect(() => {
    let cancelled = false;
    getPlanQuotes()
      .then(next => { if (!cancelled) setQuotes(next); })
      .catch(() => {
        // In production a missing price means no price: the buy button goes
        // dead rather than guessing at a rate. Locally the worker serving this
        // route is usually not the one deployed, so a stand-in keeps the
        // screen reviewable. It is a placeholder, not a quote, and it never
        // reaches a build users see.
        if (cancelled || process.env.NODE_ENV === 'production') return;
        setQuotes({
          currency: 'SAT',
          anchor_currency: 'EUR',
          step_sats: 100,
          quoted_at: Date.now(),
          plans: [
            { plan: 'cloud', price_sats: 5_600, price_minor: 500 },
          ],
        });
      });
    return () => { cancelled = true; };
  }, []);

  // Design review for the waiting state, which otherwise requires an unsettled
  // Bitcoin payment to exist. Dev only, and applied after mount so the server
  // and client render the same thing. The settled state is no longer here: it
  // belongs to PaymentConfirmedDialog, and `?checkout-preview=settled` shows
  // that dialog instead.
  const [preview, setPreview] = useState<'pending' | null>(null);
  // A previewed paid plan implies a previewed account, so the buy button must
  // not offer to create one: see billing-preview.ts.
  const [previewSignedIn, setPreviewSignedIn] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (new URLSearchParams(window.location.search).get('checkout-preview') === 'pending') {
      setPreview('pending');
    }
    setPreviewSignedIn(isBillingPreview());
  }, []);

  const previewPending: AlicePendingCheckout = {
    invoice_id: 'preview',
    plan: 'cloud',
    months: 3,
    amount_sats: 16_700,
    started_at: Date.now(),
    previous_expires_at: null,
  };
  const pending = preview === 'pending' ? previewPending : account.pendingCheckout;

  const openCheckout = useCallback(async (
    forPlan: AlicePaidPlan,
    forMonths: number,
  ) => {
    setBusy(true);
    setError(null);
    try {
      const checkout = await account.startCheckout(forPlan, forMonths);
      // A new tab, not a redirect: the app keeps running and keeps polling, so
      // the user comes back to a screen that already knows what happened.
      void openExternalUrl(checkout.checkout_url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('settings.checkout.startFailed'));
    } finally {
      setBusy(false);
    }
  }, [account, t]);

  const handleBuy = async () => {
    // An anonymous session can hold a plan, but nothing can recover it: the
    // entitlement is tied to this installation alone. Someone who reinstalls
    // or switches phone would lose a plan they paid for, with no way back. So
    // an identity comes first, and it exists for recovery, not for gatekeeping.
    if (account.status !== 'signed_in') {
      setIntent({ plan, months });
      account.requestSignIn('purchase');
      return;
    }
    await openCheckout(plan, months);
  };

  // Resume the purchase the account was created for, rather than dropping the
  // user back at the start of a choice they already made.
  //
  // Waiting for the dialog to close, and not merely for the session to exist,
  // is the whole point. A verified email signs the session in while the person
  // is still choosing a username and a password, and resuming there threw an
  // invoice on screen in the middle of the form they were filling in. An
  // account is finished when its own screen says so.
  useEffect(() => {
    if (!intent || account.status !== 'signed_in' || account.signInOpen) return;
    const resumed = intent;
    setIntent(null);
    void openCheckout(resumed.plan, resumed.months);
  }, [intent, account.status, account.signInOpen, openCheckout]);

  if (pending) {
    return (
      // The status changes on its own once the payment confirms; a live
      // region is what lets a screen reader hear that happen.
      <section style={sectionStyle} role="status" aria-live="polite">
        <SectionLabel>{t('settings.checkout.waiting')}</SectionLabel>
        <SvgIcon svg={CLOCK_ICON} size={20} color="currentColor" />
        <p className="font-numbers m-0 mt-3" style={{ fontSize: 15, lineHeight: '21px' }}>
          {t('settings.checkout.waitingBody', { amount: formatSats(pending.amount_sats, t.locale) })}
        </p>
        <p className="font-numbers m-0 mt-2" style={{ fontSize: 14, opacity: 1 }}>
          {t('settings.checkout.canClose')}
        </p>
        <button
          type="button"
          className="alice-control alice-control--quiet font-numbers mt-4"
          onClick={() => void account.dismissPendingCheckout()}
        >
          {t('settings.checkout.hideNotice')}
        </button>
        <SectionHint>{t('settings.checkout.hideNoticeHint')}</SectionHint>
      </section>
    );
  }

  const selected = quotes?.plans.find(q => q.plan === plan);
  const anchor = quotes?.anchor_currency ?? 'EUR';
  const total = selected?.price_sats == null ? null : selected.price_sats * months;
  const totalAnchor = selected == null ? null : selected.price_minor * months;
  const needsAccount = account.status !== 'signed_in' && !previewSignedIn;

  return (
    <section style={sectionStyle}>
      <SectionLabel>{t('settings.checkout.title')}</SectionLabel>
      <SectionHint>{t('settings.checkout.hint')}</SectionHint>

      <div className="flex flex-col gap-2">
        {PLANS.map(option => {
          const active = option.id === plan;
          const quote = quotes?.plans.find(q => q.plan === option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setPlan(option.id)}
              aria-pressed={active}
              className="alice-control alice-control--option font-numbers text-left"
              style={{ display: 'block' }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-numbers flex items-center gap-2" style={{ fontSize: 13 }}>
                  {option.name}
                  {active && <SvgIcon svg={CHECK_ICON} size={16} color="currentColor" />}
                </span>
                <span className="text-right">
                  <span className="font-numbers block" style={{ fontSize: 15 }}>
                    {quote?.price_sats == null
                      ? '...'
                      : t('settings.checkout.perMonth', { price: formatSats(quote.price_sats, t.locale) })}
                  </span>
                  {quote && (
                    <span
                      className="font-numbers block"
                      style={{ fontSize: 12, opacity: 1 }}
                    >
                      {formatAnchor(quote.price_minor, anchor, t.locale)}
                    </span>
                  )}
                </span>
              </div>
              <p className="font-numbers m-0 mt-1" style={{ fontSize: 13, opacity: 1 }}>
                {t(option.pitch)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <SectionLabel>{t('settings.checkout.payAhead')}</SectionLabel>
        <SectionHint>{t('settings.checkout.payAheadHint')}</SectionHint>
        <div className="flex gap-2">
          {MONTH_CHOICES.map(choice => {
            const active = choice === months;
            return (
              <button
                key={choice}
                type="button"
                onClick={() => setMonths(choice)}
                aria-pressed={active}
                className="alice-control alice-control--choice font-numbers"
                style={{ flex: 1 }}
              >
                {t.plural('settings.checkout.monthChoice', choice)}
              </button>
            );
          })}
        </div>
      </div>

      <p className="font-numbers mt-4 text-sm">{t.plural('settings.checkout.months', months)} · {total === null ? t('settings.checkout.priceUnavailable') : t('settings.checkout.total', { amount: formatSats(total, t.locale) })}</p>

      {error && (
        <p className="font-numbers m-0 mt-3" style={{ fontSize: 14, color: 'var(--alice-danger)' }}>
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={busy || total === null}
        onClick={() => void handleBuy()}
        className="alice-control alice-control--primary font-numbers mt-4 w-full"
      >
        {busy
          ? t('settings.checkout.opening')
          : total === null
            ? t('settings.checkout.priceUnavailableButton')
            : needsAccount
              ? t('settings.checkout.createAndPay', { amount: formatSats(total, t.locale) })
              : t('settings.checkout.pay', { amount: formatSats(total, t.locale) })}
      </button>

      {total !== null && totalAnchor !== null && (
        <p
          className="font-numbers m-0 mt-2 text-center"
          style={{ fontSize: 12, opacity: 1 }}
        >
          {formatAnchor(totalAnchor, anchor, t.locale)}
        </p>
      )}

      {needsAccount && (
        <SectionHint>{t('settings.checkout.needsAccount')}</SectionHint>
      )}
    </section>
  );
}
