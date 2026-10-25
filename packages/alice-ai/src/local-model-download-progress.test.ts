import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DESKTOP_DOWNLOAD_LOST_MESSAGE,
  DESKTOP_DOWNLOAD_POLL_MS,
  downloadFraction,
  interpretDesktopDownloadStatus,
} from './local-model-download-progress.ts';

const SIZE = 2_740_937_888;

test('the fraction follows the bytes received and never exceeds 1', () => {
  assert.equal(downloadFraction(0, SIZE), 0);
  assert.equal(downloadFraction(437_009_580, SIZE), 437_009_580 / SIZE);
  assert.equal(downloadFraction(SIZE, SIZE), 1);
  assert.equal(downloadFraction(SIZE + 1, SIZE), 1);
  assert.equal(downloadFraction(10, 0), 0);
  assert.equal(downloadFraction(Number.NaN, SIZE), 0);
});

test('a downloading status shows progress against the shell-reported total', () => {
  assert.deepEqual(
    interpretDesktopDownloadStatus({ state: 'downloading', received: SIZE / 2, total: SIZE }),
    { kind: 'progress', phase: 'downloading', fraction: 0.5 },
  );
  assert.deepEqual(
    interpretDesktopDownloadStatus({ state: 'downloading', received: 0, total: SIZE }),
    { kind: 'progress', phase: 'downloading', fraction: 0 },
  );
});

test('a complete file being hashed is shown as verifying, with its own progress', () => {
  assert.deepEqual(
    interpretDesktopDownloadStatus({ state: 'verifying', done: 0, total: SIZE }),
    { kind: 'progress', phase: 'verifying', fraction: 0 },
  );
  assert.deepEqual(
    interpretDesktopDownloadStatus({ state: 'verifying', done: SIZE / 4, total: SIZE }),
    { kind: 'progress', phase: 'verifying', fraction: 0.25 },
  );
});

test('a finished download is installed and a failed one carries its reason', () => {
  assert.deepEqual(interpretDesktopDownloadStatus({ state: 'installed' }), { kind: 'installed' });
  assert.deepEqual(
    interpretDesktopDownloadStatus({ state: 'failed', error: 'Download incomplete (3 of 4 bytes).' }),
    { kind: 'failed', error: 'Download incomplete (3 of 4 bytes).' },
  );
  assert.deepEqual(interpretDesktopDownloadStatus({ state: 'failed', error: '' }), { kind: 'failed', error: 'Download failed.' });
});

test('a status the shell no longer knows ends the attempt instead of freezing the bar', () => {
  for (const status of [null, undefined, 'downloading', {}, { state: 'paused' }]) {
    assert.deepEqual(interpretDesktopDownloadStatus(status), { kind: 'failed', error: DESKTOP_DOWNLOAD_LOST_MESSAGE }, String(status));
  }
});

test('the page asks for progress a few times a second, never per network piece', () => {
  // Hundreds of network pieces a second must not become hundreds of re-renders.
  assert.ok(DESKTOP_DOWNLOAD_POLL_MS >= 200 && DESKTOP_DOWNLOAD_POLL_MS <= 1000);
});
