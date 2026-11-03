import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AIBackendError } from './backend-error.ts';
import { PRIVATE_CLOUD_DISABLED_MESSAGE } from './private-cloud-config.ts';
import { classifySendError, describeSendError, SEND_ERROR_TEXT, sendErrorDetail } from './send-error.ts';
import { VeniceAPIError } from './venice-errors.ts';

describe('classifySendError', () => {
  it('free quota: the Worker refuses with 402 free_quota_exhausted', () => {
    const err = new VeniceAPIError('free_quota_exhausted', 'Your 21 free Private Cloud requests have been used.', 402);
    assert.equal(classifySendError(err, 'cloud'), 'freeQuota');
  });

  it('plan quota: a paid allowance is spent for the month', () => {
    const err = new VeniceAPIError('plan_quota_exhausted', 'used up', 402);
    assert.equal(classifySendError(err, 'cloud'), 'planQuota');
  });

  it('plan restricted: the model is not in the plan', () => {
    assert.equal(classifySendError(new VeniceAPIError('plan_restricted', 'not in plan', 403), 'cloud'), 'planRestricted');
  });

  it('too many installations from one network today', () => {
    assert.equal(classifySendError(new VeniceAPIError('too_many_new_installations', 'five', 429), 'cloud'), 'tooManyInstallations');
  });

  it('session lost: the account could not be restored', () => {
    assert.equal(classifySendError(new VeniceAPIError('account_required', 'sign in', 401), 'cloud'), 'sessionLost');
  });

  it('cloud not configured: no proxy in this build, or Private Cloud switched off', () => {
    assert.equal(classifySendError(new VeniceAPIError('missing_api_key', 'no proxy'), 'cloud'), 'cloudNotConfigured');
    assert.equal(classifySendError(new Error(PRIVATE_CLOUD_DISABLED_MESSAGE), 'cloud'), 'cloudNotConfigured');
  });

  it('unavailable: Venice trouble, rate limits and operator-side problems alike', () => {
    for (const code of ['provider_unavailable', 'rate_limit', 'model_unavailable', 'attestation_unavailable', 'auth', 'insufficient_credits'] as const) {
      assert.equal(classifySendError(new VeniceAPIError(code, 'trouble', 503), 'cloud'), 'unavailable', code);
    }
    // An encrypted request the proxy rejected with a server error.
    assert.equal(classifySendError(new VeniceAPIError('api_error', 'Encrypted request rejected (HTTP 503).', 503), 'cloud'), 'unavailable');
  });

  it('verification blocked and failed stay apart: one is the network, the other is a refusal', () => {
    assert.equal(classifySendError(new VeniceAPIError('attestation_blocked', 'blocked'), 'cloud'), 'verificationBlocked');
    assert.equal(classifySendError(new VeniceAPIError('attestation_invalid', 'bad quote', 200), 'cloud'), 'verificationFailed');
  });

  it('too long: refused on the device before anything was sent', () => {
    assert.equal(classifySendError(new VeniceAPIError('request_too_large', 'too big'), 'cloud'), 'tooLong');
  });

  it('offline: a network code, a fetch that never completed, an encrypted request that failed to leave', () => {
    assert.equal(classifySendError(new VeniceAPIError('network', 'offline'), 'cloud'), 'offline');
    assert.equal(classifySendError(new TypeError('Failed to fetch'), 'cloud'), 'offline');
    assert.equal(classifySendError(new VeniceAPIError('api_error', 'Encrypted request failed: Failed to fetch'), 'cloud'), 'offline');
  });

  it('unreadable: the answer came without a stream, or in a shape the client refused', () => {
    assert.equal(classifySendError(new VeniceAPIError('api_error', 'Encrypted response carried no stream.'), 'cloud'), 'unreadable');
    assert.equal(classifySendError(new VeniceAPIError('api_error', 'Response chunk content was not an encrypted string.'), 'cloud'), 'unreadable');
    assert.equal(classifySendError(new VeniceAPIError('api_error', 'E2EE decrypt failed: bad tag'), 'cloud'), 'unreadable');
  });

  it('local not ready: the backend code, the browser build, and the mobile engine sentences', () => {
    assert.equal(classifySendError(new AIBackendError('local_not_ready', 'Local AI is not ready.'), 'local'), 'localNotReady');
    assert.equal(classifySendError(new AIBackendError('local_unavailable', 'Local AI is not available on the web.'), 'local'), 'localNotReady');
    assert.equal(classifySendError(new Error('model not loaded'), 'local'), 'localNotReady');
    assert.equal(classifySendError(new Error('No local model installed'), 'local'), 'localNotReady');
  });

  it('local context full keeps its own remedy', () => {
    assert.equal(classifySendError(new Error('the context is full'), 'local'), 'localContextFull');
    assert.equal(classifySendError(new Error('Prompt is too long for this model'), 'local'), 'localContextFull');
  });

  it('local failed: any other local error, including an HTTP error from llama-server', () => {
    assert.equal(classifySendError(new AIBackendError('local_server_error', 'llama-server error 500', 500), 'local'), 'localFailed');
    assert.equal(classifySendError(new Error('something else'), 'local'), 'localFailed');
  });

  it('custom not configured', () => {
    assert.equal(classifySendError(new AIBackendError('custom_not_configured', 'No custom server configured.'), 'custom'), 'customNotConfigured');
  });

  it('custom unreachable: the fetch never completed', () => {
    assert.equal(classifySendError(new TypeError('Failed to fetch'), 'custom'), 'customUnreachable');
  });

  it('custom server error: the server answered, badly', () => {
    assert.equal(classifySendError(new AIBackendError('custom_server_error', 'Server error 500', 500), 'custom'), 'customServerError');
  });

  it('unknown: a cloud error with a 4xx status, or anything without a shape', () => {
    assert.equal(classifySendError(new VeniceAPIError('api_error', 'Encrypted request rejected (HTTP 400).', 400), 'cloud'), 'unknown');
    assert.equal(classifySendError(new Error('?'), 'cloud'), 'unknown');
    assert.equal(classifySendError('not even an error', 'custom'), 'unknown');
  });

  it('every case has a sentence', () => {
    for (const text of Object.values(SEND_ERROR_TEXT)) assert.ok(text.trim().length > 0);
  });
});

describe('sendErrorDetail', () => {
  it('names the class, the code, the status and the original message', () => {
    const err = new VeniceAPIError('free_quota_exhausted', 'Your 21 free Private Cloud requests have been used.', 402);
    assert.equal(
      sendErrorDetail(err),
      'VeniceAPIError free_quota_exhausted HTTP 402: Your 21 free Private Cloud requests have been used.',
    );
    assert.equal(sendErrorDetail(new AIBackendError('local_not_ready', 'Local AI is not ready.')), 'AIBackendError local_not_ready: Local AI is not ready.');
    assert.equal(sendErrorDetail(new TypeError('Failed to fetch')), 'TypeError: Failed to fetch');
  });

  it('keeps the closed-vocabulary detail of a verification failure', () => {
    const err = new VeniceAPIError('attestation_unavailable', 'trouble', 503, 'stage=attestation host=proxy.alicebtc.com status=503');
    assert.equal(sendErrorDetail(err), 'VeniceAPIError attestation_unavailable HTTP 503: trouble (stage=attestation host=proxy.alicebtc.com status=503)');
  });

  it('cuts a long message short and flattens its whitespace', () => {
    const detail = sendErrorDetail(new Error(`a\n${'b'.repeat(400)}`));
    assert.ok(detail.length < 200);
    assert.ok(detail.endsWith('…'));
    assert.doesNotMatch(detail, /\n/);
  });

  it('survives a thrown non-error', () => {
    assert.equal(sendErrorDetail('plain text'), 'plain text');
    assert.equal(sendErrorDetail(undefined), 'unknown');
  });
});

describe('describeSendError', () => {
  it('returns the case and its line together', () => {
    const described = describeSendError(new AIBackendError('custom_not_configured', 'No custom server configured.'), 'custom');
    assert.deepEqual(described, {
      kind: 'customNotConfigured',
      detail: 'AIBackendError custom_not_configured: No custom server configured.',
    });
  });
});
