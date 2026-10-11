import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SettlementRegistry, type ChainReader } from './arkade-onchain.ts';
import {
  SEED_BARK_ROUND_TXID, barkRoundRegistry, followableOutputs, loadFrontier, loadOlderBarkRounds, saveFrontier, updateBarkRounds,
  walkBarkRoundsBackward, walkBarkRoundsForward, type Outpoint,
} from './bark-onchain.ts';
import type { NormalizedOutspend, NormalizedTransaction } from './types.ts';

// A spend graph shaped like Second's real mainnet wallet (October 2026): a
// round R1 whose change funds a payout P, whose outputs feed another payout Q
// and a consolidation C, which the next round R2 spends. Users' outputs (the
// small ones) are spent by user transactions the walker must never fetch.
const id = (c: string) => c.repeat(64);
const R1 = id('1'); const P = id('2'); const Q = id('3'); const C = id('4'); const R2 = id('5'); const U = id('6');
// A round just broadcast, still in the mempool: no height yet.
const PENDING = id('7');

// `prev` is what each transaction's first input spends: the funding order the
// backward walk follows (R2 <- C <- P <- R1 <- the wallet's coinbase origin).
type Spec = { height: number; outputs: number[]; spenders: Array<string | null>; prev?: string; coinbase?: boolean };
const GRAPH: Record<string, Spec> = {
  [R1]: { height: 970455, outputs: [713, 146_466], spenders: [null, P], coinbase: true },
  [P]: { height: 970486, outputs: [2_744_044, 9_900, 1_477_561], spenders: [C, U, Q], prev: R1 },
  [Q]: { height: 970486, outputs: [1_011_939, 6_930, 458_478], spenders: [C, null, C], prev: P },
  [C]: { height: 970488, outputs: [19_000_000], spenders: [R2], prev: P },
  [R2]: { height: 970700, outputs: [50_000, 18_900_000], spenders: [null, null], prev: C },
  [U]: { height: 970490, outputs: [9_000], spenders: [null], prev: P },
  [PENDING]: { height: 0, outputs: [1_000, 300_000], spenders: [null, null], prev: C },
  // The code's seed, standing in for R1 here: a chain that knows it.
  [SEED_BARK_ROUND_TXID]: { height: 970455, outputs: [713, 146_466], spenders: [null, P], coinbase: true },
};
const ROUNDS = new Set([R1, R2, PENDING, SEED_BARK_ROUND_TXID]);

function fakeChain(): ChainReader & { fetched: string[] } {
  const fetched: string[] = [];
  return {
    fetched,
    async getTransaction(txid) {
      const spec = GRAPH[txid];
      if (!spec) throw new Error(`unknown tx ${txid}`);
      fetched.push(txid);
      return {
        txid,
        inputs: [{ prevTxid: spec.prev ?? '0'.repeat(64), prevVout: 0, sequence: 0, isCoinbase: spec.coinbase === true }],
        outputs: spec.outputs.map((valueSats, index) => ({ index, valueSats })),
        status: spec.height > 0 ? { confirmed: true, blockHeight: spec.height, blockTime: 1_791_000_000 + spec.height } : { confirmed: false },
      } as unknown as NormalizedTransaction;
    },
    async getOutspends(txid) {
      const spec = GRAPH[txid];
      if (!spec) throw new Error(`unknown tx ${txid}`);
      return spec.spenders.map((s): NormalizedOutspend => (s ? { spent: true, txid: s, vin: 0 } : { spent: false }));
    },
  };
}

const probe = async (txid: string) => ROUNDS.has(txid);
const r1Outputs: Outpoint[] = [{ txid: R1, vout: 1, valueSats: 146_466 }];

describe('walkBarkRoundsForward', () => {
  it('finds the next round through the payouts and the consolidation, never entering a user wallet', async () => {
    const chain = fakeChain();
    const result = await walkBarkRoundsForward(chain, probe, r1Outputs);
    assert.deepEqual(result.found, [R2]);
    assert.equal(result.interrupted, false);
    // The frontier is R2's change: unspent, above the floor, not the root.
    assert.deepEqual(result.frontier, [{ txid: R2, vout: 1, valueSats: 18_900_000 }]);
    assert.ok(!chain.fetched.includes(U), 'the user payout was not followed');
    // The consolidation is explored once although three outputs lead to it.
    assert.equal(chain.fetched.filter(t => t === C).length, 1);
    assert.equal(barkRoundRegistry.get(R2)?.height, 970700);
  });

  it('stops at the hop budget and resumes from where it stopped', async () => {
    const chain = fakeChain();
    const first = await walkBarkRoundsForward(chain, probe, r1Outputs, { maxHops: 1 });
    assert.deepEqual(first.found, []);
    // P was explored; its two large outputs are spent but wait for the budget.
    assert.deepEqual(first.frontier.map(o => `${o.txid.slice(0, 1)}:${o.vout}`), ['2:0', '2:2']);
    const second = await walkBarkRoundsForward(chain, probe, first.frontier);
    assert.deepEqual(second.found, [R2]);
  });

  it('keeps the start untouched when a lookup fails', async () => {
    const chain = fakeChain();
    chain.getTransaction = async () => { throw new Error('rate limited'); };
    const result = await walkBarkRoundsForward(chain, probe, r1Outputs);
    assert.equal(result.interrupted, true);
    assert.deepEqual(result.frontier, r1Outputs);
  });
});

describe('walkBarkRoundsBackward', () => {
  it('finds the previous round through the consolidation and the payout, then the wallet origin', async () => {
    const chain = fakeChain();
    const reg = barkRoundRegistry;
    reg.add({ txid: R2, height: 970700 });
    const res = await walkBarkRoundsBackward(chain, probe, R2);
    assert.deepEqual(res, { found: [R1], interrupted: false, origin: true });
    assert.equal(reg.get(R1)?.height, 970455);
    assert.equal(reg.get(R2)?.prev, R1);
    assert.equal(reg.get(R1)?.prev, null);
    assert.deepEqual(reg.runEnd(R2), { txid: R1, origin: true });
  });
});

function memoryStorage() {
  const store = new Map<string, string>();
  return { store, getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); }, removeItem: (k: string) => { store.delete(k); } };
}

describe('updateBarkRounds', () => {
  it('starts from the server\'s last round, shows it first, then fills the day under it', async () => {
    const chain = fakeChain();
    const storage = memoryStorage();
    // A fresh browser: nothing stored. The server answers R2 as its last
    // finished round; the pass records it, walks forward (nothing newer) and
    // backward for the history under it, down to the wallet's origin.
    const pass = await updateBarkRounds(chain, 'https://bark.test', { storage, probe, lastRound: async () => R2, anchor: async () => null });
    assert.deepEqual(pass, { atTip: true, interrupted: false });
    assert.equal(barkRoundRegistry.get(R2)?.height, 970700);
    assert.equal(barkRoundRegistry.get(R1)?.height, 970455);
    // The seed was not needed: the registry holds what the server and the
    // walk gave, nothing from the code.
    assert.ok(!barkRoundRegistry.has('b111410f794a760681547ff3ae3c80c6ebfaed71dc3bdad95c704d6ef7f6fb9f'));
    // The frontier resumes from R2's change.
    assert.equal(JSON.parse(storage.store.get('alice_bark_frontier_v2')!).base, R2);
  });

  it('reports a pass cut short by a failing provider as not at the tip', async () => {
    const chain = fakeChain();
    chain.getTransaction = async () => { throw new Error('down'); };
    const pass = await updateBarkRounds(chain, 'https://bark.test', { storage: memoryStorage(), probe, lastRound: async () => null, anchor: async () => null });
    assert.deepEqual(pass, { atTip: false, interrupted: true });
  });

  it('serves an older page on request and says when the origin is reached', async () => {
    const chain = fakeChain();
    const res = await loadOlderBarkRounds(chain, 'https://bark.test', { probe });
    // Everything older was found by the first pass already: the run under
    // the newest ends at the wallet's origin, nothing more to fetch.
    assert.deepEqual(res, { found: 0, origin: true, interrupted: false });
  });

  it('falls back to the seed when the only round known is still in the mempool', async () => {
    const chain = fakeChain();
    const storage = memoryStorage();
    // A first visit: the shared registry emptied. The server's last round is
    // PENDING, unconfirmed; the Worker has no anchor: nothing confirmed to
    // walk from until the seed is brought in. Last in this suite, since the
    // earlier scenarios build on one another.
    barkRoundRegistry.clear();
    const pass = await updateBarkRounds(chain, 'https://bark.test', { storage, probe, lastRound: async () => PENDING, anchor: async () => null });
    assert.equal(pass.interrupted, false);
    assert.equal(barkRoundRegistry.get(PENDING)?.height, undefined, 'the pending round stays height-less');
    assert.ok(barkRoundRegistry.has(SEED_BARK_ROUND_TXID), 'the seed was brought in');
    assert.equal(barkRoundRegistry.get(SEED_BARK_ROUND_TXID)?.height, 970455);
    // And the walk went on from it: the seed's line leads to R2.
    assert.equal(barkRoundRegistry.get(R2)?.height, 970700);
  });

});

describe('followableOutputs', () => {
  it('keeps the largest outputs above the floor, three at most, the round root among them', () => {
    const tx = {
      txid: R2,
      outputs: [150_000, 300_000, 99_999, 500_000, 400_000, 200_000].map((valueSats, index) => ({ index, valueSats })),
    } as unknown as NormalizedTransaction;
    // The root (output 0 here) is followed like the change: the server
    // sweeps an expired tree and funds later rounds from the sweep.
    assert.deepEqual(followableOutputs(tx, true).map(o => o.vout), [3, 4, 1]);
    const same = followableOutputs({ ...tx, outputs: [{ index: 0, valueSats: 5_000_000 }, { index: 1, valueSats: 50_000 }] } as unknown as NormalizedTransaction, false);
    assert.deepEqual(same.map(o => o.vout), [0]);
  });
});

describe('frontier storage and registry keys', () => {
  it('round-trips the frontier and ignores a corrupt one', () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); }, removeItem: (k: string) => { store.delete(k); } };
    saveFrontier(storage, { base: R2, outpoints: [{ txid: R2, vout: 1, valueSats: 18_900_000 }] });
    assert.deepEqual(loadFrontier(storage), { base: R2, outpoints: [{ txid: R2, vout: 1, valueSats: 18_900_000 }] });
    storage.setItem('alice_bark_frontier_v2', '{"base":1}');
    assert.equal(loadFrontier(storage), null);
  });

  it('keeps the Bark rounds apart from the Arkade settlements in storage', () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); }, removeItem: (k: string) => { store.delete(k); } };
    const arkade = new SettlementRegistry(storage);
    const bark = new SettlementRegistry(storage, 'alice_bark_rounds_v3');
    arkade.add({ txid: R1, height: 1 });
    bark.add({ txid: R2, height: 2 });
    assert.deepEqual([...store.keys()].sort(), ['alice_arkade_settlements_v1', 'alice_bark_rounds_v3']);
    assert.equal(new SettlementRegistry(storage, 'alice_bark_rounds_v3').has(R1), false);
    assert.equal(new SettlementRegistry(storage, 'alice_bark_rounds_v3').has(R2), true);
  });
});
