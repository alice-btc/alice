import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { formatPicoRate, MONERO_SCALE, normalizeMoneroBlock, projectMoneroMempool, scoreMoneroEstimate } from './monero-ribbon.ts';
import {
  coinbaseTemplate, getMoneroPoolBlocks, getMoneroPoolLists, MONERO_POOL_APIS, poolFromCoinbase, poolListFailureLabel, resetMoneroPoolCache,
  summarizeMoneroMiners,
} from './monero-pools.ts';
import { BITCOIN_SCALE } from './blocks.ts';
import { P2POOL_BLOCK } from './monero.fixtures.ts';
import type { MoneroTxSummary } from './monero.ts';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; resetMoneroPoolCache(); });

const K = (c: string) => c.repeat(64);

function tx(txid: string, fee: number, size: number, coinbase = false): MoneroTxSummary {
  return { txid, coinbase, fee: BigInt(fee), size, rctType: coinbase ? 0 : 6, version: 2, ringSize: coinbase ? 0 : 16, clearOutputs: BigInt(0) };
}

describe('the Monero scale', () => {
  it('writes fees per byte in piconero, compactly', () => {
    assert.equal(formatPicoRate(20000), '20k pico/B');
    assert.equal(formatPicoRate(812), '812 pico/B');
    assert.equal(formatPicoRate(4_000_000), '4.0M pico/B');
    assert.equal(MONERO_SCALE.range([20000, 30000, 80000]), '20k - 80k pico/B');
    assert.equal(MONERO_SCALE.range([20000, 20400]), '20k pico/B');
  });

  it('colours the minimum fee as the cheapest tier, as Bitcoin colours 1 sat/vB', () => {
    assert.equal(MONERO_SCALE.color(20000), BITCOIN_SCALE.color(1));
    assert.notEqual(MONERO_SCALE.color(20000 * 1000), MONERO_SCALE.color(20000));
    assert.equal(MONERO_SCALE.color(undefined), 'var(--alice-muted)');
  });
});

describe('normalizeMoneroBlock', () => {
  const block = {
    height: 10, hash: K('1'), timestamp: 100, size: 5000, txCount: 3, reward: BigInt(600_000_000_000), fees: BigInt(90_000_000),
    txs: [tx(K('a'), 0, 100, true), tx(K('b'), 30_000_000, 1500), tx(K('c'), 60_000_000, 1500)],
  };

  it('reads the median fee and the spread from the transactions, not the coinbase', () => {
    const n = normalizeMoneroBlock(block, new Map());
    assert.equal(n.medianFee, 40000);
    assert.equal(n.feeRange![0], 20000);
    assert.equal(n.feeRange![n.feeRange!.length - 1], 40000);
    assert.equal(n.poolName, undefined);
  });

  it('names the pool that published the block, by its hash', () => {
    assert.equal(normalizeMoneroBlock(block, new Map([[K('1'), 'HashVault']])).poolName, 'HashVault');
  });
});

describe('projectMoneroMempool', () => {
  it('sorts by fee per byte and packs full blocks, next to mine first', () => {
    const txs = [
      tx(K('1'), 20_000 * 150_000, 150_000),
      tx(K('2'), 100_000 * 150_000, 150_000),
      tx(K('3'), 40_000 * 150_000, 150_000),
    ];
    const blocks = projectMoneroMempool(txs, 300_000);
    assert.deepEqual(blocks.map(b => b.txCount), [2, 1]);
    assert.equal(blocks[0].feeRange[0], 40_000);
    assert.equal(blocks[1].medianFee, 20_000);
  });

  it('projects nothing from an empty mempool', () => {
    assert.deepEqual(projectMoneroMempool([]), []);
  });
});

describe('who mined a block', () => {
  it('recognises a P2Pool coinbase by its shape', () => {
    assert.equal(poolFromCoinbase(P2POOL_BLOCK.extra, 1694), 'P2Pool');
    // The same extra on a small coinbase (one output) is not P2Pool's.
    assert.equal(poolFromCoinbase(P2POOL_BLOCK.extra, 140), null);
    assert.equal(poolFromCoinbase(`01${K('2')}020812345678abcdef01`, 97), null);
    assert.equal(poolFromCoinbase(undefined, 2000), null);
  });

  it('collects the hashes every pool publishes, and skips a pool that fails', async () => {
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      let body: unknown = [];
      if (url.includes('hashvault')) body = [{ height: 1, hash: K('a') }];
      else if (url.includes('nanopool')) body = { status: true, data: [{ block_number: 2, hash: K('b') }] };
      else if (url.includes('herominers')) body = { pool: { blocks: [`${K('c')}:1:2:3`, '3'] } };
      else if (url.includes('supportxmr')) return new Response('down', { status: 503 });
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
    const byHash = await getMoneroPoolBlocks();
    assert.equal(byHash.get(K('a')), 'HashVault');
    assert.equal(byHash.get(K('b')), 'Nanopool');
    assert.equal(byHash.get(K('c')), 'HeroMiners');
    assert.equal(byHash.size, 3);
  });

  it('reads every pool from an https address', () => {
    for (const p of MONERO_POOL_APIS) assert.ok(p.url(10).startsWith('https://'), p.name);
  });
});

describe('the health of the pool lists', () => {
  it('says which list did not answer, or answered without a block', async () => {
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('hashvault')) return new Response(JSON.stringify([{ height: 1, hash: K('a') }]), { status: 200 });
      if (url.includes('nanopool')) return new Response(JSON.stringify({ moved: true }), { status: 200 });
      // An extension or a DNS filter: the request fails before any answer.
      if (url.includes('supportxmr')) throw new TypeError('Failed to fetch');
      return new Response('down', { status: 503 });
    }) as typeof fetch;
    const { lists } = await getMoneroPoolLists();
    assert.deepEqual(lists.find(l => l.name === 'HashVault'), { name: 'HashVault', ok: true, blocks: 1 });
    assert.deepEqual(lists.find(l => l.name === 'Nanopool'), { name: 'Nanopool', ok: false, blocks: 0, failure: 'format' });
    assert.deepEqual(lists.find(l => l.name === 'SupportXMR'), { name: 'SupportXMR', ok: false, blocks: 0, failure: 'blocked' });
    assert.deepEqual(lists.find(l => l.name === 'C3Pool'), { name: 'C3Pool', ok: false, blocks: 0, failure: 'http', status: 503 });
    assert.match(poolListFailureLabel(lists.find(l => l.name === 'SupportXMR')!), /extension/);
    assert.equal(lists.filter(l => l.ok).length, 1);
    assert.equal(lists.length, MONERO_POOL_APIS.length);
  });
});

describe('grouping the unnamed blocks', () => {
  // The layouts of coinbase extras seen in late October 2026, with placeholder values.
  const NANOPOOL_LIKE = `01${K('1')}0211${'ab'.repeat(17)}`;
  const UNKNOWN_8 = `01${K('2')}0208${'cd'.repeat(8)}`;
  const MERGE_MINED = `0321${'00'.repeat(33)}01${K('3')}0211${'ef'.repeat(17)}`;

  it('describes a coinbase by its layout, never its values', () => {
    assert.equal(coinbaseTemplate(P2POOL_BLOCK.extra), 'key nonce4 mm33');
    assert.equal(coinbaseTemplate(UNKNOWN_8), 'key nonce8');
    assert.equal(coinbaseTemplate(MERGE_MINED), 'mm33 key nonce17');
    assert.equal(coinbaseTemplate(`01${K('4')}0208${'00'.repeat(8)}`), coinbaseTemplate(UNKNOWN_8));
    assert.equal(coinbaseTemplate('zz'), null);
    assert.equal(coinbaseTemplate(undefined), null);
  });

  it('names the pools, then letters the unnamed layouts shared by two blocks or more', () => {
    const blocks = [
      { hash: K('a'), coinbaseExtra: NANOPOOL_LIKE },
      { hash: K('b'), coinbaseExtra: UNKNOWN_8 },
      { hash: K('c'), coinbaseExtra: UNKNOWN_8 },
      { hash: K('d'), coinbaseExtra: UNKNOWN_8 },
      { hash: K('e'), coinbaseExtra: NANOPOOL_LIKE },
      { hash: K('f'), coinbaseExtra: NANOPOOL_LIKE },
      { hash: K('9'), coinbaseExtra: MERGE_MINED },
      { hash: K('8'), poolName: 'P2Pool', coinbaseExtra: P2POOL_BLOCK.extra },
    ];
    const s = summarizeMoneroMiners(blocks, new Map([[K('a'), 'Nanopool']]));
    assert.deepEqual(s.named, [{ name: 'Nanopool', blocks: 1 }, { name: 'P2Pool', blocks: 1 }]);
    assert.deepEqual(s.unidentified, [
      { template: 'key nonce8', blocks: 3, sameLayoutAs: [] },
      { template: 'key nonce17', blocks: 2, sameLayoutAs: ['Nanopool'] },
    ]);
    assert.equal(s.other, 1);
    assert.equal(s.total, 8);
  });
});

describe('checking the estimate against the block', () => {
  it('scores the transactions both share, over the larger of the two', () => {
    assert.deepEqual(scoreMoneroEstimate(new Set(['a', 'b', 'c', 'd']), ['a', 'b', 'c']), { matched: 3, expected: 4, mined: 3, rate: 75, empty: false });
    assert.deepEqual(scoreMoneroEstimate(new Set(['a']), ['a', 'x', 'y', 'z']), { matched: 1, expected: 1, mined: 4, rate: 25, empty: false });
    assert.equal(scoreMoneroEstimate(new Set(), []), null);
    // A block its miner left empty is flagged, not a miss.
    assert.deepEqual(scoreMoneroEstimate(new Set(['a', 'b']), []), { matched: 0, expected: 2, mined: 0, rate: 0, empty: true });
    assert.equal(scoreMoneroEstimate(new Set(), ['a'])?.rate, 0);
  });

  it('labels the projected blocks as an estimate on Monero only', () => {
    assert.equal(MONERO_SCALE.estimatedProjection, true);
    assert.equal(BITCOIN_SCALE.estimatedProjection, undefined);
  });
});

describe('the ribbon source scores its estimate when a block lands', () => {
  function raw(t: MoneroTxSummary) {
    return { tx_hash: t.txid, coinbase: t.coinbase, tx_fee: Number(t.fee), tx_size: t.size, rct_type: t.rctType, tx_version: 2, mixin: t.ringSize, xmr_outputs: 0 };
  }

  it('compares the block with the estimate made just before it, even when the mempool was read after it landed', async () => {
    const a = tx(K('a'), 40_000 * 1500, 1500);
    const b = tx(K('b'), 30_000 * 1500, 1500);
    const c = tx(K('c'), 20_000 * 1500, 1500);
    const coinbase = tx(K('0'), 0, 100, true);
    let world: { height: number; blocks: unknown[]; mempool: MoneroTxSummary[] } = {
      height: 100,
      blocks: [{ height: 100, hash: K('9'), size: 100, timestamp: 1, txs: [raw(coinbase)] }],
      mempool: [a, b, c],
    };
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('xmrchain.net/api/transactions')) {
        return new Response(JSON.stringify({ status: 'success', data: { current_height: world.height + 1, blocks: world.blocks } }));
      }
      if (url.includes('xmrchain.net/api/mempool')) {
        return new Response(JSON.stringify({ status: 'success', data: { txs: world.mempool.map(raw) } }));
      }
      return new Response('[]');
    }) as typeof fetch;
    const { createMoneroRibbonSource, moneroEstimateFor } = await import('./monero-ribbon.ts');
    let clock = 1_000_000;
    const source = createMoneroRibbonSource({ now: () => clock });
    await source.getRecentBlocks();
    await source.getMempoolBlocks();
    clock += 20_000; // the next poll
    // Block 101 lands with a and b; the mempool keeps c.
    world = {
      height: 101,
      blocks: [{ height: 101, hash: K('8'), size: 3100, timestamp: 2, txs: [raw(coinbase), raw(a), raw(b)] }, ...world.blocks],
      mempool: [c],
    };
    await Promise.all([source.getMempoolBlocks(), source.getRecentBlocks()]);
    assert.deepEqual(moneroEstimateFor(101), { height: 101, matched: 2, expected: 3, mined: 2, rate: 67, empty: false });
  });
});

describe('a block that lands seconds after the previous one', () => {
  it('gets no score rather than one from a mempool read after it landed', async () => {
    const a = tx(K('a'), 40_000 * 1500, 1500);
    const coinbase = tx(K('0'), 0, 100, true);
    const raw = (t: MoneroTxSummary) => ({ tx_hash: t.txid, coinbase: t.coinbase, tx_fee: Number(t.fee), tx_size: t.size, rct_type: t.rctType, tx_version: 2, mixin: t.ringSize, xmr_outputs: 0 });
    let world = { height: 200, blocks: [{ height: 200, hash: K('7'), size: 100, timestamp: 1, txs: [raw(coinbase)] }] as unknown[], mempool: [a] };
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('xmrchain.net/api/transactions')) return new Response(JSON.stringify({ status: 'success', data: { current_height: world.height + 1, blocks: world.blocks } }));
      if (url.includes('xmrchain.net/api/mempool')) return new Response(JSON.stringify({ status: 'success', data: { txs: world.mempool.map(raw) } }));
      return new Response('[]');
    }) as typeof fetch;
    const { createMoneroRibbonSource, moneroEstimateFor } = await import('./monero-ribbon.ts');
    const clock = 2_000_000;
    const source = createMoneroRibbonSource({ now: () => clock });
    await source.getRecentBlocks();
    // Block 201 lands before any later poll: the only estimate for it is
    // read in the very poll that reveals it, from a mempool already emptied.
    world = { height: 201, blocks: [{ height: 201, hash: K('6'), size: 1600, timestamp: 2, txs: [raw(coinbase), raw(a)] }, ...world.blocks], mempool: [] };
    await Promise.all([source.getMempoolBlocks(), source.getRecentBlocks()]);
    assert.equal(moneroEstimateFor(201), undefined);
  });
});
