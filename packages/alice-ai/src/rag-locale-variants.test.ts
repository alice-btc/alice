import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRagEvaluationRuntime } from '../../../scripts/rag-eval-runtime.mjs';

const runtime = await loadRagEvaluationRuntime(`
  export { loadRagCorpus, retrieveContext, retrieveContextHybridWithDiagnostics } from './packages/alice-ai/src/rag.ts';
  export { registerPack, getRegisteredPacks } from './packages/alice-ai/src/knowledge-packs.ts';
  export { selectCuratedKnowledge } from './packages/alice-ai/src/curated-retrieval.ts';
  export { answerRuleNoteIdsIn, registerAnswerRuleVariantTitles } from './packages/alice-ai/src/answer-rules.ts';
`);
await runtime.loadRagCorpus();

type Chunk = { id: string; conceptId: string; title: string; locale?: string; tier?: string; content: string; keywords: string[]; questions?: string[] };
type Diagnostic = { id: string; conceptId: string; locale: string };

// English variants as build-curated-rag.mjs emits them, for two concepts only:
// every other concept stays French-only, as during a partial translation.
const ENGLISH: Record<string, Pick<Chunk, 'title' | 'keywords' | 'questions' | 'content'>> = {
  multisig: {
    title: 'Multisignature wallets',
    keywords: ['Multisignature wallets', 'multisig', 'm-of-n wallet', 'quorum of keys'],
    questions: ['Are 2 of my 3 multisig seeds enough to recover my coins?'],
    content: 'Short answer\nA multisig wallet spends with a quorum of its keys: a 2-of-3 wallet needs any two of its three keys.\n\nExplanation\nRecovering it also needs the wallet descriptor with every cosigner public key.\n\nLimits and confusions\nThe seeds alone may not rebuild the wallet.',
  },
  'bitcoin-mining': {
    title: 'Bitcoin mining',
    keywords: ['Bitcoin mining', 'mining', 'miners', 'proof of work'],
    questions: ['What does a miner do?'],
    content: 'Short answer\nMining orders transactions into blocks by spending computing work.\n\nExplanation\nMiners compete to find a valid block and collect the subsidy and the fees.\n\nLimits and confusions\nMining does not create the rules that nodes enforce.',
  },
};
const curated = runtime.getRegisteredPacks().find((pack: { id: string }) => pack.id === 'alice-curated');
// Start from the French sources, whatever translations the shipped corpus has.
const french: Chunk[] = curated.chunks.filter((chunk: { translationStatus?: string }) => chunk.translationStatus === 'source');
const withEnglish = french.flatMap(chunk => ENGLISH[chunk.conceptId]
  ? [chunk, { ...chunk, ...ENGLISH[chunk.conceptId], id: `${chunk.id}.en`, locale: 'en', sourceLocale: 'fr', translationStatus: 'machine', sourcePath: `data/alice-corpus/examples/${chunk.conceptId}.en.md` }]
  : [chunk]);
assert.equal(withEnglish.length, french.length + 2);
runtime.registerPack({ ...curated, language: 'multi', chunks: withEnglish });
runtime.registerAnswerRuleVariantTitles(withEnglish);

async function retrieve(query: string, targetLanguage: 'en' | 'fr', maxChunks = 3): Promise<Diagnostic[]> {
  const { diagnostics } = await runtime.retrieveContextHybridWithDiagnostics(query, { targetLanguage, maxChunks });
  return diagnostics;
}
const assertOneVariantPerConcept = (diagnostics: Diagnostic[], maxChunks: number) => {
  assert.ok(diagnostics.length <= maxChunks);
  assert.equal(new Set(diagnostics.map(d => d.conceptId)).size, diagnostics.length, JSON.stringify(diagnostics));
};

test('an English target retrieves the English variant of a translated concept', async () => {
  const diagnostics = await retrieve('I have 2 of my 3 multisig seeds. Is that enough to recover my coins?', 'en', 2);
  const multisig = diagnostics.find(d => d.conceptId === 'multisig');
  assert.ok(multisig, JSON.stringify(diagnostics));
  assert.deepEqual([multisig.id, multisig.locale], ['curated-multisig.en', 'en']);
  const context = runtime.retrieveContext('Tell me about mining', { targetLanguage: 'en' });
  assert.match(context, /^Topic: Bitcoin mining$/m);
  assert.doesNotMatch(context, /Minage|minage/);
});

test('a French target keeps the French source even when an English variant exists', async () => {
  const diagnostics = await retrieve('J’ai 2 de mes 3 seeds multisig, est-ce suffisant pour récupérer mes fonds ?', 'fr', 2);
  const multisig = diagnostics.find(d => d.conceptId === 'multisig');
  assert.ok(multisig, JSON.stringify(diagnostics));
  assert.deepEqual([multisig.id, multisig.locale], ['curated-multisig', 'fr']);
});

test('an English target falls back to the French note when the concept has no English variant', async () => {
  const diagnostics = await retrieve('What is Lightning?', 'en', 3);
  assert.deepEqual(diagnostics.map(d => [d.id, d.locale]), [['curated-lightning-network', 'fr']]);
});

test('the two variants of a concept never both appear, and maxChunks counts concepts', async () => {
  for (const [query, language] of [
    ['I have 2 of my 3 multisig seeds. Is that enough to recover my coins?', 'en'],
    ['Tell me about mining', 'en'], ['Tell me about mining', 'fr'],
    ['What is the difference between multisig and a single-key wallet?', 'en'],
    ['Why do miners join pools instead of mining alone?', 'en'],
  ] as const) {
    for (const maxChunks of [1, 2, 3]) assertOneVariantPerConcept(await retrieve(query, language, maxChunks), maxChunks);
  }
  // Direct callers of the scorer get the same guarantee.
  const direct = runtime.selectCuratedKnowledge('multisig seeds recovery mining', withEnglish, { maxChunks: 3, targetLanguage: 'en' });
  assert.equal(new Set(direct.map((c: Chunk) => c.conceptId)).size, direct.length);
  // With no target the scorer keeps the French source variants.
  assert.ok(runtime.selectCuratedKnowledge('Tell me about mining', withEnglish).every((c: Chunk) => c.locale === 'fr'));
});

test('semantic hits on either variant are fused by concept onto the kept variant', async () => {
  // The semantic index holds both variants: the English one scores higher here.
  runtime.setEvaluationSemanticMatcher(async () => [
    { id: 'curated-multisig.en', score: .97 }, { id: 'curated-multisig', score: .9 },
    { id: 'curated-bitcoin-mining.en', score: .88 }, { id: 'curated-bitcoin-mining', score: .87 },
  ]);
  try {
    const fr = await retrieve('Mes seeds multisig suffisent-elles ?', 'fr', 3);
    assertOneVariantPerConcept(fr, 3);
    assert.ok(fr.every(d => d.locale === 'fr'), JSON.stringify(fr));
    assert.ok(fr.some(d => d.conceptId === 'multisig'), JSON.stringify(fr));
    const en = await retrieve('Are my multisig seeds enough?', 'en', 3);
    assertOneVariantPerConcept(en, 3);
    assert.ok(en.some(d => d.id === 'curated-multisig.en'), JSON.stringify(en));
  } finally { runtime.setEvaluationSemanticMatcher(null); }
});

test('answer rules follow their note into its English variant', () => {
  const context = runtime.retrieveContext('I have 2 of my 3 multisig seeds. Is that enough to recover my coins?', { targetLanguage: 'en', maxChunks: 2 });
  assert.match(context, /^Topic: Multisignature wallets$/m);
  assert.deepEqual(runtime.answerRuleNoteIdsIn(context), ['multisig']);
});
