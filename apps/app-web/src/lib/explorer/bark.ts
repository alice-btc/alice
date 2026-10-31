// Client for a Bark Ark server (captaind), the Ark implementation by Second.
//
// Bark settles on Bitcoin mainnet like Arkade, but publishes far less: there is
// no indexer, so no lookup by address, no VTXO or round history and no tree.
// That is a deliberate privacy choice: each holder keeps the data of their own
// VTXOs and decides who sees it. What the server does answer, to anyone, is
// its parameters (GetArkInfo), the next round time, and the round events as
// they happen (LastRoundEvent, SubscribeRounds); a finished round carries its
// signed transaction, so the round can be opened on the Bitcoin chain.
//
// The server speaks gRPC, with a gRPC-web layer that browsers can call
// directly, and its CORS policy echoes the calling origin, so this runs from
// the browser with no proxy. The few messages read here are decoded by hand
// rather than through generated code: a small protobuf reader is enough, and
// unknown fields are skipped, so a newer server does not break the view.

import { bech32m } from '@scure/base';
import { t as tr } from '../../i18n/translate.ts';
import { sha256 } from '@noble/hashes/sha2.js';

const SERVICE = 'bark_server.ArkService';

export class BarkError extends Error {
  /** The gRPC status code when the server answered with one (5 is "not found"). */
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'BarkError';
    this.status = status;
  }
}

function bytesToHex(b: Uint8Array): string {
  let s = '';
  for (const x of b) s += x.toString(16).padStart(2, '0');
  return s;
}

/* ----------------------------- protobuf reader ----------------------------- */

type Field = number | Uint8Array;
type Message = Map<number, Field[]>;

function readVarint(buf: Uint8Array, pos: number): [number, number] {
  // Multiplication instead of bit shifts: shifts truncate to 32 bits, and the
  // amounts and timestamps here can exceed that.
  let value = 0;
  let mul = 1;
  for (;;) {
    const b = buf[pos++];
    if (b === undefined) throw new BarkError(tr('explorerBark.error.truncated'));
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
      if (start + len > buf.length) throw new BarkError(tr('explorerBark.error.truncated'));
      value = buf.subarray(start, start + len);
      pos = start + len;
    } else if (wire === 1) {
      pos += 8;
      continue;
    } else if (wire === 5) {
      pos += 4;
      continue;
    } else {
      throw new BarkError(tr('explorerBark.error.unreadable'));
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
function bytes(m: Message, field: number): Uint8Array | undefined {
  const v = m.get(field)?.[0];
  return v instanceof Uint8Array ? v : undefined;
}
function text(m: Message, field: number): string {
  const b = bytes(m, field);
  return b ? new TextDecoder().decode(b) : '';
}
function sub(m: Message, field: number): Message {
  return readMessage(bytes(m, field) ?? new Uint8Array());
}
function subs(m: Message, field: number): Message[] {
  return (m.get(field) ?? []).filter((v): v is Uint8Array => v instanceof Uint8Array).map(readMessage);
}

/* -------------------------------- gRPC-web -------------------------------- */

function frame(msg: Uint8Array): Uint8Array {
  const out = new Uint8Array(5 + msg.length);
  new DataView(out.buffer).setUint32(1, msg.length);
  out.set(msg, 5);
  return out;
}

/** A gRPC-web body split into frames: messages, then a trailer block. */
export type GrpcWebFrames = {
  messages: Uint8Array[];
  trailers: Record<string, string> | null;
  /** Bytes of an incomplete frame, kept for the next chunk of a stream. */
  rest: Uint8Array;
};

/** Split whatever complete frames a buffer holds. Exported for tests. */
export function takeFrames(buf: Uint8Array): GrpcWebFrames {
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
      // We never offer compression, so a compressed frame is a server bug.
      throw new BarkError(tr('explorerBark.error.encoding'));
    } else {
      messages.push(body);
    }
  }
  return { messages, trailers, rest: buf.slice(pos) };
}

function statusError(status: string | null | undefined, message: string | null | undefined): BarkError | null {
  if (!status || status === '0') return null;
  let msg = '';
  try { msg = decodeURIComponent(message ?? ''); } catch { msg = message ?? ''; }
  return new BarkError(msg || tr('explorerBark.error.status', { status }), Number(status));
}

async function open(base: string, method: string, signal?: AbortSignal, request: Uint8Array = new Uint8Array()): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/+$/, '')}/${SERVICE}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/grpc-web+proto', 'x-grpc-web': '1' },
      body: frame(request) as BodyInit,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new BarkError(tr('explorerBark.error.unreachable'));
  }
  if (!res.ok) throw new BarkError(tr('explorerBark.error.http', { status: res.status }));
  // A call that fails before any message answers "trailers-only": the status
  // travels in the HTTP headers instead of a trailer frame.
  const early = statusError(res.headers.get('grpc-status'), res.headers.get('grpc-message'));
  if (early) throw early;
  return res;
}

/** One unary call (an empty request unless given), returning the response message. */
async function unary(base: string, method: string, signal?: AbortSignal, request?: Uint8Array): Promise<Message> {
  const res = await open(base, method, signal ?? AbortSignal.timeout(15_000), request);
  const { messages, trailers } = takeFrames(new Uint8Array(await res.arrayBuffer()));
  const err = statusError(trailers?.['grpc-status'], trailers?.['grpc-message']);
  if (err) throw err;
  return readMessage(messages[0] ?? new Uint8Array());
}

/* ------------------------------- server info ------------------------------ */

/** A fee that depends on how many blocks the spent VTXO has left to live. */
export type FeeTier = {
  /** The tier applies from this many blocks left (inclusive) upward. */
  fromBlocksLeft: number;
  /** Parts per million of the amount: 2000 is 0.2%. */
  ppm: number;
};

export type BarkFees = {
  board: { minSats: number; baseSats: number; ppm: number };
  refresh: { baseSats: number; tiers: FeeTier[] };
  offboard: { baseSats: number; tiers: FeeTier[] };
  lightningSend: { minSats: number; baseSats: number; tiers: FeeTier[] };
  lightningReceive: { baseSats: number; ppm: number };
};

/** The server's advertised parameters, from GetArkInfo. */
export type BarkInfo = {
  /** Settlement network ("bitcoin", "signet"…). */
  network: string;
  serverPubkey: string;
  roundIntervalSec: number;
  /** Blocks a VTXO lives before the server can sweep it. */
  vtxoLifetimeBlocks: number;
  /** Blocks a user waits on each step of a unilateral exit. */
  exitDeltaBlocks: number;
  maxVtxoSats?: number;
  minBoardSats: number;
  boardConfirmations: number;
  /** Deepest exit path (transactions to broadcast) the server accepts. */
  maxExitDepth: number;
  tosLink?: string;
  fees: BarkFees;
};

function tiers(entries: Message[]): FeeTier[] {
  return entries
    .map(e => ({ fromBlocksLeft: uint(e, 1), ppm: uint(e, 2) }))
    .sort((a, b) => a.fromBlocksLeft - b.fromBlocksLeft);
}

/** Decode an ArkInfo message. Exported for tests. */
export function decodeArkInfo(m: Message): BarkInfo {
  const fees = sub(m, 18);
  const board = sub(fees, 1);
  const offboard = sub(fees, 2);
  const refresh = sub(fees, 3);
  const lnRecv = sub(fees, 4);
  const lnSend = sub(fees, 5);
  const pubkey = bytes(m, 2);
  return {
    network: text(m, 1),
    serverPubkey: pubkey ? bytesToHex(pubkey) : '',
    roundIntervalSec: uint(m, 3),
    // vtxo_lifetime replaced vtxo_expiry_delta; older servers set only the latter.
    vtxoLifetimeBlocks: uint(m, 21) || uint(m, 6),
    exitDeltaBlocks: uint(m, 5),
    maxVtxoSats: m.has(9) ? uint(m, 9) : undefined,
    minBoardSats: uint(m, 13),
    boardConfirmations: uint(m, 10),
    maxExitDepth: uint(m, 19),
    tosLink: text(m, 22) || undefined,
    fees: {
      board: { minSats: uint(board, 1), baseSats: uint(board, 2), ppm: uint(board, 3) },
      refresh: { baseSats: uint(refresh, 1), tiers: tiers(subs(refresh, 2)) },
      offboard: { baseSats: uint(offboard, 1), tiers: tiers(subs(offboard, 3)) },
      lightningSend: { minSats: uint(lnSend, 1), baseSats: uint(lnSend, 2), tiers: tiers(subs(lnSend, 3)) },
      lightningReceive: { baseSats: uint(lnRecv, 1), ppm: uint(lnRecv, 2) },
    },
  };
}

export async function getBarkInfo(base: string, opts: { signal?: AbortSignal } = {}): Promise<BarkInfo> {
  return decodeArkInfo(await unary(base, 'GetArkInfo', opts.signal));
}

/** When the next round starts, unix seconds. */
export async function getBarkNextRoundTime(base: string, opts: { signal?: AbortSignal } = {}): Promise<number> {
  return uint(await unary(base, 'NextRoundTime', opts.signal), 1);
}

/**
 * Ask the server for one VTXO by its 36-byte id (the outpoint it sits on).
 * The call needs no authentication, so anyone holding an id can read the
 * coin's data: sharing an id is sharing the coin. The server learns which
 * coin is looked up and from where. Returns the serialized VTXO.
 */
export async function fetchBarkVtxo(base: string, vtxoId: Uint8Array, opts: { signal?: AbortSignal } = {}): Promise<Uint8Array> {
  if (vtxoId.length !== 36) throw new BarkError(tr('explorerBark.error.idLength'));
  // GetVtxoRequest { bytes vtxo_id = 1 }
  const request = new Uint8Array([0x0a, 36, ...vtxoId]);
  const reply = await unary(base, 'GetVtxo', opts.signal, request);
  const vtxo = bytes(reply, 1);
  if (!vtxo || vtxo.length === 0) throw new BarkError(tr('explorerBark.error.emptyVtxo'));
  return vtxo;
}

/* --------------------------------- rounds --------------------------------- */

export type BarkRoundEvent =
  | { kind: 'attempt'; roundSeq: number; attemptSeq: number }
  | { kind: 'proposal'; roundSeq: number; attemptSeq: number }
  | { kind: 'finished'; roundSeq: number; attemptSeq: number; txid: string | null }
  | { kind: 'failed'; roundSeq: number }
  | { kind: 'unknown' };

/**
 * The txid of a serialized Bitcoin transaction: double SHA-256 of the
 * serialization WITHOUT the segwit marker, flag and witnesses, byte-reversed.
 * Exported for tests.
 */
export function txidFromRawTx(raw: Uint8Array): string {
  let pos = 4;
  const need = (n: number) => {
    if (pos + n > raw.length) throw new BarkError(tr('explorerBark.error.truncatedRound'));
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

/** Decode a RoundEvent message. Exported for tests. */
export function decodeRoundEvent(m: Message): BarkRoundEvent {
  if (m.has(1)) {
    const a = sub(m, 1);
    return { kind: 'attempt', roundSeq: uint(a, 1), attemptSeq: uint(a, 2) };
  }
  if (m.has(2)) {
    const p = sub(m, 2);
    return { kind: 'proposal', roundSeq: uint(p, 1), attemptSeq: uint(p, 2) };
  }
  if (m.has(4)) {
    const f = sub(m, 4);
    const raw = bytes(f, 3);
    let txid: string | null = null;
    try { txid = raw ? txidFromRawTx(raw) : null; } catch { txid = null; }
    return { kind: 'finished', roundSeq: uint(f, 1), attemptSeq: uint(f, 2), txid };
  }
  if (m.has(5)) return { kind: 'failed', roundSeq: uint(sub(m, 5), 1) };
  return { kind: 'unknown' };
}

export async function getBarkLastRoundEvent(base: string, opts: { signal?: AbortSignal } = {}): Promise<BarkRoundEvent> {
  return decodeRoundEvent(await unary(base, 'LastRoundEvent', opts.signal));
}

/**
 * Follow the server's round events until the signal aborts or the stream
 * ends; the caller decides whether to reconnect. The server sends its latest
 * event first, then each new one as it happens (a round an hour on Second's
 * mainnet server). There is no history beyond that latest event.
 */
export async function subscribeBarkRounds(
  base: string,
  onEvent: (e: BarkRoundEvent) => void,
  opts: { signal?: AbortSignal } = {},
): Promise<void> {
  const res = await open(base, 'SubscribeRounds', opts.signal);
  if (!res.body) throw new BarkError(tr('explorerBark.error.noStream'));
  const reader = res.body.getReader();
  let buffer: Uint8Array = new Uint8Array();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    const joined = new Uint8Array(buffer.length + value.length);
    joined.set(buffer, 0);
    joined.set(value, buffer.length);
    const { messages, trailers, rest } = takeFrames(joined);
    buffer = rest;
    for (const msg of messages) onEvent(decodeRoundEvent(readMessage(msg)));
    if (trailers) {
      const err = statusError(trailers['grpc-status'], trailers['grpc-message']);
      if (err) throw err;
      return;
    }
  }
}

/* -------------------------------- addresses ------------------------------- */

/**
 * Which Ark implementation an ark1… or tark1… address belongs to. Both share
 * the prefix; the first data character is the address version: "q" (0) for
 * Arkade, "p" (1) for Bark's policy addresses. Format only, no checksum.
 */
export function arkAddressFlavor(s: string): 'arkade' | 'bark' | null {
  const m = /^(?:ark|tark)1([0-9ac-hj-np-z])[0-9ac-hj-np-z]+$/i.exec(s.trim());
  if (!m) return null;
  const v = m[1].toLowerCase();
  return v === 'q' ? 'arkade' : v === 'p' ? 'bark' : null;
}

export type BarkAddressPolicy =
  | { kind: 'pubkey'; userPubkey: string }
  | { kind: 'other'; typeByte: number };

export type BarkAddressDelivery =
  | { kind: 'mailbox'; blindedId: string }
  | { kind: 'unknown'; typeByte: number };

/** What a Bark address says about itself, decoded on the device. */
export type BarkAddress = {
  address: string;
  testnet: boolean;
  /** First 4 bytes of SHA-256 of the server's public key, hex. */
  arkId: string;
  policy: BarkAddressPolicy;
  delivery: BarkAddressDelivery[];
};

/** The 4-byte server identifier a Bark address carries, for a server pubkey. */
export function arkIdFor(serverPubkeyHex: string): string {
  const clean = serverPubkeyHex.trim().toLowerCase();
  if (!/^[0-9a-f]{66}$/.test(clean)) return '';
  const key = new Uint8Array(33);
  for (let i = 0; i < 33; i++) key[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bytesToHex(sha256(key).subarray(0, 4));
}

export function decodeBarkAddress(input: string): BarkAddress {
  const address = input.trim().toLowerCase();
  if (arkAddressFlavor(address) !== 'bark') throw new BarkError(tr('explorerBark.error.notBarkAddress'));
  let words: number[];
  let prefix: string;
  try {
    // Bark addresses run past bech32's usual 90-character limit.
    ({ prefix, words } = bech32m.decode(address as `${string}1${string}`, false));
  } catch {
    throw new BarkError(tr('explorerBark.error.checksum'));
  }
  let payload: Uint8Array;
  try {
    payload = bech32m.fromWords(words.slice(1));
  } catch {
    throw new BarkError(tr('explorerBark.error.decodeAddress'));
  }

  let pos = 0;
  const truncated = () => new BarkError(tr('explorerBark.error.truncatedAddress'));
  const compact = (): number => {
    if (pos >= payload.length) throw truncated();
    const first = payload[pos++];
    if (first < 0xfd) return first;
    const size = first === 0xfd ? 2 : first === 0xfe ? 4 : 8;
    if (pos + size > payload.length) throw truncated();
    let v = 0;
    for (let i = size - 1; i >= 0; i--) v = v * 256 + payload[pos + i];
    pos += size;
    return v;
  };
  const take = (n: number): Uint8Array => {
    if (pos + n > payload.length) throw truncated();
    const out = payload.subarray(pos, pos + n);
    pos += n;
    return out;
  };

  const arkId = bytesToHex(take(4));
  const policyBytes = take(compact());
  const policy: BarkAddressPolicy = policyBytes[0] === 0x00 && policyBytes.length === 34
    ? { kind: 'pubkey', userPubkey: bytesToHex(policyBytes.subarray(1)) }
    : { kind: 'other', typeByte: policyBytes[0] ?? -1 };
  const delivery: BarkAddressDelivery[] = [];
  while (pos < payload.length) {
    const d = take(compact());
    delivery.push(d[0] === 0x01 && d.length === 34
      ? { kind: 'mailbox', blindedId: bytesToHex(d.subarray(1)) }
      : { kind: 'unknown', typeByte: d[0] ?? -1 });
  }
  return { address, testnet: prefix === 'tark', arkId, policy, delivery };
}
