// The React side of an on-chain settlement registry (Arkade's commitments,
// Bark's rounds): mirrors the registry for the components, and drives the
// passes that keep it at the live tip while that network is being explored.
//
// A pass walks the operator's wallet forward from where the last one stopped.
// When its hop budget runs out before the tip, the next pass follows after a
// short pause instead of the regular tick, so a browser that was away for a
// while catches up in one go, and the views can say so (`catchingUp`) until
// the newest settlement shown is the newest there is. Older history is
// fetched only on request (`loadOlder`), a page at a time.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HistoryResult, KnownSettlement, PassResult, SettlementRegistry } from './arkade-onchain.ts';

/** How the registry stands against the live tip, for the views. */
export type SettlementSync = {
  /** True while the newest settlement shown may not be the newest there is:
   *  a pass is still walking towards the tip (or about to retry). */
  catchingUp: boolean;
  /** The newest confirmed settlement's height, when one is known. */
  tipHeight: number | null;
  /** Fetch a page of older settlements. Resolves with what it found. */
  loadOlder: () => Promise<HistoryResult>;
  /** True while a page of older settlements is being fetched. */
  loadingOlder: boolean;
  /** Why nothing older can be fetched: the operator wallet's origin was
   *  reached, or the funding line ends in transactions the walk cannot
   *  cross (or the operator no longer recognises). Null while there may be
   *  more. */
  exhausted: 'origin' | 'dead-end' | null;
};

export type SettlementState = {
  /** Every settlement this browser has identified, by txid. */
  byTxid: Map<string, KnownSettlement>;
  /** Confirmed settlement block heights, for the ribbon highlights. */
  heights: Set<number>;
  sync: SettlementSync;
};

// Between two passes once the tip is reached: the regular tick.
const CHAIN_PAUSE_MS = 1500;
// After a pass cut short by a failed lookup (the provider hiccuped or
// rate-limited): long enough for it to recover, short enough to feel live.
const RETRY_PAUSE_MS = 20_000;
// Passes chained back to back before falling back to the regular tick, so a
// wallet the walk cannot exhaust (a wrong turn) does not spin forever.
const MAX_CHAINED = 12;

/**
 * Mirror `registry` and, while `active`, run `pass` towards the tip (chained
 * until it gets there, then every `intervalMs`), serving `older` on request.
 * `pass` and `older` must be stable (useCallback) or the schedule restarts.
 */
export function useSettlementSync(opts: {
  registry: SettlementRegistry;
  active: boolean;
  intervalMs: number;
  pass: (signal: AbortSignal) => Promise<PassResult>;
  older: (signal: AbortSignal) => Promise<HistoryResult>;
}): SettlementState {
  const { registry, active, intervalMs, pass, older } = opts;
  const [version, setVersion] = useState(0);
  const [catchingUp, setCatchingUp] = useState(active);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [exhausted, setExhausted] = useState<SettlementSync['exhausted']>(null);
  // Walks and history pages touch the same registry and the same provider:
  // run one at a time, in order.
  const serial = useRef<Promise<unknown>>(Promise.resolve());
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => registry.subscribe(() => setVersion(v => v + 1)), [registry]);

  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = serial.current.then(task, task);
    serial.current = next.then(() => undefined, () => undefined);
    return next;
  }

  useEffect(() => {
    if (!active) { setCatchingUp(false); return; }
    const controller = new AbortController();
    controllerRef.current = controller;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let chained = 0;
    setCatchingUp(true);
    async function walk() {
      if (cancelled) return;
      let result: PassResult = { atTip: false, interrupted: true };
      try {
        result = await enqueue(() => pass(controller.signal));
      } catch {
        /* a failed pass retries after the pause */
      }
      if (cancelled) return;
      setCatchingUp(!result.atTip);
      let delay = intervalMs;
      if (result.interrupted) delay = RETRY_PAUSE_MS;
      else if (!result.atTip && chained < MAX_CHAINED) { chained++; delay = CHAIN_PAUSE_MS; }
      else chained = 0;
      timer = setTimeout(() => { void walk(); }, delay);
    }
    void walk();
    return () => {
      cancelled = true;
      controller.abort();
      if (timer) clearTimeout(timer);
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [active, intervalMs, pass]);

  const loadOlder = useCallback(async (): Promise<HistoryResult> => {
    const controller = controllerRef.current;
    if (!controller) return { found: 0, origin: false, interrupted: true };
    setLoadingOlder(true);
    try {
      const r = await enqueue(() => older(controller.signal));
      if (r.origin) setExhausted('origin');
      else if (r.found === 0 && !r.interrupted) setExhausted('dead-end');
      return r;
    } catch {
      return { found: 0, origin: false, interrupted: true };
    } finally {
      setLoadingOlder(false);
    }
  // enqueue only touches refs, so `older` is the one real dependency.
  }, [older]);

  return useMemo<SettlementState>(() => {
    void version; // rebuild when the registry changes
    const byTxid = new Map<string, KnownSettlement>();
    let tipHeight: number | null = null;
    for (const s of registry.all()) {
      byTxid.set(s.txid, s);
      if (s.height !== undefined && (tipHeight === null || s.height > tipHeight)) tipHeight = s.height;
    }
    return {
      byTxid,
      heights: registry.heights(),
      sync: { catchingUp, tipHeight, loadOlder, loadingOlder, exhausted },
    };
  }, [version, registry, catchingUp, loadOlder, loadingOlder, exhausted]);
}
