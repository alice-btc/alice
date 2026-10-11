import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { ragQueryChunkBudget, isBroadBitcoinDefinition, isGeneralBitcoinFeeQuestion } from './rag-query-policy.ts';
import { curatedConcept } from '../../../scripts/rag-curated-concept-map.mjs';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

const runtime = await loadRagEvaluationRuntime(`
  export { loadRagCorpus, retrieveContextHybridWithDiagnostics, isTechnicalRagQuery } from './packages/alice-ai/src/rag.ts';
  export { rewriteRetrievalQuery } from './packages/alice-ai/src/rag-query-rewrite.ts';
  export { planAliceTurn } from './packages/alice-ai/src/turn-planner.ts';
`);
await runtime.loadRagCorpus();

async function retrieve(query: string, local: boolean, language: string) {
  const limit = ragQueryChunkBudget(query, local, () => runtime.isTechnicalRagQuery(query));
  const result = await runtime.retrieveContextHybridWithDiagnostics(query, { maxChunks: limit, targetLanguage: language });
  assert.ok(result.diagnostics.length <= limit);
  return result.diagnostics.map((c: { id: string; conceptId?: string }) => c.conceptId ?? c.id);
}

test('definition and cloud budgets do not perform an unnecessary technical lookup', () => {
  const unnecessary = () => { throw new Error('Technical lookup should not run'); };
  assert.equal(ragQueryChunkBudget('Explain Bitcoin.', true, unnecessary), 1);
  assert.equal(ragQueryChunkBudget('How are transactions validated?', false, unnecessary), 3);
  assert.equal(ragQueryChunkBudget('What is Lightning?\nFollow-up topic: work with ark', true, unnecessary), 2);
  assert.equal(ragQueryChunkBudget('Explain Bitcoin with examples', true, () => false), 1);
});

test('plain Bitcoin definitions resolve to the active introduction in FR and EN', async () => {
  for (const [language, query] of [
    ['en', 'Explain Bitcoin.'], ['en', 'Please explain Bitcoin!'],
    ['en', 'Define Bitcoin'], ['en', 'What is Bitcoin?'],
    ['fr', 'Explique-moi Bitcoin.'], ['fr', 'EXPLIQUE MOI LE BITCOIN !'],
    ['fr', 'Définis Bitcoin.'], ['fr', 'Qu’est-ce que Bitcoin ?'],
  ]) for (const local of [true, false]) {
    assert.deepEqual(await retrieve(query, local, language), ['bitcoin-network-vs-asset'], query);
  }
});

test('topical Bitcoin questions are not overridden by the overview shortcut', async () => {
  for (const query of ['Explain Bitcoin mining', 'Explain Bitcoin fees', 'Explain Bitcoin privacy', 'Explain Lightning', 'What is the difference between Bitcoin and Lightning?']) {
    assert.equal(isBroadBitcoinDefinition(query), false, query);
  }
  assert.ok(!(await retrieve('Explain Bitcoin mining', true, 'en')).includes('bitcoin-network-vs-asset'));
  assert.ok((await retrieve('What is Lightning?', true, 'en')).includes('lightning-network'));
});

test('all frozen relation cases retain both information needs at production budgets', async () => {
  const fixture = JSON.parse(await readFile('scripts/data/rag-query-eval/questions.json', 'utf8'));
  for (const row of fixture.cases.filter((r: { category: string }) => r.category === 'relation')) {
    const query = runtime.rewriteRetrievalQuery({
      history: [...row.history, { role: 'user', content: row.question }],
      userMessage: row.question, plan: runtime.planAliceTurn(row.question),
    });
    for (const local of [true, false]) {
      const ids = await retrieve(query, local, row.language);
      for (const group of row.relevantConceptGroups) assert.ok(group.some((id: string) => ids.includes(curatedConcept(id))), `${row.id}, local=${local}: ${ids}`);
    }
  }
});

test('autonomous comparisons also retain both subjects with a small local budget', async () => {
  for (const [language, query, left, right] of [
    ['en', 'What is the difference between CoinJoin and PayJoin?', 'coinjoin', 'payjoin'],
    ['fr', 'Quelle différence entre Lightning et Ark ?', 'lightning-network', 'ark-payments'],
    ['en', 'Is PayJoin compatible with Ark?', 'payjoin', 'ark-payments'],
  ]) {
    const ids = await retrieve(query, true, language);
    assert.ok(ids.includes(left) && ids.includes(right), `${query}: ${ids}`);
  }
});

test('semantic neighbors cannot crowd the second explicit subject out of a comparison', async () => {
  runtime.setEvaluationSemanticMatcher(async () => [
    { id: 'curated-lightning-network', score: 0.96 },
    { id: 'curated-lightning-routing', score: 0.95 },
    { id: 'curated-ark-payments', score: 0.85 },
  ]);
  try {
    const ids = await retrieve('Quelle différence entre Lightning et Ark ?', true, 'fr');
    assert.deepEqual(new Set(ids), new Set(['lightning-network', 'ark-payments']));
  } finally {
    runtime.setEvaluationSemanticMatcher(null);
  }
});


test('general L1 fee questions retain their dedicated note through semantic fusion', async () => {
  for (const semantic of [null, async () => [
    { id: 'curated-bitcoin-transaction-lifecycle', score: 0.96 },
    { id: 'curated-proof-of-work', score: 0.95 },
  ]]) {
    runtime.setEvaluationSemanticMatcher(semantic);
    try {
      for (const [language, query] of [
        ['en', 'How do Bitcoin transaction fees work?'],
        ['fr', 'Comment fonctionnent les frais de transaction Bitcoin ?'],
      ]) for (const local of [true, false]) {
        assert.equal((await retrieve(query, local, language))[0], 'transaction-fees');
      }
    } finally { runtime.setEvaluationSemanticMatcher(null); }
  }
});

test('fee anchoring excludes adjacent rails, comparisons and troubleshooting', () => {
  for (const query of [
    'How do Lightning transaction fees work?', 'Explique les frais des transactions Ark',
    'How do Bitcoin and Lightning fees compare?', 'Pourquoi ma transaction Bitcoin est bloquée malgré les frais ?',
    'How do I bump Bitcoin transaction fees with RBF?', 'Comment augmenter les frais Bitcoin ?',
    'What is the link between Bitcoin mining rewards and transaction fees?',
    'How do UTXO consolidation and Bitcoin transaction fees interact?',
    'What are the fees my exchange charges for Bitcoin?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), false, query);
});


test('indirect L1 costs and explicit RBF keep their subject through hybrid fusion', async () => {
  runtime.setEvaluationSemanticMatcher(async () => [{ id: 'curated-hardware-wallet', score: .96 }]);
  try {
    for (const [query, expected] of [
      ['Why am I paying so much just to send a small amount on-chain?', 'transaction-fees'],
      ['Pourquoi les frais sont plus élevés quand le réseau est chargé ?', 'transaction-fees'],
      ['What determines the fee rate expressed in sats per vbyte for a transaction?', 'transaction-fees'],
      ["Et le RBF, c'est risqué à utiliser ?", 'replace-by-fee'],
      ['Is RBF risky to use?', 'replace-by-fee'],
    ]) for (const local of [true, false]) assert.equal((await retrieve(query, local, 'en'))[0], expected, query);
  } finally { runtime.setEvaluationSemanticMatcher(null); }
});

test('implicit fee rules exclude other rails, asset prices and ordinary network questions', () => {
  for (const query of [
    'Why is Bitcoin expensive?', 'Why am I paying so much to send with Lightning?',
    'Pourquoi les frais Ethereum sont élevés quand le réseau est chargé ?',
    'Why is my network busy?', 'What is the weight of a Bitcoin transaction?',
  ]) assert.equal(isGeneralBitcoinFeeQuestion(query), false, query);
});


test('unrelated product documentation and stale IDs cannot enter general semantic retrieval', async () => {
  const query = 'How does a public ledger allow transactions to be independently verified?';
  const baseline = await retrieve(query, false, 'en');
  runtime.setEvaluationSemanticMatcher(async () => [
    { id: 'curated-alice-practice-faucet', score: .99 },
    { id: 'not-in-active-corpus', score: .98 },
  ]);
  try { assert.deepEqual(await retrieve(query, false, 'en'), baseline); }
  finally { runtime.setEvaluationSemanticMatcher(null); }
});

test('explicit product intent can still retrieve product documentation semantically', async () => {
  runtime.setEvaluationSemanticMatcher(async () => [{ id: 'curated-alice-practice-faucet', score: .99 }]);
  try {
    const result = await retrieve('Alice', false, 'en');
    assert.ok(result.includes('alice-practice-faucet'), result.join(', '));
  } finally { runtime.setEvaluationSemanticMatcher(null); }
});

test('explicit subject introductions survive several narrower semantic neighbors', async () => {
  runtime.setEvaluationSemanticMatcher(async () => [
    { id: 'curated-lightning-routing', score: .99 },
    { id: 'curated-transaction-fees', score: .98 },
  ]);
  try {
    for (const local of [true, false]) {
      assert.equal((await retrieve('How do Lightning fees work?', local, 'en'))[0], 'lightning-fee-policy');
    }
  } finally { runtime.setEvaluationSemanticMatcher(null); }
});

test('short technical names and interrupted French aliases retain their dedicated evidence', async () => {
  for (const [query, expected, language] of [
    ['How much independent validation does an SPV client perform?', 'spv-node', 'en'],
    ['Quelle différence entre un nœud Bitcoin complet et un client léger ?', 'spv-node', 'fr'],
    ['Can the mempool contents differ across Bitcoin nodes at the same time?', 'bitcoin-mempool', 'en'],
  ]) for (const local of [true, false]) {
    const ids = await retrieve(query, local, language);
    if (query.includes('différence')) {
      assert.ok(ids.includes('full-node') && ids.includes('spv-node'), `${query}: ${ids}`);
    } else assert.equal(ids[0], expected, query);
  }
});

test('generic direct keywords cannot displace strongly supported comparison subjects', async () => {
  for (const [query, expected] of [
    ['Why do miners often join mining pools instead of working alone?', 'mining-pool'],
    ["If a Bitcoin wallet offers slower cheaper confirmation or faster pricier confirmation, what drives the price difference?", 'transaction-fees'],
    ['How does the 2016-block difficulty retarget stabilize block timing when total hashrate changes?', 'difficulty-adjustment'],
  ]) for (const local of [true, false]) {
    const ids = await retrieve(query, local, 'en');
    const accepted = expected === 'difficulty-adjustment' ? ['difficulty-adjustment', 'mining-difficulty-details'] : [expected];
    assert.ok(accepted.includes(ids[0]), `${query}: ${ids}`);
  }
});


test('short-list fusion retains the comparison subject across local and cloud budgets', async () => {
  runtime.setEvaluationSemanticMatcher(async () => [
    { id: 'curated-bitcoin-node', score: .92 },
    { id: 'curated-bitcoin-wallet', score: .90 },
    { id: 'curated-full-node', score: .88 },
    { id: 'curated-spv-node', score: .85 },
  ]);
  try {
    for (const local of [true, false]) {
      const ids = await retrieve('Quelle est la différence entre un nœud Bitcoin complet et un nœud léger qui vérifie moins de choses ?', local, 'fr');
      // The former node-types article is now split. Both sides must remain
      // available; ranking the full-node side first is not itself a regression.
      assert.ok(ids.includes('spv-node'), ids.join(', '));
      assert.ok(ids.includes('full-node'), ids.join(', '));
    }
  } finally { runtime.setEvaluationSemanticMatcher(null); }
});


test('fee economics, tiny-output spending and multisig backup keep their evidence through fusion', async () => {
  const questions = [
    ['en', 'Does sending a larger amount of bitcoin cost more in fees?', 'transaction-fees'],
    ['fr', 'Envoyer un montant plus important en bitcoin coûte-t-il plus cher en frais ?', 'transaction-fees'],
    ['en', 'Why do wallets sometimes refuse to spend very small amounts of bitcoin?', 'coin-selection-tradeoffs'],
    ['fr', 'Pourquoi certains portefeuilles refusent-ils de dépenser de très petits montants en bitcoin ?', 'coin-selection-tradeoffs'],
    ['en', 'How should I think about backups when using a multisig Bitcoin wallet?', 'multisig'],
    ['fr', 'Comment dois-je penser aux sauvegardes lorsque j’utilise un portefeuille Bitcoin multisig ?', 'multisig'],
  ];
  for (const matcher of [null, async () => [
    { id: 'curated-alice-private-cloud', score: 0.99 },
    { id: 'curated-satoshi', score: 0.98 },
    { id: 'curated-multisig', score: 0.97 },
  ]]) {
    runtime.setEvaluationSemanticMatcher(matcher);
    try {
      for (const [language, query, concept] of questions) for (const local of [true, false]) {
        const ids = await retrieve(query, local, language);
        const accepted = concept === 'coin-selection-tradeoffs' ? ['bitcoin-utxo', 'coin-selection-tradeoffs'] : [concept];
        assert.ok(accepted.includes(ids[0]), `${query}, local=${local}: ${ids}`);
        if (concept === 'coin-selection-tradeoffs' || concept === 'multisig') assert.equal(ids.length, 1);
      }
    } finally { runtime.setEvaluationSemanticMatcher(null); }
  }
});


test('single-use output evidence survives irrelevant semantic neighbours in both budgets', async () => {
  for (const matcher of [null, async () => [
    { id: 'curated-bitcoin-utxo', score: 0.99 },
    { id: 'curated-alice-private-cloud', score: 0.98 },
  ]]) {
    runtime.setEvaluationSemanticMatcher(matcher);
    try {
      for (const [language, query] of [
        ['en', 'Why is an unspent output consumed only once?'],
        ['fr', 'Comment les UTXO évitent-ils les doubles dépenses ?'],
      ]) for (const local of [true, false]) {
        const ids = await retrieve(query, local, language);
        assert.equal(ids.length, 1);
        assert.ok(['double-spending', 'bitcoin-utxo'].includes(ids[0]), `${query}: ${ids}`);
      }
    } finally { runtime.setEvaluationSemanticMatcher(null); }
  }
});

test('a product page cannot stand in for the Bitcoin note a plain question is about', async () => {
  // Billing, security and account pages share words with ordinary questions
  // ("payment", "recover", "mistake"). Without a product cue or one of their
  // own aliases they stay out of the lexical candidates, as they already did
  // out of the semantic ones.
  for (const [query, language, expected] of [
    ['Can I cancel a Bitcoin payment I sent by mistake?', 'en', ['replace-by-fee', 'bitcoin-finality']],
    ['When I send 0.3 BTC from a coin worth 1 BTC, what happens to the rest?', 'en', ['change-output', 'bitcoin-utxo', 'transaction-fees']],
    ['Is it fine to print one Bitcoin address on my business cards?', 'en', ['address-reuse']],
  ] as const) {
    const ids = await retrieve(query, true, language);
    assert.ok(ids.some((id: string) => (expected as readonly string[]).includes(id)), `${query} -> ${ids.join(', ')}`);
    assert.ok(!ids.some((id: string) => id.startsWith('alice-')), `${query} retrieved product documentation: ${ids.join(', ')}`);
  }
  const product = await retrieve('How does Alice count my Private Cloud allowance?', false, 'en');
  assert.ok(product.some((id: string) => id.startsWith('alice-')), `product question lost its documentation: ${product.join(', ')}`);
});

test('the acceptance subjects the lexical path used to miss reach their notes from the whole message', async () => {
  for (const [message, language, expected] of [
    ['What happens to block times if half the miners switch off overnight?', 'en', ['difficulty-adjustment']],
    ['Que deviennent les temps de bloc si la moitié des mineurs s\'arrêtent du jour au lendemain ?', 'fr', ['difficulty-adjustment']],
    ['I only have a laptop with 100 GB free. Can I still verify Bitcoin myself?', 'en', ['pruned-node', 'bitcoin-node']],
    ['Je n\'ai qu\'un portable avec 100 Go de libre. Puis-je quand même vérifier Bitcoin moi-même ?', 'fr', ['pruned-node', 'bitcoin-node']],
    ['My wallet did not mark the transaction as replaceable. Does that mean nobody can replace it?', 'en', ['replace-by-fee']],
    ['Mon portefeuille n\'a pas marqué la transaction comme remplaçable. Personne ne peut donc la remplacer ?', 'fr', ['replace-by-fee']],
    ['Someone sent me 300 sats. Why does my wallet say it may be uneconomic to spend?', 'en', ['bitcoin-utxo', 'coin-selection-tradeoffs']],
    ['Quelqu\'un m\'a envoyé 300 sats. Pourquoi mon portefeuille dit-il que ce serait non rentable à dépenser ?', 'fr', ['bitcoin-utxo', 'coin-selection-tradeoffs']],
    ['I have 2 of my 3 multisig seeds. Is that enough to recover my coins?', 'en', ['multisig']],
    ['Puis-je annuler un paiement Bitcoin envoyé par erreur ?', 'fr', ['replace-by-fee', 'bitcoin-finality']],
  ] as const) {
    const query = runtime.planAliceTurn(message).retrievalQuery;
    assert.ok(query, `${message} produced no retrieval query`);
    for (const local of [true, false]) {
      const ids = await retrieve(query, local, language);
      assert.ok(ids.some((id: string) => (expected as readonly string[]).includes(id)), `${message} (${local ? 'local' : 'cloud'}) -> ${ids.join(', ')}`);
    }
  }
});
