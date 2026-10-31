// The desktop shell downloads a model itself and the webview polls where it
// stands. This is the pure reading of that polled status, kept free of the
// Tauri bridge so it runs under node:test.

export type DesktopModelDownloadStatus =
  | { state: 'downloading'; received: number; total: number }
  | { state: 'verifying'; done: number; total: number }
  | { state: 'installed' }
  | { state: 'failed'; error: string };

/**
 * `downloading` while the bytes arrive, `verifying` while the shell hashes
 * the complete file, so the page can say so instead of leaving a full bar
 * under "Downloading".
 */
export type DesktopModelDownloadPhase = 'downloading' | 'verifying';

export type DesktopModelDownloadStep =
  | { kind: 'progress'; phase: DesktopModelDownloadPhase; fraction: number }
  | { kind: 'installed' }
  | { kind: 'failed'; error: string };

/**
 * How often the webview asks the shell where a download stands. This also
 * bounds the work the page does per second: one small message to the shell
 * and one re-render.
 */
export const DESKTOP_DOWNLOAD_POLL_MS = 250;

/**
 * How long one poll waits for the shell's answer before asking again. The
 * bridge has lost single messages before (macOS, 0.2.5); without a bound the
 * bar froze at the last figure with no message.
 */
export const DESKTOP_DOWNLOAD_POLL_TIMEOUT_MS = 5_000;

export const DESKTOP_DOWNLOAD_LOST_MESSAGE =
  'The download stopped without a result. Try again from Settings.';

/** Fraction of the file received: 0 when nothing is known, never above 1. */
export function downloadFraction(received: number, total: number): number {
  if (!Number.isFinite(received) || !Number.isFinite(total) || total <= 0 || received <= 0) return 0;
  return Math.min(received / total, 1);
}

/**
 * What the webview does with one polled status: keep showing progress,
 * finish, or fail. A missing or malformed status means the shell lost track of
 * the download (it was restarted, for instance), which ends this attempt with
 * a message rather than a progress bar that never moves again.
 */
export function interpretDesktopDownloadStatus(status: unknown): DesktopModelDownloadStep {
  if (status && typeof status === 'object') {
    const value = status as { state?: unknown; received?: unknown; done?: unknown; total?: unknown; error?: unknown };
    switch (value.state) {
      case 'downloading':
        return { kind: 'progress', phase: 'downloading', fraction: downloadFraction(Number(value.received), Number(value.total)) };
      case 'verifying':
        return { kind: 'progress', phase: 'verifying', fraction: downloadFraction(Number(value.done), Number(value.total)) };
      case 'installed':
        return { kind: 'installed' };
      case 'failed':
        return {
          kind: 'failed',
          error: typeof value.error === 'string' && value.error ? value.error : 'Download failed.',
        };
    }
  }
  return { kind: 'failed', error: DESKTOP_DOWNLOAD_LOST_MESSAGE };
}
