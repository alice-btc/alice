import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, it } from 'node:test';
import { ACCOUNT_ERROR_KEYS, accountErrorMessage, accountErrorText } from './account-errors.ts';

const workerDir = new URL('../../../venice-proxy-worker/src/', import.meta.url);
const workerSource = readdirSync(workerDir)
  .filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'))
  .map(name => readFileSync(new URL(name, workerDir), 'utf8'))
  .join('\n');

class CodedError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

describe('account errors', () => {
  it('keep the Worker’s English words in English', () => {
    assert.equal(accountErrorMessage('invalid_promo_code', 'This promo code is not valid.', 'en'), 'This promo code is not valid.');
    assert.equal(accountErrorMessage('unknown_code', 'Something new.', 'en'), 'Something new.');
  });

  it('are said in French from their code', () => {
    assert.equal(accountErrorMessage('invalid_promo_code', 'This promo code is not valid.', 'fr'), 'Ce code promo n’est pas valide.');
    assert.equal(accountErrorMessage('faucet_busy', 'The faucet is handing out sats to someone else.', 'fr'),
      'Le faucet distribue des sats à quelqu’un d’autre. Réessayez dans quelques secondes.');
    assert.equal(accountErrorMessage('network', 'Network error. Check your connection and try again.', 'fr'),
      'Erreur réseau. Vérifiez votre connexion et réessayez.');
    const unavailable = 'Alice accounts are not fully configured.';
    assert.equal(accountErrorMessage('account_email_unavailable', unavailable, 'fr'),
      'Les comptes Alice par e-mail sont indisponibles pour le moment.');
    assert.equal(accountErrorMessage('account_email_unavailable', unavailable, 'en'), unavailable);
  });

  it('carry the figures the English words hold', () => {
    assert.equal(accountErrorMessage('invalid_password', 'Use between 15 and 128 characters.', 'fr'), 'Utilisez entre 15 et 128 caractères.');
    assert.equal(accountErrorMessage('invalid_password', 'Enter a valid password.', 'fr'), 'Saisissez un mot de passe valide.');
    assert.equal(accountErrorMessage('invalid_months', 'Choose between 1 and 24 months.', 'fr'), 'Choisissez entre 1 et 24 mois.');
  });

  it('fall back to the English words for a code without a translation', () => {
    assert.equal(accountErrorMessage('admin_required', 'Alice admin access is required.', 'fr'), 'Alice admin access is required.');
    assert.equal(accountErrorMessage(null, 'Plain words.', 'fr'), 'Plain words.');
  });

  it('read the code of a thrown error, and the fallback when there is none', () => {
    assert.equal(accountErrorText(new CodedError('billing_unavailable', 'Payments are not available yet.'), 'fallback', 'fr'),
      'Les paiements ne sont pas encore disponibles.');
    assert.equal(accountErrorText(new Error('Failed to fetch'), 'fallback', 'fr'), 'Failed to fetch');
    assert.equal(accountErrorText(null, 'fallback', 'fr'), 'fallback');
  });

  it('only name codes the Worker or the client actually sends', () => {
    const clientCodes = new Set(['network', 'account_request_failed', 'account_not_configured']);
    for (const code of Object.keys(ACCOUNT_ERROR_KEYS)) {
      if (clientCodes.has(code)) continue;
      assert.ok(workerSource.includes(`'${code}'`), code);
    }
  });
});
