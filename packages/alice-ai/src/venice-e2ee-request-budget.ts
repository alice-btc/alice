// Byte budget for an E2EE chat request, computed before anything is encrypted
// or sent. Pure functions only: no crypto, no fetch, no React.
//
// The upstream character window (generation-context.ts) counts UTF-16 units,
// but the wire carries the JSON body whose message contents are hex envelopes:
// 2 hex chars per UTF-8 byte plus a fixed envelope. The exact size is therefore
// known from the plaintext alone, so the history is fitted first and only the
// surviving messages are ever encrypted.

import { MIN_ENVELOPE_BYTES, VeniceE2EEError } from './venice-e2ee-crypto.ts';
import type { Message } from './llm';

/**
 * Serialized-body ceiling. 256 KiB is the free-plan limit of the proxy; paid
 * plans allow 512 KiB, but the smaller figure is the safe common denominator.
 */
export const E2EE_MAX_REQUEST_BYTES = 256 * 1024;
/** Slack kept under the ceiling for anything the transport adds around the body. */
export const E2EE_REQUEST_MARGIN_BYTES = 4 * 1024;
export const E2EE_REQUEST_BUDGET_BYTES = E2EE_MAX_REQUEST_BYTES - E2EE_REQUEST_MARGIN_BYTES;

/**
 * Hex characters every envelope adds to its ciphertext: public key, nonce and
 * GCM tag (MIN_ENVELOPE_BYTES, i.e. an empty plaintext), two characters a byte.
 */
export const E2EE_ENVELOPE_HEX_CHARS = MIN_ENVELOPE_BYTES * 2;

export type E2EEPayloadParams = {
  model: string;
  temperature: number;
  maxTokens: number;
};

const utf8 = new TextEncoder();

/**
 * Venice rejects E2EE requests with more than one `system` message, so every
 * system fragment is combined, in order, into one leading message. The
 * encryption step and the budget both go through here, so they cannot disagree.
 */
export function normalizeE2EEMessages(messages: Message[]): Message[] {
  const systemContent = messages
    .filter(message => message.role === 'system')
    .map(message => message.content)
    .filter(Boolean)
    .join('\n\n');
  return [
    ...(systemContent ? [{ role: 'system' as const, content: systemContent }] : []),
    ...messages.filter(message => message.role !== 'system'),
  ];
}

/** The request body, with the messages as given. The only place its shape is defined. */
export function buildE2EEPayload<T extends { role: Message['role']; content: string }>(
  params: E2EEPayloadParams,
  messages: T[],
) {
  return {
    model: params.model,
    messages,
    temperature: params.temperature,
    max_tokens: params.maxTokens,
    // Never configurable: E2EE is streaming-only.
    stream: true,
    stream_options: { include_usage: true },
  };
}

/** Hex characters of the envelope that will carry this plaintext. */
export function envelopeHexLength(content: string): number {
  return 2 * utf8.encode(content).length + E2EE_ENVELOPE_HEX_CHARS;
}

/**
 * Exact UTF-8 size of the serialized request body once these (already
 * normalized) messages are encrypted. Hex needs no JSON escaping, so the body
 * is the JSON skeleton with empty contents plus the summed envelope lengths.
 */
export function encryptedPayloadBytes(params: E2EEPayloadParams, messages: Message[]): number {
  const skeleton = buildE2EEPayload(params, messages.map(m => ({ role: m.role, content: '' })));
  let bytes = utf8.encode(JSON.stringify(skeleton)).length;
  for (const message of messages) bytes += envelopeHexLength(message.content);
  return bytes;
}

function tooLarge(): VeniceE2EEError {
  return new VeniceE2EEError(
    'The system instructions and your latest message are too large for one Private Cloud request.',
    { code: 'request_too_large' },
  );
}

/**
 * Bring a conversation under the request budget, measured before encryption.
 *
 * Messages are normalized first (one leading system message). The system
 * content and the latest message are indispensable and never altered; the
 * oldest conversation messages are dropped from the front until the exact
 * encrypted size fits, and any assistant reply left at the front by a drop is
 * dropped with it, so the history never opens on an orphan. A user message
 * that never got an answer is simply dropped on its own. Only when the system
 * content plus the latest message cannot fit does this throw, so nothing is
 * encrypted or sent, and there is no plaintext fallback. A conversation that
 * already fits is returned unchanged.
 */
export function fitE2EEMessages(
  messages: Message[],
  params: E2EEPayloadParams,
  maxBytes = E2EE_REQUEST_BUDGET_BYTES,
): Message[] {
  const normalized = normalizeE2EEMessages(messages);
  let start = normalized[0]?.role === 'system' ? 1 : 0;
  const head = normalized.slice(0, start);
  const sizeFrom = (from: number) =>
    encryptedPayloadBytes(params, [...head, ...normalized.slice(from)]);

  const initial = start;
  while (sizeFrom(start) > maxBytes) {
    if (start >= normalized.length - 1) throw tooLarge();
    start += 1;
    while (start < normalized.length - 1 && normalized[start].role === 'assistant') start += 1;
  }
  return start === initial ? normalized : [...head, ...normalized.slice(start)];
}
