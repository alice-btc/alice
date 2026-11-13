import assert from 'node:assert/strict';
import test from 'node:test';
import { groundedLightningLiquidity, onchainLightningInvoiceExplanation } from './grounded-lightning-liquidity.ts';
import type { Message } from './llm.ts';

const liquidity = 'Topic: Lightning liquidity and payment paths\nNotes: Local and remote balances differ.';
const invoices = 'Topic: Lightning invoices\nNotes: A BOLT11 invoice is a payment request.';
const first = 'I funded my own Lightning channel entirely myself. Why can I not receive a large payment?';
const follow = 'If I pay a merchant through this channel, can I receive exactly the same amount from any other node?';
const history: Message[] = [{ role: 'user', content: first }, { role: 'assistant', content: 'Sending reduces incoming capacity. Relays pay the fees.' }];

test('self-funded receiving explanations preserve balance direction and fee payer in both languages', () => {
  for (const q of [first,
    'Why does funding my own Lightning channel not give me inbound capacity?',
    'Je gère mon propre nœud Lightning. Je viens d’ouvrir un canal financé entièrement par moi et aucun paiement n’a encore circulé. Pourquoi avoir mis beaucoup de bitcoins dans ce canal ne me donne-t-il pas forcément la possibilité de recevoir un gros paiement ?',
    "J'ai financé seul mon canal Lightning. Pourquoi ne puis-je pas recevoir ?",
  ]) {
    const en = groundedLightningLiquidity(q, 'en', liquidity)!;
    const fr = groundedLightningLiquidity(q, 'fr', 'Topic: Liquidité et chemins de paiement Lightning')!;
    assert.ok(en, q); assert.ok(fr, q);
    assert.match(en, /moves local balance to the peer’s side/);
    assert.match(en, /sender pays routing fees and forwarding nodes receive them/);
    assert.match(en, /succeeds for the requested amount or fails/);
    assert.match(fr, /déplace du solde local vers le côté du pair/);
    assert.match(fr, /l’émetteur paie les frais de routage et les relais les perçoivent/);
    assert.match(fr, /pas son succès/);
  }
});

test('follow-up uses only the immediately preceding user subject, not assistant assertions', () => {
  assert.ok(groundedLightningLiquidity(follow, 'en', liquidity, history));
  assert.ok(groundedLightningLiquidity('Donc si je paie un commerçant par ce canal, je pourrai forcément recevoir ensuite exactement la même somme depuis n’importe quel autre nœud ?', 'fr', liquidity, history));
  assert.equal(groundedLightningLiquidity(follow, 'en', liquidity), null);
  assert.equal(groundedLightningLiquidity(follow, 'en', liquidity, [{ role: 'assistant', content: first }]), null);
  assert.equal(groundedLightningLiquidity(follow, 'en', liquidity, [...history, { role: 'user', content: 'What is a Bitcoin address?' }]), null);
  assert.equal(groundedLightningLiquidity(follow, 'en', liquidity, [...history, { role: 'user', content: 'I prefer Lightning.' }]), null);
  assert.equal(groundedLightningLiquidity(follow, 'en', liquidity, [...history, { role: 'user', content: follow }]), groundedLightningLiquidity(follow, 'en', liquidity, history));
  assert.ok(groundedLightningLiquidity('Does spending through a Lightning channel guarantee receiving the same amount from any sender?', 'en', liquidity));
});

test('source and scope boundaries reject unrelated or unsupported liquidity requests', () => {
  for (const context of ['Topic: Receiving capacity', 'Topic: La capacité de réception']) {
    assert.ok(groundedLightningLiquidity(first, 'en', context));
    assert.ok(groundedLightningLiquidity(follow, 'fr', context, history));
  }
  for (const context of ['', invoices, 'Notes: Lightning liquidity and payment paths']) assert.equal(groundedLightningLiquidity(first, 'en', context), null);
  for (const q of [
    'I opened a Lightning channel funded entirely by my peer. Why can I receive?',
    'I funded a Lightning channel jointly with my peer. How much can I receive?',
    first + ' Also explain mining.', first + ' One sentence.', first + ' Give Python code.',
    first + ' Compare with Ethereum.', first + ' How do I close it?',
    first + ' My invoice is pending after expiry.', first + ' Explain the privacy implications.',
    'Another topic: can I receive the same amount through this channel after paying?',
    'Can you send a Lightning payment through this channel for me so I receive the same amount?',
    'How does a BOLT12 invoice let this channel receive the same amount after I pay?',
    'How does splicing let this channel receive after I pay?',
  ]) assert.equal(groundedLightningLiquidity(q, 'en', liquidity, history), null, q);
});

test('on-chain funds can pay an invoice only with explicit compatible support in the correct direction', () => {
  for (const q of [
    "Forget the price. I have bitcoin in an ordinary on-chain wallet and the seller gave me a Lightning invoice beginning with lnbc. Can I just paste that invoice into the wallet's normal Bitcoin address field and send?",
    'Can I enter a BOLT11 invoice into the address field of my onchain wallet to pay?',
    'Puis-je coller une facture Lightning dans le champ adresse de mon portefeuille Bitcoin classique pour payer ?',
  ]) {
    const en = onchainLightningInvoiceExplanation(q, 'en', invoices)!;
    const fr = onchainLightningInvoiceExplanation(q, 'fr', 'Topic: Les factures Lightning')!;
    assert.ok(en, q); assert.ok(fr, q);
    assert.match(en, /receives your on-chain funds and pays the invoice over Lightning/);
    assert.match(en, /fees, timing and trust conditions/);
    assert.match(en, /ask the seller for an on-chain address/);
    assert.match(fr, /reçoit tes fonds on-chain et paie la facture en Lightning/);
    assert.match(fr, /ne convertit pas automatiquement/);
  }
});

test('invoice payment boundary requires its own source and never executes or inherits other networks', () => {
  const q = 'Can I paste an lnbc invoice into an on-chain Bitcoin address field to pay?';
  for (const context of ['', liquidity, 'Notes: Lightning invoices']) assert.equal(onchainLightningInvoiceExplanation(q, 'en', context), null);
  for (const question of [
    'Can you pay my Lightning invoice from my on-chain wallet address field?',
    q + ' Give API code.', q + ' Compare with Solana.',
    'Can I paste a BOLT12 invoice into an on-chain Bitcoin address field to pay?',
    'My Lightning invoice is pending. Can I pay using an on-chain address field?',
    'Can I decode the public key of an lnbc invoice from my on-chain address field?',
    'Can I paste this into the address field and send?',
    'How does an ordinary on-chain Bitcoin address work?',
  ]) assert.equal(onchainLightningInvoiceExplanation(question, 'en', invoices), null, question);
});
