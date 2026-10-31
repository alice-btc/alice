import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { Miniflare } from 'miniflare';
import type { Env } from './index.ts';
import { RequestBudget, commitmentTxidFromLine, listenArkadeStream, readAnchors, refreshArkadeAnchor, refreshBarkAnchor, settleCandidates, txidFromRawTx } from './explorer-anchors.ts';

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
// A second line, for the drift tests: the commitment D0's change leaves the
// wallet through three spenders that are not commitments (X1, X2, X3: a
// user's coins moving on) before X3's change funds the commitment C3.
const D0 = id('d'); const X1 = id('e'); const X2 = id('f'); const X3 = id('9'); const C3 = id('8');
// A third line, for the frontier tests: the newest commitment N's change is
// spent by Y, which is not a commitment and whose change is unspent; K is
// another funding line's unspent output, reached through a detour.
const N = id('7'); const Y = id('6'); const K = id('5');
// For the stream tests: M is a commitment funded from coins the walk never
// saw, so only the stream can tell of it; P is one announced but still in
// the mempool, confirmed only when the fake chain is told so.
const M = id('4'); const P = 'ab'.repeat(32);
type Spec = { height: number; change: number; spender: string | null };
const CHAIN: Record<string, Spec> = {
  [S1]: { height: 100, change: 2_000_000, spender: null },
  [S2]: { height: 200, change: 3_000_000, spender: null },
  [S3]: { height: 300, change: 2_500_000, spender: W },
  [W]: { height: 305, change: 2_400_000, spender: C1 },
  [C1]: { height: 310, change: 2_300_000, spender: C2 },
  [C2]: { height: 320, change: 2_200_000, spender: null },
  [D0]: { height: 250, change: 5_000_000, spender: X1 },
  [X1]: { height: 330, change: 4_900_000, spender: X2 },
  [X2]: { height: 340, change: 4_800_000, spender: X3 },
  [X3]: { height: 350, change: 4_700_000, spender: C3 },
  [C3]: { height: 400, change: 4_600_000, spender: null },
  [N]: { height: 500, change: 3_000_000, spender: Y },
  [Y]: { height: 505, change: 2_900_000, spender: null },
  [K]: { height: 450, change: 1_500_000, spender: null },
  [M]: { height: 600, change: 1_000_000, spender: null },
};
const COMMITMENTS = new Set([S1, S2, S3, C1, C2, C3, N, M, P]);
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

/** A line of the operator's stream announcing a commitment, as grpc-gateway sends it. */
const announce = (txid: string) => `${JSON.stringify({ result: { commitmentTx: { txid, spendableVtxos: [], spentVtxos: [] } } })}\n`;

type FakeOpts = {
  indexerDown?: boolean;
  barkEvent?: Uint8Array;
  roundHeight?: number;
  esploraDown?: string;
  outspendsDown?: boolean;
  /** The operator's stream, one entry per opening: the lines of a stream the
   *  operator closes, or a status for a refusal. Once the list is used up,
   *  the stream stays open until the caller aborts it. */
  stream?: (string | number)[];
  /** The height P is confirmed at; in the mempool until set. */
  pHeight?: number;
  /** Every opening of the stream fails at once, as past the request limit. */
  streamDown?: boolean;
};

function fakeFetch(opts: FakeOpts = {}): typeof fetch & { calls: string[] } {
  const calls: string[] = [];
  const f = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push(url);
    const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    // A whole Esplora host down (unreachable), or every outspends lookup failing.
    if (opts.esploraDown && url.startsWith(opts.esploraDown)) throw new TypeError('fetch failed');
    if (opts.outspendsDown && /\/outspends$/.test(url)) throw new TypeError('fetch failed');
    if (url === `${ARKADE}/v1/txs`) {
      if (opts.streamDown) throw new TypeError('Too many subrequests.');
      const next = opts.stream?.shift();
      if (typeof next === 'number') return json({ code: 14, message: 'unavailable' }, next);
      if (typeof next === 'string') return new Response(next, { status: 200 });
      const signal = init?.signal;
      return new Response(new ReadableStream<Uint8Array>({
        start(controller) {
          signal?.addEventListener('abort', () => controller.error(new DOMException('aborted', 'AbortError')));
        },
      }), { status: 200 });
    }
    if (url === `${ESPLORA}/tx/${P}`) {
      return json({ txid: P, status: opts.pHeight ? { confirmed: true, block_height: opts.pHeight, block_time: 1_790_000_000 + opts.pHeight } : { confirmed: false }, vout: [{ value: 330 }, { value: 900_000 }], vin: [] });
    }
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

  it('lets a path go after two spenders that are not commitments, instead of following the coins into a user\'s wallet', async () => {
    await seedRow(D0, 250, [{ txid: D0, vout: 1, valueSats: 5_000_000 }]);
    const f = fakeFetch();
    const report = await refreshArkadeAnchor(env, { fetch: f, esploraUrl: ESPLORA, arkadeUrl: ARKADE });
    assert.equal(report.interrupted, false);
    assert.equal(report.hops, 3, 'X1, X2 and X3 are explored, nothing beyond');
    assert.equal(report.found, 0);
    assert.equal(report.anchor?.txid, D0, 'C3 lies three wallet hops away: out of reach of the walk');
    assert.ok(!f.calls.includes(`${ARKADE}/v1/indexer/commitmentTx/${C3}`));
  });

  it('watches the newest commitment\'s own outputs every run, so a frontier that lost them heals', async () => {
    // A row whose frontier holds only an output reached through a detour
    // (drift 2) and none of C1's own: before, the walk never got to C2.
    await seedRow(C1, 310, [{ txid: S1, vout: 1, valueSats: 2_000_000, drift: 2 }]);
    const report = await refreshArkadeAnchor(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE });
    assert.equal(report.anchor?.txid, C2);
    const row = await env.ENTITY_DB.prepare('SELECT frontier FROM explorer_anchors WHERE network = ?').bind('arkade').first<{ frontier: string }>();
    const stored = JSON.parse(row!.frontier) as { txid: string; drift?: number }[];
    assert.deepEqual(stored.map(o => `${o.txid[0]}:${o.drift ?? 0}`), ['1:2', 'c:0'], 'the detour goes first, the commitment\'s own output last');
  });

  it('stores each output once when the newest commitment\'s change is spent by a transaction that is not one', async () => {
    // Every run queues N's change again and finds it spent by Y, whose
    // change the frontier already holds.
    await seedRow(N, 500, [{ txid: N, vout: 1, valueSats: 3_000_000 }]);
    for (let run = 0; run < 4; run++) {
      const report = await refreshArkadeAnchor(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE });
      assert.equal(report.anchor?.txid, N);
      const row = await env.ENTITY_DB.prepare('SELECT frontier FROM explorer_anchors WHERE network = ?').bind('arkade').first<{ frontier: string }>();
      assert.deepEqual(JSON.parse(row!.frontier), [{ txid: Y, vout: 1, valueSats: 2_900_000, drift: 1 }], `run ${run + 1}`);
    }
  });

  it('explores a spender that is not a commitment once, not again on every run', async () => {
    await seedRow(N, 500, [{ txid: N, vout: 1, valueSats: 3_000_000 }]);
    const asked = `${ARKADE}/v1/indexer/commitmentTx/${Y}`;
    const first = fakeFetch();
    assert.equal((await refreshArkadeAnchor(env, { fetch: first, esploraUrl: ESPLORA, arkadeUrl: ARKADE })).hops, 1);
    assert.ok(first.calls.includes(asked));
    // From then on N's change is still queued and found spent by Y, whose
    // outputs the frontier holds: no hop, no question to the indexer.
    for (let run = 0; run < 3; run++) {
      const f = fakeFetch();
      const report = await refreshArkadeAnchor(env, { fetch: f, esploraUrl: ESPLORA, arkadeUrl: ARKADE });
      assert.equal(report.hops, 0, `run ${run + 2}`);
      assert.ok(!f.calls.includes(asked));
      assert.ok(!f.calls.includes(`${ESPLORA}/tx/${Y}`));
    }
  });

  it('explores such a spender again when a path reaches it with less drift', async () => {
    // Y's change was stored at drift 2, reached through a longer detour; N's
    // change reaches Y at drift 1, from where the walk follows one hop more.
    await seedRow(N, 500, [{ txid: Y, vout: 1, valueSats: 2_900_000, drift: 2 }]);
    const report = await refreshArkadeAnchor(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE });
    assert.equal(report.hops, 1);
    const row = await env.ENTITY_DB.prepare('SELECT frontier FROM explorer_anchors WHERE network = ?').bind('arkade').first<{ frontier: string }>();
    assert.deepEqual(JSON.parse(row!.frontier), [{ txid: Y, vout: 1, valueSats: 2_900_000, drift: 1 }]);
  });

  it('keeps another line\'s output reached through a detour, run after run, under the frontier cap', async () => {
    // Before, Y's change piled up one copy per run and pushed K's out of the
    // twenty-four after about as many runs.
    await seedRow(N, 500, [{ txid: K, vout: 1, valueSats: 1_500_000, drift: 1 }, { txid: N, vout: 1, valueSats: 3_000_000 }]);
    for (let run = 0; run < 30; run++) {
      await refreshArkadeAnchor(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE });
    }
    const row = await env.ENTITY_DB.prepare('SELECT frontier FROM explorer_anchors WHERE network = ?').bind('arkade').first<{ frontier: string }>();
    const stored = JSON.parse(row!.frontier) as { txid: string; vout: number }[];
    assert.deepEqual(stored.map(o => `${o.txid[0]}:${o.vout}`), ['5:1', '6:1']);
  });

  it('stops the walk when only the listener\'s reserve of requests is left, keeping what it reached', async () => {
    await seedRow(S3, 300, [{ txid: S3, vout: 1, valueSats: 2_500_000 }]);
    // Enough for the outspends lookup and the first spender's transaction,
    // not for the indexer's answer about it: the walk stops there, and the
    // reserve stays for the listener.
    const budget = new RequestBudget(12);
    const report = await refreshArkadeAnchor(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE, budget });
    assert.equal(report.interrupted, true);
    assert.equal(report.failure, 'request budget spent');
    assert.equal(report.anchor?.txid, S3, 'the anchor stands');
    assert.equal(budget.left, 10, 'the reserve is untouched');
    // With the whole budget, the walk reaches the tip.
    const full = await refreshArkadeAnchor(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE, budget: new RequestBudget(45) });
    assert.equal(full.anchor?.txid, C2);
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

describe('commitmentTxidFromLine', () => {
  it('reads the commitment a stream line announces, wrapped by grpc-gateway or prefixed by an SSE proxy, and nothing else', () => {
    assert.equal(commitmentTxidFromLine(announce(M)), M);
    assert.equal(commitmentTxidFromLine(`data: ${announce(M)}`), M);
    assert.equal(commitmentTxidFromLine(JSON.stringify({ commitmentTx: { txid: M } })), M);
    assert.equal(commitmentTxidFromLine(JSON.stringify({ result: { arkTx: { txid: M } } })), null, 'an Ark transaction is not a commitment');
    assert.equal(commitmentTxidFromLine(JSON.stringify({ result: { commitmentTx: { txid: 'not-a-txid' } } })), null);
    assert.equal(commitmentTxidFromLine(''), null);
    assert.equal(commitmentTxidFromLine(': keep-alive'), null);
  });
});

describe('listenArkadeStream', () => {
  // Real time here: the listener's deadline and its reconnection pause are
  // measured against the same clock.
  const deps = (f: typeof fetch) => ({ fetch: f, esploraUrl: ESPLORA, arkadeUrl: ARKADE, reconnectMs: 5 });
  const frontierKeys = async () => {
    const row = await env.ENTITY_DB.prepare('SELECT frontier FROM explorer_anchors WHERE network = ?').bind('arkade').first<{ frontier: string }>();
    return (JSON.parse(row!.frontier) as { txid: string; vout: number }[]).map(o => `${o.txid[0]}:${o.vout}`).sort();
  };
  const candidates = async () => (await env.ENTITY_DB.prepare('SELECT txid FROM explorer_candidates').all<{ txid: string }>()).results.map(r => r.txid);

  it('adopts a confirmed commitment the stream announces: the anchor, and its change in the frontier', async () => {
    await seedRow(C2, 320, [{ txid: C2, vout: 1, valueSats: 2_200_000 }]);
    const f = fakeFetch({ stream: [announce(M)] });
    const report = await listenArkadeStream(env, Date.now() + 150, deps(f));
    assert.equal(report.heard, 1);
    assert.equal(report.adopted, 1);
    assert.equal(report.failure, undefined);
    assert.deepEqual((await readAnchors(env)).arkade, { txid: M, height: 600, timestamp: 1_790_000_600 });
    assert.deepEqual(await frontierKeys(), ['4:1', 'c:1'], 'the walk will follow M\'s change too');
    assert.deepEqual(await candidates(), [], 'nothing left waiting');
    assert.ok(f.calls.includes(`${ARKADE}/v1/indexer/commitmentTx/${M}`), 'the indexer confirmed it was a commitment');
  });

  it('keeps an unconfirmed commitment as a candidate and adopts it once the chain confirms it', async () => {
    await seedRow(C2, 320, [{ txid: C2, vout: 1, valueSats: 2_200_000 }]);
    const report = await listenArkadeStream(env, Date.now() + 150, deps(fakeFetch({ stream: [announce(P), announce(P)] })));
    assert.equal(report.heard, 1, 'announced twice, across a reconnection, counted once');
    assert.equal(report.adopted, 0);
    assert.equal((await readAnchors(env)).arkade?.txid, C2, 'the anchor waits for the confirmation');
    assert.deepEqual(await candidates(), [P]);
    // A later run finds it confirmed.
    const settled = await settleCandidates(env, { ...deps(fakeFetch({ pHeight: 700 })), now: () => 1_000 });
    assert.deepEqual(settled, { adopted: 1 });
    assert.deepEqual((await readAnchors(env)).arkade, { txid: P, height: 700, timestamp: 1_790_000_700 });
    assert.deepEqual(await frontierKeys(), ['a:1', 'c:1']);
    assert.deepEqual(await candidates(), []);
  });

  it('lets an older commitment heard join the frontier without moving the anchor', async () => {
    await seedRow(C2, 320, [{ txid: C2, vout: 1, valueSats: 2_200_000 }]);
    const report = await listenArkadeStream(env, Date.now() + 150, deps(fakeFetch({ stream: [announce(S1)] })));
    assert.equal(report.adopted, 1);
    assert.equal((await readAnchors(env)).arkade?.txid, C2);
    assert.deepEqual(await frontierKeys(), ['1:1', 'c:1']);
  });

  it('creates the row from a heard commitment when the walk has none yet', async () => {
    await listenArkadeStream(env, Date.now() + 150, deps(fakeFetch({ stream: [announce(M)] })));
    assert.deepEqual((await readAnchors(env)).arkade, { txid: M, height: 600, timestamp: 1_790_000_600 });
    assert.deepEqual(await frontierKeys(), ['4:1']);
  });

  it('reopens the stream when the operator closes it or refuses it, and stops at the deadline', async () => {
    const started = Date.now();
    const f = fakeFetch({ stream: ['', 524, 503] });
    const report = await listenArkadeStream(env, started + 200, deps(f));
    assert.ok(report.reconnects >= 3, `reopened ${report.reconnects} times`);
    assert.equal(report.failure, 'arkade.test stream answered 503');
    assert.equal(f.calls.filter(u => u === `${ARKADE}/v1/txs`).length, report.reconnects + 1);
    const elapsed = Date.now() - started;
    assert.ok(elapsed >= 190 && elapsed < 2_000, `listened for ${elapsed} ms`);
    // A quiet stretch the proxy ends with a 524 is reopened without a word.
    const quiet = await listenArkadeStream(env, Date.now() + 100, deps(fakeFetch({ stream: [524] })));
    assert.equal(quiet.failure, undefined);
    assert.ok(quiet.reconnects >= 1);
  });

  it('gives up on a stream that fails as soon as it opens, after three tries, naming the error', async () => {
    const f = fakeFetch({ streamDown: true });
    const report = await listenArkadeStream(env, Date.now() + 2_000, deps(f));
    assert.equal(report.reconnects, 2);
    assert.equal(f.calls.filter(u => u === `${ARKADE}/v1/txs`).length, 3);
    assert.equal(report.failure, 'arkade.test stream unreachable (TypeError: Too many subrequests.)');
  });

  it('does not open the stream without budget, and stops when the budget runs out', async () => {
    const f = fakeFetch();
    const report = await listenArkadeStream(env, Date.now() + 2_000, { ...deps(f), budget: new RequestBudget(0) });
    assert.deepEqual(report, { heard: 0, adopted: 0, reconnects: 0, failure: 'request budget spent' });
    assert.deepEqual(f.calls, []);
    const g = fakeFetch({ stream: ['', '', '', ''] });
    const budget = new RequestBudget(2);
    const two = await listenArkadeStream(env, Date.now() + 2_000, { ...deps(g), budget });
    assert.equal(g.calls.filter(u => u === `${ARKADE}/v1/txs`).length, 2);
    assert.equal(two.failure, 'request budget spent');
    assert.equal(budget.left, 0);
  });

  it('listens for nothing once the deadline has passed', async () => {
    const f = fakeFetch();
    const report = await listenArkadeStream(env, Date.now() - 1, deps(f));
    assert.deepEqual(report, { heard: 0, adopted: 0, reconnects: 0 });
    assert.deepEqual(f.calls, []);
  });
});

describe('settleCandidates', () => {
  const remember = (txid: string, seenAt: number) => env.ENTITY_DB.prepare('INSERT INTO explorer_candidates (network, txid, seen_at) VALUES (?, ?, ?)').bind('arkade', txid, seenAt).run();
  const candidates = async () => (await env.ENTITY_DB.prepare('SELECT txid FROM explorer_candidates').all<{ txid: string }>()).results.map(r => r.txid);

  it('forgets a confirmed transaction the indexer does not know as a commitment, and a stale candidate', async () => {
    await seedRow(C2, 320, [{ txid: C2, vout: 1, valueSats: 2_200_000 }]);
    const now = 8 * 24 * 60 * 60_000;
    await remember(W, now - 1_000);
    await remember(P, 0);
    const settled = await settleCandidates(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE, now: () => now });
    assert.deepEqual(settled, { adopted: 0 });
    assert.deepEqual(await candidates(), []);
    assert.equal((await readAnchors(env)).arkade?.txid, C2);
  });

  it('leaves the candidates for the next run when a lookup fails, and waits for one the chain does not know yet', async () => {
    await remember(M, 1_000);
    const down = await settleCandidates(env, { fetch: fakeFetch({ esploraDown: ESPLORA }), esploraUrl: ESPLORA, arkadeUrl: ARKADE, now: () => 2_000 });
    assert.deepEqual(down, { adopted: 0, failure: 'esplora.test unreachable' });
    assert.deepEqual(await candidates(), [M]);
    await remember(id('0'), 1_000);
    const unknown = await settleCandidates(env, { fetch: fakeFetch(), esploraUrl: ESPLORA, arkadeUrl: ARKADE, now: () => 2_000 });
    assert.deepEqual(unknown, { adopted: 1 }, 'M adopted, the unknown one kept');
    assert.deepEqual(await candidates(), [id('0')]);
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
