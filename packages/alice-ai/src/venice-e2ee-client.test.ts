import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildEncryptedMessages,
  fetchAndVerifyAttestation,
  readEncryptedStream,
  streamE2EEChatCompletion,
} from './venice-e2ee-client.ts';
import {
  E2EE_ENVELOPE_HEX_CHARS,
  E2EE_MAX_REQUEST_BYTES,
  E2EE_REQUEST_BUDGET_BYTES,
  buildE2EEPayload,
  encryptedPayloadBytes,
  fitE2EEMessages,
  normalizeE2EEMessages,
} from './venice-e2ee-request-budget.ts';
import { deriveSigningAddress } from './venice-attestation-verify.ts';
import type { ChainPolicy } from './venice-attestation-chain.ts';
import {
  VeniceE2EEError,
  decryptEnvelope,
  encryptToEnvelope,
  generateEphemeralKeyPair,
  parseEnvelope,
} from './venice-e2ee-crypto.ts';
import type { Message } from './llm';

/** Turns SSE text into the ReadableStream shape the reader expects. */
function sseStream(frames: string[]) {
  const encoder = new TextEncoder();
  let i = 0;
  return {
    getReader() {
      return {
        async read() {
          if (i >= frames.length) return { done: true, value: undefined };
          return { done: false, value: encoder.encode(frames[i++]) };
        },
      };
    },
  };
}

function encryptedFrame(clientPubKey: Uint8Array, text: string, extra: Record<string, unknown> = {}) {
  const envelope = encryptToEnvelope(clientPubKey, text);
  return `data: ${JSON.stringify({ choices: [{ delta: { content: envelope }, ...extra }] })}\n`;
}

describe('buildEncryptedMessages', () => {
  const messages: Message[] = [
    { role: 'system', content: 'You are Alice.' },
    { role: 'user', content: 'What is a UTXO?' },
    { role: 'assistant', content: 'A previous answer.' },
    { role: 'user', content: 'Explain more.' },
  ];

  it('encrypts every message, whatever its role', () => {
    const model = generateEphemeralKeyPair();
    const built = buildEncryptedMessages(messages, model.publicKey);
    for (const m of built) {
      assert.notEqual(m.content, 'You are Alice.');
      assert.notEqual(m.content, 'What is a UTXO?');
      // Each survives a round trip back to its plaintext.
      assert.doesNotThrow(() => parseEnvelope(m.content));
    }
    assert.equal(decryptEnvelope(model.secretKey, built[0].content), 'You are Alice.');
    assert.equal(decryptEnvelope(model.secretKey, built[1].content), 'What is a UTXO?');
    assert.notDeepEqual(
      parseEnvelope(built[0].content).peerPublicKey,
      parseEnvelope(built[1].content).peerPublicKey,
      'each message carries its own ephemeral public key',
    );
  });

  it('merges every system fragment into one leading encrypted message', () => {
    const model = generateEphemeralKeyPair();
    const built = buildEncryptedMessages([
      { role: 'user', content: 'Earlier question' },
      { role: 'system', content: 'Base policy' },
      { role: 'system', content: 'Retrieved context' },
      { role: 'user', content: 'Current question' },
    ], model.publicKey);

    assert.deepEqual(built.map(message => message.role), ['system', 'user', 'user']);
    assert.equal(
      decryptEnvelope(model.secretKey, built[0].content),
      'Base policy\n\nRetrieved context',
    );
    assert.equal(decryptEnvelope(model.secretKey, built[1].content), 'Earlier question');
    assert.equal(decryptEnvelope(model.secretKey, built[2].content), 'Current question');
  });

  // Verified against the production proxy on 2026-10-29: the enclave decrypts
  // an encrypted assistant turn and rejects a plaintext one, so prior Alice
  // replies travel as ciphertext in their own role and the model keeps the
  // thread of the conversation.
  it('keeps assistant history in its own role, encrypted like every other turn', () => {
    const model = generateEphemeralKeyPair();
    const built = buildEncryptedMessages(messages, model.publicKey);
    assert.deepEqual(built.map(m => m.role), ['system', 'user', 'assistant', 'user']);
    const assistant = built[2];
    assert.notEqual(assistant.content, 'A previous answer.');
    assert.doesNotThrow(() => parseEnvelope(assistant.content));
    assert.equal(decryptEnvelope(model.secretKey, assistant.content), 'A previous answer.');
    const joined = built.map(m => m.content).join('');
    assert.ok(!joined.includes('A previous answer.'), 'no plaintext leaves the device');
  });
});

describe('E2EE request byte budget', () => {
  const params = { model: 'e2ee-test', temperature: 0.7, maxTokens: 1024 };
  const msg = (role: Message['role'], content: string): Message => ({ role, content });
  const size = (messages: Message[]) => encryptedPayloadBytes(params, normalizeE2EEMessages(messages));
  const contents = (messages: Message[]) => messages.map(m => m.content);

  it('derives the envelope overhead from the crypto constants', () => {
    // 65-byte key + 12-byte nonce + 16-byte tag, in hex.
    assert.equal(E2EE_ENVELOPE_HEX_CHARS, 186);
    assert.equal(E2EE_REQUEST_BUDGET_BYTES, E2EE_MAX_REQUEST_BYTES - 4096);
  });

  it('predicts the exact size of the really encrypted JSON body', () => {
    const model = generateEphemeralKeyPair();
    const samples: Message[][] = [
      [msg('user', '')],
      [msg('system', 'Be brief.'), msg('user', 'plain ASCII')],
      [
        msg('system', 'Base policy'),
        msg('user', 'quotes " and \\ and\nnewline\ttab \u0001 control'),
        msg('system', 'Retrieved <context> & more'),
        msg('assistant', 'emoji 🙂👩‍👩‍👧 and 漢字 and é'),
        msg('user', '   separators, lone \ud800 surrogate'),
      ],
    ];
    for (const sample of samples) {
      const real = JSON.stringify(buildE2EEPayload(params, buildEncryptedMessages(sample, model.publicKey)));
      assert.equal(size(sample), Buffer.byteLength(real), JSON.stringify(sample));
    }
  });

  it('merges every system fragment into one leading message, as encryption does', () => {
    const merged = normalizeE2EEMessages([
      msg('user', 'q1'), msg('system', 'A'), msg('system', ''), msg('system', 'B'), msg('user', 'q2'),
    ]);
    assert.deepEqual(merged, [msg('system', 'A\n\nB'), msg('user', 'q1'), msg('user', 'q2')]);
  });

  it('returns a history that already fits with its content unchanged', () => {
    const list = [
      msg('system', 'S1'), msg('user', 'a'), msg('assistant', 'b'), msg('system', 'S2'), msg('user', 'c'),
    ];
    assert.deepEqual(contents(fitE2EEMessages(list, params)), ['S1\n\nS2', 'a', 'b', 'c']);
    assert.deepEqual(fitE2EEMessages([], params), []);
  });

  it('drops the oldest turns first and keeps system and the latest message intact', () => {
    const list = [
      msg('system', 'S'),
      msg('user', 'u1'), msg('assistant', 'a1'),
      msg('user', 'u2'), msg('assistant', 'a2'),
      msg('user', 'u3'), msg('assistant', 'a3-partial'),
      msg('user', 'continue'),
    ];
    const keep = size([list[0], ...list.slice(5)]);
    assert.deepEqual(contents(fitE2EEMessages(list, params, keep)), ['S', 'u3', 'a3-partial', 'continue']);
    assert.deepEqual(contents(fitE2EEMessages(list, params, keep - 1)), ['S', 'continue']);
  });

  it('never leaves an assistant reply orphaned at the front', () => {
    const list = [
      msg('system', 'S'), msg('user', 'u1'), msg('assistant', 'a1'),
      msg('user', 'u2'), msg('assistant', 'a2'), msg('user', 'u3'),
    ];
    // Room for a2 + u3 but not u2 + a2 + u3: a2 goes with u2.
    const fitted = fitE2EEMessages(list, params, size([list[0], list[4], list[5]]));
    assert.deepEqual(contents(fitted), ['S', 'u3']);
  });

  it('copes with consecutive user messages from failed or unanswered turns', () => {
    const list = [
      msg('system', 'S'), msg('user', 'failed 1'), msg('user', 'failed 2'),
      msg('user', 'failed 3'), msg('assistant', 'late answer'), msg('user', 'latest'),
    ];
    const fitted = fitE2EEMessages(list, params, size([list[0], list[5]]));
    assert.deepEqual(contents(fitted), ['S', 'latest']);
    const partial = fitE2EEMessages(list, params, size([list[0], list[3], list[4], list[5]]));
    assert.deepEqual(contents(partial), ['S', 'failed 3', 'late answer', 'latest']);
  });

  it('refuses only when system plus latest message alone cannot fit', () => {
    const list = [msg('system', 'S'), msg('user', 'old'), msg('assistant', 'reply'), msg('user', 'x'.repeat(50))];
    const floor = size([list[0], list[3]]);
    assert.deepEqual(contents(fitE2EEMessages(list, params, floor)), ['S', 'x'.repeat(50)]);
    assert.throws(
      () => fitE2EEMessages(list, params, floor - 1),
      (err: unknown) => err instanceof VeniceE2EEError && err.code === 'request_too_large',
    );
  });

  it('brings a CJK history over 256 KiB under the budget and never alters the latest turn', () => {
    const cjk = (tag: string) => `${tag}:${'漢'.repeat(3999)}`;
    const list: Message[] = [msg('system', 'You are Alice.')];
    for (let i = 0; i < 8; i++) list.push(msg('user', cjk(`u${i}`)), msg('assistant', cjk(`a${i}`)));
    list.push(msg('user', cjk('latest')));
    assert.ok(size(list) > E2EE_MAX_REQUEST_BYTES, 'untrimmed it is over the ceiling');

    const fitted = fitE2EEMessages(list, params);
    assert.ok(size(fitted) <= E2EE_REQUEST_BUDGET_BYTES);
    assert.ok(fitted.length < list.length);
    assert.deepEqual(fitted[0], list[0]);
    assert.equal(fitted[1].role, 'user');
    assert.deepEqual(contents(fitted).slice(1), contents(list).slice(list.length - (fitted.length - 1)));
  });
});

describe('readEncryptedStream', () => {
  it('decrypts and concatenates chunks, streaming each piece', async () => {
    const client = generateEphemeralKeyPair();
    const stream = sseStream([
      encryptedFrame(client.publicKey, 'Hello '),
      encryptedFrame(client.publicKey, 'world.'),
      'data: [DONE]\n',
    ]);
    const pieces: string[] = [];
    const result = await readEncryptedStream(stream, client.secretKey, c => pieces.push(c));
    assert.equal(result.content, 'Hello world.');
    assert.deepEqual(pieces, ['Hello ', 'world.']);
  });

  it('handles frames split across reads', async () => {
    const client = generateEphemeralKeyPair();
    const frame = encryptedFrame(client.publicKey, 'split me');
    const half = Math.floor(frame.length / 2);
    const stream = sseStream([frame.slice(0, half), frame.slice(half)]);
    const result = await readEncryptedStream(stream, client.secretKey);
    assert.equal(result.content, 'split me');
  });

  it('collects usage and the truncation flag', async () => {
    const client = generateEphemeralKeyPair();
    const stream = sseStream([
      encryptedFrame(client.publicKey, 'cut', { finish_reason: 'length' }),
      `data: ${JSON.stringify({ usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } })}\n`,
    ]);
    const result = await readEncryptedStream(stream, client.secretKey);
    assert.equal(result.truncated, true);
    assert.deepEqual(result.usage, { promptTokens: 10, completionTokens: 5, totalTokens: 15 });
  });

  // The single most important guarantee: a server that answers in the clear
  // must not be rendered as if the exchange had been encrypted.
  it('fails closed when the server returns plaintext instead of an envelope', async () => {
    const client = generateEphemeralKeyPair();
    const stream = sseStream([
      `data: ${JSON.stringify({ choices: [{ delta: { content: 'A UTXO is an unspent output.' } }] })}\n`,
    ]);
    await assert.rejects(() => readEncryptedStream(stream, client.secretKey), VeniceE2EEError);
  });

  it('fails closed on a chunk encrypted to somebody else', async () => {
    const client = generateEphemeralKeyPair();
    const other = generateEphemeralKeyPair();
    const stream = sseStream([encryptedFrame(other.publicKey, 'not for you')]);
    await assert.rejects(() => readEncryptedStream(stream, client.secretKey), VeniceE2EEError);
  });

  it('ignores malformed SSE frames without breaking the stream', async () => {
    const client = generateEphemeralKeyPair();
    const stream = sseStream([
      'data: {not json\n',
      ': a comment line\n',
      encryptedFrame(client.publicKey, 'ok'),
    ]);
    const result = await readEncryptedStream(stream, client.secretKey);
    assert.equal(result.content, 'ok');
  });

  it('fails closed on a short non-hex content chunk (not shown as text)', async () => {
    const client = generateEphemeralKeyPair();
    const stream = sseStream([`data: ${JSON.stringify({ choices: [{ delta: { content: 'hi' } }] })}\n`]);
    await assert.rejects(() => readEncryptedStream(stream, client.secretKey), VeniceE2EEError);
  });

  it('fails closed when content is a non-string value', async () => {
    const client = generateEphemeralKeyPair();
    const stream = sseStream([`data: ${JSON.stringify({ choices: [{ delta: { content: { sneaky: true } } }] })}\n`]);
    await assert.rejects(() => readEncryptedStream(stream, client.secretKey), /not an encrypted string/);
  });

  it('aborts the whole stream when a later chunk is tampered, after emitting earlier authentic ones', async () => {
    const client = generateEphemeralKeyPair();
    const good = encryptedFrame(client.publicKey, 'first ');
    const tampered = encryptedFrame(client.publicKey, 'second');
    // Corrupt the tampered frame's ciphertext so the GCM tag fails.
    const broken = tampered.replace(/"content":"([0-9a-f]+)"/, (_m, hex) => `"content":"${hex.slice(0, -2)}00"`);
    const seen: string[] = [];
    await assert.rejects(
      () => readEncryptedStream(sseStream([good, broken]), client.secretKey, c => seen.push(c)),
      VeniceE2EEError,
    );
    assert.deepEqual(seen, ['first '], 'only the authentic chunk was emitted before the hard stop');
  });

  it('passes usage and [DONE] through without treating them as content', async () => {
    const client = generateEphemeralKeyPair();
    const stream = sseStream([
      `data: ${JSON.stringify({ usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 } })}\n`,
      encryptedFrame(client.publicKey, 'body'),
      'data: [DONE]\n',
    ]);
    const result = await readEncryptedStream(stream, client.secretKey);
    assert.equal(result.content, 'body');
    assert.deepEqual(result.usage, { promptTokens: 1, completionTokens: 2, totalTokens: 3 });
  });
});

describe('streamE2EEChatCompletion', () => {
  function harness(
    overrides: {
      attestationBody?: any;
      dcapFailure?: Error;
      /** HTTP wrapper for the attestation response, e.g. Venice's 502-with-a-body. */
      attestationHttp?: { ok: boolean; status: number };
    } = {},
  ) {
    const model = generateEphemeralKeyPair();
    const calls: { url: string; init: any }[] = [];
    let clientPubKeyHex = '';
    let latestAttestationNonce = '';
    const address = deriveSigningAddress(model.publicKeyHex);
    const policy: ChainPolicy = {
      dcap: {
        pccsUrl: 'https://pccs.test',
        getCollateral: async () => ({ public: 'collateral' }),
        verify: async () => {
          if (overrides.dcapFailure) throw overrides.dcapFailure;
          return {
            status: 'UpToDate',
            report: {
              type: 'td10',
              data: {
                reportData: `${address}${'00'.repeat(12)}${latestAttestationNonce}`,
                tdAttributes: '0000001000000000',
                mrTd: 'aa'.repeat(48),
              },
            },
          };
        },
      },
      measurements: { references: [] },
      requireMeasurementPinning: false,
      requireNvidia: false,
    };

    const fetchImpl = async (url: string, init: any) => {
      calls.push({ url, init });
      if (url.includes('/tee/attestation')) {
        const url_ = new URL(url);
        latestAttestationNonce = url_.searchParams.get('nonce') ?? '';
        const body = overrides.attestationBody ?? {
          // Deliberately false: Alice must ignore Venice's verdict and
          // decide from the DCAP-verified quote.
          verified: false,
          nonce: url_.searchParams.get('nonce'),
          signing_public_key: model.publicKeyHex,
          intel_quote: '04ab',
        };
        const http = overrides.attestationHttp ?? { ok: true, status: 200 };
        return {
          ok: http.ok,
          status: http.status,
          json: async () => body,
          text: async () => JSON.stringify(body),
        };
      }
      clientPubKeyHex = init.headers['X-Venice-TEE-Client-Pub-Key'];
      const clientPub = Buffer.from(clientPubKeyHex, 'hex');
      return {
        ok: true,
        status: 200,
        body: sseStream([encryptedFrame(new Uint8Array(clientPub), 'decrypted reply')]),
      };
    };

    return { model, calls, fetchImpl, policy, clientPubKeyHex: () => clientPubKeyHex };
  }

  const messages: Message[] = [{ role: 'user', content: 'hi' }];

  it('performs attestation, encrypts, and decrypts the reply end to end', async () => {
    const h = harness();
    const result = await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages,
      attestationPolicy: h.policy,
    });
    assert.equal(result.content, 'decrypted reply');
    assert.equal(result.assurance, 'attested-unpinned');
    assert.equal(h.calls.length, 2);
    assert.ok(h.calls[0].url.includes('/tee/attestation'));
    assert.ok(h.calls[1].url.endsWith('/chat/completions'));
  });

  it('always sends stream: true and never offers a non-streaming path', async () => {
    const h = harness();
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages,
      attestationPolicy: h.policy,
    });
    const body = JSON.parse(h.calls[1].init.body);
    assert.equal(body.stream, true);
    assert.equal(body.temperature, 0.7);
    assert.equal(body.max_tokens, 1024);
    assert.deepEqual(body.stream_options, { include_usage: true });
    assert.equal(body.venice_parameters, undefined);
  });

  it('keeps per-message request keys distinct from the advertised response key', async () => {
    const h = harness();
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages: [
        { role: 'system', content: 'system' },
        { role: 'user', content: 'question' },
      ],
      attestationPolicy: h.policy,
    });
    const body = JSON.parse(h.calls[1].init.body);
    const advertised = h.calls[1].init.headers['X-Venice-TEE-Client-Pub-Key'];
    const messageKeys: string[] = [];
    for (const message of body.messages) {
      const embedded = Buffer.from(parseEnvelope(message.content).peerPublicKey).toString('hex');
      assert.notEqual(embedded, advertised);
      messageKeys.push(embedded);
    }
    assert.equal(new Set(messageKeys).size, body.messages.length);
  });

  it('sends the three required E2EE headers', async () => {
    const h = harness();
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages,
      attestationPolicy: h.policy,
    });
    const headers = h.calls[1].init.headers;
    assert.match(headers['X-Venice-TEE-Client-Pub-Key'], /^04[0-9a-f]{128}$/);
    assert.equal(headers['X-Venice-TEE-Model-Pub-Key'], h.model.publicKeyHex);
    assert.equal(headers['X-Venice-TEE-Signing-Algo'], 'ecdsa');
  });

  it('never puts the prompt in the request body in clear', async () => {
    const h = harness();
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages: [{ role: 'user', content: 'my secret question' }],
      attestationPolicy: h.policy,
    });
    assert.ok(!h.calls[1].init.body.includes('my secret question'));
  });

  it('omits Authorization when the transport has none (public web path)', async () => {
    const h = harness();
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages,
      attestationPolicy: h.policy,
    });
    assert.equal(h.calls[0].init.headers.Authorization, undefined);
    assert.equal(h.calls[1].init.headers.Authorization, undefined);
  });

  it('aborts before sending anything when independent DCAP verification fails', async () => {
    const h = harness({ dcapFailure: new Error('bad quote signature') });
    await assert.rejects(
      () =>
        streamE2EEChatCompletion({
          transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
          model: 'e2ee-test',
          messages,
          attestationPolicy: h.policy,
        }),
      VeniceE2EEError,
    );
    // Only the attestation call happened: no encrypted request was attempted.
    assert.equal(h.calls.length, 1);
  });

  it('fetches a fresh attestation with a different nonce for every send', async () => {
    const h = harness();
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages,
      attestationPolicy: h.policy,
    });
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages,
      attestationPolicy: h.policy,
    });
    const attestationUrls = h.calls
      .filter(call => call.url.includes('/tee/attestation'))
      .map(call => new URL(call.url));
    assert.equal(attestationUrls.length, 2);
    assert.notEqual(
      attestationUrls[0].searchParams.get('nonce'),
      attestationUrls[1].searchParams.get('nonce'),
    );
  });

  // 3 UTF-8 bytes per CJK character, doubled by hex: a history well inside the
  // 96 000-character window is still far beyond 256 KiB on the wire.
  const cjk = (tag: string, chars = 4000) => `${tag}:${'漢'.repeat(chars - tag.length - 1)}`;

  function cjkConversation(pairs: number): Message[] {
    const out: Message[] = [{ role: 'system', content: 'You are Alice.' }];
    for (let i = 0; i < pairs; i++) {
      out.push({ role: 'user', content: cjk(`u${i}`) }, { role: 'assistant', content: cjk(`a${i}`) });
    }
    out.push({ role: 'user', content: cjk('uLast') });
    return out;
  }

  it('keeps a CJK history under the byte budget by dropping the oldest turns', async () => {
    const h = harness();
    const messages = cjkConversation(8);
    const chars = messages.reduce((sum, m) => sum + m.content.length, 0);
    assert.ok(chars < 96_000, `window-sized input: ${chars}`);
    assert.ok(
      Buffer.byteLength(JSON.stringify(buildEncryptedMessages(messages, h.model.publicKey))) > E2EE_MAX_REQUEST_BYTES,
      'untrimmed, this history exceeds the request limit',
    );

    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages,
      attestationPolicy: h.policy,
    });
    const raw: string = h.calls[1].init.body;
    assert.ok(Buffer.byteLength(raw) <= E2EE_REQUEST_BUDGET_BYTES, `${Buffer.byteLength(raw)} bytes`);

    const sent = JSON.parse(raw).messages as { role: string; content: string }[];
    const plain = sent.map(m => decryptEnvelope(h.model.secretKey, m.content));
    assert.equal(sent[0].role, 'system');
    assert.equal(plain[0], 'You are Alice.');
    assert.ok(sent.length < messages.length, 'old pairs were dropped');
    // What remains is a contiguous suffix of the original conversation that
    // starts on a user turn and ends on the untouched latest message.
    const original = messages.slice(1).map(m => m.content);
    const kept = plain.slice(1);
    assert.deepEqual(kept, original.slice(original.length - kept.length));
    assert.equal(sent[1].role, 'user');
    assert.ok(!kept.includes(original[0]), 'the oldest pair is gone');
  });

  it('keeps only system and the latest message when nothing older fits', async () => {
    const h = harness();
    const latest = '漢'.repeat(39_000);
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages: [
        { role: 'system', content: 'You are Alice.' },
        { role: 'user', content: '漢'.repeat(10_000) },
        { role: 'assistant', content: 'earlier answer' },
        { role: 'user', content: latest },
      ],
      attestationPolicy: h.policy,
    });
    const raw: string = h.calls[1].init.body;
    assert.ok(Buffer.byteLength(raw) <= E2EE_REQUEST_BUDGET_BYTES);
    const sent = JSON.parse(raw).messages as { content: string }[];
    assert.deepEqual(
      sent.map(m => decryptEnvelope(h.model.secretKey, m.content)),
      ['You are Alice.', latest],
    );
  });

  it('leaves a normal history untouched', async () => {
    const h = harness();
    const normal: Message[] = [
      { role: 'system', content: 'You are Alice.' },
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: 'second' },
    ];
    await streamE2EEChatCompletion({
      transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      model: 'e2ee-test',
      messages: normal,
      attestationPolicy: h.policy,
    });
    const sent = JSON.parse(h.calls[1].init.body).messages as { content: string }[];
    assert.deepEqual(
      sent.map(m => decryptEnvelope(h.model.secretKey, m.content)),
      normal.map(m => m.content),
    );
  });

  it('refuses locally, before attestation or any POST, when system plus latest cannot fit', async () => {
    const h = harness();
    await assert.rejects(
      () => streamE2EEChatCompletion({
        transport: { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
        model: 'e2ee-test',
        messages: [
          { role: 'system', content: 'You are Alice.' },
          { role: 'user', content: 'earlier' },
          { role: 'assistant', content: 'answer' },
          { role: 'user', content: '漢'.repeat(50_000) },
        ],
        attestationPolicy: h.policy,
      }),
      (err: unknown) => err instanceof VeniceE2EEError && err.code === 'request_too_large',
    );
    assert.equal(h.calls.length, 0, 'no attestation and no POST');
  });

  it('fetchAndVerifyAttestation refuses a nonce mismatch before chat', async () => {
    const h = harness({
      attestationBody: {
        verified: true,
        nonce: '00'.repeat(32),
        signing_public_key: generateEphemeralKeyPair().publicKeyHex,
        intel_quote: '04ab',
      },
    });
    await assert.rejects(
      () =>
        fetchAndVerifyAttestation(
          { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
          'e2ee-test',
          h.policy,
        ),
      (err: unknown) => {
        assert.ok(err instanceof VeniceE2EEError);
        assert.equal(err.code, 'attestation_invalid');
        assert.match(err.message, /nonce mismatch/i);
        return true;
      },
    );
  });

  it('classifies an unreachable attestation service separately', async () => {
    const h = harness();
    await assert.rejects(
      () => fetchAndVerifyAttestation(
        {
          baseUrl: 'https://proxy.test/api/v1',
          fetchImpl: async () => { throw new TypeError('Failed to fetch'); },
        },
        'e2ee-test',
        h.policy,
      ),
      (err: unknown) => {
        assert.ok(err instanceof VeniceE2EEError);
        // A request that never completed is not a busy service: telling the
        // user to try again shortly would be a lie, so it has its own code.
        assert.equal(err.code, 'attestation_blocked');
        // The cause moves to the detail line, where the vocabulary is closed.
        assert.equal(
          err.detail,
          'stage=attestation host=proxy.test kind=unreachable error=TypeError hint=blocked-or-offline',
        );
        return true;
      },
    );
  });

  // The real incident this guards: NRAS (NVIDIA's GPU attestation service)
  // goes down, Venice's own check fails, and it wraps a complete, sound
  // attestation in a 502. Alice never trusted Venice's verdict, so the
  // status is not a reason to refuse what her own chain accepts.
  it('salvages a full attestation wrapped in a Venice 502 and judges it itself', async () => {
    const h = harness({ attestationHttp: { ok: false, status: 502 } });
    const result = await fetchAndVerifyAttestation(
      { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
      'e2ee-test',
      h.policy,
    );
    assert.equal(result.assurance, 'attested-unpinned');
  });

  it('still refuses a 502 whose attestation fails our own chain', async () => {
    const h = harness({
      attestationHttp: { ok: false, status: 502 },
      dcapFailure: new Error('bad quote signature'),
    });
    await assert.rejects(
      () => fetchAndVerifyAttestation(
        { baseUrl: 'https://proxy.test/api/v1', fetchImpl: h.fetchImpl },
        'e2ee-test',
        h.policy,
      ),
      (err: unknown) => {
        assert.ok(err instanceof VeniceE2EEError);
        // The service said it was struggling AND the salvage did not survive
        // verification: "try again shortly" is the honest message.
        assert.equal(err.code, 'attestation_unavailable');
        assert.equal(err.status, 502);
        return true;
      },
    );
  });

  it('classifies an attestation HTTP 5xx as temporarily unavailable', async () => {
    const h = harness();
    await assert.rejects(
      () => fetchAndVerifyAttestation(
        {
          baseUrl: 'https://proxy.test/api/v1',
          fetchImpl: async () => ({
            ok: false,
            status: 502,
            text: async () => JSON.stringify({ error: 'upstream verification failed' }),
          }),
        },
        'e2ee-test',
        h.policy,
      ),
      (err: unknown) => {
        assert.ok(err instanceof VeniceE2EEError);
        assert.equal(err.code, 'attestation_unavailable');
        assert.equal(err.status, 502);
        return true;
      },
    );
  });
});
