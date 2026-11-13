import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ANSWER_RULES, ANSWER_RULES_MAX_CHARS, answerRuleNoteIdsIn,
  answerRuleNoteIdsOnSubject, answerRulesBlock, withAnswerRuleCorrections,
} from './answer-rules.ts';

const topics = [
  { id: 'bip39-passphrase', titles: ['La passphrase optionnelle', 'The optional passphrase'], question: 'I forgot my BIP39 passphrase. Does an empty wallet prove it is right?' },
  { id: 'lightning-liquidity-path', titles: ['Liquidité et chemins de paiement Lightning', 'Lightning liquidity and payment paths', 'La capacité de réception', 'Receiving capacity'], question: 'Can my self-funded Lightning channel receive payments?' },
  { id: 'lightning-invoice', titles: ['Les factures Lightning', 'Lightning invoices'], question: 'An expired BOLT11 invoice still says pending. Can I pay a new invoice?' },
];

for (const row of topics) test(`${row.id}: actual source and user subject both required`, () => {
  for (const title of row.titles) {
    const ids = answerRuleNoteIdsIn(`Topic: ${title}\nNotes: retrieved explanation`);
    assert.ok(ids.includes(row.id));
    assert.ok(answerRuleNoteIdsOnSubject(ids, row.question).includes(row.id));
    assert.ok(!answerRuleNoteIdsOnSubject(ids, 'Explain proof of work and mining.').includes(row.id));
    assert.ok(!answerRuleNoteIdsIn(`Notes: ${title}`).includes(row.id));
  }
  assert.ok(!answerRuleNoteIdsIn('Topic: Transaction fees').includes(row.id));
});

test('passphrase guidance separates derivation, local access, diagnosis and recovery uncertainty', () => {
  const en = answerRulesBlock(['bip39-passphrase'], 'en');
  for (const phrase of [/exact passphrase/, /including an empty one/, /seed and private keys/, /device PIN or local app password/, /neither a different wallet nor a correct passphrase/, /derivation path, account, network or incomplete synchronization/, /known public wallet details/, /no passphrase reset or guaranteed recovery/]) assert.match(en, phrase);
  const fr = answerRulesBlock(['bip39-passphrase'], 'fr');
  for (const phrase of [/passphrase exacte/, /même vide/, /clés privées/, /PIN d’appareil/, /ni portefeuille différent/, /chemin de dérivation, compte, réseau ou synchronisation incomplète/, /repères publics connus/, /ni récupération garantie/]) assert.match(fr, phrase);
});

test('liquidity guidance separates directional capacity and route success from the invoice amount', () => {
  const en = answerRulesBlock(['lightning-liquidity-path'], 'en');
  for (const phrase of [/monetary amount of bitcoin/, /local and remote balances/, /receiving needs usable balance on the peer/, /outgoing payment.*local to the remote/, /increase incoming capacity/, /does not guarantee that any sender can route/, /reserves and HTLC limits constrain success/, /successful ordinary fixed-amount invoice payment delivers the requested amount/, /routing fees are normally paid by the sender/, /not deducted from that amount/]) assert.match(en, phrase);
  const fr = answerRulesBlock(['lightning-liquidity-path'], 'fr');
  for (const phrase of [/montant de bitcoins/, /solde local et solde distant/, /du côté du pair/, /sortant réglé.*local vers le côté distant/, /augmenter la capacité entrante/, /ne garantit pas que tout expéditeur puisse acheminer/, /conditionnent la réussite, pas un montant net imprévisible/, /facture à montant fixé livre le montant demandé/, /payés par l’expéditeur, pas retranchés de ce montant/]) assert.match(fr, phrase);
});

test('invoice guidance separates invoice and HTLC deadlines and explains double-payment risk', () => {
  const en = answerRulesBlock(['lightning-invoice'], 'en');
  for (const phrase of [/already initiated payment/, /in-flight payment can still settle/, /HTLC settlement deadlines are different/, /InFlight, Succeeded and Failed/, /both may settle.*twice/, /new invoice does not cancel/]) assert.match(en, phrase);
  const fr = answerRulesBlock(['lightning-invoice'], 'fr');
  for (const phrase of [/paiement déjà lancé/, /peut encore aboutir/, /HTLC sont distinctes/, /En cours, Réussi et Échoué/, /les deux peuvent aboutir.*deux fois/, /nouvelle facture n’annule pas/]) assert.match(fr, phrase);
});

test('all specific mandatory points survive the bounded block beside generic notes', () => {
  for (const [ids, specific] of [
    [['seed-backup', 'bip39-passphrase'], 'bip39-passphrase'],
    [['lightning-liquidity-path', 'lightning-invoice'], 'lightning-invoice'],
    [['lightning-payment-mechanics', 'lightning-revoked-state'], 'lightning-revoked-state'],
  ] as const) {
    for (const language of ['fr', 'en'] as const) {
      const block = answerRulesBlock(ids, language);
      assert.ok(block.length <= ANSWER_RULES_MAX_CHARS);
      for (const point of ANSWER_RULES.find(rule => rule.noteId === specific)!.mustState[language]) assert.ok(block.includes(point), point);
    }
  }
  for (const row of topics) for (const language of ['fr', 'en'] as const) {
    const block = answerRulesBlock([row.id], language);
    assert.ok(block.length <= ANSWER_RULES_MAX_CHARS);
    for (const point of ANSWER_RULES.find(rule => rule.noteId === row.id)!.mustState[language]) assert.ok(block.includes(point), point);
  }
});

test('topic rules without a never-claim check leave a wrong answer uncorrected', () => {
  for (const [id, answer] of [
    ['bip39-passphrase', 'The passphrase decrypts an archive.'],
    ['lightning-liquidity-path', 'Sending always reduces incoming capacity.'],
    ['lightning-invoice', 'Invoice expiry immediately refunds every pending payment.'],
  ]) {
    assert.deepEqual(withAnswerRuleCorrections(answer, 'en', [id]), { text: answer, applied: [] });
  }
});


test('retrieved Lightning payment rules cover paraphrases without widening the retrieval overview classifier', () => {
  const notes = answerRuleNoteIdsIn('Topic: Understanding Lightning\nNotes: retrieved payment mechanism');
  for (const question of [
    'Walk me through an ordinary Lightning payment from a wallet to a shop, including the invoice and the route.',
    'Explique les étapes d’un paiement Lightning ordinaire vers un commerce, de la facture au routage.',
    'Why does a Lightning payment need a route rather than a new direct channel?',
    'Explain how a Lightning payment works.\nIf no route works, does that turn into an on-chain payment?',
    'Explique un paiement Lightning.\nSi aucun chemin ne fonctionne, le paiement passe-t-il sur la blockchain ? Et Bitcoin récupère-t-il les fonds ?',
  ]) {
    assert.ok(answerRuleNoteIdsOnSubject(notes, question).includes('lightning-payment-mechanics'), question);
    assert.deepEqual(answerRuleNoteIdsOnSubject([], question), [], 'Question alone cannot manufacture a retrieved source');
  }
  for (const question of [
    'Explain Lightning payments.\nNow explain Bitcoin transaction fees.',
    'Explain Lightning payments.\nWhat route does an Ark payment use?',
    'Explain Lightning payments.\nWhat is a BIP39 seed?',
    'How private is Lightning?',
    'How does internet routing work?',
    'Explain Lightning payments.\nHow does Bitcoin transaction routing work?',
    'How do I edit an ordinary commercial invoice?',
  ]) assert.ok(!answerRuleNoteIdsOnSubject(notes, question).includes('lightning-payment-mechanics'), question);
});


test('revoked-state guidance is gated by a retrieved source and covers timely intervention', () => {
  for (const title of ['Reacting to a revoked channel state', 'Réagir à un état de canal révoqué', 'The role of a watchtower', 'Le rôle d’une watchtower']) {
    const ids = answerRuleNoteIdsIn(`Topic: ${title}\nNotes: source`);
    assert.ok(answerRuleNoteIdsOnSubject(ids, 'What happens if a peer publishes an old channel state?').includes('lightning-revoked-state'));
    assert.ok(!answerRuleNoteIdsOnSubject(ids, 'What is Bitcoin mining?').includes('lightning-revoked-state'));
  }
  for (const language of ['en', 'fr'] as const) {
    const block = answerRulesBlock(['lightning-revoked-state'], language);
    assert.ok(block.length <= ANSWER_RULES_MAX_CHARS);
    for (const point of ANSWER_RULES.find(rule => rule.noteId === 'lightning-revoked-state')!.mustState[language]) assert.ok(block.includes(point));
  }
});
