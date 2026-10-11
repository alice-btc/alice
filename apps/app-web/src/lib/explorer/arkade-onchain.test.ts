import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HISTORY_FIRST, SEED_SETTLEMENT_TXIDS, SettlementRegistry, settlementRegistry, followableOutputs,
  loadOlderSettlements, updateSettlements, walkSettlementsBackward, walkSettlementsForward,
  type ChainReader, type KVStorage,
} from './arkade-onchain.ts';
import type { NormalizedOutspend, NormalizedTransaction } from './types.ts';

// Distinct 64-hex txids for the fake chain, one letter each.
const id = (c: string) => c.repeat(64);

function fakeStorage(): KVStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, v); },
    removeItem: k => { data.delete(k); },
  };
}

function fakeTx(txid: string, opts: { height?: number; prev?: string; coinbase?: boolean } = {}): NormalizedTransaction {
  return {
    txid,
    version: 2,
    locktime: 0,
    sizeBytes: 200,
    weight: 800,
    vsize: 200,
    feeSats: 100,
    feeRateSatVb: 1,
    status: opts.height !== undefined
      ? { confirmed: true, blockHeight: opts.height, blockTime: 1_786_000_000 + opts.height }
      : { confirmed: false },
    inputs: [{
      prevTxid: opts.prev ?? id('0'),
      prevVout: 2,
      sequence: 0xffffffff,
      isCoinbase: opts.coinbase === true,
    }],
    outputs: [
      { index: 0, valueSats: 40_000 },
      { index: 1, valueSats: 990 },
      { index: 2, valueSats: 1_000_000 },
    ],
    isCoinbase: opts.coinbase === true,
    rbfSignaled: false,
    source: { name: 'test', baseUrl: 'https://x/api' },
  };
}

/** A fake chain: txs by id, and each tx's outspends (spender per vout). */
function fakeChain(
  txs: Record<string, NormalizedTransaction>,
  spends: Record<string, (string | null)[]>,
): ChainReader & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async getTransaction(txid) {
      calls.push(`tx:${txid.slice(0, 4)}`);
      const t = txs[txid];
      if (!t) throw new Error('unknown tx');
      return t;
    },
    async getOutspends(txid): Promise<NormalizedOutspend[]> {
      calls.push(`out:${txid.slice(0, 4)}`);
      return (spends[txid] ?? []).map(s => (s ? { spent: true, txid: s, vin: 0 } : { spent: false }));
    },
  };
}

describe('SettlementRegistry', () => {
  it('adds, enriches and never downgrades a settlement', () => {
    const reg = new SettlementRegistry(fakeStorage());
    reg.add({ txid: id('a') });
    assert.equal(reg.get(id('a'))?.height, undefined);
    reg.add({ txid: id('a'), height: 900_000, timestamp: 123 });
    assert.equal(reg.get(id('a'))?.height, 900_000);
    // A later add without a height keeps the known one.
    reg.add({ txid: id('a') });
    assert.equal(reg.get(id('a'))?.height, 900_000);
    assert.equal(reg.get(id('a'))?.timestamp, 123);
  });

  it('exposes confirmed heights only', () => {
    const reg = new SettlementRegistry(fakeStorage());
    reg.add({ txid: id('a'), height: 1 });
    reg.add({ txid: id('b') });
    assert.deepEqual([...reg.heights()], [1]);
  });

  it('persists across instances through the same storage', () => {
    const storage = fakeStorage();
    const first = new SettlementRegistry(storage);
    first.add({ txid: id('a'), height: 5, timestamp: 9 });
    const second = new SettlementRegistry(storage);
    assert.deepEqual(second.get(id('a')), { txid: id('a'), height: 5, timestamp: 9 });
  });

  it('notifies subscribers on change, not on no-ops', () => {
    const reg = new SettlementRegistry(fakeStorage());
    let notified = 0;
    reg.subscribe(() => { notified++; });
    reg.add({ txid: id('a'), height: 1 });
    reg.add({ txid: id('a'), height: 1 }); // identical: no notification
    assert.equal(notified, 1);
  });

  it('starts empty on a corrupt cache', () => {
    const storage = fakeStorage();
    storage.setItem('alice_arkade_settlements_v1', '{not json');
    const reg = new SettlementRegistry(storage);
    assert.deepEqual(reg.all(), []);
  });

  it('rejects malformed txids from storage', () => {
    const storage = fakeStorage();
    storage.setItem('alice_arkade_settlements_v1', JSON.stringify([
      { txid: 'nope' }, { txid: id('a'), height: 2 },
    ]));
    const reg = new SettlementRegistry(storage);
    assert.equal(reg.all().length, 1);
    assert.equal(reg.get(id('a'))?.height, 2);
  });
});

describe('followableOutputs', () => {
  it('keeps the largest outputs above the floor, connectors left out', () => {
    assert.deepEqual(followableOutputs(fakeTx(id('a'))), [
      { txid: id('a'), vout: 2, valueSats: 1_000_000 },
      { txid: id('a'), vout: 0, valueSats: 40_000 },
    ]);
  });
});

describe('walkSettlementsForward', () => {
  it('follows the wallet to the tip, crossing a consolidation between two commitments', async () => {
    // a (commitment): its batch output swept by e, its change consolidated by
    // w, which funds b; b's change funds c, the tip.
    const chain = fakeChain(
      {
        [id('a')]: fakeTx(id('a'), { height: 100 }),
        [id('e')]: fakeTx(id('e'), { height: 101, prev: id('a') }),
        [id('w')]: fakeTx(id('w'), { height: 103, prev: id('a') }),
        [id('b')]: fakeTx(id('b'), { height: 106, prev: id('w') }),
        [id('c')]: fakeTx(id('c'), { height: 112, prev: id('b') }),
      },
      {
        [id('a')]: [id('e'), null, id('w')],
        [id('w')]: [null, null, id('b')],
        [id('b')]: [null, null, id('c')],
      },
    );
    const commitments = new Set([id('a'), id('b'), id('c')]);
    const probed: string[] = [];
    const res = await walkSettlementsForward(chain, async t => { probed.push(t); return commitments.has(t); }, followableOutputs(fakeTx(id('a'))));
    assert.deepEqual(res.found, [id('b'), id('c')]);
    assert.equal(res.interrupted, false);
    // The sweep and the consolidation were asked about, rejected, and still crossed.
    assert.ok(probed.includes(id('e')) && probed.includes(id('w')));
    assert.equal(settlementRegistry.get(id('b'))?.height, 106);
    assert.equal(settlementRegistry.get(id('c'))?.height, 112);
    // The frontier holds the unspent outputs reached, the tip's among them.
    assert.ok(res.frontier.some(o => o.txid === id('c') && o.vout === 2));
    assert.ok(res.frontier.some(o => o.txid === id('e')));
  });

  it('stops at maxHops and keeps the unexplored output for the next pass', async () => {
    const chain = fakeChain(
      { [id('a')]: fakeTx(id('a'), { height: 1 }), [id('b')]: fakeTx(id('b'), { height: 2 }), [id('c')]: fakeTx(id('c'), { height: 3 }) },
      { [id('a')]: [null, null, id('b')], [id('b')]: [null, null, id('c')], [id('c')]: [] },
    );
    const res = await walkSettlementsForward(chain, async () => true, followableOutputs(fakeTx(id('a'))), { maxHops: 1 });
    assert.deepEqual(res.found, [id('b')]);
    assert.ok(res.frontier.some(o => o.txid === id('b') && o.vout === 2));
  });

  it('reports an interrupted walk on a failing lookup', async () => {
    const chain: ChainReader = {
      async getTransaction() { throw new Error('down'); },
      async getOutspends() { return [{ spent: false }, { spent: false }, { spent: true, txid: id('b'), vin: 0 }]; },
    };
    const start = followableOutputs(fakeTx(id('a')));
    const res = await walkSettlementsForward(chain, async () => true, start);
    assert.deepEqual(res, { found: [], frontier: start, interrupted: true, exhausted: false });
  });
});

describe('walkSettlementsBackward', () => {
  it('pages history through the wallet transactions between commitments, to the wallet origin', async () => {
    // g <- f (commitments) <- v (a consolidation) <- d (the wallet's coinbase origin).
    const chain = fakeChain(
      {
        [id('g')]: fakeTx(id('g'), { height: 20, prev: id('f') }),
        [id('f')]: fakeTx(id('f'), { height: 10, prev: id('v') }),
        [id('v')]: fakeTx(id('v'), { height: 5, prev: id('d') }),
        [id('d')]: fakeTx(id('d'), { height: 1, coinbase: true }),
      },
      {},
    );
    const commitments = new Set([id('f'), id('g')]);
    settlementRegistry.add({ txid: id('g'), height: 20 });
    const res = await walkSettlementsBackward(chain, async t => commitments.has(t), id('g'));
    assert.deepEqual(res, { found: [id('f')], interrupted: false, origin: true });
    assert.equal(settlementRegistry.get(id('f'))?.height, 10);
    // Each settlement learnt its predecessor: g's is f, f's is the origin.
    assert.equal(settlementRegistry.get(id('g'))?.prev, id('f'));
    assert.equal(settlementRegistry.get(id('f'))?.prev, null);
    assert.deepEqual(settlementRegistry.run(id('g')).map(s => s.txid), [id('g'), id('f')]);
    assert.deepEqual(settlementRegistry.runEnd(id('g')), { txid: id('f'), origin: true });
  });

  it('gives up after too many wallet transactions in a row', async () => {
    const chain = fakeChain(
      {
        [id('p')]: fakeTx(id('p'), { height: 30, prev: id('q') }),
        [id('q')]: fakeTx(id('q'), { height: 29, prev: id('r') }),
        [id('r')]: fakeTx(id('r'), { height: 28, prev: id('s') }),
      },
      {},
    );
    const res = await walkSettlementsBackward(chain, async () => false, id('p'), { maxWalletHops: 1 });
    assert.deepEqual(res, { found: [], interrupted: false, origin: false });
    assert.deepEqual(chain.calls, [`tx:${id('p').slice(0, 4)}`, `tx:${id('q').slice(0, 4)}`]);
  });

  it('stops at a settlement already known', async () => {
    settlementRegistry.add({ txid: id('k'), height: 40 });
    const chain = fakeChain({ [id('m')]: fakeTx(id('m'), { height: 41, prev: id('k') }) }, {});
    const res = await walkSettlementsBackward(chain, async () => true, id('m'));
    assert.deepEqual(res, { found: [], interrupted: false, origin: false });
    assert.equal(chain.calls.length, 1);
    // The stop still links the two: m's history is complete down to k.
    assert.equal(settlementRegistry.get(id('m'))?.prev, undefined, 'm is not in the registry, nothing to link');
    settlementRegistry.add({ txid: id('m'), height: 41 });
    await walkSettlementsBackward(chain, async () => true, id('m'));
    assert.equal(settlementRegistry.get(id('m'))?.prev, id('k'));
  });

  it('stops at a coinbase input', async () => {
    const chain = fakeChain({ [id('h')]: fakeTx(id('h'), { height: 5, coinbase: true }) }, {});
    const res = await walkSettlementsBackward(chain, async () => true, id('h'));
    assert.deepEqual(res, { found: [], interrupted: false, origin: true });
  });
});

describe('updateSettlements', () => {
  it('keeps watching the tip of a sleeping funding line after a newer settlement appears', async () => {
    // 1: the tip of an older line, in the stored frontier; 2: a newer
    // settlement on another line. Then 1's change is spent by 3, a
    // commitment: the pass must find it although 2 is newer. Hex-digit ids:
    // the stored frontier keeps only real-looking txids.
    const storage = fakeStorage();
    storage.setItem('alice_arkade_frontier_v1', JSON.stringify({ base: id('0'), outpoints: [{ txid: id('1'), vout: 2, valueSats: 1_000_000 }] }));
    settlementRegistry.add({ txid: id('1'), height: 4000 });
    settlementRegistry.add({ txid: id('2'), height: 5000 });
    const chain = fakeChain(
      {
        [id('2')]: fakeTx(id('2'), { height: 5000 }),
        [id('1')]: fakeTx(id('1'), { height: 4000 }),
        [id('3')]: fakeTx(id('3'), { height: 5100, prev: id('1') }),
      },
      { [id('1')]: [null, null, id('3')] },
    );
    const commitments = new Set([id('2'), id('1'), id('3')]);
    const pass = await updateSettlements(chain, 'https://asp.test', { storage, probe: async t => commitments.has(t), historyDepth: 0, anchor: async () => null });
    assert.equal(settlementRegistry.get(id('3'))?.height, 5100);
    assert.equal(pass.atTip, true);
    const saved = JSON.parse(storage.data.get('alice_arkade_frontier_v1')!) as { base: string; outpoints: Array<{ txid: string; vout: number }> };
    assert.equal(saved.base, id('3'));
    const keys = saved.outpoints.map(o => `${o.txid.slice(0, 1)}:${o.vout}`);
    assert.ok(keys.includes('2:2') && keys.includes('3:2'), `frontier keeps both lines: ${keys.join(' ')}`);
  });
});

describe('updateSettlements from the Worker anchor', () => {
  // A fresh browser against a chain of 14 commitments c1 (oldest) … c14
  // (newest), each funded by the previous one's change, c1 from a coinbase.
  // The Worker's anchor is c12; c13 and c14 landed since. Heights sit above
  // every other suite's: the registry is shared module-wide, and the pass
  // starts from the newest confirmed settlement it holds.
  // `tag` keeps one scenario's ids and heights apart from another's.
  function chainOf(n: number, tag: string) {
    const txs: Record<string, NormalizedTransaction> = {};
    const spends: Record<string, (string | null)[]> = {};
    const base = 900_000 + Number.parseInt(tag, 16) * 10_000;
    const name = (i: number) => (tag + tag + i.toString(16).padStart(2, '0')).repeat(16);
    for (let i = 1; i <= n; i++) {
      txs[name(i)] = fakeTx(name(i), { height: base + i, prev: i > 1 ? name(i - 1) : undefined, coinbase: i === 1 });
      spends[name(i)] = [null, null, i < n ? name(i + 1) : null];
    }
    return { chain: fakeChain(txs, spends), name, commitments: new Set(Object.keys(txs)) };
  }

  it('shows the anchor first, walks forward to the tip and fills the recent history under it', async () => {
    const { chain, name, commitments } = chainOf(14, 'a');
    const storage = fakeStorage();
    const anchor = { txid: name(12), height: 1_000_012, timestamp: 1_786_001_012 };
    const pass = await updateSettlements(chain, 'https://asp.test', {
      storage, probe: async t => commitments.has(t), anchor: async () => anchor,
    });
    assert.deepEqual(pass, { atTip: true, interrupted: false });
    // The tip: c13 and c14 found forward.
    assert.equal(settlementRegistry.get(name(14))?.height, 1_000_014);
    assert.equal(settlementRegistry.get(name(13))?.height, 1_000_013);
    // The run under the newest is HISTORY_FIRST deep: c14 down to c5.
    const run = settlementRegistry.run(name(14)).map(s => s.txid);
    assert.equal(run.length, HISTORY_FIRST);
    assert.equal(run[0], name(14));
    assert.equal(run[run.length - 1], name(5));
    assert.equal(settlementRegistry.has(name(4)), false, 'older history waits for a request');
    // The seeds were not needed.
    for (const seed of SEED_SETTLEMENT_TXIDS) assert.equal(settlementRegistry.has(seed), false);

    // A request for older history pages on from the end of the run, down to
    // the wallet's origin (c1, coinbase-funded): 4 more, then nothing.
    const older = await loadOlderSettlements(chain, 'https://asp.test', { probe: async t => commitments.has(t) });
    assert.deepEqual(older, { found: 4, origin: true, interrupted: false });
    assert.equal(settlementRegistry.get(name(1))?.prev, null);
    assert.deepEqual(settlementRegistry.runEnd(name(14)), { txid: name(1), origin: true });
  });

  it('reports a forward walk cut by its hop budget as not at the tip, so the caller chains another pass', async () => {
    const { chain, name, commitments } = chainOf(14, 'b');
    const storage = fakeStorage();
    // The newest known is this chain's c10: the walk forward from it needs
    // 4 hops to reach c14.
    settlementRegistry.add({ txid: name(10), height: 1_010_010 });
    const pass = await updateSettlements(chain, 'https://asp.test', {
      storage, probe: async t => commitments.has(t), anchor: async () => null, maxHops: 2, historyDepth: 0,
    });
    assert.deepEqual(pass, { atTip: false, interrupted: false });
    assert.equal(settlementRegistry.get(name(12))?.height, 1_010_012);
    assert.equal(settlementRegistry.has(name(13)), false);
    const again = await updateSettlements(chain, 'https://asp.test', {
      storage, probe: async t => commitments.has(t), anchor: async () => null, maxHops: 10, historyDepth: 0,
    });
    assert.deepEqual(again, { atTip: true, interrupted: false });
    assert.equal(settlementRegistry.get(name(14))?.height, 1_010_014);
  });
});
