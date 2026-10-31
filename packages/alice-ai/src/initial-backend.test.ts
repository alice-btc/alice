import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseInitialBackend } from './initial-backend.ts';

const all = { local: true, cloud: true, custom: true };

test('a first launch opens on Private Cloud, on the desktop too, even with a local model available', () => {
  assert.equal(chooseInitialBackend({ stored: null, localAvailable: true, enabled: all, privateCloudEnabled: true }), 'cloud');
  assert.equal(chooseInitialBackend({ stored: null, localAvailable: false, enabled: all, privateCloudEnabled: true }), 'cloud');
});

test('a stored choice wins while its backend is enabled', () => {
  assert.equal(chooseInitialBackend({ stored: 'local', localAvailable: true, enabled: all, privateCloudEnabled: true }), 'local');
  assert.equal(chooseInitialBackend({ stored: 'custom', localAvailable: true, enabled: all, privateCloudEnabled: true }), 'custom');
  assert.equal(chooseInitialBackend({ stored: 'cloud', localAvailable: true, enabled: all, privateCloudEnabled: true }), 'cloud');
});

test('a stored choice that can no longer run falls back to Private Cloud', () => {
  assert.equal(chooseInitialBackend({ stored: 'local', localAvailable: false, enabled: all, privateCloudEnabled: true }), 'cloud');
  assert.equal(chooseInitialBackend({ stored: 'local', localAvailable: true, enabled: { ...all, local: false }, privateCloudEnabled: true }), 'cloud');
});

test('without Private Cloud, the local model, then a custom server', () => {
  assert.equal(chooseInitialBackend({ stored: null, localAvailable: true, enabled: all, privateCloudEnabled: false }), 'local');
  assert.equal(chooseInitialBackend({ stored: null, localAvailable: false, enabled: all, privateCloudEnabled: false }), 'custom');
});

test('every backend disabled selects none', () => {
  assert.equal(chooseInitialBackend({ stored: null, localAvailable: true, enabled: { local: false, cloud: false, custom: false }, privateCloudEnabled: true }), null);
});
