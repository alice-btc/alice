// Checking a Monero transaction against a key, on the device. A Monero output
// names no address: it goes to a one-time key only the recipient can
// recognise, and its amount is encrypted for them. Two keys open that,
// without being able to spend anything:
//
// - the recipient's private view key, with their address: which outputs of
//   the transaction are theirs, and how much each carries. The same key opens
//   every payment they ever received, so it is only ever used here, on the
//   device.
// - the sender's transaction key (one per transaction), with the recipient's
//   address: what the sender paid to that address in this transaction, and
//   nothing else. It is the key a wallet hands out to prove a payment.
//
// The maths is Monero's (CryptoNote) on ed25519. With a the view key and R
// the transaction's public key (or r the transaction key and A the address's
// public view key), the shared secret is D = 8aR = 8rA. For output i,
// s = Hs(D || i) and the output is the address's when P = sG + B, B the
// address's public spend key. s also unlocks the amount, which is then
// checked against the output's Pedersen commitment C = mask·G + amount·H, so
// a decoded amount is either confirmed by the chain or reported as not.
//
// Pure and synchronous: the caller hands in the transaction it already
// fetched (the public data only) and the key; nothing here makes a request.

import { ed25519 } from '@noble/curves/ed25519.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import type { MoneroAddress } from './monero-address.ts';

const Point = ed25519.Point;
type EdPoint = InstanceType<typeof Point>;

/** The order of ed25519's prime subgroup. BigInt() rather than literals:
 *  the app compiles to ES2017. */
const L = BigInt(2) ** BigInt(252) + BigInt('27742317777372353535851937790883648493');
/** Monero's second generator, for the amount in a commitment. */
const H = Point.fromHex('8b655970153799af2aeadc9ff1add0ea6c7251d54154cfa92c173a0dd39c1f94');

/** One output of a transaction, as the chain stores it. */
export type MoneroScanOutput = {
  /** The one-time output key P, 64 hex. */
  key: string;
  /** The output's view tag (1 byte, 2 hex), on transactions since 2022. */
  viewTag?: string;
  /** The amount in piconero when written in clear (a coinbase, an old
   *  transaction), else 0. */
  clearAmount: bigint;
  /** The encrypted amount: 16 hex on current transactions, 64 hex on the
   *  first RingCT ones, which also carry an encrypted mask. */
  encryptedAmount?: string;
  encryptedMask?: string;
  /** The output's amount commitment, 64 hex. */
  commitment?: string;
};

/** What a scan needs from a transaction: its extra field and its outputs. */
export type MoneroScanTx = {
  /** RingCT type: 0 for amounts in clear, 1–3 for the first RingCT formats,
   *  4 and up for the compact one (Bulletproofs, CLSAG, Bulletproofs+). */
  rctType: number;
  extra: Uint8Array;
  outputs: MoneroScanOutput[];
};

export type MoneroTxExtra = {
  /** The transaction public key R. */
  txPublicKey?: string;
  /** One extra public key per output, when the transaction pays subaddresses. */
  additionalPublicKeys: string[];
  /** The 8-byte encrypted payment id, 16 hex. Most wallets add one to every
   *  two-output transaction, real or not, so its presence says little. */
  encryptedPaymentId?: string;
  /** A 32-byte payment id in clear (a deprecated format), 64 hex. */
  plainPaymentId?: string;
  /** A nonce that is no payment id: normal on a coinbase (the miner's extra
   *  nonce), unusual anywhere else. */
  otherNonce: boolean;
  /** Fields this parser does not know, or a field cut short. */
  nonStandard: boolean;
  /** Raw tags in the order met, for display. */
  tags: number[];
};

export type MoneroKeyKind = 'view-key' | 'tx-key';

export type MoneroOwnedOutput = {
  index: number;
  /** Piconero; null when the amount could not be read. */
  amount: bigint | null;
  /** True when the amount matches the output's commitment on the chain (or
   *  is written in clear). */
  amountConfirmed: boolean;
};

export type MoneroCheckResult =
  | {
    ok: true;
    owned: MoneroOwnedOutput[];
    /** Sum of the confirmed amounts, piconero. */
    total: bigint;
    /** The payment id this transaction carries for the address, decrypted;
     *  absent when it is zero (a dummy) or there is none. */
    paymentId?: string;
  }
  | {
    ok: false;
    reason:
      | 'bad-key'        // not a 64-hex scalar
      | 'key-mismatch'   // the view key does not belong to this address
      | 'spend-key'      // that is the PRIVATE SPEND key of this address
      | 'no-tx-key';     // the transaction has no public key to check against
  };

function varint(n: number): Uint8Array {
  const out: number[] = [];
  let v = n;
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80);
    v = Math.floor(v / 128);
  }
  out.push(v);
  return Uint8Array.from(out);
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

function leToBigint(bytes: Uint8Array): bigint {
  let n = BigInt(0);
  for (let i = bytes.length - 1; i >= 0; i--) n = (n << BigInt(8)) | BigInt(bytes[i]);
  return n;
}

function bigintToLe32(n: bigint): Uint8Array {
  const out = new Uint8Array(32);
  let v = n;
  for (let i = 0; i < 32; i++) { out[i] = Number(v & BigInt(0xff)); v >>= BigInt(8); }
  return out;
}

function mod(n: bigint): bigint {
  const r = n % L;
  return r < BigInt(0) ? r + L : r;
}

/** Monero's Hs: Keccak-256 read as a little-endian number, reduced mod L. */
function hashToScalar(data: Uint8Array): bigint {
  return mod(leToBigint(keccak_256(data)));
}

/** k·P, with k = 0 giving the identity rather than an error. */
function mul(p: EdPoint, k: bigint): EdPoint {
  return k === BigInt(0) ? Point.ZERO : p.multiplyUnsafe(k);
}

function pointOrNull(hex: string): EdPoint | null {
  try { return Point.fromHex(hex); } catch { return null; }
}

/** A private key as typed: 64 hex, a scalar already reduced (as wallets
 *  export them). */
export function parseMoneroScalar(raw: string): bigint | null {
  const hex = raw.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hex)) return null;
  const n = leToBigint(hexToBytes(hex));
  return n > BigInt(0) && n < L ? n : null;
}

/** Read the tx_extra field: the public key, the per-output keys and the
 *  payment id. A field it cannot place stops the reading and is reported. */
export function parseTxExtra(extra: Uint8Array): MoneroTxExtra {
  const out: MoneroTxExtra = { additionalPublicKeys: [], otherNonce: false, nonStandard: false, tags: [] };
  let i = 0;
  const readVarint = (): number | null => {
    let n = 0;
    let shift = 0;
    while (i < extra.length && shift < 35) {
      const b = extra[i++];
      n += (b & 0x7f) * 2 ** shift;
      if ((b & 0x80) === 0) return n;
      shift += 7;
    }
    return null;
  };
  while (i < extra.length) {
    const tag = extra[i++];
    out.tags.push(tag);
    if (tag === 0x00) {
      // Padding runs to the end, all zeros.
      if (extra.subarray(i).some(b => b !== 0)) out.nonStandard = true;
      break;
    }
    if (tag === 0x01) {
      if (i + 32 > extra.length) { out.nonStandard = true; break; }
      // A second public key is legal but unusual; the first one counts.
      if (out.txPublicKey) out.nonStandard = true;
      else out.txPublicKey = bytesToHex(extra.subarray(i, i + 32));
      i += 32;
      continue;
    }
    if (tag === 0x02) {
      const len = extra[i++];
      if (len === undefined || i + len > extra.length) { out.nonStandard = true; break; }
      const nonce = extra.subarray(i, i + len);
      if (len === 9 && nonce[0] === 0x01) out.encryptedPaymentId = bytesToHex(nonce.subarray(1));
      else if (len === 33 && nonce[0] === 0x00) out.plainPaymentId = bytesToHex(nonce.subarray(1));
      else out.otherNonce = true;
      i += len;
      continue;
    }
    if (tag === 0x04) {
      const count = readVarint();
      if (count === null || i + count * 32 > extra.length) { out.nonStandard = true; break; }
      for (let k = 0; k < count; k++) out.additionalPublicKeys.push(bytesToHex(extra.subarray(i + k * 32, i + (k + 1) * 32)));
      i += count * 32;
      continue;
    }
    if (tag === 0x03 || tag === 0xde) {
      // Merge-mining tag, or a pool's own blob: a length, then the data.
      // Common on coinbases, so they are skipped without a flag.
      const len = readVarint();
      if (len === null || i + len > extra.length) { out.nonStandard = true; break; }
      i += len;
      continue;
    }
    out.nonStandard = true;
    break;
  }
  return out;
}

/** D = 8·k·P, the shared secret, as 32 bytes. */
function derivation(p: EdPoint, k: bigint): Uint8Array {
  return mul(mul(p, k), BigInt(8)).toBytes();
}

/** The output's view tag for a derivation: the first byte of
 *  Keccak("view_tag" || D || i). */
function viewTag(d: Uint8Array, index: number): string {
  return bytesToHex(keccak_256(concat(utf8ToBytes('view_tag'), d, varint(index))).subarray(0, 1));
}

/** Decode one owned output's amount and check it against the chain. */
function readAmount(tx: MoneroScanTx, out: MoneroScanOutput, s: bigint): { amount: bigint | null; confirmed: boolean } {
  if (tx.rctType === 0) return { amount: out.clearAmount, confirmed: true };
  const sBytes = bigintToLe32(s);
  let amount: bigint;
  let mask: bigint;
  if (tx.rctType >= 4) {
    if (!out.encryptedAmount || out.encryptedAmount.length !== 16) return { amount: null, confirmed: false };
    const pad = keccak_256(concat(utf8ToBytes('amount'), sBytes));
    const enc = hexToBytes(out.encryptedAmount);
    amount = leToBigint(enc.map((b, k) => b ^ pad[k]));
    mask = hashToScalar(concat(utf8ToBytes('commitment_mask'), sBytes));
  } else {
    if (!out.encryptedAmount || !out.encryptedMask) return { amount: null, confirmed: false };
    const hs = hashToScalar(sBytes);
    const hhs = hashToScalar(bigintToLe32(hs));
    mask = mod(leToBigint(hexToBytes(out.encryptedMask)) - hs);
    amount = mod(leToBigint(hexToBytes(out.encryptedAmount)) - hhs);
    if (amount >= BigInt(2) ** BigInt(64)) return { amount: null, confirmed: false };
  }
  if (!out.commitment) return { amount, confirmed: false };
  const c = pointOrNull(out.commitment);
  const expected = mul(Point.BASE, mask).add(mul(H, amount));
  return { amount, confirmed: !!c && c.equals(expected) };
}

/** Decrypt the payment id with the main derivation: XOR with
 *  Keccak(D || 0x8d). A zero id is a dummy and is not reported. */
function decryptPaymentId(encrypted: string, d: Uint8Array): string | undefined {
  const pad = keccak_256(concat(d, Uint8Array.of(0x8d)));
  const id = bytesToHex(hexToBytes(encrypted).map((b, k) => b ^ pad[k]));
  return /^0+$/.test(id) ? undefined : id;
}

/**
 * Which outputs of `tx` pay `address`, given either the address's private
 * view key or the sender's transaction key. Every derivation the
 * transaction allows is tried: the main public key, and the per-output keys
 * a payment to subaddresses carries.
 */
export function checkMoneroTx(tx: MoneroScanTx, address: MoneroAddress, kind: MoneroKeyKind, rawKey: string): MoneroCheckResult {
  const extra = parseTxExtra(tx.extra);
  const spend = pointOrNull(address.spendPublicKey);
  const view = pointOrNull(address.viewPublicKey);
  if (!spend || !view) return { ok: false, reason: 'key-mismatch' };

  // The derivation candidates for output i: [main, additional].
  let derive: (index: number) => Uint8Array[];
  let mainDerivation: Uint8Array | undefined;

  if (kind === 'view-key') {
    const a = parseMoneroScalar(rawKey);
    if (a === null) return { ok: false, reason: 'bad-key' };
    // A view key belongs to its address: A = aG for a primary address, and
    // C = aD for a subaddress (C, D its view and spend keys).
    const base = address.kind === 'subaddress' ? spend : Point.BASE;
    if (!mul(base, a).equals(view)) {
      // The spend key pasted by mistake: say so, it is the one that spends.
      if (address.kind !== 'subaddress' && mul(Point.BASE, a).equals(spend)) return { ok: false, reason: 'spend-key' };
      return { ok: false, reason: 'key-mismatch' };
    }
    const main = extra.txPublicKey ? pointOrNull(extra.txPublicKey) : null;
    const additional = extra.additionalPublicKeys.map(pointOrNull);
    if (!main && additional.every(p => !p)) return { ok: false, reason: 'no-tx-key' };
    const mainD = main ? derivation(main, a) : undefined;
    const addD = additional.map(p => (p ? derivation(p, a) : undefined));
    mainDerivation = mainD;
    derive = index => [mainD, addD[index]].filter((d): d is Uint8Array => !!d);
  } else {
    // A wallet exports the transaction key followed by one key per output
    // when it paid subaddresses: 64 hex each.
    const hex = rawKey.trim().toLowerCase();
    if (!/^(?:[0-9a-f]{64})+$/.test(hex)) return { ok: false, reason: 'bad-key' };
    const keys = hex.match(/.{64}/g)!.map(parseMoneroScalar);
    if (keys.some(k => k === null)) return { ok: false, reason: 'bad-key' };
    // rG = R is not required: a transaction paying a single subaddress has
    // R = rD instead. A wrong key simply matches no output.
    const [r, ...extraKeys] = keys as bigint[];
    const mainD = derivation(view, r);
    const addD = extraKeys.map(k => derivation(view, k));
    mainDerivation = mainD;
    derive = index => [mainD, addD[index]].filter((d): d is Uint8Array => !!d);
  }

  const owned: MoneroOwnedOutput[] = [];
  tx.outputs.forEach((out, index) => {
    const p = pointOrNull(out.key);
    if (!p) return;
    for (const d of derive(index)) {
      if (out.viewTag && viewTag(d, index) !== out.viewTag.toLowerCase()) continue;
      const s = hashToScalar(concat(d, varint(index)));
      if (!mul(Point.BASE, s).add(spend).equals(p)) continue;
      const { amount, confirmed } = readAmount(tx, out, s);
      owned.push({ index, amount, amountConfirmed: confirmed });
      break;
    }
  });

  const total = owned.reduce((sum, o) => sum + (o.amountConfirmed && o.amount !== null ? o.amount : BigInt(0)), BigInt(0));
  const paymentId = owned.length > 0 && extra.encryptedPaymentId && mainDerivation
    ? decryptPaymentId(extra.encryptedPaymentId, mainDerivation)
    : undefined;
  return { ok: true, owned, total, ...(paymentId ? { paymentId } : {}) };
}
