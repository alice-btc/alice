// The Explorer's settlement anchors: where the newest Arkade commitment
// transaction and the newest Bark round stand.
//
// Arkade's operator publishes no list of its commitment transactions, and
// nothing on-chain says "Arkade"; the only oracle is its indexer, which
// answers "is this txid a commitment?". So a browser opening the Explorer
// would have to walk the operator's wallet forward from a seed written in the
// app, months long once that seed has aged. This Worker does the walk once for
// everyone, every ten minutes (ANCHOR_CRON), and publishes where it stands:
// the newest confirmed commitment and its height. Browsers read that first
// (GET /explorer/anchors), show it as the latest, and walk backward for the
// recent history and forward for the little that landed since.
//
// The walk is the client's (apps/app-web/src/lib/explorer/wallet-walk.ts),
// kept in step with it: from the outputs of a known commitment, follow each
// output to the transaction spending it, ask the indexer about that
// transaction, and go on through its larger outputs whether or not it was a
// commitment (a consolidation or a sweep between two commitments is crossed,
// not a dead end). The unspent outputs reached are the frontier the next run
// resumes from. Public data about a public wallet: no user is involved, and
// the only database touched is the entity one.
//
// The walk only finds a commitment funded from one it already knows. When
// the operator funds one from coins that came from elsewhere, or parks its
// change in a batch output that stays put for weeks (as in October 2026),
// the trail ends and the anchor stands still. So after its walk, each run
// listens to the operator's live stream (GET /v1/txs), which announces every
// commitment as it is finalized but keeps no history, until the next run is
// due. A commitment heard there is kept as a candidate until the chain
// confirms it, then adopted: the anchor if it is the newest, and its outputs
// join the frontier so the walk goes on from it.
//
// Bark needs no walk: Second's server answers LastRoundEvent with its latest
// finished round, signed transaction included, so the Worker just keeps the
// newest one it has seen with its confirmation. The app asks the server
// itself first and falls back to this anchor when the server's last event is
// a round in progress or a failed one, which carries no transaction.

import { sha256 } from '@noble/hashes/sha2.js';
import type { Env } from './index.ts';

/** Esplora-compatible chain APIs the walk reads from, in order: a request
 *  that fails or times out on one is retried on the next. mempool.space is
 *  the reference; the second is the instance Arkade runs for its own
 *  explorer, which answers the same questions about the same chain. */
export const ESPLORA_API_URLS: readonly string[] = ['https://mempool.space/api', 'https://mempool.arkade.sh/api'];
/** The first of ESPLORA_API_URLS, kept for callers that name one host. */
export const ESPLORA_API_URL = ESPLORA_API_URLS[0];
/** The Arkade operator's public gateway (CORS-open, the app reads it too). */
export const ARKADE_API_URL = 'https://arkade.computer';
/** Second's Bark server, gRPC-web, no authentication for what is read here. */
export const BARK_SERVER_URL = 'https://ark.second.tech';
const BARK_SERVICE = 'bark_server.ArkService';
/** The cron expression that refreshes the anchor; the hourly one runs the
 *  Worker's other scheduled work. */
export const ANCHOR_CRON = '*/10 * * * *';
/** How long a run lives, walk and listening together, counted from its
 *  start: the next run is due at ten minutes, and a scheduled invocation
 *  may live fifteen. */
export const ANCHOR_RUN_MS = 9 * 60_000 + 30_000;
/** Pause before reopening the stream when it ends before the run is over. */
const STREAM_RECONNECT_MS = 2_000;
/** A candidate the chain has not confirmed after this long is dropped: a
 *  commitment the operator announced but never broadcast, or one replaced. */
const CANDIDATE_TTL_MS = 7 * 24 * 60 * 60_000;
/** How many requests a scheduled run may send in all. Cloudflare counts
 *  every fetch of an invocation against a limit, 50 on the Workers free
 *  plan, and past it each fetch fails at once: on 31 October 2026 the walk
 *  spent the whole limit, the stream could not open even once and the run
 *  reported 249 reconnections. The walk stops when only the reserve is
 *  left, which the listener and the candidates then spend. */
export const RUN_REQUEST_BUDGET = 45;
const STREAM_RESERVE = 10;

export class RequestBudget {
  left: number;
  constructor(left: number) { this.left = left; }
  /** Takes one request, or throws when no more than `reserve` would remain. */
  take(reserve = 0): void {
    if (this.left <= reserve) throw new LookupError('request budget spent');
    this.left--;
  }
}

// The same starting points as the app's registry: real commitments of the
// arkade.computer operator on mainnet, on three funding lines. Used once, to
// create the row; from then on the walk resumes from its own frontier.
const ARKADE_SEEDS: readonly string[] = [
  '086f74e380432214902bc8d7e24d3eb57ba97b9b36811cec10ee44e3c7bcf12b',
  '128e6a2ee6f5e875adb42da4daef729ca9011d6d80866c0561e6f4862b925a68',
  '1e27207377816e9e9fcd306253aaeaf659aed3adfcd37c4c53b0658f88328bf1',
];

// The app's thresholds (arkade-onchain.ts): below the floor an output is a
// connector, a payout or dust; the operator's change runs from tens of
// thousands of sats to millions.
const MIN_FOLLOW_SATS = 10_000;
const MAX_FOLLOW_PER_TX = 3;
// Per run: a run every ten minutes with this many hops catches up a day of
// the operator's activity in a couple of runs; the request budget above
// stops a run sooner when the hops cost more requests than it has.
const MAX_HOPS = 40;
const MAX_FRONTIER = 24;
// How many spenders that are NOT commitments the walk crosses in a row
// before letting a path go: a consolidation, then a sweep, is the most the
// operator's wallet puts between two commitments. Beyond that the coins have
// left for a user's or an exchange's wallet, whose spends never end: before
// this bound the walk wandered there, filled its frontier with them, and
// forgot the operator's own lines (the anchor stood still for weeks in
// October 2026 while the wallet went on).
const MAX_DRIFT = 2;
const TIMEOUT_MS = 12_000;

export type Anchor = { txid: string; height: number; timestamp: number };
export type Anchors = { arkade?: Anchor; bark?: Anchor; updatedAt?: number };

/** `drift`: spenders that were not commitments crossed since the last one
 *  (0 on a commitment's own outputs); absent on rows written before it. */
type Outpoint = { txid: string; vout: number; valueSats: number; drift?: number };

type EsploraTx = {
  txid: string;
  status: { confirmed: boolean; block_height?: number; block_time?: number };
  vout: { value: number }[];
};
type EsploraOutspend = { spent: boolean; txid?: string };

export type AnchorDeps = {
  fetch?: typeof fetch;
  now?: () => number;
  /** One Esplora host, or several tried in order; ESPLORA_API_URLS by default. */
  esploraUrl?: string | readonly string[];
  arkadeUrl?: string;
  barkUrl?: string;
  maxHops?: number;
  /** Pause before reopening the operator's stream; STREAM_RECONNECT_MS by default. */
  reconnectMs?: number;
  /** The run's request budget, shared by the walk, the listener and the
   *  candidates; unlimited when absent. */
  budget?: RequestBudget;
};

export type RefreshReport = {
  /** The anchor after the run, null when nothing could be established. */
  anchor: Anchor | null;
  /** Spenders explored this run. */
  hops: number;
  /** Commitments newly identified this run. */
  found: number;
  /** True when the run stopped on a failed lookup. What it had reached by
   *  then (the newest commitment, the outputs still to follow) is stored,
   *  so the next run resumes there instead of starting over. */
  interrupted: boolean;
  /** The lookup that failed, as host and kind, for the technical log. */
  failure?: string;
};

export type StreamReport = {
  /** Commitments announced on the stream this run. */
  heard: number;
  /** Candidates confirmed on the chain and adopted this run, heard now or earlier. */
  adopted: number;
  /** Times the stream ended or failed before the run was over and was reopened. */
  reconnects: number;
  /** The last failure to open or read the stream, as host and kind. */
  failure?: string;
};

type Row = { network: string; txid: string; height: number; timestamp: number; frontier: string; updated_at: number };

const TXID = /^[0-9a-f]{64}$/;

/** The anchors to publish: one per network with a row, plus when they were
 *  last refreshed. Empty without the entity database. */
export async function readAnchors(env: Env): Promise<Anchors> {
  if (!env.ENTITY_DB) return {};
  let rows: Row[] = [];
  try {
    const res = await env.ENTITY_DB.prepare('SELECT network, txid, height, timestamp, frontier, updated_at FROM explorer_anchors').all<Row>();
    rows = res.results ?? [];
  } catch {
    // The table may not exist yet (migration pending): publish nothing.
    return {};
  }
  const out: Anchors = {};
  let updatedAt = 0;
  for (const r of rows) {
    if (!TXID.test(r.txid) || !Number.isInteger(r.height) || r.height <= 0) continue;
    const anchor: Anchor = { txid: r.txid, height: r.height, timestamp: r.timestamp };
    if (r.network === 'arkade') out.arkade = anchor;
    else if (r.network === 'bark') out.bark = anchor;
    if (r.updated_at > updatedAt) updatedAt = r.updated_at;
  }
  if (updatedAt > 0) out.updatedAt = updatedAt;
  return out;
}

class LookupError extends Error {
  /** Host and kind of the failed lookup, never a txid: what the log may say. */
  readonly failure: string;
  constructor(failure: string) {
    super(failure);
    this.failure = failure;
  }
}

function hostOf(url: string): string {
  try { return new URL(url).host; } catch { return 'unknown host'; }
}

async function getJson(f: typeof fetch, url: string, budget?: RequestBudget, reserve = 0): Promise<{ status: number; body: unknown }> {
  budget?.take(reserve);
  let res: Response;
  try {
    res = await f(url, { method: 'GET', signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    const kind = err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'unreachable';
    throw new LookupError(`${hostOf(url)} ${kind}`);
  }
  let body: unknown = null;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

/** The same Esplora path on each host in turn; the last failure propagates. */
async function getEsploraJson(f: typeof fetch, bases: readonly string[], path: string, budget?: RequestBudget, reserve = 0): Promise<{ status: number; body: unknown; host: string }> {
  let last: LookupError | null = null;
  for (const base of bases) {
    try {
      const { status, body } = await getJson(f, `${base}${path}`, budget, reserve);
      if (status === 200) return { status, body, host: hostOf(base) };
      last = new LookupError(`${hostOf(base)} answered ${status}`);
    } catch (err) {
      if (!(err instanceof LookupError)) throw err;
      last = err;
    }
  }
  throw last ?? new LookupError('no esplora host');
}

function esploraBases(deps: AnchorDeps): readonly string[] {
  const given = deps.esploraUrl;
  const list = given === undefined ? ESPLORA_API_URLS : typeof given === 'string' ? [given] : given;
  return list.map(u => u.replace(/\/+$/, ''));
}

function largestOutputs(tx: EsploraTx, drift = 0): Outpoint[] {
  return tx.vout
    .map((o, index): Outpoint => (drift > 0 ? { txid: tx.txid, vout: index, valueSats: o.value, drift } : { txid: tx.txid, vout: index, valueSats: o.value }))
    .filter(o => o.valueSats >= MIN_FOLLOW_SATS)
    .sort((a, b) => b.valueSats - a.valueSats)
    .slice(0, MAX_FOLLOW_PER_TX);
}

/** One entry per output, the lowest drift kept (the later one on a tie, which
 *  the cap forgets last): an output reached twice, by two paths or once more
 *  than its stored copy, would otherwise take two places, and copies piling
 *  up run after run pushed the other lines' outputs out of the cap. */
function uniqueOutpoints(list: Outpoint[]): Outpoint[] {
  const kept = new Map<string, Outpoint>();
  for (const o of list) {
    const key = `${o.txid}:${o.vout}`;
    const prev = kept.get(key);
    if (!prev || (o.drift ?? 0) <= (prev.drift ?? 0)) kept.set(key, o);
  }
  return list.filter(o => {
    const key = `${o.txid}:${o.vout}`;
    if (kept.get(key) !== o) return false;
    kept.delete(key);
    return true;
  });
}

function parseFrontier(raw: string): Outpoint[] {
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((o): o is Outpoint =>
      typeof o === 'object' && o !== null
      && typeof (o as Outpoint).txid === 'string' && TXID.test((o as Outpoint).txid)
      && Number.isInteger((o as Outpoint).vout) && (o as Outpoint).vout >= 0
      && typeof (o as Outpoint).valueSats === 'number'
      && ((o as Outpoint).drift === undefined || Number.isInteger((o as Outpoint).drift)));
  } catch {
    return [];
  }
}

/** The three questions the walk and the stream listener ask the chain and
 *  the indexer. The indexer answers a commitment with its round, and anything
 *  else with "batch not found"; any other answer is a failure, never "not
 *  one". */
function chainLookups(f: typeof fetch, esplora: readonly string[], arkade: string, budget?: RequestBudget, reserve = 0) {
  const getTx = async (txid: string): Promise<EsploraTx> => {
    const { body, host } = await getEsploraJson(f, esplora, `/tx/${txid}`, budget, reserve);
    const tx = body as EsploraTx | null;
    if (!tx || !Array.isArray(tx.vout) || typeof tx.status !== 'object') throw new LookupError(`${host} malformed tx`);
    return tx;
  };
  const getOutspends = async (txid: string): Promise<EsploraOutspend[]> => {
    const { body, host } = await getEsploraJson(f, esplora, `/tx/${txid}/outspends`, budget, reserve);
    if (!Array.isArray(body)) throw new LookupError(`${host} malformed outspends`);
    return body as EsploraOutspend[];
  };
  const negatives = new Set<string>();
  const isCommitment = async (txid: string): Promise<boolean> => {
    if (negatives.has(txid)) return false;
    const { status, body } = await getJson(f, `${arkade}/v1/indexer/commitmentTx/${txid}`, budget, reserve);
    if (status === 200) return true;
    const message = typeof body === 'object' && body !== null ? String((body as { message?: unknown }).message ?? '') : '';
    if (/not found/i.test(message)) { negatives.add(txid); return false; }
    throw new LookupError(`${hostOf(arkade)} indexer answered ${status}`);
  };
  return { getTx, getOutspends, isCommitment };
}

/**
 * One refresh of the Arkade anchor: resume the walk from the stored frontier
 * (or start it from the seeds), follow the operator's wallet forward for up
 * to `maxHops` spenders, and store the newest confirmed commitment reached
 * with the new frontier. A failed lookup ends the run without touching the
 * row: the next run retries from the same point.
 */
export async function refreshArkadeAnchor(env: Env, deps: AnchorDeps = {}): Promise<RefreshReport> {
  const none: RefreshReport = { anchor: null, hops: 0, found: 0, interrupted: false };
  if (!env.ENTITY_DB) return none;
  const f = deps.fetch ?? fetch;
  const esplora = esploraBases(deps);
  const arkade = (deps.arkadeUrl ?? ARKADE_API_URL).replace(/\/+$/, '');
  const maxHops = deps.maxHops ?? MAX_HOPS;
  const { getTx, getOutspends, isCommitment } = chainLookups(f, esplora, arkade, deps.budget, STREAM_RESERVE);

  let row: Row | null = null;
  try {
    row = await env.ENTITY_DB.prepare('SELECT network, txid, height, timestamp, frontier, updated_at FROM explorer_anchors WHERE network = ?')
      .bind('arkade').first<Row>();
  } catch {
    return none;
  }

  let newest: Anchor | null = row && TXID.test(row.txid) ? { txid: row.txid, height: row.height, timestamp: row.timestamp } : null;
  const start: Outpoint[] = row ? parseFrontier(row.frontier) : [];
  let hops = 0;
  let found = 0;
  const consider = (tx: EsploraTx) => {
    if (!tx.status.confirmed || typeof tx.status.block_height !== 'number') return;
    if (!newest || tx.status.block_height > newest.height) {
      newest = { txid: tx.txid, height: tx.status.block_height, timestamp: tx.status.block_time ?? 0 };
    }
  };
  // The outputs still to follow and the unspent ones reached: together, where
  // the next run resumes, whether this one finishes or is cut short.
  const queue: Outpoint[] = [...start];
  const frontier: Outpoint[] = [];
  let failure: string | undefined;

  try {
    if (!row) {
      // First run: the seeds give the newest confirmed commitment and the
      // outputs to watch on every funding line.
      for (const seed of ARKADE_SEEDS) {
        const tx = await getTx(seed);
        consider(tx);
        queue.push(...largestOutputs(tx));
      }
    }
    // The newest commitment's own outputs are watched every run, whatever
    // the stored frontier holds: its change is where the wallet spends next,
    // and a frontier that lost it (a detour, an older row) heals here.
    if (newest && !queue.some(o => o.txid === newest!.txid)) {
      queue.push(...largestOutputs(await getTx(newest.txid)));
    }
    const explored = new Set<string>();
    // The transactions whose outputs the run starts from were explored
    // before, with the lowest drift they were reached at. One reached again
    // (the newest commitment's change all spent by a transaction that is not
    // a commitment, whose outputs the frontier already holds) is explored
    // anew only through a path with less drift, which would follow further.
    const reached = new Map<string, number>();
    for (const o of queue) reached.set(o.txid, Math.min(reached.get(o.txid) ?? Infinity, o.drift ?? 0));
    const outspendsByTxid = new Map<string, EsploraOutspend[]>();
    while (queue.length > 0) {
      const op = queue[0];
      let outspends = outspendsByTxid.get(op.txid);
      if (!outspends) {
        outspends = await getOutspends(op.txid);
        outspendsByTxid.set(op.txid, outspends);
      }
      const spend = outspends[op.vout];
      if (!spend?.spent || !spend.txid || !TXID.test(spend.txid)) { queue.shift(); frontier.push(op); continue; }
      if (explored.has(spend.txid)) { queue.shift(); continue; }
      if ((reached.get(spend.txid) ?? Infinity) <= (op.drift ?? 0) + 1) { queue.shift(); continue; }
      if (hops >= maxHops) { queue.shift(); frontier.push(op); continue; }
      const tx = await getTx(spend.txid);
      const hit = await isCommitment(tx.txid);
      // The hop counts once its lookups are all in: a failure above leaves
      // the output queued for the next run.
      queue.shift();
      explored.add(spend.txid);
      hops++;
      if (hit) { consider(tx); found++; }
      const drift = hit ? 0 : (op.drift ?? 0) + 1;
      if (drift <= MAX_DRIFT) queue.push(...largestOutputs(tx, drift));
    }
  } catch (err) {
    if (!(err instanceof LookupError)) throw err;
    failure = err.failure;
  }

  const report = (anchor: Anchor | null): RefreshReport =>
    failure === undefined ? { anchor, hops, found, interrupted: false } : { anchor, hops, found, interrupted: true, failure };
  if (!newest) return report(null);
  // What to resume from: the unspent outputs reached, then whatever is still
  // queued (a run cut short keeps its unexplored outputs), newest last, each
  // output once. The cap forgets from the front, so outputs reached through
  // a detour go before the commitments' own.
  const drifted = frontier.filter(o => (o.drift ?? 0) > 0);
  const own = frontier.filter(o => !(o.drift ?? 0));
  const resume = uniqueOutpoints([...drifted, ...own, ...queue]).slice(-MAX_FRONTIER);
  await storeAnchor(env, 'arkade', newest, resume, (deps.now ?? Date.now)());
  return report(newest);
}

async function storeAnchor(env: Env, network: 'arkade' | 'bark', anchor: Anchor, frontier: Outpoint[], now: number): Promise<void> {
  await env.ENTITY_DB!.prepare(
    `INSERT INTO explorer_anchors (network, txid, height, timestamp, frontier, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(network) DO UPDATE SET txid = excluded.txid, height = excluded.height,
       timestamp = excluded.timestamp, frontier = excluded.frontier, updated_at = excluded.updated_at`,
  ).bind(network, anchor.txid, anchor.height, anchor.timestamp, JSON.stringify(frontier), now).run();
}

/* ------------------------- The operator's stream ------------------------- */

/**
 * The txid of the commitment a line of the operator's stream announces, or
 * null for anything else: a keep-alive, an Ark transaction, a malformed line.
 * grpc-gateway sends one JSON object per line, wrapped as { result: <event> };
 * a proxy serving it as SSE would prefix it with "data:". The same reading as
 * the app's (lib/explorer/arkade.ts, subscribeSettlements).
 */
export function commitmentTxidFromLine(line: string): string | null {
  const text = line.startsWith('data:') ? line.slice(5).trim() : line.trim();
  if (!text) return null;
  let obj: unknown;
  try { obj = JSON.parse(text); } catch { return null; }
  const msg = typeof obj === 'object' && obj !== null && 'result' in obj ? (obj as { result: unknown }).result : obj;
  const c = typeof msg === 'object' && msg !== null ? (msg as { commitmentTx?: unknown }).commitmentTx : undefined;
  const txid = typeof c === 'object' && c !== null ? (c as { txid?: unknown }).txid : undefined;
  return typeof txid === 'string' && TXID.test(txid) ? txid : null;
}

async function readLines(body: ReadableStream<Uint8Array>, onLine: (line: string) => Promise<void>): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      await onLine(line);
    }
  }
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * A confirmed commitment becomes the anchor when it is newer than the stored
 * one, and its larger outputs join the frontier either way, so the walk
 * follows the operator's wallet from it too. An unconfirmed transaction
 * changes nothing. True when the row was written.
 */
async function adoptCommitment(env: Env, tx: EsploraTx, now: number): Promise<boolean> {
  if (!tx.status.confirmed || typeof tx.status.block_height !== 'number') return false;
  const row = await env.ENTITY_DB!.prepare('SELECT network, txid, height, timestamp, frontier, updated_at FROM explorer_anchors WHERE network = ?')
    .bind('arkade').first<Row>();
  const stored: Anchor | null = row && TXID.test(row.txid) ? { txid: row.txid, height: row.height, timestamp: row.timestamp } : null;
  const anchor: Anchor = !stored || tx.status.block_height > stored.height
    ? { txid: tx.txid, height: tx.status.block_height, timestamp: tx.status.block_time ?? 0 }
    : stored;
  // The commitment's own outputs go last, where the cap forgets last.
  const frontier = uniqueOutpoints([...(row ? parseFrontier(row.frontier) : []), ...largestOutputs(tx)]).slice(-MAX_FRONTIER);
  await storeAnchor(env, 'arkade', anchor, frontier, now);
  return true;
}

/**
 * The candidates the chain has confirmed since they were heard are adopted
 * and forgotten; the stale ones are forgotten. One the chain does not know
 * yet (not broadcast, or not in this host's mempool) waits. A failed lookup
 * leaves the rest for the next run.
 */
export async function settleCandidates(env: Env, deps: AnchorDeps = {}): Promise<{ adopted: number; failure?: string }> {
  if (!env.ENTITY_DB) return { adopted: 0 };
  const now = (deps.now ?? Date.now)();
  const arkade = (deps.arkadeUrl ?? ARKADE_API_URL).replace(/\/+$/, '');
  const { getTx, isCommitment } = chainLookups(deps.fetch ?? fetch, esploraBases(deps), arkade, deps.budget);
  let rows: { txid: string; seen_at: number }[] = [];
  try {
    const res = await env.ENTITY_DB.prepare('SELECT txid, seen_at FROM explorer_candidates WHERE network = ?').bind('arkade').all<{ txid: string; seen_at: number }>();
    rows = res.results ?? [];
  } catch {
    // The table may not exist yet (migration pending).
    return { adopted: 0 };
  }
  const forget = (txid: string) => env.ENTITY_DB!.prepare('DELETE FROM explorer_candidates WHERE network = ? AND txid = ?').bind('arkade', txid).run();
  let adopted = 0;
  for (const c of rows) {
    if (!TXID.test(c.txid) || now - c.seen_at > CANDIDATE_TTL_MS) { await forget(c.txid); continue; }
    try {
      const tx = await getTx(c.txid);
      if (!tx.status.confirmed) continue;
      // Confirmed, yet the indexer does not know it as a commitment: not one.
      if (!(await isCommitment(tx.txid))) { await forget(c.txid); continue; }
      if (await adoptCommitment(env, tx, now)) adopted++;
      await forget(c.txid);
    } catch (err) {
      if (!(err instanceof LookupError)) throw err;
      if (/answered 404$/.test(err.failure)) continue;
      return { adopted, failure: err.failure };
    }
  }
  return { adopted };
}

/**
 * Listen to the operator's stream until `deadline` (a time as Date.now gives
 * it), remembering every commitment announced as a candidate; the candidates
 * are settled before and after, so one confirmed during the run is adopted
 * in the same run. A stream ends now and then without an event (the operator
 * closes it, or the proxy in front of it times out): the listener reopens it
 * after a pause, and after a failure too, until the deadline. Reaching the
 * deadline is the normal end, not a failure.
 */
export async function listenArkadeStream(env: Env, deadline: number, deps: AnchorDeps = {}): Promise<StreamReport> {
  const report: StreamReport = { heard: 0, adopted: 0, reconnects: 0 };
  if (!env.ENTITY_DB) return report;
  const f = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const arkade = (deps.arkadeUrl ?? ARKADE_API_URL).replace(/\/+$/, '');
  const pause = deps.reconnectMs ?? STREAM_RECONNECT_MS;
  const settle = async () => {
    const settled = await settleCandidates(env, deps);
    report.adopted += settled.adopted;
    if (settled.failure) report.failure = settled.failure;
  };
  await settle();
  const heard = new Set<string>();
  const remember = async (line: string) => {
    const txid = commitmentTxidFromLine(line);
    if (!txid || heard.has(txid)) return;
    heard.add(txid);
    report.heard++;
    try {
      await env.ENTITY_DB!.prepare('INSERT OR IGNORE INTO explorer_candidates (network, txid, seen_at) VALUES (?, ?, ?)').bind('arkade', txid, now()).run();
    } catch {
      report.failure = 'candidate not stored';
    }
  };
  let first = true;
  // A stream that fails as soon as it is opened, three times in a row, is
  // not coming back this run: the request budget is spent, or the host is
  // refusing. Reopening it every two seconds until the deadline would only
  // burn requests.
  let fastFailures = 0;
  while (now() < deadline) {
    if (!first) {
      report.reconnects++;
      await sleep(Math.min(pause, Math.max(0, deadline - now())));
      if (now() >= deadline) break;
    }
    first = false;
    try {
      deps.budget?.take();
    } catch {
      report.failure = 'request budget spent';
      break;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.max(0, deadline - now()));
    const opened = now();
    try {
      const res = await f(`${arkade}/v1/txs`, { headers: { Accept: 'text/event-stream' }, signal: controller.signal });
      // The operator's host sits behind Cloudflare, which gives up on an
      // answer whose headers have not come after its origin timeout; when
      // the gateway holds them back until a first event, a quiet stretch
      // ends in a 524. No failure, just a stream to reopen.
      if (res.status === 524) continue;
      if (res.status !== 200 || !res.body) {
        report.failure = `${hostOf(arkade)} stream answered ${res.status}`;
        continue;
      }
      await readLines(res.body, remember);
      fastFailures = 0;
    } catch (err) {
      if (controller.signal.aborted) break;
      const why = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      report.failure = `${hostOf(arkade)} stream unreachable (${why.slice(0, 120)})`;
      if (now() - opened < 1_000 && ++fastFailures >= 3) break;
    } finally {
      clearTimeout(timer);
    }
  }
  await settle();
  return report;
}

/* --------------------------------- Bark ---------------------------------- */

const TX_TIMEOUT_MS = 10_000;

function bytesToHex(b: Uint8Array): string {
  let out = '';
  for (const x of b) out += x.toString(16).padStart(2, '0');
  return out;
}

/**
 * The txid of a serialized Bitcoin transaction: double SHA-256 of the
 * serialization WITHOUT the segwit marker, flag and witnesses, byte-reversed.
 * The same derivation as the app's (lib/explorer/bark.ts). Exported for tests.
 */
export function txidFromRawTx(raw: Uint8Array): string {
  let pos = 4;
  const need = (n: number) => {
    if (pos + n > raw.length) throw new LookupError('truncated transaction');
  };
  const compact = (): number => {
    need(1);
    const first = raw[pos++];
    if (first < 0xfd) return first;
    const size = first === 0xfd ? 2 : first === 0xfe ? 4 : 8;
    need(size);
    let v = 0;
    for (let i = size - 1; i >= 0; i--) v = v * 256 + raw[pos + i];
    pos += size;
    return v;
  };
  const skip = (n: number) => { need(n); pos += n; };
  const segwit = raw[4] === 0x00 && raw[5] === 0x01;
  if (segwit) pos += 2;
  const bodyStart = pos;
  const inputs = compact();
  for (let i = 0; i < inputs; i++) { skip(36); skip(compact()); skip(4); }
  const outputs = compact();
  for (let i = 0; i < outputs; i++) { skip(8); skip(compact()); }
  const bodyEnd = pos;
  if (segwit) {
    for (let i = 0; i < inputs; i++) {
      const items = compact();
      for (let j = 0; j < items; j++) skip(compact());
    }
  }
  skip(4);
  const stripped = new Uint8Array(4 + (bodyEnd - bodyStart) + 4);
  stripped.set(raw.subarray(0, 4), 0);
  stripped.set(raw.subarray(bodyStart, bodyEnd), 4);
  stripped.set(raw.subarray(pos - 4, pos), 4 + (bodyEnd - bodyStart));
  return bytesToHex(sha256(sha256(stripped)).reverse());
}

// A protobuf message as a map of field number to raw values (varints as
// numbers, length-delimited fields as bytes); enough to read RoundEvent.
type Message = Map<number, (number | Uint8Array)[]>;

function readVarint(buf: Uint8Array, pos: number): [number, number] {
  let result = 0;
  let shift = 0;
  for (;;) {
    if (pos >= buf.length) throw new LookupError('truncated protobuf');
    const b = buf[pos++];
    result += (b & 0x7f) * 2 ** shift;
    shift += 7;
    if (!(b & 0x80)) break;
  }
  return [result, pos];
}

function readMessage(buf: Uint8Array): Message {
  const m: Message = new Map();
  let pos = 0;
  while (pos < buf.length) {
    let tag: number;
    [tag, pos] = readVarint(buf, pos);
    const field = Math.floor(tag / 8);
    const wire = tag & 7;
    let value: number | Uint8Array;
    if (wire === 0) [value, pos] = readVarint(buf, pos);
    else if (wire === 1) { value = buf.subarray(pos, pos + 8); pos += 8; }
    else if (wire === 2) {
      let len: number;
      [len, pos] = readVarint(buf, pos);
      value = buf.subarray(pos, pos + len);
      pos += len;
    } else if (wire === 5) { value = buf.subarray(pos, pos + 4); pos += 4; }
    else throw new LookupError(`protobuf wire type ${wire}`);
    const list = m.get(field) ?? [];
    list.push(value);
    m.set(field, list);
  }
  return m;
}

/** The gRPC-web frames of a body: messages, and the trailers' grpc-status. */
function splitFrames(buf: Uint8Array): { messages: Uint8Array[]; status: string | null } {
  const messages: Uint8Array[] = [];
  let status: string | null = null;
  let pos = 0;
  while (buf.length - pos >= 5) {
    const flag = buf[pos];
    const len = new DataView(buf.buffer, buf.byteOffset + pos + 1, 4).getUint32(0);
    const body = buf.subarray(pos + 5, pos + 5 + len);
    pos += 5 + len;
    if (flag & 0x80) {
      const m = new TextDecoder().decode(body).match(/grpc-status:\s*(\d+)/i);
      if (m) status = m[1];
    } else if (!(flag & 0x01)) {
      messages.push(body);
    }
  }
  return { messages, status };
}

/**
 * The txid of the server's latest finished round, from LastRoundEvent, or
 * null when its last event is something else (a round in progress, a failed
 * one), which carries no transaction. A failure to reach the server throws.
 */
async function lastFinishedBarkRound(f: typeof fetch, barkUrl: string, budget?: RequestBudget): Promise<string | null> {
  budget?.take(STREAM_RESERVE);
  let res: Response;
  try {
    res = await f(`${barkUrl}/${BARK_SERVICE}/LastRoundEvent`, {
      method: 'POST',
      headers: { 'content-type': 'application/grpc-web+proto', 'x-grpc-web': '1' },
      body: new Uint8Array(5),
      signal: AbortSignal.timeout(TX_TIMEOUT_MS),
    });
  } catch (err) {
    const kind = err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'unreachable';
    throw new LookupError(`${hostOf(barkUrl)} ${kind}`);
  }
  if (!res.ok) throw new LookupError(`${hostOf(barkUrl)} answered ${res.status}`);
  const early = res.headers.get('grpc-status');
  if (early && early !== '0') throw new LookupError(`${hostOf(barkUrl)} grpc-status ${early}`);
  const { messages, status } = splitFrames(new Uint8Array(await res.arrayBuffer()));
  if (status && status !== '0') throw new LookupError(`${hostOf(barkUrl)} grpc-status ${status}`);
  if (messages.length === 0) throw new LookupError(`${hostOf(barkUrl)} empty answer`);
  // RoundEvent { oneof event { … RoundFinished finished = 4 } }, and
  // RoundFinished { …; bytes signed_round_tx = 3 }.
  const event = readMessage(messages[0]);
  const finished = event.get(4)?.[0];
  if (!(finished instanceof Uint8Array)) return null;
  const raw = readMessage(finished).get(3)?.[0];
  if (!(raw instanceof Uint8Array) || raw.length === 0) return null;
  return txidFromRawTx(raw);
}

/**
 * One refresh of the Bark anchor: ask the server for its latest finished
 * round, and when that round is confirmed and newer than the stored one,
 * store it. A round still in the mempool, or a last event that is not a
 * finished round, leaves the row as it is.
 */
export async function refreshBarkAnchor(env: Env, deps: AnchorDeps = {}): Promise<RefreshReport> {
  const none: RefreshReport = { anchor: null, hops: 0, found: 0, interrupted: false };
  if (!env.ENTITY_DB) return none;
  const f = deps.fetch ?? fetch;
  const esplora = esploraBases(deps);
  const bark = (deps.barkUrl ?? BARK_SERVER_URL).replace(/\/+$/, '');

  let row: Row | null = null;
  try {
    row = await env.ENTITY_DB.prepare('SELECT network, txid, height, timestamp, frontier, updated_at FROM explorer_anchors WHERE network = ?')
      .bind('bark').first<Row>();
  } catch {
    return none;
  }
  const stored: Anchor | null = row && TXID.test(row.txid) ? { txid: row.txid, height: row.height, timestamp: row.timestamp } : null;

  let txid: string | null;
  let tx: EsploraTx | null = null;
  try {
    txid = await lastFinishedBarkRound(f, bark, deps.budget);
    if (txid && txid !== stored?.txid) {
      const { body, host } = await getEsploraJson(f, esplora, `/tx/${txid}`, deps.budget, STREAM_RESERVE);
      const t = body as EsploraTx | null;
      if (!t || typeof t.status !== 'object') throw new LookupError(`${host} malformed tx`);
      tx = t;
    }
  } catch (err) {
    if (err instanceof LookupError) return { anchor: stored, hops: 0, found: 0, interrupted: true, failure: err.failure };
    throw err;
  }
  if (!txid || !tx || !tx.status.confirmed || typeof tx.status.block_height !== 'number') {
    return { anchor: stored, hops: 0, found: 0, interrupted: false };
  }
  if (stored && tx.status.block_height <= stored.height) return { anchor: stored, hops: 0, found: 0, interrupted: false };
  const anchor: Anchor = { txid, height: tx.status.block_height, timestamp: tx.status.block_time ?? 0 };
  await storeAnchor(env, 'bark', anchor, [], (deps.now ?? Date.now)());
  return { anchor, hops: 0, found: 1, interrupted: false };
}

/** The cron's job: both anchors, each tolerating the other's failure. */
export async function refreshAnchors(env: Env, deps: AnchorDeps = {}): Promise<{ arkade: RefreshReport; bark: RefreshReport }> {
  const [arkade, bark] = await Promise.all([
    refreshArkadeAnchor(env, deps).catch((): RefreshReport => ({ anchor: null, hops: 0, found: 0, interrupted: true })),
    refreshBarkAnchor(env, deps).catch((): RefreshReport => ({ anchor: null, hops: 0, found: 0, interrupted: true })),
  ]);
  return { arkade, bark };
}
