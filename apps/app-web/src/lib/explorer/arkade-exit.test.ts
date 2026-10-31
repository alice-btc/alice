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

// The chain's expiresAt is one string scalar for two units: unix seconds from
// the SDK's cut-off (1 January 2025 = 1,735,689,600 s, vtxo.ts
// EXPIRY_MIN_PLAUSIBLE_MS) up, a block height below it. It is not the BIP65
// threshold (500,000,000): the SDK does not use it, and this view must read the
// same scalar as the address view and the SDK do. A height must stay a height:
// read as seconds it is a day in January 1970, and the page would call a live
// coin long expired.
describe('parseArkadeChain expiry', () => {
  type Expiry = { expiresAt?: number; expiresAtHeight?: number };
  const parseOne = (expiresAt: unknown): Expiry =>
    parseArkadeChain({ chain: [{ txid: LEAF, type: 'INDEXER_CHAINED_TX_TYPE_TREE', spends: [], ...(expiresAt === undefined ? {} : { expiresAt }) }] })[0] as unknown as Expiry;

  it('keeps a date as a date and a block height as a height, never both', () => {
    const date = parseOne('1789804221');
    assert.equal(date.expiresAt, 1_789_804_221);
    assert.equal(date.expiresAtHeight, undefined);

    const height = parseOne('850123');
    assert.equal(height.expiresAtHeight, 850_123);
    assert.equal(height.expiresAt, undefined, 'a height is not a date in January 1970');

    assert.equal(parseOne('1735689599').expiresAtHeight, 1_735_689_599);
    assert.equal(parseOne('1735689599').expiresAt, undefined);
    assert.equal(parseOne('1735689600').expiresAt, 1_735_689_600);
    assert.equal(parseOne('1735689600').expiresAtHeight, undefined);
    assert.equal(parseOne('600000000').expiresAtHeight, 600_000_000, 'above BIP65, below the SDK cut-off: a height');
  });

  it('reads a missing, zero or invalid expiry as unknown', () => {
    for (const raw of [undefined, null, '', '0', 0, '-5', 'later', 'NaN']) {
      const e = parseOne(raw);
      assert.equal(e.expiresAt, undefined, `date of ${String(raw)}`);
      assert.equal(e.expiresAtHeight, undefined, `height of ${String(raw)}`);
    }
  });

  it('keeps the other fields of a transaction whose expiry is a height', () => {
    const [tx] = parseArkadeChain({ chain: [{ txid: LEAF, expiresAt: '850123', type: 'INDEXER_CHAINED_TX_TYPE_TREE', spends: [COMMIT] }] });
    assert.equal(tx.txid, LEAF);
    assert.equal(tx.type, 'tree');
    assert.deepEqual(tx.spends, [COMMIT]);
  });
});

describe('buildArkadeExitPath expiry', () => {
  type StepExpiry = { expiresAt?: number; expiresAtHeight?: number };
  const stepOf = (c: ArkadeChainTx[], txid: string) => buildArkadeExitPath(c, txs, { txid: ARK, vout: 1 }).steps.find(s => s.txid === txid) as unknown as StepExpiry;

  it('carries a height-only expiry to the step without inventing a date', () => {
    const withHeight = chain.map(c => (c.txid === ARK ? { ...c, expiresAt: undefined, expiresAtHeight: 850_123 } : c)) as ArkadeChainTx[];
    const step = stepOf(withHeight, ARK);
    assert.equal(step.expiresAtHeight, 850_123);
    assert.equal(step.expiresAt, undefined);
  });

  it('carries a date-only expiry as a date, and keeps height and date apart on different steps', () => {
    const mixed = chain.map(c => {
      if (c.txid === ARK) return { ...c, expiresAt: 1_800_000_000 };
      if (c.txid === ROOT) return { ...c, expiresAtHeight: 850_123 };
      return c;
    }) as ArkadeChainTx[];
    const ark = stepOf(mixed, ARK);
    assert.equal(ark.expiresAt, 1_800_000_000);
    assert.equal(ark.expiresAtHeight, undefined);
    const root = stepOf(mixed, ROOT);
    assert.equal(root.expiresAtHeight, 850_123);
    assert.equal(root.expiresAt, undefined);
  });

  it('goes from the indexer reply to the step with the height intact', () => {
    const parsed = parseArkadeChain({ chain: [
      { txid: ARK, expiresAt: '850123', type: 'INDEXER_CHAINED_TX_TYPE_ARK', spends: [CHECK] },
      { txid: CHECK, expiresAt: '850123', type: 'INDEXER_CHAINED_TX_TYPE_CHECKPOINT', spends: [LEAF] },
      { txid: LEAF, expiresAt: '850123', type: 'INDEXER_CHAINED_TX_TYPE_TREE', spends: [ROOT] },
      { txid: ROOT, expiresAt: '850123', type: 'INDEXER_CHAINED_TX_TYPE_TREE', spends: [COMMIT] },
      { txid: COMMIT, expiresAt: '850123', type: 'INDEXER_CHAINED_TX_TYPE_COMMITMENT', spends: [] },
    ] });
    const path = buildArkadeExitPath(parsed, txs, { txid: ARK, vout: 1 });
    assert.equal(path.steps.length, 4);
    for (const s of path.steps as unknown as StepExpiry[]) {
      assert.equal(s.expiresAtHeight, 850_123);
      assert.equal(s.expiresAt, undefined);
    }
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
