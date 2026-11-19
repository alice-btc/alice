import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BITCOIN_SCALE, feeColor, formatBlockAge, formatBytes, formatFeeRange, formatFeeRate } from './blocks.ts';

describe('feeColor', () => {
  it('is muted when there is no fee data', () => {
    assert.equal(feeColor(undefined), 'var(--alice-muted)');
    assert.equal(feeColor(0), 'var(--alice-muted)');
  });
  it('climbs the heat scale with the median fee', () => {
    const low = feeColor(1);
    const mid = feeColor(15);
    const high = feeColor(200);
    assert.notEqual(low, mid);
    assert.notEqual(mid, high);
    assert.equal(high, '#c83a3a');
  });
});

describe('formatBlockAge', () => {
  it('says just now under 45 seconds', () => {
    assert.equal(formatBlockAge(1000, 1030), 'just now');
  });
  it('reports minutes, hours and days', () => {
    assert.equal(formatBlockAge(0, 300), '5m ago');
    assert.equal(formatBlockAge(0, 7200), '2h ago');
    assert.equal(formatBlockAge(0, 172800), '2d ago');
  });
  it('never goes negative for a future timestamp', () => {
    assert.equal(formatBlockAge(2000, 1000), 'just now');
  });
});

describe('formatBytes', () => {
  it('scales through B, KB and MB', () => {
    assert.equal(formatBytes(512), '512 B');
    assert.equal(formatBytes(2048), '2 KB');
    assert.equal(formatBytes(1572864), '1.50 MB');
  });
});

describe('formatFeeRange', () => {
  it('returns null without data', () => {
    assert.equal(formatFeeRange(undefined), null);
    assert.equal(formatFeeRange([]), null);
  });
  it('shows a low-high range from the percentiles', () => {
    assert.equal(formatFeeRange([2, 5, 12, 40]), '2 - 40 sat/vB');
  });
  it('collapses to a single value when low equals high', () => {
    assert.equal(formatFeeRange([7, 7]), '7 sat/vB');
    assert.equal(formatFeeRange([0.101, 0.104], 'en'), '0.1 sat/vB');
  });
  it('keeps the decimals of a range under 1 sat/vB', () => {
    assert.equal(formatFeeRange([0.1, 0.19, 3.04, 50.2], 'en'), '0.1 - 50 sat/vB');
    assert.equal(formatFeeRange([0.12, 0.5], 'fr'), '0,12 - 0,5 sat/vB');
  });
});

describe('formatFeeRate', () => {
  it('never rounds a rate under 1 sat/vB down to 0', () => {
    assert.equal(formatFeeRate(0.12, 'en'), '0.12 sat/vB');
    assert.equal(formatFeeRate(0.5, 'fr'), '0,5 sat/vB');
    assert.equal(BITCOIN_SCALE.rate(0.12).replace(',', '.'), '0.12 sat/vB');
  });
  it('gives one decimal under 10 and none from 10', () => {
    assert.equal(formatFeeRate(4.64, 'en'), '4.6 sat/vB');
    assert.equal(formatFeeRate(3, 'en'), '3 sat/vB');
    assert.equal(formatFeeRate(12.4, 'en'), '12 sat/vB');
    assert.equal(formatFeeRate(0, 'en'), '0 sat/vB');
  });
});
