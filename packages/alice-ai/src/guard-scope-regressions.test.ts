import assert from 'node:assert/strict';
import test from 'node:test';
import { aliceMemoryRefusalReason } from './alice-memory-core.ts';
import { answerRuleViolationsIn, withAnswerRuleCorrections } from './answer-rules.ts';
import { groundedRbfRecipient } from './grounded-rbf-recipient.ts';
import { isUnconfirmedReceiptReplacementQuestion } from './retrieval-topic-cues.ts';
import { liveNetworkValueReason } from './live-network-request.ts';
import { isMajorityHashpowerQuestion } from './majority-hashpower.ts';
import { planAliceTurn } from './turn-planner.ts';
import { utxoExample } from './utxo-arithmetic.ts';
import { walletTroubleshootingReason } from './wallet-troubleshooting.ts';

// Each guard below supplies a fixed text, a checked reference or a fixed
// calculation. These cases share the guard's vocabulary without asking what
// the guard answers.

test('a judgment or a lesson about Bitcoin is not a request for its price', () => {
  for (const question of [
    'What makes Bitcoin worth using today?',
    'Is Bitcoin worth it right now?',
    'Quel est le meilleur cours sur Bitcoin actuellement ?',
  ]) assert.equal(liveNetworkValueReason(question), null, question);
  for (const question of [
    'How much is 1 BTC worth right now?',
    'Quel est le cours du bitcoin actuellement ?',
  ]) assert.equal(liveNetworkValueReason(question), 'bitcoin-market-price', question);
});

test('a stated confirmation count is a question, not a payment to look up', () => {
  for (const question of [
    'Is my transaction final after 6 confirmations?',
    'Est-ce que ma transaction est définitive après 6 confirmations ?',
  ]) assert.equal(planAliceTurn(question).walletStateReason, null, question);
  for (const question of [
    'Is my payment confirmed?',
    'Est-ce que mon paiement est confirmé ?',
  ]) assert.equal(planAliceTurn(question).walletStateReason, 'payment-status', question);
});

test('a seed backup question needs a digital medium that is proposed, and a judgment about it', () => {
  for (const question of [
    'Is a hardware wallet secure if I never take a photo of my seed phrase?',
    'Est-ce que Ledger Recover envoie ma phrase de récupération sur le cloud ?',
  ]) assert.equal(walletTroubleshootingReason(question), null, question);
  for (const question of [
    'Is it safe to keep a photo of my seed phrase?',
    'Est-ce sûr de garder une photo de ma phrase de récupération ?',
  ]) assert.equal(walletTroubleshootingReason(question), 'seed-digital-backup', question);
});

test('a count of identical inputs is not read as a single input', () => {
  assert.equal(utxoExample('Imagine 3 inputs of 400 sats each, a payment of 200 sats and a fee of 50 sats. What is the change?'), null);
  assert.equal(utxoExample('Imagine 3 entrées de 400 sats chacune, un paiement de 200 sats et des frais de 50 sats.'), null);
  assert.equal(utxoExample('Imagine inputs of 400 and 600 sats, a payment of 700 sats and a fee of 50 sats.')?.change, 250);
});

test('memory refuses the wallet secrets a user is most likely to dictate', () => {
  for (const text of [
    'my passphrase is tulip-garden-42',
    'ma phrase de passe est tulipe-jardin-42',
    'mon code pin est 4921',
    'ma phrase mnemonique est rangee dans le tiroir du bureau',
    'my seed is kept in the kitchen drawer',
    'my 24 words are in the safe',
    'mes 12 mots sont dans le coffre',
  ]) assert.equal(aliceMemoryRefusalReason(text), 'secret', text);
  assert.equal(aliceMemoryRefusalReason('prefers short answers'), null);
});

test('the French "attaque des 51 %" is a majority attack question', () => {
  assert.equal(isMajorityHashpowerQuestion('Que permet une attaque des 51 % ?'), true);
});

test('a correction written for a second generation is never appended to an answer', () => {
  const answer = 'An input spends an old output. For example, if you spend a UTXO of 10000 sats, the rest returns as change.';
  const checked = withAnswerRuleCorrections(answer, 'en', ['transaction-inputs-outputs'], 'How does change work in a Bitcoin transaction?');
  assert.doesNotMatch(checked.text, /Answer in three short sentences/);
  assert.ok(!checked.applied.includes('utxo-unrequested-numeric-example'));
});

const UNCONFIRMED_RECEIPT = {
  en: 'Someone paid me with an unconfirmed transaction. Can the sender still change what I receive?',
  fr: 'Un client m’a payé mais la transaction n’est pas encore confirmée. Peut-il encore annuler le paiement ?',
};

test('a recipient asking whether an unconfirmed payment can still change is a replacement question', () => {
  for (const question of Object.values(UNCONFIRMED_RECEIPT)) assert.equal(isUnconfirmedReceiptReplacementQuestion(question), true, question);
  for (const question of [
    'How do I speed up my own unconfirmed transaction?',
    'My customer paid me over Lightning and it is not yet confirmed. Can they cancel it?',
    'I received a confirmed payment. Can the sender change it?',
    'Comment accélérer ma transaction non confirmée ?',
  ]) assert.equal(isUnconfirmedReceiptReplacementQuestion(question), false, question);
});

test('that question receives the checked replacement text once the RBF note is retrieved', () => {
  const en = groundedRbfRecipient(UNCONFIRMED_RECEIPT.en, 'en', 'Topic: Replace-by-fee\nA note.')!;
  assert.match(en, /^Yes\. Until a transaction is confirmed, its sender can replace it/);
  assert.match(en, /does not guarantee settlement/);
  const fr = groundedRbfRecipient(UNCONFIRMED_RECEIPT.fr, 'fr', 'Topic: Augmenter les frais avec RBF\nUne fiche.')!;
  assert.match(fr, /^Oui\. Tant qu’une transaction n’est pas confirmée, son expéditeur peut la remplacer/);
  assert.match(fr, /ne garantit pas le règlement/);
  assert.equal(groundedRbfRecipient(UNCONFIRMED_RECEIPT.en, 'en', 'Topic: Change outputs\nAnother note.'), null);
});

test('an answer that calls an unconfirmed payment fixed is a violation, a correct one is not', () => {
  const notes = ['replace-by-fee'];
  for (const answer of [
    'No, the sender cannot change the destination address of a payment you have already received, even if the transaction is unconfirmed.',
    'While it is unconfirmed, the transaction cannot be changed by anyone.',
    'An unconfirmed payment is final as soon as you see it.',
    'Non, l’expéditeur ne peut plus modifier le paiement, même si la transaction est non confirmée.',
    'Un paiement non confirmé est définitif dès qu’il apparaît.',
  ]) assert.ok(answerRuleViolationsIn(answer, notes, UNCONFIRMED_RECEIPT.en).includes('unconfirmed-payment-final'), answer);
  for (const answer of [
    'Yes. Until it is confirmed, the sender can replace the transaction with one that pays a different address.',
    'Once it is confirmed, the sender cannot change the transaction, which was still replaceable while unconfirmed.',
    'A third party cannot replace an unconfirmed transaction without the keys that signed it.',
    'Oui. Tant que la transaction n’est pas confirmée, l’expéditeur peut la remplacer.',
    'Une fois confirmée, l’expéditeur ne peut plus modifier la transaction, alors qu’elle restait remplaçable tant qu’elle était non confirmée.',
  ]) assert.ok(!answerRuleViolationsIn(answer, notes, UNCONFIRMED_RECEIPT.en).includes('unconfirmed-payment-final'), answer);
});
