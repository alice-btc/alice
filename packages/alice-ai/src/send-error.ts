// What to tell the user when sending a message failed.
//
// The backends throw in English, in technical words, and each in its own
// style: a Worker body with a code, a Venice error with a status, a bare
// `Error` from a local server, a `TypeError` from a fetch that never left
// the device. The chat used to show that text as it was. This module reads
// the error once and names its case, so the interface can say in its own
// language what happened and what to do, and keep the technical line for
// the message menu.
//
// Pure on purpose: no network, no React, no Expo imports, so every case can
// be tested with a constructed error.

import type { AIBackendType } from './ai-backend';
import { AIBackendError } from './backend-error.ts';
import { PRIVATE_CLOUD_DISABLED_MESSAGE } from './private-cloud-config.ts';
import { VeniceAPIError } from './venice-errors.ts';

export type SendErrorKind =
  /** The 21 free Private Cloud requests are spent. */
  | 'freeQuota'
  /** A paid plan's monthly allowance is spent; it comes back on its own. */
  | 'planQuota'
  /** The chosen cloud model is not part of the current plan. */
  | 'planRestricted'
  /** Five free installations already started from this network today. */
  | 'tooManyInstallations'
  /** The account session could not be restored for this request. */
  | 'sessionLost'
  /** This build cannot talk to Private Cloud at all. */
  | 'cloudNotConfigured'
  /** Private Cloud, or Venice behind it, is having trouble right now. */
  | 'unavailable'
  /** The security check never completed: offline, VPN, firewall, blocker. */
  | 'verificationBlocked'
  /** The security check completed and failed; nothing was sent. */
  | 'verificationFailed'
  /** The message, with Alice's instructions, exceeds the request size. */
  | 'tooLong'
  /** The request never left the device. */
  | 'offline'
  /** Alice Local has no model loaded or is not installed. */
  | 'localNotReady'
  /** The local model's context window is full. */
  | 'localContextFull'
  /** Alice Local failed for another reason; nothing went to the cloud. */
  | 'localFailed'
  /** Custom mode without a server address. */
  | 'customNotConfigured'
  /** The custom server could not be reached. */
  | 'customUnreachable'
  /** The custom server answered with an error. */
  | 'customServerError'
  /** An answer arrived that could not be read or decrypted. */
  | 'unreadable'
  | 'unknown';

export type SendError = {
  kind: SendErrorKind;
  /** The technical line of the message menu: class, code, status, message. */
  detail: string;
};

/**
 * The English sentence of each case, used as the message's stored text.
 *
 * The web interface renders the case in the app language from its own
 * dictionaries (`chat.sendError.*`); this text is what the message keeps for
 * copy, for the conversation history and for any surface without those
 * dictionaries. Each sentence says what happened and what to do.
 */
export const SEND_ERROR_TEXT: Record<SendErrorKind, string> = {
  freeQuota: 'You have used your 21 free Private Cloud requests. Alice Local is still available.',
  planQuota: 'This month\'s Private Cloud allowance is used up. It renews on its own,'
    + ' and Alice Local is still available in the meantime.',
  planRestricted: 'This Private Cloud model is not included in your current plan.'
    + ' Choose another model, or another plan.',
  tooManyInstallations: 'Five new Alice installations have already started from your network today.'
    + ' Sign in if you already have an Alice account, or try again tomorrow. Alice Local is still available.',
  sessionLost: 'Private Cloud could not restore your session. Try again.',
  cloudNotConfigured: 'Private Cloud is not available in this build of Alice. Alice Local is still available.',
  unavailable: 'Private Cloud is unavailable right now. Try again in a few minutes. Alice Local still works offline.',
  verificationBlocked: 'Alice could not reach the Private Cloud security check from this device,'
    + ' so nothing was sent. Check your connection, or any VPN, firewall or'
    + ' blocker in the way. Alice Local still works offline.',
  verificationFailed: 'Private Cloud security verification failed. For your privacy, Alice did not send your message.',
  tooLong: 'This message is too long for Private Cloud, with the instructions Alice adds to it.'
    + ' Nothing was sent and nothing was cut. Shorten your message or the pasted text, then try again.',
  offline: 'No connection. Check your network, then try again.',
  localNotReady: 'Alice Local is not ready. Download or select a model in Settings, or use Private Cloud.'
    + ' Nothing was sent to the cloud.',
  localContextFull: 'Alice Local ran out of context. Start a new conversation or shorten your message.'
    + ' Nothing was sent to the cloud.',
  localFailed: 'Alice Local could not generate a response. Nothing was sent to the cloud.',
  customNotConfigured: 'No custom server is configured. Add one in Settings, under Custom server.',
  customUnreachable: 'Alice could not reach your custom server. Check that it is running and that its address is correct.',
  customServerError: 'Your custom server answered with an error. Check its logs and the model name in Settings.',
  unreadable: 'Private Cloud sent an answer Alice could not read, so nothing was shown. Try again.',
  unknown: 'Alice could not send this message. Try again.',
};

const DETAIL_MESSAGE_LIMIT = 160;

function veniceKind(err: VeniceAPIError): SendErrorKind {
  switch (err.code) {
    case 'free_quota_exhausted': return 'freeQuota';
    case 'plan_quota_exhausted': return 'planQuota';
    case 'plan_restricted': return 'planRestricted';
    case 'too_many_new_installations': return 'tooManyInstallations';
    case 'account_required': return 'sessionLost';
    case 'missing_api_key': return 'cloudNotConfigured';
    case 'attestation_blocked': return 'verificationBlocked';
    case 'attestation_invalid': return 'verificationFailed';
    case 'request_too_large': return 'tooLong';
    case 'network': return 'offline';
    // A rejected key or an empty Venice balance is Alice's problem to fix,
    // not the user's: to them the service is down, and the line in the menu
    // says why.
    case 'auth':
    case 'insufficient_credits':
    case 'model_unavailable':
    case 'rate_limit':
    case 'provider_unavailable':
    case 'attestation_unavailable':
      return 'unavailable';
    case 'api_error':
      return apiErrorKind(err);
  }
}

/**
 * `api_error` is what llm.ts makes of an encrypted exchange that failed
 * without a code of its own. The status tells the server cases apart; the
 * ones without a status happened on the device: the request never left
 * (the client says "Encrypted request failed"), or the answer came back in
 * a shape the client refused to read or to decrypt.
 */
function apiErrorKind(err: VeniceAPIError): SendErrorKind {
  if (err.status !== undefined) return err.status >= 500 ? 'unavailable' : 'unknown';
  if (/^Encrypted request failed/.test(err.message)) return 'offline';
  return 'unreadable';
}

function backendKind(err: AIBackendError): SendErrorKind {
  switch (err.code) {
    case 'local_not_ready':
    case 'local_unavailable':
      return 'localNotReady';
    case 'local_server_error': return 'localFailed';
    case 'custom_not_configured': return 'customNotConfigured';
    case 'custom_server_error': return 'customServerError';
  }
}

/** The mobile engine reports through Tauri with a sentence, not a code. */
function localMessageKind(message: string): SendErrorKind {
  const text = message.toLowerCase();
  if (text.includes('context is full') || text.includes('prompt is too long')) return 'localContextFull';
  if (text.includes('model not loaded') || text.includes('no local model installed')) return 'localNotReady';
  return 'localFailed';
}

/** Which case a failed send is, from the error alone and the backend it came from. */
export function classifySendError(err: unknown, backend: AIBackendType): SendErrorKind {
  if (err instanceof VeniceAPIError) return veniceKind(err);
  if (err instanceof AIBackendError) return backendKind(err);
  // `fetch` rejects with a TypeError when the request did not complete:
  // offline, blocked, or refused by CORS. The custom server is the user's
  // own machine, so there the address is the first thing to check.
  if (err instanceof TypeError) return backend === 'custom' ? 'customUnreachable' : 'offline';
  const message = err instanceof Error ? err.message : '';
  if (backend === 'local') return localMessageKind(message);
  if (backend === 'cloud' && message === PRIVATE_CLOUD_DISABLED_MESSAGE) return 'cloudNotConfigured';
  return 'unknown';
}

/**
 * The technical line the message menu shows: the error's class, its code and
 * HTTP status when it has them, then its original message, cut short. A
 * Venice error that carries a closed-vocabulary detail (stage, host, status)
 * keeps it at the end.
 */
export function sendErrorDetail(err: unknown): string {
  if (!(err instanceof Error)) return typeof err === 'string' ? err : 'unknown';
  const parts = [err.name || 'Error'];
  const code = (err as { code?: unknown }).code;
  if (typeof code === 'string' && code) parts.push(code);
  const status = (err as { status?: unknown }).status;
  if (typeof status === 'number') parts.push(`HTTP ${status}`);
  const message = err.message.trim().replace(/\s+/g, ' ');
  let line = parts.join(' ');
  if (message) {
    line += `: ${message.length > DETAIL_MESSAGE_LIMIT ? `${message.slice(0, DETAIL_MESSAGE_LIMIT - 1)}…` : message}`;
  }
  if (err instanceof VeniceAPIError && err.detail) line += ` (${err.detail})`;
  return line;
}

export function describeSendError(err: unknown, backend: AIBackendType): SendError {
  return { kind: classifySendError(err, backend), detail: sendErrorDetail(err) };
}
