import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { askContextLabel, explorerPageNote } from './ask-context.ts';
import { findRawIdentifiersInText } from './route.ts';
import type { TabKind } from './tabs.ts';
import type { NetworkKind } from './networks.ts';

const KINDS: TabKind[] = ['overview', 'tx', 'address', 'block', 'xpub', 'vtxo'];
const NETWORKS: { kind: NetworkKind; label: string }[] = [
  { kind: 'bitcoin', label: 'Bitcoin' }, { kind: 'bitcoin', label: 'Mutinynet' }, { kind: 'liquid', label: 'Liquid' },
  { kind: 'arkade', label: 'Arkade' }, { kind: 'bark', label: 'Bark' }, { kind: 'spark', label: 'Spark' },
];

describe('explorerPageNote', () => {
  it('names every page of every network with a fixed, identity-free sentence', () => {
    for (const network of NETWORKS) {
      for (const kind of KINDS) {
        const note = explorerPageNote(kind, network);
        assert.match(note, /^The user is on /, `${network.label}/${kind}`);
        assert.ok(note.includes("Alice's Explorer"), `${network.label}/${kind} names the surface`);
        assert.deepEqual(findRawIdentifiersInText(note), [], `${network.label}/${kind} carries no identifier`);
        assert.ok(!note.includes('—'), 'no em-dash in Alice copy');
      }
    }
  });

  it('tells the off-chain pages apart by what they read and draw', () => {
    assert.match(explorerPageNote('vtxo', { kind: 'spark', label: 'Spark' }), /Spark leaf page .* exit tree .* timelocks/);
    assert.match(explorerPageNote('address', { kind: 'spark', label: 'Spark' }), /Spark address page .* leaves .* token lines/);
    assert.match(explorerPageNote('tx', { kind: 'spark', label: 'Spark' }), /Spark transfer page/);
    assert.match(explorerPageNote('vtxo', { kind: 'arkade', label: 'Arkade' }), /Arkade VTXO page .* commitment transaction/);
    assert.match(explorerPageNote('address', { kind: 'bark', label: 'Bark' }), /Bark address page .* cannot be listed/);
    assert.match(explorerPageNote('tx', { kind: 'bark', label: 'Bark' }), /Bitcoin transaction page .* Bark round/);
  });

  it('names a Bitcoin-like network by the selector label', () => {
    assert.equal(explorerPageNote('tx', { kind: 'bitcoin', label: 'Mutinynet' }), "The user is on a Mutinynet transaction page of Alice's Explorer.");
    assert.equal(explorerPageNote('block', { kind: 'spark', label: 'Spark' }), "The user is on a Spark block page of Alice's Explorer.");
    assert.match(explorerPageNote('overview', { kind: 'liquid', label: 'Liquid' }), /Liquid home page .* latest blocks/);
    assert.match(explorerPageNote('xpub', { kind: 'bitcoin', label: 'Bitcoin' }), /extended public key/);
  });
});

describe('askContextLabel', () => {
  it('keeps the last five characters of a subject, a block height in full', () => {
    assert.equal(askContextLabel('tx', 'a'.repeat(59) + 'b9cc1', 'bitcoin'), 'Transaction ...b9cc1');
    assert.equal(askContextLabel('address', 'bc1qexampleaddress', 'bitcoin'), 'Address ...dress');
    assert.equal(askContextLabel('block', '900000', 'bitcoin'), 'Block 900000');
    assert.equal(askContextLabel('overview', undefined, 'bitcoin'), 'This page');
    assert.equal(askContextLabel('xpub', 'xpub6...', 'bitcoin'), 'This page');
  });

  it('names the off-chain coins and a Spark transfer by their network', () => {
    assert.equal(askContextLabel('vtxo', 'x', 'arkade'), 'An Arkade VTXO');
    assert.equal(askContextLabel('vtxo', 'x', 'bark'), 'A Bark VTXO');
    assert.equal(askContextLabel('vtxo', '01a117a8-cb94-7a3e-9c1d-0123456789ab', 'spark'), 'A Spark leaf');
    assert.equal(askContextLabel('tx', '019a2b3c-4d5e-7f60-8a9b-fedcba987654', 'spark'), 'Spark transfer ...87654');
    // A 64-hex id on Spark is a token transaction or a Bitcoin one.
    assert.equal(askContextLabel('tx', 'f'.repeat(64), 'spark'), 'Transaction ...fffff');
  });
});
