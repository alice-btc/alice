import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { noteSparkDeposit, noteSparkscanOnchain, sparkOnchainRegistry } from './spark-onchain.ts';
import type { SparkscanTx } from './sparkscan.ts';

const TXID = 'ab'.repeat(32);
const EXIT_TXID = 'cd'.repeat(32);
const WALLET = 'spark1pgssyxefq3s0k2v2jx32gnyqhuxjkkyf3j5p9wrmr4wlr2rpk3mt6nnf36y6kp';

const scan = (over: Partial<SparkscanTx>): SparkscanTx => ({
  id: 'e'.repeat(64), kind: 'deposit', rawType: 'bitcoin_deposit', status: 'confirmed', amountSats: 50_000,
  from: { kind: 'bitcoin', address: null, pubkey: null, label: 'Bitcoin' },
  to: { kind: 'spark', address: WALLET, pubkey: '02' + '1'.repeat(64), label: WALLET },
  createdAt: 1_760_000_000, bitcoinTxid: TXID, ...over,
});

describe('sparkOnchainRegistry', () => {
  it('remembers a deposit a leaf walked down to, whatever the case, and tells listeners once', () => {
    let notified = 0;
    const off = sparkOnchainRegistry.subscribe(() => { notified++; });
    noteSparkDeposit({ txid: TXID.toUpperCase(), vout: 1, treeId: 'tree', leafId: 'leaf', amountSats: 2048 });
    assert.equal(notified, 1);
    assert.ok(sparkOnchainRegistry.has(TXID));
    const got = sparkOnchainRegistry.get(TXID.toUpperCase());
    assert.equal(got?.kind, 'deposit');
    assert.equal(got?.source, 'leaf');
    assert.deepEqual([got?.vout, got?.treeId, got?.leafId, got?.amountSats], [1, 'tree', 'leaf', 2048]);
    // The same leaf again changes nothing.
    noteSparkDeposit({ txid: TXID, vout: 1, treeId: 'tree', leafId: 'leaf', amountSats: 2048 });
    assert.equal(notified, 1);
    // Another leaf of the same tree updates the way back.
    noteSparkDeposit({ txid: TXID, vout: 1, treeId: 'tree', leafId: 'leaf-2', amountSats: 2048 });
    assert.equal(notified, 2);
    assert.equal(sparkOnchainRegistry.get(TXID)?.leafId, 'leaf-2');
    off();
  });

  it('takes the Bitcoin side of what Sparkscan reports: a deposit names the receiving wallet, an exit the leaving one', () => {
    noteSparkscanOnchain([scan({ id: 'f'.repeat(64), bitcoinTxid: EXIT_TXID, kind: 'exit', rawType: 'cooperative_exit', amountSats: 7_000, from: { kind: 'spark', address: WALLET, pubkey: null, label: WALLET }, to: { kind: 'bitcoin', address: null, pubkey: null, label: 'Bitcoin' } })]);
    const exit = sparkOnchainRegistry.get(EXIT_TXID);
    assert.deepEqual(exit, { txid: EXIT_TXID, kind: 'exit', source: 'sparkscan', amountSats: 7_000, sparkAddress: WALLET, sparkTxId: 'f'.repeat(64) });
    assert.ok(sparkOnchainRegistry.txids().includes(EXIT_TXID));
  });

  it('ignores the lines without a Bitcoin side: transfers, Lightning, tokens, or a deposit without its txid', () => {
    const before = sparkOnchainRegistry.txids().length;
    noteSparkscanOnchain([
      scan({ kind: 'transfer', rawType: 'spark_transfer', bitcoinTxid: '1'.repeat(64) }),
      scan({ kind: 'lightning', rawType: 'lightning_payment', bitcoinTxid: '2'.repeat(64) }),
      scan({ kind: 'token', rawType: 'token_transfer', bitcoinTxid: '3'.repeat(64) }),
      scan({ bitcoinTxid: null }),
      scan({ bitcoinTxid: 'not a txid' }),
    ]);
    assert.equal(sparkOnchainRegistry.txids().length, before);
  });

  it('lets Sparkscan name the wallet of a deposit a leaf established, without taking the record over', () => {
    let notified = 0;
    const off = sparkOnchainRegistry.subscribe(() => { notified++; });
    noteSparkscanOnchain([scan({ bitcoinTxid: TXID })]);
    assert.equal(notified, 1);
    const got = sparkOnchainRegistry.get(TXID);
    assert.equal(got?.source, 'leaf');
    assert.equal(got?.kind, 'deposit');
    assert.equal(got?.leafId, 'leaf-2');
    assert.equal(got?.amountSats, 2048, 'the tree amount wins over the reported one');
    assert.equal(got?.sparkAddress, WALLET);
    assert.equal(got?.sparkTxId, 'e'.repeat(64));
    // The same report again changes nothing.
    noteSparkscanOnchain([scan({ bitcoinTxid: TXID })]);
    assert.equal(notified, 1);
    off();
  });

  it('keeps what Sparkscan said when a leaf later walks down to the same deposit', () => {
    const txid = '9a'.repeat(32);
    noteSparkscanOnchain([scan({ id: '7'.repeat(64), bitcoinTxid: txid })]);
    noteSparkDeposit({ txid, vout: 0, treeId: 't2', leafId: 'l9', amountSats: 100_000 });
    const got = sparkOnchainRegistry.get(txid);
    assert.equal(got?.source, 'leaf');
    assert.equal(got?.treeId, 't2');
    assert.equal(got?.sparkAddress, WALLET);
    assert.equal(got?.sparkTxId, '7'.repeat(64));
  });

  it('knows nothing about a transaction it was never told of', () => {
    assert.equal(sparkOnchainRegistry.get('0'.repeat(64)), undefined);
    assert.equal(sparkOnchainRegistry.has('not a txid'), false);
  });
});
