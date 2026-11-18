// What a mempool instance publishes over its WebSocket and nowhere else, or
// later elsewhere: the queue of projected (not yet mined) blocks as it moves,
// the transactions of one of them (a full list when the block is tracked, then
// a delta with every change), and each block as it is mined.
//
// One connection per instance, shared by everything on screen. The ribbon's
// cards and an open projected block's page then read the same message of the
// same server: their figures cannot disagree. Over REST they could: its
// answers trail the socket by a few seconds, and under rate limiting they come
// from a stand-in instance with a mempool of its own.
//
// The readers are pure and take the remote payload defensively: it comes from
// a public server and feeds a canvas.

import { feeRateValue } from './blocks.ts';
import type { BlockTxSummary, NormalizedBlock, ProjectedBlock } from './types.ts';

/** A projected block never needs more: a full block holds a few thousand. */
const MAX_TRANSACTIONS = 30_000;
/** The queue never holds more than a handful of projected blocks. */
const MAX_BLOCKS = 16;
/** How long a connection may take to open before it counts as lost. */
const CONNECT_TIMEOUT_MS = 10_000;
const RECONNECT_DELAYS_MS = [2_000, 5_000, 15_000];
/** Past the quick retries the feed is reported unavailable, and tried again
 *  now and then: a laptop that slept, a network that came back. */
const SLOW_RETRY_MS = 120_000;

export type ProjectedBlockStatus = 'connecting' | 'live' | 'reconnecting' | 'unavailable';

export type ProjectedBlockHandlers = {
  onTransactions: (transactions: BlockTxSummary[]) => void;
  onStatus: (status: ProjectedBlockStatus) => void;
};

export type MempoolQueueHandlers = {
  /** The projected blocks, next to be mined first. */
  onBlocks: (blocks: ProjectedBlock[]) => void;
  /** A block that has just been mined. */
  onMined?: (block: NormalizedBlock) => void;
  onStatus?: (status: ProjectedBlockStatus) => void;
};

/** `https://mempool.space/api` → `wss://mempool.space/api/v1/ws`. */
export function projectedBlockSocketUrl(apiBaseUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(apiBaseUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = `${url.pathname.replace(/\/$/, '')}/v1/ws`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const field = (message: unknown, name: string): unknown =>
  typeof message === 'object' && message !== null ? (message as Record<string, unknown>)[name] : undefined;

/** The queue of projected blocks a message carries, or null when it has none. */
export function readProjectedBlocks(message: unknown): ProjectedBlock[] | null {
  const list = field(message, 'mempool-blocks');
  if (!Array.isArray(list)) return null;
  const blocks: ProjectedBlock[] = [];
  for (const entry of list.slice(0, MAX_BLOCKS)) {
    const nTx = field(entry, 'nTx');
    const medianFee = field(entry, 'medianFee');
    const totalFees = field(entry, 'totalFees');
    const blockVSize = field(entry, 'blockVSize');
    const feeRange = field(entry, 'feeRange');
    // One unreadable block would shift every card after it: drop the message.
    if (!finite(nTx) || !finite(medianFee) || !finite(totalFees) || !finite(blockVSize)) return null;
    blocks.push({ txCount: nTx, medianFee, feeRange: Array.isArray(feeRange) ? feeRange.filter(finite) : [], totalFees, blockVSize });
  }
  return blocks;
}

/** The block a message announces as mined, or null. */
export function readMinedBlock(message: unknown): NormalizedBlock | null {
  const block = field(message, 'block');
  const id = field(block, 'id');
  const height = field(block, 'height');
  const timestamp = field(block, 'timestamp');
  const txCount = field(block, 'tx_count');
  const size = field(block, 'size');
  const weight = field(block, 'weight');
  if (typeof id !== 'string' || !/^[0-9a-f]{64}$/i.test(id)) return null;
  if (!Number.isInteger(height) || (height as number) < 0) return null;
  if (!finite(timestamp) || !finite(txCount) || !finite(size) || !finite(weight)) return null;
  const extras = field(block, 'extras');
  const medianFee = field(extras, 'medianFee');
  const feeRange = field(extras, 'feeRange');
  const totalFees = field(extras, 'totalFees');
  const poolName = field(field(extras, 'pool'), 'name');
  return {
    id, height: height as number, timestamp, txCount, size, weight,
    medianFee: finite(medianFee) ? medianFee : undefined,
    feeRange: Array.isArray(feeRange) ? feeRange.filter(finite) : undefined,
    totalFees: finite(totalFees) ? totalFees : undefined,
    poolName: typeof poolName === 'string' ? poolName.slice(0, 80) : undefined,
  };
}

/** `[txid, fee, vsize, value, rate, ...]`, as the instance sends a transaction. */
function readTransaction(entry: unknown): BlockTxSummary | null {
  if (!Array.isArray(entry)) return null;
  const [txid, fee, vsize, value, rate] = entry;
  if (typeof txid !== 'string' || !/^[0-9a-f]{64}$/i.test(txid)) return null;
  if (!finite(fee) || !finite(vsize) || !finite(value) || !finite(rate) || vsize <= 0) return null;
  return { txid, vsize, rate, valueSats: value, feeSats: fee };
}

/**
 * The block's transactions after one message, by txid. A full list replaces
 * what was known; a delta applies to it. A delta received before any full
 * list, or a message about another block, changes nothing.
 */
export function applyProjectedBlockMessage(
  current: ReadonlyMap<string, BlockTxSummary> | null,
  message: unknown,
  index: number,
): ReadonlyMap<string, BlockTxSummary> | null {
  if (typeof message !== 'object' || message === null) return current;
  const payload = (message as Record<string, unknown>)['projected-block-transactions'];
  if (typeof payload !== 'object' || payload === null) return current;
  const block = payload as Record<string, unknown>;
  if (block.index !== index) return current;

  if (Array.isArray(block.blockTransactions)) {
    const next = new Map<string, BlockTxSummary>();
    for (const entry of block.blockTransactions.slice(0, MAX_TRANSACTIONS)) {
      const tx = readTransaction(entry);
      if (tx) next.set(tx.txid, tx);
    }
    return next;
  }

  const delta = block.delta;
  if (!current || typeof delta !== 'object' || delta === null) return current;
  const { added, removed, changed } = delta as Record<string, unknown>;
  const next = new Map(current);
  if (Array.isArray(removed)) {
    for (const txid of removed) if (typeof txid === 'string') next.delete(txid);
  }
  if (Array.isArray(added)) {
    for (const entry of added) {
      if (next.size >= MAX_TRANSACTIONS) break;
      const tx = readTransaction(entry);
      if (tx) next.set(tx.txid, tx);
    }
  }
  // `[txid, rate, ...]`: the fee rate of a transaction already in the block.
  if (Array.isArray(changed)) {
    for (const entry of changed) {
      if (!Array.isArray(entry)) continue;
      const [txid, rate] = entry;
      const known = typeof txid === 'string' ? next.get(txid) : undefined;
      if (known && finite(rate)) next.set(known.txid, { ...known, rate });
    }
  }
  return next;
}

/** Highest fee rate first, the order a miner fills a block in. */
export function byFeeRate(transactions: ReadonlyMap<string, BlockTxSummary>): BlockTxSummary[] {
  return [...transactions.values()].sort((a, b) => b.rate - a.rate || a.txid.localeCompare(b.txid));
}

/**
 * The block's totals, counted from its own transactions (highest fee rate
 * first, as byFeeRate gives them). A mempool instance answers from several
 * servers whose mempools differ a little: the totals of the REST API and the
 * list of the socket can disagree by hundreds of transactions, and a page
 * that shows both must count from one.
 */
export function summarizeProjectedBlock(transactions: readonly BlockTxSummary[]): ProjectedBlock | null {
  if (transactions.length === 0) return null;
  const blockVSize = transactions.reduce((sum, tx) => sum + tx.vsize, 0);
  // The fee rate at the middle of the block's space, not of its list: one
  // large transaction weighs as much as the many small ones it displaces.
  let seen = 0;
  let medianFee = transactions[transactions.length - 1].rate;
  for (const tx of transactions) {
    seen += tx.vsize;
    if (seen >= blockVSize / 2) { medianFee = tx.rate; break; }
  }
  return {
    txCount: transactions.length,
    medianFee,
    feeRange: [transactions[transactions.length - 1].rate, transactions[0].rate],
    totalFees: transactions.reduce((sum, tx) => sum + tx.feeSats, 0),
    blockVSize,
  };
}

/** What Alice may be told about the page: totals of a public queue, no subject. */
export function projectedBlockDescription(block: ProjectedBlock, index: number): string {
  const range = block.feeRange.length > 0
    ? `, fee rates from ${feeRateValue(block.feeRange[0])} to ${feeRateValue(block.feeRange[block.feeRange.length - 1])} sat/vB`
    : '';
  return [
    `Projected block ${index + 1} of the mempool queue${index === 0 ? ' (the next block expected)' : ''}. It is not mined: a projection that changes as transactions arrive, and the miner who finds the block may compose it differently.`,
    `${block.txCount} transactions, median fee rate ${feeRateValue(block.medianFee)} sat/vB${range}, total fees ${block.totalFees} sats, virtual size ${Math.round(block.blockVSize)} vB.`,
  ].join('\n');
}

type Tracker = {
  index: number;
  handlers: ProjectedBlockHandlers;
  transactions: ReadonlyMap<string, BlockTxSummary> | null;
};

type Feed = {
  watchQueue: (handlers: MempoolQueueHandlers) => () => void;
  track: (index: number, handlers: ProjectedBlockHandlers) => () => void;
};

const feeds = new Map<string, Feed>();

/**
 * The one connection to an instance. It opens with its first subscriber and
 * closes with its last, rests while the page is in the background, and comes
 * back by itself when the socket drops.
 */
function openFeed(url: string): Feed {
  const queues = new Set<MempoolQueueHandlers>();
  // An instance follows one projected block per connection, and one page is
  // on screen at a time: the latest tracker is the one served.
  let tracker: Tracker | null = null;
  let socket: WebSocket | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let attempt = 0;
  let status: ProjectedBlockStatus = 'connecting';
  let lastBlocks: ProjectedBlock[] | null = null;

  const visible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden';
  const idle = () => queues.size === 0 && tracker === null;

  const setStatus = (next: ProjectedBlockStatus) => {
    status = next;
    for (const queue of queues) queue.onStatus?.(next);
    tracker?.handlers.onStatus(next);
  };

  const say = (message: unknown) => {
    if (socket?.readyState === 1) socket.send(JSON.stringify(message));
  };
  const askQueue = () => say({ action: 'want', data: ['blocks', 'mempool-blocks'] });
  // Any value that is not a place in the queue ends the tracking.
  const askTransactions = () => say({ 'track-mempool-block': tracker ? tracker.index : -1 });

  const receive = (message: unknown) => {
    let heard = false;
    const blocks = readProjectedBlocks(message);
    if (blocks) {
      heard = true;
      lastBlocks = blocks;
      for (const queue of queues) queue.onBlocks(blocks);
    }
    const mined = readMinedBlock(message);
    if (mined) {
      heard = true;
      for (const queue of queues) queue.onMined?.(mined);
    }
    let listed: BlockTxSummary[] | null = null;
    if (tracker) {
      const next = applyProjectedBlockMessage(tracker.transactions, message, tracker.index);
      if (next !== tracker.transactions) {
        heard = true;
        tracker.transactions = next;
        if (next) listed = byFeeRate(next);
      }
    }
    if (!heard) return;
    attempt = 0;
    if (status !== 'live') setStatus('live');
    if (listed) tracker?.handlers.onTransactions(listed);
  };

  const connect = () => {
    timer = undefined;
    if (idle() || !visible() || socket) return;
    if (status !== 'unavailable') setStatus(attempt === 0 ? 'connecting' : 'reconnecting');
    const current = new WebSocket(url);
    socket = current;
    current.onopen = () => {
      clearTimeout(opening);
      if (queues.size > 0) askQueue();
      if (tracker) askTransactions();
    };
    current.onmessage = (event) => {
      if (socket !== current || typeof event.data !== 'string') return;
      try {
        receive(JSON.parse(event.data));
      } catch {
        // Not JSON: nothing to read.
      }
    };
    const lost = () => {
      if (socket !== current) return;
      clearTimeout(opening);
      socket = null;
      // The next full list replaces the stale one.
      if (tracker) tracker.transactions = null;
      if (idle() || !visible()) return;
      const delay = RECONNECT_DELAYS_MS[attempt];
      attempt += 1;
      setStatus(delay === undefined ? 'unavailable' : 'reconnecting');
      timer = setTimeout(connect, delay ?? SLOW_RETRY_MS);
    };
    current.onclose = lost;
    // An error is always followed by a close, which handles the retry.
    current.onerror = () => {};
    // A connection that neither opens nor fails would leave its readers
    // waiting for good: past the delay it counts as lost.
    const opening = setTimeout(() => {
      if (socket !== current || current.readyState === 1) return;
      lost();
      current.close();
    }, CONNECT_TIMEOUT_MS);
  };

  const rest = () => {
    if (timer !== undefined) { clearTimeout(timer); timer = undefined; }
    const current = socket;
    socket = null;
    current?.close();
    if (tracker) tracker.transactions = null;
  };

  // In the background nothing reads the feed: no reason to keep a phone's
  // radio awake for it. Back in front, it starts again at once.
  const onVisibility = () => {
    if (!visible()) { rest(); return; }
    if (!socket && !idle()) {
      attempt = 0;
      if (timer !== undefined) { clearTimeout(timer); timer = undefined; }
      connect();
    }
  };
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);

  const leave = () => {
    if (!idle()) return;
    rest();
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    feeds.delete(url);
  };

  return {
    watchQueue(handlers) {
      queues.add(handlers);
      handlers.onStatus?.(status);
      // A second reader of an open feed starts from what the first one holds.
      if (status === 'live' && lastBlocks) handlers.onBlocks(lastBlocks);
      if (socket) { if (queues.size === 1) askQueue(); } else if (timer === undefined) connect();
      return () => { queues.delete(handlers); leave(); };
    },
    track(index, handlers) {
      const mine: Tracker = { index, handlers, transactions: null };
      tracker = mine;
      handlers.onStatus(status);
      if (socket) askTransactions(); else if (timer === undefined) connect();
      return () => {
        if (tracker !== mine) return;
        tracker = null;
        askTransactions();
        leave();
      };
    },
  };
}

function feedOf(apiBaseUrl: string): Feed | null {
  const url = projectedBlockSocketUrl(apiBaseUrl);
  if (!url || typeof WebSocket === 'undefined') return null;
  let feed = feeds.get(url);
  if (!feed) {
    feed = openFeed(url);
    feeds.set(url, feed);
  }
  return feed;
}

/**
 * Follow the queue of projected blocks, and the blocks mined meanwhile.
 * Returns the function that ends the watch.
 */
export function watchMempoolQueue(apiBaseUrl: string, handlers: MempoolQueueHandlers): () => void {
  const feed = feedOf(apiBaseUrl);
  if (!feed) {
    handlers.onStatus?.('unavailable');
    return () => {};
  }
  return feed.watchQueue(handlers);
}

/**
 * Follow the transactions of the projected block at `index` (0 is the next
 * one), on the connection the queue is read from. Returns the function that
 * ends the watch.
 */
export function watchProjectedBlock(apiBaseUrl: string, index: number, handlers: ProjectedBlockHandlers): () => void {
  const feed = feedOf(apiBaseUrl);
  if (!feed) {
    handlers.onStatus('unavailable');
    return () => {};
  }
  return feed.track(index, handlers);
}
