import assert from 'node:assert/strict';
import test from 'node:test';
import { withSelectedFeePreference, selectedMemoryExplanation } from './selected-memory-answer.ts';

const context = 'Personal memory:\n- (noted 2026-11-06) Prefers sending during low-traffic periods';
const question = 'Why can a small payment cost the same fee as a large one? Explain how my usual approach relates to the fee rate.';
const base = 'Fees are virtual size times rate.';

test('selected stored preference adds a qualified fee-rate link with earlier provenance', () => {
  const answer = withSelectedFeePreference(base, question, 'en', context, true)!;
  assert.ok(answer.startsWith(base));
  assert.match(answer, /earlier saved preference/);
  assert.match(answer, /prefer sending/);
  assert.match(answer, /may allow a lower fee rate/);
  assert.match(answer, /guarantees neither.*confirmation time/);
  assert.doesNotMatch(answer, /you always send|you said in this conversation/);
  assert.match(withSelectedFeePreference(base, 'Quel est le lien entre mes habitudes et les frais ?', 'fr', context, true)!, /enregistrée précédemment/);
});

test('disabled, unselected, unknown and unrelated memory cannot personalise a controlled answer', () => {
  assert.equal(withSelectedFeePreference(base, question, 'en', context, false), base);
  for (const memory of ['', 'Prefers sending during low-traffic periods', '- (noted 2026-11-06) Works with databases', '- (noted 2026-11-06) Does not prefer sending during low-traffic periods']) {
    assert.equal(withSelectedFeePreference(base, question, 'en', memory, true), base);
  }
  assert.equal(withSelectedFeePreference(base, 'How does my usual approach affect CoinJoin privacy?', 'en', context, true), base);
  assert.equal(withSelectedFeePreference(null, question, 'en', context, true), null);
});

test('current preference changes and response constraints take priority', () => {
  for (const addition of [' I no longer wait.', ' I prefer fast confirmation.', ' Actually I send immediately now.', ' One sentence.', ' Two bullets.', ' Je ne préfère plus attendre.', ' I stopped waiting.', ' My preference has changed.', " Je n’attends plus."]) {
    assert.equal(withSelectedFeePreference(base, question + addition, 'en', context, true), base);
  }
});

test('a new chat uses a genuinely captured and selected preference in the controlled fee answer', async () => {
  const { prepareAliceTurn } = await import('./turn-engine.ts');
  const { createPedagogicalProfile } = await import('./pedagogical-profile-core.ts');
  const { getAliceMemoryFromStorage, writeAliceCandidatesToStorage, aliceMemoryContext, setAliceMemoryEnabledInStorage } = await import('./alice-memory-core.ts');
  let stored: string | null = null;
  const storage = { read: async () => stored, write: async (value: string) => { stored = value; }, remove: async () => { stored = null; } };
  const services = {
    recordPedagogicalSignal: async () => createPedagogicalProfile(),
    getMemory: () => getAliceMemoryFromStorage(storage),
    rememberMemoryCandidates: (candidates: Parameters<typeof writeAliceCandidatesToStorage>[0]) => writeAliceCandidatesToStorage(candidates, storage),
    memoryContext: aliceMemoryContext,
    memoryCaptureInstruction: '',
    pedagogicalContext: () => '',
    retrieveKnowledge: async () => ({ ragContext: 'Topic: Transaction fees', localContext: null, learnContext: null, diagnostics: [] }),
  };
  const statement = 'I prefer sending when network traffic is low.';
  await prepareAliceTurn({ history: [{ role: 'user', content: statement }], userMessage: statement, backendType: 'local', targetLanguage: 'en' }, services);
  const memory = await getAliceMemoryFromStorage(storage);
  assert.equal(memory.items[0]?.category, 'experience');
  const input = { history: [{ role: 'user' as const, content: question }], userMessage: question, backendType: 'local' as const, targetLanguage: 'en' as const };
  const answer = await prepareAliceTurn(input, services);
  assert.equal(answer.directResponse, null);
  assert.match(answer.verifiedReference!.text, /earlier saved preference/);
  assert.match(answer.verifiedReference!.text, /fee = virtual size/);
  await setAliceMemoryEnabledInStorage(false, storage);
  const disabled = await prepareAliceTurn(input, services);
  assert.equal(disabled.directResponse, null);
  assert.doesNotMatch(disabled.verifiedReference!.text, /saved preference|low-traffic/);
});

const selectedFact = (fact: string) => `Personal memory:\n- (noted 2026-11-06) ${fact}`;
const beginner = selectedFact('Beginner with Bitcoin');
const database = selectedFact('Familiar with relational databases');
const lightningQuestion = 'Explain how a Lightning payment works at a level suited to my experience.';
const utxoQuestion = 'Explain what a UTXO is using an analogy suited to my background.';

test('selected beginner fact explains channels, invoices and routing without an automatic fallback', () => {
  const answer = selectedMemoryExplanation(lightningQuestion, 'en', beginner, true, 'Topic: Understanding Lightning')!;
  assert.ok(answer); assert.match(answer, /earlier saved fact/); assert.match(answer, /payment channels/);
  assert.match(answer, /invoice/); assert.match(answer, /liquidity in the correct direction/);
  assert.match(answer, /payment can fail/); assert.match(answer, /does not automatically turn into an on-chain/);
  assert.doesNotMatch(answer, /cheapest route|guaranteed instant|you said in this conversation/);
  const french = selectedMemoryExplanation('Explique un paiement Lightning à mon niveau.', 'fr', beginner, true, 'Topic: Comprendre Lightning')!;
  assert.match(french, /enregistrée précédemment/); assert.match(french, /facture Lightning/);
});
test('database analogy consumes active unspent rows without claiming SQL rows cannot be updated', () => {
  const answer = selectedMemoryExplanation(utxoQuestion, 'en', database, true, 'Topic: Understanding UTXOs')!;
  assert.ok(answer); assert.match(answer, /conceptual table/); assert.match(answer, /consumes each chosen input UTXO in full/);
  assert.match(answer, /when needed, change/); assert.match(answer, /difference between total input value and total output value/);
  assert.match(answer, /not reduced in place/); assert.match(answer, /not a claim.*SQL database can update/);
  assert.doesNotMatch(answer, /SQL.*cannot update|said in this conversation/);
  const french = selectedMemoryExplanation('Explique les UTXO avec une analogie adaptée à mon parcours.', 'fr', selectedFact('Familiar with databases'), true, 'Topic: Comprendre les UTXO')!;
  assert.match(french, /ensemble actif/); assert.match(french, /si nécessaire/);
});
test('disabled, unselected, wrong or unstructured facts cannot trigger personalised explanations', () => {
  assert.equal(selectedMemoryExplanation(lightningQuestion, 'en', beginner, false, 'Topic: Understanding Lightning'), null);
  for (const memory of ['', 'Beginner with Bitcoin', database, selectedFact('Not a beginner with Bitcoin'), selectedFact('Beginner with Bitcoin; expert with Lightning')]) {
    assert.equal(selectedMemoryExplanation(lightningQuestion, 'en', memory, true, 'Topic: Understanding Lightning'), null);
  }
  assert.equal(selectedMemoryExplanation(utxoQuestion, 'en', beginner, true, 'Topic: Understanding UTXOs'), null);
});
test('a matching substantive retrieved topic is required', () => {
  for (const source of ['', 'Topic: Lightning fees', 'Notes: Understanding Lightning', 'Topic: Understanding UTXOs']) {
    assert.equal(selectedMemoryExplanation(lightningQuestion, 'en', beginner, true, source), null);
  }
  for (const source of ['', 'Topic: Understanding Lightning', 'Notes: Understanding UTXOs']) {
    assert.equal(selectedMemoryExplanation(utxoQuestion, 'en', database, true, source), null);
  }
});
test('current contradictions, operations, unsupported formats and mixed topics take precedence', () => {
  for (const question of [
    'Explain how Lightning payment privacy works at a level suited to my experience.',
    'Explain how a Lightning payment works with expired invoices at a level suited to my experience.',
    'Explain UTXO signatures using an analogy suited to my background.',
  ]) assert.equal(selectedMemoryExplanation(question, 'en', beginner + '\n' + database, true, 'Topic: Understanding Lightning\nTopic: Understanding UTXOs'), null);
  for (const extra of [' I am advanced now.', ' I no longer need beginner explanations.', ' Actually I am an expert.', ' One sentence.', ' Two bullets.', ' Give SQL code.', ' Compare with Ark.', ' And how does CoinJoin work?', ' Also explain inflation.', ' My level has changed.', ' Send a payment.', ' Calculate 50 sats.', ' Je ne suis plus débutant.', ' Ignore my previous background.']) {
    assert.equal(selectedMemoryExplanation(lightningQuestion + extra, 'en', beginner, true, 'Topic: Understanding Lightning'), null, extra);
    assert.equal(selectedMemoryExplanation(utxoQuestion + extra, 'en', database, true, 'Topic: Understanding UTXOs'), null, extra);
  }
  assert.equal(selectedMemoryExplanation('Explain Lightning and UTXOs suited to my experience.', 'en', beginner, true, 'Topic: Understanding Lightning'), null);
  assert.equal(selectedMemoryExplanation('Explain cooking suited to my experience.', 'en', beginner, true, 'Topic: Understanding Lightning'), null);
  assert.equal(selectedMemoryExplanation('What is a UTXO?', 'en', database, true, 'Topic: Understanding UTXOs'), null);
});
