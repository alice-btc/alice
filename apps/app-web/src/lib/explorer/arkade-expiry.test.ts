import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  EXPIRY_MIN_PLAUSIBLE_MS, isDateExpired, parseCanonicalExpiry, parseLegacyExpiry, parseScalarExpiry, pickExpiry, readExpiry,
} from './arkade-expiry.ts';

describe('parseScalarExpiry', () => {
  it('uses the SDK cut-off, 1 January 2025, not the BIP65 threshold', () => {
    assert.equal(EXPIRY_MIN_PLAUSIBLE_MS, Date.UTC(2025, 0, 1));
    assert.deepEqual(parseScalarExpiry('1735689600'), { expiresAt: 1_735_689_600 });
    assert.deepEqual(parseScalarExpiry('1735689599'), { expiresAtHeight: 1_735_689_599 });
    assert.deepEqual(parseScalarExpiry(950_000), { expiresAtHeight: 950_000 });
    assert.deepEqual(parseScalarExpiry('600000000'), { expiresAtHeight: 600_000_000 });
  });

  it('reads absent, empty, zero, negative and invalid values as unknown', () => {
    for (const raw of [undefined, null, '', '  ', '0', 0, '-1', 'x', NaN, Infinity, '1e999', {}, [], true]) {
      assert.deepEqual(parseScalarExpiry(raw), {}, String(raw));
    }
  });
});

describe('parseLegacyExpiry and parseCanonicalExpiry', () => {
  it('reads milliseconds for a date and height times 1000 for a height', () => {
    assert.deepEqual(parseLegacyExpiry(1_790_000_000_000), { expiresAt: 1_790_000_000 });
    assert.deepEqual(parseLegacyExpiry(950_000_000), { expiresAtHeight: 950_000 });
    for (const raw of [undefined, 0, -5, NaN, '1790000000000']) assert.deepEqual(parseLegacyExpiry(raw), {});
  });

  it('takes canonical fields as they are', () => {
    assert.deepEqual(parseCanonicalExpiry(new Date(1_790_000_000_000), undefined), { expiresAt: 1_790_000_000 });
    assert.deepEqual(parseCanonicalExpiry('2026-10-01T00:00:00Z', undefined), { expiresAt: Math.floor(Date.parse('2026-10-01T00:00:00Z') / 1000) });
    assert.deepEqual(parseCanonicalExpiry(undefined, 950_000), { expiresAtHeight: 950_000 });
    assert.deepEqual(parseCanonicalExpiry(new Date(NaN), 0), {});
  });
});

describe('pickExpiry and readExpiry', () => {
  it('takes the first source that knows an expiry, whole', () => {
    assert.deepEqual(pickExpiry({ expiresAtHeight: 950_000 }, { expiresAt: 1_790_000_000 }), { expiresAtHeight: 950_000 });
    assert.deepEqual(pickExpiry({}, { expiresAt: 1_790_000_000, expiresAtHeight: 5 }), { expiresAt: 1_790_000_000 });
    assert.deepEqual(pickExpiry(null, undefined, {}), {});
  });

  it('names the date, the block or the unknown', () => {
    assert.deepEqual(readExpiry({ expiresAt: 1_790_000_000 }), { kind: 'date', sec: 1_790_000_000 });
    assert.deepEqual(readExpiry({ expiresAtHeight: 950_000 }), { kind: 'block', height: 950_000 });
    assert.deepEqual(readExpiry({ expiresAt: 0 }), { kind: 'unknown' });
    assert.deepEqual(readExpiry(undefined), { kind: 'unknown' });
  });

  it('judges only a date by the clock', () => {
    assert.equal(isDateExpired({ expiresAt: 100 }, 200), true);
    assert.equal(isDateExpired({ expiresAt: 300 }, 200), false);
    assert.equal(isDateExpired({ expiresAtHeight: 100 }, 200), false, 'a height is not compared with seconds');
    assert.equal(isDateExpired({}, 200), false);
  });
});

// A malformed operator scalar must not crash the date formatter or invent a
// fractional block height. These inputs are finite but not valid expiries.
describe('invalid expiry ranges', () => {
  it('rejects dates outside the JS Date range and non-integral heights', () => {
    for (const raw of ['1e20', 1e20, '950000.5']) assert.deepEqual(parseScalarExpiry(raw), {});
    assert.deepEqual(parseCanonicalExpiry(undefined, Number.MAX_SAFE_INTEGER + 1), {});
    assert.deepEqual(readExpiry({ expiresAt: 1e20 }), { kind: 'unknown' });
    assert.deepEqual(readExpiry({ expiresAtHeight: 1.5 }), { kind: 'unknown' });
  });
  it('keeps one unit if a malformed canonical object names both', () => {
    assert.deepEqual(parseCanonicalExpiry(new Date(1_790_000_000_000), 950_000), { expiresAt: 1_790_000_000 });
  });
});
