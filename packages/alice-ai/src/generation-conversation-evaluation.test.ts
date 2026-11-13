import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { conversationRows, createConversationHistory } from '../../../scripts/rag-conversation-fixture.mjs';

const turn = (question: string) => ({ question, mustCover: ['Respond to the question'], mustNotClaim: [] });
const fixture = () => ({ conversations: [
  { id: 'fees', language: 'en', turns: [turn('How do fees work?'), turn('And with two inputs?')] },
  { id: 'privacy', language: 'fr', turns: [turn('Que fait CoinJoin ?'), turn('Suis-je invisible ?')] },
] });

test('conversation selection keeps whole conversations, order and stable turn IDs', () => {
  const rows = conversationRows(fixture(), 'fees');
  assert.deepEqual(rows.map(row => [row.id, row.turnIndex]), [['fees-t1', 0], ['fees-t2', 1]]);
  assert.equal(rows[0].history, undefined);
  assert.throws(() => conversationRows(fixture(), 'missing'), /Unknown conversation ID/);
  const duplicate = fixture(); duplicate.conversations[1].id = 'fees';
  assert.throws(() => conversationRows(duplicate), /Duplicate conversation ID/);
});

test('fixtures cannot supply assistant answers or prewritten history at any level', () => {
  for (const field of ['history', 'assistant', 'answer', 'messages']) {
    const root = fixture(); Object.assign(root, { [field]: [] });
    assert.throws(() => conversationRows(root), /unsupported field/);
    const conversation = fixture(); Object.assign(conversation.conversations[0], { [field]: [] });
    assert.throws(() => conversationRows(conversation), /unsupported field/);
    const item = fixture(); Object.assign(item.conversations[0].turns[0], { [field]: [] });
    assert.throws(() => conversationRows(item), /unsupported field/);
  }
});

test('malformed conversations fail before inference, including unselected conversations', () => {
  const one = fixture(); one.conversations[1].turns = [turn('One turn')];
  assert.throws(() => conversationRows(one, 'fees'), /at least two/);
  const empty = fixture(); empty.conversations[0].turns[0].question = ' ';
  assert.throws(() => conversationRows(empty), /nonempty question/);
  const invalidId = fixture(); invalidId.conversations[0].id = '../fees';
  assert.throws(() => conversationRows(invalidId), /Invalid conversation ID/);
});

test('next turn receives the actual unmodified reply; conversations and copies are isolated', () => {
  const rows = conversationRows(fixture());
  const state = createConversationHistory();
  assert.deepEqual(state.begin(rows[0]), []);
  const answer = 'Actual answer\n\nwith formatting.';
  state.complete(rows[0], { source: 'model', answer, generation: { truncated: false } });
  const history = state.begin(rows[1]);
  assert.deepEqual(history, [{ role: 'user', content: rows[0].question }, { role: 'assistant', content: answer }]);
  history[0].content = 'tampered copy';
  state.complete(rows[1], { source: 'direct-response', answer: 'Second actual reply' });
  assert.deepEqual(state.begin(rows[2]), []);
});

test('missing, empty, failed and truncated answers block dependent turns', () => {
  const rows = conversationRows(fixture());
  for (const result of [
    { source: 'model', answer: '' },
    { source: 'model', answer: '  ' },
    { source: 'model', answer: 'Partial', generation: { truncated: true } },
    { source: 'model', answer: 'Partial', truncated: true },
    { source: 'model', answer: 'Untrusted', error: 'Transport failure' },
    { answer: 'No provenance' },
  ]) {
    const state = createConversationHistory(); state.begin(rows[0]);
    assert.throws(() => state.complete(rows[0], result));
    assert.throws(() => state.begin(rows[1]), /blocked/);
    assert.deepEqual(state.begin(rows[2]), [], 'Another conversation remains runnable');
  }
  const state = createConversationHistory(); state.begin(rows[0]); state.fail(rows[0]);
  assert.throws(() => state.begin(rows[1]), /blocked/);
});

test('out-of-order and duplicate turns cannot fabricate a valid transcript', () => {
  const rows = conversationRows(fixture()); const state = createConversationHistory();
  assert.throws(() => state.begin(rows[1]), /in order/);
  state.begin(rows[0]);
  assert.throws(() => state.begin(rows[0]), /in order/);
  state.complete(rows[0], { source: 'direct-response', answer: 'Actual reply' });
  assert.throws(() => state.begin(rows[0]), /in order/);
});

const root = path.resolve(import.meta.dirname, '../../..');
const temporary = mkdtempSync(path.join(tmpdir(), 'alice-conversation-preflight-'));
const fixturePath = path.join(temporary, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(fixture()));
for (const [flags, expected] of [
  [['--conversation-id', 'fees'], /requires --conversation-fixture/],
  [['--conversation-fixture', '--synthetic-knowledge'], /cannot use synthetic knowledge/],
  [['--conversation-fixture', '--limit', '1'], /cannot use --limit/],
  [['--conversation-fixture', '--conversation-id', 'missing'], /Unknown conversation ID/],
] as const) test(`conversation preflight rejects ${flags.join(' ')}`, () => {
  const result = spawnSync(process.execPath, ['scripts/eval-rag-generation.mjs', '--fixture', fixturePath,
    '--output', path.join(temporary, 'never-written.json'), '--model', 'qwen3.5-4b',
    '--model-file', path.join(temporary, 'nonexistent.gguf'), ...flags], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, expected);
  assert.doesNotMatch(result.stderr, /ENOENT|fetch failed/, 'Reject before model/network access');
});
