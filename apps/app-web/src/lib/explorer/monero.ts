import { t, formatLocale } from '../../i18n/translate.ts';
// Monero, read from a public instance of the Onion Monero Blockchain Explorer
// (xmrchain.net), whose JSON API answers any origin, so it is read straight
// from the browser like mempool.space. It serves the network's state, the
// blocks, the transactions (decoded and raw) and the mempool. With a node of
// their own set in the settings, the same questions go to that node instead
// (monero-node.ts): every view reads through the functions at the end of
// this file, which pick the source at call time.
//
// What the chain shows is not what Bitcoin shows. No address is ever written
// on it: every output goes to a one-time key. Amounts are encrypted (RingCT,
// since 2017), except a coinbase's. Every input names a ring of possible
// outputs (16 today) of which one is really spent, and a key image that
// stops the same output being spent twice. So the Explorer can show the
// shape of a transaction, its fee, its rings and their ages, never who paid
// whom or how much. Who did is answered on the device, with a key the user
// holds (see monero-crypto.ts): those keys are never sent to the explorer or
// to a node.
//
// The explorer's routes that take a view key (api/outputs, outputsblocks)
// would send it to the server and are deliberately not used.
//
// P2Pool's observers (p2pool.observer) publish the blocks the pool finds, but
// sit behind a Cloudflare challenge that refuses a browser's cross-origin
// request, so they are not read. A block's coinbase says enough by itself:
// P2Pool pays every miner of its window directly, in one output each.

import { hexToBytes } from '@noble/hashes/utils.js';
import { parseTxExtra, type MoneroScanTx, type MoneroTxExtra } from './monero-crypto.ts';
import { poolFromCoinbase } from './monero-pools.ts';
import { getNodeOverride } from './node-config.ts';
import { MonerodSource } from './monero-node.ts';

export const XMRCHAIN_API = 'https://xmrchain.net/api';

/** One XMR in piconero, the chain's unit. */
export const PICONERO = BigInt(1_000_000_000_000);
/** The target time between blocks, seconds. */
export const MONERO_BLOCK_SECONDS = 120;
/** The ring size every transaction has used since 2022 (hard fork 15). */
export const MONERO_RING_SIZE = 16;

export type MoneroErrorCode = 'not-found' | 'network' | 'backend' | 'aborted';

export class MoneroError extends Error {
  readonly code: MoneroErrorCode;
  constructor(code: MoneroErrorCode, message: string) {
    super(message);
    this.name = 'MoneroError';
    this.code = code;
  }
}

export type MoneroNetworkInfo = {
  /** The newest block's height. The node counts blocks (genesis is 0), one
   *  more than this. */
  height: number;
  topBlockHash: string;
  difficulty: bigint;
  /** Hashes per second. */
  hashrate: number;
  hardForkVersion: number;
  /** Bytes. Blocks can grow past the median, paying a penalty out of the
   *  miner's reward, up to the limit. */
  blockSizeMedian: number;
  blockSizeLimit: number;
  /** The node's minimum fee, piconero per byte. */
  feePerByte: number;
  txCount: number;
  mempoolCount: number;
  /** The API names it in kilobytes, but serves bytes. A node does not say. */
  mempoolBytes?: number;
  /** Blocks the node saw that did not end up in the chain (reorganisations,
   *  orphans) since it started. */
  altBlocks: number;
};

export type MoneroTxSummary = {
  txid: string;
  coinbase: boolean;
  /** Piconero. */
  fee: bigint;
  size: number;
  rctType: number;
  version: number;
  /** Ring size; 0 on a coinbase. */
  ringSize: number;
  /** The amount in clear (a coinbase's outputs), else 0. */
  clearOutputs: bigint;
  /** Unix seconds; on a mempool entry, when the node first saw it. */
  timestamp?: number;
  /** The tx_extra field, hex: kept for a coinbase, whose shape can name the
   *  pool that mined it. */
  extra?: string;
};

export type MoneroBlockSummary = {
  height: number;
  hash: string;
  timestamp: number;
  size: number;
  txCount: number;
  /** The coinbase's outputs: the block subsidy plus the fees, piconero. */
  reward: bigint;
  fees: bigint;
  coinbaseTxid?: string;
  /** The pool, when the coinbase's shape tells (P2Pool); see monero-pools.ts
   *  for the names the pools publish. */
  poolName?: string;
};

export type MoneroBlock = MoneroBlockSummary & {
  currentHeight: number;
  txs: MoneroTxSummary[];
};

export type MoneroRingMember = {
  /** The block the member output was created in. */
  height: number;
  /** The transaction that created it. */
  txid: string;
  /** Its one-time key. */
  key: string;
};

export type MoneroInput = {
  keyImage: string;
  /** The ring, in the order the chain stores it (by global output index,
   *  so oldest first). The real spend is one of them. */
  ring: MoneroRingMember[];
};

export type MoneroOutput = {
  index: number;
  key: string;
  viewTag?: string;
  /** Piconero when in clear, else 0. */
  clearAmount: bigint;
  encryptedAmount?: string;
  encryptedMask?: string;
  commitment?: string;
};

export type MoneroTx = {
  txid: string;
  version: number;
  rctType: number;
  coinbase: boolean;
  fee: bigint;
  size: number;
  /** 0 when spendable as usual (after 10 blocks); a height or a time
   *  otherwise. */
  unlockTime: number;
  extra: MoneroTxExtra;
  extraBytes: Uint8Array;
  /** Null while in the mempool. */
  blockHeight: number | null;
  /** Unix seconds: the block's time, or when the node first saw it. */
  timestamp: number;
  confirmations: number;
  currentHeight: number;
  inputs: MoneroInput[];
  outputs: MoneroOutput[];
};

export type MoneroEmission = {
  /** The height the totals run to. */
  height: number;
  /** Every coin ever created, piconero. */
  supply: bigint;
  /** Every fee ever paid, piconero. */
  fees: bigint;
};

export type RequestOptions = { signal?: AbortSignal };

const TIMEOUT_MS = 15_000;

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let res: Response;
  try {
    res = await fetch(url, { signal: combined, headers: { Accept: 'application/json' } });
  } catch (e) {
    if (signal?.aborted) throw new MoneroError('aborted', 'Cancelled.');
    throw new MoneroError('network', `Could not reach ${new URL(url).host}${e instanceof Error && e.name === 'TimeoutError' ? ' (timed out)' : ''}.`);
  }
  if (!res.ok) throw new MoneroError('backend', `${new URL(url).host} answered ${res.status}.`);
  try {
    return await res.json();
  } catch {
    throw new MoneroError('backend', `${new URL(url).host} sent something that is not JSON.`);
  }
}

/** The explorer wraps every answer as { status, data }; a failed lookup is
 *  status "fail" with a title saying what it could not find. */
async function api(path: string, opts: RequestOptions = {}): Promise<Record<string, unknown>> {
  const body = await fetchJson(`${XMRCHAIN_API}/${path}`, opts.signal);
  const r = body as { status?: unknown; data?: unknown; message?: unknown };
  if (r?.status === 'success' && r.data && typeof r.data === 'object') return r.data as Record<string, unknown>;
  const title = r?.data && typeof r.data === 'object'
    ? String((r.data as { title?: unknown }).title ?? '')
    : typeof r?.message === 'string' ? r.message : '';
  if (/can'?t find|not found|no such/i.test(title)) throw new MoneroError('not-found', title);
  throw new MoneroError('backend', title || 'The explorer could not answer.');
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : 0;
}

/** A piconero amount; the API writes the large ones as strings. */
function pico(v: unknown): bigint {
  if (typeof v === 'string' && /^\d+$/.test(v)) return BigInt(v);
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return BigInt(Math.round(v));
  return BigInt(0);
}

function hex(v: unknown): string {
  return typeof v === 'string' && /^[0-9a-f]*$/i.test(v) ? v.toLowerCase() : '';
}

/** tx_extra comes as hex in the decoded views and as a byte list in the raw
 *  one. */
function extraBytes(v: unknown): Uint8Array {
  if (Array.isArray(v)) return Uint8Array.from(v.map(b => num(b) & 0xff));
  const h = hex(v);
  return h.length % 2 === 0 ? hexToBytes(h) : new Uint8Array();
}

async function xmrchainNetworkInfo(opts: RequestOptions = {}): Promise<MoneroNetworkInfo> {
  const d = await api('networkinfo', opts);
  return {
    height: Math.max(0, num(d.height) - 1),
    topBlockHash: hex(d.top_block_hash),
    difficulty: pico(d.difficulty),
    hashrate: num(d.hash_rate),
    hardForkVersion: num(d.current_hf_version),
    blockSizeMedian: num(d.block_size_median),
    blockSizeLimit: num(d.block_size_limit),
    feePerByte: num(d.fee_estimate),
    txCount: num(d.tx_count),
    mempoolCount: num(d.tx_pool_size),
    mempoolBytes: num(d.tx_pool_size_kbytes),
    altBlocks: num(d.alt_blocks_count),
  };
}

async function xmrchainEmission(opts: RequestOptions = {}): Promise<MoneroEmission> {
  const d = await api('emission', opts);
  return { height: num(d.blk_no), supply: pico(d.coinbase), fees: pico(d.fee) };
}

function txSummary(t: Record<string, unknown>): MoneroTxSummary {
  const coinbase = t.coinbase === true;
  return {
    txid: hex(t.tx_hash),
    coinbase,
    fee: pico(t.tx_fee),
    size: num(t.tx_size),
    rctType: num(t.rct_type),
    version: num(t.tx_version),
    ringSize: coinbase ? 0 : num(t.mixin),
    clearOutputs: pico(t.xmr_outputs),
    ...(t.timestamp !== undefined ? { timestamp: num(t.timestamp) } : {}),
    ...(coinbase && hex(t.extra) ? { extra: hex(t.extra) } : {}),
  };
}

function blockSummary(b: Record<string, unknown>): MoneroBlockSummary & { txs: MoneroTxSummary[] } {
  const txs = Array.isArray(b.txs) ? b.txs.map(t => txSummary(t as Record<string, unknown>)) : [];
  const coinbase = txs.find(t => t.coinbase);
  const pool = coinbase ? poolFromCoinbase(coinbase.extra, coinbase.size) : null;
  return {
    height: num(b.height ?? b.block_height),
    hash: hex(b.hash),
    timestamp: num(b.timestamp),
    size: num(b.size),
    txCount: txs.length,
    reward: coinbase?.clearOutputs ?? BigInt(0),
    fees: txs.reduce((sum, t) => sum + t.fee, BigInt(0)),
    coinbaseTxid: coinbase?.txid,
    ...(pool ? { poolName: pool } : {}),
    txs,
  };
}

/** A page of blocks with their transactions, newest first: page 0 starts at
 *  the tip, page p `p * limit` blocks below it. */
async function xmrchainBlocksPage(page: number, limit: number, opts: RequestOptions = {}): Promise<{
  currentHeight: number;
  blocks: (MoneroBlockSummary & { txs: MoneroTxSummary[] })[];
}> {
  const d = await api(`transactions?page=${Math.max(0, Math.floor(page))}&limit=${Math.max(1, Math.min(limit, 50))}`, opts);
  const blocks = Array.isArray(d.blocks) ? d.blocks : [];
  return { currentHeight: num(d.current_height), blocks: blocks.map(b => blockSummary(b as Record<string, unknown>)) };
}

/** A block by height or hash. */
async function xmrchainBlock(heightOrHash: string, opts: RequestOptions = {}): Promise<MoneroBlock> {
  const id = heightOrHash.trim().toLowerCase();
  if (!/^\d{1,9}$/.test(id) && !/^[0-9a-f]{64}$/.test(id)) throw new MoneroError('not-found', 'Not a block height or hash.');
  const d = await api(`block/${id}`, opts);
  return { ...blockSummary(d), currentHeight: num(d.current_height) };
}

/** The transactions waiting in the node's mempool, newest first. */
async function xmrchainMempool(limit = 25, opts: RequestOptions = {}): Promise<MoneroTxSummary[]> {
  const d = await api(`mempool?limit=${Math.max(1, Math.min(limit, 1000))}`, opts);
  return Array.isArray(d.txs) ? d.txs.map(t => txSummary(t as Record<string, unknown>)) : [];
}

/**
 * A transaction, from two reads: the decoded view (its block, its rings and
 * their heights) and the raw one (the view tags, the encrypted amounts and
 * the commitments the on-device check needs, and the unlock time).
 */
async function xmrchainTx(txid: string, opts: RequestOptions = {}): Promise<MoneroTx> {
  const id = txid.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(id)) throw new MoneroError('not-found', 'Not a transaction id.');
  const [d, raw] = await Promise.all([api(`transaction/${id}`, opts), api(`rawtransaction/${id}`, opts)]);

  const rct = (raw.rct_signatures ?? {}) as Record<string, unknown>;
  const ecdh = Array.isArray(rct.ecdhInfo) ? rct.ecdhInfo as Record<string, unknown>[] : [];
  const outPk = Array.isArray(rct.outPk) ? rct.outPk : [];
  const vout = Array.isArray(raw.vout) ? raw.vout as Record<string, unknown>[] : [];
  const outputs: MoneroOutput[] = vout.map((o, index) => {
    const target = (o.target ?? {}) as Record<string, unknown>;
    const tagged = target.tagged_key as Record<string, unknown> | undefined;
    const key = hex(tagged?.key ?? target.key);
    const e = ecdh[index];
    return {
      index,
      key,
      ...(tagged?.view_tag !== undefined ? { viewTag: hex(tagged.view_tag) } : {}),
      clearAmount: pico(o.amount),
      ...(e && hex(e.amount) ? { encryptedAmount: hex(e.amount) } : {}),
      ...(e && hex(e.mask) && hex(e.mask) !== '0'.repeat(64) ? { encryptedMask: hex(e.mask) } : {}),
      ...(hex(outPk[index]) ? { commitment: hex(outPk[index]) } : {}),
    };
  });

  const inputs: MoneroInput[] = (Array.isArray(d.inputs) ? d.inputs : []).map(i => {
    const input = i as Record<string, unknown>;
    const mixins = Array.isArray(input.mixins) ? input.mixins as Record<string, unknown>[] : [];
    return {
      keyImage: hex(input.key_image),
      ring: mixins.map(m => ({ height: num(m.block_no), txid: hex(m.tx_hash), key: hex(m.public_key) })),
    };
  });

  const bytes = extraBytes(raw.extra);
  const height = num(d.block_height);
  return {
    txid: id,
    version: num(raw.version ?? d.tx_version),
    rctType: num(rct.type ?? d.rct_type),
    coinbase: d.coinbase === true,
    fee: pico(rct.txnFee ?? d.tx_fee),
    size: num(d.tx_size),
    unlockTime: num(raw.unlock_time),
    extra: parseTxExtra(bytes),
    extraBytes: bytes,
    blockHeight: height > 0 ? height : null,
    timestamp: num(d.timestamp),
    confirmations: num(d.confirmations),
    currentHeight: num(d.current_height),
    inputs,
    outputs,
  };
}

/** What the on-device check reads from a transaction. */
export function toScanTx(tx: MoneroTx): MoneroScanTx {
  return {
    rctType: tx.coinbase ? 0 : tx.rctType,
    extra: tx.extraBytes,
    outputs: tx.outputs.map(o => ({
      key: o.key,
      ...(o.viewTag ? { viewTag: o.viewTag } : {}),
      clearAmount: o.clearAmount,
      ...(o.encryptedAmount ? { encryptedAmount: o.encryptedAmount } : {}),
      ...(o.encryptedMask ? { encryptedMask: o.encryptedMask } : {}),
      ...(o.commitment ? { commitment: o.commitment } : {}),
    })),
  };
}

/** Whether a 64-hex id is a transaction or a block (Monero block hashes do
 *  not start with zeros, so the shape cannot tell). */
async function xmrchainResolveHash(id: string, opts: RequestOptions = {}): Promise<'tx' | 'block' | null> {
  try {
    const d = await api(`search/${id.trim().toLowerCase()}`, opts);
    if (d.title === 'block' || (d.txs !== undefined && d.hash !== undefined)) return 'block';
    if (d.tx_hash !== undefined) return 'tx';
    return null;
  } catch (e) {
    if (e instanceof MoneroError && e.code === 'not-found') return null;
    throw e;
  }
}

/* -------------------------------- Formatting ------------------------------- */

/** Piconero as XMR, trailing zeros trimmed, at most `digits` decimals. */
export function formatXmr(amount: bigint, digits = 12): string {
  const negative = amount < BigInt(0);
  const abs = negative ? -amount : amount;
  const whole = abs / PICONERO;
  let frac = (abs % PICONERO).toString().padStart(12, '0').slice(0, digits).replace(/0+$/, '');
  if (digits < 12 && frac === '' && abs % PICONERO !== BigInt(0) && whole === BigInt(0)) frac = '0'.repeat(digits - 1) + '1';
  return `${negative ? '-' : ''}${whole.toLocaleString(formatLocale())}${frac ? `${new Intl.NumberFormat(formatLocale()).formatToParts(1.1).find(p => p.type === 'decimal')?.value ?? '.'}${frac}` : ''} XMR`;
}

/** A hashrate in the largest fitting unit. */
export function formatHashrate(hs: number): string {
  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s'];
  let v = hs;
  let u = 0;
  while (v >= 1000 && u < units.length - 1) { v /= 1000; u++; }
  return `${v.toLocaleString(formatLocale(), { minimumFractionDigits: v >= 100 ? 0 : 2, maximumFractionDigits: v >= 100 ? 0 : 2 })} ${units[u]}`;
}

/** The RingCT format's name, as the protocol calls it. */
export function moneroRctLabel(rctType: number, coinbase = false): string {
  if (coinbase) return t('explorerMonero.rct.coinbase');
  switch (rctType) {
    case 0: return t('explorerMonero.rct.before');
    case 1: return t('explorerMonero.rct.full');
    case 2: return t('explorerMonero.rct.simple');
    case 3: return t('explorerMonero.rct.bulletproofs');
    case 4: return t('explorerMonero.rct.compact');
    case 5: return t('explorerMonero.rct.clsag');
    case 6: return t('explorerMonero.rct.plus');
    default: return t('explorerMonero.rct.unknown', { type: rctType });
  }
}

/** A duration in blocks, as a human reads it (2 minutes each). */
export function formatBlockAge(blocks: number): string {
  const minutes = blocks * 2;
  if (minutes < 120) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${Math.round(hours)} h`;
  const days = hours / 24;
  if (days < 60) return t('explorerMonero.age.days', { count: Math.round(days) });
  const months = days / 30.44;
  if (months < 24) return t('explorerMonero.age.months', { count: Math.round(months) });
  return t('explorerMonero.age.years', { count: (days / 365.25).toLocaleString(formatLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) });
}

/* --------------------------------- Sources -------------------------------- */

/** What every Monero view reads: the public explorer or the user's node. */
export interface MoneroSource {
  /** The host, for the data-source notices. */
  readonly name: string;
  getNetworkInfo(opts?: RequestOptions): Promise<MoneroNetworkInfo>;
  /** The supply; the public explorer only (a restricted node does not
   *  serve it). */
  getEmission?(opts?: RequestOptions): Promise<MoneroEmission>;
  getBlocksPage(page: number, limit: number, opts?: RequestOptions): Promise<{ currentHeight: number; blocks: (MoneroBlockSummary & { txs: MoneroTxSummary[] })[] }>;
  getBlock(heightOrHash: string, opts?: RequestOptions): Promise<MoneroBlock>;
  getMempool(limit: number, opts?: RequestOptions): Promise<MoneroTxSummary[]>;
  getTx(txid: string, opts?: RequestOptions): Promise<MoneroTx>;
  resolveHash(id: string, opts?: RequestOptions): Promise<'tx' | 'block' | null>;
}

export const xmrchainSource: MoneroSource = {
  name: 'xmrchain.net',
  getNetworkInfo: xmrchainNetworkInfo,
  getEmission: xmrchainEmission,
  getBlocksPage: xmrchainBlocksPage,
  getBlock: xmrchainBlock,
  getMempool: xmrchainMempool,
  getTx: xmrchainTx,
  resolveHash: xmrchainResolveHash,
};

/** The network id the Monero node setting is stored under. */
export const MONERO_NETWORK_ID = 'monero';

let nodeSource: { url: string; source: MoneroSource } | null = null;

/** The source the settings point at: the user's node when one is set, else
 *  the public explorer. Read at every call, so a saved setting applies to
 *  the next request. */
export function activeMoneroSource(): MoneroSource {
  const url = getNodeOverride(MONERO_NETWORK_ID);
  if (!url) return xmrchainSource;
  if (nodeSource?.url !== url) nodeSource = { url, source: new MonerodSource(url) };
  return nodeSource.source;
}

/** True when Monero is read from the user's own node. */
export function isUsingMoneroNode(): boolean {
  return getNodeOverride(MONERO_NETWORK_ID) !== '';
}

export function getMoneroNetworkInfo(opts?: RequestOptions): Promise<MoneroNetworkInfo> {
  return activeMoneroSource().getNetworkInfo(opts);
}

export function getMoneroEmission(opts?: RequestOptions): Promise<MoneroEmission> {
  const source = activeMoneroSource();
  if (!source.getEmission) return Promise.reject(new MoneroError('backend', 'A node does not serve the supply.'));
  return source.getEmission(opts);
}

export function getMoneroBlocksPage(page: number, limit: number, opts?: RequestOptions): ReturnType<MoneroSource['getBlocksPage']> {
  return activeMoneroSource().getBlocksPage(page, limit, opts);
}

export function getMoneroBlock(heightOrHash: string, opts?: RequestOptions): Promise<MoneroBlock> {
  return activeMoneroSource().getBlock(heightOrHash, opts);
}

export function getMoneroMempool(limit = 25, opts?: RequestOptions): Promise<MoneroTxSummary[]> {
  return activeMoneroSource().getMempool(limit, opts);
}

export function getMoneroTx(txid: string, opts?: RequestOptions): Promise<MoneroTx> {
  return activeMoneroSource().getTx(txid, opts);
}

export function resolveMoneroHash(id: string, opts?: RequestOptions): Promise<'tx' | 'block' | null> {
  return activeMoneroSource().resolveHash(id, opts);
}
