// The Monero pools that publish the blocks they found, and how each list
// reads. Dependency-free on purpose: the app reads these lists itself when
// it has no proxy (monero-pools.ts), and Alice's Worker reads them for every
// browser (apps/venice-proxy-worker/src/monero-pools.ts); both import this
// one table, so they can never name the same pool two ways. Adding a pool or
// fixing a changed format happens here only; `npm run check:monero-pools`
// tries every entry against the live API.

export type PoolApi = {
  name: string;
  url: (limit: number) => string;
  /** The block hashes in the answer. */
  hashes: (body: unknown) => string[];
};

function list(body: unknown): Record<string, unknown>[] {
  return Array.isArray(body) ? body.filter((b): b is Record<string, unknown> => !!b && typeof b === 'object') : [];
}

function hex64(v: unknown): string | null {
  return typeof v === 'string' && /^[0-9a-f]{64}$/i.test(v) ? v.toLowerCase() : null;
}

/** nodejs-pool, the software most Monero pools run: `[{ hash, height }]`. */
const nodejsPool = (body: unknown) => list(body).map(b => hex64(b.hash)).filter((h): h is string => !!h);

/** cryptonote-nodejs-pool's /stats: `pool.blocks` alternates
 *  "hash:time:…" strings and heights. */
const cryptonoteStats = (body: unknown) => {
  const blocks = (body as { pool?: { blocks?: unknown } })?.pool?.blocks;
  return Array.isArray(blocks)
    ? blocks.map(b => (typeof b === 'string' ? hex64(b.split(':')[0]) : null)).filter((h): h is string => !!h)
    : [];
};

export const MONERO_POOL_APIS: PoolApi[] = [
  { name: 'SupportXMR', url: n => `https://www.supportxmr.com/api/pool/blocks?limit=${n}`, hashes: nodejsPool },
  { name: 'MoneroOcean', url: n => `https://api.moneroocean.stream/pool/blocks?limit=${n}`, hashes: nodejsPool },
  { name: 'C3Pool', url: n => `https://api.c3pool.org/pool/blocks?limit=${n}`, hashes: nodejsPool },
  { name: 'HashVault', url: n => `https://api.hashvault.pro/v3/monero/pool/blocks?limit=${n}`, hashes: nodejsPool },
  {
    name: 'Nanopool',
    url: n => `https://api.nanopool.org/v1/xmr/pool/blocks/0/${n}`,
    hashes: body => list((body as { data?: unknown })?.data).map(b => hex64(b.hash)).filter((h): h is string => !!h),
  },
  { name: 'HeroMiners', url: () => 'https://monero.herominers.com/api/stats', hashes: cryptonoteStats },
  { name: 'xmrpool.eu', url: () => 'https://web.xmrpool.eu:8119/stats', hashes: cryptonoteStats },
];
