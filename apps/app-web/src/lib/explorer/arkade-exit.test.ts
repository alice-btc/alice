import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { arkadeSpends, buildArkadeExitPath, parseArkadeChain, type ArkadeChainTx } from './arkade-exit.ts';
import type { ArkadeVirtualTx } from './arkade.ts';

const id = (c: string) => c.repeat(64);
const COMMIT = id('a'); const ROOT = id('b'); const LEAF = id('c'); const CHECK = id('d'); const ARK = id('e');

const vtx = (txid: string, inputs: Array<[string, number, number?]>, outputs: number[]): ArkadeVirtualTx => ({
  txid,
  inputs: inputs.map(([t, v, a]) => ({ txid: t, vout: v, amountSats: a })),
  // Every virtual transaction carries the zero-value P2A anchor, left out of the path.
  outputs: [...outputs.map((amountSats, index) => ({ index, amountSats, scriptHex: '5120aa', isAnchor: false })), { index: outputs.length, amountSats: 0, scriptHex: '51024e73', isAnchor: true }],
});

// A batch of two users: the root splits 100,000 into 60,000 (ours) and
// 40,000; our leaf passes 60,000 on; then one spend out of the batch, a
// checkpoint followed by the Ark transaction paying 45,000 away and keeping
// 15,000, the coin.
const chain: ArkadeChainTx[] = [
  { txid: ARK, type: 'ark', spends: [CHECK], expiresAt: 1_800_000_000 },
  { txid: CHECK, type: 'checkpoint', spends: [LEAF] },
  { txid: LEAF, type: 'tree', spends: [ROOT] },
  { txid: ROOT, type: 'tree', spends: [COMMIT] },
  { txid: COMMIT, type: 'commitment', spends: [] },
];
const txs = new Map<string, ArkadeVirtualTx>([
  [ROOT, vtx(ROOT, [[COMMIT, 0, 100_000]], [60_000, 40_000])],
  [LEAF, vtx(LEAF, [[ROOT, 0]], [60_000])],
  [CHECK, vtx(CHECK, [[LEAF, 0]], [60_000])],
  [ARK, vtx(ARK, [[CHECK, 0]], [45_000, 15_000])],
]);

describe('buildArkadeExitPath', () => {
  it('orders the chain anchor first and follows the branch by the outputs each child spends', () => {
    const path = buildArkadeExitPath(chain, txs, { txid: ARK, vout: 1 });
    assert.equal(path.commitmentTxid, COMMIT);
    assert.equal(path.batchVout, 0);
    assert.equal(path.anchorSats, 100_000);
    assert.deepEqual(path.steps.map(s => [s.type, s.ourIndex, s.branchSats, s.outputs.length]), [
      ['tree', 0, 60_000, 2],
      ['tree', 0, 60_000, 1],
      ['checkpoint', 0, 60_000, 1],
      ['ark', 1, 15_000, 2],
    ]);
    assert.deepEqual(path.steps[0].outputs, [{ amountSats: 60_000, ours: true }, { amountSats: 40_000, ours: false }]);
    assert.equal(path.steps[3].expiresAt, 1_800_000_000);
  });

  it('pairs a checkpoint with the Ark transaction spending it', () => {
    const path = buildArkadeExitPath(chain, txs, { txid: ARK, vout: 1 });
    assert.deepEqual(arkadeSpends(path), [{ from: 2, to: 3, whole: false }]);
  });

  it('refuses a chain without a commitment or a missing transaction', () => {
    assert.throws(() => buildArkadeExitPath(chain.slice(0, 4), txs, { txid: ARK, vout: 1 }), /commitment/);
    const partial = new Map(txs); partial.delete(LEAF);
    assert.throws(() => buildArkadeExitPath(chain, partial, { txid: ARK, vout: 1 }), /did not serve/);
  });
});

describe('parseArkadeChain', () => {
  it('reads the indexer reply, typing each transaction', () => {
    const parsed = parseArkadeChain({ chain: [
      { txid: LEAF, expiresAt: '1789804221', type: 'INDEXER_CHAINED_TX_TYPE_TREE', spends: [COMMIT] },
      { txid: COMMIT, expiresAt: '1789804221', type: 'INDEXER_CHAINED_TX_TYPE_COMMITMENT', spends: [] },
      { txid: 'nope', type: 'INDEXER_CHAINED_TX_TYPE_ARK', spends: [] },
    ] });
    assert.deepEqual(parsed, [
      { txid: LEAF, type: 'tree', expiresAt: 1789804221, spends: [COMMIT] },
      { txid: COMMIT, type: 'commitment', expiresAt: 1789804221, spends: [] },
    ]);
    assert.throws(() => parseArkadeChain({}), /without a chain/);
  });
});
