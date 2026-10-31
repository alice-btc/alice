// A scripted Arkade indexer for the tests: replaces only the global fetch, so
// the real @arkade-os/sdk (its REST provider, its response validation, its
// conversion of a wire VTXO) stays in the loop. The wire shapes follow the SDK's
// own type guards (Response.isVtxo / isPageResponse in providers/indexer.ts):
// strings for amounts, creation time and expiry, a 1-based page cursor echoed
// as { current, next, total }, and a server that clamps page.index=0 to page 1.

/** The mainnet address and taproot script already used by arkade.test.ts. */
export const ARKADE_TEST_ADDRESS = 'ark1qzpq904am6clw3pgqwyh4p02708fy4xs0hcpwt7rwfdttuxsjamee9wgsn6aajdwkyjsss3cxnuwagt7yqmsxtvtnrmykc98gyj7cvp7wwwlq3';
export const ARKADE_TEST_SCRIPT = '512095c884f5dec9aeb12508423834f8eea17e2037032d8b98f64b60a74125ec303e';
export const ARKADE_TEST_BASE = 'https://arkade.test';

export type WireVtxo = {
  outpoint: { txid: string; vout: number };
  createdAt: string;
  expiresAt: string | null;
  amount: string;
  script: string;
  isPreconfirmed: boolean;
  isSwept: boolean;
  isUnrolled: boolean;
  isSpent: boolean;
  spentBy: string | null;
  commitmentTxids: string[];
  arkTxid?: string;
};

export const wireTxid = (n: number): string => n.toString(16).padStart(64, '0');

/** One valid wire VTXO; `over` overrides any field. */
export function wireVtxo(over: Partial<WireVtxo> & { n?: number } = {}): WireVtxo {
  const { n = 1, ...rest } = over;
  return {
    outpoint: { txid: wireTxid(n), vout: 0 },
    createdAt: '1786765019',
    expiresAt: '1789357275',
    amount: '1000',
    script: ARKADE_TEST_SCRIPT,
    isPreconfirmed: false,
    isSwept: false,
    isUnrolled: false,
    isSpent: false,
    spentBy: null,
    commitmentTxids: ['c'.repeat(64)],
    ...rest,
  };
}

/**
 * `count` distinct VTXOs mixing every state, spread evenly so that each page of
 * any size holds spent, swept, preconfirmed and settled coins. Amounts differ
 * per coin, so a missing or duplicated coin moves the balance.
 */
export function mixedWireVtxos(count: number): WireVtxo[] {
  return Array.from({ length: count }, (_, i) => {
    const spent = i % 7 === 0;
    const swept = i % 7 === 1;
    const preconfirmed = i % 7 === 2;
    // The states stay exclusive on purpose: SDK 0.4.39 folds the flags into
    // one virtualStatus.state, so a coin spent AND swept could not be told
    // apart from a spent one, whatever the caller does.
    return wireVtxo({
      n: i + 1,
      outpoint: { txid: wireTxid(i + 1), vout: i % 3 },
      amount: String(1000 + i),
      isSpent: spent,
      isSwept: swept,
      isPreconfirmed: preconfirmed,
      spentBy: spent ? 'd'.repeat(64) : null,
      arkTxid: spent ? 'e'.repeat(64) : undefined,
      commitmentTxids: preconfirmed ? [] : ['c'.repeat(64)],
    });
  });
}

/** What an address page must show for these coins: everything counts, only the
 *  coins neither spent nor swept are spendable (a preconfirmed one is). */
export function expectedTotals(vtxos: readonly WireVtxo[]): { totalCount: number; spendableCount: number; spendableSats: number } {
  const spendable = vtxos.filter(v => !v.isSpent && !v.isSwept);
  return {
    totalCount: vtxos.length,
    spendableCount: spendable.length,
    spendableSats: spendable.reduce((sum, v) => sum + Number(v.amount), 0),
  };
}

export const outpointKey = (v: { txid: string; vout: number }): string => `${v.txid}:${v.vout}`;

export type IndexerRequest = {
  url: URL;
  /** Raw page.index / page.size the client sent, null when absent. */
  pageIndexParam: number | null;
  pageSizeParam: number | null;
  /** The page the server serves for it: 1-based, index 0 clamped to 1. */
  page: number;
  /** The page size the server applied. */
  size: number;
  /** True when the client asked for a page beyond the last one. */
  beyondLastPage: boolean;
};

export type FakeIndexerOptions = {
  vtxos: readonly WireVtxo[];
  /** Page size when the client names none (the SDK comment: "the server answers
   *  with one page of its own choosing"). */
  defaultPageSize?: number;
  /** The largest page the server serves, whatever the client asks. */
  maxPageSize?: number;
  /** 'omitted' answers without any `page` object. */
  pageMode?: 'paged' | 'omitted';
  /** Make the request for this (1-based) page fail, every time it is asked. */
  failOnPage?: { page: number; mode: 'http-400' | 'network' };
  /** Called once the request is recorded, before it is answered. */
  onRequest?: (req: IndexerRequest, index: number) => void;
  /** Replace the `page` object of an answer (a broken or looping cursor);
   *  `undefined` drops the object. Gets the honest one. */
  pageOverride?: (req: IndexerRequest, honest: { current: number; next: number; total: number }) => unknown;
  /** Awaited after the request is recorded and before it is answered: holds a
   *  slow indexer. */
  hold?: (req: IndexerRequest) => Promise<void>;
};

export type FakeIndexer = {
  requests: IndexerRequest[];
  /** Any request that was not GET /v1/indexer/vtxos. */
  unexpected: string[];
  install(): void;
  restore(): void;
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const intParam = (u: URL, key: string): number | null => {
  const raw = u.searchParams.get(key);
  return raw === null ? null : Number(raw);
};

/** Script the indexer; `install()` swaps only globalThis.fetch, `restore()` puts it back. */
export function fakeIndexer(opts: FakeIndexerOptions): FakeIndexer {
  const realFetch = globalThis.fetch;
  const requests: IndexerRequest[] = [];
  const unexpected: string[] = [];
  const { vtxos, defaultPageSize = 100, maxPageSize = 500, pageMode = 'paged' } = opts;

  const fake = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (init?.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const method = (init?.method ?? 'GET').toUpperCase();
    if (method !== 'GET' || url.pathname !== '/v1/indexer/vtxos') {
      unexpected.push(`${method} ${url.pathname}`);
      return json({ code: 5, message: 'not found' }, 404);
    }

    const pageIndexParam = intParam(url, 'page.index');
    const pageSizeParam = intParam(url, 'page.size');
    const size = Math.max(1, Math.min(pageSizeParam ?? defaultPageSize, maxPageSize));
    const total = Math.ceil(vtxos.length / size);
    const page = Math.max(1, pageIndexParam ?? 1);
    const req: IndexerRequest = { url, pageIndexParam, pageSizeParam, page, size, beyondLastPage: vtxos.length > 0 && page > total };
    requests.push(req);
    opts.onRequest?.(req, requests.length);
    await opts.hold?.(req);

    if (opts.failOnPage && opts.failOnPage.page === page) {
      if (opts.failOnPage.mode === 'network') throw new TypeError('fetch failed');
      return json({ code: 3, message: 'indexer unavailable for this page' }, 400);
    }

    const slice = vtxos.slice((page - 1) * size, page * size);
    // An address with no coin: the live indexer answers { 1, 0, 0 } (checked
    // against arkade.computer on 2026-10-29), not { 1, 1, 0 }.
    const honest = { current: page, next: total === 0 ? 0 : page < total ? page + 1 : page, total };
    if (opts.pageOverride) {
      const shown = opts.pageOverride(req, honest);
      return json(shown === undefined ? { vtxos: slice } : { vtxos: slice, page: shown });
    }
    return json(pageMode === 'omitted' ? { vtxos: slice } : { vtxos: slice, page: honest });
  }) as typeof fetch;

  return {
    requests,
    unexpected,
    install() { globalThis.fetch = fake; },
    restore() { globalThis.fetch = realFetch; },
  };
}
