import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decodeMoneroAddress, looksLikeMoneroAddress } from './monero-address.ts';

// The Monero General Fund's donation address, and the keys the reference
// explorer reports for it.
const DONATION = '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A';
// A testnet address from the same explorer's documentation.
const TESTNET = '9wUf8UcPUtb2huK7RphBw5PFCyKosKxqtGxbcKBDnzTCPrdNfJjLjtuht87zhTgsffCB21qmjxjj18Pw7cBnRctcKHrUB7N';

describe('decodeMoneroAddress', () => {
  it('decodes a mainnet primary address into its two public keys', () => {
    const a = decodeMoneroAddress(DONATION);
    assert.ok(a);
    assert.equal(a.network, 'mainnet');
    assert.equal(a.kind, 'standard');
    assert.equal(a.spendPublicKey, '42f18fc61586554095b0799b5c4b6f00cdeb26a93b20540d366932c6001617b7');
    assert.equal(a.viewPublicKey, '5db35109fbba7d5f275fef4b9c49e0cc1c84b219ec6ff652fda54f89f7f63c88');
    assert.equal(a.paymentId, undefined);
  });

  it('decodes a testnet address', () => {
    const a = decodeMoneroAddress(TESTNET);
    assert.ok(a);
    assert.equal(a.network, 'testnet');
    assert.equal(a.kind, 'standard');
    assert.equal(a.spendPublicKey, '71bef5945b70bc0a31dbbe6cd0bd5884fe694bbfd18fff5f68f709438554fb88');
    assert.equal(a.viewPublicKey, 'a51b1291e378e2f46a0155108782c242cc1be78af229242c36d4f4d1c4f72da2');
  });

  it('refuses a typo, caught by the checksum', () => {
    const typo = DONATION.slice(0, 40) + (DONATION[40] === 'a' ? 'b' : 'a') + DONATION.slice(41);
    assert.equal(looksLikeMoneroAddress(typo), true);
    assert.equal(decodeMoneroAddress(typo), null);
  });

  it('refuses what is not a Monero address', () => {
    assert.equal(decodeMoneroAddress('bc1qvqfw3kc37zw68g0lf6fnf54d4s3a8tnqku02ry'), null);
    assert.equal(decodeMoneroAddress(DONATION.slice(0, 94)), null);
    assert.equal(decodeMoneroAddress(''), null);
  });

  it('trims the pasted string', () => {
    assert.equal(decodeMoneroAddress(`  ${DONATION}\n`)?.address, DONATION);
  });
});
