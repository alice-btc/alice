import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { Miniflare } from 'miniflare';
import type { Env } from './index.ts';
import { readAnchors, refreshArkadeAnchor, refreshBarkAnchor, txidFromRawTx } from './explorer-anchors.ts';

let miniflare: Miniflare;
let env: Env;

beforeEach(async () => {
  miniflare = new Miniflare({
    modules: true,
    script: 'export default { async fetch() { return new Response("ok") } }',
    d1Databases: ['ENTITY_DB'],
  });
  const db = await miniflare.getD1Database('ENTITY_DB');
  const migrationsUrl = new URL('../migrations-entities/', import.meta.url);
  const names = (await readdir(migrationsUrl)).filter(n => /^\d+.*\.sql$/.test(n)).sort();
  for (const name of names) {
    const sql = await readFile(new URL(name, migrationsUrl), 'utf8');
    for (const statement of sql.split(/;\s*(?:\n|$)/).map(s => s.trim()).filter(Boolean)) {
      await db.prepare(statement).run();
    }
  }
  env = { ENTITY_DB: db } as unknown as Env;
});

afterEach(async () => {
  await miniflare.dispose();
});

// A fake chain shaped like the operator's wallet: the three seeds (S1 oldest,
// S3 newest), S3's change spent by a consolidation W (not a commitment),
// whose change funds the commitment C1, whose change funds C2, the tip,
// unspent. Each tx has a small connector output and a large change output.
const id = (c: string) => c.repeat(64);
const S1 = id('1'); const S2 = id('2'); const S3 = id('3'); const W = id('a'); const C1 = id('b'); const C2 = id('c');
type Spec = { height: number; change: number; spender: string | null };
const CHAIN: Record<string, Spec> = {
  [S1]: { height: 100, change: 2_000_000, spender: null },
  [S2]: { height: 200, change: 3_000_000, spender: null },
  [S3]: { height: 300, change: 2_500_000, spender: W },
  [W]: { height: 305, change: 2_400_000, spender: C1 },
  [C1]: { height: 310, change: 2_300_000, spender: C2 },
  [C2]: { height: 320, change: 2_200_000, spender: null },
};
const COMMITMENTS = new Set([S1, S2, S3, C1, C2]);
const ESPLORA = 'https://esplora.test/api';
const ARKADE = 'https://arkade.test';
const BARK = 'https://bark.test';

// A real round of Second's mainnet server (block 970,970, 11 October 2026):
// the signed transaction as the server sends it, and its txid.
const ROUND_RAW_HEX = '02000000000101ab57006689d9e3aec881e46d5eb7f1ab8972b940174fa6e74244fe480752c2fa0000000000fdffffff0233870000000000002251202fedad5fb9bdda51d9b61f37c57d9fc7458fc36fcbec564a963c536b16047e4e4a3c0800000000002251206778373060d0912038c4442d728f4fbea314037eeb628f9a0416d69bc5dad5510140b16f6bda09d9de4a9c740c0081c2d50fffc9e02e378a45fb519bbfd5a1126bdd458f7ae16560e2e131689bee2bba62efc02de85c4c04c0ebf8a01019288eb22dd8d00e00';
const ROUND_TXID = '204cb0d41f7105fc784b07f289de2e7005725969ee2429788684b2fde9d91bea';

const hexBytes = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));
function varint(n: number): number[] { const out: number[] = []; while (n >= 0x80) { out.push((n & 0x7f) | 0x80); n = Math.floor(n / 128); } out.push(n); return out; }
function lengthDelimited(field: number, payload: Uint8Array): Uint8Array { return Uint8Array.from([field * 8 + 2, ...varint(payload.length), ...payload]); }
/** A gRPC-web body: one message frame, then a trailers frame with status 0. */
function grpcBody(message: Uint8Array): Uint8Array {
  const trailers = new TextEncoder().encode('grpc-status: 0\r\n');
  const out = new Uint8Array(5 + message.length + 5 + trailers.length);
  out[0] = 0; new DataView(out.buffer).setUint32(1, message.length); out.set(message, 5);
  out[5 + message.length] = 0x80; new DataView(out.buffer).setUint32(6 + message.length, trailers.length); out.set(trailers, 10 + message.length);
  return out;
}
/** RoundEvent { finished = 4: RoundFinished { round_seq = 1, signed_round_tx = 3 } }. */
const FINISHED_EVENT = grpcBody(lengthDelimited(4, Uint8Array.from([8, 7, ...lengthDelimited(3, hexBytes(ROUND_RAW_HEX))])));
/** RoundEvent { attempt = 1: RoundAttempt { round_seq = 1, attempt_seq = 2 } }. */
const ATTEMPT_EVENT = grpcBody(lengthDelimited(1, Uint8Array.from([8, 8, 16, 1])));

function fakeFetch(opts: { indexerDown?: boolean; barkEvent?: Uint8Array; roundHeight?: number; esploraDown?: string; outspendsDown?: boolean } = {}): typeof fetch & { calls: string[] } {
  const calls: string[] = [];
  const f = (async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    // A whole Esplora host down (unreachable), or every outspends lookup failing.
    if (opts.esploraDown && url.startsWith(opts.esploraDown)) throw new TypeError('fetch failed');
    if (opts.outspendsDown && /\/outspends$/.test(url)) throw new TypeError('fetch failed');
    if (url === `${BARK}/bark_server.ArkService/LastRoundEvent`) {
      return new Response(opts.barkEvent ?? ATTEMPT_EVENT, { status: 200, headers: { 'content-type': 'application/grpc-web+proto' } });
    }
    if (url === `${ESPLORA}/tx/${ROUND_TXID}`) {
      return json({ txid: ROUND_TXID, status: opts.roundHeight ? { confirmed: true, block_height: opts.roundHeight, block_time: 1_791_750_000 } : { confirmed: false }, vout: [{ value: 34_611 }, { value: 539_722 }], vin: [] });
    }
    let m = url.match(new RegExp(`^${ESPLORA}/tx/([0-9a-f]{64})/outspends$`));
    if (m) {
      const spec = CHAIN[m[1]];
      if (!spec) return json({ error: 'not found' }, 404);
      return json([{ spent: false }, spec.spender ? { spent: true, txid: spec.spender, vin: 0 } : { spent: false }]);
    }
    m = url.match(new RegExp(`^${ESPLORA}/tx/([0-9a-f]{64})$`));
    if (m) {
      const spec = CHAIN[m[1]];
      if (!spec) return json({ error: 'not found' }, 404);
      return json({
        txid: m[1],
        status: { confirmed: true, block_height: spec.height, block_time: 1_790_000_000 + spec.height },
        vout: [{ value: 330 }, { value: spec.change }],
        vin: [{ txid: id('0'), vout: 0 }],
      });
    }
    m = url.match(new RegExp(`^${ARKADE}/v1/indexer/commitmentTx/([0-9a-f]{64})$`));
    if (m) {
      if (opts.indexerDown) return json({ code: 14, message: 'unavailable' }, 503);
      return COMMITMENTS.has(m[1]) ? json({ startedAt: '1', batches: {} }) : json({ code: 13, message: 'batch not found' }, 500);
    }
    return json({ error: 'unexpected' }, 500);
  }) as typeof fetch & { calls: string[] };
  f.calls = calls;
  return f;
}

// The real seeds are not in the fake chain: the test redirects them by
// mapping the module's constants onto the fake ones through the deps, which
// means the first run starts from the stored row the test writes instead.
async function seedRow(txid: string, height: number, frontier: object[]) {
  await env.ENTITY_DB.prepare(
    'INSERT INTO explorer_anchors (network, txid, height, timestamp, frontier, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind('arkade', txid, height, 1_790_000_000 + height, JSON.stringify(frontier), 1).run();
}

describe('refreshArkadeAnchor', () => {
  it('walks the operator wallet forward from the stored frontier, across a consolidation, to the newest commitment', async () => {
    await seedRow(S3, 300, [{ txid: S1, vout: 1, valueSats: 2_000_000 }, { txid: S2, vout: 1, valueSats: 3_000_000 }, { txid: S3, vout: 1, valueSats: 2_500_000 }]);
    const f = fakeFetch();
    const report = await refreshArkadeAnchor(env, { fetch: f, now: () => 123_456, esploraUrl: ESPLORA, arkadeUrl: ARKADE });
    assert.deepEqual(report, { anchor: { txid: C2, height: 320, timestamp: 1_790_000_320 }, hops: 3, found: 2, interrupted: false });
    // The consolidation was asked about and crossed, never claimed.
    assert.ok(f.calls.includes(`${ARKADE}/v1/indexer/commitmentTx/${W}`));
    const anchors = await readAnchors(env);
    assert.deepEqual(anchors, { arkade: { txid: C2, height: 320, timestamp: 1_790_000_320 }, updatedAt: 123_456 });
    // The frontier keeps the sleeping lines' tips and the new tip's change.
    const row = await env.ENTITY_DB.prepare('SELECT frontier FROM explorer_anchors WHERE network = ?').bind('arkade').first<{ frontier: string }>();
    const keys = (JSON.parse(row!.frontier) as { txid: string; vout: number }[]).map(o => `${o.txid[0]}:${o.vout}`);
    assert.deepEqual(keys.sort(), ['1:1', '2:1', 'c:1']);
  });

  it('is cheap once at the tip: one outspends lookup per frontier output, nothing else', async () => {
    await seedRow(C2, 320, [{ txid: C2, vout: 1, valueSats: 2_200_000 }]);
    const f = fakeFetch();
    const report = await refreshArkadeAnchor(env, { fetch: f, esploraUrl: ESPLORA, arkadeUrl: ARKADE });
    assert.equal(report.hops, 0);
    assert.equal(report.anchor?.txid, C2);
    assert.deepEqual(f.calls, [`${ESPLORA}/tx/${C2}/outspends`]);
  });

  it('never concludes "not a commitment" from an indexer failure, keeps the anchor and queues the output for the next run', async () => {
    await seedRow(S3, 300, [{ txid: S3, vout: 1, valueSats: 2_500_000 }]);
    const report = await refreshArkadeAnchor(env, { fetch: fakeFetch({ indexerDown: true }), esploraUrl: ESPLORA, arkadeUrl: ARKADE, now: () => 77 });
    assert.equal(report.interrupted, true);
    assert.equal(report.found, 0);
    assert.equal(report.hops, 0, 'the spender was not counted as explored');
    assert.match(report.failure ?? '', /arkade\.test indexer answered 503/);
    const anchors = await readAnchors(env);
    assert.equal(anchors.arkade?.txid, S3, 'the anchor stands');
    assert.equal(anchors.updatedAt, 77, 'the progress is stored');
    const row = await env.ENTITY_DB.prepare('SELECT frontier FROM explorer_anchors WHERE network = ?').bind('arkade').first<{ frontier: string }>();
    assert.deepEqual(JSON.parse(row!.frontier), [{ txid: S3, vout: 1, valueSats: 2_500_000 }], 'the output stays queued');
  });

  it('falls back to the next Esplora host when the first is unreachable', async () => {
    await seedRow(S3, 300, [{ txid: S3, vout: 1, valueSats: 2_500_000 }]);
    const f = fakeFetch({ esploraDown: 'https://down.test' });
    const report = await refreshArkadeAnchor(env, { fetch: f, esploraUrl: ['https://down.test/api', ESPLORA], arkadeUrl: ARKADE });
    assert.equal(report.interrupted, false);
    assert.equal(report.anchor?.txid, C2);
    assert.ok(f.calls.some(u => u.startsWith('https://down.test')) && f.calls.some(u => u.startsWith(ESPLORA)));
  });

  it('stores the seeds\' newest commitment even when the first walk is cut short, so the anchor is published at once', async () => {
    // No row yet, and every outspends lookup fails: the seeds alone are read.
    // The fake chain does not know the real seeds, so stand them in through
    // a host that answers any tx id with S3.
    const f = fakeFetch({ outspendsDown: true });
    const seeded = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const m = url.match(new RegExp(`^${ESPLORA}/tx/([0-9a-f]{64})$`));
      if (m && !CHAIN[m[1]]) return f(`${ESPLORA}/tx/${S3}`, init);
      return f(input, init);
    }) as typeof fetch;
    const report = await refreshArkadeAnchor(env, { fetch: seeded, esploraUrl: ESPLORA, arkadeUrl: ARKADE, now: () => 5 });
    assert.equal(report.interrupted, true);
    assert.match(report.failure ?? '', /esplora\.test unreachable/);
    assert.equal(report.anchor?.txid, S3);
    assert.equal((await readAnchors(env)).arkade?.height, 300, 'published from the seeds alone');
  });

  it('resumes across runs when the hop budget runs out', async () => {
    await seedRow(S3, 300, [{ txid: S3, vout: 1, valueSats: 2_500_000 }]);
    const first = await refreshArkadeAnchor(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE, maxHops: 1 });
    assert.equal(first.hops, 1);
    assert.equal(first.anchor?.txid, S3, 'the consolidation is not a commitment: the anchor stays');
    const second = await refreshArkadeAnchor(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE });
    assert.equal(second.anchor?.txid, C2);
  });
});

describe('readAnchors', () => {
  it('publishes nothing without rows, and nothing without the database', async () => {
    assert.deepEqual(await readAnchors(env), {});
    assert.deepEqual(await readAnchors({} as unknown as Env), {});
  });
});

describe('txidFromRawTx', () => {
  it('derives the txid of a segwit transaction, witnesses left out', () => {
    assert.equal(txidFromRawTx(hexBytes(ROUND_RAW_HEX)), ROUND_TXID);
  });
});

describe('refreshBarkAnchor', () => {
  it('stores the server\'s latest finished round once confirmed', async () => {
    const f = fakeFetch({ barkEvent: FINISHED_EVENT, roundHeight: 970_970 });
    const report = await refreshBarkAnchor(env, { fetch: f, now: () => 99, esploraUrl: ESPLORA, barkUrl: BARK });
    assert.deepEqual(report, { anchor: { txid: ROUND_TXID, height: 970_970, timestamp: 1_791_750_000 }, hops: 0, found: 1, interrupted: false });
    assert.deepEqual((await readAnchors(env)).bark, { txid: ROUND_TXID, height: 970_970, timestamp: 1_791_750_000 });
    // Asked once more with the same round: nothing to fetch beyond the event.
    const again = fakeFetch({ barkEvent: FINISHED_EVENT, roundHeight: 970_970 });
    await refreshBarkAnchor(env, { fetch: again, esploraUrl: ESPLORA, barkUrl: BARK });
    assert.deepEqual(again.calls, [`${BARK}/bark_server.ArkService/LastRoundEvent`]);
  });

  it('leaves the row alone while the round is unconfirmed or the last event is an attempt', async () => {
    const pending = await refreshBarkAnchor(env, { fetch: fakeFetch({ barkEvent: FINISHED_EVENT }), esploraUrl: ESPLORA, barkUrl: BARK });
    assert.deepEqual(pending, { anchor: null, hops: 0, found: 0, interrupted: false });
    const attempt = await refreshBarkAnchor(env, { fetch: fakeFetch({ barkEvent: ATTEMPT_EVENT }), esploraUrl: ESPLORA, barkUrl: BARK });
    assert.deepEqual(attempt, { anchor: null, hops: 0, found: 0, interrupted: false });
    assert.equal((await readAnchors(env)).bark, undefined);
  });
});
