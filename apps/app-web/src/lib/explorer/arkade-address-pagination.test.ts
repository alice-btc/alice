// getArkadeAddressVtxos against a scripted indexer: the real @arkade-os/sdk
// runs (address decoding, REST provider, response validation, wire conversion)
// and only the global fetch is replaced, then restored after every test. The
// tests in this file run one after the other and share no state.
//
// The server pages like arkd does (see arkade-indexer-fixture.ts): 1-based
// pages, page.index=0 meaning page 1, a page size of its own when the client
// names none, `page` = { current, next, total }. Nothing here depends on the
// page size the client picks, so the tests stay valid when the SDK changes its
// own paging (0.4.39 asks for one unsized page; 0.4.79 pages by 500 itself).

import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { ArkadeError, arkadeStateOf, getArkadeAddressVtxos, type ArkadeAddressInfo } from './arkade.ts';
import { arkadeAddressContext } from './layer-context.ts';
import {
  ARKADE_TEST_ADDRESS, ARKADE_TEST_BASE, ARKADE_TEST_SCRIPT,
  expectedTotals, fakeIndexer, mixedWireVtxos, outpointKey, wireVtxo, wireTxid,
  type FakeIndexer, type WireVtxo,
} from './arkade-indexer-fixture.ts';

let server: FakeIndexer | null = null;
afterEach(() => { server?.restore(); server = null; });

function serve(...args: Parameters<typeof fakeIndexer>): FakeIndexer {
  server = fakeIndexer(...args);
  server.install();
  return server;
}

const isAbort = (err: unknown): boolean => (err as { name?: string })?.name === 'AbortError';

/** The page must be the whole answer: same coins, same flags, same balance. */
function assertWholeAnswer(info: ArkadeAddressInfo, wire: readonly WireVtxo[]): void {
  assert.equal(info.address, ARKADE_TEST_ADDRESS);
  assert.equal(info.scriptHex, ARKADE_TEST_SCRIPT);
  const keys = info.vtxos.map(outpointKey);
  assert.equal(new Set(keys).size, keys.length, 'no coin is listed twice');
  assert.deepEqual([...keys].sort(), wire.map(w => outpointKey({ txid: w.outpoint.txid, vout: w.outpoint.vout })).sort(), 'every coin, no other');

  const byKey = new Map(info.vtxos.map(v => [outpointKey(v), v]));
  for (const w of wire) {
    const v = byKey.get(outpointKey({ txid: w.outpoint.txid, vout: w.outpoint.vout }))!;
    assert.equal(v.amountSats, Number(w.amount), `amount of ${w.outpoint.txid.slice(-6)}`);
    assert.equal(v.isSpent, w.isSpent, `spent flag of ${w.outpoint.txid.slice(-6)}`);
    assert.equal(v.isSwept, w.isSwept, `swept flag of ${w.outpoint.txid.slice(-6)}`);
    assert.equal(v.isPreconfirmed, w.isPreconfirmed, `preconfirmed flag of ${w.outpoint.txid.slice(-6)}`);
  }

  const want = expectedTotals(wire);
  assert.equal(info.totalCount, want.totalCount);
  assert.equal(info.vtxos.length, want.totalCount);
  assert.equal(info.spendableCount, want.spendableCount);
  assert.equal(info.spendableSats, want.spendableSats);
}

function assertWellFormedRequests(s: FakeIndexer): void {
  assert.deepEqual(s.unexpected, [], 'only GET /v1/indexer/vtxos is called');
  assert.ok(s.requests.length > 0);
  for (const r of s.requests) {
    assert.deepEqual(r.url.searchParams.getAll('scripts'), [ARKADE_TEST_SCRIPT], 'the address script is queried');
    assert.equal(r.url.origin, ARKADE_TEST_BASE);
    // An explorer shows every coin of the address, spent ones included.
    for (const filter of ['spendableOnly', 'spentOnly', 'recoverableOnly', 'pendingOnly', 'renewableOnly']) {
      assert.equal(r.url.searchParams.has(filter), false, `no ${filter} filter`);
    }
    assert.equal(r.beyondLastPage, false, `page ${r.page} does not exist and must not be asked`);
  }
}

describe('the scripted indexer, seen by the real SDK', () => {
  it('serves wire VTXOs and a page cursor the SDK accepts (guards the fixture against SDK changes)', async () => {
    const wire = mixedWireVtxos(7);
    serve({ vtxos: wire });
    const { RestIndexerProvider } = await import('@arkade-os/sdk');
    const indexer = new RestIndexerProvider(ARKADE_TEST_BASE);
    const first = await indexer.getVtxos({ scripts: [ARKADE_TEST_SCRIPT], pageIndex: 0, pageSize: 3 });
    assert.equal(first.vtxos.length, 3);
    assert.deepEqual(first.page, { current: 1, next: 2, total: 3 });
    const last = await indexer.getVtxos({ scripts: [ARKADE_TEST_SCRIPT], pageIndex: 3, pageSize: 3 });
    assert.equal(last.vtxos.length, 1);
    assert.deepEqual(last.page, { current: 3, next: 3, total: 3 });
  });
});

describe('getArkadeAddressVtxos pages to the end', () => {
  it('reads all three pages of 1200 coins: spent, swept, preconfirmed, exact balance and count', async () => {
    const wire = mixedWireVtxos(1200);
    const s = serve({ vtxos: wire });
    const info = await getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS);
    assertWholeAnswer(info, wire);
    assertWellFormedRequests(s);
    // The first page alone could not hold them: a client that stopped there is wrong.
    assert.ok(s.requests.length > 1, 'more than one page was read');
    assert.ok(info.vtxos.some(v => v.isSpent) && info.vtxos.some(v => v.isSwept) && info.vtxos.some(v => v.isPreconfirmed));
  });

  it('stops by the server cursor when the last page is full (1000 coins), without asking for a page beyond it', async () => {
    const wire = mixedWireVtxos(1000);
    const s = serve({ vtxos: wire });
    const info = await getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS);
    assertWholeAnswer(info, wire);
    assertWellFormedRequests(s);
    const lastPage = Math.max(...s.requests.map(r => r.page));
    assert.equal(lastPage, Math.ceil(1000 / s.requests[0].size), 'the last full page was read, and none after it');
    assert.equal(new Set(s.requests.map(r => r.page)).size, s.requests.length, 'no page is read twice');
  });

  it('reads a single short page as it is', async () => {
    const wire = mixedWireVtxos(3);
    const s = serve({ vtxos: wire });
    assertWholeAnswer(await getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS), wire);
    assertWellFormedRequests(s);
    assert.equal(s.requests.length, 1);
  });

  it('answers an empty address with nothing, whether the indexer sends a page object or not', async () => {
    for (const pageMode of ['paged', 'omitted'] as const) {
      const s = serve({ vtxos: [], pageMode });
      const info = await getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS);
      assert.equal(info.totalCount, 0, pageMode);
      assert.equal(info.spendableCount, 0, pageMode);
      assert.equal(info.spendableSats, 0, pageMode);
      assert.deepEqual(info.vtxos, [], pageMode);
      assert.equal(s.requests.length, 1, `${pageMode}: nothing to page`);
      s.restore();
    }
  });
});

describe('getArkadeAddressVtxos never answers a partial balance', () => {
  it('fails when page 2 is refused by the indexer, instead of returning page 1 as the balance', async () => {
    const s = serve({ vtxos: mixedWireVtxos(1200), failOnPage: { page: 2, mode: 'http-400' } });
    await assert.rejects(getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS), (err: unknown) => err instanceof ArkadeError);
    assert.ok(s.requests.some(r => r.page === 2), 'page 2 was asked');
  });

  it('fails when page 2 is unreachable, instead of returning page 1 as the balance', async () => {
    const s = serve({ vtxos: mixedWireVtxos(1200), failOnPage: { page: 2, mode: 'network' } });
    await assert.rejects(getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS), (err: unknown) => err instanceof ArkadeError);
    assert.ok(s.requests.some(r => r.page === 2), 'page 2 was asked');
  });
});

describe('getArkadeAddressVtxos follows the abort signal', () => {
  it('does not call the indexer when the request is already cancelled', async () => {
    const s = serve({ vtxos: mixedWireVtxos(1200) });
    const ac = new AbortController();
    ac.abort();
    await assert.rejects(getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS, { signal: ac.signal }), isAbort);
    assert.equal(s.requests.length, 0);
  });

  it('stops reading pages once cancelled between two of them, and answers no partial balance', async () => {
    const ac = new AbortController();
    const s = serve({
      vtxos: mixedWireVtxos(1200),
      onRequest: req => { if (req.page === 2) ac.abort(); },
    });
    await assert.rejects(getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS, { signal: ac.signal }), isAbort);
    assert.ok(s.requests.every(r => r.page <= 2), 'page 3 is not asked after the cancellation');
  });
});

describe('getArkadeAddressVtxos refuses a cursor it cannot trust, never answering a partial balance', () => {
  const bad: Array<[string, (req: { page: number }, honest: { current: number; next: number; total: number }) => unknown]> = [
    ['a cursor that stays on the same page while more remain', (_r, h) => ({ ...h, next: h.current < h.total ? h.current : h.next })],
    ['a cursor that goes back', (_r, h) => ({ ...h, next: h.current < h.total ? h.current - 1 : h.next })],
    ['a cursor that skips an unread page', (_r, h) => ({ ...h, next: h.current < h.total ? h.current + 2 : h.next })],
    ['a cursor that jumps past the last page', (_r, h) => ({ ...h, next: h.current < h.total ? h.total + 1 : h.next })],
    ['a page that is not the one asked for', (r, h) => ({ ...h, current: r.page === 2 ? 1 : h.current })],
    ['a current page beyond the total', (_r, h) => ({ ...h, current: h.total + 1 })],
    ['a missing cursor on a full page', (r, h) => (r.page === 1 ? undefined : h)],
  ];
  for (const [name, pageOverride] of bad) {
    it(`fails on ${name}`, async () => {
      const s = serve({ vtxos: mixedWireVtxos(1200), pageOverride });
      await assert.rejects(getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS), (err: unknown) => err instanceof ArkadeError);
      assert.ok(s.requests.length <= 3, 'it does not keep asking');
    });
  }

  it('fails when a coin comes twice (the address moved while it was read)', async () => {
    const wire = mixedWireVtxos(3);
    serve({ vtxos: [...wire, wire[0]] });
    await assert.rejects(getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS), (err: unknown) => err instanceof ArkadeError);
  });
});

describe('getArkadeAddressVtxos when the cancelled request is still in flight', () => {
  it('releases the caller at once, then asks for no other page and publishes nothing', { timeout: 5000 }, async () => {
    const ac = new AbortController();
    let release: () => void = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    const s = serve({ vtxos: mixedWireVtxos(1200), hold: req => (req.page === 2 ? held : Promise.resolve()) });
    const pending = getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS, { signal: ac.signal });
    // Wait until page 2 is under way, then cancel: the HTTP request itself is
    // not cancelled (the SDK takes no signal), only the wait for it.
    while (!s.requests.some(r => r.page === 2)) await new Promise(r => setTimeout(r, 1));
    ac.abort();
    await assert.rejects(pending, isAbort);
    release();
    await new Promise(r => setTimeout(r, 20));
    assert.ok(s.requests.every(r => r.page <= 2), 'page 3 is never asked');
  });
});

describe('getArkadeAddressVtxos carries the expiry through the real SDK conversion', () => {
  it('keeps a date as a date, a block height as a height, and reads 0 or null as unknown', async () => {
    const wire = [
      wireVtxo({ n: 1, expiresAt: '1789357275' }),
      wireVtxo({ n: 2, expiresAt: '850123' }),
      wireVtxo({ n: 3, expiresAt: null }),
      wireVtxo({ n: 4, expiresAt: '0' }),
    ];
    serve({ vtxos: wire });
    const info = await getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS);
    const by = (n: number) => info.vtxos.find(v => v.txid === wireTxid(n))! as { expiresAt?: number; expiresAtHeight?: number };

    assert.equal(by(1).expiresAt, 1_789_357_275);
    assert.equal(by(1).expiresAtHeight, undefined);

    assert.equal(by(2).expiresAtHeight, 850_123);
    assert.equal(by(2).expiresAt, undefined, 'a height is not a date in January 1970');

    for (const n of [3, 4]) {
      assert.equal(by(n).expiresAt, undefined, `coin ${n}: no expiry is not epoch 0`);
      assert.equal(by(n).expiresAtHeight, undefined, `coin ${n}: no expiry is not block 0`);
    }
  });
});

// The SDK comment on the server: it "answers with one page of its own
// choosing", and may serve fewer than asked. Reading a short page as the last
// one would then drop coins; the cursor in `page` is the only reliable end.
// This needs the caller to drive the cursor itself (explicit page index and
// size), which also is what makes the two abort tests above possible.
describe('getArkadeAddressVtxos when the server serves smaller pages than asked', () => {
  it('follows the cursor to the end rather than taking a short page for the last', async () => {
    const wire = mixedWireVtxos(250);
    const s = serve({ vtxos: wire, maxPageSize: 100 });
    const info = await getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS);
    assertWholeAnswer(info, wire);
    assertWellFormedRequests(s);
    assert.deepEqual([...new Set(s.requests.map(r => r.page))].sort(), [1, 2, 3]);
  });
});

describe('canonical states through the real SDK', () => {
  it('retains simultaneous spent, swept and preconfirmed facts without counting the coin as spendable', async () => {
    serve({ vtxos: [wireVtxo({ isSpent: true, isSwept: true, isPreconfirmed: true })] });
    const info = await getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS);
    assert.equal(info.vtxos[0].isSpent, true);
    assert.equal(info.vtxos[0].isSwept, true);
    assert.equal(info.vtxos[0].isPreconfirmed, true);
    assert.equal(info.spendableSats, 0);
  });

  it('names such a coin spent in the Ask Alice context, as SDK 0.4.39 did through virtualStatus.state', async () => {
    serve({ vtxos: [wireVtxo({ isSpent: true, isSwept: true, isPreconfirmed: true, spentBy: 'd'.repeat(64) })] });
    const info = await getArkadeAddressVtxos(ARKADE_TEST_BASE, ARKADE_TEST_ADDRESS);
    assert.equal(arkadeStateOf(info.vtxos[0]), 'spent');
    const text = arkadeAddressContext(info).full.description;
    assert.match(text, /1,000 sats, spent,/);
    assert.ok(!text.includes('swept by the operator'));
  });
});
