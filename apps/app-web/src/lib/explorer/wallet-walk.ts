// Following an operator's on-chain wallet forward, to find its settlements.
//
// Arkade's commitment transactions and Bark's round transactions are plain
// Bitcoin transactions funded from their operator's wallet, and neither
// operator publishes a list of them. What each does answer is "is this txid
// one of yours?" (a probe), so the settlements can be found by walking the
// wallet's spend graph: from the outputs of a known settlement, follow each
// output to the transaction spending it, ask the probe about that
// transaction, and go on through its outputs, whether or not it was a
// settlement. Between two settlements the wallet also consolidates its coins,
// sweeps expired batches back and pays users out, so the path is a small
// mesh, not a chain, and a walk that only accepted settlement spenders would
// stop at the first consolidation (Arkade's did, on 20 August 2026).
//
// The unspent outputs the walk ends on are its frontier: where the wallet
// will spend next, persisted so the next pass resumes there instead of
// re-walking. A wrong turn into a user's wallet is bounded by the hop and
// frontier caps, and dies out when that wallet's outputs stop being spent or
// fall under the caller's value floor.

import type { ChainReader, KVStorage } from './arkade-onchain.ts';
import type { NormalizedOutspend, NormalizedTransaction } from './types.ts';
import type { RequestOptions } from './provider.ts';

/** An output the walker watches: where the wallet may spend next. */
export type Outpoint = { txid: string; vout: number; valueSats: number };

/** Answers whether a txid is a settlement of the operator. */
export type SettlementProbe = (txid: string, signal?: AbortSignal) => Promise<boolean>;

export type WalletWalk = {
  probe: SettlementProbe;
  /** The outputs of a transaction worth following; `hit` says whether the
   *  probe recognised it. */
  follow: (tx: NormalizedTransaction, hit: boolean) => Outpoint[];
  /** Called with every settlement the probe recognises. */
  record: (tx: NormalizedTransaction) => void;
};

export type WalletWalkResult = {
  /** Settlements identified this pass, in discovery order. */
  found: string[];
  /** The unspent outputs reached, newest last: where to resume. */
  frontier: Outpoint[];
  /** True when the walk stopped on a failed lookup (retry later). */
  interrupted: boolean;
  /** True when the hop budget ran out with spent outputs still to follow:
   *  the tip was not reached, the next pass continues from the frontier. */
  exhausted: boolean;
};

const BULK: RequestOptions['priority'] = 'bulk';

/** The largest outputs of a transaction above a value floor. */
export function largestOutputs(tx: NormalizedTransaction, minSats: number, max: number, skip: (index: number) => boolean = () => false): Outpoint[] {
  return tx.outputs
    .filter(o => !skip(o.index) && o.valueSats >= minSats)
    .sort((a, b) => b.valueSats - a.valueSats)
    .slice(0, max)
    .map(o => ({ txid: tx.txid, vout: o.index, valueSats: o.valueSats }));
}

/**
 * Walk the wallet forward from `start`, breadth first. Each hop fetches one
 * spender and asks the probe about it; `maxHops` bounds the pass, and what
 * is left over stays in the frontier for the next one.
 */
export async function walkWalletForward(
  chain: ChainReader,
  walk: WalletWalk,
  start: Outpoint[],
  opts: { signal?: AbortSignal; maxHops?: number; maxFrontier?: number } = {},
): Promise<WalletWalkResult> {
  const { signal, maxHops = 60, maxFrontier = 12 } = opts;
  const found: string[] = [];
  const frontier: Outpoint[] = [];
  let exhausted = false;
  if (typeof chain.getOutspends !== 'function') return { found, frontier: start, interrupted: false, exhausted: false };
  const queue = [...start];
  // Spenders already explored this pass: several outputs can be spent by one
  // transaction (a consolidation), which is explored once.
  const explored = new Set<string>();
  const outspendsByTxid = new Map<string, NormalizedOutspend[]>();
  let hops = 0;
  try {
    while (queue.length > 0) {
      const op = queue.shift()!;
      let outspends = outspendsByTxid.get(op.txid);
      if (!outspends) {
        outspends = await chain.getOutspends(op.txid, { signal, priority: BULK });
        outspendsByTxid.set(op.txid, outspends);
      }
      const spend = outspends[op.vout];
      if (!spend?.spent || !spend.txid) { frontier.push(op); continue; }
      if (explored.has(spend.txid)) continue;
      // Out of budget: the output stays in the frontier, spent, and its
      // spender is explored by the next pass.
      if (hops >= maxHops) { frontier.push(op); exhausted = true; continue; }
      explored.add(spend.txid);
      hops++;
      const tx = await chain.getTransaction(spend.txid, { signal, priority: BULK });
      const hit = await walk.probe(tx.txid, signal);
      if (hit) { walk.record(tx); found.push(tx.txid); }
      queue.push(...walk.follow(tx, hit));
    }
  } catch {
    // Aborted or a provider hiccup: keep what was found, resume from the
    // same start next pass.
    return { found, frontier: start, interrupted: true, exhausted: false };
  }
  // The newest discoveries sit last; a frontier polluted by a detour into a
  // user's wallet forgets the oldest entries first.
  return { found, frontier: frontier.slice(-maxFrontier), interrupted: false, exhausted };
}

export type WalletBackwardWalk = {
  probe: SettlementProbe;
  /** Called with every settlement the probe recognises. */
  record: (tx: NormalizedTransaction) => void;
  /** Whether a txid is a settlement already known (its history was walked
   *  from it, or will be): the walk stops there. */
  known: (txid: string) => boolean;
  /** Called when the settlement before `txid` in funding order is learnt:
   *  another settlement, or null at the wallet's origin (nothing older). */
  link?: (txid: string, prev: string | null) => void;
};

export type WalletBackwardResult = {
  /** Newly identified settlements, in discovery order (newest first). */
  found: string[];
  /** True when the walk stopped because a lookup failed (retryable later). */
  interrupted: boolean;
  /** True when the walk reached the wallet's origin: nothing older exists
   *  on this funding line. */
  origin: boolean;
};

/**
 * Walk the wallet BACKWARD from a known settlement into history: a
 * settlement's first input spends the operator's wallet, usually the previous
 * settlement's change, sometimes a consolidation, a sweep or a payout that is
 * itself funded from one. Up to `maxWalletHops` such transactions in a row
 * are crossed. Stops at a settlement already known, at the wallet's origin (a
 * coinbase, or more wallet hops than allowed) or after `maxHops` settlements,
 * deep history being discovered progressively, a page per walk.
 */
export async function walkWalletBackward(
  chain: ChainReader,
  walk: WalletBackwardWalk,
  fromTxid: string,
  opts: { signal?: AbortSignal; maxHops?: number; maxWalletHops?: number } = {},
): Promise<WalletBackwardResult> {
  const { signal, maxHops = 25, maxWalletHops = 4 } = opts;
  const found: string[] = [];
  if (maxHops <= 0) return { found, interrupted: false, origin: false };
  // The last settlement passed: the one whose predecessor is being sought.
  let anchor = fromTxid;
  let walletHops = 0;
  try {
    let tx = await chain.getTransaction(fromTxid, { signal, priority: BULK });
    while (found.length < maxHops) {
      const prev = tx.inputs[0]?.prevTxid;
      if (!prev || tx.inputs[0]?.isCoinbase) {
        walk.link?.(anchor, null);
        return { found, interrupted: false, origin: true };
      }
      if (walk.known(prev)) {
        walk.link?.(anchor, prev);
        break;
      }
      const hit = await walk.probe(prev, signal);
      if (!hit && ++walletHops > maxWalletHops) break;
      const ptx = await chain.getTransaction(prev, { signal, priority: BULK });
      if (hit) {
        walk.record(ptx);
        walk.link?.(anchor, prev);
        found.push(prev);
        anchor = prev;
        walletHops = 0;
      }
      tx = ptx;
    }
  } catch {
    return { found, interrupted: true, origin: false };
  }
  return { found, interrupted: false, origin: false };
}

/** A persisted frontier: the outputs to resume from, and the settlement
 *  they were reached from (a newer one invalidates them). */
export type StoredFrontier = { base: string; outpoints: Outpoint[] };

export function loadFrontier(storage: KVStorage | null, key: string): StoredFrontier | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const f = JSON.parse(raw) as Partial<StoredFrontier>;
    if (typeof f.base !== 'string' || !Array.isArray(f.outpoints)) return null;
    const outpoints = f.outpoints.filter((o): o is Outpoint =>
      typeof o?.txid === 'string' && /^[0-9a-f]{64}$/.test(o.txid)
      && Number.isInteger(o.vout) && o.vout >= 0 && typeof o.valueSats === 'number');
    return { base: f.base, outpoints };
  } catch {
    return null;
  }
}

export function saveFrontier(storage: KVStorage | null, key: string, frontier: StoredFrontier): void {
  try { storage?.setItem(key, JSON.stringify(frontier)); } catch { /* quota or private mode */ }
}
