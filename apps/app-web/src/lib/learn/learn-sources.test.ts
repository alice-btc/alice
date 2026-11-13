import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mergeLearnContexts, PLANB_ATTRIBUTION } from './learn-sources.ts';
import { loadRagEvaluationRuntime } from '../../../../../scripts/rag-eval-runtime.mjs';

const definition = {
  label: 'Dictionnaire de Bitcoin · UTXO (Loïc Pandul, CC BY-NC-SA 4.0)',
  excerpt: 'Un UTXO est une sortie de transaction non dépensée.',
  sources: [{ kind: 'definition' as const, label: 'UTXO', path: '/learn/?definition=utxo', attribution: 'Loïc Pandul, CC BY-NC-SA 4.0' }],
};
const course = {
  label: 'The Bitcoin Journey · UTXOs (Plan ₿ Academy)',
  excerpt: 'Coins are outputs.',
  sources: [{ kind: 'course' as const, label: 'BTC101 · UTXOs', path: '/learn/?course=btc101&chapter=c1', attribution: PLANB_ATTRIBUTION }],
};

describe('mergeLearnContexts', () => {
  it('puts the definition first, the course under its own label, both sources in that order', () => {
    const merged = mergeLearnContexts(definition, course);
    assert.equal(merged?.label, definition.label);
    assert.equal(merged?.excerpt, `${definition.excerpt}\n\n${course.label}\n${course.sources[0].label}\n${course.excerpt}`);
    assert.deepEqual(merged?.sources?.map(source => source.label), ['UTXO', 'BTC101 · UTXOs']);
  });

  it('passes a lone context through untouched', () => {
    assert.equal(mergeLearnContexts(definition, null), definition);
    assert.equal(mergeLearnContexts(null, course), course);
    assert.equal(mergeLearnContexts(null, null), null);
  });
});


it('preserves exact secondary source labels through the production bridge and fitting budget', async () => {
  const runtime = await loadRagEvaluationRuntime(`
    export { mergeLearnContexts } from './apps/app-web/src/lib/learn/learn-sources.ts';
    export { quotedLearnSources } from './packages/alice-ai/src/rag.ts';
    export { fitKnowledgeContext } from './packages/alice-ai/src/knowledge-context-budget.ts';
    export { registerLearnContextProvider, learnContextFor } from './packages/alice-ai/src/learn-context.ts';
  `);
  const extendedCourse = { ...course, excerpt: '\n\n' + 'A transaction consumes an unspent output in full and creates new outputs. '.repeat(8) };
  const merged = runtime.mergeLearnContexts(definition, extendedCourse);
  runtime.registerLearnContextProvider(async () => merged);
  const bridged = await runtime.learnContextFor('What is a UTXO?', { targetLanguage: 'en' });
  assert.ok(bridged?.excerpt.includes(course.sources[0].label));
  const fit = (learn: typeof merged, maxChars: number) => runtime.fitKnowledgeContext({ header: '', chunks: [], learn, maxChars }).learnContext;
  const whole = fit(bridged, 2_000);
  assert.deepEqual(runtime.quotedLearnSources(bridged, whole), [definition.sources[0], course.sources[0]]);

  const firstLength = definition.label.length + 1 + definition.excerpt.length;
  // Enough space for the entire secondary heading, but not its first body
  // paragraph: the heading and citation must disappear with that paragraph.
  const tight = fit(bridged, firstLength + 2 + course.label.length + 1 + course.sources[0].label.length + 10);
  assert.ok(tight.includes(definition.excerpt));
  assert.ok(!tight.includes(course.sources[0].label));
  assert.deepEqual(runtime.quotedLearnSources(bridged, tight), [definition.sources[0]]);

  // Reversed intent order: the first heading says UTXOs, but that substring
  // must not resurrect a cut definition with the short citation label UTXO.
  const reverse = runtime.mergeLearnContexts(course, definition);
  const reverseTight = fit(reverse, course.label.length + 1 + course.excerpt.length);
  assert.deepEqual(runtime.quotedLearnSources(reverse, reverseTight), [course.sources[0]]);
  assert.deepEqual(runtime.quotedLearnSources(reverse, fit(reverse, 2_000)), [course.sources[0], definition.sources[0]]);
});

it('does not attach a citation to an empty source excerpt', () => {
  assert.equal(mergeLearnContexts(definition, { ...course, excerpt: ' \n\n ' }), definition);
  assert.equal(mergeLearnContexts({ ...definition, excerpt: ' ' }, course), course);
  assert.equal(mergeLearnContexts({ ...definition, excerpt: '' }, null), null);
});
