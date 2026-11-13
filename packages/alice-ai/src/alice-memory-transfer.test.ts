import assert from 'node:assert/strict';
import test from 'node:test';
import { aliceMemoryContext, createAliceMemory } from './alice-memory-core.ts';

// Each memory is written in the other language than its question.
const CASES = [
  {
    question: 'How can I recover access if my signing device breaks?',
    wanted: 'Veut vérifier sa sauvegarde avec son portefeuille matériel',
    unrelated: 'Suit les pools de minage de Bitcoin',
  },
  {
    question: 'Comment équilibrer la liquidité de mes canaux ?',
    wanted: 'Runs a Lightning routing node',
    unrelated: 'Interested in the monetary supply cap',
  },
  {
    question: 'How does a pruned node verify the chain?',
    wanted: 'Utilise un nœud Bitcoin Core à la maison',
    unrelated: 'Uses a Ledger signing device',
  },
  {
    question: 'Pourquoi réutiliser une adresse réduit-il la confidentialité ?',
    wanted: 'Interested in CoinJoin and PayJoin',
    unrelated: 'Learning about mining difficulty',
  },
  {
    question: 'What happens when an Ark VTXO expires?',
    wanted: 'Teste Bark sur un réseau de test',
    unrelated: 'Wants to rebalance Lightning channels',
  },
  {
    question: 'Pourquoi le taux de frais rend-il certaines petites sorties inutilisables ?',
    wanted: 'Studies UTXO selection and the fee market',
    unrelated: 'Interested in Bitcoin philosophy',
  },
];

for (const row of CASES) test(`memory transfer: ${row.question}`, () => {
  const memory = { ...createAliceMemory(), items: [row.wanted, row.unrelated].map((text, i) => ({
    id: String(i), category: 'interest' as const, text,
    createdDay: '2026-10-01', updatedDay: '2026-10-01',
  })) };
  const context = aliceMemoryContext(memory, row.question);
  assert.ok(context.includes(row.wanted), 'useful cross-language memory omitted');
  assert.ok(!context.includes(row.unrelated), 'unrelated newer memory included');
});

test('generic wallet and payment words do not bypass the subject check', () => {
  const memory = { ...createAliceMemory(), items: [
    'Uses a mobile wallet on Android',
    'Interested in the fee rate of Bitcoin payments',
    'Wants to try Lightning payments',
  ].map((text, i) => ({ id: String(i), category: 'interest' as const, text,
    createdDay: '2026-10-01', updatedDay: '2026-10-01',
  })) };
  assert.equal(aliceMemoryContext(memory, 'How do I recover a 2-of-3 multisig wallet?'), '');
  const recovery = aliceMemoryContext(memory, 'How should I back up my wallet?');
  assert.match(recovery, /mobile wallet/);
  assert.doesNotMatch(recovery, /fee rate|Lightning payments/);
  assert.match(aliceMemoryContext(memory, 'Which wallet should I choose?'), /mobile wallet/);
});
