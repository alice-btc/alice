// The expiry of an Arkade VTXO or batch: a date or a block height, or unknown.
//
// Kept free of the SDK (and of i18n) so the first render never loads it. The
// rule for a lone scalar is the SDK's own (0.4.79, vtxo.ts parseWireExpiry /
// parseLegacyExpiry): from 1 January 2025 on it is a date, below that a block
// height. That is not the BIP65 locktime threshold (500,000,000): a height such
// as 850,123 is far below either, and a date before 2025 cannot be a batch
// expiry the operator serves today. Using the SDK's cut-off keeps this view and
// the SDK's own reading of the same coin from disagreeing. Canonical fields
// (a Date, a height) are never guessed at: they say which one it is.
//
// Dates are unix seconds here, as everywhere in this explorer.

export type ArkadeExpiry = {
  /** Unix seconds. */
  expiresAt?: number;
  /** A block height. Never compared with a clock. */
  expiresAtHeight?: number;
};

/** 1 January 2025, in milliseconds: the SDK's EXPIRY_MIN_PLAUSIBLE_MS. */
export const EXPIRY_MIN_PLAUSIBLE_MS = Date.UTC(2025, 0, 1);

function positive(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

/** One date in seconds, or unknown. */
function dateSec(ms: number): ArkadeExpiry {
  const sec = Math.floor(ms / 1000);
  return positive(sec) && Number.isFinite(new Date(ms).getTime()) ? { expiresAt: sec } : {};
}

/** One height, or unknown. */
function heightOf(n: number): ArkadeExpiry {
  return Number.isSafeInteger(n) && n > 0 ? { expiresAtHeight: n } : {};
}

/**
 * The gateway's single `expiresAt` scalar (a string, or a number), which is
 * unix seconds or a block height. Missing, empty, 0, negative or invalid is
 * unknown, never 1970 and never block 0.
 */
export function parseScalarExpiry(raw: unknown): ArkadeExpiry {
  if (typeof raw !== 'string' && typeof raw !== 'number') return {};
  if (typeof raw === 'string' && raw.trim() === '') return {};
  const n = Number(raw);
  if (!positive(n)) return {};
  return n * 1000 >= EXPIRY_MIN_PLAUSIBLE_MS ? dateSec(n * 1000) : heightOf(n);
}

/** The SDK's legacy `virtualStatus.batchExpiry`: milliseconds for a date, a
 *  height times 1000 for a height. */
export function parseLegacyExpiry(batchExpiry: unknown): ArkadeExpiry {
  if (typeof batchExpiry !== 'number' || !positive(batchExpiry)) return {};
  return batchExpiry >= EXPIRY_MIN_PLAUSIBLE_MS ? dateSec(batchExpiry) : heightOf(batchExpiry / 1000);
}

/** The SDK's canonical fields: a Date (or the ISO string a JSON round trip
 *  leaves) and a height. Either present means the canonical shape: no other
 *  field is consulted, and nothing is inferred from the numbers. */
export function parseCanonicalExpiry(date: unknown, height: unknown): ArkadeExpiry {
  const ms = date instanceof Date ? date.getTime() : typeof date === 'string' ? Date.parse(date) : NaN;
  const dateExpiry = dateSec(ms);
  // A malformed provider may supply both: keep one unit, with the same date
  // precedence as readExpiry/pickExpiry, never two contradictory expiries.
  if (dateExpiry.expiresAt !== undefined) return dateExpiry;
  return typeof height === 'number' ? heightOf(height) : {};
}

/** Whether `v` carries a canonical expiry field (valid or not). */
export function hasCanonicalExpiry(v: { expiresAt?: unknown; expiresAtHeight?: unknown }): boolean {
  const date = v.expiresAt instanceof Date
    || (typeof v.expiresAt === 'string' && v.expiresAt.trim() !== '' && !Number.isFinite(Number(v.expiresAt)));
  return date || v.expiresAtHeight !== undefined;
}

export function hasExpiry(e: ArkadeExpiry | null | undefined): e is ArkadeExpiry {
  return e !== null && e !== undefined && (e.expiresAt !== undefined || e.expiresAtHeight !== undefined);
}

/** The expiry of the first source that knows one, whole: a date and a height
 *  of two different sources are never mixed. Unknown when none does. */
export function pickExpiry(...sources: Array<ArkadeExpiry | null | undefined>): ArkadeExpiry {
  for (const s of sources) {
    if (hasExpiry(s)) {
      return s.expiresAt !== undefined ? { expiresAt: s.expiresAt } : { expiresAtHeight: s.expiresAtHeight };
    }
  }
  return {};
}

export type ExpiryReading =
  | { kind: 'date'; sec: number }
  | { kind: 'block'; height: number }
  | { kind: 'unknown' };

/** What an expiry is, for a view to word. A date wins if both are given. */
export function readExpiry(e: ArkadeExpiry | null | undefined): ExpiryReading {
  if (e?.expiresAt !== undefined && dateSec(e.expiresAt * 1000).expiresAt !== undefined) return { kind: 'date', sec: e.expiresAt };
  if (e?.expiresAtHeight !== undefined && heightOf(e.expiresAtHeight).expiresAtHeight !== undefined) return { kind: 'block', height: e.expiresAtHeight };
  return { kind: 'unknown' };
}

/** Expired by the clock: only a date can say so. A height has no clock, and
 *  stays not-expired here until a chain tip is compared with it. */
export function isDateExpired(e: ArkadeExpiry | null | undefined, nowSec: number): boolean {
  const r = readExpiry(e);
  return r.kind === 'date' && r.sec <= nowSec;
}
