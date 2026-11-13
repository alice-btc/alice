import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  formatBlockAge, formatHashrate, formatXmr, getMoneroBlock, getMoneroNetworkInfo, getMoneroTx, MoneroError, resolveMoneroHash, toScanTx,
  type MoneroTx,
} from './monero.ts';
import { moneroSignals, sharedRingSources } from './monero-signals.ts';
import { moneroAddressContext, moneroBlockContext, moneroTxContext } from './layer-context.ts';
import { toAbstractSignal } from './audit-core.ts';
import { findRawIdentifiersInText } from './route.ts';
import { decodeMoneroAddress } from './monero-address.ts';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

/** Answers each path with the given body, as xmrchain.net wraps it. */
function serve(routes: Record<string, unknown>) {
  const asked: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    asked.push(url);
    const path = Object.keys(routes).find(p => url.endsWith(p));
    const body = path ? routes[path] : { status: 'fail', data: { title: 'Cant find tx hash' } };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return asked;
}

const TXID = '85f9a3b2b45828ce686206f081f026317c3e12deb3c38aee7d3a06b65cc5ea0f';
const K = (c: string) => c.repeat(64);
const ring = (from: number, txid = (n: number) => K((n % 10).toString())) =>
  Array.from({ length: 16 }, (_, i) => ({ block_no: from + i, public_key: K('a'), tx_hash: txid(i) }));

function txRoutes(over: { decoded?: Record<string, unknown>; raw?: Record<string, unknown> } = {}) {
  return {
    [`/transaction/${TXID}`]: {
      status: 'success',
      data: {
        block_height: 3794203, confirmations: 12, current_height: 3794215, coinbase: false, tx_size: 1536, tx_fee: 122880000,
        rct_type: 6, tx_version: 2, timestamp: 1793218056, tx_hash: TXID,
        inputs: [{ amount: 0, key_image: K('b'), mixins: ring(3700000) }],
        outputs: [{ amount: 0, public_key: K('c') }, { amount: 0, public_key: K('d') }],
        ...over.decoded,
      },
    },
    [`/rawtransaction/${TXID}`]: {
      status: 'success',
      data: {
        version: 2, unlock_time: 0,
        extra: [1, ...new Array(32).fill(7), 2, 9, 1, 1, 2, 3, 4, 5, 6, 7, 8],
        vout: [
          { amount: 0, target: { tagged_key: { key: K('c'), view_tag: '9f' } } },
          { amount: 0, target: { tagged_key: { key: K('d'), view_tag: '0a' } } },
        ],
        rct_signatures: { type: 6, txnFee: 122880000, ecdhInfo: [{ amount: '44d891d3258d7383' }, { amount: 'b2b79589753cd8b6' }], outPk: [K('e'), K('f')] },
        ...over.raw,
      },
    },
  };
}

describe('getMoneroTx', () => {
  it('joins the decoded and the raw views into one transaction', async () => {
    serve(txRoutes());
    const tx = await getMoneroTx(TXID);
    assert.equal(tx.blockHeight, 3794203);
    assert.equal(tx.fee, BigInt(122880000));
    assert.equal(tx.inputs.length, 1);
    assert.equal(tx.inputs[0].ring.length, 16);
    assert.equal(tx.inputs[0].ring[0].height, 3700000);
    assert.deepEqual(tx.outputs[1], { index: 1, key: K('d'), viewTag: '0a', clearAmount: BigInt(0), encryptedAmount: 'b2b79589753cd8b6', commitment: K('f') });
    assert.equal(tx.extra.txPublicKey, '07'.repeat(32));
    assert.equal(tx.extra.encryptedPaymentId, '0102030405060708');
    assert.equal(toScanTx(tx).outputs.length, 2);
  });

  it('reads a mempool transaction as unconfirmed', async () => {
    serve(txRoutes({ decoded: { block_height: 0, confirmations: 0 } }));
    const tx = await getMoneroTx(TXID);
    assert.equal(tx.blockHeight, null);
    assert.ok(moneroSignals(tx).some(s => s.id === 'UNCONFIRMED'));
  });

  it('says "not found" when the explorer does not know the id', async () => {
    serve({});
    await assert.rejects(getMoneroTx(TXID), (e: unknown) => e instanceof MoneroError && e.code === 'not-found');
  });

  it('refuses what is not a transaction id without asking', async () => {
    const asked = serve({});
    await assert.rejects(getMoneroTx('nope'), (e: unknown) => e instanceof MoneroError && e.code === 'not-found');
    assert.equal(asked.length, 0);
  });
});

describe('the other reads', () => {
  it('reads the network state', async () => {
    serve({
      '/networkinfo': {
        status: 'success',
        data: {
          height: 3794214, top_block_hash: K('0'), difficulty: '774180803267', hash_rate: 6451506693, current_hf_version: 16,
          block_size_median: 300000, block_size_limit: 600000, fee_estimate: 20000, tx_count: 65087021, tx_pool_size: 7,
          tx_pool_size_kbytes: 12430, alt_blocks_count: 244,
        },
      },
    });
    const n = await getMoneroNetworkInfo();
    // The node counts 3794214 blocks: the newest is 3794213.
    assert.equal(n.height, 3794213);
    assert.equal(n.difficulty, BigInt(774180803267));
    assert.equal(n.hardForkVersion, 16);
    assert.equal(n.mempoolCount, 7);
  });

  it('reads a block, its reward from the coinbase and its fees', async () => {
    serve({
      '/block/3794203': {
        status: 'success',
        data: {
          block_height: 3794203, current_height: 3794215, hash: K('1'), size: 299519, timestamp: 1793218056,
          txs: [
            { coinbase: true, tx_hash: K('2'), tx_fee: 0, tx_size: 1694, rct_type: 0, tx_version: 2, mixin: 0, xmr_outputs: 625663500000 },
            { coinbase: false, tx_hash: K('3'), tx_fee: 122880000, tx_size: 1536, rct_type: 6, tx_version: 2, mixin: 16, xmr_outputs: 0 },
          ],
        },
      },
    });
    const b = await getMoneroBlock('3794203');
    assert.equal(b.height, 3794203);
    assert.equal(b.reward, BigInt(625663500000));
    assert.equal(b.fees, BigInt(122880000));
    assert.equal(b.txs[1].ringSize, 16);
    assert.equal(b.coinbaseTxid, K('2'));
  });

  it('tells a block hash from a transaction id through the search', async () => {
    serve({ [`/search/${K('1')}`]: { status: 'success', data: { title: 'block', hash: K('1'), txs: [] } } });
    assert.equal(await resolveMoneroHash(K('1')), 'block');
    serve({ [`/search/${TXID}`]: { status: 'success', data: { tx_hash: TXID } } });
    assert.equal(await resolveMoneroHash(TXID), 'tx');
    serve({});
    assert.equal(await resolveMoneroHash(K('9')), null);
  });
});

function tx(over: Partial<MoneroTx> = {}): MoneroTx {
  return {
    txid: TXID, version: 2, rctType: 6, coinbase: false, fee: BigInt(1), size: 1500, unlockTime: 0,
    extra: { additionalPublicKeys: [], otherNonce: false, nonStandard: false, tags: [1, 2], txPublicKey: K('7'), encryptedPaymentId: '00'.repeat(8) },
    extraBytes: new Uint8Array(), blockHeight: 100, timestamp: 1793218056, confirmations: 10, currentHeight: 110,
    inputs: [{ keyImage: K('b'), ring: Array.from({ length: 16 }, (_, i) => ({ height: i, txid: K(i.toString(16)), key: K('a') })) }],
    outputs: [{ index: 0, key: K('c'), clearAmount: BigInt(0) }, { index: 1, key: K('d'), clearAmount: BigInt(0) }],
    ...over,
  };
}

describe('moneroSignals', () => {
  it('finds nothing unusual in a standard two-output payment beyond its dummy payment id', () => {
    assert.deepEqual(moneroSignals(tx()).map(s => s.id), ['PAYMENT_ID_DUMMY']);
  });

  it('flags the fingerprints: unlock time, extra field, payment id in clear', () => {
    const ids = moneroSignals(tx({
      unlockTime: 3800000,
      extra: { ...tx().extra, nonStandard: true, plainPaymentId: K('1') },
    })).map(s => s.id);
    assert.ok(ids.includes('UNLOCK_TIME'));
    assert.ok(ids.includes('NONSTANDARD_EXTRA'));
    assert.ok(ids.includes('PLAIN_PAYMENT_ID'));
  });

  it('reads a coinbase as such and nothing else', () => {
    assert.deepEqual(moneroSignals(tx({ coinbase: true, inputs: [] })).map(s => s.id), ['COINBASE']);
  });

  it('notes old rings and amounts in clear', () => {
    const old = tx({ rctType: 0, inputs: [{ keyImage: K('b'), ring: [{ height: 1, txid: K('1'), key: K('a') }, { height: 2, txid: K('2'), key: K('a') }, { height: 3, txid: K('3'), key: K('a') }] }] });
    const s = moneroSignals(old);
    assert.ok(s.some(x => x.id === 'CLEAR_AMOUNTS'));
    assert.equal(s.find(x => x.id === 'SMALL_RING')?.severity, 'medium');
  });

  it('spots two rings drawing on the same transaction', () => {
    const shared = K('e');
    const r = (salt: string) => Array.from({ length: 16 }, (_, i) => ({ height: i, txid: i === 5 ? shared : K(salt) + i, key: K('a') }));
    const t = tx({ inputs: [{ keyImage: K('1'), ring: r('1') }, { keyImage: K('2'), ring: r('2') }] });
    assert.deepEqual(sharedRingSources(t), [{ txid: shared, rings: [0, 1] }]);
    const ids = moneroSignals(t).map(s => s.id);
    assert.ok(ids.includes('SEVERAL_INPUTS'));
    assert.ok(ids.includes('SHARED_RING_SOURCE'));
  });
});

describe('the Monero contexts for Ask Alice', () => {
  it('projects a transaction page as its shape only', () => {
    const ctx = moneroTxContext(tx(), moneroSignals(tx()), 1793218056 + 60);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.flags, { monero: true, transaction: true });
    assert.ok(!JSON.stringify(a).includes(TXID));
    assert.deepEqual(ctx.full.subjects, [{ kind: 'txid', value: TXID }]);
  });

  it('projects a block page with no subject', () => {
    const ctx = moneroBlockContext({ height: 5, hash: K('1'), timestamp: 1, size: 10, txCount: 1, reward: BigInt(1), fees: BigInt(0), currentHeight: 6, txs: [] });
    assert.deepEqual(toAbstractSignal(ctx.signal)!.flags, { monero: true, block: true });
    assert.deepEqual(ctx.full.subjects, []);
  });

  it('projects an address page without the address', () => {
    const addr = decodeMoneroAddress('44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A')!;
    const ctx = moneroAddressContext(addr);
    const a = toAbstractSignal(ctx.signal)!;
    assert.deepEqual(a.flags, { monero: true, address: true, private: true });
    assert.ok(!JSON.stringify(a).includes(addr.address));
  });

  it('treats a Monero address typed in the chat as a raw identifier', () => {
    const addr = '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A';
    assert.deepEqual(findRawIdentifiersInText(`who owns ${addr}?`), [{ kind: 'address', value: addr, source: 'text' }]);
  });
});

describe('formatting', () => {
  it('writes piconero as XMR', () => {
    assert.equal(formatXmr(BigInt(625663500000)), '0.6256635 XMR');
    assert.equal(formatXmr(BigInt(34980000000000)), '34.98 XMR');
    assert.equal(formatXmr(BigInt(0)), '0 XMR');
    assert.equal(formatXmr(BigInt('18823703820885819799'), 2), '18,823,703.82 XMR');
    assert.equal(formatXmr(BigInt(122880000), 4), '0.0001 XMR');
    assert.equal(formatXmr(BigInt(1), 4), '0.0001 XMR');
  });

  it('writes a hashrate and an age in blocks', () => {
    assert.equal(formatHashrate(6451506693), '6.45 GH/s');
    assert.equal(formatBlockAge(30), '60 min');
    assert.equal(formatBlockAge(720), '24 h');
    assert.equal(formatBlockAge(720 * 400), '13 months');
    assert.equal(formatBlockAge(720 * 800), '2.2 years');
  });
});
