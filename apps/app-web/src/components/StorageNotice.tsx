'use client';

import { useSyncExternalStore } from 'react';
import { browserStorageIssues, subscribeBrowserStorageIssues } from '@alice-wallet/alice-ai';

export function StorageNotice() {
  const issues = useSyncExternalStore(subscribeBrowserStorageIssues, browserStorageIssues, () => '');
  if (!issues) return null;
  const temporaryOnly = issues === 'temporary';
  return (
    <div role="status" className="px-4 py-2 text-xs text-center border-b border-[var(--alice-border)] bg-[var(--alice-bg)] text-[var(--alice-text-muted)]">
      {temporaryOnly
        ? 'Temporary session. This browser cannot securely save your activity. New activity will be lost when you close or reload this page.'
        : 'Local storage is unavailable or some saved data could not be read. Existing data has been preserved; recent changes may not be saved.'}
    </div>
  );
}
