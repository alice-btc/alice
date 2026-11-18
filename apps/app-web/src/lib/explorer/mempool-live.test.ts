import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyProjectedBlockMessage, byFeeRate, projectedBlockDescription, projectedBlockSocketUrl, readMinedBlock, readProjectedBlocks, summarizeProjectedBlock, watchMempoolQueue, watchProjectedBlock } from './mempool-live.ts';

const txid = (n: number) => n.toString(16).padStart(64, '0');
const entry = (n: number, rate: number, vsize = 140) => [txid(n), Math.round(rate * vsize), vsize, 50_000, rate, 0, 1_794_930_000];
const full = (index: number, entries: unknown[]) => ({ 'projected-block-transactions': { index, sequence: 1, blockTransactions: entries } });
const delta = (index: number, change: Record<string, unknown>) => ({ 'projected-block-transactions': { index, sequence: 2, delta: change } });

describe('projectedBlockSocketUrl', () => {
  it('derives the socket of a mempool instance from its API address', () => {
    assert.equal(projectedBlockSocketUrl('https://mempool.space/api'), 'wss://mempool.space/api/v1/ws');
    assert.equal(projectedBlockSocketUrl('https://mempool.space/testnet4/api/'), 'wss://mempool.space/testnet4/api/v1/ws');
    assert.equal(projectedBlockSocketUrl('http://umbrel.local:3006/api'), 'ws://umbrel.local:3006/api/v1/ws');
  });

  it('refuses what is not a web address', () => {
    assert.equal(projectedBlockSocketUrl('not a url'), null);
    assert.equal(projectedBlockSocketUrl('file:///etc/hosts'), null);
  });
});

describe('applyProjectedBlockMessage', () => {
  it('reads the full list of a tracked block', () => {
    const block = applyProjectedBlockMessage(null, full(0, [entry(1, 12), entry(2, 30)]), 0);
    assert.deepEqual(byFeeRate(block!), [
      { txid: txid(2), vsize: 140, rate: 30, valueSats: 50_000, feeSats: 4_200 },
      { txid: txid(1), vsize: 140, rate: 12, valueSats: 50_000, feeSats: 1_680 },
    ]);
  });

  it('applies a delta: removed, added, then a changed fee rate', () => {
    const start = applyProjectedBlockMessage(null, full(0, [entry(1, 12), entry(2, 30), entry(3, 8)]), 0);
    const next = applyProjectedBlockMessage(start, delta(0, {
      removed: [txid(3)],
      added: [entry(4, 50)],
      changed: [[txid(1), 20, 0]],
    }), 0);
    assert.deepEqual(byFeeRate(next!).map(tx => [tx.txid, tx.rate]), [[txid(4), 50], [txid(2), 30], [txid(1), 20]]);
    assert.equal(start!.size, 3, 'the previous state is left as it was');
  });

  it('ignores another block, a delta without a list, and other messages', () => {
    const start = applyProjectedBlockMessage(null, full(0, [entry(1, 12)]), 0);
    assert.equal(applyProjectedBlockMessage(start, full(1, [entry(2, 30)]), 0), start);
    assert.equal(applyProjectedBlockMessage(null, delta(0, { added: [entry(2, 30)] }), 0), null);
    assert.equal(applyProjectedBlockMessage(start, { 'mempool-blocks': [] }, 0), start);
    assert.equal(applyProjectedBlockMessage(start, 'pong', 0), start);
  });

  it('drops entries that are not transactions', () => {
    const block = applyProjectedBlockMessage(null, full(0, [
      entry(1, 12),
      ['not-a-txid', 10, 140, 1, 1],
      [txid(2), 'NaN', 140, 1, 1],
      [txid(3), 10, 0, 1, 1],
      null,
    ]), 0);
    assert.deepEqual([...block!.keys()], [txid(1)]);
  });
});

describe('projectedBlockDescription', () => {
  it('gives Alice the totals of the block and says it is not mined', () => {
    const text = projectedBlockDescription({ txCount: 3477, medianFee: 4.6, feeRange: [2.1, 3, 5, 120.4], totalFees: 1_500_000, blockVSize: 997_950.5 }, 0);
    assert.match(text, /^Projected block 1 of the mempool queue \(the next block expected\)\. It is not mined/);
    assert.match(text, /3477 transactions, median fee rate 4\.6 sat\/vB, fee rates from 2\.1 to 120 sat\/vB, total fees 1500000 sats, virtual size 997951 vB\./);
    assert.match(projectedBlockDescription({ txCount: 7968, medianFee: 0.12, feeRange: [0.1, 0.14], totalFees: 120_000, blockVSize: 997_000 }, 1), /median fee rate 0\.12 sat\/vB, fee rates from 0\.1 to 0\.14 sat\/vB/);
    assert.doesNotMatch(projectedBlockDescription({ txCount: 1, medianFee: 1, feeRange: [], totalFees: 1, blockVSize: 100 }, 2), /next block|fee rates from/);
  });
});

describe('summarizeProjectedBlock', () => {
  it('counts the totals from the list, the median at half the block space', () => {
    const block = applyProjectedBlockMessage(null, full(0, [entry(1, 50, 100), entry(2, 20, 100), entry(3, 2, 1_000), entry(4, 0.12, 300)]), 0);
    assert.deepEqual(summarizeProjectedBlock(byFeeRate(block!)), {
      txCount: 4,
      medianFee: 2,
      feeRange: [0.12, 50],
      totalFees: 5_000 + 2_000 + 2_000 + 36,
      blockVSize: 1_500,
    });
  });

  it('has nothing to count on an empty list', () => {
    assert.equal(summarizeProjectedBlock([]), null);
  });
});

const queued = (nTx: number, medianFee = 3) => ({ blockSize: 1_500_000, blockVSize: 997_000, nTx, totalFees: 2_000_000, medianFee, feeRange: [1, 2, 40] });

describe('readProjectedBlocks', () => {
  it('reads the queue of a message', () => {
    assert.deepEqual(readProjectedBlocks({ 'mempool-blocks': [queued(2871), queued(1503, 1.01)] }), [
      { txCount: 2871, medianFee: 3, feeRange: [1, 2, 40], totalFees: 2_000_000, blockVSize: 997_000 },
      { txCount: 1503, medianFee: 1.01, feeRange: [1, 2, 40], totalFees: 2_000_000, blockVSize: 997_000 },
    ]);
  });

  it('has nothing to read elsewhere, and drops a queue with an unreadable block', () => {
    assert.equal(readProjectedBlocks({ block: {} }), null);
    assert.equal(readProjectedBlocks('pong'), null);
    assert.equal(readProjectedBlocks({ 'mempool-blocks': [queued(2871), { nTx: 'many' }] }), null);
  });
});

describe('readMinedBlock', () => {
  const mined = { id: txid(9), height: 924_117, timestamp: 1_794_930_000, tx_count: 3210, size: 1_600_000, weight: 3_990_000, extras: { medianFee: 2.4, feeRange: [1, 3, 80], totalFees: 3_100_000, pool: { name: 'Ocean' } } };

  it('reads the block a message announces', () => {
    assert.deepEqual(readMinedBlock({ block: mined, 'mempool-blocks': [] }), {
      id: txid(9), height: 924_117, timestamp: 1_794_930_000, txCount: 3210, size: 1_600_000, weight: 3_990_000,
      medianFee: 2.4, feeRange: [1, 3, 80], totalFees: 3_100_000, poolName: 'Ocean',
    });
  });

  it('refuses what is not a block', () => {
    assert.equal(readMinedBlock({ 'mempool-blocks': [] }), null);
    assert.equal(readMinedBlock({ block: { ...mined, id: 'nope' } }), null);
    assert.equal(readMinedBlock({ block: { ...mined, height: 1.5 } }), null);
    assert.equal(readMinedBlock({ block: { ...mined, extras: undefined } })?.medianFee, undefined);
  });
});

// A stand-in for the browser's WebSocket: records what is sent, and lets a
// test play the server.
class FakeSocket {
  static opened: FakeSocket[] = [];
  readyState = 0;
  sent: unknown[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  url: string;
  constructor(url: string) { this.url = url; FakeSocket.opened.push(this); }
  send(data: string) { this.sent.push(JSON.parse(data)); }
  close() { this.readyState = 3; }
  open() { this.readyState = 1; this.onopen?.(); }
  serve(message: unknown) { this.onmessage?.({ data: JSON.stringify(message) }); }
}

describe('the shared feed of an instance', () => {
  const withSockets = (run: () => void) => {
    const real = globalThis.WebSocket;
    FakeSocket.opened = [];
    (globalThis as { WebSocket: unknown }).WebSocket = FakeSocket;
    try { run(); } finally { (globalThis as { WebSocket: unknown }).WebSocket = real; }
  };

  it('gives the ribbon and the page the same message over one connection', () => withSockets(() => {
    const cards: number[][] = [];
    const lists: number[] = [];
    const states: string[] = [];
    const stopQueue = watchMempoolQueue('https://mempool.test/api', { onBlocks: blocks => cards.push(blocks.map(b => b.txCount)) });
    const stopBlock = watchProjectedBlock('https://mempool.test/api', 1, { onTransactions: txs => lists.push(txs.length), onStatus: s => states.push(s) });
    assert.equal(FakeSocket.opened.length, 1, 'one connection for both');
    const socket = FakeSocket.opened[0];
    assert.equal(socket.url, 'wss://mempool.test/api/v1/ws');
    socket.open();
    assert.deepEqual(socket.sent, [{ action: 'want', data: ['blocks', 'mempool-blocks'] }, { 'track-mempool-block': 1 }]);

    socket.serve({ 'mempool-blocks': [queued(2871), queued(2)], ...full(1, [entry(1, 12), entry(2, 30)]) });
    assert.deepEqual(cards, [[2871, 2]]);
    assert.deepEqual(lists, [2], 'the page lists what the card counts');
    assert.equal(states.at(-1), 'live');

    stopBlock();
    assert.deepEqual(socket.sent.at(-1), { 'track-mempool-block': -1 }, 'the page left: its block is no longer followed');
    assert.notEqual(socket.readyState, 3, 'the ribbon still reads the feed');
    stopQueue();
    assert.equal(socket.readyState, 3, 'the last reader closes the connection');
  }));

  it('passes on a mined block, and hands a late reader the queue already known', () => withSockets(() => {
    const mined: number[] = [];
    const stop = watchMempoolQueue('https://mempool.test/api', { onBlocks: () => {}, onMined: block => mined.push(block.height) });
    const socket = FakeSocket.opened[0];
    socket.open();
    socket.serve({ 'mempool-blocks': [queued(900)], block: { id: txid(7), height: 924_118, timestamp: 1_794_930_600, tx_count: 2871, size: 1, weight: 4 } });
    assert.deepEqual(mined, [924_118]);
    const late: number[][] = [];
    const stopLate = watchMempoolQueue('https://mempool.test/api', { onBlocks: blocks => late.push(blocks.map(b => b.txCount)) });
    assert.deepEqual(late, [[900]]);
    assert.equal(FakeSocket.opened.length, 1);
    stopLate();
    stop();
  }));

  it('gives up a connection that never opens, and tries again', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    withSockets(() => {
      const states: string[] = [];
      const stop = watchProjectedBlock('https://mempool.test/api', 0, { onTransactions: () => {}, onStatus: s => states.push(s) });
      assert.equal(FakeSocket.opened.length, 1);
      t.mock.timers.tick(10_000);
      assert.equal(FakeSocket.opened[0].readyState, 3, 'the silent connection is closed');
      assert.equal(states.at(-1), 'reconnecting');
      t.mock.timers.tick(2_000);
      assert.equal(FakeSocket.opened.length, 2, 'a second connection is tried');
      // Three more silences use up the quick retries.
      for (const wait of [10_000, 5_000, 10_000, 15_000, 10_000]) t.mock.timers.tick(wait);
      assert.equal(states.at(-1), 'unavailable');
      stop();
    });
  });

  it('reports no feed where there is no address to open', () => {
    const states: string[] = [];
    watchMempoolQueue('not a url', { onBlocks: () => {}, onStatus: s => states.push(s) })();
    assert.deepEqual(states, ['unavailable']);
  });
});
