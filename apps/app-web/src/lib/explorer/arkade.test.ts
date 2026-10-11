import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { arkadeAddressOf, looksLikeArkadeAddress, looksLikeTxid, normalizeVtxo } from './arkade.ts';

describe('normalizeVtxo', () => {
  it('reads the SDK VirtualCoin shape (flat outpoint, value, virtualStatus)', () => {
    const v = normalizeVtxo({
      txid: 'a'.repeat(64),
      vout: 1,
      value: 15046,
      status: { confirmed: false },
      createdAt: new Date(1_786_771_107_000),
      virtualStatus: {
        state: 'preconfirmed',
        commitmentTxIds: ['c'.repeat(64)],
        batchExpiry: 1_789_269_053_000,
      },
    });
    assert.equal(v.txid, 'a'.repeat(64));
    assert.equal(v.vout, 1);
    assert.equal(v.amountSats, 15046);
    assert.equal(v.isPreconfirmed, true);
    assert.equal(v.isSpent, false);
    assert.equal(v.createdAt, 1_786_771_107);
    assert.equal(v.expiresAt, 1_789_269_053);
    assert.deepEqual(v.commitmentTxids, ['c'.repeat(64)]);
  });

  it('reads the raw gateway shape (nested outpoint, string amounts)', () => {
    const v = normalizeVtxo({
      outpoint: { txid: 'b'.repeat(64), vout: 0 },
      amount: '38000',
      isPreconfirmed: false,
      isSpent: true,
      createdAt: '1786765019',
      expiresAt: '1789357275',
      commitmentTxids: ['d'.repeat(64)],
    });
    assert.equal(v.txid, 'b'.repeat(64));
    assert.equal(v.amountSats, 38000);
    assert.equal(v.isSpent, true);
    assert.equal(v.isPreconfirmed, false);
    assert.equal(v.createdAt, 1_786_765_019);
    assert.equal(v.expiresAt, 1_789_357_275);
    assert.deepEqual(v.commitmentTxids, ['d'.repeat(64)]);
  });

  it('keeps the script the gateway serves, for the address', () => {
    const v = normalizeVtxo({ outpoint: { txid: 'b'.repeat(64), vout: 0 }, amount: '1', script: '5120' + 'AB'.repeat(32) });
    assert.equal(v.scriptHex, '5120' + 'ab'.repeat(32));
    assert.equal(normalizeVtxo({ outpoint: { txid: 'b'.repeat(64), vout: 0 }, amount: '1' }).scriptHex, undefined);
  });

  it('maps the swept and spent virtualStatus states', () => {
    assert.equal(normalizeVtxo({ txid: 'a'.repeat(64), vout: 0, value: 1, virtualStatus: { state: 'swept' } }).isSwept, true);
    assert.equal(normalizeVtxo({ txid: 'a'.repeat(64), vout: 0, value: 1, virtualStatus: { state: 'spent' } }).isSpent, true);
    const settled = normalizeVtxo({ txid: 'a'.repeat(64), vout: 0, value: 1, virtualStatus: { state: 'settled' } });
    assert.equal(settled.isSpent || settled.isSwept || settled.isPreconfirmed, false);
  });
});

describe('input prefilters', () => {
  it('recognises Arkade addresses and txids', () => {
    assert.equal(looksLikeArkadeAddress('ark1qzpq904am6clw3pgqwyh4p02708fy4xs0hcpwt7rwfdttuxsjameezgu4rz4mh977mt5zc2gquwfdy94npcvgfg865k8dt077z5a70aykxu669'), true);
    assert.equal(looksLikeArkadeAddress('bc1qzzdzp5c443vsetzatf2ra6hku322y7e5aq50rs'), false);
    // A Bark address shares the prefix but not the version.
    assert.equal(looksLikeArkadeAddress('ark1pwh9vsmezqqpharv69q4z8m6x364d5m5prnmcalcalq9pdmzw0y7mpveck4pcfhezqypczkrrj3lkx5ue4qrf4jc7ztpt9htdttmh2judhqnu7aue8p0y9mqkr4cf5'), false);
    assert.equal(looksLikeTxid('f'.repeat(64)), true);
    assert.equal(looksLikeTxid('f'.repeat(63)), false);
  });
});

describe('arkadeAddressOf', () => {
  // A real mainnet address, its taproot script and the operator's signer key
  // (compressed, as /v1/info serves it).
  const script = '512095c884f5dec9aeb12508423834f8eea17e2037032d8b98f64b60a74125ec303e';
  const signer = '038202bebddeb1f7442803897a85eaf3ce9254d07df0172fc3725ab5f0d097779c';
  const address = 'ark1qzpq904am6clw3pgqwyh4p02708fy4xs0hcpwt7rwfdttuxsjamee9wgsn6aajdwkyjsss3cxnuwagt7yqmsxtvtnrmykc98gyj7cvp7wwwlq3';

  it('rebuilds the address from a VTXO script and the operator key', () => {
    assert.equal(arkadeAddressOf(script, signer), address);
    // The x-only key works too, and so does upper-case hex.
    assert.equal(arkadeAddressOf(script.toUpperCase(), signer.slice(2)), address);
  });

  it('uses the tark prefix off mainnet', () => {
    assert.match(arkadeAddressOf(script, signer, 'signet') ?? '', /^tark1q/);
  });

  it('answers null for anything but a P2TR script or a malformed key', () => {
    assert.equal(arkadeAddressOf('51024e73', signer), null);
    assert.equal(arkadeAddressOf('0014' + 'ab'.repeat(20), signer), null);
    assert.equal(arkadeAddressOf(script, '04' + 'ab'.repeat(32)), null);
    assert.equal(arkadeAddressOf('', signer), null);
  });
});
