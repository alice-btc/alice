import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  deviceMemoryShortfall,
  localModelMemoryNeed,
  mobileFileSizeRefusal,
  mobileModelRefusal,
} from './local-model-memory.ts';

describe('localModelMemoryNeed', () => {
  it('matches the figures the mobile shells apply before a load', () => {
    // apps/app-desktop/src-tauri/src/local_ai_text.rs checks the same sum.
    assert.equal(localModelMemoryNeed(2_740_937_888), 2_740_937_888 + 342_617_236 + 640 * 1024 * 1024);
  });
});

describe('mobileModelRefusal', () => {
  it('offers the catalog up to 4B parameters and keeps the 9B on the desktop', () => {
    assert.equal(mobileModelRefusal({ name: 'Qwen3.5 0.8B', sizeBytes: 532_517_120, parameters: 0.8 }), null);
    assert.equal(mobileModelRefusal({ name: 'Qwen3.5 2B', sizeBytes: 1_280_835_840, parameters: 2 }), null);
    assert.equal(mobileModelRefusal({ name: 'Qwen3.5 4B', sizeBytes: 2_740_937_888, parameters: 4 }), null);
    assert.match(mobileModelRefusal({ name: 'Qwen3.5 9B', sizeBytes: 5_680_522_464, parameters: 9 }) ?? '', /9B parameters/);
  });

  it('judges a file of unknown parameter count by its size', () => {
    assert.equal(mobileModelRefusal({ name: 'custom', sizeBytes: 2_900_000_000 }), null);
    assert.match(mobileModelRefusal({ name: 'custom', sizeBytes: 3_100_000_000 }) ?? '', /3\.0 GB/);
    assert.equal(mobileFileSizeRefusal(3_000_000_000), null);
  });
});

describe('deviceMemoryShortfall', () => {
  it('says nothing when the device did not report its memory', () => {
    assert.equal(deviceMemoryShortfall(2_740_937_888, null), null);
    assert.equal(deviceMemoryShortfall(2_740_937_888, { totalBytes: 0, availableBytes: 0 }), null);
  });

  it('warns when the model may not fit what the app may allocate', () => {
    const fits = { totalBytes: 8_000_000_000, availableBytes: 4_000_000_000 };
    assert.equal(deviceMemoryShortfall(2_740_937_888, fits), null);
    const tight = { totalBytes: 6_000_000_000, availableBytes: 2_500_000_000 };
    assert.match(deviceMemoryShortfall(2_740_937_888, tight) ?? '', /needs about 3\.8 GB of memory \(RAM, not storage\) .* use 2\.5 GB right now/);
  });
});
