import { PROXY_URL } from './site';

// A click on a Download button, counted by platform.
//
// One request to Alice's own proxy carrying the platform and nothing else: no
// cookie, no identifier, nothing about the page or the visitor. The proxy adds
// 1 to that platform's total for the day. It tells us whether people who reach
// the site try to get the app, which GitHub's download counters alone cannot.

export type DownloadClickPlatform =
  | 'ios'
  | 'android'
  | 'desktop-macos'
  | 'desktop-windows'
  | 'desktop-linux';

export function countDownloadClick(platform: DownloadClickPlatform): void {
  try {
    // text/plain keeps this a simple request, with no preflight before it, and
    // keepalive lets it finish while the browser is already leaving the page.
    void fetch(`${PROXY_URL}/site/events`, {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({ platform }),
    }).catch(() => {});
  } catch {
    // A counter must never stand between a visitor and a download.
  }
}
