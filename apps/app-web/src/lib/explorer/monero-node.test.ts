import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { absoluteOffsets, MonerodSource, normalizeMoneroNodeUrl, prunableBytes } from './monero-node.ts';
import { MoneroError } from './monero.ts';
import { P2POOL_BLOCK } from './monero.fixtures.ts';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

const K = (c: string) => c.repeat(64);
const TXID = K('a');
const COINBASE = K('c');
const BLOCK_HASH = K('b');

// A node of one block, 100, holding a coinbase and one transaction, as
// monerod writes them.
const TX_JSON = {
  version: 2, unlock_time: 0,
  vin: [{ key: { amount: 0, key_offsets: [10, 5, 1], k_image: K('1') } }],
  vout: [{ amount: 0, target: { tagged_key: { key: K('2'), view_tag: '9f' } } }, { amount: 0, target: { tagged_key: { key: K('3'), view_tag: '0a' } } }],
  extra: [1, ...new Array(32).fill(7)],
  rct_signatures: { type: 6, txnFee: 122880000, ecdhInfo: [{ amount: '44d891d3258d7383' }, { amount: 'b2b79589753cd8b6' }], outPk: [K('e'), K('f')] },
};
const COINBASE_JSON = {
  version: 2, unlock_time: 160,
  vin: [{ gen: { height: 100 } }],
  vout: [{ amount: 600000000000, target: { tagged_key: { key: K('4'), view_tag: '11' } } }],
  extra: Array.from(Buffer.from(P2POOL_BLOCK.extra, 'hex')),
  rct_signatures: { type: 0 },
};

function node(calls: string[] = []) {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const body = JSON.parse(String(init?.body ?? '{}'));
    calls.push(url.pathname + (body.method ? `:${body.method}` : ''));
    const reply = (b: unknown) => new Response(JSON.stringify(b), { status: 200, headers: { 'Content-Type': 'application/json' } });
    if (url.pathname === '/get_height') return reply({ height: 101, status: 'OK' });
    if (url.pathname === '/get_info') return reply({ height: 101, top_block_hash: BLOCK_HASH, difficulty: 786256983806, target: 120, tx_count: 65098016, tx_pool_size: 3, block_weight_median: 300000, block_size_limit: 600000, alt_blocks_count: 0, status: 'OK' });
    if (url.pathname === '/get_transaction_pool_hashes') return reply({ tx_hashes: [K('d')], status: 'OK' });
    if (url.pathname === '/get_outs') {
      const outs = (body.outputs as { index: number }[]).map(o => ({ height: o.index, txid: K('5'), key: K('6') }));
      return reply({ outs, status: 'OK' });
    }
    if (url.pathname === '/get_transactions') {
      const prune = body.prune === true;
      const hexOf = (bytes: number, prunedBytes: number) => (prune ? { as_hex: '', pruned_as_hex: 'ab'.repeat(prunedBytes) } : { as_hex: 'ab'.repeat(bytes) });
      const txs = (body.txs_hashes as string[]).flatMap(h => {
        if (h === TXID) return [{ tx_hash: TXID, ...hexOf(1536, 288), as_json: JSON.stringify(TX_JSON), block_height: 100, block_timestamp: 1793218056, confirmations: 1, in_pool: false }];
        if (h === COINBASE) return [{ tx_hash: COINBASE, ...hexOf(1694, 1694), as_json: JSON.stringify(COINBASE_JSON), block_height: 100, block_timestamp: 1793218056, confirmations: 1, in_pool: false }];
        if (h === K('d')) return [{ tx_hash: K('d'), ...hexOf(2000, 752), as_json: JSON.stringify(TX_JSON), in_pool: true }];
        return [];
      });
      return reply({ txs, status: 'OK', missed_tx: (body.txs_hashes as string[]).filter(h => ![TXID, COINBASE, K('d')].includes(h)) });
    }
    if (url.pathname === '/json_rpc') {
      const header = { height: 100, hash: BLOCK_HASH, timestamp: 1793218056, block_size: 299519, num_txes: 1, reward: 625663500000, miner_tx_hash: COINBASE };
      switch (body.method) {
        case 'hard_fork_info': return reply({ result: { version: 16 } });
        case 'get_fee_estimate': return reply({ result: { fee: 20000, fees: [20000, 80000, 320000, 4000000] } });
        case 'get_block_headers_range': return reply({ result: { headers: [header] } });
        case 'get_block_header_by_hash':
          return body.params.hash === BLOCK_HASH ? reply({ result: { block_header: header } }) : reply({ error: { code: -5, message: "Internal error: can't get block by hash. Hash = " + body.params.hash + '.' } });
        case 'get_block':
          if (body.params.height === 100 || body.params.hash === BLOCK_HASH) {
            return reply({ result: { block_header: header, miner_tx_hash: COINBASE, tx_hashes: [TXID], json: JSON.stringify({ miner_tx: COINBASE_JSON, tx_hashes: [TXID] }) } });
          }
          return reply({ error: { code: -2, message: 'Requested block height: 5 greater than current top block height: 100' } });
      }
    }
    return new Response('not found', { status: 404 });
  }) as typeof fetch;
  return new MonerodSource('http://node.test:18089');
}

describe('a Monero node, through its restricted RPC', () => {
  it('cleans the address as typed', () => {
    assert.equal(normalizeMoneroNodeUrl(' umbrel.local:18089/ '), 'http://umbrel.local:18089');
    assert.equal(normalizeMoneroNodeUrl('https://node.example.com'), 'https://node.example.com');
    assert.equal(normalizeMoneroNodeUrl(''), '');
    assert.deepEqual(absoluteOffsets([10, 5, 1]), [10, 15, 16]);
  });

  it('estimates what a pruned transaction is missing from its shape', () => {
    // A 1-in 2-out CLSAG + Bulletproofs+ transaction weighs 1,536 bytes
    // whole on the chain and about 290 pruned.
    assert.equal(prunableBytes(6, 1, 16, 2), 1248);
    assert.equal(prunableBytes(5, 2, 11, 2), 2 * (32 * 13 + 32) + 32 * 23);
    assert.equal(prunableBytes(0, 1, 16, 2), 0);
  });

  it('reads the network state from get_info, the fork and the fee estimate', async () => {
    const info = await node().getNetworkInfo();
    assert.equal(info.height, 100);
    assert.equal(info.hardForkVersion, 16);
    assert.equal(info.feePerByte, 20000);
    assert.equal(info.mempoolCount, 3);
    assert.equal(info.mempoolBytes, undefined);
    assert.equal(Math.round(info.hashrate), Math.round(786256983806 / 120));
  });

  it('reads a block with its transactions, the coinbase first, and names P2Pool by its coinbase', async () => {
    const calls: string[] = [];
    const b = await node(calls).getBlock('100');
    assert.equal(b.hash, BLOCK_HASH);
    assert.equal(b.txCount, 2);
    assert.equal(b.txs[0].coinbase, true);
    assert.equal(b.txs[0].size, 1694);
    assert.equal(b.txs[1].fee, BigInt(122880000));
    assert.equal(b.txs[1].ringSize, 3);
    // Read pruned: 288 bytes plus the estimated signatures of 1 input of 3
    // and 2 outputs.
    assert.equal(b.txs[1].size, 288 + prunableBytes(6, 1, 3, 2));
    assert.equal(b.fees, BigInt(122880000));
    assert.equal(b.poolName, 'P2Pool');
    assert.equal(b.currentHeight, 100);
    // A block read once keeps its transactions: reading it again by its hash
    // asks the node for the block, not for its transactions.
    const again: string[] = [];
    const source = node(again);
    await source.getBlock('100');
    const before = again.length;
    await source.getBlock(BLOCK_HASH);
    assert.deepEqual(again.slice(before), ['/json_rpc:get_block']);
  });

  it('pages the ribbon from the headers and the blocks behind them', async () => {
    const page = await node().getBlocksPage(0, 10);
    assert.equal(page.currentHeight, 101);
    assert.equal(page.blocks.length, 1);
    assert.equal(page.blocks[0].txs.length, 2);
  });

  it('reads the mempool as hashes then transactions', async () => {
    const pool = await node().getMempool(100);
    assert.equal(pool.length, 1);
    assert.equal(pool[0].txid, K('d'));
    assert.equal(pool[0].size, 752 + prunableBytes(6, 1, 3, 2));
    // The next poll reads nothing it already holds.
    const calls: string[] = [];
    const n = node(calls);
    await n.getMempool(100);
    const before = calls.length;
    await n.getMempool(100);
    assert.deepEqual(calls.slice(before), ['/get_transaction_pool_hashes']);
  });

  it('reads a transaction and resolves its ring through get_outs', async () => {
    const calls: string[] = [];
    const tx = await node(calls).getTx(TXID);
    assert.equal(tx.blockHeight, 100);
    assert.equal(tx.confirmations, 1);
    assert.equal(tx.fee, BigInt(122880000));
    assert.equal(tx.size, 1536);
    assert.equal(tx.extra.txPublicKey, '07'.repeat(32));
    assert.deepEqual(tx.inputs[0].ring.map(m => m.height), [10, 15, 16]);
    assert.equal(tx.outputs[1].encryptedAmount, 'b2b79589753cd8b6');
    assert.ok(calls.includes('/get_outs'));
  });

  it('says not found for a transaction or a block the node has not got', async () => {
    await assert.rejects(node().getTx(K('9')), (e: unknown) => e instanceof MoneroError && e.code === 'not-found');
    await assert.rejects(node().getBlock('5'), (e: unknown) => e instanceof MoneroError && e.code === 'not-found');
    assert.equal(await node().resolveHash(BLOCK_HASH), 'block');
    assert.equal(await node().resolveHash(TXID), 'tx');
    assert.equal(await node().resolveHash(K('9')), null);
  });

  it('explains a node a browser cannot reach', async () => {
    globalThis.fetch = (async () => { throw new TypeError('Failed to fetch'); }) as typeof fetch;
    await assert.rejects(new MonerodSource('http://node.test').getNetworkInfo(), (e: unknown) => e instanceof MoneroError && e.code === 'network' && /rpc-access-control-origins/.test(e.message));
  });
});
