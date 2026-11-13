import assert from 'node:assert/strict';
import test from 'node:test';
import * as runtime from './alice-memory-core.ts';
import { conversationRows, createConversationHistory } from '../../../scripts/rag-conversation-fixture.mjs';
import { createMemoryEvaluation, selectedMemoryIds, assertMemoryExpectations } from '../../../scripts/rag-memory-evaluation.mjs';

const fixture = () => ({ conversations: [{ id: 'memory', language: 'en', turns: [
  { question: 'Remember my learning preference.', mustCover: [], mustNotClaim: [] },
  { question: 'Explain fees.', mustCover: [], mustNotClaim: [], resetHistory: true, memoryExpected: { selected: ['concise'] } },
] }] });

test('memory fixture controls require explicit opt-in and cannot preseed facts', () => {
  assert.throws(() => conversationRows(fixture()), /unsupported field/);
  assert.equal(conversationRows(fixture(), null, true).length, 2);
  const injected = fixture(); Object.assign(injected.conversations[0].turns[0], { memory: [{ text: 'Fake fact' }] });
  assert.throws(() => conversationRows(injected, null, true), /unsupported field/);
});

test('chat reset clears actual dialogue while production memory survives in isolated storage', async () => {
  const rows = conversationRows(fixture(), null, true);
  const history = createConversationHistory(); const memory = createMemoryEvaluation(runtime);
  await memory.begin(rows[0]); assert.deepEqual(history.begin(rows[0]), []);
  await memory.write(rows[0], [{ category: 'preference', text: 'Prefers concise answers' }]);
  history.complete(rows[0], { source: 'direct-response', answer: 'Actual acknowledgement' });
  assert.deepEqual(history.begin(rows[1]), []);
  const persisted = await memory.begin(rows[1]);
  assert.equal(persisted.items.length, 1);
  const context = runtime.aliceMemoryContext(persisted, rows[1].question);
  const ids = selectedMemoryIds(persisted, context);
  assert.equal(ids.length, 1);
  assertMemoryExpectations(rows[1].memoryExpected, persisted, ids, [{ messages: [{ content: context }] }], 'model');
  assert.equal((await memory.begin({ conversationId: 'another' })).items.length, 0);
});

test('production filters reject unsafe writes and disabled memory is not selected or recaptured', async () => {
  const memory = createMemoryEvaluation(runtime); const row = { conversationId: 'boundary' };
  await memory.write(row, [{ category: 'preference', text: 'Prefers concise answers' }, { category: 'background', text: 'x' }]);
  assert.equal((await memory.read(row)).items.length, 1);
  const disabled = await memory.begin({ ...row, memoryAction: 'disable' });
  assert.equal(runtime.aliceMemoryContext(disabled, 'Explain fees'), '');
  await memory.write(row, [{ category: 'interest', text: 'Interested in Lightning' }]);
  assert.equal((await memory.read(row)).items.length, 1);
  assertMemoryExpectations({ stored: ['concise'], excluded: ['concise'], disabled: true }, disabled, [], [], 'direct-response');
  assert.throws(() => assertMemoryExpectations({ disabled: true }, disabled, [], [{ messages: [{ content: 'Personal memory: Prefers concise answers' }] }], 'model'), /Disabled memory leaked/);
});

test('selection and prompt transport failures fail the evaluation; clear uses production removal', async () => {
  const memory = createMemoryEvaluation(runtime); const row = { conversationId: 'transport' };
  const { memory: stored } = await memory.write(row, [{ category: 'preference', text: 'Prefers concise answers' }]);
  const ids = stored.items.map(item => item.id);
  assert.throws(() => assertMemoryExpectations({ selected: ['concise'] }, stored, [], [], 'direct-response'), /Missing selected/);
  assert.throws(() => assertMemoryExpectations({}, stored, ids, [{ messages: [{ content: 'No personal context' }] }], 'model'), /missing from model request/);
  assert.equal((await memory.begin({ ...row, memoryAction: 'clear' })).items.length, 0);
});
