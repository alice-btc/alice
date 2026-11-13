// Monero read from the user's own node: monerod's RPC, in the shapes the
// Explorer's Monero views already use (monero.ts). With a node of their own,
// nobody but that node sees which transaction or block a user looks at.
//
// What is used is the restricted RPC, the one a public or a remote node
// exposes (`--restricted-rpc`, port 18089 by convention): /json_rpc with
// hard_fork_info, get_fee_estimate, get_block, get_block_headers_range,
// get_block_header_by_hash; and the plain routes /get_info, /get_height,
// /get_transactions (decoded as JSON), /get_outs and
// /get_transaction_pool_hashes. Nothing here needs the unrestricted RPC.
//
// A browser can only talk to a node that allows its origin:
// `--rpc-access-control-origins=https://app.alicebtc.com` (or `*`) on
// monerod, and HTTPS, or a plain http:// node on the same computer. The
// desktop app has no such limit. The supply (the emission) is not served by
// the restricted RPC, so it is not shown on a node. A browser also sends
// every request to the node down one connection, which monerod serves one
// request at a time: a node on the same network answers in milliseconds and
// nothing shows, a distant public one fills the ribbon over a minute or two.
//
// Two things cost more than on the public explorer, which indexes them:
// a block's fee statistics (its transactions are fetched, two requests per
// block, kept in memory afterwards; a page of the ribbon does that for its
// blocks, a page read for the pool share gets its coinbases in one request
// instead), and the members of a ring (their global indices are resolved by
// one get_outs call). Bulk reads ask for pruned transactions: the signatures
// (the prunable part, most of a transaction's bytes) are what a node is slow
// to serve, and the fee, the ring size and the outputs are in the rest. A
// pruned transaction's full size is then estimated from its shape; a single
// transaction's page reads it whole, so its size is exact.

import { hexToBytes } from '@noble/hashes/utils.js';
import { parseTxExtra } from './monero-crypto.ts';
import { poolFromCoinbase } from './monero-pools.ts';
import {
  MoneroError, type MoneroBlock, type MoneroBlockSummary, type MoneroInput, type MoneroNetworkInfo, type MoneroOutput,
  type MoneroSource, type MoneroTx, type MoneroTxSummary, type RequestOptions,
} from './monero.ts';

const TIMEOUT_MS = 15_000;
/** Bulk reads (a block's transactions, the mempool) may take longer. */
const BULK_TIMEOUT_MS = 40_000;
/** New mempool transactions read per poll, at most; the rest wait for the
 *  next one. Read in small batches, each a second or two on a node, rather
 *  than one request a slow node takes half a minute to answer. */
const MAX_NEW_POOL_TXS = 120;
const POOL_BATCH = 25;
/** Requests in flight to the node at once, and heavy ones among them. A
 *  node serves a few heavy reads far better than twenty at a time, which a
 *  browser would also queue on its own six connections and time out one by
 *  one; and a light request (a height, headers, the pool's hashes) never
 *  waits behind the heavy ones, so the ribbon's poll comes back on time
 *  whatever the node is busy with. */
const MAX_IN_FLIGHT = 4;
const MAX_BULK_IN_FLIGHT = 2;
/** How long a page of the ribbon waits for its blocks' transactions before
 *  answering with headers for the ones still loading; those keep loading
 *  and are complete at the next poll. A node on the same network answers
 *  well within it; a distant one shows its fees a poll later. */
const PAGE_WAIT_MS = 6_000;
/** A page this long or shorter (the ribbon's) gets every block's
 *  transactions; a longer one (the pool share's hundred) gets headers and
 *  coinbases only. */
const MAX_FULL_PAGE = 12;
/** Ring members resolved in one get_outs call, at most (32 inputs of 16). */
const MAX_OUTS_PER_CALL = 512;

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : 0;
}

function pico(v: unknown): bigint {
  if (typeof v === 'string' && /^\d+$/.test(v)) return BigInt(v);
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return BigInt(Math.round(v));
  return BigInt(0);
}

function hex(v: unknown): string {
  return typeof v === 'string' && /^[0-9a-f]*$/i.test(v) ? v.toLowerCase() : '';
}

/** tx_extra as monerod writes it in JSON: a list of bytes. */
function extraBytes(v: unknown): Uint8Array {
  if (Array.isArray(v)) return Uint8Array.from(v.map(b => num(b) & 0xff));
  const h = hex(v);
  return h.length % 2 === 0 ? hexToBytes(h) : new Uint8Array();
}

function toHex(b: Uint8Array): string {
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}

/** The URL as typed in the settings, cleaned: a scheme, a host, maybe a
 *  port, no path. */
export function normalizeMoneroNodeUrl(raw: string): string {
  const s = raw.trim().replace(/\/+$/, '');
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `http://${s}`;
}

/** A decoded transaction as monerod's JSON writes it. */
type RpcTxJson = {
  version?: number;
  unlock_time?: number;
  vin?: { key?: { amount?: number; key_offsets?: number[]; k_image?: string }; gen?: { height?: number } }[];
  vout?: { amount?: number; target?: { key?: string; tagged_key?: { key?: string; view_tag?: string } } }[];
  extra?: number[];
  rct_signatures?: { type?: number; txnFee?: number; ecdhInfo?: { amount?: string; mask?: string }[]; outPk?: string[] };
};

type RpcTxEntry = {
  tx_hash?: string;
  as_hex?: string;
  pruned_as_hex?: string;
  as_json?: string;
  block_height?: number;
  block_timestamp?: number;
  confirmations?: number;
  in_pool?: boolean;
};

type RpcBlockHeader = {
  height?: number;
  hash?: string;
  timestamp?: number;
  block_size?: number;
  num_txes?: number;
  reward?: number;
  miner_tx_hash?: string;
  /** Blocks on top of this one: the tip is height + depth. */
  depth?: number;
};

/**
 * The bytes a pruned transaction is missing: its signatures and range
 * proofs, from its shape. CLSAG (types 5 and 6): per input, ring + 2
 * scalars and a pseudo-output; MLSAG (type 4): per input, 2 scalars per
 * ring member plus one, and a pseudo-output; Bulletproofs+ (type 6): 6
 * elements plus 2 per round, Bulletproofs (4 and 5): 9 plus 2 per round,
 * the rounds covering 64 bits per output, padded to a power of 2. Older
 * formats are not estimated.
 */
export function prunableBytes(rctType: number, inputs: number, ringSize: number, outputs: number): number {
  const rounds = Math.ceil(Math.log2(64 * Math.max(1, outputs)));
  if (rctType === 6) return inputs * (32 * (ringSize + 2) + 32) + 32 * (6 + 2 * rounds);
  if (rctType === 5) return inputs * (32 * (ringSize + 2) + 32) + 32 * (9 + 2 * rounds);
  if (rctType === 4) return inputs * (32 * (2 * ringSize + 1) + 32) + 32 * (9 + 2 * rounds);
  return 0;
}

/** Key offsets are written relative to the previous one; the chain indexes
 *  outputs globally. */
export function absoluteOffsets(offsets: number[]): number[] {
  const out: number[] = [];
  let at = 0;
  for (const o of offsets) { at += o; out.push(at); }
  return out;
}

export class MonerodSource implements MoneroSource {
  readonly name: string;
  private readonly base: string;
  // The gate on requests in flight: a waiting request is a resolver in one
  // of these queues, admitted when another request finishes, light ones
  // first.
  private inFlight = 0;
  private bulkInFlight = 0;
  private readonly lightWaiting: (() => void)[] = [];
  private readonly bulkWaiting: (() => void)[] = [];
  // Blocks never change once in the chain: a block's transactions, once
  // read, serve every later page and the block map.
  private readonly blockCache = new Map<string, MoneroBlock>();
  // The blocks being read right now, by height or hash: a poll that comes
  // round while the previous one's reads are still in flight joins them
  // rather than starting them again.
  private readonly blockReads = new Map<string, Promise<MoneroBlock>>();
  // A waiting transaction does not change either: each poll of the mempool
  // reads the newcomers only, and the ones being read are not asked twice.
  private readonly poolCache = new Map<string, MoneroTxSummary>();
  private readonly poolReads = new Set<string>();

  constructor(baseUrl: string) {
    this.base = normalizeMoneroNodeUrl(baseUrl);
    try { this.name = new URL(this.base).host; } catch { this.name = this.base; }
  }

  private canStart(bulk: boolean): boolean {
    return this.inFlight < MAX_IN_FLIGHT && (!bulk || this.bulkInFlight < MAX_BULK_IN_FLIGHT);
  }

  // Counted on admission, by whoever admits (the caller itself, or the
  // request that finished), so two requests never slip through one slot.
  private admit(bulk: boolean): void {
    this.inFlight += 1;
    if (bulk) this.bulkInFlight += 1;
  }

  private release(): void {
    if (this.lightWaiting.length > 0 && this.canStart(false)) { this.admit(false); this.lightWaiting.shift()!(); return; }
    if (this.bulkWaiting.length > 0 && this.canStart(true)) { this.admit(true); this.bulkWaiting.shift()!(); }
  }

  private async gate<T>(bulk: boolean, work: () => Promise<T>): Promise<T> {
    if (this.canStart(bulk)) this.admit(bulk);
    else await new Promise<void>(resolve => (bulk ? this.bulkWaiting : this.lightWaiting).push(resolve));
    try {
      return await work();
    } finally {
      this.inFlight -= 1;
      if (bulk) this.bulkInFlight -= 1;
      this.release();
    }
  }

  /** A heavy request is one that reads several transactions at once. */
  private post(path: string, body: unknown, opts?: RequestOptions, timeoutMs = TIMEOUT_MS): Promise<Record<string, unknown>> {
    const bulk = path === '/get_transactions' && Array.isArray((body as { txs_hashes?: unknown[] }).txs_hashes) && (body as { txs_hashes: unknown[] }).txs_hashes.length > 1;
    return this.gate(bulk, () => this.postNow(path, body, opts, timeoutMs));
  }

  private async postNow(path: string, body: unknown, opts?: RequestOptions, timeoutMs = TIMEOUT_MS): Promise<Record<string, unknown>> {
    if (opts?.signal?.aborted) throw new MoneroError('aborted', 'Cancelled.');
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = opts?.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;
    let res: Response;
    try {
      res = await fetch(`${this.base}${path}`, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (opts?.signal?.aborted) throw new MoneroError('aborted', 'Cancelled.');
      throw new MoneroError('network', `Could not reach your node at ${this.name}${timeout.aborted ? ' (timed out)' : ''}. A browser needs the node to allow this origin (--rpc-access-control-origins).`);
    }
    if (!res.ok) throw new MoneroError('backend', `Your node at ${this.name} answered ${res.status}.`);
    try {
      return await res.json() as Record<string, unknown>;
    } catch {
      if (opts?.signal?.aborted) throw new MoneroError('aborted', 'Cancelled.');
      if (timeout.aborted) throw new MoneroError('network', `Your node at ${this.name} took too long to answer.`);
      throw new MoneroError('backend', `Your node at ${this.name} sent something that is not JSON.`);
    }
  }

  private async rpc(method: string, params: Record<string, unknown> = {}, opts?: RequestOptions): Promise<Record<string, unknown>> {
    const body = await this.post('/json_rpc', { jsonrpc: '2.0', id: '0', method, params }, opts);
    const error = body.error as { code?: number; message?: string } | undefined;
    if (error) {
      const message = String(error.message ?? 'unknown error');
      // A height past the tip, a hash the node has no block for.
      if (/greater than|can't get block|not found|invalid/i.test(message)) throw new MoneroError('not-found', message);
      throw new MoneroError('backend', `Your node answered: ${message}`);
    }
    const result = body.result as Record<string, unknown> | undefined;
    if (!result) throw new MoneroError('backend', 'Your node sent no result.');
    return result;
  }

  async getNetworkInfo(opts?: RequestOptions): Promise<MoneroNetworkInfo> {
    const none: Record<string, unknown> = {};
    const [info, fork, fee] = await Promise.all([
      this.post('/get_info', {}, opts),
      this.rpc('hard_fork_info', {}, opts).catch(() => none),
      this.rpc('get_fee_estimate', {}, opts).catch(() => none),
    ]);
    return {
      height: Math.max(0, num(info.height) - 1),
      topBlockHash: hex(info.top_block_hash),
      difficulty: pico(info.difficulty),
      // The hashrate is the difficulty over the target block time.
      hashrate: num(info.difficulty) / Math.max(1, num(info.target) || 120),
      hardForkVersion: num(fork.version),
      blockSizeMedian: num(info.block_weight_median ?? info.block_size_median),
      blockSizeLimit: num(info.block_size_limit),
      feePerByte: num(fee.fee),
      txCount: num(info.tx_count),
      mempoolCount: num(info.tx_pool_size),
      altBlocks: num(info.alt_blocks_count),
    };
  }

  /** The transactions behind a list of hashes, decoded. Hashes the node does
   *  not know are left out. Pruned by default (see the top of the file); a
   *  whole transaction is read for its own page only. */
  private async transactions(hashes: string[], opts?: RequestOptions, whole = false): Promise<RpcTxEntry[]> {
    if (hashes.length === 0) return [];
    const body = await this.post('/get_transactions', { txs_hashes: hashes, decode_as_json: true, ...(whole ? {} : { prune: true }) }, opts, whole ? TIMEOUT_MS : BULK_TIMEOUT_MS);
    return Array.isArray(body.txs) ? body.txs as RpcTxEntry[] : [];
  }

  /** A transaction's size: exact when read whole, else the pruned bytes
   *  plus what the signatures would weigh. */
  private size(entry: RpcTxEntry, json: RpcTxJson): number {
    const whole = Math.floor((entry.as_hex?.length ?? 0) / 2);
    if (whole > 0) return whole;
    const pruned = Math.floor((entry.pruned_as_hex?.length ?? 0) / 2);
    const vins = json.vin ?? [];
    if (vins[0]?.gen) return pruned;
    return pruned + prunableBytes(num(json.rct_signatures?.type), vins.length, vins[0]?.key?.key_offsets?.length ?? 0, json.vout?.length ?? 0);
  }

  private summary(entry: RpcTxEntry, json: RpcTxJson): MoneroTxSummary {
    const coinbase = !!json.vin?.[0]?.gen;
    const extra = extraBytes(json.extra);
    return {
      txid: hex(entry.tx_hash),
      coinbase,
      fee: coinbase ? BigInt(0) : pico(json.rct_signatures?.txnFee),
      size: this.size(entry, json),
      rctType: num(json.rct_signatures?.type),
      version: num(json.version),
      ringSize: coinbase ? 0 : (json.vin?.[0]?.key?.key_offsets?.length ?? 0),
      clearOutputs: (json.vout ?? []).reduce((sum, o) => sum + pico(o.amount), BigInt(0)),
      ...(entry.block_timestamp ? { timestamp: num(entry.block_timestamp) } : {}),
      ...(coinbase && extra.length ? { extra: toHex(extra) } : {}),
    };
  }

  private parseJson(entry: RpcTxEntry): RpcTxJson {
    try { return JSON.parse(entry.as_json ?? '{}') as RpcTxJson; } catch { return {}; }
  }

  /** A block with its transactions: one get_block, one get_transactions,
   *  shared with any other caller asking for the same block meanwhile. */
  private block(ref: { height: number } | { hash: string }, opts?: RequestOptions): Promise<MoneroBlock> {
    const key = 'height' in ref ? `h${ref.height}` : ref.hash;
    const running = this.blockReads.get(key);
    if (running) return running;
    const read = this.readBlock(ref, opts).finally(() => this.blockReads.delete(key));
    this.blockReads.set(key, read);
    return read;
  }

  private async readBlock(ref: { height: number } | { hash: string }, opts?: RequestOptions): Promise<MoneroBlock> {
    const r = await this.rpc('get_block', ref, opts);
    const header = (r.block_header ?? {}) as RpcBlockHeader;
    const hash = hex(header.hash);
    const cached = this.blockCache.get(hash);
    const height = num(header.height);
    const tipHeight = height + num(header.depth);
    if (cached) return { ...cached, currentHeight: tipHeight };
    let blockJson: { miner_tx?: RpcTxJson; tx_hashes?: string[] } = {};
    try { blockJson = JSON.parse(String(r.json ?? '{}')); } catch { /* headers only */ }
    const hashes = Array.isArray(r.tx_hashes) ? (r.tx_hashes as string[]).map(hex).filter(Boolean) : [];
    const minerHash = hex(r.miner_tx_hash ?? header.miner_tx_hash);
    // One read for the block's transactions, the coinbase among them: it
    // comes with the block itself but without its size (a coinbase has no
    // prunable part, so pruned is whole). Should the node not serve it, the
    // size is estimated from its outputs (about 40 bytes each, plus extra).
    const entries = await this.transactions(minerHash ? [minerHash, ...hashes] : hashes, opts);
    const txs: MoneroTxSummary[] = entries.filter(e => hex(e.tx_hash) !== minerHash).map(e => this.summary(e, this.parseJson(e)));
    const miner = blockJson.miner_tx;
    if (miner && minerHash) {
      const minerEntry = entries.find(e => hex(e.tx_hash) === minerHash);
      const summary = this.summary({ tx_hash: minerHash, as_hex: minerEntry?.pruned_as_hex || minerEntry?.as_hex || 'x'.repeat(2 * (40 * (miner.vout?.length ?? 1) + (miner.extra?.length ?? 0) + 20)), block_timestamp: header.timestamp }, miner);
      txs.unshift(summary);
    }
    const coinbaseSummary = txs.find(t => t.coinbase);
    const block: MoneroBlock = {
      height,
      hash,
      timestamp: num(header.timestamp),
      size: num(header.block_size),
      txCount: txs.length,
      reward: pico(header.reward),
      fees: txs.reduce((sum, t) => sum + t.fee, BigInt(0)),
      ...(minerHash ? { coinbaseTxid: minerHash } : {}),
      ...(coinbaseSummary && poolFromCoinbase(coinbaseSummary.extra, coinbaseSummary.size) ? { poolName: 'P2Pool' } : {}),
      currentHeight: tipHeight,
      txs,
    };
    this.blockCache.set(hash, block);
    while (this.blockCache.size > 300) this.blockCache.delete(this.blockCache.keys().next().value!);
    return block;
  }

  private async height(opts?: RequestOptions): Promise<number> {
    const r = await this.post('/get_height', {}, opts);
    return Math.max(0, num(r.height) - 1);
  }

  async getBlocksPage(page: number, limit: number, opts?: RequestOptions): Promise<{ currentHeight: number; blocks: (MoneroBlockSummary & { txs: MoneroTxSummary[] })[] }> {
    const tip = await this.height(opts);
    const end = tip - Math.max(0, Math.floor(page)) * limit;
    const start = Math.max(0, end - limit + 1);
    if (end < 0) return { currentHeight: tip + 1, blocks: [] };
    const r = await this.rpc('get_block_headers_range', { start_height: start, end_height: end }, opts);
    const headers = (Array.isArray(r.headers) ? r.headers as RpcBlockHeader[] : []).sort((a, b) => num(b.height) - num(a.height));
    const full = limit <= MAX_FULL_PAGE;
    // A long page: the coinbases of every block not yet known, in one
    // request, enough to tell a P2Pool block and a coinbase's layout.
    const coinbases = new Map<string, MoneroTxSummary>();
    if (!full) {
      const wanted = headers.filter(h => !this.blockCache.has(hex(h.hash))).map(h => hex(h.miner_tx_hash)).filter(Boolean);
      for (const e of await this.transactions(wanted, opts).catch(() => [])) coinbases.set(hex(e.tx_hash), this.summary(e, this.parseJson(e)));
    }
    const headerOnly = (h: RpcBlockHeader) => {
      const coinbase = coinbases.get(hex(h.miner_tx_hash));
      return {
        height: num(h.height), hash: hex(h.hash), timestamp: num(h.timestamp), size: num(h.block_size),
        txCount: num(h.num_txes) + 1, reward: pico(h.reward), fees: BigInt(0),
        ...(hex(h.miner_tx_hash) ? { coinbaseTxid: hex(h.miner_tx_hash) } : {}),
        ...(coinbase && poolFromCoinbase(coinbase.extra, coinbase.size) ? { poolName: 'P2Pool' } : {}),
        txs: coinbase ? [coinbase] : [] as MoneroTxSummary[],
      };
    };
    // A full page waits a while for its blocks; one still loading when the
    // wait is over goes out with its header, and lands in the cache for the
    // next poll. Its read is not cancelled with the page: it is the next
    // poll's answer.
    const deadline = new Promise<'late'>(resolve => setTimeout(() => resolve('late'), PAGE_WAIT_MS));
    const blocks = await Promise.all(headers.map(async h => {
      const known = this.blockCache.get(hex(h.hash));
      if (known) return known;
      if (!full) return headerOnly(h);
      const read = this.block({ height: num(h.height) }).catch((e: unknown) => {
        // Quiet in the view (the header stands in), loud in the console: a
        // node that cannot serve its blocks is worth a line.
        console.warn(`Monero node: block ${num(h.height)} could not be read`, e);
        return null;
      });
      const first = await Promise.race([read, deadline]);
      return first && first !== 'late' ? first : headerOnly(h);
    }));
    return { currentHeight: tip + 1, blocks };
  }

  async getBlock(heightOrHash: string, opts?: RequestOptions): Promise<MoneroBlock> {
    const id = heightOrHash.trim().toLowerCase();
    if (/^\d{1,9}$/.test(id)) return this.block({ height: Number(id) }, opts);
    if (/^[0-9a-f]{64}$/.test(id)) return this.block({ hash: id }, opts);
    throw new MoneroError('not-found', 'Not a block height or hash.');
  }

  /** The mempool: its hashes now, its transactions as they come. New ones
   *  are read in batches; the poll waits a while for them, then answers
   *  with what it holds, the rest landing by the next poll. A cancelled
   *  poll does not cancel the reads: they are the next poll's answer. */
  async getMempool(limit: number, opts?: RequestOptions): Promise<MoneroTxSummary[]> {
    const r = await this.post('/get_transaction_pool_hashes', {}, opts);
    const hashes = (Array.isArray(r.tx_hashes) ? r.tx_hashes as string[] : []).map(hex).filter(Boolean).slice(0, Math.max(1, limit));
    const fresh = hashes.filter(h => !this.poolCache.has(h) && !this.poolReads.has(h)).slice(0, MAX_NEW_POOL_TXS);
    const reads: Promise<void>[] = [];
    for (let i = 0; i < fresh.length; i += POOL_BATCH) {
      const batch = fresh.slice(i, i + POOL_BATCH);
      for (const h of batch) this.poolReads.add(h);
      reads.push(this.transactions(batch).then(entries => {
        for (const e of entries) {
          const t = this.summary(e, this.parseJson(e));
          if (t.txid) this.poolCache.set(t.txid, t);
        }
      }).catch(() => undefined).finally(() => { for (const h of batch) this.poolReads.delete(h); }));
    }
    await Promise.race([Promise.all(reads), new Promise(resolve => setTimeout(resolve, PAGE_WAIT_MS))]);
    // What left the pool (mined or dropped) leaves the memory too.
    const inPool = new Set(hashes);
    for (const h of this.poolCache.keys()) if (!inPool.has(h)) this.poolCache.delete(h);
    return hashes.flatMap(h => { const t = this.poolCache.get(h); return t ? [t] : []; });
  }

  async getTx(txid: string, opts?: RequestOptions): Promise<MoneroTx> {
    const id = txid.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(id)) throw new MoneroError('not-found', 'Not a transaction id.');
    const [entries, tip] = await Promise.all([this.transactions([id], opts, true), this.height(opts)]);
    const entry = entries.find(e => hex(e.tx_hash) === id);
    if (!entry) throw new MoneroError('not-found', 'Your node has no such transaction.');
    const json = this.parseJson(entry);
    const coinbase = !!json.vin?.[0]?.gen;
    const rct = json.rct_signatures ?? {};
    const ecdh = rct.ecdhInfo ?? [];
    const outPk = rct.outPk ?? [];
    const outputs: MoneroOutput[] = (json.vout ?? []).map((o, index) => {
      const tagged = o.target?.tagged_key;
      const e = ecdh[index];
      return {
        index,
        key: hex(tagged?.key ?? o.target?.key),
        ...(tagged?.view_tag !== undefined ? { viewTag: hex(tagged.view_tag) } : {}),
        clearAmount: pico(o.amount),
        ...(e && hex(e.amount) ? { encryptedAmount: hex(e.amount) } : {}),
        ...(e && hex(e.mask) && hex(e.mask) !== '0'.repeat(64) ? { encryptedMask: hex(e.mask) } : {}),
        ...(hex(outPk[index]) ? { commitment: hex(outPk[index]) } : {}),
      };
    });

    // The rings: every input's offsets, resolved in one get_outs call.
    const vins = (json.vin ?? []).filter(v => v.key);
    const wanted = vins.flatMap(v => absoluteOffsets(v.key?.key_offsets ?? []).map(index => ({ amount: num(v.key?.amount), index })));
    let outs: { height?: number; txid?: string; key?: string }[] = [];
    if (wanted.length > 0 && wanted.length <= MAX_OUTS_PER_CALL) {
      const r: Record<string, unknown> = await this.post('/get_outs', { outputs: wanted, get_txid: true }, opts).catch(() => ({}));
      outs = Array.isArray(r.outs) ? r.outs as typeof outs : [];
    }
    let at = 0;
    const inputs: MoneroInput[] = vins.map(v => {
      const n = v.key?.key_offsets?.length ?? 0;
      const members = outs.slice(at, at + n);
      at += n;
      return {
        keyImage: hex(v.key?.k_image),
        ring: members.length === n
          ? members.map(m => ({ height: num(m.height), txid: hex(m.txid), key: hex(m.key) }))
          : [],
      };
    });

    const bytes = extraBytes(json.extra);
    const inPool = entry.in_pool === true;
    const height = num(entry.block_height);
    return {
      txid: id,
      version: num(json.version),
      rctType: num(rct.type),
      coinbase,
      fee: coinbase ? BigInt(0) : pico(rct.txnFee),
      size: Math.floor((entry.as_hex?.length ?? 0) / 2),
      unlockTime: num(json.unlock_time),
      extra: parseTxExtra(bytes),
      extraBytes: bytes,
      blockHeight: inPool ? null : height,
      timestamp: num(entry.block_timestamp),
      confirmations: inPool ? 0 : num(entry.confirmations),
      currentHeight: tip,
      inputs,
      outputs,
    };
  }

  async resolveHash(id: string, opts?: RequestOptions): Promise<'tx' | 'block' | null> {
    const h = id.trim().toLowerCase();
    try {
      await this.rpc('get_block_header_by_hash', { hash: h }, opts);
      return 'block';
    } catch (e) {
      if (!(e instanceof MoneroError) || e.code !== 'not-found') throw e;
    }
    const entries = await this.transactions([h], opts);
    return entries.some(e => hex(e.tx_hash) === h) ? 'tx' : null;
  }
}
