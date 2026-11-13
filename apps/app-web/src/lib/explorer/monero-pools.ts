import { t as tr } from '../../i18n/translate.ts';
// Who mined a Monero block. Unlike Bitcoin, where pools tag their coinbase
// with their name, a Monero coinbase names nobody. Two honest ways remain:
//
// - The pools that publish the blocks they found. Their public APIs answer
//   any origin; a block is attributed when one of them lists its hash (not
//   just its height, so an orphan never steals a name).
// - P2Pool, the decentralised pool, whose coinbase has a shape of its own:
//   a 4-byte nonce, a merge-mining tag, and one output per miner of its
//   window, dozens where a classic pool pays itself once.
//
// The pools' table is monero-pool-apis.ts, shared with the Worker.
//
// Everything else stays unattributed, as it is on the chain: solo miners,
// pools without a public list, and Qubic, which mines a large share of
// blocks since 2025 without publishing them. Those blocks can still be
// grouped by the layout of their coinbase, without a name. The lists are read
// at most every five minutes and shared by every view; a pool that fails is
// skipped, and reported as such so its silence is never read as no blocks.

import { proxyBaseUrl } from './entity-remote.ts';
import { MONERO_POOL_APIS, type PoolApi } from './monero-pool-apis.ts';

export { MONERO_POOL_APIS } from './monero-pool-apis.ts';

// P2Pool's coinbase extra: the transaction key, a 4-byte nonce, then a
// 33-byte merge-mining tag, 74 bytes in all.
const P2POOL_EXTRA = /^01[0-9a-f]{64}0204[0-9a-f]{8}0321[0-9a-f]{66}$/;
// One output per miner makes the coinbase large; a classic pool's, paying
// itself once, is about 100 to 200 bytes.
const P2POOL_MIN_COINBASE_BYTES = 600;

/** "P2Pool" when a coinbase has P2Pool's shape, else null. */
export function poolFromCoinbase(extraHex: string | undefined, coinbaseBytes: number): string | null {
  if (!extraHex) return null;
  return P2POOL_EXTRA.test(extraHex.toLowerCase()) && coinbaseBytes >= P2POOL_MIN_COINBASE_BYTES ? 'P2Pool' : null;
}

/**
 * The layout of a coinbase's extra field, without its values: which fields
 * come in which order, and how long the variable ones are ("key nonce8",
 * "mm33 key nonce17"). Each mining software writes its own, so blocks with
 * the same layout likely come from the same miner, or at least from the same
 * software. It never names anyone: several pools run the same software.
 */
export function coinbaseTemplate(extraHex: string | undefined): string | null {
  if (!extraHex || !/^(?:[0-9a-f]{2})+$/i.test(extraHex)) return null;
  const b = extraHex.toLowerCase().match(/../g)!.map(x => parseInt(x, 16));
  const parts: string[] = [];
  let i = 0;
  const varint = (): number | null => {
    let n = 0;
    let shift = 0;
    while (i < b.length && shift < 35) {
      const v = b[i++];
      n += (v & 0x7f) * 2 ** shift;
      if ((v & 0x80) === 0) return n;
      shift += 7;
    }
    return null;
  };
  while (i < b.length) {
    const tag = b[i++];
    if (tag === 0x00) { parts.push(`pad${b.length - i + 1}`); break; }
    if (tag === 0x01) { parts.push('key'); i += 32; continue; }
    if (tag === 0x02 || tag === 0x03 || tag === 0xde) {
      const len = tag === 0x02 ? b[i++] : varint();
      if (len === undefined || len === null) { parts.push('cut'); break; }
      parts.push(`${tag === 0x02 ? 'nonce' : tag === 0x03 ? 'mm' : 'blob'}${len}`);
      i += len;
      continue;
    }
    if (tag === 0x04) {
      const n = varint();
      parts.push(`keys${n ?? '?'}`);
      i += (n ?? 0) * 32;
      continue;
    }
    parts.push(`tag${tag}`);
    break;
  }
  return parts.join(' ');
}

const REFRESH_MS = 5 * 60_000;
const LIMIT = 100;

/** Why a pool's list named nothing on the last read. */
export type MoneroPoolListFailure =
  | 'timeout'   // no answer within 10 seconds
  | 'http'      // the server answered with an error code
  | 'format'    // an answer without a single block hash: the API changed
  | 'blocked';  // the request never got an answer: refused by the browser
                // (an extension, a DNS filter, a missing CORS header) or
                // the network; a page cannot tell these apart

/** How each pool's list answered on the last read. */
export type MoneroPoolListStatus = {
  name: string;
  ok: boolean;
  blocks: number;
  failure?: MoneroPoolListFailure;
  /** The HTTP status, for an 'http' failure. */
  status?: number;
};
export type MoneroPoolLists = {
  byHash: Map<string, string>;
  lists: MoneroPoolListStatus[];
  readAt: number;
  /** Where the lists came from: Alice's Worker, which reads them for every
   *  browser, or the pools themselves. */
  source: 'worker' | 'direct';
};

let cached: MoneroPoolLists | null = null;
let inFlight: Promise<MoneroPoolLists> | null = null;
/** After a failed read, the lists are read again sooner. */
const RETRY_FAILED_MS = 60_000;

type PoolRead = { hashes: string[]; failure?: MoneroPoolListFailure; status?: number };

async function readPoolOnce(api: PoolApi): Promise<PoolRead> {
  const timeout = AbortSignal.timeout(10_000);
  try {
    const res = await fetch(api.url(LIMIT), { signal: timeout, headers: { Accept: 'application/json' } });
    if (!res.ok) return { hashes: [], failure: 'http', status: res.status };
    const hashes = api.hashes(await res.json());
    // An answer without a single block hash is a list whose format changed
    // (or a pool that stopped mining): either way, it names nothing.
    return hashes.length > 0 ? { hashes } : { hashes, failure: 'format' };
  } catch {
    return { hashes: [], failure: timeout.aborted ? 'timeout' : 'blocked' };
  }
}

async function readPool(api: PoolApi): Promise<PoolRead> {
  const first = await readPoolOnce(api);
  if (!first.failure || first.failure === 'format') return first;
  // One more try for a passing hiccup; a blocked request fails again at once.
  await new Promise(r => setTimeout(r, 1500));
  return readPoolOnce(api);
}

/** The Worker's answer (GET /explorer/monero-pools, see the Worker's
 *  monero-pools.ts), or null without a proxy, when it does not answer or
 *  when its answer is malformed. One request, to a host the app already
 *  talks to, that says nothing about what is looked at. */
async function readFromWorker(): Promise<Omit<MoneroPoolLists, 'source'> | null> {
  const base = proxyBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/explorer/monero-pools`, { signal: AbortSignal.timeout(8_000), headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const body = await res.json() as { blocks?: unknown; lists?: unknown };
    if (!body || typeof body.blocks !== 'object' || body.blocks === null || !Array.isArray(body.lists)) return null;
    const byHash = new Map<string, string>();
    for (const [h, n] of Object.entries(body.blocks as Record<string, unknown>)) {
      if (/^[0-9a-f]{64}$/.test(h) && typeof n === 'string') byHash.set(h, n);
    }
    const known = new Set<string>(MONERO_POOL_APIS.map(p => p.name));
    const lists: MoneroPoolListStatus[] = [];
    for (const l of body.lists as Record<string, unknown>[]) {
      if (!l || typeof l.name !== 'string' || !known.has(l.name)) continue;
      const failure = l.failure === 'timeout' || l.failure === 'http' || l.failure === 'format' ? l.failure
        : l.failure === 'unreachable' ? 'blocked' : undefined;
      lists.push({
        name: l.name,
        ok: l.ok === true,
        blocks: typeof l.blocks === 'number' ? l.blocks : 0,
        ...(l.ok !== true ? { failure: failure ?? 'blocked' } : {}),
        ...(typeof l.status === 'number' ? { status: l.status } : {}),
      });
    }
    if (lists.length === 0) return null;
    return { byHash, lists, readAt: Date.now() };
  } catch {
    return null;
  }
}

async function readDirect(): Promise<Omit<MoneroPoolLists, 'source'>> {
  const results = await Promise.all(MONERO_POOL_APIS.map(readPool));
  const byHash = new Map<string, string>();
  results.forEach((r, k) => { for (const h of r.hashes) byHash.set(h, MONERO_POOL_APIS[k].name); });
  return {
    byHash,
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

/** Every pool's list at once, with which ones answered and why the others
 *  did not: from Alice's Worker when a proxy is configured, else from the
 *  pools themselves. Never throws: a pool that does not answer simply names
 *  nothing, and says so. */
export function getMoneroPoolLists(): Promise<MoneroPoolLists> {
  const fresh = cached && Date.now() - cached.readAt < (cached.lists.every(l => l.ok) ? REFRESH_MS : RETRY_FAILED_MS);
  if (cached && fresh) return Promise.resolve(cached);
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const fromWorker = await readFromWorker();
    const read = fromWorker ?? await readDirect();
    // A pool that failed this round keeps the names it gave last time.
    for (const [h, n] of cached?.byHash ?? []) if (!read.byHash.has(h)) read.byHash.set(h, n);
    cached = { ...read, source: fromWorker ? 'worker' : 'direct' };
    return cached;
  })().finally(() => { inFlight = null; });
  return inFlight;
}

/** The Explorer's words for why a list named nothing. */
export function poolListFailureLabel(l: MoneroPoolListStatus): string {
  switch (l.failure) {
    case 'timeout': return tr('explorerMonero.pool.timeout');
    case 'http': return tr('explorerMonero.pool.http', { status: l.status ?? '?' });
    case 'format': return tr('explorerMonero.pool.format');
    case 'blocked': return tr('explorerMonero.pool.blocked');
    default: return tr('explorerMonero.pool.blocks', { count: l.blocks });
  }
}

/** Block hash -> the pool that published it. */
export async function getMoneroPoolBlocks(): Promise<Map<string, string>> {
  return (await getMoneroPoolLists()).byHash;
}

/** For the tests: forget what was read. */
export function resetMoneroPoolCache(): void {
  cached = null;
  inFlight = null;
}

export type MoneroMinerShare = {
  /** The pools named, most blocks first. */
  named: { name: string; blocks: number }[];
  /** Unnamed blocks sharing a coinbase layout, two blocks or more, largest
   *  first, lettered A, B, C… The pools named in the same window with that
   *  layout are listed: same software, not proof of the same miner. */
  unidentified: { template: string; blocks: number; sameLayoutAs: string[] }[];
  /** Unnamed blocks whose layout no other block in the window shares. */
  other: number;
  total: number;
};

/** Who mined a window of blocks: the pools named, then the unnamed blocks
 *  grouped by the layout of their coinbase. */
export function summarizeMoneroMiners(
  blocks: { hash: string; poolName?: string; coinbaseExtra?: string }[],
  byHash: ReadonlyMap<string, string>,
): MoneroMinerShare {
  const named = new Map<string, number>();
  const layoutOfPools = new Map<string, Set<string>>();
  const unnamed = new Map<string, number>();
  let other = 0;
  for (const b of blocks) {
    const name = byHash.get(b.hash) ?? b.poolName;
    const template = coinbaseTemplate(b.coinbaseExtra);
    if (name) {
      named.set(name, (named.get(name) ?? 0) + 1);
      if (template) layoutOfPools.set(template, (layoutOfPools.get(template) ?? new Set()).add(name));
    } else if (template) {
      unnamed.set(template, (unnamed.get(template) ?? 0) + 1);
    } else {
      other += 1;
    }
  }
  const groups = [...unnamed.entries()].sort((x, y) => y[1] - x[1]);
  const unidentified: MoneroMinerShare['unidentified'] = [];
  for (const [template, n] of groups) {
    if (n < 2) { other += n; continue; }
    unidentified.push({
      template,
      blocks: n,
      sameLayoutAs: [...(layoutOfPools.get(template) ?? [])].sort(),
    });
  }
  return {
    named: [...named.entries()].map(([name, n]) => ({ name, blocks: n })).sort((x, y) => y.blocks - x.blocks),
    unidentified,
    other,
    total: blocks.length,
  };
}
