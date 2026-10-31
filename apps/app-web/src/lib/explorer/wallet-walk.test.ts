import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ChainReader } from './arkade-onchain.ts';
import type { NormalizedOutspend, NormalizedTransaction } from './types.ts';
import { largestOutputs, walkWalletForward, type Outpoint, type WalletWalk } from './wallet-walk.ts';

// Distinct 64-hex txids for the fake chain, one letter each.
const id = (c: string) => c.repeat(64);

// A spend graph: each transaction's output values, and the spender of each
// output (null while unspent). `settlement` marks what the probe recognises.
type Spec = { outputs: number[]; spenders: Array<string | null>; settlement?: boolean };

function fakeChain(graph: Record<string, Spec>): ChainReader & { outspends: string[] } {
  const outspends: string[] = [];
  return {
    outspends,
    async getTransaction(txid) {
      const spec = graph[txid];
      if (!spec) throw new Error(`unknown tx ${txid}`);
      return {
        txid,
        inputs: [{ prevTxid: id('0'), prevVout: 0, sequence: 0, isCoinbase: false }],
        outputs: spec.outputs.map((valueSats, index) => ({ index, valueSats })),
        status: { confirmed: true, blockHeight: 100, blockTime: 1_791_000_000 },
      } as unknown as NormalizedTransaction;
    },
    async getOutspends(txid) {
      const spec = graph[txid];
      if (!spec) throw new Error(`unknown tx ${txid}`);
      outspends.push(txid);
      return spec.spenders.map((s): NormalizedOutspend => (s ? { spent: true, txid: s, vin: 0 } : { spent: false }));
    },
  };
}

function fakeWalk(graph: Record<string, Spec>): WalletWalk & { probed: string[] } {
  const probed: string[] = [];
  return {
    probed,
    probe: async txid => { probed.push(txid); return graph[txid]?.settlement === true; },
    follow: tx => largestOutputs(tx, 10_000, 3),
    record: () => {},
  };
}

describe('walkWalletForward', () => {
  it('counts the spenders that are not settlements, lets a path go after two, and starts over at a settlement', async () => {
    // S's change is spent by W1, W1's by W2, W2's by W3 (none settlements):
    // W3 is asked about, its outputs never followed. W2's other output funds
    // the settlement T, whose change is plain again.
    const S = id('1'); const W1 = id('2'); const W2 = id('3'); const W3 = id('4'); const T = id('5'); const Z = id('6');
    const graph: Record<string, Spec> = {
      [S]: { outputs: [330, 1_000_000], spenders: [null, W1], settlement: true },
      [W1]: { outputs: [700_000, 600_000], spenders: [W2, null] },
      [W2]: { outputs: [650_000, 500_000], spenders: [W3, T] },
      [W3]: { outputs: [640_000], spenders: [Z] },
      [T]: { outputs: [450_000], spenders: [null], settlement: true },
    };
    const chain = fakeChain(graph);
    const walk = fakeWalk(graph);
    const res = await walkWalletForward(chain, walk, [{ txid: S, vout: 1, valueSats: 1_000_000 }]);
    assert.deepEqual(res.found, [T]);
    assert.ok(walk.probed.includes(W3));
    assert.ok(!chain.outspends.includes(W3), 'W3 is three spenders away from a settlement: not followed');
    assert.deepEqual(res.frontier, [
      { txid: W1, vout: 1, valueSats: 600_000, drift: 1 },
      { txid: T, vout: 0, valueSats: 450_000 },
    ]);
  });

  it('puts the outputs reached through a detour first, so the cap forgets them before the settlements\' own', async () => {
    const A = id('a'); const B = id('b'); const C = id('c'); const D = id('d');
    const graph: Record<string, Spec> = {
      [A]: { outputs: [100_000], spenders: [null] },
      [B]: { outputs: [100_000], spenders: [null] },
      [C]: { outputs: [100_000], spenders: [null] },
      [D]: { outputs: [100_000], spenders: [null] },
    };
    const start: Outpoint[] = [
      { txid: A, vout: 0, valueSats: 100_000 },
      { txid: B, vout: 0, valueSats: 100_000, drift: 1 },
      { txid: C, vout: 0, valueSats: 100_000, drift: 2 },
      { txid: D, vout: 0, valueSats: 100_000 },
    ];
    const all = await walkWalletForward(fakeChain(graph), fakeWalk(graph), start);
    assert.deepEqual(all.frontier.map(o => o.txid[0]), ['b', 'c', 'a', 'd']);
    const capped = await walkWalletForward(fakeChain(graph), fakeWalk(graph), start, { maxFrontier: 3 });
    assert.deepEqual(capped.frontier.map(o => o.txid[0]), ['c', 'a', 'd']);
  });

  it('keeps each output once, pass after pass, when the newest settlement\'s change is spent by a transaction that is not one', async () => {
    // N's change is spent by Y, not a settlement, whose change is unspent; K
    // is another line's output reached through a detour. Each pass starts as
    // updateSettlements builds it: the stored frontier, then N's change,
    // which it no longer holds. Before, Y was explored again and its change
    // added once more per pass, until K left the cap.
    const N = id('7'); const Y = id('8'); const K = id('9');
    const graph: Record<string, Spec> = {
      [N]: { outputs: [330, 3_000_000], spenders: [null, Y], settlement: true },
      [Y]: { outputs: [2_900_000], spenders: [null] },
      [K]: { outputs: [1_500_000], spenders: [null] },
    };
    const own: Outpoint = { txid: N, vout: 1, valueSats: 3_000_000 };
    let frontier: Outpoint[] = [{ txid: K, vout: 0, valueSats: 1_500_000, drift: 1 }];
    for (let pass = 0; pass < 30; pass++) {
      const walk = fakeWalk(graph);
      const res = await walkWalletForward(fakeChain(graph), walk, [...frontier, own], { maxFrontier: 24 });
      frontier = res.frontier;
      // Y is asked about on the first pass only: after that its outputs are
      // in the frontier, and reaching it again costs nothing.
      assert.deepEqual(walk.probed, pass === 0 ? [Y] : [], `pass ${pass + 1}`);
      assert.deepEqual(frontier, [
        { txid: K, vout: 0, valueSats: 1_500_000, drift: 1 },
        { txid: Y, vout: 0, valueSats: 2_900_000, drift: 1 },
      ], `pass ${pass + 1}`);
    }
  });

  it('keeps no frontier with a cap of 0', async () => {
    const A = id('a');
    const graph: Record<string, Spec> = { [A]: { outputs: [100_000], spenders: [null] } };
    const res = await walkWalletForward(fakeChain(graph), fakeWalk(graph), [{ txid: A, vout: 0, valueSats: 100_000 }], { maxFrontier: 0 });
    assert.deepEqual(res.frontier, []);
  });

  it('keeps the lowest drift of an output reached twice, exploring its spender again for it', async () => {
    // Y's change is stored at drift 2 (reached through a longer detour), and
    // this pass reaches it again straight from the settlement N.
    const N = id('7'); const Y = id('8');
    const graph: Record<string, Spec> = {
      [N]: { outputs: [330, 3_000_000], spenders: [null, Y], settlement: true },
      [Y]: { outputs: [2_900_000], spenders: [null] },
    };
    const walk = fakeWalk(graph);
    const res = await walkWalletForward(fakeChain(graph), walk, [
      { txid: Y, vout: 0, valueSats: 2_900_000, drift: 2 },
      { txid: N, vout: 1, valueSats: 3_000_000 },
    ]);
    assert.deepEqual(walk.probed, [Y]);
    assert.deepEqual(res.frontier, [{ txid: Y, vout: 0, valueSats: 2_900_000, drift: 1 }]);
  });
});
