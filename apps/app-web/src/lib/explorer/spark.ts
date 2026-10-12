// Client for Spark, Lightspark's statechain layer on Bitcoin.
//
// Spark holds coins in trees of pre-signed transactions: an on-chain deposit
// is the root, the operators (Lightspark, Breez and Flashnet, signing with
// FROST) split it into leaves of power-of-two amounts, and a transfer moves a
// leaf to its new owner by tweaking the operators' key share, off-chain. Each
// leaf keeps a pre-signed exit transaction with a relative timelock that
// shrinks on every transfer, so the newest owner's exit is valid first.
//
// Unlike Bark, and unlike Arkade's indexer, the operators themselves answer
// read queries about any wallet that has not turned privacy on: its balance,
// its transfers (paginated), its leaves with their pre-signed transactions
// and their parents up to the deposit. The official read-only client of the
// Spark SDK makes exactly these calls with no credentials; the operators
// speak gRPC-web and allow any origin, so this runs from the browser with no
// proxy. The few messages involved are encoded and decoded by hand, like the
// Bark client does, so a newer operator with extra fields does not break the
// view.
//
// What the operators do NOT publish is a network-wide list of transfers: a
// filter without a participant is refused. That feed comes from Sparkscan
// (see sparkscan.ts).

import { bech32m } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';

export class SparkError extends Error {
  /** The gRPC status code when an operator answered with one. */
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'SparkError';
    this.status = status;
  }
}

export type SparkOperator = { name: string; url: string; pubkey: string };

/** The mainnet signing operators, as the SDK configures them (the first is
 *  the coordinator). Read queries go to the first that answers. */
export const SPARK_OPERATORS: SparkOperator[] = [
  { name: 'Lightspark', url: 'https://0.spark.lightspark.com', pubkey: '03dfbdff4b6332c220f8fa2ba8ed496c698ceada563fa01b67d9983bfc5c95e763' },
  { name: 'Breez', url: 'https://spark-operator.breez.technology', pubkey: '03e625e9768651c9be268e287245cc33f96a68ce9141b0b4769205db027ee8ed77' },
  { name: 'Flashnet', url: 'https://2.spark.flashnet.xyz', pubkey: '022eda13465a59205413086130a65dc0ed1b8f8e51937043161f8be0c369b1a410' },
];

/** The mainnet Spark Service Provider (Lightspark's): the counterparty of
 *  every Lightning payment and cooperative exit. */
export const SPARK_SSP_PUBKEY = '023e33e2920326f64ea31058d44777442d97d7d5cbfcf54e3060bc1695e5261c93';

/** The timelock rules of the SDK (utils/transaction.ts): a fresh leaf's exit
 *  waits 2,000 blocks, each transfer takes 100 off, the watchtower's direct
 *  path adds 50, and a wallet renews a leaf under 200. */
export const SPARK_TIMELOCK = { initialBlocks: 2000, stepBlocks: 100, directOffsetBlocks: 50, renewBelowBlocks: 200 } as const;

const SERVICE = 'spark.SparkService';
const NETWORK_MAINNET = 1;
const TIMEOUT_MS = 20_000;

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

/* ------------------------------- addresses ------------------------------- */

export type SparkNetworkName = 'mainnet' | 'testnet' | 'regtest' | 'signet' | 'local';

const HRP: Record<string, SparkNetworkName> = { spark: 'mainnet', sparkt: 'testnet', sparkrt: 'regtest', sparks: 'signet', sparkl: 'local' };
// The first address format, still used by Sparkscan's live feed.
const LEGACY_HRP: Record<string, SparkNetworkName> = { sp: 'mainnet', spt: 'testnet', sprt: 'regtest', sps: 'signet', spl: 'local' };
const CANONICAL_HRP: Record<SparkNetworkName, string> = { mainnet: 'spark', testnet: 'sparkt', regtest: 'sparkrt', signet: 'sparks', local: 'sparkl' };

/**
 * The Spark address of an identity public key: bech32m over the SparkAddress
 * protobuf (field 1, the 33-byte compressed key), "spark" on mainnet.
 */
export function sparkAddressOf(pubkeyHex: string, network: SparkNetworkName = 'mainnet'): string | null {
  if (!/^0[23][0-9a-f]{64}$/i.test(pubkeyHex)) return null;
  const key = hexToBytes(pubkeyHex.toLowerCase());
  const payload = new Uint8Array(2 + key.length);
  payload[0] = 0x0a; // field 1, length-delimited
  payload[1] = key.length;
  payload.set(key, 2);
  return bech32m.encode(CANONICAL_HRP[network], bech32m.toWords(payload), false);
}

export type SparkAddress = {
  /** The identity public key, 33 bytes hex. */
  pubkey: string;
  network: SparkNetworkName;
  /** True for the first format (sp1…), re-encoded in `canonical`. */
  legacy: boolean;
  /** The current spelling (spark1…) of the same key, whatever was pasted. */
  canonical: string;
};

/** Decode a Spark address (either format; a Spark invoice, which wraps the
 *  same key with payment fields, decodes to its receiver). */
export function decodeSparkAddress(input: string): SparkAddress | null {
  const s = input.trim().toLowerCase();
  let decoded: { prefix: string; words: number[] };
  try {
    decoded = bech32m.decode(s as `${string}1${string}`, false);
  } catch {
    return null;
  }
  const network = HRP[decoded.prefix] ?? LEGACY_HRP[decoded.prefix];
  if (!network) return null;
  let m: Message;
  try {
    m = readMessage(bech32m.fromWords(decoded.words));
  } catch {
    return null;
  }
  const key = bytesField(m, 1);
  if (!key || key.length !== 33 || (key[0] !== 2 && key[0] !== 3)) return null;
  const pubkey = bytesToHex(key);
  const legacy = decoded.prefix in LEGACY_HRP;
  const canonical = legacy || m.size > 1 ? sparkAddressOf(pubkey, network)! : s;
  return { pubkey, network, legacy, canonical };
}

// Both formats, every network. "sp1…" is also how BIP-352 silent-payment
// addresses start; the Explorer does not read those, and this check is only
// consulted on the Spark network.
const SPARK_ADDR = /^(spark|sparkt|sparkrt|sparks|sparkl|sp|spt|sprt|sps|spl)1[0-9ac-hj-np-z]{20,}$/i;

export function looksLikeSparkAddress(s: string): boolean {
  return SPARK_ADDR.test(s.trim());
}

/** Spark names transfers, leaves and trees with UUIDs (version 7, time-ordered). */
export const SPARK_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function looksLikeSparkId(s: string): boolean {
  return SPARK_UUID.test(s.trim());
}

/* ----------------------------- protobuf reader ----------------------------- */

type Field = number | Uint8Array;
type Message = Map<number, Field[]>;

function readVarint(buf: Uint8Array, pos: number): [number, number] {
  // Multiplication, not shifts: shifts truncate to 32 bits and the amounts,
  // timestamps and int64 offsets here can exceed that.
  let value = 0;
  let mul = 1;
  for (;;) {
    const b = buf[pos++];
    if (b === undefined) throw new SparkError('Truncated message from the Spark operator.');
    value += (b & 0x7f) * mul;
    if (b < 0x80) return [value, pos];
    mul *= 128;
  }
}

/** Decode one protobuf message into its fields. Exported for tests. */
export function readMessage(buf: Uint8Array): Message {
  const out: Message = new Map();
  let pos = 0;
  while (pos < buf.length) {
    const [key, next] = readVarint(buf, pos);
    pos = next;
    const field = Math.floor(key / 8);
    const wire = key % 8;
    let value: Field;
    if (wire === 0) {
      [value, pos] = readVarint(buf, pos);
    } else if (wire === 2) {
      const [len, start] = readVarint(buf, pos);
      if (start + len > buf.length) throw new SparkError('Truncated message from the Spark operator.');
      value = buf.subarray(start, start + len);
      pos = start + len;
    } else if (wire === 1) {
      pos += 8;
      continue;
    } else if (wire === 5) {
      pos += 4;
      continue;
    } else {
      throw new SparkError('Unreadable message from the Spark operator.');
    }
    const list = out.get(field);
    if (list) list.push(value); else out.set(field, [value]);
  }
  return out;
}

function uint(m: Message, field: number): number {
  const v = m.get(field)?.[0];
  return typeof v === 'number' ? v : 0;
}
function bytesField(m: Message, field: number): Uint8Array | undefined {
  const v = m.get(field)?.[0];
  return v instanceof Uint8Array ? v : undefined;
}
function text(m: Message, field: number): string {
  const b = bytesField(m, field);
  return b ? new TextDecoder().decode(b) : '';
}
function sub(m: Message, field: number): Message | null {
  const b = bytesField(m, field);
  return b ? readMessage(b) : null;
}
function subs(m: Message, field: number): Message[] {
  return (m.get(field) ?? []).filter((v): v is Uint8Array => v instanceof Uint8Array).map(readMessage);
}
/** A google.protobuf.Timestamp, as unix seconds. */
function seconds(m: Message, field: number): number | undefined {
  const t = sub(m, field);
  const s = t ? uint(t, 1) : 0;
  return s > 0 ? s : undefined;
}
/** A signed 64-bit offset: -1 (the end of a listing) arrives as 2^64 - 1. */
function offsetField(m: Message, field: number): number | null {
  const v = uint(m, field);
  return v > Number.MAX_SAFE_INTEGER ? null : v;
}

/* ----------------------------- protobuf writer ----------------------------- */

// Fields are written in ascending number order, matching the SDK's encoder
// byte for byte (tests compare against its output).
class Writer {
  private out: number[] = [];
  varint(n: number) {
    while (n >= 0x80) { this.out.push((n % 0x80) | 0x80); n = Math.floor(n / 0x80); }
    this.out.push(n);
  }
  private key(field: number, wire: number) { this.varint(field * 8 + wire); }
  uint(field: number, n: number) { if (n) { this.key(field, 0); this.varint(n); } }
  bool(field: number, b: boolean) { if (b) { this.key(field, 0); this.varint(1); } }
  bytes(field: number, b: Uint8Array) { this.key(field, 2); this.varint(b.length); for (const x of b) this.out.push(x); }
  string(field: number, s: string) { this.bytes(field, new TextEncoder().encode(s)); }
  packed(field: number, values: number[]) {
    if (!values.length) return;
    const w = new Writer();
    for (const v of values) w.varint(v);
    this.bytes(field, w.finish());
  }
  finish(): Uint8Array { return Uint8Array.from(this.out); }
}

/** TransferFilter: transfers where the key is the receiver, the sender, or
 *  either (`side` unset), newest first unless `ascending`. Exported for
 *  tests. */
export function encodeTransferFilter(o: { pubkey: string; limit: number; offset?: number; ascending?: boolean; side?: 'sender' | 'receiver' }): Uint8Array {
  const w = new Writer();
  const key = hexToBytes(o.pubkey);
  if (o.side === 'receiver') w.bytes(1, key);
  if (o.side === 'sender') w.bytes(2, key);
  w.uint(4, NETWORK_MAINNET);
  w.uint(5, o.ascending ? 1 : 0);
  w.uint(40, o.limit);
  w.uint(50, o.offset ?? 0);
  if (!o.side) w.bytes(60, key);
  return w.finish();
}

/** QueryTransfersByIdRequest. Exported for tests. */
export function encodeTransfersByIdRequest(ids: string[]): Uint8Array {
  const w = new Writer();
  for (const id of ids) w.string(1, id);
  w.uint(2, NETWORK_MAINNET);
  return w.finish();
}

/** QueryNodesRequest: a wallet's leaves (by owner) or named nodes, with their
 *  parents when asked. Exported for tests. */
export function encodeQueryNodesRequest(o: {
  owner?: string; nodeIds?: string[]; includeParents?: boolean; limit?: number; offset?: number;
  /** TreeNodeStatus values to keep (1 = available). */
  statuses?: number[];
}): Uint8Array {
  const w = new Writer();
  if (o.owner) w.bytes(1, hexToBytes(o.owner));
  if (o.nodeIds) {
    const ids = new Writer();
    for (const id of o.nodeIds) ids.string(1, id);
    w.bytes(2, ids.finish());
  }
  w.bool(3, !!o.includeParents);
  w.uint(4, o.limit ?? 0);
  w.uint(5, o.offset ?? 0);
  // The network is not checked when querying by node id; the SDK leaves it out.
  if (o.owner) w.uint(6, NETWORK_MAINNET);
  w.packed(7, o.statuses ?? []);
  return w.finish();
}

/** QueryBalanceRequest. Exported for tests. */
export function encodeBalanceRequest(pubkey: string): Uint8Array {
  const w = new Writer();
  w.bytes(1, hexToBytes(pubkey));
  w.uint(2, NETWORK_MAINNET);
  return w.finish();
}

/** GetUtxosForAddressRequest: the deposits an on-chain address received for
 *  Spark. Exported for tests. */
export function encodeUtxosRequest(address: string, limit: number): Uint8Array {
  const w = new Writer();
  w.string(1, address);
  w.uint(3, limit);
  w.uint(4, NETWORK_MAINNET);
  return w.finish();
}

/* --------------------------------- types --------------------------------- */

export type SparkLeafStatus =
  | 'creating' | 'available' | 'frozen' | 'transfer-locked' | 'split-locked' | 'split' | 'aggregated' | 'on-chain'
  | 'aggregate-lock' | 'exited' | 'renew-locked' | 'unavailable' | 'parent-exited' | 'consolidated'
  | 'watchtower-exited' | 'watchtower-exit-recovered' | 'unknown';

const LEAF_STATUS: SparkLeafStatus[] = [
  'creating', 'available', 'frozen', 'transfer-locked', 'split-locked', 'split', 'aggregated', 'on-chain',
  'aggregate-lock', 'exited', 'renew-locked', 'unavailable', 'parent-exited', 'consolidated',
  'watchtower-exited', 'watchtower-exit-recovered',
];

/** A node of a Spark tree: a leaf (a coin) or one of the splits above it. */
export type SparkLeaf = {
  id: string;
  treeId: string;
  parentId: string | null;
  valueSats: number;
  /** The output of the parent's transaction this node spends. */
  vout: number;
  status: SparkLeafStatus;
  ownerPubkey: string;
  /** The node's own pre-signed transaction (spends the parent's output). */
  nodeTx: Uint8Array;
  /** The exit transaction paying the owner, spending nodeTx's output. */
  refundTx: Uint8Array;
  /** The watchtower's alternative, spending the parent directly. */
  directTx: Uint8Array;
  directRefundTx: Uint8Array;
  createdAt?: number;
  updatedAt?: number;
};

export type SparkTransferType =
  | 'preimage-swap' | 'cooperative-exit' | 'transfer' | 'utxo-swap' | 'swap' | 'counter-swap' | 'primary-swap' | 'counter-swap-v3' | 'unknown';

const TRANSFER_TYPES: Record<number, SparkTransferType> = {
  0: 'preimage-swap', 1: 'cooperative-exit', 2: 'transfer', 3: 'utxo-swap', 4: 'primary-swap', 5: 'counter-swap-v3', 30: 'swap', 40: 'counter-swap',
};

export type SparkTransferStatus =
  | 'sender-initiated' | 'sender-key-tweak-pending' | 'sender-key-tweaked' | 'receiver-key-tweaked' | 'receiver-refund-signed'
  | 'completed' | 'expired' | 'returned' | 'sender-initiated-coordinator' | 'receiver-key-tweak-locked'
  | 'receiver-key-tweak-applied' | 'applying-sender-key-tweak' | 'unknown';

const TRANSFER_STATUS: SparkTransferStatus[] = [
  'sender-initiated', 'sender-key-tweak-pending', 'sender-key-tweaked', 'receiver-key-tweaked', 'receiver-refund-signed',
  'completed', 'expired', 'returned', 'sender-initiated-coordinator', 'receiver-key-tweak-locked',
  'receiver-key-tweak-applied', 'applying-sender-key-tweak',
];

export type SparkTransfer = {
  id: string;
  senderPubkey: string;
  receiverPubkey: string;
  status: SparkTransferStatus;
  type: SparkTransferType;
  totalSats: number;
  createdAt?: number;
  updatedAt?: number;
  expiresAt?: number;
  /** The leaves moved, as the operator serves them (their state now). */
  leaves: SparkLeaf[];
  invoice?: string;
};

/** Decode a TreeNode. Exported for tests. */
export function decodeLeaf(m: Message): SparkLeaf {
  const createdAt = seconds(m, 13);
  const updatedAt = seconds(m, 14);
  return {
    id: text(m, 1),
    treeId: text(m, 2),
    parentId: text(m, 4) || null,
    valueSats: uint(m, 3),
    vout: uint(m, 7),
    status: LEAF_STATUS[uint(m, 19)] ?? 'unknown',
    ownerPubkey: bytesToHex(bytesField(m, 9) ?? new Uint8Array()),
    nodeTx: bytesField(m, 5) ?? new Uint8Array(),
    refundTx: bytesField(m, 6) ?? new Uint8Array(),
    directTx: bytesField(m, 16) ?? new Uint8Array(),
    directRefundTx: bytesField(m, 17) ?? new Uint8Array(),
    ...(createdAt !== undefined ? { createdAt } : {}),
    ...(updatedAt !== undefined ? { updatedAt } : {}),
  };
}

/** Decode a Transfer. Exported for tests. */
export function decodeTransfer(m: Message): SparkTransfer {
  const createdAt = seconds(m, 8);
  const updatedAt = seconds(m, 9);
  const expiresAt = seconds(m, 6);
  const invoice = text(m, 11);
  return {
    id: text(m, 1),
    senderPubkey: bytesToHex(bytesField(m, 2) ?? new Uint8Array()),
    receiverPubkey: bytesToHex(bytesField(m, 3) ?? new Uint8Array()),
    status: TRANSFER_STATUS[uint(m, 4)] ?? 'unknown',
    type: TRANSFER_TYPES[uint(m, 10)] ?? 'unknown',
    totalSats: uint(m, 5),
    leaves: subs(m, 7).map(tl => sub(tl, 1)).filter((l): l is Message => l !== null).map(decodeLeaf),
    ...(createdAt !== undefined ? { createdAt } : {}),
    ...(updatedAt !== undefined ? { updatedAt } : {}),
    ...(expiresAt !== undefined ? { expiresAt } : {}),
    ...(invoice ? { invoice } : {}),
  };
}

export type SparkPage<T> = { items: T[]; /** Null at the end of the listing. */ nextOffset: number | null };

/** Decode a QueryTransfersResponse. Exported for tests. */
export function decodeTransfersResponse(buf: Uint8Array): SparkPage<SparkTransfer> {
  const m = readMessage(buf);
  return { items: subs(m, 1).map(decodeTransfer), nextOffset: offsetField(m, 2) };
}

/** Decode a QueryNodesResponse (a map of id to node). Exported for tests. */
export function decodeNodesResponse(buf: Uint8Array): SparkPage<SparkLeaf> {
  const m = readMessage(buf);
  const items = subs(m, 1).map(entry => sub(entry, 2)).filter((n): n is Message => n !== null).map(decodeLeaf);
  return { items, nextOffset: offsetField(m, 2) };
}

export type SparkBalance = { sats: number; /** How many leaves carry it. */ leaves: number };

/** Decode a QueryBalanceResponse. Exported for tests. */
export function decodeBalanceResponse(buf: Uint8Array): SparkBalance {
  const m = readMessage(buf);
  return { sats: uint(m, 1), leaves: subs(m, 2).length };
}

/** Decode a GetUtxosForAddressResponse: the deposit outpoints. Exported for tests. */
export function decodeUtxosResponse(buf: Uint8Array): Array<{ txid: string; vout: number }> {
  const m = readMessage(buf);
  return subs(m, 1).map(u => {
    const txid = bytesField(u, 4);
    return { txid: txid ? bytesToHex(txid) : '', vout: uint(u, 2) };
  }).filter(u => u.txid.length === 64);
}

/* -------------------------------- gRPC-web -------------------------------- */

function frame(msg: Uint8Array): Uint8Array {
  const out = new Uint8Array(5 + msg.length);
  new DataView(out.buffer).setUint32(1, msg.length);
  out.set(msg, 5);
  return out;
}

type Frames = { messages: Uint8Array[]; trailers: Record<string, string> | null };

/** Split a gRPC-web body into its messages and trailer block. Exported for tests. */
export function takeFrames(buf: Uint8Array): Frames {
  const messages: Uint8Array[] = [];
  let trailers: Record<string, string> | null = null;
  let pos = 0;
  while (buf.length - pos >= 5) {
    const flag = buf[pos];
    const len = new DataView(buf.buffer, buf.byteOffset + pos + 1, 4).getUint32(0);
    if (buf.length - pos - 5 < len) break;
    const body = buf.subarray(pos + 5, pos + 5 + len);
    pos += 5 + len;
    if (flag & 0x80) {
      trailers = {};
      for (const line of new TextDecoder().decode(body).split('\r\n')) {
        const i = line.indexOf(':');
        if (i > 0) trailers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
      }
    } else if (flag & 0x01) {
      throw new SparkError('The Spark operator answered in an unexpected encoding.');
    } else {
      messages.push(body);
    }
  }
  return { messages, trailers };
}

function statusError(status: string | null | undefined, message: string | null | undefined): SparkError | null {
  if (!status || status === '0') return null;
  let msg = '';
  try { msg = decodeURIComponent(message ?? ''); } catch { msg = message ?? ''; }
  return new SparkError(msg || `Spark operator error (status ${status}).`, Number(status));
}

function withTimeout(signal: AbortSignal | undefined, ms: number): AbortSignal {
  const timeout = AbortSignal.timeout(ms);
  if (!signal) return timeout;
  const any = (AbortSignal as unknown as { any?: (s: AbortSignal[]) => AbortSignal }).any;
  return any ? any([signal, timeout]) : signal;
}

/** One unary call to one operator. */
async function unaryAt(base: string, method: string, request: Uint8Array, signal?: AbortSignal, timeoutMs = TIMEOUT_MS): Promise<Uint8Array> {
  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/+$/, '')}/${SERVICE}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/grpc-web+proto', 'x-grpc-web': '1' },
      body: frame(request) as BodyInit,
      signal: withTimeout(signal, timeoutMs),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError' && signal?.aborted) throw err;
    throw new SparkError('Could not reach the Spark operator.');
  }
  if (!res.ok) throw new SparkError(`Spark operator error ${res.status}.`);
  // A call refused before any message answers "trailers-only": the status
  // travels in the HTTP headers.
  const early = statusError(res.headers.get('grpc-status'), res.headers.get('grpc-message'));
  if (early) throw early;
  const { messages, trailers } = takeFrames(new Uint8Array(await res.arrayBuffer()));
  const err = statusError(trailers?.['grpc-status'], trailers?.['grpc-message']);
  if (err) throw err;
  return messages[0] ?? new Uint8Array();
}

/**
 * One unary call, tried on each operator in turn when the previous one could
 * not be reached (never on an answer: a refusal is the same everywhere).
 */
async function unary(method: string, request: Uint8Array, signal?: AbortSignal, timeoutMs = TIMEOUT_MS): Promise<Uint8Array> {
  let last: unknown;
  for (const op of SPARK_OPERATORS) {
    try {
      return await unaryAt(op.url, method, request, signal, timeoutMs);
    } catch (err) {
      if (signal?.aborted) throw err;
      if (err instanceof SparkError && err.status === undefined) { last = err; continue; }
      throw err;
    }
  }
  throw last instanceof Error ? last : new SparkError('Could not reach any Spark operator.');
}

/* ------------------------------ operator reads ----------------------------- */

/** A wallet's spendable balance, zero for an empty or PRIVATE wallet (the
 *  operator answers both the same way). */
export async function getSparkBalance(pubkey: string, opts: { signal?: AbortSignal } = {}): Promise<SparkBalance> {
  return decodeBalanceResponse(await unary('query_balance', encodeBalanceRequest(pubkey), opts.signal));
}

// The transfers query gets a long leash: the "sender or receiver" filter
// takes the operators fifteen seconds and more, so the views ask for the
// two sides separately (a second each) and merge them, but a slow afternoon
// is still possible.
const TRANSFERS_TIMEOUT_MS = 75_000;

/** Where the next page of each side starts; null for a side that is done. */
export type SparkTransferCursor = { sent: number | null; received: number | null };

/** Newest first: by time, then by id (UUID v7 ids are time-ordered too),
 *  without duplicates (a self-transfer sits on both sides). Exported for
 *  tests. */
export function mergeSparkTransfers(...pages: SparkTransfer[][]): SparkTransfer[] {
  const byId = new Map<string, SparkTransfer>();
  for (const page of pages) for (const t of page) byId.set(t.id, t);
  return [...byId.values()].sort((a, b) => ((b.createdAt ?? 0) - (a.createdAt ?? 0)) || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
}

/**
 * A wallet's transfers, newest first: the ones it sent and the ones it
 * received, asked for separately and merged. Always descending with a
 * limit: the ascending order on a busy wallet takes the operator a minute.
 */
export async function getSparkTransfers(pubkey: string, opts: { limit?: number; cursor?: SparkTransferCursor; signal?: AbortSignal } = {}): Promise<{ items: SparkTransfer[]; cursor: SparkTransferCursor | null }> {
  const limit = opts.limit ?? 20;
  const from = opts.cursor ?? { sent: 0, received: 0 };
  const side = async (which: 'sender' | 'receiver', offset: number | null): Promise<SparkPage<SparkTransfer> | null> => {
    if (offset === null) return null;
    const request = encodeTransferFilter({ pubkey, limit, offset, side: which });
    return decodeTransfersResponse(await unary('query_all_transfers', request, opts.signal, TRANSFERS_TIMEOUT_MS));
  };
  const [sent, received] = await Promise.all([side('sender', from.sent), side('receiver', from.received)]);
  const next = (page: SparkPage<SparkTransfer> | null): number | null => page && page.items.length >= limit ? page.nextOffset : null;
  const cursor: SparkTransferCursor = { sent: next(sent), received: next(received) };
  return {
    items: mergeSparkTransfers(sent?.items ?? [], received?.items ?? []),
    cursor: cursor.sent === null && cursor.received === null ? null : cursor,
  };
}

/** One transfer by id, null when no operator knows it (or its wallets are
 *  private). */
export async function getSparkTransfer(id: string, opts: { signal?: AbortSignal } = {}): Promise<SparkTransfer | null> {
  if (!looksLikeSparkId(id)) return null;
  const page = decodeTransfersResponse(await unary('query_transfers_by_id', encodeTransfersByIdRequest([id.toLowerCase()]), opts.signal));
  return page.items[0] ?? null;
}

/** A wallet's leaves (its coins), available ones only unless `all`. */
export async function getSparkLeaves(pubkey: string, opts: { limit?: number; offset?: number; all?: boolean; signal?: AbortSignal } = {}): Promise<SparkPage<SparkLeaf>> {
  const request = encodeQueryNodesRequest({ owner: pubkey, limit: opts.limit ?? 50, offset: opts.offset ?? 0, statuses: opts.all ? [] : [1] });
  return decodeNodesResponse(await unary('query_nodes', request, opts.signal));
}

/** A leaf and every node above it, up to the root spending the deposit;
 *  empty when no operator knows the id. */
export async function getSparkLeafChain(leafId: string, opts: { signal?: AbortSignal } = {}): Promise<SparkLeaf[]> {
  if (!looksLikeSparkId(leafId)) return [];
  const request = encodeQueryNodesRequest({ nodeIds: [leafId.toLowerCase()], includeParents: true });
  return decodeNodesResponse(await unary('query_nodes', request, opts.signal)).items;
}

/** The Spark deposits an on-chain address received: empty when the address
 *  is not a Spark deposit address. */
export async function getSparkDepositUtxos(address: string, opts: { signal?: AbortSignal } = {}): Promise<Array<{ txid: string; vout: number }>> {
  return decodeUtxosResponse(await unary('get_utxos_for_address', encodeUtxosRequest(address, 20), opts.signal));
}

/* ------------------------- pre-signed transactions ------------------------- */

export type SparkRawTx = {
  txid: string;
  version: number;
  inputs: Array<{ txid: string; vout: number; sequence: number }>;
  outputs: Array<{ valueSats: number; scriptHex: string }>;
  locktime: number;
};

/** The ephemeral anchor (P2A) output every pre-signed Spark transaction
 *  carries, for the fee-bumping child. */
export const SPARK_ANCHOR_SCRIPT = '51024e73';

export function isAnchorOutput(o: { valueSats: number; scriptHex: string }): boolean {
  return o.scriptHex === SPARK_ANCHOR_SCRIPT;
}

/** Parse a serialized Bitcoin transaction (with or without witnesses) and
 *  compute its txid. Exported for tests. */
export function parseRawTx(raw: Uint8Array): SparkRawTx {
  let pos = 0;
  const need = (n: number) => { if (pos + n > raw.length) throw new SparkError('Truncated pre-signed transaction.'); };
  const u32 = (): number => { need(4); const v = raw[pos] + raw[pos + 1] * 256 + raw[pos + 2] * 65536 + raw[pos + 3] * 16777216; pos += 4; return v; };
  const u64 = (): number => { need(8); let v = 0; for (let i = 7; i >= 0; i--) v = v * 256 + raw[pos + i]; pos += 8; return v; };
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
  const version = u32();
  const segwit = raw[pos] === 0x00 && raw[pos + 1] === 0x01;
  if (segwit) pos += 2;
  const bodyStart = pos;
  const inputs: SparkRawTx['inputs'] = [];
  const nIn = compact();
  for (let i = 0; i < nIn; i++) {
    need(32);
    const txid = bytesToHex(raw.subarray(pos, pos + 32).slice().reverse());
    pos += 32;
    const vout = u32();
    const scriptLen = compact();
    need(scriptLen);
    pos += scriptLen;
    const sequence = u32();
    inputs.push({ txid, vout, sequence });
  }
  const outputs: SparkRawTx['outputs'] = [];
  const nOut = compact();
  for (let i = 0; i < nOut; i++) {
    const valueSats = u64();
    const scriptLen = compact();
    need(scriptLen);
    outputs.push({ valueSats, scriptHex: bytesToHex(raw.subarray(pos, pos + scriptLen)) });
    pos += scriptLen;
  }
  const bodyEnd = pos;
  if (segwit) {
    for (let i = 0; i < nIn; i++) {
      const items = compact();
      for (let j = 0; j < items; j++) { const len = compact(); need(len); pos += len; }
    }
  }
  const locktime = u32();
  // The txid hashes the serialization without marker, flag and witnesses.
  const stripped = new Uint8Array(4 + (bodyEnd - bodyStart) + 4);
  stripped.set(raw.subarray(0, 4), 0);
  stripped.set(raw.subarray(bodyStart, bodyEnd), 4);
  stripped.set(raw.subarray(pos - 4, pos), 4 + (bodyEnd - bodyStart));
  const txid = bytesToHex(sha256(sha256(stripped)).reverse());
  return { txid, version, inputs, outputs, locktime };
}

/** The relative timelock in blocks an input's sequence encodes (BIP 68), or
 *  null when none (disabled, or time-based). */
export function sequenceBlocks(sequence: number): number | null {
  if (sequence >= 0x80000000) return null;
  if (sequence & 0x00400000) return null;
  return sequence & 0xffff;
}

/** "1,000 blocks (about 7 days)". */
export function formatSparkBlocks(blocks: number): string {
  const days = blocks / 144;
  const hours = Math.max(1, Math.round(blocks / 6));
  const about = days >= 2 ? `about ${Math.round(days)} days` : days >= 1 ? 'about a day' : `about ${hours} hour${hours === 1 ? '' : 's'}`;
  return `${blocks.toLocaleString('en-US')} block${blocks === 1 ? '' : 's'} (${about})`;
}

/* --------------------------------- labels --------------------------------- */

export function isSparkSsp(pubkey: string): boolean {
  return pubkey.toLowerCase() === SPARK_SSP_PUBKEY;
}

/** Spark's name for a transfer type, as the Explorer shows it. */
export function sparkTransferLabel(t: Pick<SparkTransfer, 'type' | 'senderPubkey' | 'receiverPubkey'>): string {
  switch (t.type) {
    case 'preimage-swap': return isSparkSsp(t.senderPubkey) ? 'Lightning payment received' : isSparkSsp(t.receiverPubkey) ? 'Lightning payment sent' : 'Lightning payment';
    case 'cooperative-exit': return 'Cooperative exit to Bitcoin';
    case 'transfer': return 'Spark transfer';
    case 'utxo-swap': return 'Deposit claimed';
    case 'swap': case 'counter-swap': case 'primary-swap': case 'counter-swap-v3': return 'Swap';
    default: return 'Transfer';
  }
}

export function sparkStatusLabel(s: SparkTransferStatus): string {
  if (s === 'completed') return 'Completed';
  if (s === 'expired') return 'Expired';
  if (s === 'returned') return 'Returned';
  return 'Pending';
}

export function sparkLeafStatusLabel(s: SparkLeafStatus): string {
  switch (s) {
    case 'available': return 'Available';
    case 'split': return 'Split';
    case 'transfer-locked': case 'split-locked': case 'aggregate-lock': case 'renew-locked': return 'Locked';
    case 'aggregated': case 'consolidated': return 'Consolidated';
    case 'on-chain': case 'exited': case 'parent-exited': case 'watchtower-exited': case 'watchtower-exit-recovered': return 'Exited';
    case 'frozen': return 'Frozen';
    case 'creating': return 'Creating';
    case 'unavailable': return 'Unavailable';
    default: return 'Unknown';
  }
}
