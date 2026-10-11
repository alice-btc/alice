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
// Per run: a run every ten minutes with this budget catches up a day of the
// operator's activity in a couple of runs, at well under a hundred requests.
const MAX_HOPS = 40;
const MAX_FRONTIER = 24;
const TIMEOUT_MS = 12_000;

export type Anchor = { txid: string; height: number; timestamp: number };
export type Anchors = { arkade?: Anchor; bark?: Anchor; updatedAt?: number };

type Outpoint = { txid: string; vout: number; valueSats: number };

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

async function getJson(f: typeof fetch, url: string): Promise<{ status: number; body: unknown }> {
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
async function getEsploraJson(f: typeof fetch, bases: readonly string[], path: string): Promise<{ status: number; body: unknown; host: string }> {
  let last: LookupError | null = null;
  for (const base of bases) {
    try {
      const { status, body } = await getJson(f, `${base}${path}`);
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

function largestOutputs(tx: EsploraTx): Outpoint[] {
  return tx.vout
    .map((o, index) => ({ txid: tx.txid, vout: index, valueSats: o.value }))
    .filter(o => o.valueSats >= MIN_FOLLOW_SATS)
    .sort((a, b) => b.valueSats - a.valueSats)
    .slice(0, MAX_FOLLOW_PER_TX);
}

function parseFrontier(raw: string): Outpoint[] {
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((o): o is Outpoint =>
      typeof o === 'object' && o !== null
      && typeof (o as Outpoint).txid === 'string' && TXID.test((o as Outpoint).txid)
      && Number.isInteger((o as Outpoint).vout) && (o as Outpoint).vout >= 0
      && typeof (o as Outpoint).valueSats === 'number');
  } catch {
    return [];
  }
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

  const getTx = async (txid: string): Promise<EsploraTx> => {
    const { body, host } = await getEsploraJson(f, esplora, `/tx/${txid}`);
    const tx = body as EsploraTx | null;
    if (!tx || !Array.isArray(tx.vout) || typeof tx.status !== 'object') throw new LookupError(`${host} malformed tx`);
    return tx;
  };
  const getOutspends = async (txid: string): Promise<EsploraOutspend[]> => {
    const { body, host } = await getEsploraJson(f, esplora, `/tx/${txid}/outspends`);
    if (!Array.isArray(body)) throw new LookupError(`${host} malformed outspends`);
    return body as EsploraOutspend[];
  };
  // The indexer answers a commitment with its round, and anything else with
  // "batch not found". Any other answer is a failure, never "not one".
  const negatives = new Set<string>();
  const isCommitment = async (txid: string): Promise<boolean> => {
    if (negatives.has(txid)) return false;
    const { status, body } = await getJson(f, `${arkade}/v1/indexer/commitmentTx/${txid}`);
    if (status === 200) return true;
    const message = typeof body === 'object' && body !== null ? String((body as { message?: unknown }).message ?? '') : '';
    if (/not found/i.test(message)) { negatives.add(txid); return false; }
    throw new LookupError(`${hostOf(arkade)} indexer answered ${status}`);
  };

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
    const explored = new Set<string>();
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
      if (hops >= maxHops) { queue.shift(); frontier.push(op); continue; }
      const tx = await getTx(spend.txid);
      const hit = await isCommitment(tx.txid);
      // The hop counts once its lookups are all in: a failure above leaves
      // the output queued for the next run.
      queue.shift();
      explored.add(spend.txid);
      hops++;
      if (hit) { consider(tx); found++; }
      queue.push(...largestOutputs(tx));
    }
  } catch (err) {
    if (!(err instanceof LookupError)) throw err;
    failure = err.failure;
  }

  const report = (anchor: Anchor | null): RefreshReport =>
    failure === undefined ? { anchor, hops, found, interrupted: false } : { anchor, hops, found, interrupted: true, failure };
  if (!newest) return report(null);
  // What to resume from: the unspent outputs reached, then whatever is still
  // queued (a run cut short keeps its unexplored outputs), newest last.
  const resume = [...frontier, ...queue].slice(-MAX_FRONTIER);
  const now = deps.now ?? Date.now;
  await env.ENTITY_DB.prepare(
    `INSERT INTO explorer_anchors (network, txid, height, timestamp, frontier, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(network) DO UPDATE SET txid = excluded.txid, height = excluded.height,
       timestamp = excluded.timestamp, frontier = excluded.frontier, updated_at = excluded.updated_at`,
  ).bind('arkade', newest.txid, newest.height, newest.timestamp, JSON.stringify(resume), now()).run();
  return report(newest);
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
async function lastFinishedBarkRound(f: typeof fetch, barkUrl: string): Promise<string | null> {
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
    txid = await lastFinishedBarkRound(f, bark);
    if (txid && txid !== stored?.txid) {
      const { body, host } = await getEsploraJson(f, esplora, `/tx/${txid}`);
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
  const now = deps.now ?? Date.now;
  await env.ENTITY_DB.prepare(
    `INSERT INTO explorer_anchors (network, txid, height, timestamp, frontier, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(network) DO UPDATE SET txid = excluded.txid, height = excluded.height,
       timestamp = excluded.timestamp, frontier = excluded.frontier, updated_at = excluded.updated_at`,
  ).bind('bark', anchor.txid, anchor.height, anchor.timestamp, '[]', now()).run();
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
