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

test('general Lightning payment mechanics retrieve the overview rather than fee policy', () => {
  for (const query of [
    'Explain how a Lightning payment works at a level suited to my experience.',
    'Explique comment fonctionne un paiement Lightning selon mon expérience.',
  ]) assert.deepEqual(concepts(query), ['lightning-network']);
  assert.deepEqual(concepts('Why can Lightning payments fail despite a positive balance?'), ['lightning-liquidity-path']);
  assert.notDeepEqual(concepts('Explain how a Lightning payment fee works.'), ['lightning-network']);
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

test('confirmation loss and reorganisation questions select confirmation and finality evidence', () => {
  for (const query of [
    "Un paiement Bitcoin que je reçois est passé de 1 confirmation à 0 après une réorganisation de la chaîne. Est-ce que ça veut forcément dire que l'expéditeur a repris les bitcoins ?",
    'Why did my Bitcoin transaction lose a confirmation after a chain reorganization?',
    'Does a reorg of Bitcoin blocks prove the payer took the money back?',
    "Et si j'attends 6 confirmations, est-ce que le risque devient mathématiquement nul, même pour un montant énorme ?",
    'Does six confirmations mean six blocks after the transaction block?',
    'How many confirmations make Bitcoin settlement irreversible?',
  ]) {
    assert.deepEqual(concepts(query, { maxChunks: 2 }), ['bitcoin-transaction-confirmation', 'bitcoin-finality'], query);
    assert.deepEqual(concepts(query, { maxChunks: 1 }), ['bitcoin-transaction-confirmation'], query);
  }
});

test('reorganisation anchors survive irrelevant semantic neighbours and respect target locale', () => {
  const query = 'Why can a Bitcoin reorg remove a transaction confirmation?';
  const matches = selected(query, { maxChunks: 2, targetLanguage: 'en', semanticMatches: [
    {id:'curated-pruned-node-history',score:.99}, {id:'curated-bitcoin-base-layer',score:.99},
  ] });
  assert.deepEqual(matches.map((m: {conceptId: string}) => m.conceptId), ['bitcoin-transaction-confirmation', 'bitcoin-finality']);
  assert.ok(matches.every((m: {locale: string}) => m.locale === 'en'));
});

test('block height, old block storage and fee estimates do not become confirmation-finality questions', () => {
  for (const query of [
    'Can a pruned node send me an old block?',
    'How much disk storage do I need to validate old Bitcoin blocks?',
    'What is the height of a block?',
    'Why can old blocks be removed when pruning a node?',
    'Does my company need a reorganisation?',
    'How do I confirm my email address?',
  ]) assert.notDeepEqual(concepts(query, {maxChunks:2}), ['bitcoin-transaction-confirmation', 'bitcoin-finality'], query);
  assert.deepEqual(concepts('Are Bitcoin confirmation fees cheaper at night?'), ['transaction-fees']);
  assert.deepEqual(concepts('Can I cancel a Bitcoin transaction after one confirmation?'), ['bitcoin-finality']);
  assert.ok(concepts('Can a pruned node send me an old block?').includes('pruned-node-history'));
});

test('explicit passphrase, pending invoice and directional liquidity outrank generic recovery or fees', () => {
  for (const [query, expected] of [
    ["Mon portefeuille utilisait une phrase BIP39 de 24 mots et une passphrase supplémentaire. Les mots suffisent-ils si j’ai oublié la passphrase ?", 'bip39-passphrase'],
    ['Does my BIP39 seed restore the same wallet without its passphrase?', 'bip39-passphrase'],
    ['Une facture Lightning BOLT11 est expirée mais le paiement reste en cours : a-t-il forcément échoué ?', 'lightning-invoice'],
    ['Is a pending BOLT11 invoice payment refunded immediately when the invoice expires?', 'lightning-invoice'],
    ["Je gère mon nœud Lightning et j’ai financé un canal entièrement. Pourquoi ne puis-je pas recevoir un gros paiement ?", 'inbound-liquidity'],
    ['Why does funding my own Lightning channel not guarantee incoming liquidity?', 'inbound-liquidity'],
    ['Lightning channel liquidity receiving sending route capacity', 'inbound-liquidity'],
  ]) assert.deepEqual(concepts(query, {maxChunks:1}), [expected], query);
});
test('specific anchors do not redirect other chains, banking invoices or channel splicing', () => {
  // Such a query can still lexically match shared BIP39 material; it must not
  // be forced through the Bitcoin-specific anchor (score 1).
  assert.ok(!selected('How does an Ethereum wallet passphrase work?', {maxChunks:1}).some((m: {conceptId:string;retrievalScore:number}) => m.conceptId === 'bip39-passphrase' && m.retrievalScore === 1));
  assert.notDeepEqual(concepts('A bank invoice is pending after expiry. Is it paid?', {maxChunks:1}), ['lightning-invoice']);
  assert.notDeepEqual(concepts('How does Bitcoin RBF replace a pending transaction?', {maxChunks:1}), ['lightning-invoice']);
  assert.ok(concepts('La réception de BTC suffit-elle à remplir mon canal Lightning ?').includes('lightning-splicing'));
});

test('recipient CPFP questions retrieve child-spending evidence before RBF when comparing', () => {
  for (const question of [
    'Can the recipient use CPFP without the sender keys, or should they use RBF?',
    "Je contrôle la sortie destinataire d’une transaction non confirmée. RBF ou CPFP pour augmenter les frais ?",
  ]) {
    assert.deepEqual(concepts(question,{maxChunks:2}), ['child-pays-for-parent','replace-by-fee']);
    assert.deepEqual(concepts(question,{maxChunks:1}), ['child-pays-for-parent']);
  }
  assert.deepEqual(concepts('How does child pays for parent work?',{maxChunks:2}), ['child-pays-for-parent']);
  assert.ok(!concepts('Does RBF preserve the recipient amount?').includes('child-pays-for-parent'));
  assert.ok(!concepts('How do I pay for a child’s school invoice?').includes('child-pays-for-parent'));
});

test('Lightning recovery selects primary context and privacy keeps the relevant actor boundaries', () => {
  for (const query of [
    'Does restoring an LND seed reconstruct active channel balances?',
    'La sauvegarde des canaux LND permet-elle de reprendre le routage ?',
    'How does LND static channel backup recovery work?',
  ]) {
    assert.equal(concepts(query, {maxChunks:1})[0], 'lightning-node-backup', query);
    assert.deepEqual(concepts(query, {maxChunks:2}), ['lightning-node-backup', 'secondary-lightning-static-channel-backup'], query);
  }
  for (const query of ['Are Lightning payments anonymous?', 'La confidentialité Lightning protège-t-elle mon identité ?']) {
    assert.equal(concepts(query, {maxChunks:1})[0], 'lightning-privacy-tradeoff', query);
  }
  assert.equal(concepts('Decode BOLT11 invoice fields: payee public key, payment hash and amount.', {maxChunks:1})[0], 'lightning-invoice');
  for (const query of ['How do I recover a Bitcoin Core pruned node?', 'Is my bank invoice private?', 'How does an Ethereum seed backup work?']) {
    const ids = concepts(query, {maxChunks:1});
    assert.ok(!ids.includes('lightning-node-backup') && !ids.includes('lightning-privacy-tradeoff'), query);
  }
});


test('directional receiving uses a short primary note while specialist policy keeps its source', () => {
  assert.deepEqual(concepts('Can my Lightning channel receive after an outgoing payment?', {maxChunks:1}), ['inbound-liquidity']);
  for (const question of ['How do Core Lightning reserves limit incoming channel liquidity?', 'How do Lightning HTLC limits and fees restrict receiving capacity?']) {
    assert.deepEqual(concepts(question, {maxChunks:1}), ['lightning-liquidity-path'], question);
  }
});

test('majority hashpower capabilities anchor attack and consensus rather than generic nodes or reorgs', () => {
  for (const question of [
    'Can a Bitcoin mining pool with 72% of the hash power impose extra issuance?',
    'Un pool contrôle 50,5% de la puissance de calcul : peut-il imposer une subvention interdite ?',
    'Can more than half the mining power reorganize Bitcoin confirmations?',
    'What can a majority mining pool censor?',
    'Is majority hash power harmless if supply stays unchanged?',
    'Que peut faire une attaque majoritaire ?',
    'What is a 51% attack?',
  ]) {
    assert.deepEqual(concepts(question, {maxChunks:2}), ['51-attack','bitcoin-consensus'], question);
    assert.deepEqual(concepts(question, {maxChunks:1}), ['51-attack'], question);
  }
  assert.equal(selected('Can 80% of hashpower change valid Bitcoin rules?', {maxChunks:1,targetLanguage:'en'})[0].title, 'The majority attack');
  for (const question of [
    'What if 60% of miners stop mining?',
    'What if 70% of Bitcoin hash power goes offline?',
    'Does a mining pool distribute 60% of its revenue?',
    'My pool has 60% of hash power; how are its payouts calculated?',
    'Explain proof of work.',
    'Are six confirmations mathematically final?',
    'Can 75% of Litecoin hash power impose extra issuance?',
    'Are a majority of full nodes voting to raise the supply?',
    'Why did this quoted claim appear: "60% of hash power can change rules"? Explain pool payouts.',
    'Majority mining is one topic. New topic: how does pruning work?',
  ]) assert.ok(!selected(question, {maxChunks:1}).some((m:{conceptId:string;retrievalScore:number}) => m.conceptId === '51-attack' && m.retrievalScore === 1), question);
  assert.deepEqual(concepts('What if 60% of miners stop mining?', {maxChunks:1}), ['difficulty-adjustment']);
});

test('issuance violation questions select monetary rules and consensus', () => {
  for (const q of ['Why do Bitcoin nodes reject a block that creates too many coins?', 'Pourquoi les nœuds Bitcoin rejettent-ils un bloc qui crée trop de bitcoins ?', 'Can a Bitcoin block claim an unauthorized subsidy?', 'Why is excessive coinbase issuance invalid?']) assert.deepEqual(concepts(q,{maxChunks:2}),['bitcoin-monetary-policy','bitcoin-consensus'],q);
  for (const q of ['Why do Bitcoin nodes reject an oversized block?', 'Why does Coinbase exchange reject my transfer?', 'How does Ethereum create coins?', 'How is a Bitcoin transaction fee chosen?']) assert.notDeepEqual(concepts(q,{maxChunks:1}),['bitcoin-monetary-policy'],q);
  assert.deepEqual(concepts('Explain how a Lightning payment works for my level.',{maxChunks:1}),['lightning-network']);
});
