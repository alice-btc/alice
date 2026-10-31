import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describeWait, SparkscanBudget } from './sparkscan-budget.ts';

const headers = (h: Record<string, string>) => ({ get: (name: string) => h[name.toLowerCase()] ?? null });
const NOW = 1_792_675_000;

describe('SparkscanBudget', () => {
  it('lets requests go while Sparkscan says some are left', () => {
    const b = new SparkscanBudget();
    assert.equal(b.wait(NOW), 0);
    b.note(200, headers({ 'x-ratelimit-remaining': '12', 'x-ratelimit-reset': String(NOW + 90) }), NOW);
    assert.equal(b.wait(NOW), 0);
  });

  it('waits for the reset once none are left, then lets requests go again', () => {
    const b = new SparkscanBudget();
    b.note(200, headers({ 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(NOW + 90) }), NOW);
    assert.equal(b.wait(NOW + 10), 80);
    assert.equal(b.wait(NOW + 90), 0);
  });

  it('obeys Retry-After on a refusal, in seconds or as a date, before the reset time', () => {
    const b = new SparkscanBudget();
    b.note(429, headers({ 'retry-after': '30', 'x-ratelimit-reset': String(NOW + 200) }), NOW);
    assert.equal(b.wait(NOW), 30);
    const c = new SparkscanBudget();
    c.note(429, headers({ 'retry-after': new Date((NOW + 45) * 1000).toUTCString() }), NOW);
    assert.equal(c.wait(NOW), 45);
  });

  it('waits a minute when a refusal says nothing, and no longer', () => {
    const b = new SparkscanBudget();
    b.note(429, headers({}), NOW);
    assert.equal(b.wait(NOW), 60);
    assert.equal(b.wait(NOW + 60), 0);
  });

  it('ignores headers it cannot read', () => {
    const b = new SparkscanBudget();
    b.note(200, headers({ 'x-ratelimit-remaining': 'soon' }), NOW);
    assert.equal(b.wait(NOW), 0);
  });

  it('words the wait', () => {
    assert.equal(describeWait(1), '1 second');
    assert.equal(describeWait(40), '40 seconds');
    assert.equal(describeWait(80), 'about 1 minute');
    assert.equal(describeWait(200), 'about 3 minutes');
  });
});
