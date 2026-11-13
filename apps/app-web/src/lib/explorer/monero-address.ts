import { t } from '../../i18n/translate.ts';
// Monero addresses, decoded on the device. An address is never written on the
// Monero chain (every output goes to a fresh one-time key), so there is
// nothing to look up: the Explorer only reads what the address says about
// itself, its network, its kind, its two public keys and, for an integrated
// address, the payment id it carries.
//
// The encoding is Monero's own base58: the bytes are cut into 8-byte blocks,
// each written as 11 characters (a shorter last block as fewer), so the
// alphabet is Bitcoin's but the result is not. The checksum is the first 4
// bytes of Keccak-256 (the original Keccak, not SHA3) over everything before.

import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex } from '@noble/hashes/utils.js';

export type MoneroNetworkType = 'mainnet' | 'testnet' | 'stagenet';
export type MoneroAddressKind = 'standard' | 'integrated' | 'subaddress';

export type MoneroAddress = {
  address: string;
  network: MoneroNetworkType;
  kind: MoneroAddressKind;
  /** Public spend key, 64 hex. */
  spendPublicKey: string;
  /** Public view key, 64 hex. */
  viewPublicKey: string;
  /** The 8-byte payment id an integrated address embeds, 16 hex. */
  paymentId?: string;
};

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const FULL_BLOCK = 8;
const FULL_ENCODED = 11;
// Characters written for a block of 0..8 bytes.
const ENCODED_SIZES = [0, 2, 3, 5, 6, 7, 9, 10, 11];

// Network prefixes, each a single-byte varint.
const PREFIXES: Record<number, { network: MoneroNetworkType; kind: MoneroAddressKind }> = {
  18: { network: 'mainnet', kind: 'standard' },
  19: { network: 'mainnet', kind: 'integrated' },
  42: { network: 'mainnet', kind: 'subaddress' },
  53: { network: 'testnet', kind: 'standard' },
  54: { network: 'testnet', kind: 'integrated' },
  63: { network: 'testnet', kind: 'subaddress' },
  24: { network: 'stagenet', kind: 'standard' },
  25: { network: 'stagenet', kind: 'integrated' },
  36: { network: 'stagenet', kind: 'subaddress' },
};

// Mainnet addresses start with 4 (standard, integrated) or 8 (subaddress):
// 95 characters, 106 for an integrated one. The test networks start with 9,
// A, B (testnet) and 5, 7 (stagenet).
const MONERO_ADDR = /^[4-9AB][1-9A-HJ-NP-Za-km-z]{94}(?:[1-9A-HJ-NP-Za-km-z]{11})?$/;

/** True when the string has the shape of a Monero address (checksum unchecked). */
export function looksLikeMoneroAddress(s: string): boolean {
  return MONERO_ADDR.test(s.trim());
}

function decodeBlock(block: string, size: number): Uint8Array | null {
  let num = BigInt(0);
  for (const ch of block) {
    const digit = ALPHABET.indexOf(ch);
    if (digit < 0) return null;
    num = num * BigInt(58) + BigInt(digit);
  }
  if (num >= BigInt(1) << BigInt(size * 8)) return null;
  const out = new Uint8Array(size);
  for (let i = size - 1; i >= 0; i--) {
    out[i] = Number(num & BigInt(0xff));
    num >>= BigInt(8);
  }
  return out;
}

/** Monero base58 to bytes, or null when the string is not valid in it. */
export function decodeMoneroBase58(s: string): Uint8Array | null {
  const fullBlocks = Math.floor(s.length / FULL_ENCODED);
  const lastEncoded = s.length % FULL_ENCODED;
  const lastSize = ENCODED_SIZES.indexOf(lastEncoded);
  if (lastSize < 0) return null;
  const out = new Uint8Array(fullBlocks * FULL_BLOCK + lastSize);
  for (let i = 0; i < fullBlocks; i++) {
    const block = decodeBlock(s.slice(i * FULL_ENCODED, (i + 1) * FULL_ENCODED), FULL_BLOCK);
    if (!block) return null;
    out.set(block, i * FULL_BLOCK);
  }
  if (lastSize > 0) {
    const block = decodeBlock(s.slice(fullBlocks * FULL_ENCODED), lastSize);
    if (!block) return null;
    out.set(block, fullBlocks * FULL_BLOCK);
  }
  return out;
}

/**
 * Decode a Monero address, checksum verified. Returns null for anything that
 * is not one: a wrong length, a character outside the alphabet, an unknown
 * network prefix or a checksum that does not match (a typo).
 */
export function decodeMoneroAddress(raw: string): MoneroAddress | null {
  const address = raw.trim();
  if (!looksLikeMoneroAddress(address)) return null;
  const bytes = decodeMoneroBase58(address);
  if (!bytes) return null;
  const prefix = PREFIXES[bytes[0]];
  if (!prefix) return null;
  const expectedLength = prefix.kind === 'integrated' ? 77 : 69;
  if (bytes.length !== expectedLength) return null;
  const body = bytes.subarray(0, bytes.length - 4);
  const checksum = keccak_256(body).subarray(0, 4);
  if (!checksum.every((b, i) => b === bytes[bytes.length - 4 + i])) return null;
  return {
    address,
    network: prefix.network,
    kind: prefix.kind,
    spendPublicKey: bytesToHex(bytes.subarray(1, 33)),
    viewPublicKey: bytesToHex(bytes.subarray(33, 65)),
    ...(prefix.kind === 'integrated' ? { paymentId: bytesToHex(bytes.subarray(65, 73)) } : {}),
  };
}

/** The Explorer's words for an address kind. */
export function moneroAddressKindLabel(kind: MoneroAddressKind): string {
  switch (kind) {
    case 'standard': return t('explorerMonero.address.standard');
    case 'subaddress': return t('explorerMonero.address.subaddress');
    case 'integrated': return t('explorerMonero.address.integrated');
  }
}
