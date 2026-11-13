import assert from 'node:assert/strict';
import test from 'node:test';
import { pendingLightningPayment } from './pending-lightning-payment.ts';
import { prepareAliceTurn, type TurnPreparationServices } from './turn-engine.ts';
import { createAliceMemory } from './alice-memory-core.ts';
import { createPedagogicalProfile } from './pedagogical-profile-core.ts';
import type { Message } from './llm.ts';

const source = 'Topic: Lightning invoices\nNotes: An invoice is a payment request, not evidence of settlement.';
const first = 'I started paying a BOLT11 invoice before expiry. My wallet still says pending although the invoice expired. Are my funds back?';
const follow = 'The seller sent another invoice but the original payment is still pending. Should I pay again?';
const history: Message[] = [{ role: 'user', content: first }, { role: 'assistant', content: 'The expiry immediately refunded you.' }];

test('expired initiated payments use a source-gated explanation in either language', () => {
  for (const question of [first,
    'My Lightning invoice has expired while its payment is in-flight. Does this mean failure?',
    'Une facture Lightning a expiré alors que le paiement est en attente : est-il remboursé ?',
    "J'ai lancé le paiement d'une facture Lightning avant son expiration. Le portefeuille indique encore « en cours ». L'argent est revenu ?",
  ]) {
    const en = pendingLightningPayment(question, 'en', source)!;
    const fr = pendingLightningPayment(question, 'fr', 'Topic: Les factures Lightning')!;
    assert.ok(en, question); assert.ok(fr, question);
    assert.match(en, /success pays the recipient, it does not refund you/);
    assert.match(en, /display may lag/); assert.match(en, /cannot inspect/);
    assert.match(en, /coordinate with the seller before any new payment/);
    assert.match(fr, /paie le destinataire, il ne te rembourse pas/);
    assert.match(fr, /l’affichage du portefeuille peut être en retard/);
    assert.match(fr, /sans délai garanti/);
  }
  for (const context of ['', 'Notes: Lightning invoices', 'Topic: Lightning liquidity and payment paths']) {
    assert.equal(pendingLightningPayment(first, 'en', context), null);
  }
});

test('replacement advice cannot inherit the assistant claim or skip an intervening user topic', () => {
  const answer = pendingLightningPayment(follow, 'en', source, history)!;
  assert.match(answer, /both could succeed and pay the seller twice/);
  assert.match(answer, /does not cancel the first payment/);
  assert.equal(pendingLightningPayment(follow, 'en', source, [{ role: 'assistant', content: first }]), null);
  assert.equal(pendingLightningPayment(follow, 'en', source, [...history, { role: 'user', content: 'How do bank invoices work?' }]), null);
  assert.equal(pendingLightningPayment(follow, 'en', source, [...history, { role: 'user', content: 'I prefer Lightning.' }]), null);
  assert.equal(pendingLightningPayment(follow, 'en', source, [...history, { role: 'user', content: follow }]), answer);
  assert.equal(pendingLightningPayment(follow, 'en', source), null);
  assert.ok(pendingLightningPayment('My first Lightning payment is still pending. Should I pay the new invoice?', 'en', source));
  assert.ok(pendingLightningPayment('Le vendeur propose une nouvelle facture ; le paiement est toujours en cours. Je la paie ?', 'fr', source, history));
});

test('fresh, resolved, specialized and explicitly changed topics stay on ordinary generation', () => {
  for (const question of [
    'My BOLT11 invoice expired before I initiated any payment. Can I request another?',
    'My Lightning payment is no longer pending. Can I pay another invoice?',
    'The first payment succeeded. Should I pay the new invoice?',
    'How does a new BOLT12 invoice work?',
    'My bank invoice expired and payment is pending. Should I pay another invoice?',
    'Another topic: my new invoice is pending. Should I pay again?',
    'Compare the pending Lightning invoice with an on-chain payment.',
    'Explain the public key in my expired Lightning invoice while payment is pending.',
    'Translate: my Lightning invoice expired while the payment is pending.',
    'My Lightning invoice expired while payment is pending. Also explain mining.',
    'My Lightning invoice expired while payment is pending. One sentence.',
  ]) assert.equal(pendingLightningPayment(question, 'en', source, history), null, question);
});

test('turn preparation answers directly on a local model and passes the same text as a reference to Private Cloud', async () => {
  const services: TurnPreparationServices = {
    recordPedagogicalSignal: async () => createPedagogicalProfile(),
    retrieveKnowledge: async () => ({ ragContext: source, localContext: null, learnContext: null, diagnostics: [{ id: 'curated-lightning-invoice.en' }] }),
    getMemory: async () => createAliceMemory(),
    rememberMemoryCandidates: async () => { throw new Error('No personal fact to capture'); },
    memoryContext: () => '', pedagogicalContext: () => '', memoryCaptureInstruction: '',
  };
  for (const [question, prior] of [[first, []], [follow, history]] as [string, Message[]][]) {
    const result = await prepareAliceTurn({ userMessage: question, history: prior, targetLanguage: 'en', backendType: 'local' }, services);
    // On a local model this subject keeps its checked text as the answer.
    assert.equal(result.verifiedReference?.id, 'pending-lightning-payment', question);
    assert.match(result.directResponse!, /coordinate with the seller/);
    assert.ok(!result.history.some(m => m.content.includes('[Verified reference on this subject]')), question);
    // Private Cloud receives the same text as a reference and writes the answer.
    const cloud = await prepareAliceTurn({ userMessage: question, history: [...prior, { role: 'user', content: question }], targetLanguage: 'en', backendType: 'cloud' }, services);
    assert.equal(cloud.directResponse, null, question);
    assert.match(cloud.verifiedReference!.text, /coordinate with the seller/);
    assert.ok(cloud.history.some(m => m.role === 'system' && m.content.includes('[Verified reference on this subject]')), question);
    assert.deepEqual(result.diagnostics.retrievedChunkIds, ['curated-lightning-invoice.en']);
  }
  services.retrieveKnowledge = async () => ({ ragContext: null, localContext: null, learnContext: null, diagnostics: [] });
  const unavailable = await prepareAliceTurn({ userMessage: first, history: [], targetLanguage: 'en', backendType: 'local' }, services);
  assert.equal(unavailable.directResponse, null);
  assert.equal(unavailable.verifiedReference, null);
});
