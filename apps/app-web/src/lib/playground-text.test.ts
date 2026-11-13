import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { PRACTICE_LESSONS } from '../../../../packages/alice-content/src/practice-lessons.ts';
import { PracticeEsploraClient, PracticeWalletError, planPracticeTransaction, type PracticeTxReview } from '../../../../packages/practice-wallet/src/index.ts';
import { en } from '../i18n/en.ts';
import { setCurrentLocale } from '../i18n/translate.ts';
import { playgroundErrorText, reviewIssuesText } from './playground.ts';

function planError(params: Partial<Parameters<typeof planPracticeTransaction>[0]>): unknown {
  try {
    planPracticeTransaction({
      utxos: [],
      recipientAddress: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
      amountSats: 1000,
      feeRateSatVb: 1,
      changeAddress: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
      ...params,
    });
  } catch (cause) {
    return cause;
  }
  throw new Error('the plan was expected to fail');
}

afterEach(() => setCurrentLocale('en'));

describe('Playground refusals', () => {
  it('say in English exactly what the practice wallet says', () => {
    for (const cause of [
      planError({ amountSats: 0.5 }),
      planError({ amountSats: 100 }),
      planError({ feeRateSatVb: 0 }),
      planError({ recipientAddress: 'bc1nope' }),
      planError({ changeAddress: 'bc1nope' }),
      planError({ amountSats: 41_000 }),
      new PracticeWalletError('explorer_request_failed', 'Mutinynet explorer request failed (400) for /tx. bad-txns', { status: 400, path: '/tx', detail: 'bad-txns' }),
      new PracticeWalletError('explorer_request_failed', 'Mutinynet explorer request failed (502) for /tx.', { status: 502, path: '/tx', detail: '' }),
    ]) {
      assert.ok(cause instanceof PracticeWalletError);
      assert.equal(playgroundErrorText(cause), cause.message);
    }
  });

  it('are said in French, amounts grouped the French way', () => {
    setCurrentLocale('fr');
    assert.equal(
      playgroundErrorText(planError({ amountSats: 41_000 })),
      'Fonds d’entraînement insuffisants : 0 sats disponibles, il faut 41 000 sats plus les frais.',
    );
    assert.equal(playgroundErrorText(new Error('Unknown error')), 'Unknown error');
  });

  it('localizes a network failure while looking up wallet outputs', async () => {
    const networkError = new TypeError('Failed to fetch');
    const client = new PracticeEsploraClient('https://example.test/api', async () => { throw networkError; });
    await assert.rejects(client.getAddressUtxos('tb1qexample'), (error: unknown) => {
      assert.ok(error instanceof PracticeWalletError);
      assert.equal(error.cause, networkError);
      assert.equal(playgroundErrorText(error), 'Could not reach the Mutinynet explorer.');
      setCurrentLocale('fr');
      assert.equal(playgroundErrorText(error), 'Impossible de joindre l’explorateur Mutinynet.');
      return true;
    });
  });

  it('name the mismatches of a review in the app language', () => {
    const review: PracticeTxReview = {
      txid: 'x',
      outputs: [],
      feeSats: 300,
      matchesPlan: false,
      issues: ['The actual fee is 300 sats, the plan expected 200 sats.'],
      problems: [{ code: 'fee_mismatch', params: { actual: 300, expected: 200 } }],
    };
    assert.equal(reviewIssuesText(review), review.issues.join(' '));
    setCurrentLocale('fr');
    assert.equal(reviewIssuesText(review), 'Les frais réels sont de 300 sats, le plan en prévoyait 200.');
  });
});

describe('Playground lessons', () => {
  it('keep the English of the practice wallet copy', () => {
    for (const [id, lesson] of Object.entries(PRACTICE_LESSONS)) {
      assert.equal(en[`playground.lesson.${id}.title` as keyof typeof en], lesson.title, id);
      assert.equal(en[`playground.lesson.${id}.body` as keyof typeof en], lesson.body, id);
    }
  });
});
