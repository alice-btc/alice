// Client for an Arkade ASP (arkd) public REST gateway.
//
// Arkade is an off-chain execution layer on Bitcoin: value lives in VTXOs held
// by an Ark Service Provider (ASP), and the ASP periodically settles a round of
// VTXOs on-chain in a "commitment" transaction. There is no block sequence of
// its own, and the ASP exposes no historical list of commitments (its /v1/txs
// is a live stream), so this Explorer view reads two things the gateway does
// serve: the ASP's parameters (/v1/info) and a single commitment round by its
// on-chain txid (/v1/indexer/commitmentTx/{txid}).
//
// The gateway is public and CORS-open (the official arkade.space explorer calls
// it cross-origin), so this runs straight from the browser, no proxy. Every
// numeric field crosses the gRPC-gateway as a string; we parse defensively.

import { bech32m } from '@scure/base';
import { formatLocale, t as tr, translate, translatePlural, type Locale } from '../../i18n/translate.ts';
import { hasCanonicalExpiry, parseCanonicalExpiry, parseLegacyExpiry, parseScalarExpiry } from './arkade-expiry.ts';

/** Parse a gateway numeric string ("330", "60") to a number, 0 on garbage. */
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export class ArkadeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArkadeError';
  }
}

/** The ASP's advertised parameters, from /v1/info. */
export type ArkadeInfo = {
  version: string;
  /** Settlement network the commitments land on (e.g. "bitcoin"). */
  network: string;
  signerPubkey: string;
  forfeitAddress: string;
  /** Round/session length in seconds. */
  sessionDurationSec: number;
  dustSats: number;
  vtxoMinSats: number;
  vtxoMaxSats: number;
  /** Blocks a user must wait to exit unilaterally. */
  unilateralExitDelay: number;
  maxTxWeight: number;
};

/** One VTXO batch inside a commitment round. */
export type ArkadeBatch = {
  /** The batch's identifying outpoint/key from the gateway map. */
  key: string;
  /** Unix seconds, or unknown. */
  expiresAt?: number;
  /** A block height, when the gateway's scalar is one. */
  expiresAtHeight?: number;
  swept: boolean;
  totalOutputAmountSats: number;
  totalOutputVtxos: number;
};

/** A commitment (round) transaction: the on-chain settlement of a VTXO round. */
export type ArkadeCommitment = {
  txid: string;
  /** Round window, unix seconds. */
  startedAt?: number;
  endedAt?: number;
  totalInputAmountSats: number;
  totalInputVtxos: number;
  totalOutputAmountSats: number;
  totalOutputVtxos: number;
  batches: ArkadeBatch[];
};

async function getJson(base: string, path: string, signal?: AbortSignal): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/+$/, '')}${path}`, {
      signal: signal ?? AbortSignal.timeout(15_000),
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    // Let an abort propagate as-is so callers can drop it silently instead of
    // surfacing a spurious "unreachable" when a re-render cancelled the fetch.
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ArkadeError(tr('explorerArk.error.unreachable'));
  }
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    // A gateway returns JSON; HTML here means we hit a web app, not the API.
    throw new ArkadeError(tr('explorerArk.error.notApi'));
  }
  if (!res.ok) {
    const msg = typeof json === 'object' && json !== null && typeof (json as { message?: unknown }).message === 'string'
      ? (json as { message: string }).message
      : tr('explorerArk.error.status', { status: res.status });
    throw new ArkadeError(msg);
  }
  return json;
}

export async function getArkadeInfo(base: string, opts: { signal?: AbortSignal } = {}): Promise<ArkadeInfo> {
  const j = await getJson(base, '/v1/info', opts.signal) as Record<string, unknown>;
  return {
    version: String(j.version ?? ''),
    network: String(j.network ?? ''),
    signerPubkey: String(j.signerPubkey ?? ''),
    forfeitAddress: String(j.forfeitAddress ?? ''),
    sessionDurationSec: num(j.sessionDuration),
    dustSats: num(j.dust),
    vtxoMinSats: num(j.vtxoMinAmount),
    vtxoMaxSats: num(j.vtxoMaxAmount),
    unilateralExitDelay: num(j.unilateralExitDelay),
    maxTxWeight: num(j.maxTxWeight),
  };
}

function parseBatches(raw: unknown): ArkadeBatch[] {
  if (typeof raw !== 'object' || raw === null) return [];
  // The gateway serialises batches as a map keyed by the batch outpoint.
  return Object.entries(raw as Record<string, unknown>).map(([key, v]) => {
    const b = (typeof v === 'object' && v !== null ? v : {}) as Record<string, unknown>;
    const expiry = parseScalarExpiry(b.expiresAt);
    return {
      key,
      expiresAt: expiry.expiresAt,
      ...(expiry.expiresAtHeight !== undefined ? { expiresAtHeight: expiry.expiresAtHeight } : {}),
      swept: b.swept === true,
      totalOutputAmountSats: num(b.totalOutputAmount),
      totalOutputVtxos: num(b.totalOutputVtxos),
    };
  });
}

export async function getArkadeCommitment(base: string, txid: string, opts: { signal?: AbortSignal } = {}): Promise<ArkadeCommitment> {
  const clean = txid.trim().toLowerCase();
  const j = await getJson(base, `/v1/indexer/commitmentTx/${encodeURIComponent(clean)}`, opts.signal) as Record<string, unknown>;
  return {
    txid: clean,
    startedAt: j.startedAt !== undefined ? num(j.startedAt) : undefined,
    endedAt: j.endedAt !== undefined ? num(j.endedAt) : undefined,
    totalInputAmountSats: num(j.totalInputAmount),
    totalInputVtxos: num(j.totalInputVtxos),
    totalOutputAmountSats: num(j.totalOutputAmount),
    totalOutputVtxos: num(j.totalOutputVtxos),
    batches: parseBatches(j.batches),
  };
}

/**
 * The commitment lookup as a question: the round when the txid is a
 * settlement, null when the indexer does not know it ("batch not found").
 * Network failures still throw, so "not a commitment" is never concluded
 * from an unreachable ASP.
 */
export async function getArkadeCommitmentIfAny(base: string, txid: string, opts: { signal?: AbortSignal } = {}): Promise<ArkadeCommitment | null> {
  try {
    return await getArkadeCommitment(base, txid, opts);
  } catch (err) {
    if (err instanceof ArkadeError && /not found/i.test(err.message)) return null;
    throw err;
  }
}

/** A Bitcoin txid, so the commitment lookup can validate before calling. */
export function looksLikeTxid(s: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(s.trim());
}

function bytesToHex(b: Uint8Array): string {
  let s = '';
  for (const x of b) s += x.toString(16).padStart(2, '0');
  return s;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/**
 * The Arkade address of a VTXO script. An Arkade address is bech32m of a
 * version byte (0), the operator's x-only signer key and the taproot output
 * key the VTXO script pays to, exactly what the SDK's ArkAddress encodes; so
 * any P2TR script the operator serves (a VTXO's, a virtual transaction's
 * output) reads back as the address that holds it. Null when the script is
 * not P2TR or the signer key is malformed. "ark" on mainnet, "tark" elsewhere.
 */
export function arkadeAddressOf(scriptHex: string, signerPubkeyHex: string, network = 'bitcoin'): string | null {
  const script = /^5120([0-9a-f]{64})$/i.exec(scriptHex.trim());
  const signer = /^(?:0[23])?([0-9a-f]{64})$/i.exec(signerPubkeyHex.trim());
  if (!script || !signer) return null;
  const data = new Uint8Array(65);
  data[0] = 0;
  data.set(hexToBytes(signer[1]), 1);
  data.set(hexToBytes(script[1]), 33);
  // Longer than bech32's usual 90 characters, like the SDK's own encoder.
  return bech32m.encode(network === 'bitcoin' ? 'ark' : 'tark', bech32m.toWords(data), false);
}

/** One VTXO (off-chain coin) held under an Arkade address. */
export type ArkadeVtxo = {
  txid: string;
  vout: number;
  amountSats: number;
  isSpent: boolean;
  isSwept: boolean;
  isPreconfirmed: boolean;
  createdAt?: number;
  /** Expiry as a date, unix seconds. Unknown is undefined, never 0. */
  expiresAt?: number;
  /** Expiry as a block height, when that is what the operator gave. Never a
   *  date: it is not compared with a clock. */
  expiresAtHeight?: number;
  /** The commitment round(s) that anchor this VTXO on-chain. */
  commitmentTxids: string[];
  /** The checkpoint transaction that spent this VTXO, when spent. */
  spentBy?: string;
  /** The Arkade transaction behind that spend, when spent. */
  arkTxid?: string;
  /** The taproot script the coin sits on, hex, when the indexer gives it. */
  scriptHex?: string;
};

/** The one state a view names for a VTXO. The indexer's flags can all be true
 *  at once (a coin spent, then its batch swept): spent wins, then swept, then
 *  preconfirmed, the SDK's own order (toVirtualStatus). A spent coin is the
 *  holder's own spend, whatever the operator did to its batch afterwards. */
export type ArkadeVtxoState = 'spent' | 'swept' | 'preconfirmed' | 'settled';

export function arkadeStateOf(v: Pick<ArkadeVtxo, 'isSpent' | 'isSwept' | 'isPreconfirmed'>): ArkadeVtxoState {
  return v.isSpent ? 'spent' : v.isSwept ? 'swept' : v.isPreconfirmed ? 'preconfirmed' : 'settled';
}

/** An Arkade address and the off-chain coins (VTXOs) it holds. */
export type ArkadeAddressInfo = {
  address: string;
  /** The taproot scriptPubKey the VTXOs sit on, hex. */
  scriptHex: string;
  spendableSats: number;
  spendableCount: number;
  totalCount: number;
  vtxos: ArkadeVtxo[];
};

/** Cheap prefilter so the UI can route input without loading the SDK. Bark
 *  addresses share the ark1 prefix; Arkade's carry version 0 ("q") right
 *  after it, Bark's version 1 ("p"). */
export function looksLikeArkadeAddress(s: string): boolean {
  return /^(ark|tark)1q[0-9a-z]+$/i.test(s.trim());
}

/**
 * One VTXO from either shape we can meet: the SDK's RestIndexerProvider maps
 * the gateway into its canonical VirtualCoin model ({ txid, vout, value,
 * isSpent/isSwept/isPreconfirmed, commitmentTxIds, expiresAt: Date,
 * expiresAtHeight, and the legacy virtualStatus.batchExpiry in ms }), while the
 * raw gateway JSON nests the outpoint and keeps everything in strings and
 * seconds ({ outpoint, amount, isSpent, expiresAt }). Accepting both keeps the
 * view correct whichever layer answers. Canonical facts win over the legacy
 * virtualStatus, which only fills what they leave unsaid. Exported for tests.
 */
export function normalizeVtxo(v: Record<string, unknown>): ArkadeVtxo {
  const op = (typeof v.outpoint === 'object' && v.outpoint !== null ? v.outpoint : v) as Record<string, unknown>;
  const vs = (typeof v.virtualStatus === 'object' && v.virtualStatus !== null ? v.virtualStatus : {}) as Record<string, unknown>;
  const state = typeof vs.state === 'string' ? vs.state : '';
  const flag = (canonical: unknown, legacyState: string): boolean => typeof canonical === 'boolean' ? canonical : state === legacyState;
  const createdAt = v.createdAt instanceof Date
    ? Math.floor(v.createdAt.getTime() / 1000)
    : v.createdAt !== undefined ? num(v.createdAt) : undefined;
  // One expiry, from one source: the canonical fields when the coin has any,
  // else the gateway's scalar, else the legacy batchExpiry.
  const expiry = hasCanonicalExpiry(v) ? parseCanonicalExpiry(v.expiresAt, v.expiresAtHeight)
    : v.expiresAt !== undefined ? parseScalarExpiry(v.expiresAt)
      : parseLegacyExpiry(vs.batchExpiry);
  const commitments = Array.isArray(v.commitmentTxIds) ? v.commitmentTxIds
    : Array.isArray(v.commitmentTxids) ? v.commitmentTxids
      : Array.isArray(vs.commitmentTxIds) ? vs.commitmentTxIds : [];
  // The spender fields differ by shape too: SDK `arkTxId`, gateway `arkTxid`.
  const spentBy = typeof v.spentBy === 'string' && v.spentBy ? v.spentBy : undefined;
  const arkTxid = typeof v.arkTxId === 'string' && v.arkTxId ? v.arkTxId
    : typeof v.arkTxid === 'string' && v.arkTxid ? v.arkTxid : undefined;
  return {
    txid: String(op.txid ?? ''),
    vout: num(op.vout),
    amountSats: v.amount !== undefined ? num(v.amount) : num(v.value),
    isSpent: flag(v.isSpent, 'spent'),
    isSwept: flag(v.isSwept, 'swept'),
    isPreconfirmed: flag(v.isPreconfirmed, 'preconfirmed'),
    createdAt,
    expiresAt: expiry.expiresAt,
    ...(expiry.expiresAtHeight !== undefined ? { expiresAtHeight: expiry.expiresAtHeight } : {}),
    commitmentTxids: commitments.map(String),
    spentBy,
    arkTxid,
    scriptHex: typeof v.script === 'string' && /^[0-9a-f]+$/i.test(v.script) ? v.script.toLowerCase() : undefined,
  };
}

function abortError(): DOMException {
  return new DOMException('aborted', 'AbortError');
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

/**
 * Stop waiting for `work` when the signal aborts. The SDK's getVtxos takes no
 * AbortSignal, so an HTTP request already under way is NOT cancelled: it
 * finishes in the background and its answer is dropped. What this guarantees is
 * that the caller is released at once and never acts on that answer. The
 * listener is removed whichever settles first.
 */
function untilAborted<T>(work: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return work;
  if (signal.aborted) {
    work.catch(() => {});
    return Promise.reject(abortError());
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener('abort', onAbort, { once: true });
    work.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

/** Coins per request. The server may serve fewer: only its cursor ends the read. */
const VTXO_PAGE_SIZE = 500;

const isCount = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;

/**
 * Every VTXO of a query, page by page, following the indexer's own cursor
 * (`page` = { current, next, total }, 1-based; asking for index 0 is asking
 * for page 1). A short page is not the last page: only current >= total ends
 * the read. The answer is all of it or an error: a refused or unusable page,
 * a cursor that does not move forward or that comes back to a page already
 * read, a page that is not the one asked for, a coin listed twice (the
 * address moved under the read) all throw, and the caller never sees the pages
 * read so far. There is no cap on coins: a cap would hide balance. A cursor
 * strictly forward and bounded by `total` ends the loop on its own, and an
 * empty page that is not the last one is refused so a huge `total` cannot
 * keep it spinning on nothing.
 */
async function readAllPages(
  getPage: (pageIndex: number) => Promise<{ vtxos: unknown; page?: unknown }>,
  signal?: AbortSignal,
): Promise<ArkadeVtxo[]> {
  const coins: ArkadeVtxo[] = [];
  const seenCoins = new Set<string>();
  const seenPages = new Set<number>();
  const invalid = () => new ArkadeError(tr('explorerArk.error.pageInvalid'));
  let asked = 0;
  for (;;) {
    throwIfAborted(signal);
    let res: { vtxos: unknown; page?: unknown };
    try {
      res = await untilAborted(getPage(asked), signal);
    } catch (err) {
      if (signal?.aborted) throw abortError();
      throw new ArkadeError(err instanceof Error && err.message ? err.message : tr('explorerArk.error.loadVtxos'));
    }
    throwIfAborted(signal);

    const raw = res?.vtxos;
    if (!Array.isArray(raw)) throw invalid();
    for (const item of raw) {
      if (typeof item !== 'object' || item === null) throw invalid();
      const coin = normalizeVtxo(item as Record<string, unknown>);
      const key = `${coin.txid}:${coin.vout}`;
      if (seenCoins.has(key)) throw new ArkadeError(tr('explorerArk.error.pageInconsistent'));
      seenCoins.add(key);
      coins.push(coin);
    }

    const page = res.page as { current?: unknown; next?: unknown; total?: unknown } | undefined | null;
    if (page === undefined || page === null) {
      // No cursor at all: the first request was the whole answer only if the
      // page was not full. A full page without a cursor cannot be told from a
      // cut one.
      if (asked === 0 && raw.length < VTXO_PAGE_SIZE) return coins;
      throw invalid();
    }
    const { current, next, total } = page;
    if (!isCount(current) || !isCount(next) || !isCount(total)) throw invalid();
    // An address with no coin: no page to count, and nothing to hide.
    if (total === 0 && asked === 0 && raw.length === 0) return coins;
    if (current < 1 || total < 1 || current > total) throw invalid();
    // The page served must be the one asked for (0 and 1 both mean page 1).
    if (current !== Math.max(1, asked) || seenPages.has(current)) throw invalid();
    seenPages.add(current);
    if (current >= total) return coins;
    if (next !== current + 1 || next > total || raw.length === 0) throw invalid();
    asked = next;
  }
}

/**
 * Resolve an Arkade address to its VTXOs and balance. Uses the official SDK
 * (loaded lazily) to decode the address into its taproot script, then queries
 * the ASP indexer for the VTXOs on that script. This is the "search an address"
 * of the Arkade explorer: it shows off-chain coins, not on-chain outputs.
 */
export async function getArkadeAddressVtxos(base: string, address: string, opts: { signal?: AbortSignal } = {}): Promise<ArkadeAddressInfo> {
  const { signal } = opts;
  throwIfAborted(signal);
  const { ArkAddress, RestIndexerProvider, isValidArkAddress } = await untilAborted(import('@arkade-os/sdk'), signal);
  throwIfAborted(signal);
  const a = address.trim();
  if (!isValidArkAddress(a)) throw new ArkadeError(tr('explorerArk.error.invalidAddress'));
  let scriptHex: string;
  try {
    scriptHex = bytesToHex(ArkAddress.decode(a).pkScript);
  } catch {
    throw new ArkadeError(tr('explorerArk.error.decodeAddress'));
  }
  const indexer = new RestIndexerProvider(base.replace(/\/+$/, ''));
  const vtxos = await readAllPages(
    pageIndex => indexer.getVtxos({ scripts: [scriptHex], pageIndex, pageSize: VTXO_PAGE_SIZE }),
    signal,
  );
  throwIfAborted(signal);
  const spendable = vtxos.filter(v => !v.isSpent && !v.isSwept);
  return {
    address: a,
    scriptHex,
    vtxos,
    totalCount: vtxos.length,
    spendableCount: spendable.length,
    spendableSats: spendable.reduce((s, v) => s + v.amountSats, 0),
  };
}

/** One input of a virtual (off-chain) Arkade transaction. */
export type ArkadeVirtualTxInput = {
  txid: string;
  vout: number;
  amountSats?: number;
  /** The Arkade address the spent coin sat on, when the indexer knows it. */
  address?: string;
  /** True when the input is a checkpoint transaction's output: the address
   *  is then the coin's, one transaction up. */
  viaCheckpoint?: boolean;
};

/** One output of a virtual Arkade transaction, enriched with its VTXO state
 *  when the indexer knows the outpoint. */
export type ArkadeVirtualTxOutput = {
  index: number;
  amountSats: number;
  scriptHex: string;
  /** The zero-value P2A anchor output every virtual transaction carries. */
  isAnchor: boolean;
  /** The Arkade address this output pays, derived from its script. */
  address?: string;
  vtxo?: ArkadeVtxo;
};

/** A virtual Arkade transaction: off-chain, held by the ASP, not on Bitcoin. */
export type ArkadeVirtualTx = {
  txid: string;
  inputs: ArkadeVirtualTxInput[];
  outputs: ArkadeVirtualTxOutput[];
};

// The ephemeral anchor script (P2A), present on every virtual transaction.
const ANCHOR_SCRIPT_HEX = '51024e73';

/**
 * Look a virtual (off-chain) Arkade transaction up by txid: the indexer serves
 * its PSBT, decoded here for the inputs/outputs, and the outputs are enriched
 * with their VTXO state. Null when the indexer does not know the txid, which
 * is also the answer for any plain on-chain txid, so callers try Esplora first.
 */
export async function getArkadeVirtualTx(base: string, txid: string, opts: { signal?: AbortSignal } = {}): Promise<ArkadeVirtualTx | null> {
  const clean = txid.trim().toLowerCase();
  const vtx = await fetchVirtualTx(base, clean, opts.signal);
  if (!vtx) return null;
  const { inputs, outputs } = vtx;

  // Enrich the non-anchor outputs with their VTXO state (spent, expiry, the
  // settlement anchoring them). Decorative: a miss leaves the plain outputs.
  try {
    const query = outputs.filter(o => !o.isAnchor)
      .map(o => `outpoints=${clean}:${o.index}`).join('&');
    if (query) {
      const res = await getJson(base, `/v1/indexer/vtxos?${query}`, opts.signal) as { vtxos?: unknown };
      for (const v of Array.isArray(res.vtxos) ? res.vtxos : []) {
        const vtxo = normalizeVtxo(v as Record<string, unknown>);
        const target = outputs.find(o => o.index === vtxo.vout);
        if (target) target.vtxo = vtxo;
      }
    }
  } catch { /* keep the decoded outputs */ }

  // The addresses: a VTXO script is P2TR of its owner's taproot key, and the
  // Arkade address is that key with the operator's, so every output reads
  // back as the address it pays. An input is usually a checkpoint
  // transaction's output, which is no VTXO and no address of anyone (its key
  // is the checkpoint's); the checkpoint's own input is the coin spent, so
  // the address is read one transaction up. Decorative as well.
  try {
    const info = await cachedArkadeInfo(base, opts.signal);
    const addressOf = (scriptHex: string) => arkadeAddressOf(scriptHex, info.signerPubkey, info.network) ?? undefined;
    for (const o of outputs) {
      if (!o.isAnchor) o.address = addressOf(o.scriptHex);
    }
    const coinScript = async (outpoint: { txid: string; vout: number }): Promise<ArkadeVtxo | null> => {
      const res = await getJson(base, `/v1/indexer/vtxos?outpoints=${outpoint.txid}:${outpoint.vout}`, opts.signal) as { vtxos?: unknown };
      const v = Array.isArray(res.vtxos) ? res.vtxos[0] : undefined;
      return v ? normalizeVtxo(v as Record<string, unknown>) : null;
    };
    for (const i of inputs) {
      if (!i.txid) continue;
      const direct = await coinScript(i);
      if (direct?.scriptHex) {
        i.address = addressOf(direct.scriptHex);
        if (i.amountSats === undefined && direct.amountSats > 0) i.amountSats = direct.amountSats;
        continue;
      }
      // Not a VTXO: a checkpoint, when it has one input and one real output.
      const parent = await fetchVirtualTx(base, i.txid, opts.signal);
      if (!parent || parent.inputs.length !== 1 || parent.outputs.filter(o => !o.isAnchor).length !== 1) continue;
      const coin = await coinScript(parent.inputs[0]);
      if (coin?.scriptHex) { i.address = addressOf(coin.scriptHex); i.viaCheckpoint = true; }
    }
  } catch { /* keep the plain inputs and outputs */ }

  return { txid: clean, inputs, outputs };
}

/** Fetch a virtual transaction's PSBT and decode its inputs and outputs;
 *  null when the indexer does not know the txid. */
async function fetchVirtualTx(base: string, txid: string, signal?: AbortSignal): Promise<ArkadeVirtualTx | null> {
  let j: unknown;
  try {
    j = await getJson(base, `/v1/indexer/virtualTx/${encodeURIComponent(txid)}`, signal);
  } catch (err) {
    if (err instanceof ArkadeError && /not found/i.test(err.message)) return null;
    throw err;
  }
  const raw = (j as { txs?: unknown })?.txs;
  if (!Array.isArray(raw) || raw.length === 0 || typeof raw[0] !== 'string') return null;

  // The PSBT decoder is only needed here; loaded lazily like the SDK so it
  // stays out of the app's first load.
  const { Transaction } = await import('@scure/btc-signer');
  let tx: InstanceType<typeof Transaction>;
  try {
    const bytes = Uint8Array.from(atob(raw[0]), c => c.charCodeAt(0));
    tx = Transaction.fromPSBT(bytes, { allowUnknown: true, allowUnknownInputs: true, allowUnknownOutputs: true });
  } catch {
    throw new ArkadeError(tr('explorerArk.error.decodeVirtual'));
  }

  const inputs: ArkadeVirtualTxInput[] = [];
  for (let i = 0; i < tx.inputsLength; i++) {
    const inp = tx.getInput(i);
    inputs.push({
      txid: inp.txid ? bytesToHex(inp.txid) : '',
      vout: inp.index ?? 0,
      amountSats: inp.witnessUtxo ? Number(inp.witnessUtxo.amount) : undefined,
    });
  }
  const outputs: ArkadeVirtualTxOutput[] = [];
  for (let i = 0; i < tx.outputsLength; i++) {
    const out = tx.getOutput(i);
    const scriptHex = out.script ? bytesToHex(out.script) : '';
    outputs.push({
      index: i,
      amountSats: out.amount !== undefined ? Number(out.amount) : 0,
      scriptHex,
      isAnchor: scriptHex === ANCHOR_SCRIPT_HEX,
    });
  }
  return { txid, inputs, outputs };
}

// The operator's parameters change rarely: one fetch per gateway per session
// serves every address derivation.
const infoCache = new Map<string, ArkadeInfo>();

async function cachedArkadeInfo(base: string, signal?: AbortSignal): Promise<ArkadeInfo> {
  const hit = infoCache.get(base);
  if (hit) return hit;
  const info = await getArkadeInfo(base, { signal });
  infoCache.set(base, info);
  return info;
}

/** Arkade's unilateral exit delay is a relative timelock: in seconds (BIP68
 *  time units of 512 s) on mainnet, in blocks on some test setups. English
 *  unless a locale is given: the Ask Alice context keeps the English text. */
export function formatArkadeExitDelay(delay: number, locale: Locale = 'en'): string {
  if (delay >= 512 && delay % 512 === 0) {
    const days = delay / 86_400;
    const blocks = Math.round(delay / 600);
    return translatePlural(locale, 'explorerArk.exitDelay.days', days, { days: days % 1 === 0 ? days : days.toFixed(1), blocks: blocks.toLocaleString(formatLocale(locale)) });
  }
  return translate(locale, 'explorerArk.exitDelay.blocks', { blocks: delay.toLocaleString(formatLocale(locale)) });
}

/** One VTXO by its outpoint, from the indexer; null when it knows none. */
export async function getArkadeVtxo(base: string, txid: string, vout: number, opts: { signal?: AbortSignal } = {}): Promise<ArkadeVtxo | null> {
  const clean = txid.trim().toLowerCase();
  const res = await getJson(base, `/v1/indexer/vtxos?outpoints=${encodeURIComponent(`${clean}:${vout}`)}`, opts.signal) as { vtxos?: unknown };
  const raw = Array.isArray(res.vtxos) ? res.vtxos : [];
  const found = raw.map(v => normalizeVtxo(v as Record<string, unknown>)).find(v => v.txid === clean && v.vout === vout);
  return found ?? null;
}

/** A settlement (commitment round) seen on the live stream. */
export type ArkadeSettlement = {
  txid: string;
  /** New VTXOs created by the round. */
  spendableVtxos: number;
  /** VTXOs spent/forfeited into the round. */
  spentVtxos: number;
  /** Client clock when the event arrived (the stream carries no timestamp). */
  receivedAt: number;
};

/**
 * Subscribe to the ASP's live transaction stream and call `onSettlement` for
 * every commitment (settlement) round as it is finalized. Runs until the signal
 * aborts or the stream ends; the caller decides whether to reconnect.
 *
 * The endpoint is a server-side stream: per its own docs it has NO history, only
 * events from the moment it opens. Each event is a JSON object (SSE `data:` line
 * or a bare line); the commitment variant carries the round's txid and VTXOs.
 */
export async function subscribeSettlements(
  base: string,
  onSettlement: (s: ArkadeSettlement) => void,
  opts: { signal?: AbortSignal } = {},
): Promise<void> {
  const res = await fetch(`${base.replace(/\/+$/, '')}/v1/txs`, {
    signal: opts.signal,
    headers: { Accept: 'text/event-stream' },
  });
  if (!res.ok || !res.body) throw new ArkadeError(tr('explorerArk.error.stream', { status: res.status }));

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleLine = (line: string) => {
    const text = line.startsWith('data:') ? line.slice(5).trim() : line.trim();
    if (!text || text === ':' ) return;
    let obj: unknown;
    try { obj = JSON.parse(text); } catch { return; }
    // grpc-gateway wraps a stream message as { result: <msg> }.
    const msg = (typeof obj === 'object' && obj !== null && 'result' in obj
      ? (obj as { result: unknown }).result
      : obj) as Record<string, unknown> | null;
    const c = msg && typeof msg === 'object' ? (msg as Record<string, unknown>).commitmentTx : undefined;
    if (c && typeof c === 'object') {
      const n = c as Record<string, unknown>;
      if (typeof n.txid === 'string' && n.txid) {
        onSettlement({
          txid: n.txid,
          spendableVtxos: Array.isArray(n.spendableVtxos) ? n.spendableVtxos.length : 0,
          spentVtxos: Array.isArray(n.spentVtxos) ? n.spentVtxos.length : 0,
          receivedAt: Date.now(),
        });
      }
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      handleLine(line);
    }
  }
}
