import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

const runtime = await loadRagEvaluationRuntime(`
  export { selectCuratedKnowledge } from './packages/alice-ai/src/curated-retrieval';
  export { GENERATED_CURATED_KNOWLEDGE_BASE as chunks } from './packages/alice-ai/src/generated/curated-rag';
  export { loadRagCorpus, retrieveContext, retrieveContextHybridWithDiagnostics, isTechnicalRagQuery } from './packages/alice-ai/src/rag';
  export { ragQueryChunkBudget } from './packages/alice-ai/src/rag-query-policy';
  export { registerPack, unregisterPack, setKnowledgePackEnabled } from './packages/alice-ai/src/knowledge-packs';
`);
const selected = (q: string, options = {}) => runtime.selectCuratedKnowledge(q, runtime.chunks, options);
const concepts = (q: string, options = {}) => selected(q, options).map((c: { conceptId: string }) => c.conceptId);

test('sync retrieval before lazy loading fails closed and never falls back to superseded knowledge', async () => {
  assert.equal(runtime.retrieveContext('What is Bitcoin?'), null);
  await runtime.loadRagCorpus();
  assert.ok(runtime.retrieveContext('What is Bitcoin?'));
});

test('broad introductions in French and English stay primary with no specialist filler', () => {
  for (const [query, id] of [
    ['Explique-moi Bitcoin simplement.', 'bitcoin-network-vs-asset'],
    ['What is Lightning?', 'lightning-network'],
    ['What is a UTXO?', 'bitcoin-utxo'],
    ['Tell me about mining', 'bitcoin-mining'],
    ['À quoi sert un portefeuille Bitcoin ?', 'bitcoin-wallet'],
    ['C’est quoi l’inflation ?', 'inflation'],
  ]) {
    assert.deepEqual(concepts(query), [id]);
    assert.equal(selected(query)[0].tier, 'primary');
  }
});

test('specific first-turn questions open relevant secondary evidence without prior dialogue', () => {
  for (const [query, id] of [
    ['Explique le fonctionnement du splice-out.', 'lightning-splicing'],
    ['Can a pruned node send me an old block?', 'pruned-node-history'],
    ['La réception de BTC suffit-elle à remplir mon canal Lightning ?', 'lightning-splicing'],
    ['Why can Lightning payments fail despite a positive balance?', 'lightning-liquidity-path'],
    ['Un ASIC chauffe-t-il plus efficacement qu’une pompe à chaleur ?', 'mining-heat-reuse-details'],
  ]) {
    const matches = selected(query);
    assert.ok(matches.some((c: { conceptId: string }) => c.conceptId === id), query);
    assert.ok(matches.length <= 3);
    assert.ok(matches.every((c: { retrievalReason: string }) => !!c.retrievalReason));
  }
});

test('explicit compared subjects survive stronger semantic neighbours and a three-note ceiling', () => {
  const matches = concepts('Quelle différence entre Spark, Bark et Arkade ?', { semanticMatches: [
    { id: 'curated-ark-implementations-bark-arkade', score: .99 },
    { id: 'curated-ark-security-model', score: .97 },
  ] });
  assert.ok(matches.includes('spark-trust-and-exits'));
  assert.ok(matches.includes('ark-implementations-bark-arkade'));
  assert.ok(matches.length <= 3);
});

test('unrelated, live personal data and stale semantic IDs do not supply fictional evidence', () => {
  for (const query of ['Quelle est la météo à Paris demain ?', 'recette compote pommes',
    'Quel est le solde actuel de mon portefeuille personnel ?',
    'How many sats are available in my wallet right now?']) {
    assert.deepEqual(concepts(query, { semanticMatches: [{ id: 'curated-bitcoin-utxo', score: .99 }] }), [], query);
  }
  assert.deepEqual(concepts('What is Lightning?', { semanticMatches: [
    { id: 'obsidian-lightning__lightning-network', score: .99 },
    { id: 'curated-lightning-splicing', score: .99 },
    { id: 'curated-lightning-network', score: .99 },
  ] }), ['lightning-network']);
});

test('semantic evidence can reach a paraphrase without matching words in the target note', () => {
  const chunks = [
    { id: 'curated-foundation', conceptId: 'foundation', tier: 'primary', title: 'Coffre', keywords: ['custody'], questions: [], content: 'Garder les clés.', level: 'beginner' },
    { id: 'curated-detail', conceptId: 'detail', tier: 'secondary', parentIds: ['foundation'], title: 'Restauration', keywords: ['seed'], content: 'Récupération après sinistre.', level: 'advanced' },
    { id: 'curated-context', conceptId: 'context', tier: 'primary', title: 'Other', keywords: ['wallet'], content: 'wallet', level: 'beginner' },
  ];
  const result = runtime.selectCuratedKnowledge('wallet recovery planning', chunks, { semanticMatches: [
    { id: 'curated-foundation', score: .94 }, { id: 'curated-detail', score: .97 },
  ] });
  assert.ok(result.some((c: { id: string }) => c.id === 'curated-detail'));
  assert.ok(!runtime.selectCuratedKnowledge('wallet recovery planning', chunks, {
    semanticMatches: [{ id: 'curated-detail', score: .97 }],
  }).some((c: { id: string }) => c.id === 'curated-detail'));
});

test('pack provenance and enablement take precedence over colliding IDs or supplied tier metadata', async () => {
  await runtime.loadRagCorpus();
  runtime.registerPack({ id: 'old-bundled', version: '1', language: 'en', source: 'bundled', chunks: [{
    id: 'curated-bitcoin-utxo', conceptId: 'bitcoin-utxo', tier: 'primary', title: 'UTXO', keywords: ['utxo'], content: 'SUPERSEDED_SENTINEL', level: 'beginner',
  }] });
  runtime.registerPack({ id: 'downloaded-probe', version: '1', language: 'en', source: 'downloaded', chunks: [{
    id: 'downloaded-probe', tier: 'primary', title: 'Zephyr collection', keywords: ['zephyr'], content: 'banana document', level: 'beginner',
  }] });
  try {
    assert.ok(!runtime.retrieveContext('What is a UTXO?')?.includes('SUPERSEDED_SENTINEL'));
    assert.equal(runtime.retrieveContext('banana'), null);
    assert.ok(runtime.retrieveContext('zephyr'));
    runtime.setKnowledgePackEnabled('downloaded-probe', false);
    assert.equal(runtime.retrieveContext('zephyr'), null);
  } finally { runtime.unregisterPack('old-bundled'); runtime.unregisterPack('downloaded-probe'); }
});

test('hybrid diagnostics retain tier and reason after context fitting and obey chunk/text budgets', async () => {
  for (const maxChunks of [1, 2, 3, 50, NaN]) {
    const result = await runtime.retrieveContextHybridWithDiagnostics('Explique le fonctionnement du splice-out.', {
      maxChunks, maxContextChars: 6000, targetLanguage: 'fr',
    });
    assert.ok(result.diagnostics.length <= (Number.isFinite(maxChunks) ? Math.min(maxChunks, 3) : 3));
    assert.ok((result.context?.length ?? 0) <= 6000);
    assert.ok(result.diagnostics.every((d: { tier: string; retrievalReason: string }) => d.tier && d.retrievalReason));
  }
});

test('production local budgets open for a targeted secondary even when its reading level is beginner', async () => {
  const general = 'What is Lightning?';
  const specialist = 'Comment ajouter des fonds à mon canal sans le fermer ?';
  const generalLimit = runtime.ragQueryChunkBudget(general, true, () => runtime.isTechnicalRagQuery(general));
  const specialistLimit = runtime.ragQueryChunkBudget(specialist, true, () => runtime.isTechnicalRagQuery(specialist));
  assert.equal(generalLimit, 1);
  assert.equal(specialistLimit, 2);
  const result = await runtime.retrieveContextHybridWithDiagnostics(specialist, { maxChunks: specialistLimit, maxContextChars: 6000 });
  assert.ok(result.diagnostics.some((d: { conceptId: string }) => d.conceptId === 'lightning-splicing'));
  assert.ok(result.diagnostics.length <= 2);
});

test('a practical passphrase recovery question does not pull cryptographic derivation details', () => {
  const ids = concepts('Une phrase de récupération suffit-elle si j’ai aussi défini une passphrase ?');
  assert.ok(ids.includes('bip39-passphrase'));
  assert.ok(!ids.includes('secondary-bitcoin-pbkdf2'));
  assert.deepEqual(concepts('Does a Bitcoin ETF let me withdraw coins to my own wallet?'), ['paper-bitcoin']);
});

test('semantic neighbours cannot override a named topic merely because Bitcoin is mentioned', () => {
  const options = { semanticMatches: [{ id: 'curated-bitcoin-utxo', score: .99 }] };
  assert.deepEqual(concepts('Je voudrais une recette de compote de pommes pour une conférence Bitcoin.', options), []);
  const tor = concepts('Comment préserver la confidentialité en utilisant Tor ?', options);
  assert.ok(tor.includes('tor-browser'));
  assert.ok(!tor.includes('bitcoin-utxo'));
});

test('an ETF comparison keeps both exposure and custody evidence', () => {
  const ids = concepts('Quelle différence entre un ETF Bitcoin et un hardware wallet ?', { maxChunks: 2 });
  assert.ok(ids.includes('paper-bitcoin'));
  assert.ok(ids.includes('hardware-wallet'));
});

test('a specific product capability survives a more general semantic product neighbour', () => {
  const ids = concepts('Puis-je utiliser toutes les fonctions Alice sans connexion ?', { maxChunks: 1, semanticMatches: [
    { id: 'curated-alice-app-overview', score: .99 },
    { id: 'curated-alice-offline-limits', score: .90 },
  ] });
  assert.deepEqual(ids, ['alice-offline-limits']);
});
