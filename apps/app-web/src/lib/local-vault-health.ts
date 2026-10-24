import type { LocalVault } from './local-vault.ts';
import { reportBrowserStorageIssue } from '../../../../packages/alice-ai/src/browser-storage-security.ts';

/** Pending writes are normal. Report only after their queue has settled. */
export function observeVaultHealth(vault: LocalVault): () => void {
  return vault.subscribe(() => {
    if (typeof window === 'undefined') return;
    const status = vault.status();
    if (status.mode === 'volatile') reportBrowserStorageIssue('temporary');
    if (status.readFailed || status.unreadable.length) reportBrowserStorageIssue('unreadable');
    if (status.mode === 'encrypted' && status.unsaved.length) {
      queueMicrotask(() => {
        void vault.flush().catch(() => reportBrowserStorageIssue('write-failed'));
      });
    }
  });
}
