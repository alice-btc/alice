import assert from 'node:assert/strict';
import test from 'node:test';
import type { AIBackend, SendMessageOptions } from './ai-backend.ts';
import { generateLanguageChecked, visibleStreamingText, WrongResponseLanguageError } from './language-generation.ts';

function backendWithAnswers(answers: string[], seen: SendMessageOptions[]): AIBackend {
  let index = 0;
  return {
    type: 'cloud',
    async init() {},
    status: () => ({ state: 'ready' }),
    async sendMessage(_messages, onChunk, options) {
      seen.push(options ?? {});
      const content = answers[index++] ?? answers.at(-1) ?? '';
      onChunk?.(content);
      return { content, truncated: false };
    },
    async dispose() {},
  };
}

test('accepts a response in the target language without retrying', async () => {
  const seen: SendMessageOptions[] = [];
  const result = await generateLanguageChecked({
    backend: backendWithAnswers(['Bitcoin is an open monetary network used to transfer value.'], seen),
    history: [{ role: 'user', content: 'What is Bitcoin?' }],
    allowContinuation: false,
    targetLanguage: 'en',
    requestId: 'req_language_test_0001',
  });
  assert.match(result.text, /open monetary network/);
  assert.equal(seen.length, 1);
  assert.equal(seen[0].strictLanguageRetry, false);
  assert.equal(result.attempts, 1);
});

test('retries a wrong-language response once with the same quota request id', async () => {
  const seen: SendMessageOptions[] = [];
  const result = await generateLanguageChecked({
    backend: backendWithAnswers([
      'Bitcoin est un reseau monetaire ouvert qui permet de transferer de la valeur.',
      'Bitcoin is an open monetary network that lets people transfer value.',
    ], seen),
    history: [{ role: 'user', content: 'What is Bitcoin?' }],
    allowContinuation: false,
    targetLanguage: 'en',
    requestId: 'req_language_test_0002',
  });
  assert.match(result.text, /open monetary network/);
  assert.equal(seen.length, 2);
  assert.equal(seen[0].requestId, 'req_language_test_0002_c0');
  assert.equal(seen[1].requestId, 'req_language_test_0002_c0');
  assert.equal(seen[1].strictLanguageRetry, true);
  assert.equal(seen[1].temperatureOverride, 0.1);
  assert.equal(result.attempts, 2);
});

test('fails closed after two responses in the wrong language', async () => {
  const seen: SendMessageOptions[] = [];
  await assert.rejects(() => generateLanguageChecked({
    backend: backendWithAnswers([
      'Bitcoin est un reseau monetaire ouvert qui permet de transferer de la valeur.',
      'Cette technologie permet aussi de verifier les regles sans banque centrale.',
    ], seen),
    history: [{ role: 'user', content: 'What is Bitcoin?' }],
    allowContinuation: false,
    targetLanguage: 'en',
  }), WrongResponseLanguageError);
  assert.equal(seen.length, 2);
});

test('streams an accepted answer while keeping private memory metadata hidden', async () => {
  const seen: SendMessageOptions[] = [];
  const displayed: string[] = [];
  const result = await generateLanguageChecked({
    backend: backendWithAnswers([
      'Bitcoin is an open monetary network with public rules and no central issuer. '
        + '<alice_memory>{"items":[{"category":"preference","text":"Prefers examples"}]}</alice_memory>',
    ], seen),
    history: [{ role: 'user', content: 'What is Bitcoin?' }],
    allowContinuation: false,
    targetLanguage: 'en',
    onText: text => displayed.push(text),
  });
  assert.match(displayed.at(-1) ?? '', /open monetary network/);
  assert.doesNotMatch(displayed.join(''), /alice_memory/);
  assert.deepEqual(result.memoryCandidates, []);
});

test('a never-claim correction follows a retrieved note only when the user raised its subject', async () => {
  const note = { role: 'system' as const, content: 'Use the following retrieved notes as private background.\n\nTopic: Les hypothèses de sécurité d’Ark\nLevel: advanced\nNotes: The operator coordinates rounds.' };
  const answer = 'If the operator disappears, your funds are gone.';
  const generate = (history: { role: 'system' | 'user' | 'assistant'; content: string }[]) => generateLanguageChecked({
    backend: backendWithAnswers([answer], []),
    history,
    allowContinuation: false,
    targetLanguage: 'en',
    requestId: 'req_language_test_0005',
  });
  const ark = await generate([note, { role: 'user', content: 'If the Ark operator disappears tomorrow, are my funds gone?' }]);
  assert.deepEqual(ark.answerRuleCorrections, ['ark-funds-lost']);
  assert.match(ark.text, /\n\nCorrection: with valid exit data/);
  // The same note retrieved next to a mempool question (fr-a03, 2026-11-02) corrects nothing.
  const mempool = await generate([note, { role: 'user', content: 'Where does my transaction wait before it gets into a block?' }]);
  assert.deepEqual(mempool.answerRuleCorrections, []);
  assert.equal(mempool.text, answer);
  // A follow-up keeps the subject of the earlier turn.
  const followUp = await generate([
    { role: 'user', content: 'What can an Ark operator do with my money?' },
    { role: 'assistant', content: 'It coordinates rounds.' },
    note,
    { role: 'user', content: 'And if it disappears?' },
  ]);
  assert.deepEqual(followUp.answerRuleCorrections, ['ark-funds-lost']);
});

test('holds a split private-memory marker out of the visible stream', () => {
  assert.equal(visibleStreamingText('Visible answer.<alice_mem'), 'Visible answer.');
  assert.equal(visibleStreamingText('Visible answer.<alice_memory>{"items":[]}'), 'Visible answer.');
});
