import assert from 'node:assert/strict';
import test from 'node:test';

import { notifyLocalModelInstalled, subscribeLocalModelInstalled } from './local-model-events.ts';

test('an installed model reaches every subscriber, and none after unsubscribing', () => {
  const seen: string[] = [];
  const unsubscribeA = subscribeLocalModelInstalled(id => seen.push(`a:${id}`));
  const unsubscribeB = subscribeLocalModelInstalled(id => seen.push(`b:${id}`));
  notifyLocalModelInstalled('qwen3.5-4b');
  unsubscribeA();
  notifyLocalModelInstalled('qwen3.5-2b');
  unsubscribeB();
  notifyLocalModelInstalled('qwen3.5-9b');
  assert.deepEqual(seen, ['a:qwen3.5-4b', 'b:qwen3.5-4b', 'b:qwen3.5-2b']);
});

test('a subscriber that unsubscribes while being notified does not break the others', () => {
  const seen: string[] = [];
  const unsubscribe = subscribeLocalModelInstalled(() => { seen.push('first'); unsubscribe(); });
  const cleanup = subscribeLocalModelInstalled(() => seen.push('second'));
  notifyLocalModelInstalled('qwen3.5-4b');
  cleanup();
  assert.deepEqual(seen, ['first', 'second']);
});
