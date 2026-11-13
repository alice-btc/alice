import assert from 'node:assert/strict';
import test from 'node:test';
import { withAnswerRuleCorrections } from './answer-rules.ts';

const ALL_NOTES = ['ark-rounds-exits', 'asp-operator', 'lightning-payment-mechanics', 'lightning-invoice', 'replace-by-fee', 'transaction-finality'];

// Correct statements that use a contracted English negation or "neither... nor".
const CORRECT_EN = [
  "The operator can't block a unilateral exit that has enough time to complete before expiry.",
  'Neither the operator nor the server can block your exit while enough time remains before expiry.',
  "The operator doesn't block your exit: with valid exit data you can leave on your own before expiry.",
  "If the route fails, the payment doesn't appear on-chain automatically.",
  "When routing fails, nothing is settled on the blockchain and the wallet won't send it on-chain by itself.",
];

for (const sentence of CORRECT_EN) {
  test(`a contracted negation is a negation: ${sentence}`, () => {
    assert.deepEqual(withAnswerRuleCorrections(sentence, 'en', ALL_NOTES).applied, []);
  });
}

test('the same claims without negation are still corrected', () => {
  assert.ok(withAnswerRuleCorrections('The operator can block your exit at any time.', 'en', ALL_NOTES).applied.includes('ark-operator-blocks-exit'));
  assert.ok(withAnswerRuleCorrections('The payment only appears on the blockchain if the route fails.', 'en', ALL_NOTES).applied.includes('lightning-failure-on-chain'));
});

test('an Alice-and-Bob example is not a claim about Alice App', () => {
  for (const sentence of [
    'Alice and Bob can each check the signature with their own keys.',
    'Bob et Alice peuvent vérifier la signature avec leurs clés publiques.',
    'Alice can check that the signature matches Bob’s public key.',
  ]) {
    assert.deepEqual(withAnswerRuleCorrections(sentence, sentence.includes('peuvent') ? 'fr' : 'en', []).applied, [], sentence);
  }
});

test('a claim that Alice App checks keys is still corrected', () => {
  for (const [sentence, language] of [
    ["Alice App peut t'aider à vérifier si tes clés permettent de signer une sortie.", 'fr'],
    ['Alice App can check your keys and confirm which outputs they sign.', 'en'],
    ["L'application Alice peut vérifier ta phrase de récupération.", 'fr'],
    ['Alice peut vérifier ta phrase de récupération si tu la colles ici.', 'fr'],
    ['Alice can check your recovery phrase if you paste it here.', 'en'],
    ['Alice peut lire tes clés privées pour confirmer la signature.', 'fr'],
    ['Alice can check your keys and tell you which outputs they sign.', 'en'],
  ] as const) {
    assert.ok(withAnswerRuleCorrections(sentence, language, []).applied.includes('alice-app-key-check'), sentence);
  }
});
