import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ragQueryChunkBudget,
  isGeneralLightningPaymentExplanation,
  isLightningPaymentWalkthrough,
  isLightningRoutingStateQuestion,
  isGeneralBitcoinFeeQuestion,
  isSmallOutputSpendingQuestion,
  isMultisigRecoveryQuestion,
} from './rag-query-policy.ts';

test('Lightning overview classifier excludes specialist qualifiers', () => {
  assert.equal(isGeneralLightningPaymentExplanation('Explain how a Lightning payment works at a level suited to my experience.'), true);
  assert.equal(isGeneralLightningPaymentExplanation('Explique comment fonctionne un paiement Lightning selon mon expérience.'), true);
  for (const query of [
    'Explain how Lightning payment privacy works at a level suited to my experience.',
    'Explain how a Lightning payment works with expired invoices at a level suited to my experience.',
    'Explain how a Lightning payment fee works.',
  ]) assert.equal(isGeneralLightningPaymentExplanation(query), false, query);
});

test('general L1 fee education recognizes English yes/no questions, not only Why/What/How starts', () => {
  for (const query of [
    'Does sending a larger amount increase the Bitcoin network fee?',
    'Will sending more bitcoin raise the transaction fee?',
    'Is the Bitcoin fee higher if I send a bigger amount?',
    'Can sending a greater amount change the on-chain fee?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), true, query);
});

test('general L1 fee education recognizes French subject-before-question phrasing', () => {
  for (const query of [
    'Envoyer un montant plus important change-t-il les frais du réseau ?',
    "Si j'envoie une somme plus importante, les frais augmentent-ils ?",
    'Un montant plus gros fait-il grimper les frais sur Bitcoin ?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), true, query);
});

test('general L1 fee education still excludes other rails, troubleshooting and comparisons', () => {
  for (const query of [
    'Does sending a larger amount increase the Lightning fee?',
    'Will RBF change the fee if I send a bigger amount?',
    'Is the fee higher if I send more and my transaction is stuck?',
    'Does sending a bigger amount compare favorably to Lightning fees?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), false, query);
});

test('general L1 fee education excludes product/subscription and service pricing', () => {
  for (const query of [
    'Does my Alice subscription fee change if I send more messages?',
    "Est-ce que l'abonnement Alice coûte plus cher si j'envoie plus de messages ?",
    'Will withdrawing a larger amount from my exchange cost more in fees?',
    'Why does a small PayPal payment cost almost the same fee as a large one?',
    'What are card payment fees?',
    'Pourquoi les frais de paiement bancaire sont-ils élevés ?',
    'Est-ce que retirer un montant plus important sur ma plateforme coûte plus de frais ?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), false, query);
});

test('general L1 fee education excludes halving/miner-revenue framing', () => {
  for (const query of [
    'Does the halving change Bitcoin transaction fees?',
    'Will miner rewards from the halving affect how fees work?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), false, query);
});

test('general L1 fee education excludes subsidy and reward questions even when they explicitly mention transaction fees', () => {
  for (const query of [
    'How do Bitcoin transaction fees relate to the block subsidy?',
    'How do Bitcoin transaction fees relate to block subsidies?',
    'Do Bitcoin transaction fees depend on the miner reward?',
    'Do Bitcoin transaction fees depend on miner rewards?',
    'La subvention de bloc change-t-elle les frais de transaction Bitcoin ?',
    'Les subventions de bloc changent-elles les frais de transaction Bitcoin ?',
    'La récompense du mineur change-t-elle les frais de transaction Bitcoin ?',
    'Les récompenses des mineurs changent-elles les frais de transaction Bitcoin ?',
    'Alors que la subvention de bloc diminue de moitié avec le temps, les mineurs vont-ils simplement compter sur les frais de transaction ?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), false, query);
});

test('general L1 fee education still accepts ordinary fee questions without subsidy/reward vocabulary', () => {
  for (const query of [
    'Does sending a larger amount increase the Bitcoin network fee?',
    "Si j'envoie une somme plus importante, les frais augmentent-ils ?",
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), true, query);
});

test('general L1 fee education does not turn bare statements into questions', () => {
  for (const query of [
    'Sending more bitcoin increases the network fee.',
    'Envoyer un montant plus important augmente les frais du reseau.',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), false, query);
});

test('small-output spending questions require both a tiny-output cue and a spend/economic/refusal cue', () => {
  for (const query of [
    'Why is a tiny output uneconomic to spend?',
    "Pourquoi une sortie très petite n'est pas rentable à dépenser ?",
    'Why does my wallet refuse to spend such a small amount?',
    'Pourquoi le réseau refuse de dépenser une si petite somme ?',
  ]) assert.equal(isSmallOutputSpendingQuestion(query), true, query);
});

test('small-output spending questions do not capture onboarding or unit definitions', () => {
  for (const query of [
    'How do I make my first small payment in bitcoin?',
    "Comment faire mon premier petit paiement en bitcoin ?",
    'What is a satoshi?',
    "Qu'est-ce qu'un satoshi par rapport au bitcoin ?",
    'This is a small amount, is that okay for my first transaction?',
  ]) assert.equal(isSmallOutputSpendingQuestion(query), false, query);
});

test('multisig recovery questions require multisig plus a backup/recovery/descriptor/configuration cue', () => {
  for (const query of [
    'How do I back up a multisig wallet?',
    'Comment sauvegarder un portefeuille multisig ?',
    'How do I recover a multisig wallet from its descriptor?',
    'Quel quorum configurer pour mon wallet multi-signature ?',
  ]) assert.equal(isMultisigRecoveryQuestion(query), true, query);
});

test('multisig recovery questions do not capture a bare multisig definition or seed-only recovery', () => {
  for (const query of [
    'What is multisig?',
    "Qu'est-ce que le multisig ?",
    'How do I recover my wallet from my seed phrase?',
    'Comment récupérer mon portefeuille avec ma phrase de sauvegarde ?',
  ]) assert.equal(isMultisigRecoveryQuestion(query), false, query);
});

test('budget classification invariant: fee/small-output/multisig anchors do not change ordinary shape sizing', () => {
  for (const query of [
    'Does sending a larger amount increase the Bitcoin network fee?',
    'Why is a tiny output uneconomic to spend?',
    'How do I back up a multisig wallet?',
  ]) {
    assert.equal(ragQueryChunkBudget(query, true, () => false), 1);
    assert.equal(ragQueryChunkBudget(query, true, () => true), 2);
    assert.equal(ragQueryChunkBudget(query, false, () => false), 3);
  }
});


test('tiny-output intent handles FR/EN plurals without overriding other rails or comparisons', () => {
  for (const query of [
    'Why do wallets sometimes refuse to spend very small amounts of bitcoin?',
    'Pourquoi certains portefeuilles refusent-ils de dépenser de très petits montants en bitcoin ?',
    'Why are small UTXOs uneconomic to spend?',
    'Pourquoi des sorties minuscules ne peuvent pas être dépensées ?',
  ]) assert.equal(isSmallOutputSpendingQuestion(query), true, query);
  for (const query of [
    'Why does my Lightning wallet refuse to spend small amounts?',
    'Pourquoi Ark refuse de dépenser une petite somme ?',
    'Compare uneconomic tiny Bitcoin outputs versus Lightning payments.',
  ]) assert.equal(isSmallOutputSpendingQuestion(query), false, query);
  assert.equal(isMultisigRecoveryQuestion('Compare multisig recovery versus single-key recovery.'), false);
});


test('fee yes/no support does not swallow batching or consolidation explanations', () => {
  for (const query of [
    'Si je les regroupe en une seule transaction, ça réduit vraiment les frais ?',
    'Will batching several Bitcoin payments together save fees?',
    'Does consolidating small outputs reduce later Bitcoin fees?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), false, query);
});

test('a general fee question with a plural "bitcoins" or a "combien" opener is still a fee question', () => {
  for (const message of ["Combien ça coûte d'envoyer des bitcoins ?", 'Combien coûtent les frais Bitcoin ?', 'How much does it cost to send bitcoins?', "Pourquoi les frais sont-ils plus élevés quand j'envoie des bitcoins ?"]) {
    assert.equal(isGeneralBitcoinFeeQuestion(message), true, message);
  }
  for (const message of ['Combien coûte un abonnement Alice ?', 'How much does Lightning routing cost?']) {
    assert.equal(isGeneralBitcoinFeeQuestion(message), false, message);
  }
});

test('ordinary level qualifiers preserve Lightning payment mechanics without swallowing specialist requests', () => {
  for (const q of ['Explain how a Lightning payment works for my level.', 'Please explain how a Lightning payment works at my level.', 'How does a Lightning payment work in terms suited to my experience?', 'Explique-moi comment fonctionne un paiement Lightning à mon niveau.', 'Comment fonctionne un paiement Lightning pour mon niveau ?']) assert.ok(isGeneralLightningPaymentExplanation(q),q);
  for (const q of ['Explain how a Lightning payment works for my level and compare Ark.', 'Explain how Lightning routing privacy works for my level.', 'Explain how a Lightning payment works for my level with an expired invoice.']) assert.equal(isGeneralLightningPaymentExplanation(q),false,q);
});


test('payment walkthrough retrieval preserves specialist invoice, privacy and recovery questions', () => {
  for (const q of [
    'Walk me through an ordinary Lightning payment from a wallet to a shop, including the invoice and the route.',
    'Explique les étapes d’un paiement Lightning ordinaire vers un commerce, de la facture au routage.',
    'Explain the normal invoice-based Lightning payment process.',
  ]) {
    assert.equal(isLightningPaymentWalkthrough(q), true, q);
    assert.equal(isGeneralLightningPaymentExplanation(q), false, 'Do not extend controlled memory answers');
  }
  for (const q of [
    'Explain the steps for a Lightning payment with an expired invoice.',
    'Describe the fields in the Lightning payment invoice.',
    'Walk me through Lightning payment privacy.',
    'Explain the process of recovering a revoked Lightning payment channel.',
    'Compare the Lightning payment process with Ark.',
    'Walk me through a Bitcoin on-chain payment.',
  ]) assert.equal(isLightningPaymentWalkthrough(q), false, q);
});

test('normal flow and HTLC follow-ups retain Lightning mechanisms without hijacking account readings',()=>{
 assert.ok(isLightningPaymentWalkthrough('A cafe gives me a Lightning invoice. Must it close its channel for my ordinary payment? Explain the normal flow.'));
 for(const q of ['My wallet cannot find any route before sending. Is my whole channel balance now locked until I close it? How is that different from an HTLC already in flight?', 'Mon paiement Lightning ne trouve aucun chemin. Mon solde est-il bloqué maintenant ?'])assert.ok(isLightningRoutingStateQuestion(q));
 for(const q of ['What is my Lightning balance now?', 'Mon compte bancaire est bloqué.', 'Does an Ethereum HTLC stay locked if routing fails?'])assert.equal(isLightningRoutingStateQuestion(q),false);
});
