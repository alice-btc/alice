'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import {
  browserStorageIssues,
  localCipherStatus,
  subscribeBrowserStorageIssues,
  subscribeLocalCipherStatus,
  type KeychainFailure,
  useChat,
} from '@alice-wallet/alice-ai';
import { useT, type MessageKey } from '@/i18n';
import { retryWebStorageCipher } from '@/lib/storage-cipher';

const KEYCHAIN_MESSAGE: Record<KeychainFailure, MessageKey> = {
  'no-secret-service': 'storage.keychain.noService',
  locked: 'storage.keychain.locked',
  denied: 'storage.keychain.denied',
};

/** The keychain names Linux users know; elsewhere the generic one. */
function keychainName(): MessageKey {
  const linux = typeof navigator !== 'undefined' && /linux/i.test(navigator.userAgent) && !/android/i.test(navigator.userAgent);
  return linux ? 'storage.keychain.nameLinux' : 'storage.keychain.name';
}

export function StorageNotice() {
  const t = useT();
  const { refreshSessions } = useChat();
  // The provider re-renders with the key once the keychain is back; the
  // refresh after a retry must be that render's, not this click's, which
  // still reads without a cipher.
  const refreshRef = useRef(refreshSessions);
  refreshRef.current = refreshSessions;
  const issues = useSyncExternalStore(subscribeBrowserStorageIssues, browserStorageIssues, () => '');
  const status = useSyncExternalStore(subscribeLocalCipherStatus, localCipherStatus, () => 'pending' as const);
  const [retrying, setRetrying] = useState(false);
  if (!issues) return null;
  const failure = status === 'no-secret-service' || status === 'locked' || status === 'denied' ? status : null;
  if (issues.split(',').includes('keychain-unavailable') && failure) {
    const retry = async () => {
      setRetrying(true);
      // On success the session's conversations are saved with the key,
      // without a reload, and this banner goes away.
      const failure = await retryWebStorageCipher();
      setRetrying(false);
      if (!failure) await refreshRef.current().catch(() => {});
    };
    return (
      <div role="alert" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2 text-xs text-center border-b border-[var(--alice-warning)] bg-[var(--alice-warning-soft)] text-[var(--alice-text)]">
        <span>{t(KEYCHAIN_MESSAGE[failure], { keychain: t(keychainName()) })}</span>
        <button type="button" className="alice-control alice-control--primary font-numbers shrink-0" disabled={retrying} onClick={() => void retry()}>
          {retrying ? t('storage.keychain.retrying') : t('storage.keychain.retry')}
        </button>
      </div>
    );
  }
  const temporaryOnly = issues === 'temporary';
  return (
    <div role="status" className="px-4 py-2 text-xs text-center border-b border-[var(--alice-border)] bg-[var(--alice-bg)] text-[var(--alice-text-muted)]">
      {temporaryOnly
        ? t('storage.temporary')
        : t('storage.unavailable')}
    </div>
  );
}
