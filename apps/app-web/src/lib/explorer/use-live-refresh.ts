// Re-check a live view on a timer while it is on screen. Timers are paused by
// the system while the app is in the background (a phone locked, a window
// minimised), so the tick also runs as soon as the app comes back to the
// foreground, and never while it is hidden.

import { useEffect, useRef } from 'react';

/** Whether the page is in the foreground. True outside a browser (tests). */
export function pageVisible(): boolean {
  return typeof document === 'undefined' || document.visibilityState !== 'hidden';
}

/**
 * Calls `tick` every `intervalMs` while the page is visible, and once when it
 * becomes visible again after at least `intervalMs` in the background. One
 * tick at a time: a slow tick is never stacked. The signal passed to `tick`
 * aborts when the view unmounts or `enabled` turns false. Nothing runs on
 * mount: the view has just loaded its data.
 */
export function useLiveRefresh(
  tick: (signal: AbortSignal) => Promise<void>,
  intervalMs: number,
  enabled = true,
): void {
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let inFlight = false;
    let lastRun = Date.now();

    const run = async () => {
      if (inFlight || !pageVisible() || controller.signal.aborted) return;
      inFlight = true;
      lastRun = Date.now();
      try {
        await tickRef.current(controller.signal);
      } catch {
        // A failed check keeps the data on screen; the next tick tries again.
      } finally {
        inFlight = false;
      }
    };

    const id = setInterval(() => { void run(); }, intervalMs);
    const onVisible = () => {
      if (pageVisible() && Date.now() - lastRun >= intervalMs) void run();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      controller.abort();
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [intervalMs, enabled]);
}
