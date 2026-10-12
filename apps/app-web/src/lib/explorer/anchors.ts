// The latest settlement of each off-chain operator, as Alice's Worker
// publishes it.
//
// Neither Arkade nor Second lists its commitment or round transactions, so a
// browser opening the Explorer for the first time has nothing recent to start
// from: it would walk the operator's wallet forward from a seed written in
// the code, months long once the seed has aged. Alice's Worker does that walk
// for everyone, every few minutes, and publishes where it stands: the newest
// confirmed settlement and its height. A browser reads that anchor first,
// shows it as the latest, and only then walks backward for the recent history
// and forward for whatever landed since.
//
// The request carries nothing about the user: no identifier, no query, the
// same cacheable GET for every browser. Without a proxy configured, or when
// the Worker does not answer, the caller falls back to the seeds in the code.

import { proxyBaseUrl } from './entity-remote.ts';

export type ExplorerAnchor = {
  txid: string;
  height: number;
  /** Block time, seconds since the epoch. */
  timestamp: number;
};

export type ExplorerAnchors = {
  arkade?: ExplorerAnchor;
  bark?: ExplorerAnchor;
  /** When the Worker last refreshed, milliseconds since the epoch. */
  updatedAt?: number;
};

const TXID = /^[0-9a-f]{64}$/;

function coerceAnchor(v: unknown): ExplorerAnchor | undefined {
  if (typeof v !== 'object' || v === null) return undefined;
  const o = v as Record<string, unknown>;
  if (typeof o.txid !== 'string' || !TXID.test(o.txid)) return undefined;
  if (typeof o.height !== 'number' || !Number.isInteger(o.height) || o.height <= 0) return undefined;
  if (typeof o.timestamp !== 'number' || !Number.isFinite(o.timestamp) || o.timestamp <= 0) return undefined;
  return { txid: o.txid, height: o.height, timestamp: Math.floor(o.timestamp) };
}

/** Validate the Worker's answer; anything malformed reads as no anchors. */
export function coerceAnchors(body: unknown): ExplorerAnchors | null {
  if (typeof body !== 'object' || body === null) return null;
  const o = body as Record<string, unknown>;
  const out: ExplorerAnchors = {};
  const arkade = coerceAnchor(o.arkade);
  const bark = coerceAnchor(o.bark);
  if (arkade) out.arkade = arkade;
  if (bark) out.bark = bark;
  if (typeof o.updatedAt === 'number' && Number.isFinite(o.updatedAt)) out.updatedAt = o.updatedAt;
  return arkade || bark ? out : null;
}

/** True when a proxy is configured, so anchors can be asked for at all. */
export function anchorsConfigured(): boolean {
  return proxyBaseUrl().length > 0;
}

/**
 * The anchors the Worker publishes, or null when there is no proxy, the
 * Worker is unreachable or its answer is malformed. Never throws.
 */
export async function fetchExplorerAnchors(opts: { signal?: AbortSignal; fetchImpl?: typeof fetch; base?: string } = {}): Promise<ExplorerAnchors | null> {
  const base = (opts.base ?? proxyBaseUrl()).replace(/\/+$/, '');
  if (!base) return null;
  const f = opts.fetchImpl ?? fetch;
  try {
    const res = await f(`${base}/explorer/anchors`, {
      method: 'GET',
      signal: opts.signal ?? AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return coerceAnchors(await res.json());
  } catch {
    return null;
  }
}
