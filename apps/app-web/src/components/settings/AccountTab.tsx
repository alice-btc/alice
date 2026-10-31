'use client';

import { useEffect, useState } from 'react';
import { useAccount, type AliceBilling, type AliceCloudUsage } from '@alice-wallet/alice-ai';
import { isBillingPreview, PREVIEW_ACCOUNT_NAME } from './billing-preview';
import { PlanCheckout } from './PlanCheckout';
import { RenewalReminders } from './RenewalReminders';
import { useT, type Locale, type MessageKey } from '@/i18n';
import { SectionHint, SectionLabel, sectionStyle } from './ui';
import { sellsPlans } from '@/lib/store-rules';

const DAY_MS = 24 * 60 * 60 * 1_000;

/** Matches the server's reminder window, so the app and the emails agree. */
const EXPIRY_WARNING_MS = 3 * DAY_MS;

const AMBER = 'var(--alice-warning)';

/** The calendar dates of each interface language. */
const DATE_LOCALES: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR' };

function formatDate(ms: number, locale: Locale): string {
  return new Date(ms).toLocaleDateString(DATE_LOCALES[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const PLAN_LABELS: Record<string, MessageKey> = {
  free: 'settings.account.planFree',
  cloud: 'settings.account.planCloud',
  cloud_plus: 'settings.account.planCloudPlus',
};

/** The same names, cased for the middle of a sentence. */
const PLAN_NAMES: Record<string, MessageKey> = {
  free: 'settings.account.planNameFree',
  cloud: 'settings.account.planNameCloud',
  cloud_plus: 'settings.account.planNameCloudPlus',
};

/**
 * The one gauge this tab shows. Percent-only on paid plans, on purpose: the
 * server meters encrypted bytes, so a token figure would be an estimate
 * dressed up as a measurement. The free plan's request counter is exact and
 * is rendered as counts by the caller instead.
 */
function UsageBar({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-numbers" style={{ fontSize: 13, opacity: 1 }}>
          {label}
        </span>
        <span className="font-numbers" style={{ fontSize: 15 }}>{clamped}%</span>
      </div>
      <div
        className="mt-2"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          height: 12,
          border: '1px solid var(--alice-border)',
          borderRadius: 'var(--alice-radius-control)',
          backgroundColor: 'var(--alice-bg)',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: clamped >= 90 ? AMBER : 'var(--alice-primary)',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Design-review states, reachable only from a dev build via
 * `?billing-preview=cloud|expiring|expired|reminder`. The paid
 * states need a
 * settled Bitcoin payment to exist for real, so without this the only way to
 * review them would be to pay. `NODE_ENV` gating keeps the whole map out of a
 * production bundle.
 */
function previewState(now: number): { usage: AliceCloudUsage; billing: AliceBilling } | null {
  if (process.env.NODE_ENV === 'production') return null;
  const params = new URLSearchParams(window.location.search);
  // A settled payment implies a paid account, so previewing the confirmation
  // without also previewing the plan would show a screen that cannot exist:
  // a thank-you note above a free counter.
  const key = params.get('billing-preview')
    ?? (params.get('checkout-preview') === 'settled' ? 'cloud' : null);
  if (!key) return null;

  const base: AliceBilling = {
    plan: 'cloud',
    purchased_plan: 'cloud',
    plan_expires_at: now + 17 * DAY_MS,
    expired: false,
    period_started_at: now - 13 * DAY_MS,
    period_ends_at: now + 17 * DAY_MS,
    usage_percent: 43,
    input_bytes_used: 12_700_000,
    input_bytes_limit: 29_600_000,
    output_bytes_used: 1_900_000,
    output_bytes_limit: 7_400_000,
    billing_email_masked: null,
  };
  const paidUsage = (billing: AliceBilling): AliceCloudUsage => ({
    kind: 'paid',
    plan: billing.plan as 'cloud',
    percentUsed: billing.usage_percent ?? 0,
    periodEndsAt: billing.period_ends_at,
    expiresAt: billing.plan_expires_at ?? now,
  });

  if (key === 'cloud') return { usage: paidUsage(base), billing: base };
  if (key === 'expiring') {
    const billing = { ...base, plan_expires_at: now + 2 * DAY_MS, period_ends_at: now + 2 * DAY_MS, usage_percent: 91 };
    return { usage: paidUsage(billing), billing };
  }
  if (key === 'reminder') {
    // The other half of the reminders card: an address already given.
    const billing = { ...base, billing_email_masked: 's...i@example.com' };
    return { usage: paidUsage(billing), billing };
  }
  if (key === 'expired') {
    const billing = { ...base, plan: 'free' as const, expired: true, plan_expires_at: now - 4 * DAY_MS, usage_percent: null };
    return { usage: { kind: 'free', remaining: 0, limit: 21 }, billing };
  }
  return null;
}

export function AccountTab() {
  const t = useT();
  const account = useAccount();

  // The snapshot may be minutes old when the user opens settings, and this is
  // exactly the screen where a stale figure misleads. One refresh on entry.
  useEffect(() => {
    void account.refreshAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = Date.now();
  // Applied after mount, never during render: the server cannot see the query
  // string, and a server/client disagreement here is a hydration error.
  const [preview, setPreview] = useState<ReturnType<typeof previewState>>(null);
  useEffect(() => {
    setPreview(previewState(Date.now()));
  }, []);
  const usage = preview?.usage ?? account.cloudUsage;
  const billing = preview?.billing ?? account.billing;

  const paid = usage?.kind === 'paid' ? usage : null;
  const free = usage?.kind === 'free' ? usage : null;
  const expiresSoon = paid !== null && paid.expiresAt - now <= EXPIRY_WARNING_MS;
  // `purchased_plan` outlives the plan itself, which is what lets this screen
  // tell "never paid" apart from "paid, and it lapsed".
  const lapsed = billing !== null && billing.expired;
  // A previewed plan implies a previewed account: see billing-preview.ts.
  const signedInAs = preview !== null
    ? PREVIEW_ACCOUNT_NAME
    : account.account
      ? account.account.username ?? account.account.display_name ?? t('settings.account.signedIn')
      : null;

  return (
    <div>
      {/* What plan this account holds, and until when. */}
      <section style={sectionStyle}>
        <SectionLabel>{t('settings.account.plan')}</SectionLabel>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-numbers" style={{ fontSize: 14 }}>
            {PLAN_LABELS[paid ? paid.plan : 'free'] ? t(PLAN_LABELS[paid ? paid.plan : 'free']) : undefined}
          </span>
          {paid && (
            <span className="font-numbers" style={{ fontSize: 14, opacity: 1 }}>
              {t('settings.account.until', { date: formatDate(paid.expiresAt, t.locale) })}
            </span>
          )}
        </div>

        {paid && expiresSoon && (
          <p className="font-numbers m-0 mt-3" style={{ fontSize: 14, color: AMBER }}>
            {paid.expiresAt - now <= DAY_MS
              ? t('settings.account.endsToday')
              : t('settings.account.endsOn', { date: formatDate(paid.expiresAt, t.locale) })}
            {sellsPlans() && <>{' '}{t('settings.account.noAutoRenew')}</>}
          </p>
        )}

        {lapsed && (
          <p className="font-numbers m-0 mt-3" style={{ fontSize: 14, opacity: 1 }}>
            {(() => {
              const planName = PLAN_NAMES[billing.purchased_plan];
              const params = { plan: planName ? t(planName) : '' };
              return billing.plan_expires_at
                ? t('settings.account.lapsedOn', { ...params, date: formatDate(billing.plan_expires_at, t.locale) })
                : t('settings.account.lapsed', params);
            })()}
            {' '}{t('settings.account.lapsedBody')}
          </p>
        )}

        {!paid && !lapsed && (
          <SectionHint>{t('settings.account.freeHint')}</SectionHint>
        )}
      </section>

      {/* How much of it has been used. */}
      <section style={sectionStyle}>
        <SectionLabel>{t('settings.account.usage')}</SectionLabel>
        <div className="mt-3">
          {paid ? (
            <>
              <UsageBar percent={paid.percentUsed} label={t('settings.account.thisMonth')} />
              {paid.periodEndsAt !== null && (
                <p className="font-numbers m-0 mt-2" style={{ fontSize: 13, opacity: 1 }}>
                  {t('settings.account.resetsOn', { date: formatDate(paid.periodEndsAt, t.locale) })}
                </p>
              )}
              <p className="font-numbers m-0 mt-4" style={{ fontSize: 13, opacity: 1 }}>
                {t('settings.account.usageEstimated')}
              </p>
            </>
          ) : free ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="font-numbers" style={{ fontSize: 13, opacity: 1 }}>
                  {t('settings.account.cloudRequests')}
                </span>
                <span className="font-numbers" style={{ fontSize: 15 }}>
                  {t('settings.account.requestsLeft', { remaining: free.remaining, limit: free.limit })}
                </span>
              </div>
              <SectionHint>{t('settings.account.freeCounted')}</SectionHint>
            </>
          ) : (
            <SectionHint>{t('settings.account.signInForUsage')}</SectionHint>
          )}
        </div>
      </section>

      {/* Buying, renewing, or waiting for a payment to settle; never in the
          phone apps (store-rules.ts). */}
      {sellsPlans() && <PlanCheckout />}

      {/* Only once there is a plan to be reminded about. Offering this to
          someone on the free allowance would be asking for an address to warn
          them about an expiry that cannot happen. */}
      {(paid || lapsed) && <RenewalReminders />}

      {/* The account row: who is signed in, or the invitation to be. */}
      <section style={sectionStyle}>
        <SectionLabel>{t('settings.account.aliceAccount')}</SectionLabel>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="font-numbers truncate" style={{ fontSize: 15 }}>
            {signedInAs ?? t('settings.account.notSignedIn')}
          </span>
          <button
            type="button"
            className="alice-control alice-control--quiet font-numbers"
            onClick={() => account.requestSignIn()}
          >
            {signedInAs ? t('settings.account.manage') : t('settings.account.signIn')}
          </button>
        </div>
        {account.account?.email_masked && (
          <p className="font-numbers m-0 mt-2" style={{ fontSize: 13, opacity: 1 }}>
            {account.account.email_masked}
          </p>
        )}
      </section>
    </div>
  );
}
