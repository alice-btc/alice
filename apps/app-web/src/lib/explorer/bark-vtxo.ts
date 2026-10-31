// Decoding a Bark VTXO, the data a holder keeps for one off-chain coin.
//
// A Bark server publishes no index, so the only way to look at a coin is to
// start from the coin itself: either its export (the hex barkd returns from
// GET /vtxos/{id}/encoded), decoded here without leaving the device, or its id,
// which the server answers without authentication (see fetchBarkVtxo).
//
// The encoding is Bark's own (lib/src/vtxo/mod.rs, versions 1 and 2): the
// amount, expiry and server key, the on-chain outpoint the coin is anchored
// to, then the "genesis": one item per transaction between that anchor and the
// coin. Those transactions are presigned, so the genesis IS the coin's exit
// path: broadcasting them in order, then waiting the exit delay, takes the
// coin on-chain without the server. Each item also lists the sibling outputs
// of its transaction, which is what the exit-tree view will draw.

import { BarkError } from './bark.ts';
import { t as tr } from '../../i18n/translate.ts';

const ENCODING_V1 = 1; // before genesis items carried a fee amount
const ENCODING_V2 = 2;

export type BarkOutPoint = { txid: string; vout: number };

export type BarkVtxoPolicy =
  | { kind: 'pubkey'; userPubkey: string }
  | { kind: 'htlc-send'; userPubkey: string; paymentHash: string; htlcExpiry: number }
  | { kind: 'htlc-receive'; userPubkey: string; paymentHash: string; htlcExpiry: number; htlcExpiryDelta: number }
  | { kind: 'checkpoint'; userPubkey: string }
  | { kind: 'expiry'; internalKey: string }
  | { kind: 'hark-leaf'; userPubkey: string; unlockHash: string }
  | { kind: 'hark-forfeit'; userPubkey: string; unlockHash: string }
  | { kind: 'server-owned' };

/** One presigned transaction between the on-chain anchor and the coin. */
export type BarkGenesisStep = {
  /** cosigned: a node of a round's tree, or a board, signed together by its
   *  keys; arkoor: a payment made outside a round, cosigned by the server;
   *  hash-locked: a round leaf, released to its owner by a secret. */
  kind: 'cosigned' | 'arkoor' | 'hash-locked';
  /** Keys signing the step (cosigned: all of them; arkoor: the client
   *  cosigners, the server comes on top; hash-locked: the owner). */
  signers: number;
  /** Those keys, hex (cosigned: every signer; arkoor: the client cosigners,
   *  the holder spending; hash-locked: the owner). */
  cosigners: string[];
  /** False while the signature is still missing (an unfinished coin). */
  signed: boolean;
  /** hash-locked only: whether the secret itself is in the data, or only its hash. */
  preimageRevealed?: boolean;
  /** Outputs of the step's transaction, this coin's branch included. */
  outputs: number;
  /** Which of them continues towards this coin. */
  outputIndex: number;
  /** The other outputs: the branches leading to other coins. */
  siblings: { amountSats: number; scriptHex: string }[];
  feeSats: number;
};

export type BarkVtxo = {
  encodingVersion: number;
  /** The outpoint the coin sits on, as "txid:vout": its id. */
  id: string;
  point: BarkOutPoint;
  amountSats: number;
  /** Block height after which the server can sweep the coin. */
  expiryHeight: number;
  serverPubkey: string;
  /** Blocks to wait after the exit path is confirmed. */
  exitDeltaBlocks: number;
  /** The on-chain output everything hangs from (a round or a board). */
  anchor: BarkOutPoint;
  genesis: BarkGenesisStep[];
  policy: BarkVtxoPolicy;
};

function hex(b: Uint8Array): string {
  let s = '';
  for (const x of b) s += x.toString(16).padStart(2, '0');
  return s;
}

function fromHex(s: string): Uint8Array | null {
  if (s.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(s)) return null;
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

class Reader {
  pos = 0;
  private readonly buf: Uint8Array;
  constructor(buf: Uint8Array) { this.buf = buf; }
  get done(): boolean { return this.pos >= this.buf.length; }
  take(n: number): Uint8Array {
    if (n < 0 || this.pos + n > this.buf.length) throw new BarkError(tr('explorerBark.error.vtxoTruncated'));
    const out = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return out;
  }
  u8(): number { return this.take(1)[0]; }
  /** Little-endian unsigned integer of `size` bytes, as a number. */
  uint(size: number): number {
    const b = this.take(size);
    let v = 0;
    for (let i = size - 1; i >= 0; i--) v = v * 256 + b[i];
    return v;
  }
  compact(): number {
    const first = this.u8();
    if (first < 0xfd) return first;
    return this.uint(first === 0xfd ? 2 : first === 0xfe ? 4 : 8);
  }
  pubkey(): string {
    const k = this.take(33);
    if (k[0] !== 0x02 && k[0] !== 0x03) throw new BarkError(tr('explorerBark.error.vtxoPubkey'));
    return hex(k);
  }
  /** A consensus outpoint: txid in internal byte order, then vout. */
  outpoint(): BarkOutPoint {
    const txid = hex(this.take(32).slice().reverse());
    return { txid, vout: this.uint(4) };
  }
  /** Bark encodes a missing signature as 64 zero bytes. */
  signature(): boolean {
    return this.take(64).some(b => b !== 0);
  }
}

function readPolicy(r: Reader): BarkVtxoPolicy {
  const type = r.u8();
  switch (type) {
    case 0x00: return { kind: 'pubkey', userPubkey: r.pubkey() };
    case 0x01:
    case 0x09: return { kind: 'htlc-send', userPubkey: r.pubkey(), paymentHash: hex(r.take(32)), htlcExpiry: r.uint(4) };
    case 0x02:
    case 0x08: return {
      kind: 'htlc-receive', userPubkey: r.pubkey(), paymentHash: hex(r.take(32)), htlcExpiry: r.uint(4), htlcExpiryDelta: r.uint(2),
    };
    case 0x03: return { kind: 'checkpoint', userPubkey: r.pubkey() };
    case 0x04: return { kind: 'expiry', internalKey: hex(r.take(32)) };
    case 0x05:
    case 0x0a: return { kind: 'hark-leaf', userPubkey: r.pubkey(), unlockHash: hex(r.take(32)) };
    case 0x06:
    case 0x0b: return { kind: 'hark-forfeit', userPubkey: r.pubkey(), unlockHash: hex(r.take(32)) };
    case 0x07: return { kind: 'server-owned' };
    default: throw new BarkError(tr('explorerBark.error.vtxoPolicy', { type }));
  }
}

function readStep(r: Reader, version: number): BarkGenesisStep {
  const type = r.u8();
  let kind: BarkGenesisStep['kind'];
  let signers: number;
  let signed: boolean;
  let preimageRevealed: boolean | undefined;
  const cosigners: string[] = [];
  if (type === 1) {
    kind = 'cosigned';
    signers = r.compact();
    if (signers === 0) throw new BarkError(tr('explorerBark.error.vtxoSigners'));
    for (let i = 0; i < signers; i++) cosigners.push(r.pubkey());
    signed = r.signature();
  } else if (type === 2) {
    kind = 'arkoor';
    signers = r.compact();
    for (let i = 0; i < signers; i++) cosigners.push(r.pubkey());
    r.take(32); // taproot tweak
    signed = r.signature();
  } else if (type === 3 || type === 4) {
    kind = 'hash-locked';
    signers = 1;
    cosigners.push(r.pubkey());
    signed = r.signature();
    const unlock = r.u8();
    if (unlock !== 0 && unlock !== 1) throw new BarkError(tr('explorerBark.error.vtxoRoundLeaf'));
    preimageRevealed = unlock === 0;
    r.take(32); // the preimage, or its hash
  } else {
    throw new BarkError(tr('explorerBark.error.vtxoTxType', { type }));
  }
  const outputs = r.u8();
  const outputIndex = r.u8();
  if (outputs === 0 || outputIndex >= outputs) throw new BarkError(tr('explorerBark.error.vtxoInconsistent'));
  const siblings: BarkGenesisStep['siblings'] = [];
  for (let i = 0; i < outputs - 1; i++) {
    const amountSats = r.uint(8);
    siblings.push({ amountSats, scriptHex: hex(r.take(r.compact())) });
  }
  const feeSats = version === ENCODING_V1 ? 0 : r.uint(8);
  return { kind, signers, cosigners, signed, preimageRevealed, outputs, outputIndex, siblings, feeSats };
}

/** Decode a serialized Bark VTXO (encoding versions 1 and 2). */
export function decodeBarkVtxo(data: Uint8Array): BarkVtxo {
  const r = new Reader(data);
  const encodingVersion = r.uint(2);
  if (encodingVersion !== ENCODING_V1 && encodingVersion !== ENCODING_V2) {
    throw new BarkError(tr('explorerBark.error.vtxoVersion', { version: encodingVersion }));
  }
  const amountSats = r.uint(8);
  const expiryHeight = r.uint(4);
  const serverPubkey = r.pubkey();
  const exitDeltaBlocks = r.uint(2);
  const anchor = r.outpoint();
  const count = r.compact();
  if (count > 1000) throw new BarkError(tr('explorerBark.error.vtxoLongPath'));
  const genesis: BarkGenesisStep[] = [];
  for (let i = 0; i < count; i++) genesis.push(readStep(r, encodingVersion));
  const policy = readPolicy(r);
  const point = r.outpoint();
  if (!r.done) throw new BarkError(tr('explorerBark.error.vtxoTrailing'));
  return {
    encodingVersion, id: `${point.txid}:${point.vout}`, point, amountSats, expiryHeight,
    serverPubkey, exitDeltaBlocks, anchor, genesis, policy,
  };
}

/** The 36-byte id the server expects: txid in internal byte order, then vout. */
export function vtxoIdBytes(p: BarkOutPoint): Uint8Array {
  const txid = fromHex(p.txid);
  if (!txid || txid.length !== 32) throw new BarkError(tr('explorerBark.error.vtxoId'));
  const out = new Uint8Array(36);
  out.set(txid.reverse(), 0);
  new DataView(out.buffer).setUint32(32, p.vout, true);
  return out;
}

export type VtxoInput =
  | { kind: 'id'; point: BarkOutPoint }
  | { kind: 'export'; data: Uint8Array };

/**
 * Read what the person pasted: a VTXO id ("txid:vout", as Bark wallets show
 * it) or a VTXO export (hex). Null when it is neither.
 */
export function parseVtxoInput(raw: string): VtxoInput | null {
  const s = raw.trim().replace(/^["']|["']$/g, '');
  const id = /^([0-9a-fA-F]{64}):(\d{1,10})$/.exec(s);
  if (id) {
    const vout = Number(id[2]);
    return vout <= 0xffffffff ? { kind: 'id', point: { txid: id[1].toLowerCase(), vout } } : null;
  }
  const compact = s.replace(/\s+/g, '').replace(/^0x/i, '');
  // The smallest real VTXO (an on-chain one, no genesis) is about 120 bytes.
  if (compact.length < 200) return null;
  const data = fromHex(compact);
  return data ? { kind: 'export', data } : null;
}

/** Where the coin comes from, read from the shape of its exit path. */
export function vtxoOrigin(v: BarkVtxo): 'round' | 'board' | 'onchain' | 'unknown' {
  if (v.genesis.length === 0) return 'onchain';
  if (v.genesis.some(s => s.kind === 'hash-locked')) return 'round';
  const first = v.genesis[0];
  if (first.kind === 'cosigned' && first.signers <= 2 && first.outputs === 1) return 'board';
  if (first.kind === 'cosigned') return 'round';
  return 'unknown';
}

/**
 * The amounts along the coin's branch: what the on-chain anchor output holds,
 * and the value of the branch's output at each step. Read backwards from the
 * coin: a step's input is its branch output plus its other outputs and fee.
 */
export function exitPathAmounts(v: BarkVtxo): { anchorSats: number; branchSats: number[] } {
  const branchSats = new Array<number>(v.genesis.length);
  let flowing = v.amountSats;
  for (let i = v.genesis.length - 1; i >= 0; i--) {
    branchSats[i] = flowing;
    const s = v.genesis[i];
    flowing += s.siblings.reduce((t, o) => t + o.amountSats, 0) + s.feeSats;
  }
  return { anchorSats: flowing, branchSats };
}

/** True for the policies a user's coin carries. The others (a round tree's
 *  node, a checkpoint, an unclaimed leaf) are outputs the server tracks, which
 *  it also returns for an id: a round's root, whose id is public on-chain,
 *  comes back that way. */
export function isUserPolicy(p: BarkVtxoPolicy): boolean {
  return p.kind === 'pubkey' || p.kind === 'htlc-send' || p.kind === 'htlc-receive';
}

/** Payments made outside a round since the coin left its round or board. */
export function arkoorHops(v: BarkVtxo): number {
  return v.genesis.filter(s => s.kind === 'arkoor').length;
}

/** One off-chain spend: the arkoor steps it took, and whether it moved the
 *  coin whole (no other output). */
export type BarkSpend = { from: number; to: number; whole: boolean };

/**
 * Group the arkoor steps into spends. With checkpoints, bark's default, one
 * spend is two steps: the checkpoint transaction, carrying the outputs, then
 * the transaction spending the holder's checkpoint output, both cosigned by
 * that same key, the second with one output and no fee. Two such steps in a
 * row read as one spend; any other arkoor step is a spend of its own.
 */
export function arkoorSpends(v: BarkVtxo): BarkSpend[] {
  const spends: BarkSpend[] = [];
  const g = v.genesis;
  for (let i = 0; i < g.length; i++) {
    const s = g[i];
    if (s.kind !== 'arkoor') continue;
    const next = g[i + 1];
    const paired = next !== undefined && next.kind === 'arkoor' && next.outputs === 1 && next.feeSats === 0
      && s.cosigners.length === 1 && next.cosigners.length === 1 && s.cosigners[0] === next.cosigners[0];
    const to = paired ? i + 1 : i;
    spends.push({ from: i, to, whole: s.outputs === 1 });
    i = to;
  }
  return spends;
}
