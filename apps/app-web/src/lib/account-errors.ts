// The account, payment and faucet refusals of the Worker, in the interface
// language. The Worker answers `{ error: { code, message } }` with an English
// message; the code decides the text here, so nothing changes server side.
// English keeps the Worker's own words, and a code this table does not know
// keeps them in every language.

import { currentLocale, translate, type Locale, type MessageKey, type MessageParams } from '../i18n/translate.ts';

export const ACCOUNT_ERROR_KEYS: Record<string, MessageKey> = {
  // Client-side codes (account-client.ts, account-context.tsx)
  network: 'accountError.network',
  account_request_failed: 'accountError.requestFailed',
  account_not_configured: 'accountError.notConfigured',
  // Sign-in, sessions and the account itself
  rate_limited: 'accountError.rateLimited',
  too_many_new_installations: 'accountError.tooManyNewInstallations',
  invalid_code: 'accountError.invalidCode',
  session_expired: 'accountError.sessionExpired',
  invalid_refresh_token: 'accountError.sessionExpired',
  account_required: 'accountError.accountRequired',
  account_not_found: 'accountError.accountNotFound',
  account_unavailable: 'accountError.accountUnavailable',
  account_creation_failed: 'accountError.accountCreationFailed',
  too_many_accounts: 'accountError.tooManyAccounts',
  installation_blocked: 'accountError.installationBlocked',
  cloud_disabled: 'accountError.cloudDisabled',
  auth_not_configured: 'accountError.authNotConfigured',
  internal_error: 'accountError.internal',
  invalid_email: 'accountError.invalidEmail',
  invalid_username: 'accountError.invalidUsername',
  username_unavailable: 'accountError.usernameUnavailable',
  username_change_too_soon: 'accountError.usernameChangeTooSoon',
  invalid_display_name: 'accountError.invalidDisplayName',
  invalid_password: 'accountError.invalidPassword',
  invalid_credentials: 'accountError.invalidCredentials',
  password_required: 'accountError.passwordRequired',
  current_password_required: 'accountError.currentPasswordRequired',
  identity_already_linked: 'accountError.identityAlreadyLinked',
  identity_not_found: 'accountError.identityNotFound',
  last_identity: 'accountError.lastIdentity',
  email_not_configured: 'accountError.emailNotConfigured',
  email_delivery_failed: 'accountError.emailDeliveryFailed',
  email_resend_too_soon: 'accountError.emailResendTooSoon',
  invalid_preference: 'accountError.invalidPreference',
  // Promo codes, plans and payments
  invalid_promo_code: 'accountError.invalidPromoCode',
  promo_already_redeemed: 'accountError.promoAlreadyRedeemed',
  invalid_plan: 'accountError.invalidPlan',
  invalid_months: 'accountError.invalidMonths',
  billing_unavailable: 'accountError.billingUnavailable',
  billing_upstream_failed: 'accountError.billingUpstreamFailed',
  free_quota_exhausted: 'accountError.freeQuotaExhausted',
  plan_quota_exhausted: 'accountError.planQuotaExhausted',
  // The Playground faucet (test-wallet-faucet.ts)
  already_claimed: 'accountError.faucet.alreadyClaimed',
  invalid_address: 'accountError.faucet.invalidAddress',
  faucet_busy: 'accountError.faucet.busy',
  faucet_not_configured: 'accountError.faucet.notConfigured',
  faucet_exhausted: 'accountError.faucet.exhausted',
  faucet_empty: 'accountError.faucet.empty',
  faucet_failed: 'accountError.faucet.failed',
};

// Two refusals carry a figure in their English words only.
const PASSWORD_LENGTH = /between (\d+) and (\d+) characters/;
const MONTHS_RANGE = /between (\d+) and (\d+) months/;

function textFor(code: string, message: string, locale: Locale): string {
  if (code === 'invalid_password') {
    const range = PASSWORD_LENGTH.exec(message);
    if (range) return translate(locale, 'accountError.passwordLength', { min: range[1], max: range[2] });
  }
  let params: MessageParams | undefined;
  if (code === 'invalid_months') {
    const range = MONTHS_RANGE.exec(message);
    if (!range) return message;
    params = { min: range[1], max: range[2] };
  }
  const key = ACCOUNT_ERROR_KEYS[code];
  return key ? translate(locale, key, params) : message;
}

/** The text of a refusal from its code and the Worker's (or the client's) English words. */
export function accountErrorMessage(code: string | null | undefined, message: string, locale: Locale = currentLocale()): string {
  if (locale === 'en' || !code) return message;
  return textFor(code, message, locale);
}

/**
 * The text of a thrown account or billing error (an AliceAccountError carries
 * `code`); `fallback` when the error has no words of its own.
 */
export function accountErrorText(error: unknown, fallback: string, locale: Locale = currentLocale()): string {
  if (!(error instanceof Error) || !error.message) return fallback;
  const code = (error as Error & { code?: unknown }).code;
  return accountErrorMessage(typeof code === 'string' ? code : null, error.message, locale);
}
