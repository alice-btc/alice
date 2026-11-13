import { t as tr, formatLocale } from '../../i18n/translate.ts';
// What a Monero transaction exposes, read from its public data alone. Monero
// hides the sender, the recipient and the amount, so none of Bitcoin's
// heuristics apply (no address to reuse, no change to spot, no amount to
// round). What remains are fingerprints, fields a wallet set in a way most
// wallets do not, and the few links the rings themselves can leak.
//
// Each signal states a fact (certain) or a hint (possible), never a
// conclusion about who paid whom. Same severity and confidence scale as the
// Bitcoin engine, kept separate because the rules share nothing.

import type { SignalConfidence, SignalSeverity } from './signals.ts';
import { MONERO_RING_SIZE, type MoneroTx } from './monero.ts';

export type MoneroSignalId =
  | 'COINBASE'
  | 'CLEAR_AMOUNTS'
  | 'SMALL_RING'
  | 'UNLOCK_TIME'
  | 'PLAIN_PAYMENT_ID'
  | 'NONSTANDARD_EXTRA'
  | 'MANY_OUTPUTS'
  | 'SEVERAL_INPUTS'
  | 'SHARED_RING_SOURCE'
  | 'PAYMENT_ID_DUMMY'
  | 'UNCONFIRMED';

export type MoneroSignal = {
  id: MoneroSignalId;
  severity: SignalSeverity;
  confidence: SignalConfidence;
  title: string;
  detail: string;
};

/** The transactions that appear in two or more rings of the same
 *  transaction, with the rings they appear in. */
export function sharedRingSources(tx: MoneroTx): { txid: string; rings: number[] }[] {
  const byTx = new Map<string, Set<number>>();
  tx.inputs.forEach((input, ring) => {
    for (const m of input.ring) {
      if (!m.txid) continue;
      const set = byTx.get(m.txid) ?? new Set<number>();
      set.add(ring);
      byTx.set(m.txid, set);
    }
  });
  return [...byTx.entries()]
    .filter(([, rings]) => rings.size >= 2)
    .map(([txid, rings]) => ({ txid, rings: [...rings].sort((a, b) => a - b) }));
}

export function moneroSignals(tx: MoneroTx): MoneroSignal[] {
  const out: MoneroSignal[] = [];

  if (tx.blockHeight === null) {
    out.push({
      id: 'UNCONFIRMED', severity: 'info', confidence: 'certain',
      title: tr('explorerMonero.signal.unconfirmedTitle'),
      detail: tr('explorerMonero.signal.unconfirmedDetail'),
    });
  }

  if (tx.coinbase) {
    out.push({
      id: 'COINBASE', severity: 'info', confidence: 'certain',
      title: tr('explorerMonero.signal.coinbaseTitle'),
      detail: tr('explorerMonero.signal.coinbaseDetail'),
    });
    return out;
  }

  if (tx.rctType === 0) {
    out.push({
      id: 'CLEAR_AMOUNTS', severity: 'medium', confidence: 'certain',
      title: tr('explorerMonero.signal.clearTitle'),
      detail: tr('explorerMonero.signal.clearDetail'),
    });
  }

  const ringSize = tx.inputs[0]?.ring.length ?? 0;
  if (ringSize > 0 && ringSize < MONERO_RING_SIZE) {
    out.push({
      id: 'SMALL_RING', severity: ringSize <= 3 ? 'medium' : 'low', confidence: 'certain',
      title: tr('explorerMonero.signal.ringTitle', { size: ringSize }),
      detail: tr('explorerMonero.signal.ringDetail', { size: ringSize, current: MONERO_RING_SIZE }),
    });
  }

  if (tx.unlockTime !== 0) {
    out.push({
      id: 'UNLOCK_TIME', severity: 'medium', confidence: 'certain',
      title: tr('explorerMonero.signal.unlockTitle'),
      detail: tr('explorerMonero.signal.unlockDetail', { until: tx.unlockTime < 500_000_000 ? tr('explorerMonero.blockNumber', { height: tx.unlockTime.toLocaleString(formatLocale()) }) : new Date(tx.unlockTime * 1000).toISOString().slice(0, 10) }),
    });
  }

  if (tx.extra.plainPaymentId) {
    out.push({
      id: 'PLAIN_PAYMENT_ID', severity: 'high', confidence: 'certain',
      title: tr('explorerMonero.signal.plainIdTitle'),
      detail: tr('explorerMonero.signal.plainIdDetail'),
    });
  }

  if (tx.extra.nonStandard || tx.extra.otherNonce) {
    out.push({
      id: 'NONSTANDARD_EXTRA', severity: 'low', confidence: 'certain',
      title: tr('explorerMonero.signal.extraTitle'),
      detail: tr('explorerMonero.signal.extraDetail'),
    });
  }

  if (tx.outputs.length > 2) {
    out.push({
      id: 'MANY_OUTPUTS', severity: 'info', confidence: 'certain',
      title: tr('explorerMonero.signal.outputsTitle', { count: tx.outputs.length }),
      detail: tr('explorerMonero.signal.outputsDetail'),
    });
  } else if (tx.extra.encryptedPaymentId) {
    out.push({
      id: 'PAYMENT_ID_DUMMY', severity: 'info', confidence: 'certain',
      title: tr('explorerMonero.signal.encryptedIdTitle'),
      detail: tr('explorerMonero.signal.encryptedIdDetail'),
    });
  }

  if (tx.inputs.length >= 2) {
    out.push({
      id: 'SEVERAL_INPUTS', severity: tx.inputs.length >= 5 ? 'medium' : 'low', confidence: 'certain',
      title: tr('explorerMonero.signal.inputsTitle', { count: tx.inputs.length }),
      detail: tr('explorerMonero.signal.inputsDetail'),
    });
  }

  const shared = sharedRingSources(tx);
  if (shared.length > 0) {
    out.push({
      id: 'SHARED_RING_SOURCE', severity: 'medium', confidence: 'possible',
      title: tr('explorerMonero.signal.sharedTitle'),
      detail: tr('explorerMonero.signal.sharedDetail', { count: shared.length }),
    });
  }

  return out;
}
