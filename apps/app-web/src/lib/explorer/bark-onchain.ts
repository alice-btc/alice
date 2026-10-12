// Identifying Bark rounds on the Bitcoin chain.
//
// A Bark round's transaction is a plain Bitcoin transaction, and Second's
// server publishes no list of them. What it does answer, without
// authentication, is a VTXO lookup by id, and one output of a round is the
// root of its VTXO tree, which the server knows as a VTXO anchored on that
// very transaction (its genesis is empty: nothing stands between the chain
// and it). So "is this txid a round?" becomes "does the server know one of
// its first outputs as a VTXO anchored on it?": a precise oracle, usable on
// any candidate. The root is usually output 0 but not always (one round of
// October 2026 has it at 1), and a tree transaction that a holder broadcast
// to exit is known to the server too, anchored on its round, not on itself:
// that one is not a round, whatever its policy.
//
// Finding candidates is the harder half. The server's wallet funds each round
// from its own coins, so the rounds all hang off one on-chain wallet, but
// between two rounds that wallet also pays users out (exits, offboards) and
// consolidates its coins: the path from one round to the next is a small
// mesh, not a chain. The wallet walk (wallet-walk.ts, shared with Arkade)
// follows the wallet's larger outputs (its change and consolidations; a
// payout to a user is small next to them), asks the server about each
// transaction it reaches, and keeps the unspent outputs it ends on as the
// frontier to resume from next time.
//
// Rounds found land in a registry persisted in localStorage, shared by the
// rounds feed, the transaction view, the block view and the ribbon.
//
// Where a pass starts: the server answers LastRoundEvent with its latest
// finished round, signed transaction included, so a first visit reads that
// round, shows it as the latest, walks backward for the day's rounds and
// forward for whatever landed since. While the server's last event is a
// round in progress or a failed one (no transaction in it), Alice's Worker
// supplies the newest round it has seen instead (anchors.ts). The seed in
// the code is the fallback when neither answers and nothing is known yet.

import { SettlementRegistry, defaultStorage, type ChainReader, type HistoryResult, type KVStorage, type PassResult } from './arkade-onchain.ts';
import { fetchExplorerAnchors, type ExplorerAnchor } from './anchors.ts';
import { BarkError, fetchBarkVtxo, getBarkLastRoundEvent } from './bark.ts';
import { decodeBarkVtxo, vtxoIdBytes, type BarkVtxo } from './bark-vtxo.ts';
import { largestOutputs, loadFrontier as loadStoredFrontier, saveFrontier as saveStoredFrontier, walkWalletBackward, walkWalletForward, type Outpoint, type StoredFrontier, type WalletBackwardResult, type WalletWalkResult } from './wallet-walk.ts';
import type { NormalizedTransaction } from './types.ts';
import type { RequestOptions } from './provider.ts';

export type { Outpoint } from './wallet-walk.ts';

// A real round of Second's mainnet server (block 970,455, 7 October 2026),
// identified from its tree root: the fallback start when the server's latest
// round cannot be had and nothing is known yet.
export const SEED_BARK_ROUND_TXID = 'b111410f794a760681547ff3ae3c80c6ebfaed71dc3bdad95c704d6ef7f6fb9f';

// Bumped on 2026-10-11 with the oracle: the earlier one took exit tree
// transactions for rounds, and the registries built with it hold them.
const REGISTRY_KEY = 'alice_bark_rounds_v3';
const FRONTIER_KEY = 'alice_bark_frontier_v2';

// Below this, an output is a user's payout or dust, not the server's working
// capital: the smallest board the server accepts is 49,000 sats, and its own
// change and consolidations run from hundreds of thousands to millions.
export const MIN_FOLLOW_SATS = 100_000;
// At most this many outputs of one transaction are followed (the largest).
const MAX_FOLLOW_PER_TX = 3;

/** The rounds this browser has identified, with their confirmation. */
export const barkRoundRegistry = new SettlementRegistry(undefined, REGISTRY_KEY);

/** Record a round announced by the live stream (height still unknown). */
export function noteSeenBarkRound(txid: string): void {
  if (/^[0-9a-f]{64}$/i.test(txid)) barkRoundRegistry.add({ txid: txid.toLowerCase() });
}

// How many outputs of a candidate are asked about before concluding it is
// not a round: a round transaction carries its tree root and its change, in
// either order, so the root sits in the first two; a third covers a
// connector or a second change, at one more request per non-round.
const ROOT_VOUTS = 3;

/**
 * The tree root of a round, when the transaction is one: the server answers
 * the root's id ("txid:vout", the root being among the first outputs) with
 * a VTXO anchored on this very transaction, `anchor.vout` saying which
 * output it is. Null for any other transaction: an id the server does not
 * know, or an output that is a VTXO anchored elsewhere (a tree transaction
 * broadcast on-chain by a holder leaving, anchored on its round; a boarding
 * transaction's output, anchored on itself but with a holder's policy, is
 * still refused through the genesis check). Network failures propagate.
 */
export async function getBarkRoundRoot(serverUrl: string, txid: string, opts: { signal?: AbortSignal } = {}): Promise<BarkVtxo | null> {
  const clean = txid.toLowerCase();
  for (let vout = 0; vout < ROOT_VOUTS; vout++) {
    let data: Uint8Array;
    try {
      data = await fetchBarkVtxo(serverUrl, vtxoIdBytes({ txid: clean, vout }), opts);
    } catch (e) {
      if (e instanceof BarkError && e.status === 5) continue;
      throw e;
    }
    let v: BarkVtxo;
    try {
      v = decodeBarkVtxo(data);
    } catch {
      // An encoding this build cannot read is not claimed as a round.
      return null;
    }
    // A VTXO anchored elsewhere: this transaction is a branch of some round's
    // tree, broadcast on-chain, not a round. Known once, decided.
    if (v.anchor.txid.toLowerCase() !== clean) return null;
    // The root is the server's expiry-policed node; a holder's coin sitting
    // directly on-chain is a board, not a round.
    return v.policy.kind === 'expiry' && v.genesis.length === 0 ? v : null;
  }
  return null;
}

/** Answers whether a txid is a round. */
export type RoundProbe = (txid: string, signal?: AbortSignal) => Promise<boolean>;

/** The default probe: ask the server for the tree root. Non-rounds are
 *  remembered so a txid is never re-asked within a pass. */
export function makeBarkRoundProbe(serverUrl: string, negatives: Set<string> = new Set()): RoundProbe {
  return async (txid, signal) => {
    if (barkRoundRegistry.has(txid)) return true;
    if (negatives.has(txid)) return false;
    const root = await getBarkRoundRoot(serverUrl, txid, { signal });
    if (!root) { negatives.add(txid); return false; }
    return true;
  };
}

const BULK: RequestOptions['priority'] = 'bulk';

function record(tx: NormalizedTransaction): void {
  barkRoundRegistry.add({
    txid: tx.txid,
    height: tx.status.confirmed ? tx.status.blockHeight : undefined,
    timestamp: tx.status.confirmed ? tx.status.blockTime : undefined,
  });
}

/** Fetch a round's confirmation and record it. */
async function recordRound(chain: ChainReader, txid: string, signal?: AbortSignal): Promise<NormalizedTransaction> {
  const tx = await chain.getTransaction(txid, { signal, priority: BULK });
  record(tx);
  return tx;
}

/** The outputs of a transaction worth following: the largest ones above the
 *  floor. A round's tree root counts too: once the tree expires the server
 *  sweeps whatever is left in it, and the sweep funds later rounds (the round
 *  of 11 October 2026 was funded from the swept leaves of the 6 October one),
 *  so the root leads on to them through the branches a holder broadcast. The
 *  flag is kept for callers that know the transaction is a round. */
export function followableOutputs(tx: NormalizedTransaction, _isRound: boolean): Outpoint[] {
  return largestOutputs(tx, MIN_FOLLOW_SATS, MAX_FOLLOW_PER_TX);
}

export type BarkWalkResult = WalletWalkResult;

/**
 * Walk the server wallet's spend graph forward from the given outputs: each
 * spent output leads to its spender, which is asked about (a round or not)
 * and whose larger outputs join the queue; an unspent output stays in the
 * frontier. Breadth-first, so the hop budget spreads over every branch.
 */
export function walkBarkRoundsForward(
  chain: ChainReader,
  probe: RoundProbe,
  start: Outpoint[],
  opts: { signal?: AbortSignal; maxHops?: number; maxFrontier?: number } = {},
): Promise<BarkWalkResult> {
  return walkWalletForward(chain, { probe, follow: followableOutputs, record }, start, opts);
}

/**
 * Walk the server's wallet BACKWARD from a known round into history, through
 * the payouts, consolidations and swept tree branches between two rounds
 * (Second's wallet does several of them per round: one round of October
 * 2026 was funded five transactions after the previous one, hence the deeper
 * wallet-hop allowance). Each round passed learns its predecessor, so the
 * registry knows which stretch of history is complete.
 */
export function walkBarkRoundsBackward(
  chain: ChainReader,
  probe: RoundProbe,
  fromTxid: string,
  opts: { signal?: AbortSignal; maxHops?: number; maxWalletHops?: number } = {},
): Promise<WalletBackwardResult> {
  return walkWalletBackward(chain, {
    probe,
    record,
    known: txid => barkRoundRegistry.has(txid),
    link: (txid, prev) => barkRoundRegistry.link(txid, prev),
  }, fromTxid, { maxWalletHops: 8, ...opts });
}

export function loadFrontier(storage: KVStorage | null): StoredFrontier | null {
  return loadStoredFrontier(storage, FRONTIER_KEY);
}

export function saveFrontier(storage: KVStorage | null, frontier: StoredFrontier): void {
  saveStoredFrontier(storage, FRONTIER_KEY, frontier);
}

function newestConfirmed(): { txid: string; height: number } | null {
  let best: { txid: string; height: number } | null = null;
  for (const s of barkRoundRegistry.all()) {
    if (s.height !== undefined && (!best || s.height > best.height)) best = { txid: s.txid, height: s.height };
  }
  return best;
}

/** How many rounds under the newest a pass makes sure it knows: a day of
 *  Second's hourly rounds, shown on a first visit without being asked. */
export const HISTORY_FIRST = 24;
/** How many older rounds one "load older" request fetches. */
export const HISTORY_PAGE = 25;
// The hop budget of the forward walk that fills in the rounds between two
// backward finds (see arkade-onchain.ts).
const FILL_HOPS = 24;

/** Extend the known history under the newest round, in pages from the end
 *  of the newest's run, while `remaining` asks for more (see arkade-onchain.ts). */
async function extendHistory(chain: ChainReader, probe: RoundProbe, remaining: (found: number) => number, signal?: AbortSignal): Promise<HistoryResult> {
  let found = 0;
  let origin = false;
  let interrupted = false;
  let oldestFound: string | null = null;
  for (let i = 0; i < 4; i++) {
    const want = remaining(found);
    if (want <= 0) break;
    const newest = newestConfirmed();
    if (!newest) break;
    const end = barkRoundRegistry.runEnd(newest.txid);
    if (end.origin) { origin = true; break; }
    const res = await walkBarkRoundsBackward(chain, probe, end.txid, { signal, maxHops: want });
    found += res.found.length;
    if (res.found.length > 0) oldestFound = res.found[res.found.length - 1];
    origin = res.origin;
    interrupted = res.interrupted;
    if (interrupted || origin) break;
    if (barkRoundRegistry.runEnd(newest.txid).txid === end.txid) break;
  }
  // The backward walk follows one input per hop and skips the rounds the
  // server funded from other coins in between (a round of October 2026 was
  // funded by a sweep of an older tree, five hops from the previous round).
  // Walking forward from the oldest round found fills them in: its change
  // leads through every later round on its line. Best effort.
  if (oldestFound) {
    try {
      const tx = await chain.getTransaction(oldestFound, { signal, priority: BULK });
      const before = new Set(barkRoundRegistry.all().map(s => s.txid));
      const fill = await walkBarkRoundsForward(chain, probe, followableOutputs(tx, true), { signal, maxHops: FILL_HOPS, maxFrontier: 0 });
      found += fill.found.filter(t => !before.has(t)).length;
    } catch { /* the page stands without the fill */ }
  }
  return { found, origin, interrupted };
}

/** The default source of the latest round: the server's LastRoundEvent, when
 *  its last event is a finished round. */
async function serverLastRound(serverUrl: string, signal?: AbortSignal): Promise<string | null> {
  const e = await getBarkLastRoundEvent(serverUrl, { signal });
  return e.kind === 'finished' && e.txid ? e.txid : null;
}

/** The default source of the Worker's anchor: the published bark one. */
async function publishedBarkAnchor(signal?: AbortSignal): Promise<ExplorerAnchor | null> {
  const anchors = await fetchExplorerAnchors({ signal });
  return anchors?.bark ?? null;
}

/**
 * One update pass, as the Explorer runs it. Ask the server for its latest
 * finished round and record it; fall back to the seed in the code only when
 * nothing at all is known. Resolve the heights the live stream left unknown,
 * walk forward from the stored frontier (or from the newest round's outputs
 * when a newer round appeared since the frontier was saved), then make sure
 * the day's rounds under the newest are known (HISTORY_FIRST deep). Older
 * history is fetched on request (loadOlderBarkRounds). Each step tolerates
 * failure independently.
 */
export async function updateBarkRounds(
  chain: ChainReader,
  serverUrl: string,
  opts: {
    signal?: AbortSignal; storage?: KVStorage | null; maxHops?: number;
    /** How deep under the newest the pass fills history; HISTORY_FIRST by default. */
    historyDepth?: number;
    probe?: RoundProbe;
    /** Where the latest round comes from; the server by default, null for none. */
    lastRound?: (signal?: AbortSignal) => Promise<string | null>;
    /** Where the Worker's anchor comes from; the Worker by default, null for none. */
    anchor?: (signal?: AbortSignal) => Promise<ExplorerAnchor | null>;
  } = {},
): Promise<PassResult> {
  const { signal, maxHops, historyDepth = HISTORY_FIRST } = opts;
  const storage = opts.storage === undefined ? defaultStorage() : opts.storage;
  await storage?.ready?.();
  // The registries of the earlier oracle (see REGISTRY_KEY) are not read;
  // drop them rather than leave them in the vault for good.
  for (const stale of ['alice_bark_rounds_v2', 'alice_bark_frontier_v1']) {
    try { storage?.removeItem(stale); } catch { /* read-only storage */ }
  }
  const probe = opts.probe ?? makeBarkRoundProbe(serverUrl);

  // The latest round: the server's, when its last event is a finished round
  // (it may still be in the mempool), and the Worker's anchor, its last
  // sighting of a confirmed one, height included. Both are recorded.
  let latest: string | null = null;
  try { latest = await (opts.lastRound ?? (sig => serverLastRound(serverUrl, sig)))(signal); } catch { latest = null; }
  if (latest && /^[0-9a-f]{64}$/i.test(latest)) barkRoundRegistry.add({ txid: latest.toLowerCase() });
  let anchor: ExplorerAnchor | null = null;
  try { anchor = await (opts.anchor ?? publishedBarkAnchor)(signal); } catch { anchor = null; }
  if (anchor) barkRoundRegistry.add({ txid: anchor.txid, height: anchor.height, timestamp: anchor.timestamp });

  const resolveHeights = async () => {
    for (const s of barkRoundRegistry.all().filter(x => x.height === undefined).slice(0, 10)) {
      try { await recordRound(chain, s.txid, signal); } catch { /* later pass */ }
    }
  };
  await resolveHeights();
  // Nothing confirmed to walk from (a first visit while the latest round is
  // still in the mempool, or no answer at all): the seed in the code.
  if (!newestConfirmed() && !barkRoundRegistry.has(SEED_BARK_ROUND_TXID)) {
    barkRoundRegistry.add({ txid: SEED_BARK_ROUND_TXID });
    await resolveHeights();
  }

  const newest = newestConfirmed();
  if (!newest) return { atTip: false, interrupted: true };
  const stored = loadFrontier(storage);
  let start: Outpoint[];
  if (stored && stored.base === newest.txid && stored.outpoints.length > 0) {
    start = stored.outpoints;
  } else {
    try {
      const tx = await chain.getTransaction(newest.txid, { signal, priority: BULK });
      start = followableOutputs(tx, true);
    } catch {
      return { atTip: false, interrupted: true };
    }
  }
  let atTip = true;
  if (start.length > 0) {
    const result = await walkBarkRoundsForward(chain, probe, start, { signal, maxHops });
    if (result.interrupted) return { atTip: false, interrupted: true };
    atTip = !result.exhausted;
    const base = newestConfirmed() ?? newest;
    saveFrontier(storage, { base: base.txid, outpoints: result.frontier });
  }

  const head = newestConfirmed() ?? newest;
  await extendHistory(chain, probe, () => historyDepth - barkRoundRegistry.run(head.txid).length, signal);
  return { atTip, interrupted: false };
}

/** Fetch a page of older rounds on request ("load older"). */
export async function loadOlderBarkRounds(
  chain: ChainReader,
  serverUrl: string,
  opts: { signal?: AbortSignal; count?: number; probe?: RoundProbe } = {},
): Promise<HistoryResult> {
  const probe = opts.probe ?? makeBarkRoundProbe(serverUrl);
  const count = opts.count ?? HISTORY_PAGE;
  return extendHistory(chain, probe, found => count - found, opts.signal);
}
