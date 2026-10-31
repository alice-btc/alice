// Sparkscan, the Spark network's explorer, for what the operators do not
// publish: the network-wide feed of transactions. Its REST API and its live
// channel (a Centrifugo websocket) answer without any key, and the API allows
// any origin, so both are read straight from the browser. Addresses are
// served in both Spark formats (the live feed still uses the first, sp1…);
// everything is re-encoded to the current one here.
//
// Token transactions (Spark carries stablecoins and other tokens next to
// bitcoin) are listed as such, under the one word "token": the Explorer names
// no token and shows no token amount.

import { decodeSparkAddress } from './spark.ts';
import { t as tr, tn, translate, type Locale } from '../../i18n/translate.ts';
import { SparkscanBudget } from './sparkscan-budget.ts';

export const SPARKSCAN_API = 'https://api.sparkscan.io/v1';
export const SPARKSCAN_WS = 'wss://updates.sparkscan.io/connection/websocket';
const NETWORK = 'MAINNET';

export class SparkscanError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'SparkscanError';
    this.status = status;
  }
}

export type SparkscanKind = 'transfer' | 'lightning' | 'token' | 'deposit' | 'exit' | 'other';

export type SparkscanParty = {
  kind: 'spark' | 'lightning' | 'bitcoin' | 'other';
  /** The Spark address, current spelling, when the party is a Spark wallet. */
  address: string | null;
  pubkey: string | null;
  /** What Sparkscan calls it otherwise ("Lightning Network"). */
  label: string;
};

export type SparkscanTx = {
  id: string;
  kind: SparkscanKind;
  /** Sparkscan's own type name. */
  rawType: string;
  status: string;
  amountSats: number | null;
  from: SparkscanParty | null;
  to: SparkscanParty | null;
  /** Unix seconds. */
  createdAt: number | null;
  /** The on-chain transaction, for deposits and exits. */
  bitcoinTxid: string | null;
  /** A token moved between several wallets at once: the wallets on each
   *  side, without amounts. */
  multi?: { inputs: SparkscanParty[]; outputs: SparkscanParty[] };
};

/** Sparkscan's type names, grouped. */
export function sparkscanKind(rawType: string): SparkscanKind {
  const t = rawType.toLowerCase();
  if (t.startsWith('token')) return 'token';
  if (t.includes('lightning')) return 'lightning';
  if (t.includes('deposit')) return 'deposit';
  if (t.includes('exit') || t.includes('withdraw')) return 'exit';
  if (t.includes('spark') || t === 'transfer') return 'transfer';
  return 'other';
}

/** The Explorer's label for a kind; English unless a locale is given (the
 *  Ask Alice context keeps the English words). */
export function sparkscanKindLabel(kind: SparkscanKind, locale: Locale = 'en'): string {
  switch (kind) {
    case 'transfer': return translate(locale, 'explorerSpark.sparkscan.transfer');
    case 'lightning': return translate(locale, 'explorerSpark.sparkscan.lightning');
    case 'token': return translate(locale, 'explorerSpark.sparkscan.token');
    case 'deposit': return translate(locale, 'explorerSpark.sparkscan.deposit');
    case 'exit': return translate(locale, 'explorerSpark.sparkscan.exit');
    default: return translate(locale, 'explorerSpark.sparkscan.other');
  }
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function sats(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.round(n) : null;
}

function unixSeconds(v: unknown): number | null {
  const s = str(v);
  if (!s) return null;
  // Sparkscan writes most timestamps with a zone and a few without: those
  // are UTC too.
  const ms = Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : `${s}Z`);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** A party as the REST API shapes it: `{ type, identifier, pubkey }`. */
function party(v: unknown): SparkscanParty | null {
  if (!v || typeof v !== 'object') return null;
  const r = v as Record<string, unknown>;
  const type = (str(r.type) ?? 'other').toLowerCase();
  const identifier = str(r.identifier);
  if (type === 'spark' && identifier) return sparkParty(identifier, str(r.pubkey));
  return { kind: type === 'lightning' ? 'lightning' : type === 'bitcoin' ? 'bitcoin' : 'other', address: null, pubkey: str(r.pubkey), label: identifier ?? type };
}

/** A Spark party by its address; a placeholder Sparkscan writes in that slot
 *  ("Multiple Parties") stays a label. */
function sparkParty(identifier: string, pubkey: string | null): SparkscanParty {
  const decoded = decodeSparkAddress(identifier);
  if (!decoded) return { kind: 'other', address: null, pubkey, label: identifier };
  return { kind: 'spark', address: decoded.canonical, pubkey: decoded.pubkey, label: decoded.canonical };
}

/** Read one transaction of the REST API (latest, by id, or an address's
 *  history row). Rows of an address history carry a counterparty instead of
 *  from/to; it is kept as the other party, the side unknown. */
export function normalizeSparkscanTx(j: unknown, self?: SparkscanParty): SparkscanTx | null {
  if (!j || typeof j !== 'object') return null;
  const r = j as Record<string, unknown>;
  const id = str(r.id);
  const rawType = str(r.type);
  if (!id || !rawType) return null;
  const kind = sparkscanKind(rawType);
  let from = party(r.from);
  let to = party(r.to);
  if (!from && !to && r.counterparty) {
    // A history row names the other party only: the side it leaves out is
    // the address whose history this is, when the caller says which.
    const other = party(r.counterparty);
    const direction = (str(r.direction) ?? '').toLowerCase();
    if (/^(in|incoming|received?)$/.test(direction)) { from = other; to = self ?? null; } else { to = other; from = self ?? null; }
  }
  const multi = multiParties(r.multiIoDetails);
  return {
    id,
    kind,
    rawType,
    status: str(r.status) ?? 'unknown',
    amountSats: kind === 'token' ? null : sats(r.amountSats),
    from,
    to,
    createdAt: unixSeconds(r.createdAt),
    // A transaction's detail carries the Bitcoin side twice: `txid` in
    // Spark's reversed byte order, and the transaction itself under
    // `bitcoinTxData` with the txid as Bitcoin writes it. The history rows
    // carry only the latter, as `txid`.
    bitcoinTxid: bitcoinTxid(r),
    ...(multi ? { multi } : {}),
  };
}

function bitcoinTxid(r: Record<string, unknown>): string | null {
  const data = r.bitcoinTxData;
  const inner = data && typeof data === 'object' ? str((data as Record<string, unknown>).txid) : null;
  return inner ?? str(r.txid);
}

/** The wallets of a multi-party token transaction (`multiIoDetails`), each
 *  side de-duplicated, amounts left out. */
function multiParties(v: unknown): SparkscanTx['multi'] | null {
  if (!v || typeof v !== 'object') return null;
  const r = v as { inputs?: unknown; outputs?: unknown };
  const side = (list: unknown): SparkscanParty[] => {
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    const out: SparkscanParty[] = [];
    for (const item of list) {
      const e = (item ?? {}) as Record<string, unknown>;
      const address = str(e.address);
      if (!address || seen.has(address)) continue;
      seen.add(address);
      out.push(sparkParty(address, str(e.pubkey)));
    }
    return out;
  };
  const inputs = side(r.inputs);
  const outputs = side(r.outputs);
  return inputs.length || outputs.length ? { inputs, outputs } : null;
}

/** Read one publication of the live channel (snake_case, sp1… addresses). */
export function normalizeSparkscanLive(j: unknown): SparkscanTx | null {
  if (!j || typeof j !== 'object') return null;
  const r = j as Record<string, unknown>;
  const id = str(r.id);
  const rawType = str(r.type);
  if (!id || !rawType) return null;
  const kind = sparkscanKind(rawType);
  const side = (idKey: string, pkKey: string): SparkscanParty | null => {
    const identifier = str(r[idKey]);
    if (!identifier) return null;
    if (/^(lightning)/i.test(identifier)) return { kind: 'lightning', address: null, pubkey: null, label: identifier };
    return sparkParty(identifier, str(r[pkKey]));
  };
  // A payment arriving from Lightning is published as sent by the SSP; the
  // kind already says where it came from.
  return {
    id,
    kind,
    rawType,
    status: str(r.status) ?? 'unknown',
    amountSats: kind === 'token' ? null : sats(r.amount_sats),
    from: side('from_identifier', 'from_pubkey'),
    to: side('to_identifier', 'to_pubkey'),
    createdAt: unixSeconds(r.processed_at) ?? unixSeconds(r.updated_at),
    bitcoinTxid: str(r.bitcoin_txid),
  };
}

/** Shared by every REST call. Exported for the tests. */
export const sparkscanBudget = new SparkscanBudget();

const nowSec = () => Math.floor(Date.now() / 1000);

/** "40 seconds", "about 2 minutes", in the interface language (the English
 *  wording is describeWait's, which the budget tests pin). */
function describeWaitLocalized(seconds: number): string {
  if (seconds < 60) return tn('explorerSpark.sparkscan.waitSeconds', Math.max(1, Math.round(seconds)));
  return tn('explorerSpark.sparkscan.waitMinutes', Math.round(seconds / 60));
}

function limitReached(waitSeconds: number): SparkscanError {
  return new SparkscanError(tr('explorerSpark.sparkscan.rateLimited', { wait: describeWaitLocalized(waitSeconds) }), 429);
}

async function getJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const wait = sparkscanBudget.wait(nowSec());
  if (wait > 0) throw limitReached(wait);
  let res: Response;
  try {
    res = await fetch(`${SPARKSCAN_API}${path}`, { headers: { accept: 'application/json' }, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new SparkscanError(tr('explorerSpark.sparkscan.unreachable'));
  }
  sparkscanBudget.note(res.status, res.headers, nowSec());
  if (res.status === 429) throw limitReached(sparkscanBudget.wait(nowSec()));
  if (res.status === 404) return null;
  if (!res.ok) throw new SparkscanError(tr('explorerSpark.sparkscan.status', { status: res.status }), res.status);
  return res.json();
}

/** The newest transactions of the network. */
export async function getSparkscanLatest(limit = 20, opts: { signal?: AbortSignal } = {}): Promise<SparkscanTx[]> {
  const j = await getJson(`/tx/latest?network=${NETWORK}&limit=${limit}`, opts.signal);
  return Array.isArray(j) ? j.map(row => normalizeSparkscanTx(row)).filter((t): t is SparkscanTx => t !== null) : [];
}

/** A wallet's history as Sparkscan lists it, bitcoin and token lines mixed,
 *  newest first. */
export async function getSparkscanAddressTxs(address: string, opts: { limit?: number; offset?: number; signal?: AbortSignal } = {}): Promise<{ txs: SparkscanTx[]; total: number }> {
  const j = await getJson(`/address/${encodeURIComponent(address)}/transactions?network=${NETWORK}&limit=${opts.limit ?? 20}&offset=${opts.offset ?? 0}`, opts.signal);
  const r = (j ?? {}) as { data?: unknown; meta?: { totalItems?: unknown } };
  // The rows name the counterparty only; the queried address is the other side.
  const self = sparkParty(address, null);
  const txs = Array.isArray(r.data) ? r.data.map(j => normalizeSparkscanTx(j, self)).filter((t): t is SparkscanTx => t !== null) : [];
  const total = typeof r.meta?.totalItems === 'number' ? r.meta.totalItems : txs.length;
  return { txs, total };
}

/** One transaction by id (a transfer's UUID or a token transaction's hash). */
export async function getSparkscanTx(id: string, opts: { signal?: AbortSignal } = {}): Promise<SparkscanTx | null> {
  return normalizeSparkscanTx(await getJson(`/tx/${encodeURIComponent(id)}?network=${NETWORK}`, opts.signal));
}

/**
 * Follow the live channel until the signal aborts or the socket drops (the
 * promise then resolves; the caller reconnects). Centrifugo's protocol is a
 * few JSON lines: connect, subscribe, then publications; an empty object is
 * a ping, answered with an empty object.
 */
export function subscribeSparkscan(onTx: (tx: SparkscanTx) => void, opts: { signal?: AbortSignal; onOpen?: () => void } = {}): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (typeof WebSocket === 'undefined') { reject(new SparkscanError(tr('explorerSpark.sparkscan.noWebsocket'))); return; }
    let ws: WebSocket;
    try {
      ws = new WebSocket(SPARKSCAN_WS);
    } catch {
      reject(new SparkscanError(tr('explorerSpark.sparkscan.openFailed')));
      return;
    }
    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      opts.signal?.removeEventListener('abort', onAbort);
      try { ws.close(); } catch { /* already closed */ }
      if (err) reject(err); else resolve();
    };
    const onAbort = () => finish();
    if (opts.signal?.aborted) { finish(); return; }
    opts.signal?.addEventListener('abort', onAbort);
    ws.onopen = () => ws.send(JSON.stringify({ id: 1, connect: {} }));
    ws.onerror = () => finish(new SparkscanError(tr('explorerSpark.sparkscan.dropped')));
    ws.onclose = () => finish();
    ws.onmessage = ev => {
      for (const line of String(ev.data).split('\n')) {
        if (!line.trim()) continue;
        let m: Record<string, unknown>;
        try { m = JSON.parse(line); } catch { continue; }
        if (m.id === 1) {
          ws.send(JSON.stringify({ id: 2, subscribe: { channel: `/transaction/network/${NETWORK}` } }));
          opts.onOpen?.();
        } else if (Object.keys(m).length === 0) {
          ws.send('{}');
        } else if (m.push && typeof m.push === 'object') {
          const pub = (m.push as { pub?: { data?: unknown } }).pub;
          const data = pub?.data;
          let parsed: unknown = data;
          if (typeof data === 'string') { try { parsed = JSON.parse(data); } catch { parsed = null; } }
          const tx = normalizeSparkscanLive(parsed);
          if (tx) onTx(tx);
        }
      }
    };
  });
}
