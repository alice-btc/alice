import { isTauriApp, isTauriMobile, tauriInvoke } from '@alice-wallet/alice-ai';

// Tauri's plugins are invoked over the raw IPC channel, to avoid adding
// @tauri-apps/api as a dependency just for this one call. The desktop opens
// links through plugin-shell; Android and iOS through plugin-opener, which
// also sends their target="_blank" links to the system browser. A
// window.open() call does nothing in those webviews: use this instead.
export async function openExternalUrl(url: string): Promise<void> {
  if (isTauriMobile()) {
    await tauriInvoke('plugin:opener|open_url', { url });
    return;
  }
  if (isTauriApp()) {
    await tauriInvoke('plugin:shell|open', { path: url });
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

