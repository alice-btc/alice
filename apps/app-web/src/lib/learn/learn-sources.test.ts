import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mergeLearnContexts, PLANB_ATTRIBUTION } from './learn-sources.ts';

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
    assert.equal(merged?.excerpt, `${definition.excerpt}\n\n${course.label}\n${course.excerpt}`);
    assert.deepEqual(merged?.sources?.map(source => source.label), ['UTXO', 'BTC101 · UTXOs']);
  });

  it('passes a lone context through untouched', () => {
    assert.equal(mergeLearnContexts(definition, null), definition);
    assert.equal(mergeLearnContexts(null, course), course);
    assert.equal(mergeLearnContexts(null, null), null);
  });
});
