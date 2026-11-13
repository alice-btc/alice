import assert from 'node:assert/strict';
import test from 'node:test';
import { additionalExplicitMemoryCandidates, groundedModelMemoryCandidates } from './alice-memory-capture.ts';
import { parseAliceMemoryResponse, rememberAliceCandidatesInStorage, type AliceMemoryCandidate, type AliceMemoryStorage } from './alice-memory-core.ts';
import { planAliceTurn } from './turn-planner.ts';
import { generateLanguageChecked } from './language-generation.ts';
import type { AIBackend } from './ai-backend.ts';

const invented: AliceMemoryCandidate = { category: 'preference', text: 'Uses an analogy-based explanation for beginners' };
const question = 'Explain transaction inputs and outputs using an analogy suited to my background.';

test('actual UI model metadata is rejected before storage without changing the visible answer', async () => {
  const raw = `The transaction consumes previous outputs and creates new outputs.\n<alice_memory>${JSON.stringify({ items: [invented] })}</alice_memory>`;
  const parsed = parseAliceMemoryResponse(raw);
  assert.deepEqual(parsed.candidates, [invented]); // The parser keeps it: provenance, not privacy filtering, rejects it below.
  const grounded = groundedModelMemoryCandidates(parsed.candidates, question);
  assert.deepEqual(grounded, []);
  let stored: string | null = null;
  const storage: AliceMemoryStorage = { read: async () => stored, write: async value => { stored = value; }, remove: async () => { stored = null; } };
  const memory = await rememberAliceCandidatesInStorage(grounded, storage);
  assert.deepEqual(memory.items, []);
  assert.equal(parsed.visibleText, 'The transaction consumes previous outputs and creates new outputs.');
});

test('current explicit FR/EN declarations retain supported model summaries', () => {
  const cases: [string, AliceMemoryCandidate][] = [
    ['I prefer examples.', { category: 'preference', text: 'Prefers examples' }],
    ['Je préfère les exemples.', { category: 'preference', text: 'Prefers examples' }],
    ['I prefer concise answers. What is Bitcoin?', { category: 'preference', text: 'Prefers short answers' }],
    ['Je préfère les réponses courtes. Explique Bitcoin.', { category: 'preference', text: 'Prefers concise answers' }],
    ['I use a hardware wallet.', { category: 'setup', text: 'Uses a hardware wallet' }],
    ["J'utilise un portefeuille matériel.", { category: 'setup', text: 'Uses a hardware wallet' }],
    ['I work with relational databases.', { category: 'background', text: 'Familiar with relational databases' }],
    ['Je travaille avec des bases de données relationnelles.', { category: 'background', text: 'Familiar with relational databases' }],
    ['My goal is to learn Bitcoin privacy.', { category: 'goal', text: 'Learn Bitcoin privacy' }],
    ['I am building a wallet tutorial.', { category: 'project', text: 'Working on a wallet tutorial' }],
    ['I am interested in Ark.', { category: 'interest', text: 'Interested in Ark' }],
    ['I cannot run a full node.', { category: 'constraint', text: 'Cannot run a full node' }],
  ];
  for (const [message, candidate] of cases) assert.deepEqual(groundedModelMemoryCandidates([candidate], message), [candidate], message);
});

test('one-off requests, quoted/hypothetical declarations and unrelated qualifications are not evidence', () => {
  const examples: AliceMemoryCandidate = { category: 'preference', text: 'Prefers examples' };
  for (const message of [
    question,
    'Explain this with examples for a beginner.',
    'Explique les entrées et sorties avec une analogie adaptée à mon parcours.',
    'I would prefer examples if I were a beginner.',
    'If I prefer examples, how would you respond?',
    'Explain the sentence "I prefer examples."',
    "Explain 'I prefer examples.'",
    'Je ne préfère pas les exemples.',
    'I prefer no examples.',
    'I work with databases. Explain this with examples.',
    'I prefer concise answers. Explain this with examples.',
  ]) assert.deepEqual(groundedModelMemoryCandidates([examples], message), [], message);
  assert.deepEqual(groundedModelMemoryCandidates([invented], 'I prefer analogies.'), []);
  assert.deepEqual(groundedModelMemoryCandidates([{ category: 'background', text: 'Experienced Bitcoin developer' }], 'I am a beginner with Bitcoin.'), []);
  assert.deepEqual(groundedModelMemoryCandidates([{ category: 'setup', text: 'Uses a hardware wallet' }], 'I have a hardware wallet holding 0.5 BTC.'), []);
});

test('deterministic declarations and explicitly requested notes remain on their existing path', () => {
  assert.deepEqual(planAliceTurn('I work with relational databases.').explicitMemoryCandidates, [{ category: 'background', text: 'Familiar with relational databases' }]);
  assert.deepEqual(planAliceTurn('I am a complete beginner with Bitcoin.').explicitMemoryCandidates, [{ category: 'background', text: 'Beginner with Bitcoin' }]);
  const requested = planAliceTurn('Remember that I prefer analogies for explanations.');
  assert.equal(requested.requestedNote?.standalone, true);
  assert.deepEqual(requested.explicitMemoryCandidates, [{ category: 'requested-note', text: 'I prefer analogies for explanations' }]);
});

test('all generation backends use current-user provenance, never assistant or supplied context', async () => {
  for (const type of ['custom', 'local', 'cloud'] as const) {
    const backend = { type, sendMessage: async () => ({ content: `Here is a clear explanation of Bitcoin transaction inputs and outputs.\n<alice_memory>${JSON.stringify({ items: [invented] })}</alice_memory>` }) } as AIBackend;
    const result = await generateLanguageChecked({
      backend, allowContinuation: false, targetLanguage: 'en',
      history: [
        { role: 'system', content: 'Saved background: beginner; prefers analogies.' },
        { role: 'user', content: 'I prefer analogies for beginners.' },
        { role: 'assistant', content: 'You prefer analogy-based explanations for beginners.' },
        { role: 'user', content: question },
      ],
    });
    assert.deepEqual(result.memoryCandidates, [], type);
    assert.doesNotMatch(result.text, /alice_memory/);
    assert.match(result.text, /transaction inputs and outputs/);
  }
});

test('supported declarations in a mixed question survive the real generation boundary', async () => {
  const items: AliceMemoryCandidate[] = [{ category: 'preference', text: 'Prefers examples' }, { category: 'setup', text: 'Uses a hardware wallet' }];
  const backend = { type: 'custom', sendMessage: async () => ({ content: `Bitcoin is an open monetary network with public rules.\n<alice_memory>${JSON.stringify({ items })}</alice_memory>` }) } as AIBackend;
  for (const message of [
    'I prefer examples and I use a hardware wallet. What is Bitcoin?',
    "Je préfère les exemples et j'utilise un portefeuille matériel. Explique Bitcoin.",
  ]) {
    const result = await generateLanguageChecked({ backend, allowContinuation: false, targetLanguage: 'en', history: [{ role: 'user', content: message }] });
    assert.deepEqual(result.memoryCandidates, items, message);
    assert.doesNotMatch(result.text, /alice_memory/);
  }
});

test('bounded explicit paraphrases are captured deterministically without inventing qualifications', () => {
  for (const [message, category, text] of [
    ["I've been working with SQL databases for years.", 'background', 'Works with SQL databases'],
    ['Les réponses brèves me conviennent mieux.', 'preference', 'Prefers concise answers'],
    ['I usually prefer brief answers.', 'preference', 'Prefers concise answers'],
    ['A hardware wallet is what I use every day.', 'setup', 'Uses a hardware wallet'],
    ['Je débute dans Bitcoin.', 'background', 'Beginner with Bitcoin'],
    ["Je m'intéresse à la confidentialité de Bitcoin.", 'interest', 'Interested in Bitcoin privacy'],
    ["I don't like long answers.", 'preference', 'Dislikes long answers'],
    ["Je n'aime pas les réponses longues.", 'preference', 'Dislikes long answers'],
  ] as const) {
    const candidate = { category, text };
    assert.deepEqual(additionalExplicitMemoryCandidates(message), [candidate], message);
    const plan = planAliceTurn(message);
    assert.ok(plan.explicitMemoryCandidates.some(fact => fact.category === category && fact.text === text), message);
    assert.equal(plan.kind, 'personal-statement', message);
    assert.equal(plan.retrievalQuery, null, message);
    assert.deepEqual(groundedModelMemoryCandidates([candidate], message), [candidate], message);
  }
  assert.deepEqual(groundedModelMemoryCandidates([{ category: 'background', text: 'Familiar with relational databases' }], "I've been working with SQL databases for years."), []);
  for (const candidate of [{ category: 'preference' as const, text: 'Prefers long answers' }, { category: 'preference' as const, text: 'Prefers short answers' }]) {
    assert.deepEqual(groundedModelMemoryCandidates([candidate], "I don't like long answers."), []);
  }
});

test('paraphrase capture excludes negations, conditional, quotation, other people and one-off requests', () => {
  for (const message of [
    'I do not usually prefer brief answers.',
    'Les réponses brèves ne me conviennent pas.',
    'A hardware wallet is not what I use every day.',
    "I don't work with SQL databases.",
    "Je ne m'intéresse pas à la confidentialité de Bitcoin.",
    'Je ne débute plus dans Bitcoin.',
    'If I usually prefer brief answers, would you adapt?',
    "Suppose I've been working with SQL databases for years.",
    'Explain "Les réponses brèves me conviennent mieux."',
    "My colleague says 'I usually prefer brief answers.'",
    'My colleague usually prefers brief answers.',
    "Elle s'intéresse à la confidentialité de Bitcoin.",
    'Use brief answers for this explanation.',
    'Je préfère une réponse brève pour cette question seulement.',
    question,
  ]) assert.deepEqual(additionalExplicitMemoryCandidates(message), [], message);
});

test('the real planner never captures quoted, negated or attributed legacy preferences', () => {
  for (const message of [
    'Explain "I prefer brief answers."',
    'I prefer not to receive short answers.',
    'My friend says I prefer brief answers.',
    'Explique « Je préfère les réponses courtes. »',
    'Je préfère ne pas recevoir de réponses courtes.',
    'Mon ami dit que je préfère les réponses courtes.',
    'If I prefer brief answers, how would you respond?',
    'I prefer examples. My friend writes short answers.',
    'She said "I am building a wallet tutorial."',
    "Explain 'My goal is to learn Bitcoin privacy.'",
  ]) assert.deepEqual(planAliceTurn(message).explicitMemoryCandidates, [], message);
  const mixed = planAliceTurn('I prefer short answers. Explain "I am building a wallet tutorial."');
  assert.deepEqual(mixed.explicitMemoryCandidates, [{ category: 'preference', text: 'Prefers concise answers' }]);
  assert.ok(mixed.retrievalQuery);
  assert.equal(planAliceTurn('Explain "I prefer brief answers."').kind, 'question');
});

test('a recognized fact inside a mixed sentence never suppresses its question', () => {
  for (const [message, topic] of [
    ['I usually prefer brief answers and I want to know how Lightning works?', /Lightning/],
    ['I usually prefer brief answers, and I wonder what Bitcoin is.', /Bitcoin/],
    ['Les réponses brèves me conviennent mieux, mais comment fonctionne Lightning ?', /Lightning/],
  ] as const) {
    const plan = planAliceTurn(message);
    assert.equal(plan.kind, 'mixed', message);
    assert.match(plan.retrievalQuery ?? '', topic, message);
    assert.deepEqual(plan.explicitMemoryCandidates, [{ category: 'preference', text: 'Prefers concise answers' }], message);
  }
  const declaration = planAliceTurn('A hardware wallet is what I use every day.');
  assert.equal(declaration.kind, 'personal-statement');
  assert.equal(declaration.retrievalQuery, null);
});
