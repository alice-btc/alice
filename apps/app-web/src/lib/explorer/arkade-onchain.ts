// Identifying Arkade settlements on the Bitcoin chain.
//
// A commitment (settlement) transaction is a plain Bitcoin transaction: nothing
// in its on-chain shape says "Arkade". The ASP's indexer is the oracle: asking
// it for a commitment by txid answers with the round for a settlement and
// "batch not found" for anything else. The ASP publishes no historical list
// (its /v1/txs stream is live-only), but every commitment is funded from the
// operator's wallet, usually from the previous commitment's change, sometimes
// through a consolidation or a sweep of an expired batch in between. So the
// settlements are found by walking that wallet (wallet-walk.ts, shared with
// Bark): forward through outspends to the tip, backward through first inputs
// into history, asking the indexer about every transaction met.
//
// The registry below accumulates every settlement this browser has identified,
// persisted in localStorage, so the ribbon and the block view can highlight
// them without re-walking the chain from scratch each session.
//
// Where a pass starts matters: Alice's Worker walks the same wallet for
// everyone and publishes the newest commitment it stands on (anchors.ts), so
// a first visit reads that anchor, shows it as the latest, walks backward for
// the last few and forward for whatever landed since. The seeds in the code
// are the fallback when no anchor can be had.

import { getArkadeCommitmentIfAny } from './arkade.ts';
import { fetchExplorerAnchors, type ExplorerAnchor } from './anchors.ts';
import { largestOutputs, loadFrontier, saveFrontier, walkWalletBackward, walkWalletForward, type Outpoint, type SettlementProbe, type WalletWalkResult } from './wallet-walk.ts';
import type { NormalizedOutspend, NormalizedTransaction } from './types.ts';
import type { RequestOptions } from './provider.ts';
import { vaultStorage } from '../local-vault.ts';

/** One settlement identified on-chain. Height/time absent until confirmed. */
export type KnownSettlement = {
  txid: string;
  height?: number;
  timestamp?: number;
  /** The settlement before this one in the operator's funding order, learnt
   *  by walking backward from it: a txid, null at the wallet's origin
   *  (nothing older), absent while unknown. */
  prev?: string | null;
};

// The fallback starting points, used only when a browser has no settlement
// yet and the Worker's anchor cannot be had. These are real commitments of
// the arkade.computer ASP (mainnet), confirmed against the indexer: the first
// was found by following a VTXO's commitmentTxids, the others are later ones
// on funding lines the walk cannot reach from the first (the operator tops
// its wallet up from outside now and then). The walker extends forward from
// the newest known to the tip, and backward for history.
export const SEED_SETTLEMENT_TXID = '086f74e380432214902bc8d7e24d3eb57ba97b9b36811cec10ee44e3c7bcf12b';
export const SEED_SETTLEMENT_TXIDS: readonly string[] = [
  SEED_SETTLEMENT_TXID,
  // Block 969,561, 2 October 2026: the tip of a funding line that the
  // operator opened on 21 September, unreachable from the first seed's line.
  '128e6a2ee6f5e875adb42da4daef729ca9011d6d80866c0561e6f4862b925a68',
  // Block 970,748, 10 October 2026: found by scanning that block's taproot
  // transactions against the indexer, on yet another funding line.
  '1e27207377816e9e9fcd306253aaeaf659aed3adfcd37c4c53b0658f88328bf1',
];

const STORAGE_KEY = 'alice_arkade_settlements_v1';
// The persisted registry is capped so a long-lived browser profile does not
// grow without bound; the oldest settlements fall off first.
const MAX_STORED = 500;

/** Minimal storage the registry persists through; injectable for tests. The
 *  local vault adds readiness: it decrypts its values at start, and a reader
 *  that may run before that waits for `ready` or `whenReady`. */
export type KVStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & {
  isReady?: boolean;
  ready?: () => Promise<void>;
  whenReady?: (callback: () => void) => void;
};

/** The device's vault: encrypted at rest, null outside a browser. */
export function defaultStorage(): KVStorage | null {
  return vaultStorage();
}

/**
 * The set of settlements this browser knows about, persisted and observable.
 * One module-level instance is shared by the ribbon, the tx view and the block
 * view, so a settlement identified anywhere highlights everywhere.
 */
export class SettlementRegistry {
  private byTxid = new Map<string, KnownSettlement>();
  private listeners = new Set<() => void>();
  private storage: KVStorage | null;
  private readonly key: string;
  private loaded = false;

  /** `key` names the persisted entry: each on-chain registry (Arkade's
   *  settlements, Bark's rounds) keeps its own. */
  constructor(storage?: KVStorage | null, key: string = STORAGE_KEY) {
    this.storage = storage === undefined ? defaultStorage() : storage;
    this.key = key;
  }

  private waiting = false;

  private load(): void {
    if (this.loaded) return;
    if (!this.storage) { this.loaded = true; return; }
    if (this.storage.isReady === false) {
      // The vault is still decrypting: read it once it is, and tell the views.
      if (!this.waiting) {
        this.waiting = true;
        this.storage.whenReady?.(() => {
          this.waiting = false;
          this.load();
          for (const l of this.listeners) l();
        });
      }
      return;
    }
    this.loaded = true;
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return;
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr)) return;
      for (const e of arr) {
        const s = e as Partial<KnownSettlement>;
        if (typeof s.txid === 'string' && /^[0-9a-f]{64}$/.test(s.txid)) {
          const entry: KnownSettlement = {
            txid: s.txid,
            height: typeof s.height === 'number' ? s.height : undefined,
            timestamp: typeof s.timestamp === 'number' ? s.timestamp : undefined,
          };
          if (s.prev === null) entry.prev = null;
          else if (typeof s.prev === 'string' && /^[0-9a-f]{64}$/.test(s.prev)) entry.prev = s.prev;
          this.byTxid.set(s.txid, entry);
        }
      }
    } catch { /* a corrupt cache just starts empty */ }
  }

  private persist(): void {
    if (!this.storage) return;
    try {
      // Keep the newest by height (unconfirmed ones, without a height, stay).
      const all = [...this.byTxid.values()];
      const confirmed = all.filter(s => s.height !== undefined)
        .sort((a, b) => b.height! - a.height!)
        .slice(0, MAX_STORED);
      const pending = all.filter(s => s.height === undefined);
      this.storage.setItem(this.key, JSON.stringify([...confirmed, ...pending]));
    } catch { /* quota or private mode: stay in-memory */ }
  }

  /** Every known settlement, unordered. */
  all(): KnownSettlement[] {
    this.load();
    return [...this.byTxid.values()];
  }

  has(txid: string): boolean {
    this.load();
    return this.byTxid.has(txid);
  }

  get(txid: string): KnownSettlement | undefined {
    this.load();
    return this.byTxid.get(txid);
  }

  /** The confirmed settlement heights, for the ribbon's block highlights. */
  heights(): Set<number> {
    this.load();
    const s = new Set<number>();
    for (const e of this.byTxid.values()) if (e.height !== undefined) s.add(e.height);
    return s;
  }

  /** Add or enrich a settlement; notifies only when something changed. */
  add(s: KnownSettlement): void {
    this.load();
    const was = this.byTxid.get(s.txid);
    const next: KnownSettlement = {
      txid: s.txid,
      height: s.height ?? was?.height,
      timestamp: s.timestamp ?? was?.timestamp,
    };
    const prev = s.prev !== undefined ? s.prev : was?.prev;
    if (prev !== undefined) next.prev = prev;
    if (was && was.height === next.height && was.timestamp === next.timestamp && was.prev === next.prev) return;
    this.byTxid.set(s.txid, next);
    this.persist();
    for (const l of this.listeners) l();
  }

  /** Record which settlement precedes `txid` in funding order (null: none,
   *  the wallet's origin). A no-op for a settlement not known. */
  link(txid: string, prev: string | null): void {
    this.load();
    const was = this.byTxid.get(txid);
    if (!was) return;
    this.add({ txid, prev });
  }

  /**
   * The settlements reachable from `txid` through the `prev` links, newest
   * first: the stretch of history known to be complete under it. Ends where
   * the predecessor is unknown, or at the wallet's origin.
   */
  run(txid: string): KnownSettlement[] {
    this.load();
    const out: KnownSettlement[] = [];
    const seen = new Set<string>();
    let cur: string | null | undefined = txid;
    while (typeof cur === 'string' && !seen.has(cur)) {
      const s = this.byTxid.get(cur);
      if (!s) break;
      seen.add(cur);
      out.push(s);
      cur = s.prev;
    }
    return out;
  }

  /** The oldest settlement of the run under `txid`, and whether the run ends
   *  at the wallet's origin (nothing older to find). */
  runEnd(txid: string): { txid: string; origin: boolean } {
    const run = this.run(txid);
    const last = run[run.length - 1];
    if (!last) return { txid, origin: false };
    return { txid: last.txid, origin: last.prev === null };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  /** Forget every settlement, in memory and in storage: a reset. */
  clear(): void {
    this.load();
    if (this.byTxid.size === 0) return;
    this.byTxid.clear();
    try { this.storage?.removeItem(this.key); } catch { /* read-only storage */ }
    for (const l of this.listeners) l();
  }
}

/** The shared instance the Explorer UI uses. */
export const settlementRegistry = new SettlementRegistry();

/** Record a settlement announced by the live stream (height still unknown). */
export function noteSeenSettlement(txid: string): void {
  if (/^[0-9a-f]{64}$/i.test(txid)) settlementRegistry.add({ txid: txid.toLowerCase() });
}

// ---------------------------------------------------------------------------
// Chain walking

/** The slice of ChainDataProvider the walker needs; injectable for tests. */
export type ChainReader = {
  getTransaction(txid: string, opts?: RequestOptions): Promise<NormalizedTransaction>;
  getOutspends?(txid: string, opts?: RequestOptions): Promise<NormalizedOutspend[]>;
};

/** Answers whether a txid is a commitment transaction. */
export type CommitmentProbe = SettlementProbe;

/** The default probe: ask the ASP indexer. Non-commitments are remembered so a
 *  txid is never re-checked; commitments land in the registry via the walker. */
export function makeAspProbe(arkApiUrl: string, negatives: Set<string> = new Set()): CommitmentProbe {
  return async (txid, signal) => {
    if (settlementRegistry.has(txid)) return true;
    if (negatives.has(txid)) return false;
    const c = await getArkadeCommitmentIfAny(arkApiUrl, txid, { signal });
    if (c === null) { negatives.add(txid); return false; }
    return true;
  };
}

const BULK: RequestOptions['priority'] = 'bulk';

function record(tx: NormalizedTransaction): void {
  settlementRegistry.add({
    txid: tx.txid,
    height: tx.status.confirmed ? tx.status.blockHeight : undefined,
    timestamp: tx.status.confirmed ? tx.status.blockTime : undefined,
  });
}

/** Fetch a settlement's confirmation and record it in the registry. */
async function recordSettlement(chain: ChainReader, txid: string, signal?: AbortSignal): Promise<NormalizedTransaction> {
  const tx = await chain.getTransaction(txid, { signal, priority: BULK });
  record(tx);
  return tx;
}

const FRONTIER_KEY = 'alice_arkade_frontier_v1';

// Below this, an output is a connector (330 sats), a user's payout or dust,
// not what the wallet funds a commitment from: the operator's change runs
// from tens of thousands of sats to millions. Following smaller outputs
// (tried at 1,000 sats) sends the walk wandering through hundreds of
// transactions; at this floor the path from one commitment to the next is
// nearly a line.
export const MIN_FOLLOW_SATS = 10_000;
// At most this many outputs of one transaction are followed (the largest):
// a commitment's batch output (swept back to the wallet after its expiry),
// its change, and one more for a consolidation's.
const MAX_FOLLOW_PER_TX = 3;

/** The outputs of a transaction worth following: the largest above the
 *  floor. A batch output counts: swept after its expiry, it is wallet money
 *  again, and the sweep leads on to later commitments. */
export function followableOutputs(tx: NormalizedTransaction): Outpoint[] {
  return largestOutputs(tx, MIN_FOLLOW_SATS, MAX_FOLLOW_PER_TX);
}

export type WalkResult = WalletWalkResult;

/**
 * Walk the operator's wallet FORWARD from the given outputs towards the live
 * tip: each spent output leads to its spender, which the ASP is asked about
 * and whose larger outputs join the queue, commitment or not (a consolidation
 * or a sweep between two commitments is crossed, not a dead end). Unspent
 * outputs form the frontier the next pass resumes from.
 */
export function walkSettlementsForward(
  chain: ChainReader,
  probe: CommitmentProbe,
  start: Outpoint[],
  opts: { signal?: AbortSignal; maxHops?: number; maxFrontier?: number } = {},
): Promise<WalkResult> {
  return walkWalletForward(chain, { probe, follow: followableOutputs, record }, start, opts);
}

export type BackwardWalkResult = {
  /** Newly identified settlements, in discovery order. */
  found: string[];
  /** True when the walk stopped because a lookup failed (retryable later). */
  interrupted: boolean;
  /** True when the walk reached the wallet's origin: nothing older exists. */
  origin: boolean;
};

/**
 * Walk the funding BACKWARD from a known settlement into history: each
 * commitment's first input spends the operator's wallet, usually the previous
 * commitment's change, sometimes a consolidation or a sweep that is itself
 * funded from one. Up to `maxWalletHops` such transactions in a row are
 * crossed. Stops at a settlement already known (its history was walked from
 * it), at the wallet's origin (a coinbase, or more wallet hops than allowed)
 * or after `maxHops` settlements, deep history being discovered
 * progressively, a page per walk. Each settlement passed learns its
 * predecessor (`prev`), so the registry knows which stretch is complete.
 */
export function walkSettlementsBackward(
  chain: ChainReader,
  probe: CommitmentProbe,
  fromTxid: string,
  opts: { signal?: AbortSignal; maxHops?: number; maxWalletHops?: number } = {},
): Promise<BackwardWalkResult> {
  return walkWalletBackward(chain, {
    probe,
    record,
    known: txid => settlementRegistry.has(txid),
    link: (txid, prev) => settlementRegistry.link(txid, prev),
  }, fromTxid, opts);
}

function confirmedExtreme(pick: 'newest' | 'oldest'): { txid: string; height: number } | null {
  let best: { txid: string; height: number } | null = null;
  for (const s of settlementRegistry.all()) {
    if (s.height === undefined) continue;
    if (!best || (pick === 'newest' ? s.height > best.height : s.height < best.height)) best = { txid: s.txid, height: s.height };
  }
  return best;
}

/** How many settlements under the newest a pass makes sure it knows: the
 *  recent history a first visit shows without being asked. Arkade settles a
 *  batch every day or two, so ten covers a week or more. */
export const HISTORY_FIRST = 10;
/** How many older settlements one "load older" request fetches. */
export const HISTORY_PAGE = 25;
// The hop budget of the forward walk that fills in the settlements between
// two backward finds: a day or two of the operator's wallet, not a tour.
const FILL_HOPS = 24;

/** What a pass reports to the view driving it. */
export type PassResult = {
  /** True when the forward walk reached the live tip (nothing left to
   *  follow): the newest settlement shown is the newest there is. False when
   *  the hop budget ran out or a lookup failed, so the caller runs another
   *  pass soon rather than at the next tick. */
  atTip: boolean;
  /** True when a lookup failed: the pass is worth retrying after a pause,
   *  not right away. */
  interrupted: boolean;
};

export type HistoryResult = {
  /** Settlements newly identified. */
  found: number;
  /** True when the wallet's origin was reached: nothing older exists. */
  origin: boolean;
  /** True when a lookup failed before the request was served in full. */
  interrupted: boolean;
};

/**
 * Extend the known history under the newest settlement: walk backward from
 * the end of the run the newest heads (the oldest settlement reachable
 * through `prev` links), in pages, until `remaining` asks for no more, the
 * wallet's origin is reached, or a walk makes no progress (a funding line
 * that stops in unknown wallet transactions). `remaining` is asked before
 * each page, with what was found so far: a pass wants the run a given depth
 * (settlements already known join it through the links), a request for
 * older history wants a number of new ones.
 */
async function extendHistory(chain: ChainReader, probe: CommitmentProbe, remaining: (found: number) => number, signal?: AbortSignal): Promise<HistoryResult> {
  let found = 0;
  let origin = false;
  let interrupted = false;
  let oldestFound: string | null = null;
  for (let i = 0; i < 4; i++) {
    const want = remaining(found);
    if (want <= 0) break;
    const newest = confirmedExtreme('newest');
    if (!newest) break;
    const end = settlementRegistry.runEnd(newest.txid);
    if (end.origin) { origin = true; break; }
    const res = await walkSettlementsBackward(chain, probe, end.txid, { signal, maxHops: want });
    found += res.found.length;
    if (res.found.length > 0) oldestFound = res.found[res.found.length - 1];
    origin = res.origin;
    interrupted = res.interrupted;
    if (interrupted || origin) break;
    // No progress: the line ends in wallet transactions the walk cannot
    // cross, or a lookup is missing; another page would repeat the same walk.
    if (settlementRegistry.runEnd(newest.txid).txid === end.txid) break;
  }
  // The backward walk follows one input per hop, so it skips the settlements
  // the wallet funded from other coins in between. Walking forward from the
  // oldest one found fills them in: its change leads through every later
  // settlement on its line, up to ones already known. Best effort.
  if (oldestFound) {
    try {
      const tx = await chain.getTransaction(oldestFound, { signal, priority: BULK });
      const before = new Set(settlementRegistry.all().map(s => s.txid));
      const fill = await walkSettlementsForward(chain, probe, followableOutputs(tx), { signal, maxHops: FILL_HOPS, maxFrontier: 0 });
      found += fill.found.filter(t => !before.has(t)).length;
    } catch { /* the page stands without the fill */ }
  }
  return { found, origin, interrupted };
}

/** The default source of the Worker's anchor: the published arkade one. */
async function publishedArkadeAnchor(signal?: AbortSignal): Promise<ExplorerAnchor | null> {
  const anchors = await fetchExplorerAnchors({ signal });
  return anchors?.arkade ?? null;
}

/**
 * One full update pass, as the Explorer runs it. Read the Worker's anchor
 * (the newest commitment it knows) and record it; fall back to the seeds in
 * the code only when nothing at all is known. Resolve any heights the live
 * stream left unknown, walk forward from the stored frontier (or from the
 * newest settlement's outputs when a newer one appeared since the frontier
 * was saved) to the live tip, then make sure the recent history under the
 * newest is known (HISTORY_FIRST deep). Older history is fetched on request
 * (loadOlderSettlements). Each step tolerates failure independently.
 */
export async function updateSettlements(
  chain: ChainReader,
  arkApiUrl: string,
  opts: {
    signal?: AbortSignal; storage?: KVStorage | null; maxHops?: number;
    /** How deep under the newest the pass fills history; HISTORY_FIRST by default. */
    historyDepth?: number;
    probe?: CommitmentProbe;
    /** Where the anchor comes from; the Worker by default, null for none. */
    anchor?: (signal?: AbortSignal) => Promise<ExplorerAnchor | null>;
  } = {},
): Promise<PassResult> {
  const { signal, maxHops, historyDepth = HISTORY_FIRST } = opts;
  const storage = opts.storage === undefined ? defaultStorage() : opts.storage;
  await storage?.ready?.();
  const probe = opts.probe ?? makeAspProbe(arkApiUrl);

  // The anchor first: the newest commitment the Worker stands on, shown as
  // the latest right away, before any walk.
  let anchor: ExplorerAnchor | null = null;
  try { anchor = await (opts.anchor ?? publishedArkadeAnchor)(signal); } catch { anchor = null; }
  if (anchor) settlementRegistry.add({ txid: anchor.txid, height: anchor.height, timestamp: anchor.timestamp });

  // Resolve heights the live stream could not know (a few at most per pass).
  const resolveHeights = async () => {
    for (const s of settlementRegistry.all().filter(x => x.height === undefined).slice(0, 10)) {
      try { await recordSettlement(chain, s.txid, signal); } catch { /* later pass */ }
    }
  };
  await resolveHeights();
  // Nothing confirmed to walk from (a first visit without an anchor, the
  // stream's only commitment still in the mempool): the seeds in the code.
  if (!confirmedExtreme('newest') && !SEED_SETTLEMENT_TXIDS.some(txid => settlementRegistry.has(txid))) {
    for (const txid of SEED_SETTLEMENT_TXIDS) settlementRegistry.add({ txid });
    await resolveHeights();
  }

  const newest = confirmedExtreme('newest');
  if (!newest) return { atTip: false, interrupted: true };
  // The frontier: the stored one, plus the newest settlement's outputs when
  // it appeared since the frontier was saved. The stored outputs are kept,
  // not replaced: the operator's wallet holds several coins and funds its
  // commitments from any of them, so a line can sleep for weeks (the one
  // seeded first stopped on 20 August) while another runs, and wake up
  // later. Its tip stays watched as long as it is unspent.
  const stored = loadFrontier(storage, FRONTIER_KEY);
  let start: Outpoint[] = stored?.outpoints ?? [];
  if (!stored || stored.base !== newest.txid) {
    let tx: NormalizedTransaction;
    try {
      tx = await chain.getTransaction(newest.txid, { signal, priority: BULK });
    } catch {
      return { atTip: false, interrupted: true };
    }
    const watched = new Set(start.map(o => `${o.txid}:${o.vout}`));
    start = [...start, ...followableOutputs(tx).filter(o => !watched.has(`${o.txid}:${o.vout}`))];
  }
  let atTip = true;
  if (start.length > 0) {
    const result = await walkSettlementsForward(chain, probe, start, { signal, maxHops, maxFrontier: 24 });
    if (result.interrupted) return { atTip: false, interrupted: true };
    atTip = !result.exhausted;
    const base = confirmedExtreme('newest') ?? newest;
    saveFrontier(storage, FRONTIER_KEY, { base: base.txid, outpoints: result.frontier });
  }

  // The recent history under the newest: what a first visit shows without
  // being asked, and the gap the live stream or a fresh anchor leaves.
  const head = confirmedExtreme('newest') ?? newest;
  await extendHistory(chain, probe, () => historyDepth - settlementRegistry.run(head.txid).length, signal);
  return { atTip, interrupted: false };
}

/**
 * Fetch a page of older settlements on request ("load older"): HISTORY_PAGE
 * of them under the oldest known of the newest's run.
 */
export async function loadOlderSettlements(
  chain: ChainReader,
  arkApiUrl: string,
  opts: { signal?: AbortSignal; count?: number; probe?: CommitmentProbe } = {},
): Promise<HistoryResult> {
  const probe = opts.probe ?? makeAspProbe(arkApiUrl);
  const count = opts.count ?? HISTORY_PAGE;
  return extendHistory(chain, probe, found => count - found, opts.signal);
}
