// Contract tests of the Spark client against stand-in operators: the fetch
// is replaced, the answers are the recorded gRPC-web messages, and what is
// checked is the behaviour between the two: which operator is asked, when
// the next one is tried, how a refusal and a timeout come out, and how the
// two sides of a wallet's transfers are asked for and paged.

import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  getSparkBalance, getSparkTransfers, nextSparkCursor, readMessage, SparkError, SPARK_OPERATORS, unary,
  type SparkPage, type SparkTransfer,
} from './spark.ts';
import { BALANCE_HEX, TRANSFER_MIN_HEX, TRANSFER_SWAP_HEX } from './spark.fixtures.ts';

const PK = '037579aee81891fc3a28cbe7b13e565031d46248b420fb39dcb308598f472b4513';
const bytes = (h: string) => Uint8Array.from(h.match(/../g)!.map(x => parseInt(x, 16)));

/** A gRPC-web body: the message frame, then the trailer frame. */
function grpcBody(message: Uint8Array | null, trailers = 'grpc-status: 0\r\n'): Uint8Array {
  const parts: Uint8Array[] = [];
  if (message) {
    const f = new Uint8Array(5 + message.length);
    new DataView(f.buffer).setUint32(1, message.length);
    f.set(message, 5);
    parts.push(f);
  }
  const t = new TextEncoder().encode(trailers);
  const tf = new Uint8Array(5 + t.length);
  tf[0] = 0x80;
  new DataView(tf.buffer).setUint32(1, t.length);
  tf.set(t, 5);
  parts.push(tf);
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let pos = 0;
  for (const p of parts) { out.set(p, pos); pos += p.length; }
  return out;
}

function grpcResponse(message: Uint8Array | null, opts: { trailers?: string; headers?: Record<string, string>; status?: number } = {}): Response {
  return new Response(grpcBody(message, opts.trailers) as BodyInit, {
    status: opts.status ?? 200,
    headers: { 'content-type': 'application/grpc-web+proto', ...(opts.headers ?? {}) },
  });
}

type Call = { url: string; body: Uint8Array; headers: Record<string, string> };

/** Replace fetch with a script: one answer per operator, in call order. */
function script(answers: Array<(call: Call, signal: AbortSignal | undefined) => Promise<Response> | Response>): { calls: Call[] } {
  const calls: Call[] = [];
  let i = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = new Uint8Array(init?.body as ArrayBuffer);
    const body = raw.subarray(5, 5 + new DataView(raw.buffer, raw.byteOffset + 1, 4).getUint32(0));
    const call: Call = { url: String(input), body, headers: Object.fromEntries(Object.entries((init?.headers ?? {}) as Record<string, string>)) };
    calls.push(call);
    const answer = answers[Math.min(i++, answers.length - 1)];
    return answer(call, init?.signal ?? undefined);
  }) as typeof fetch;
  return { calls };
}

const unreachable = () => Promise.reject(new TypeError('fetch failed'));
/** An operator that never answers: rejects only when the signal fires, as a real fetch does. */
const silent = (_call: Call, signal?: AbortSignal) => new Promise<Response>((_, reject) => {
  signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
});

describe('Spark operators: one call, the next operator when one cannot be reached', () => {
  const realFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = realFetch; });

  it('asks the coordinator first, as gRPC-web, and decodes its answer', async () => {
    const { calls } = script([() => grpcResponse(bytes(BALANCE_HEX))]);
    const balance = await getSparkBalance(PK);
    assert.deepEqual(balance, { sats: 1536, leaves: 2 });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${SPARK_OPERATORS[0].url}/spark.SparkService/query_balance`);
    assert.equal(calls[0].headers['content-type'], 'application/grpc-web+proto');
    assert.equal(calls[0].headers['x-grpc-web'], '1');
    // The request carries the key and the network.
    const m = readMessage(calls[0].body);
    assert.equal(Buffer.from(m.get(1)![0] as Uint8Array).toString('hex'), PK);
    assert.equal(m.get(2)![0], 1);
  });

  it('moves to the next operator when one is down, keeps the order, and gives up cleanly after the last', async () => {
    const { calls } = script([unreachable, () => grpcResponse(null, { status: 503 }), () => grpcResponse(bytes(BALANCE_HEX))]);
    assert.deepEqual(await getSparkBalance(PK), { sats: 1536, leaves: 2 });
    assert.deepEqual(calls.map(c => c.url.split('/spark.')[0]), SPARK_OPERATORS.map(o => o.url));

    script([unreachable]);
    await assert.rejects(getSparkBalance(PK), (e: unknown) => e instanceof SparkError && e.status === undefined && /reach/i.test(e.message));
  });

  it('does not try another operator on an answer: a refusal reads the same everywhere', async () => {
    const { calls } = script([() => grpcResponse(null, { trailers: 'grpc-status: 3\r\ngrpc-message: filter%20requires%20a%20participant\r\n' })]);
    await assert.rejects(unary('query_all_transfers', new Uint8Array()), (e: unknown) => e instanceof SparkError && e.status === 3 && e.message === 'filter requires a participant');
    assert.equal(calls.length, 1);

    // Trailers-only: the status travels in the HTTP headers, before any frame.
    const early = script([() => new Response(null, { status: 200, headers: { 'grpc-status': '5', 'grpc-message': 'not%20found' } })]);
    await assert.rejects(unary('query_nodes', new Uint8Array()), (e: unknown) => e instanceof SparkError && e.status === 5 && e.message === 'not found');
    assert.equal(early.calls.length, 1);
  });

  it('treats an operator that never answers as unreachable, within the call’s own deadline', async () => {
    const { calls } = script([silent, () => grpcResponse(bytes(BALANCE_HEX))]);
    const started = Date.now();
    const out = await unary('query_balance', new Uint8Array(), undefined, 40);
    assert.equal(Buffer.from(out).toString('hex'), BALANCE_HEX);
    assert.equal(calls.length, 2);
    assert.ok(Date.now() - started < 2000);
  });

  it('stops at once when the caller cancels, without asking the next operator', async () => {
    const { calls } = script([silent, () => grpcResponse(bytes(BALANCE_HEX))]);
    const controller = new AbortController();
    const pending = assert.rejects(getSparkBalance(PK, { signal: controller.signal }), (e: unknown) => e instanceof DOMException && e.name === 'AbortError');
    controller.abort();
    await pending;
    assert.equal(calls.length, 1);
  });

  it('rejects an unexpected encoding instead of guessing', async () => {
    script([() => {
      const body = grpcBody(bytes(BALANCE_HEX));
      body[0] = 0x01; // compressed flag: not something this client speaks
      return new Response(body as BodyInit, { status: 200 });
    }]);
    await assert.rejects(unary('query_balance', new Uint8Array()), (e: unknown) => e instanceof SparkError && /encoding/.test(e.message));
  });
});

describe('Spark transfers: the two sides of a wallet, newest first, paged', () => {
  const realFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = realFetch; });

  it('asks the sender side and the receiver side separately, with a limit, descending, and merges them', async () => {
    const { calls } = script([
      call => grpcResponse(bytes(readMessage(call.body).has(2) ? TRANSFER_MIN_HEX : TRANSFER_SWAP_HEX)),
    ]);
    const page = await getSparkTransfers(PK, { limit: 20 });
    assert.equal(calls.length, 2);
    const filters = calls.map(c => readMessage(c.body));
    // One call names the key as sender (field 2), the other as receiver (field 1); neither asks ascending.
    assert.ok(filters.some(f => f.has(2) && !f.has(1)));
    assert.ok(filters.some(f => f.has(1) && !f.has(2)));
    for (const f of filters) {
      assert.equal(f.get(40)![0], 20);
      assert.equal(f.get(5), undefined);
      assert.equal(f.get(60), undefined);
    }
    // Both transfers, the newer first; a Lightning swap keeps its type.
    assert.deepEqual(page.items.map(t => t.type), ['transfer', 'preimage-swap']);
    assert.ok((page.items[0].createdAt ?? 0) >= (page.items[1].createdAt ?? 0));
    // Each side came back short of the limit: nothing more to page.
    assert.equal(page.cursor, null);
  });

  it('resumes each side from its own offset and skips a side that is done', async () => {
    const { calls } = script([() => grpcResponse(bytes(TRANSFER_MIN_HEX))]);
    const page = await getSparkTransfers(PK, { limit: 1, cursor: { sent: null, received: 40 } });
    assert.equal(calls.length, 1);
    const f = readMessage(calls[0].body);
    assert.ok(f.has(1), 'the receiver side only');
    assert.equal(f.get(50)![0], 40);
    assert.equal(f.get(40)![0], 1);
    // A full page (1 of 1) with the operator's next offset (1): more to read on that side.
    assert.deepEqual(page.cursor, { sent: null, received: 1 });
  });
});

describe('nextSparkCursor', () => {
  const t = (id: string): SparkTransfer => ({ id, senderPubkey: PK, receiverPubkey: PK, status: 'completed', type: 'transfer', totalSats: 1, leaves: [] });
  const page = (n: number, nextOffset: number | null): SparkPage<SparkTransfer> => ({ items: Array.from({ length: n }, (_, i) => t(`id-${i}`)), nextOffset });

  it('continues a side whose page was full and carries the operator’s offset', () => {
    assert.deepEqual(nextSparkCursor({ sent: page(20, 20), received: page(20, 20) }, 20), { sent: 20, received: 20 });
    assert.deepEqual(nextSparkCursor({ sent: page(20, 20), received: page(3, 3) }, 20), { sent: 20, received: null });
  });

  it('ends a side that came back short, carried the end marker, or was not asked', () => {
    assert.deepEqual(nextSparkCursor({ sent: page(5, 5), received: page(20, null) }, 20), null);
    assert.deepEqual(nextSparkCursor({ sent: null, received: page(20, 40) }, 20), { sent: null, received: 40 });
    assert.deepEqual(nextSparkCursor({ sent: null, received: null }, 20), null);
    assert.deepEqual(nextSparkCursor({ sent: page(0, 0), received: page(0, 0) }, 20), null);
  });
});
