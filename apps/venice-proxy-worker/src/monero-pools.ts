// The Monero pool lists, read by the Worker for every browser at once.
//
// A Monero block names no miner; the Explorer names a block's pool when that
// pool lists the block among those it found. Read from a browser, those
// seven lists fail two ways: privacy extensions and DNS filters often block
// mining pools' domains, and each pool sees the user's address. Read here,
// the pools see Alice's server only, and the browser makes one request to a
// host it already talks to. The answer is the same for everyone and says
// nothing about what anyone looks at, so it is public and cached.
//
// The table of pools and their formats is the app's (monero-pool-apis.ts
// in apps/app-web), imported rather than copied: the app still reads the lists
// itself when no proxy is configured or this route does not answer, and the
// two must name the same pools the same way.

import { MONERO_POOL_APIS } from '../../app-web/src/lib/explorer/monero-pool-apis.ts';

/** How long an answer is served from the cache: the pools find a few blocks
 *  an hour, and a name landing five minutes late costs nothing. */
export const MONERO_POOLS_MAX_AGE_SECONDS = 300;
const LIMIT = 100;
const TIMEOUT_MS = 10_000;

export type PoolListFailure = 'timeout' | 'http' | 'format' | 'unreachable';

export type MoneroPoolsAnswer = {
  /** Block hash -> the pool that listed it. */
  blocks: Record<string, string>;
  /** Each list, in the app's order, and how it answered. */
  lists: { name: string; ok: boolean; blocks: number; failure?: PoolListFailure; status?: number }[];
  /** When the lists were read, milliseconds since the epoch. */
  readAt: number;
};

async function readOne(api: (typeof MONERO_POOL_APIS)[number], fetchImpl: typeof fetch): Promise<{ hashes: string[]; failure?: PoolListFailure; status?: number }> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const res = await fetchImpl(api.url(LIMIT), { signal: timeout, headers: { Accept: 'application/json' } });
    if (!res.ok) return { hashes: [], failure: 'http', status: res.status };
    const hashes = api.hashes(await res.json());
    return hashes.length > 0 ? { hashes } : { hashes, failure: 'format' };
  } catch {
    return { hashes: [], failure: timeout.aborted ? 'timeout' : 'unreachable' };
  }
}

/** Every pool list, read at once. Never throws: a pool that fails names
 *  nothing and says why. */
export async function readMoneroPools(fetchImpl: typeof fetch = fetch): Promise<MoneroPoolsAnswer> {
  const results = await Promise.all(MONERO_POOL_APIS.map(api => readOne(api, fetchImpl)));
  const blocks: Record<string, string> = {};
  results.forEach((r, k) => { for (const h of r.hashes) blocks[h] = MONERO_POOL_APIS[k].name; });
  return {
    blocks,
    lists: results.map((r, k) => ({
      name: MONERO_POOL_APIS[k].name,
      ok: !r.failure,
      blocks: r.hashes.length,
      ...(r.failure ? { failure: r.failure } : {}),
      ...(r.status !== undefined ? { status: r.status } : {}),
    })),
    readAt: Date.now(),
  };
}

/**
 * The route's answer, from the edge cache when it has one less than five
 * minutes old. The cache is keyed by the route alone: the answer is the same
 * whoever asks. Outside the Workers runtime (the tests), there is no cache
 * and every call reads the lists.
 */
export async function moneroPoolsResponse(request: Request, cors: Record<string, string>, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const key = new Request(new URL('/explorer/monero-pools', request.url).toString(), { method: 'GET' });
  const hit = cache ? await cache.match(key).catch(() => undefined) : undefined;
  const body = hit ? await hit.text() : JSON.stringify(await readMoneroPools(fetchImpl));
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': `public, max-age=${MONERO_POOLS_MAX_AGE_SECONDS}`,
  };
  if (cache && !hit) await cache.put(key, new Response(body, { status: 200, headers })).catch(() => undefined);
  return new Response(body, { status: 200, headers: { ...headers, ...cors } });
}
