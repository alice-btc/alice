import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONVERSATION_WINDOW_MAX_CHARS,
  CONVERSATION_WINDOW_MAX_MESSAGES,
  composeGenerationHistory,
  windowConversationHistory,
} from './generation-context.ts';
import { createPedagogicalProfile, pedagogicalContext, updatePedagogicalProfile } from './pedagogical-profile-core.ts';

test('keeps the user message raw and inserts transient RAG as a system turn', () => {
  const rawQuestion = 'What is Ark?';
  const result = composeGenerationHistory(
    [
      { role: 'user', content: 'What is Bitcoin?' },
      { role: 'assistant', content: 'Bitcoin is a monetary network.' },
      { role: 'user', content: rawQuestion },
    ],
    { ragContext: 'Ark est un protocole Bitcoin.', localContext: null, learnContext: null },
    'The user is new to Ark.',
  );

  assert.equal(result.at(-1)?.content, rawQuestion);
  assert.equal(result.at(-1)?.role, 'user');
  assert.equal(result.at(-2)?.role, 'system');
  assert.match(result.at(-2)?.content ?? '', /Ark est un protocole Bitcoin/);
  assert.doesNotMatch(result.at(-1)?.content ?? '', /Retrieved knowledge/);
});

test('does not persist internal context into later raw history', () => {
  const raw = [{ role: 'user' as const, content: 'Pourquoi ?' }];
  composeGenerationHistory(raw, { ragContext: 'private note', localContext: 'summary', learnContext: null }, 'beginner');
  assert.deepEqual(raw, [{ role: 'user', content: 'Pourquoi ?' }]);
});

test('the outbound system turn receives a derived teaching instruction, never the profile document', () => {
  const question = 'How does Lightning routing work?';
  const profile = updatePedagogicalProfile(createPedagogicalProfile(), question, new Date(2026, 7, 7));
  const result = composeGenerationHistory(
    [{ role: 'user', content: question }],
    { ragContext: null, localContext: null, learnContext: null },
    pedagogicalContext(profile, question),
  );

  const system = result.at(-2)?.content ?? '';
  for (const field of ['explorationSignals', 'lastActiveDay', 'updatedDay']) {
    assert.equal(system.includes(field), false, field);
  }
  assert.equal(system.includes(JSON.stringify(profile)), false);
  assert.match(system, /Current concepts: lightning-basics, lightning-routing/);
});

const MIXED_SESSION = [
  { role: 'user' as const, content: 'What is Bitcoin?' },
  { role: 'assistant' as const, content: 'Bitcoin is a monetary network.' },
  { role: 'user' as const, content: 'Quelle est la difference entre UTXO et vTXO ?' },
  { role: 'assistant' as const, content: 'Un UTXO et un vTXO...' },
  { role: 'user' as const, content: "why can't I share my seed phrase?" },
];

// Private Cloud used to drop every assistant turn and re-encode only the last
// exchange as a user-role transcript, on the belief that Venice left assistant
// turns in clear. The enclave decrypts them like any other turn (verified
// 2026-10-29), so every backend now receives the same alternating history.
test('every backend receives the full alternating history, assistant turns in their own role', () => {
  const result = composeGenerationHistory(
    MIXED_SESSION,
    { ragContext: null, localContext: null, learnContext: null },
    '',
  );

  assert.deepEqual(result, MIXED_SESSION);
  assert.equal(result.some(message => /already answered|reference transcript/.test(message.content)), false);
});

test('a question that points back 2 turns keeps what it points at', () => {
  const session = [
    { role: 'user' as const, content: 'What do you think about Christine Lagarde?' },
    { role: 'assistant' as const, content: 'Christine Lagarde presides over the European Central Bank.' },
    { role: 'user' as const, content: 'Take a side, what do you think of Christine Lagarde?' },
    { role: 'assistant' as const, content: 'I can describe her record at the ECB.' },
    { role: 'user' as const, content: 'If you had to choose a side, what would you think about her?' },
  ];
  const result = composeGenerationHistory(
    session,
    { ragContext: 'ECB note', localContext: null, learnContext: null },
    '',
  );

  assert.equal(result.filter(message => message.role === 'assistant').length, 2);
  assert.match(result[0]?.content ?? '', /Christine Lagarde/);
  assert.equal(result.at(-2)?.role, 'system');
  assert.equal(result.at(-1)?.content, session.at(-1)?.content);
});

test('the window drops the oldest turns whole beyond the character budget and opens on a user turn', () => {
  const history = [
    { role: 'user' as const, content: 'first question' },
    { role: 'assistant' as const, content: 'x'.repeat(50) },
    { role: 'user' as const, content: 'second question' },
    { role: 'assistant' as const, content: 'y'.repeat(50) },
    { role: 'user' as const, content: 'third question' },
  ];

  // Budget for the latest question, the previous answer and its question, not
  // for the first exchange.
  const windowed = windowConversationHistory(history, 90, CONVERSATION_WINDOW_MAX_MESSAGES);
  assert.deepEqual(windowed.map(message => message.role), ['user', 'assistant', 'user']);
  assert.equal(windowed[0]?.content, 'second question');

  // A budget that cuts inside an exchange drops the orphaned reply too.
  const tight = windowConversationHistory(history, 70, CONVERSATION_WINDOW_MAX_MESSAGES);
  assert.deepEqual(tight.map(message => message.content), ['third question']);

  // The latest message is always kept, even over budget.
  assert.deepEqual(windowConversationHistory(history, 1, CONVERSATION_WINDOW_MAX_MESSAGES), [history.at(-1)]);
});

test('the window caps the number of messages under the proxy limit', () => {
  const history = Array.from({ length: 30 }, (_, index) => ({
    role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
    content: `turn ${index}`,
  }));
  const windowed = windowConversationHistory(history, CONVERSATION_WINDOW_MAX_CHARS, 7);
  // 7 messages from the end would open on an assistant turn (index 23), so
  // the window opens on the next user turn.
  assert.equal(windowed.length, 6);
  assert.equal(windowed[0]?.role, 'user');
  assert.equal(windowed[0]?.content, 'turn 24');
  assert.ok(CONVERSATION_WINDOW_MAX_MESSAGES < 64, 'the proxy accepts at most 64 messages per request');
});

test('the first question carries no history', () => {
  const result = composeGenerationHistory(
    [{ role: 'user' as const, content: 'What is Bitcoin?' }],
    { ragContext: 'Bitcoin is a monetary network.', localContext: null, learnContext: null },
    '',
  );
  assert.deepEqual(result.map(message => message.role), ['system', 'user']);
  assert.equal(result.at(-1)?.content, 'What is Bitcoin?');
});

test('the answer-rules block follows the turn directive in the system turn and is absent when empty', () => {
  const history = [{ role: 'user' as const, content: 'Can I cancel a Bitcoin payment I sent by mistake?' }];
  const context = { ragContext: 'Topic: Replace-by-fee\nLevel: intermediate\nNotes: x', localContext: null, learnContext: null };
  const block = '[Answer rules]\nState:\n- A confirmed payment cannot be undone.';
  const withRules = composeGenerationHistory(history, context, 'teach', '', '', 'Answer the explicit question.', block);
  const system = withRules.at(-2)?.content ?? '';
  assert.ok(system.endsWith(block));
  assert.ok(system.indexOf('[Current turn intent]') < system.indexOf('[Answer rules]'));
  assert.equal(withRules.at(-1)?.content, history[0].content);
  const without = composeGenerationHistory(history, context, 'teach', '', '', 'Answer the explicit question.', '');
  assert.doesNotMatch(without.at(-2)?.content ?? '', /\[Answer rules\]/);
});

test('a Learn excerpt is headed by its authors and licences, and the model is asked to name its source', () => {
  const result = composeGenerationHistory(
    [{ role: 'user', content: "C'est quoi un UTXO ?" }],
    {
      ragContext: null,
      localContext: null,
      learnContext: 'Dictionnaire de Bitcoin · UTXO\nUn UTXO est une sortie non dépensée.\n\nBTC101 · UTXOs\nCoins are outputs.',
      learnSources: [
        { kind: 'definition', label: 'UTXO', path: '/learn/?definition=utxo', attribution: 'Loïc Pandul, CC BY-NC-SA 4.0' },
        { kind: 'course', label: 'BTC101 · UTXOs', path: '/learn/?course=btc101', attribution: 'Plan ₿ Network, CC BY-SA 4.0' },
      ],
    },
    '',
  );
  const system = result.at(-2)?.content ?? '';
  assert.match(system, /Learn excerpts, quoted from Loïc Pandul, CC BY-NC-SA 4.0 and Plan ₿ Network, CC BY-SA 4.0/);
  assert.match(system, /end with one short sentence saying which source helped/);
  assert.match(system, /Un UTXO est une sortie non dépensée/);
  // Without sources, the historical Plan B wording stands.
  const legacy = composeGenerationHistory(
    [{ role: 'user', content: 'What is a wallet?' }],
    { ragContext: null, localContext: null, learnContext: 'Wallets\nA wallet holds keys.' },
    '',
  );
  assert.match(legacy.at(-2)?.content ?? '', /Course excerpt, Plan B Academy, CC BY-SA 4.0/);
});
