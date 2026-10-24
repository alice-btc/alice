import test from 'node:test';
import assert from 'node:assert/strict';
import { relativeTime } from './relative-time.ts';

const NOW = Date.UTC(2026, 9, 24, 12, 0, 0);
const ago = (ms: number) => new Date(NOW - ms);

test('the main chat keeps its English labels', () => {
  assert.equal(relativeTime(ago(5_000), 'en', NOW), 'Just now');
  assert.equal(relativeTime(ago(45_000), 'en', NOW), '45s ago');
  assert.equal(relativeTime(ago(5 * 60_000), 'en', NOW), '5m ago');
  assert.equal(relativeTime(ago(3 * 3_600_000), 'en', NOW), '3h ago');
  assert.equal(relativeTime(ago(30 * 3_600_000), 'en', NOW), 'Yesterday');
  assert.equal(relativeTime(ago(3 * 86_400_000), 'en', NOW), '3d ago');
  assert.equal(relativeTime(ago(5_000), undefined, NOW), 'Just now');
});

test('a French side chat says when in French', () => {
  assert.equal(relativeTime(ago(5_000), 'fr', NOW), 'À l’instant');
  assert.equal(relativeTime(ago(45_000), 'fr', NOW), 'il y a 45 s');
  assert.equal(relativeTime(ago(5 * 60_000), 'fr', NOW), 'il y a 5 min');
  assert.equal(relativeTime(ago(3 * 3_600_000), 'fr', NOW), 'il y a 3 h');
  assert.equal(relativeTime(ago(30 * 3_600_000), 'fr', NOW), 'Hier');
  assert.equal(relativeTime(ago(3 * 86_400_000), 'fr', NOW), 'il y a 3 j');
  assert.doesNotMatch(relativeTime(ago(20 * 86_400_000), 'fr', NOW), /[A-Z][a-z]{2} \d/);
});
