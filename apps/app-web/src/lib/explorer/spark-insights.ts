// Pure adapters that let the Spark (off-chain) data reuse the Bitcoin
// explorer's views: the bowtie flow graph for a transfer, and the balance
// timeline for a wallet's transfers. No network here.

import { sparkAddressOf, type SparkTransfer } from './spark.ts';
import type { NormalizedTransaction } from './types.ts';
import type { BalanceSeries } from './balance-history.ts';

/** A transfer's effect on one wallet's balance: received, sent, or nothing
 *  (a self-transfer, or a transfer of someone else). */
export function sparkTransferDelta(t: SparkTransfer, pubkey: string): number {
  const sent = t.senderPubkey === pubkey;
  const received = t.receiverPubkey === pubkey;
  if (sent === received) return 0;
  return sent ? -t.totalSats : t.totalSats;
}

export type SparkBalanceHistory = BalanceSeries & {
  /** True when the series does not reach the wallet's first movement: more
   *  transfers exist than were read, or some could not be dated. The right
   *  edge stays exact (anchored at the balance the operators report). */
  partial: boolean;
};

/**
 * The balance timeline of a Spark wallet from the transfers read so far,
 * anchored at the CURRENT balance and walked backward like the on-chain
 * series, so it is exact at today's edge. Only completed transfers move the
 * balance; a pending one has not settled yet.
 */
export function buildSparkBalanceSeries(transfers: readonly SparkTransfer[], pubkey: string, balanceSats: number, more: boolean): SparkBalanceHistory {
  let partial = more;
  const events: { t: number; delta: number }[] = [];
  for (const t of transfers) {
    if (t.status !== 'completed') continue;
    const delta = sparkTransferDelta(t, pubkey);
    if (delta === 0) continue;
    if (t.createdAt === undefined) { partial = true; continue; }
    events.push({ t: t.createdAt, delta });
  }
  events.sort((a, b) => a.t - b.t);
  if (events.length === 0) return { points: [], firstSeen: null, lastSeen: null, partial };
  const totalDelta = events.reduce((s, e) => s + e.delta, 0);
  let running = balanceSats - totalDelta;
  const points = [{ t: events[0].t, balanceSats: running }];
  for (const e of events) {
    running += e.delta;
    points.push({ t: e.t, balanceSats: running });
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec > events[events.length - 1].t) points.push({ t: nowSec, balanceSats });
  return { points, firstSeen: events[0].t, lastSeen: events[events.length - 1].t, partial };
}

/**
 * A transfer shaped as a NormalizedTransaction, so the regular flow graph
 * can draw it: every leaf moved enters from the sender's address and leaves
 * to the receiver's, whole (a transfer never splits a leaf). Off-chain: no
 * confirmation, no size, no fee. An input's "previous transaction" is the
 * leaf itself, so the connector opens the leaf.
 */
export function transferToNormalized(t: SparkTransfer): NormalizedTransaction {
  const from = sparkAddressOf(t.senderPubkey) ?? undefined;
  const to = sparkAddressOf(t.receiverPubkey) ?? undefined;
  // A Lightning swap served without its leaves still has an amount to draw.
  const leaves = t.leaves.length ? t.leaves.map(l => ({ id: l.id, valueSats: l.valueSats })) : [{ id: '', valueSats: t.totalSats }];
  return {
    txid: t.id,
    version: 3,
    locktime: 0,
    sizeBytes: 0,
    weight: 0,
    vsize: 0,
    feeSats: 0,
    feeRateSatVb: null,
    status: { confirmed: false },
    inputs: leaves.map(l => ({
      prevTxid: l.id,
      prevVout: 0,
      valueSats: l.valueSats,
      address: from,
      scriptType: 'p2tr',
      sequence: 0xffffffff,
      isCoinbase: false,
    })),
    outputs: leaves.map((l, index) => ({
      index,
      valueSats: l.valueSats,
      address: to,
      scriptType: 'p2tr',
      spent: false,
    })),
    isCoinbase: false,
    rbfSignaled: false,
    source: { name: 'Spark operators', baseUrl: 'https://0.spark.lightspark.com' },
  };
}
