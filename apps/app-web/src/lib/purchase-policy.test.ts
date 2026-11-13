import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { purchasePresentation } from './purchase-policy.ts';

test('web retains checkout; direct distribution links to web', () => {
  assert.equal(purchasePresentation('web'), 'checkout');
  assert.equal(purchasePresentation('desktop'), 'link');
  assert.equal(purchasePresentation('android-direct'), 'link');
});
test('Google Play is text-only in every region without external offers enrollment', () => {
  for (const country of ['USA', 'FRA', 'LTU', undefined]) assert.equal(purchasePresentation('google-play', country), 'text');
});
test('iOS links require a verified US storefront; unknown fails closed', () => {
  assert.equal(purchasePresentation('ios', 'USA'), 'link');
  for (const country of ['US', 'en-US', 'FRA', 'LTU', '', null, undefined]) assert.equal(purchasePresentation('ios', country), 'hidden');
  assert.equal(purchasePresentation('unknown', 'USA'), 'hidden');
});
