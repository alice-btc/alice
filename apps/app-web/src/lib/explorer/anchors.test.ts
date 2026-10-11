import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { coerceAnchors, fetchExplorerAnchors } from './anchors.ts';

const txid = 'ab'.repeat(32);

describe('coerceAnchors', () => {
  it('keeps well-formed anchors and drops the rest', () => {
    assert.deepEqual(coerceAnchors({ arkade: { txid, height: 970_000, timestamp: 1_790_000_000.7 }, bark: { txid: 'nope' }, updatedAt: 5 }), {
      arkade: { txid, height: 970_000, timestamp: 1_790_000_000 },
      updatedAt: 5,
    });
    assert.equal(coerceAnchors({ arkade: { txid, height: -1, timestamp: 1 } }), null);
    assert.equal(coerceAnchors({ arkade: { txid: txid.toUpperCase(), height: 1, timestamp: 1 } }), null, 'txids are lower-case hex');
    assert.equal(coerceAnchors(null), null);
    assert.equal(coerceAnchors('x'), null);
  });
});

describe('fetchExplorerAnchors', () => {
  it('asks the Worker once, anonymously, and reads its answer', async () => {
    const seen: string[] = [];
    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      seen.push(`${init?.method ?? 'GET'} ${String(input)}`);
      return new Response(JSON.stringify({ arkade: { txid, height: 1, timestamp: 2 } }), { status: 200 });
    }) as typeof fetch;
    const a = await fetchExplorerAnchors({ base: 'https://proxy.test/', fetchImpl });
    assert.deepEqual(a, { arkade: { txid, height: 1, timestamp: 2 } });
    assert.deepEqual(seen, ['GET https://proxy.test/explorer/anchors']);
  });

  it('answers null without a proxy, on an error status and on a network failure', async () => {
    assert.equal(await fetchExplorerAnchors({ base: '' }), null);
    const down = (async () => new Response('nope', { status: 503 })) as typeof fetch;
    assert.equal(await fetchExplorerAnchors({ base: 'https://proxy.test', fetchImpl: down }), null);
    const broken = (async () => { throw new TypeError('offline'); }) as typeof fetch;
    assert.equal(await fetchExplorerAnchors({ base: 'https://proxy.test', fetchImpl: broken }), null);
  });
});
