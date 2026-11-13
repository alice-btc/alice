import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ed25519 } from '@noble/curves/ed25519.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { decodeMoneroAddress, type MoneroAddress } from './monero-address.ts';
import { checkMoneroTx, parseMoneroScalar, parseTxExtra, type MoneroScanTx } from './monero-crypto.ts';
import { P2POOL_BLOCK, P2POOL_COINBASE_OUTPUTS } from './monero.fixtures.ts';

const Point = ed25519.Point;
const L = BigInt(2) ** BigInt(252) + BigInt('27742317777372353535851937790883648493');

// A 2017 RingCT payment to the Monero General Fund, whose view key is public;
// the reference explorer reads 34.98 XMR on output 0.
const DONATION = decodeMoneroAddress('44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A')!;
const DONATION_VIEW_KEY = 'f359631075708155cc3d92a32b75a7d02a5dcf27756707b47a2b31b21c389501';
const DONATION_TX: MoneroScanTx = {
  rctType: 1,
  extra: hexToBytes('01152775091b030d259f74ff7e6844ba3038ac75a06767529df26a12fbfda7c753'),
  outputs: [
    {
      key: '35d7200229e725c2bce0da3a2f20ef0720d242ecf88bfcb71eff2025c2501fdb',
      clearAmount: BigInt(0),
      encryptedAmount: '1266c3a09c6735be85c1bfc15de56de340f7e7483ad641ce01b9f2c115d4f70f',
      encryptedMask: '0e4e4f0a7708feeabd888dc75a0a61991aed2a35a147b2740958a2b726615106',
      commitment: 'f87183527cf1de2534c8fdc9ad4ea32b7b86a7c0d92372e3d5b21f993a4a76cc',
    },
    {
      key: '44efccab9f9b42e83c12da7988785d6c4eb3ec6e7aa2ae1234e2f0f7cb9ed6dd',
      clearAmount: BigInt(0),
      encryptedAmount: '7342adf077e16d7b59398b20695660035f5a4f2906eff22fe4c6f7d2a6fcf803',
      encryptedMask: '03ff5a5e87ccb20c12845941d1f7dac6a8c9188097dedc15ae8793b7fb1e6703',
      commitment: 'fc9b3c228d27dbf77bea77eb2cfc0157729938f93a65dbc6cbe051488324d92b',
    },
  ],
};

const P2POOL_TX: MoneroScanTx = {
  rctType: 0,
  extra: hexToBytes(P2POOL_BLOCK.extra),
  outputs: P2POOL_COINBASE_OUTPUTS.map(([key, viewTag, amount]) => ({ key, viewTag, clearAmount: BigInt(amount) })),
};

/* A sender and a recipient, built from the same formulas the wallets use, for
   the compact amount format and the per-output keys of current transactions. */

function le(n: bigint): Uint8Array {
  const out = new Uint8Array(32);
  let v = n;
  for (let i = 0; i < 32; i++) { out[i] = Number(v & BigInt(0xff)); v >>= BigInt(8); }
  return out;
}
function leNum(b: Uint8Array): bigint {
  let n = BigInt(0);
  for (let i = b.length - 1; i >= 0; i--) n = (n << BigInt(8)) | BigInt(b[i]);
  return n;
}
function hs(data: Uint8Array): bigint { return leNum(keccak_256(data)) % L; }
function cat(...p: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(p.reduce((n, x) => n + x.length, 0));
  let at = 0;
  for (const x of p) { out.set(x, at); at += x.length; }
  return out;
}
const H = Point.fromHex('8b655970153799af2aeadc9ff1add0ea6c7251d54154cfa92c173a0dd39c1f94');

function scalar(seed: string): bigint { return hs(utf8ToBytes(seed)); }

const a = scalar('view'); // recipient's private view key
const b = scalar('spend'); // recipient's private spend key
const r = scalar('tx'); // sender's transaction key
const RECIPIENT: MoneroAddress = {
  address: 'built in the test',
  network: 'mainnet',
  kind: 'standard',
  spendPublicKey: Point.BASE.multiply(b).toHex(),
  viewPublicKey: Point.BASE.multiply(a).toHex(),
};

/** A two-output transaction paying `amount` to RECIPIENT on output 1. */
function compactPayment(amount: bigint): MoneroScanTx {
  const R = Point.BASE.multiply(r);
  const D = Point.fromHex(RECIPIENT.viewPublicKey).multiply(r).multiply(BigInt(8)).toBytes();
  const s = hs(cat(D, Uint8Array.of(1)));
  const P = Point.BASE.multiply(s).add(Point.fromHex(RECIPIENT.spendPublicKey));
  const tag = bytesToHex(keccak_256(cat(utf8ToBytes('view_tag'), D, Uint8Array.of(1))).subarray(0, 1));
  const pad = keccak_256(cat(utf8ToBytes('amount'), le(s)));
  const enc = le(amount).subarray(0, 8).map((x, k) => x ^ pad[k]);
  const mask = hs(cat(utf8ToBytes('commitment_mask'), le(s)));
  const C = Point.BASE.multiply(mask).add(H.multiply(amount));
  const other = Point.BASE.multiply(scalar('someone else')).toHex();
  return {
    rctType: 6,
    extra: cat(Uint8Array.of(0x01), R.toBytes()),
    outputs: [
      { key: other, viewTag: '00', clearAmount: BigInt(0), encryptedAmount: '0000000000000000', commitment: other },
      { key: P.toHex(), viewTag: tag, clearAmount: BigInt(0), encryptedAmount: bytesToHex(enc), commitment: C.toHex() },
    ],
  };
}

describe('checkMoneroTx with a view key', () => {
  it('reads the General Fund donation: output 0, 34.98 XMR, confirmed by its commitment', () => {
    const res = checkMoneroTx(DONATION_TX, DONATION, 'view-key', DONATION_VIEW_KEY);
    assert.ok(res.ok);
    assert.deepEqual(res.owned, [{ index: 0, amount: BigInt(34980000000000), amountConfirmed: true }]);
    assert.equal(res.total, BigInt(34980000000000));
  });

  it('reads the compact amount of a current transaction', () => {
    const res = checkMoneroTx(compactPayment(BigInt(123456789012)), RECIPIENT, 'view-key', bytesToHex(le(a)));
    assert.ok(res.ok);
    assert.deepEqual(res.owned, [{ index: 1, amount: BigInt(123456789012), amountConfirmed: true }]);
  });

  it('refuses a view key that is not this address’s', () => {
    const res = checkMoneroTx(DONATION_TX, DONATION, 'view-key', bytesToHex(le(scalar('wrong'))));
    assert.deepEqual(res, { ok: false, reason: 'key-mismatch' });
  });

  it('recognises a private spend key pasted by mistake', () => {
    const res = checkMoneroTx(compactPayment(BigInt(1)), RECIPIENT, 'view-key', bytesToHex(le(b)));
    assert.deepEqual(res, { ok: false, reason: 'spend-key' });
  });

  it('refuses what is not a key', () => {
    assert.deepEqual(checkMoneroTx(DONATION_TX, DONATION, 'view-key', 'xyz'), { ok: false, reason: 'bad-key' });
    assert.deepEqual(checkMoneroTx(DONATION_TX, DONATION, 'view-key', 'ff'.repeat(32)), { ok: false, reason: 'bad-key' });
  });
});

describe('checkMoneroTx with a transaction key', () => {
  it('proves a P2Pool payout from the coinbase key the pool publishes', () => {
    const miner = decodeMoneroAddress(P2POOL_BLOCK.miner)!;
    const res = checkMoneroTx(P2POOL_TX, miner, 'tx-key', P2POOL_BLOCK.coinbaseKey);
    assert.ok(res.ok);
    assert.deepEqual(res.owned, [{ index: P2POOL_BLOCK.paidIndex, amount: P2POOL_BLOCK.paidAmount, amountConfirmed: true }]);
  });

  it('proves a payment in the compact format, the same amount the recipient reads', () => {
    const res = checkMoneroTx(compactPayment(BigInt(5000)), RECIPIENT, 'tx-key', bytesToHex(le(r)));
    assert.ok(res.ok);
    assert.deepEqual(res.owned, [{ index: 1, amount: BigInt(5000), amountConfirmed: true }]);
  });

  it('finds nothing with the key of another transaction', () => {
    const res = checkMoneroTx(compactPayment(BigInt(5000)), RECIPIENT, 'tx-key', bytesToHex(le(scalar('another tx'))));
    assert.ok(res.ok);
    assert.deepEqual(res.owned, []);
    assert.equal(res.total, BigInt(0));
  });

  it('finds nothing for another address', () => {
    const res = checkMoneroTx(P2POOL_TX, DONATION, 'tx-key', P2POOL_BLOCK.coinbaseKey);
    assert.ok(res.ok);
    assert.deepEqual(res.owned, []);
  });
});

describe('parseTxExtra', () => {
  it('reads a coinbase: the public key, the miner’s nonce and the merge-mining tag', () => {
    const e = parseTxExtra(hexToBytes(P2POOL_BLOCK.extra));
    assert.equal(e.txPublicKey, 'd9918da030c03dd2da3ca2b9fad03421c4ecbacb2ec1f97a36778fa429ab9b4d');
    assert.equal(e.otherNonce, true);
    assert.equal(e.nonStandard, false);
    assert.deepEqual(e.tags, [0x01, 0x02, 0x03]);
  });

  it('reads an encrypted payment id and the per-output keys', () => {
    const k = 'ab'.repeat(32);
    const e = parseTxExtra(cat(hexToBytes(`01${k}`), hexToBytes('020901' + '11'.repeat(8)), hexToBytes(`0402${k}${k}`)));
    assert.equal(e.encryptedPaymentId, '11'.repeat(8));
    assert.deepEqual(e.additionalPublicKeys, [k, k]);
    assert.equal(e.nonStandard, false);
  });

  it('flags an unknown tag and a field cut short', () => {
    assert.equal(parseTxExtra(Uint8Array.of(0x01, 0xaa)).nonStandard, true);
    assert.equal(parseTxExtra(Uint8Array.of(0x7f, 0x00)).nonStandard, true);
  });
});

describe('parseMoneroScalar', () => {
  it('accepts a reduced 64-hex key and nothing else', () => {
    assert.equal(parseMoneroScalar(DONATION_VIEW_KEY) !== null, true);
    assert.equal(parseMoneroScalar(` ${DONATION_VIEW_KEY.toUpperCase()} `) !== null, true);
    assert.equal(parseMoneroScalar('00'.repeat(32)), null);
    assert.equal(parseMoneroScalar('ff'.repeat(32)), null);
    assert.equal(parseMoneroScalar('abc'), null);
  });
});
