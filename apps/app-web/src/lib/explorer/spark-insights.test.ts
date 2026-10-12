import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSparkBalanceSeries, sparkTransferDelta, transferToNormalized } from './spark-insights.ts';
import type { SparkLeaf, SparkTransfer } from './spark.ts';

const ME = '03f5ce35a29fc2e5a41afe760d6c714e0f76dfc12d00f5c01eef4d8c1e3eb3fcab';
const OTHER = '037579aee81891fc3a28cbe7b13e565031d46248b420fb39dcb308598f472b4513';

const leaf = (id: string, valueSats: number): SparkLeaf => ({
  id, treeId: 't', parentId: null, valueSats, vout: 0, status: 'available', ownerPubkey: OTHER,
  nodeTx: new Uint8Array(), refundTx: new Uint8Array(), directTx: new Uint8Array(), directRefundTx: new Uint8Array(),
});

const transfer = (o: Partial<SparkTransfer> & { id: string }): SparkTransfer => ({
  senderPubkey: OTHER, receiverPubkey: ME, status: 'completed', type: 'transfer', totalSats: 100, leaves: [], ...o,
});

describe('sparkTransferDelta', () => {
  it('credits what the wallet received and debits what it sent', () => {
    assert.equal(sparkTransferDelta(transfer({ id: 'a', totalSats: 300 }), ME), 300);
    assert.equal(sparkTransferDelta(transfer({ id: 'b', senderPubkey: ME, receiverPubkey: OTHER, totalSats: 100 }), ME), -100);
    assert.equal(sparkTransferDelta(transfer({ id: 'c', senderPubkey: ME, receiverPubkey: ME }), ME), 0);
    assert.equal(sparkTransferDelta(transfer({ id: 'd' }), 'deadbeef'), 0);
  });
});

describe('buildSparkBalanceSeries', () => {
  it('anchors the line at the current balance and walks the transfers backward', () => {
    const series = buildSparkBalanceSeries([
      transfer({ id: 'sent', senderPubkey: ME, receiverPubkey: OTHER, totalSats: 100, createdAt: 20 }),
      transfer({ id: 'received', totalSats: 300, createdAt: 10 }),
      transfer({ id: 'pending', totalSats: 999, createdAt: 15, status: 'sender-key-tweaked' }),
    ], ME, 1000, false);
    assert.equal(series.partial, false);
    assert.equal(series.firstSeen, 10);
    assert.equal(series.lastSeen, 20);
    assert.deepEqual(series.points.slice(0, 3), [{ t: 10, balanceSats: 800 }, { t: 10, balanceSats: 1100 }, { t: 20, balanceSats: 1000 }]);
    assert.equal(series.points[series.points.length - 1].balanceSats, 1000);
  });

  it('is partial when more transfers exist or one cannot be dated, empty without events', () => {
    assert.equal(buildSparkBalanceSeries([transfer({ id: 'a', createdAt: 5 })], ME, 100, true).partial, true);
    assert.equal(buildSparkBalanceSeries([transfer({ id: 'a' })], ME, 100, false).partial, true);
    assert.deepEqual(buildSparkBalanceSeries([], ME, 0, false), { points: [], firstSeen: null, lastSeen: null, partial: false });
  });
});

describe('transferToNormalized', () => {
  it('draws every leaf from the sender to the receiver, whole', () => {
    const tx = transferToNormalized(transfer({ id: 'tr', totalSats: 1536, leaves: [leaf('l1', 1024), leaf('l2', 512)] }));
    assert.equal(tx.txid, 'tr');
    assert.equal(tx.inputs.length, 2);
    assert.equal(tx.outputs.length, 2);
    assert.equal(tx.inputs[0].prevTxid, 'l1');
    assert.equal(tx.inputs[0].valueSats, 1024);
    assert.ok(tx.inputs[0].address?.startsWith('spark1pgss'));
    assert.equal(tx.outputs[1].valueSats, 512);
    assert.ok(tx.outputs[1].address?.startsWith('spark1pgss'));
    assert.notEqual(tx.inputs[0].address, tx.outputs[0].address);
    assert.equal(tx.feeSats, 0);
    assert.equal(tx.status.confirmed, false);
  });

  it('draws a transfer served without leaves as one ribbon of its amount', () => {
    const tx = transferToNormalized(transfer({ id: 'swap', type: 'preimage-swap', totalSats: 777 }));
    assert.equal(tx.inputs.length, 1);
    assert.equal(tx.inputs[0].prevTxid, '');
    assert.equal(tx.outputs[0].valueSats, 777);
  });
});
