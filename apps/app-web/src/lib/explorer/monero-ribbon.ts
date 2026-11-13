import { t, formatLocale } from '../../i18n/translate.ts';
// Monero in the Explorer's own shapes: the live block ribbon and the block
// map read Monero blocks and the mempool through the same calls as Bitcoin's
// (getRecentBlocks, getMempoolBlocks, getBlock, getBlockSummary), with fees in
// piconero per byte.
//
// What a Monero block shows maps cleanly: every transaction's fee and size
// are public, so a block has a median fee and a fee spread like a Bitcoin
// one. Only the values are hidden, and the map says so. The mempool has no
// projection service: the waiting transactions are sorted by fee per byte
// and packed into blocks of the penalty-free size, which is what a miner's
// template does.

import { heatColor, type ChainScale } from './blocks.ts';
import type { BlockTxSummary, NormalizedBlock, ProjectedBlock } from './types.ts';
import type { RequestOptions } from './provider.ts';
import { getMoneroBlock, getMoneroBlocksPage, getMoneroMempool, type MoneroBlockSummary, type MoneroTxSummary } from './monero.ts';
import { getMoneroPoolBlocks } from './monero-pools.ts';

/** The size a block can reach without its miner losing reward: the median
 *  of recent blocks, never less than 300 kB. Blocks have sat at that floor
 *  for years, so it stands for a full block. */
export const MONERO_FULL_BLOCK_BYTES = 300_000;
/** The lowest fee a node relays today, piconero per byte. */
export const MONERO_MIN_FEE_PER_BYTE = 20_000;

/** "20k pico/B": fees per byte in piconero, which run in the tens of
 *  thousands. */
export function formatPicoRate(n: number): string {
  const unit = t('explorerMonero.picoUnit');
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString(formatLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M ${unit}`;
  if (n >= 1000) return `${Math.round(n / 1000)}k ${unit}`;
  return `${Math.round(n)} ${unit}`;
}

// Heat tiers by multiple of the minimum fee: wallets offer 4 priorities, at
// about 1, 4, 16 and 200 times it (the node's get_fee_estimate tiers).
const TIER_MULTIPLES = [1.2, 3, 6, 15, 40, 200];

function moneroTier(rate: number): number {
  const m = rate / MONERO_MIN_FEE_PER_BYTE;
  const i = TIER_MULTIPLES.findIndex(t => m <= t);
  return i === -1 ? TIER_MULTIPLES.length : i;
}

export const MONERO_SCALE: ChainScale = {
  rate: formatPicoRate,
  range: feeRange => {
    if (!feeRange || feeRange.length === 0) return null;
    const lo = feeRange[0];
    const hi = feeRange[feeRange.length - 1];
    return Math.round(lo / 1000) === Math.round(hi / 1000) ? formatPicoRate(hi) : `${formatPicoRate(lo).replace(` ${t('explorerMonero.picoUnit')}`, '')} - ${formatPicoRate(hi)}`;
  },
  color: n => (n === undefined || n <= 0 ? 'var(--alice-muted)' : heatColor(moneroTier(n))),
  colorHex: n => (n > 0 ? heatColor(moneroTier(n)) : '#3a5578'),
  blockMinutes: 2,
  capacity: MONERO_FULL_BLOCK_BYTES,
  get sizeUnit() { return t('explorerMonero.byteUnit'); },
  showsValue: false,
  estimatedProjection: true,
};

function feeRate(t: MoneroTxSummary): number {
  return t.size > 0 ? Number(t.fee) / t.size : 0;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

/** The fee picture of a set of transactions: the median, and the spread
 *  from lowest to highest (with the quartiles between). */
function feeStats(txs: MoneroTxSummary[]): { medianFee?: number; feeRange?: number[] } {
  const rates = txs.filter(t => !t.coinbase).map(feeRate).sort((a, b) => a - b);
  if (rates.length === 0) return {};
  return {
    medianFee: percentile(rates, 0.5),
    feeRange: [rates[0], percentile(rates, 0.25), percentile(rates, 0.5), percentile(rates, 0.75), rates[rates.length - 1]],
  };
}

export function normalizeMoneroBlock(
  b: MoneroBlockSummary & { txs: MoneroTxSummary[] },
  pools: ReadonlyMap<string, string>,
): NormalizedBlock {
  return {
    id: b.hash,
    height: b.height,
    timestamp: b.timestamp,
    txCount: b.txCount,
    size: b.size,
    weight: b.size,
    ...feeStats(b.txs),
    // Piconero, as a plain number: the ribbon only reads it as a count.
    totalFees: Number(b.fees),
    ...((pools.get(b.hash) ?? b.poolName) ? { poolName: pools.get(b.hash) ?? b.poolName } : {}),
  };
}

/** The mempool packed into blocks, next-to-mine first: sorted by fee per
 *  byte, each block filled up to the penalty-free size. */
export function packMoneroMempool(txs: MoneroTxSummary[], blockBytes = MONERO_FULL_BLOCK_BYTES, maxBlocks = 4): MoneroTxSummary[][] {
  const sorted = [...txs].filter(t => !t.coinbase).sort((a, b) => feeRate(b) - feeRate(a));
  const blocks: MoneroTxSummary[][] = [];
  let current: MoneroTxSummary[] = [];
  let bytes = 0;
  for (const t of sorted) {
    if (bytes + t.size > blockBytes && current.length > 0) {
      blocks.push(current);
      if (blocks.length === maxBlocks) break;
      current = [];
      bytes = 0;
    }
    current.push(t);
    bytes += t.size;
  }
  if (current.length > 0 && blocks.length < maxBlocks) blocks.push(current);
  return blocks;
}

/** The mempool as the ribbon's projected blocks. */
export function projectMoneroMempool(txs: MoneroTxSummary[], blockBytes = MONERO_FULL_BLOCK_BYTES, maxBlocks = 4): ProjectedBlock[] {
  return packMoneroMempool(txs, blockBytes, maxBlocks).map(toProjected);
}

function toProjected(list: MoneroTxSummary[]): ProjectedBlock {
  const stats = feeStats(list);
  return {
    txCount: list.length,
    medianFee: stats.medianFee ?? 0,
    // Projected blocks list their spread lowest first, the floor a
    // transaction must clear to be in them.
    feeRange: stats.feeRange ?? [],
    totalFees: Number(list.reduce((sum, t) => sum + t.fee, BigInt(0))),
    blockVSize: list.reduce((sum, t) => sum + t.size, 0),
  };
}

/* ------------------------- Checking the estimate ------------------------- */

// Alice's projected next block is an estimate: no Monero service publishes a
// miner's template. So each time a block lands, the estimate made just before
// it is compared with what the miner actually took, and the score is kept
// for the views to show. Only the blocks seen arriving while the Explorer is
// open are scored.

export type MoneroEstimateCheck = {
  height: number;
  /** Transactions both in the estimate and in the block (coinbase aside). */
  matched: number;
  expected: number;
  mined: number;
  /** matched over the larger of the two, as a percent. */
  rate: number;
  /** The miner took no transaction at all: its choice, not a miss of the
   *  estimate, so it is kept out of the average. */
  empty: boolean;
};

/** How well an estimate foresaw a block: the transactions they share, over
 *  the larger of the two, so a block much smaller or much larger than the
 *  estimate scores low either way. Null when there is nothing to compare. */
export function scoreMoneroEstimate(expected: ReadonlySet<string>, minedTxids: string[]): Omit<MoneroEstimateCheck, 'height'> | null {
  if (expected.size === 0 && minedTxids.length === 0) return null;
  const matched = minedTxids.filter(t => expected.has(t)).length;
  const rate = Math.round((matched / Math.max(expected.size, minedTxids.length)) * 100);
  return { matched, expected: expected.size, mined: minedTxids.length, rate, empty: minedTxids.length === 0 };
}

const estimateChecks = new Map<number, MoneroEstimateCheck>();

/** The estimate checks made so far, newest first. */
export function moneroEstimateChecks(): MoneroEstimateCheck[] {
  return [...estimateChecks.values()].sort((a, b) => b.height - a.height);
}

/** The check of one block's estimate, when that block was seen arriving. */
export function moneroEstimateFor(height: number): MoneroEstimateCheck | undefined {
  return estimateChecks.get(height);
}

const PAGE = 10;
/** Reads closer than this belong to the same ribbon poll (it polls every
 *  20 seconds). */
const SAME_POLL_MS = 5000;

/**
 * The ribbon's and the block map's source for Monero. Blocks come with their
 * transactions in one read, so the block map needs no second request for a
 * block the ribbon has seen.
 */
export function createMoneroRibbonSource({ now = () => Date.now() }: { now?: () => number } = {}) {
  let tip = 0; // the newest height seen, to turn a height into a page
  const txsByHash = new Map<string, MoneroTxSummary[]>();
  // The last few estimates of the next block, with the top they were made on
  // and when the mempool was read. The ribbon reads the blocks and the
  // mempool together, so the mempool read alongside the poll that reveals a
  // block may already be missing that block's transactions. Only estimates
  // read before that poll count; a block that came too fast for one (two
  // blocks seconds apart) gets no score rather than a false one.
  let estimates: { tip: number; txids: Set<string>; readAt: number }[] = [];

  function score(blocks: (MoneroBlockSummary & { txs: MoneroTxSummary[] })[], askedAt: number) {
    for (const b of blocks) {
      if (estimateChecks.has(b.height)) continue;
      const before = estimates.filter(e => e.tip === b.height - 1 && e.readAt < askedAt - SAME_POLL_MS);
      const latest = before[before.length - 1];
      if (!latest) continue;
      const result = scoreMoneroEstimate(latest.txids, b.txs.filter(t => !t.coinbase).map(t => t.txid));
      if (result) estimateChecks.set(b.height, { height: b.height, ...result });
    }
    while (estimateChecks.size > 200) estimateChecks.delete(Math.min(...estimateChecks.keys()));
  }

  function remember(blocks: (MoneroBlockSummary & { txs: MoneroTxSummary[] })[]) {
    for (const b of blocks) txsByHash.set(b.hash, b.txs);
    // Keep the memory bounded: the oldest entries go first.
    while (txsByHash.size > 400) txsByHash.delete(txsByHash.keys().next().value!);
  }

  async function page(n: number, opts?: RequestOptions) {
    const askedAt = now();
    const [res, pools] = await Promise.all([getMoneroBlocksPage(n, PAGE, opts), getMoneroPoolBlocks()]);
    if (res.currentHeight > 0) tip = Math.max(tip, res.currentHeight - 1);
    remember(res.blocks);
    if (n === 0) score(res.blocks, askedAt);
    return res.blocks.map(b => normalizeMoneroBlock(b, pools));
  }

  return {
    /** Hand over a block another view already read, for the block map. */
    prime(block: MoneroBlockSummary & { txs: MoneroTxSummary[] }): void {
      remember([block]);
    },

    async getRecentBlocks(beforeHeight?: number, opts?: RequestOptions): Promise<NormalizedBlock[]> {
      if (beforeHeight === undefined || tip === 0) {
        const first = await page(0, opts);
        if (beforeHeight === undefined) return first;
      }
      // The page holding `beforeHeight`, and the next one to fill a batch.
      const offset = Math.max(0, tip - beforeHeight);
      const n = Math.floor(offset / PAGE);
      const [a, b] = await Promise.all([page(n, opts), page(n + 1, opts)]);
      return [...a, ...b].filter(x => x.height <= beforeHeight).slice(0, PAGE);
    },

    async getMempoolBlocks(opts?: RequestOptions): Promise<ProjectedBlock[]> {
      const at = tip;
      const readAt = now();
      const blocks = packMoneroMempool(await getMoneroMempool(1000, opts));
      if (at > 0) {
        estimates = [...estimates.filter(e => e.tip >= at - 1), { tip: at, txids: new Set((blocks[0] ?? []).map(t => t.txid)), readAt }].slice(-6);
      }
      return blocks.map(toProjected);
    },

    async getBlock(heightOrHash: string, opts?: RequestOptions): Promise<NormalizedBlock> {
      const [b, pools] = await Promise.all([getMoneroBlock(heightOrHash, opts), getMoneroPoolBlocks()]);
      remember([b]);
      return normalizeMoneroBlock(b, pools);
    },

    async getBlockSummary(hash: string, opts?: RequestOptions): Promise<BlockTxSummary[]> {
      const txs = txsByHash.get(hash) ?? (await getMoneroBlock(hash, opts)).txs;
      return txs.map(t => ({
        txid: t.txid,
        vsize: t.size,
        rate: t.coinbase ? 0 : feeRate(t),
        valueSats: 0,
        feeSats: Number(t.fee),
      }));
    },
  };
}

export type MoneroRibbonSource = ReturnType<typeof createMoneroRibbonSource>;
