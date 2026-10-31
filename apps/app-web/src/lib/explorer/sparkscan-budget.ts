// Sparkscan answers without a key but allows a set number of REST requests per
// window. Each answer says how many are left (x-ratelimit-remaining) and when
// the window resets (x-ratelimit-reset, unix seconds); a refusal (429) may add
// Retry-After. When the allowance is used up, the Explorer waits until then
// instead of sending requests Sparkscan would refuse. The live websocket is not
// counted.

/** What to wait when Sparkscan says nothing about when to come back. */
const FALLBACK_WAIT_SECONDS = 60;

type HeaderReader = { get(name: string): string | null };

function int(v: string | null): number | null {
  if (v === null) return null;
  const n = Number(v.trim());
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

/** Retry-After is either a delay in seconds or an HTTP date. */
function retryAfterSeconds(v: string | null, now: number): number | null {
  const delay = int(v);
  if (delay !== null || v === null) return delay;
  const ms = Date.parse(v);
  return Number.isFinite(ms) ? Math.max(0, Math.ceil(ms / 1000 - now)) : null;
}

export class SparkscanBudget {
  /** Nothing is sent before this time (unix seconds). */
  private until = 0;

  /** Seconds to wait before the next request, 0 when it may go now. */
  wait(now: number): number {
    return Math.max(0, this.until - now);
  }

  /** Read an answer: requests left clear the wait, none left or a refusal
   *  set it from Retry-After, else the reset time, else a minute. */
  note(status: number, headers: HeaderReader, now: number): void {
    const remaining = int(headers.get('x-ratelimit-remaining'));
    if (status !== 429 && remaining !== 0) {
      this.until = 0;
      return;
    }
    const retry = retryAfterSeconds(headers.get('retry-after'), now);
    const reset = int(headers.get('x-ratelimit-reset'));
    const until = retry !== null ? now + retry : reset !== null && reset > now ? reset : now + FALLBACK_WAIT_SECONDS;
    this.until = Math.max(until, now + 1);
  }
}

/** "40 seconds", "about 2 minutes": for the message a held-back request gets. */
export function describeWait(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} second${seconds <= 1 ? '' : 's'}`;
  const minutes = Math.round(seconds / 60);
  return `about ${minutes} minute${minutes === 1 ? '' : 's'}`;
}
