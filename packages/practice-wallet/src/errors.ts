/**
 * Refusals the practice wallet raises while it builds a payment or talks to
 * the Mutinynet explorer. The message is English; the code and its figures
 * let an interface say the same thing in its own language.
 */

export type PracticeWalletErrorCode =
  | 'amount_not_whole'
  | 'amount_below_dust'
  | 'fee_rate_too_low'
  | 'recipient_address_invalid'
  | 'change_address_invalid'
  | 'insufficient_funds'
  | 'explorer_unreachable'
  | 'explorer_request_failed'
  | 'explorer_bad_tip'
  | 'explorer_bad_txid';

export type PracticeWalletErrorParams = Record<string, string | number>;

export class PracticeWalletError extends Error {
  readonly code: PracticeWalletErrorCode;
  readonly params: PracticeWalletErrorParams;

  constructor(code: PracticeWalletErrorCode, message: string, params: PracticeWalletErrorParams = {}, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PracticeWalletError';
    this.code = code;
    this.params = params;
  }
}
