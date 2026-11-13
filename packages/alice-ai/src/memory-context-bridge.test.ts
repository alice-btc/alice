import assert from 'node:assert/strict';
import test from 'node:test';
import { aliceMemoryContext } from './alice-memory-core.ts';

const fact = {
  id: 'synthetic-database-background', category: 'background' as const,
  text: 'Familiar with relational databases and SQL tables',
  createdDay: '2026-11-06', updatedDay: '2026-11-06',
};
const memory = { version: 2 as const, enabled: true, pausedCategories: [], items: [fact] };

test('database background supports transaction input/output explanations without requiring the UTXO acronym', () => {
  for (const question of [
    'Explain transaction inputs and outputs using an analogy suited to my background.',
    'Explique les entrées et sorties des transactions avec une analogie adaptée à mon expérience.',
    'How do transaction inputs reference earlier outputs?',
  ]) assert.ok(aliceMemoryContext(memory, question).includes(fact.text), question);
});

test('the bridge excludes unrelated subjects, disabled memory and deleted facts', () => {
  for (const question of [
    'Why do Bitcoin nodes reject a block that creates too many coins?',
    'Explain the inputs and outputs of bank transactions.',
    'Explain transaction outputs on Ethereum.',
    'Explain Lightning transaction inputs and outputs.',
    'Explique les sorties au cinéma.',
  ]) assert.ok(!aliceMemoryContext(memory, question).includes(fact.text), question);
  const question = 'Explain transaction inputs and outputs using an analogy suited to my background.';
  assert.ok(!aliceMemoryContext({ ...memory, enabled: false }, question).includes(fact.text));
  // Category pause stops new capture; the global switch disables recall.
  assert.ok(aliceMemoryContext({ ...memory, pausedCategories: ['background'] }, question).includes(fact.text));
  assert.ok(!aliceMemoryContext({ ...memory, items: [] }, question).includes(fact.text));
});
