'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  type ChatCleanupMode,
  type ChatStorageSummary,
  hasKeychainCipher,
  isTauriMobile,
  localCipherStatus,
  subscribeLocalCipherStatus,
  useChat,
  MAX_CHAT_SESSIONS,
} from '@alice-wallet/alice-ai';
import { useT } from '@/i18n';
import { ConfirmDialog, SectionLabel, sectionStyle } from './ui';
import { LearnLanguagesSection } from './LearnLanguagesSection';

function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DataTab() {
  const t = useT();
  const cipherStatus = useSyncExternalStore(subscribeLocalCipherStatus, localCipherStatus, () => 'pending' as const);
  const chat = useChat();
  const [chatStorage, setChatStorage] = useState<ChatStorageSummary | null>(null);
  const [confirmChatCleanup, setConfirmChatCleanup] = useState<ChatCleanupMode | null>(null);
  const [cleaningChat, setCleaningChat] = useState(false);
  const [cleanupNotice, setCleanupNotice] = useState('');

  useEffect(() => {
    chat.getSessionStorageSummary()
      .then(setChatStorage)
      .catch(() => { /* the counters simply stay at zero */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChatCleanup = async (mode: ChatCleanupMode) => {
    setCleaningChat(true);
    setCleanupNotice('');
    try {
      const result = await chat.cleanSessionHistory(mode);
      setChatStorage(await chat.getSessionStorageSummary());
      setCleanupNotice(t.plural('settings.data.deleted', result.deletedCount));
    } catch (error) {
      console.warn('[settings] chat cleanup failed:', error);
      setCleanupNotice(t('settings.data.cleanFailed'));
    } finally {
      setCleaningChat(false);
      setConfirmChatCleanup(null);
    }
  };

  const count = chatStorage?.count ?? 0;
  const chatCleanupCount = confirmChatCleanup === 'all'
    ? count
    : confirmChatCleanup === 'oldest-10'
      ? Math.min(10, count)
      : Math.max(0, count - 10);

  return (
    <>
      <div style={sectionStyle}>
        <SectionLabel>{t('settings.data.cleanHistory')}</SectionLabel>
        <div className="flex items-center justify-between gap-3 mt-2">
          <span className="font-numbers" style={{ fontSize: 13 }}>
            {t('settings.data.conversationCount', { count, max: MAX_CHAT_SESSIONS })}
          </span>
          <span className="font-numbers" style={{ fontSize: 13, opacity: 1 }}>
            {formatStorageSize(chatStorage?.estimatedBytes ?? 0)}
          </span>
        </div>
        <p className="font-numbers m-0 mt-3" style={{ fontSize: 14, lineHeight: '19px', opacity: 1 }}>
          {t('settings.data.storageNote', { max: MAX_CHAT_SESSIONS })}
        </p>
        <p className="font-numbers  m-0 mt-2" style={{ fontSize: 13, color: 'var(--alice-primary-dark)' }}>
          {hasKeychainCipher()
            // Said encrypted only once the keychain has given its key.
            ? t(cipherStatus === 'ok'
              ? 'settings.data.keychain'
              : cipherStatus === 'pending'
                ? 'settings.data.keychainChecking'
                : 'settings.data.keychainUnavailable')
            : isTauriMobile()
              ? t('settings.data.mobileStorage')
              : t('settings.data.browser')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => setConfirmChatCleanup('oldest-10')}
            className="alice-control alice-control--quiet font-numbers"
            disabled={count === 0 || cleaningChat}
          >
            {t('settings.data.deleteOldest')}
          </button>
          <button
            onClick={() => setConfirmChatCleanup('keep-newest-10')}
            className="alice-control alice-control--quiet font-numbers"
            disabled={count <= 10 || cleaningChat}
          >
            {t('settings.data.keepNewest')}
          </button>
          <button
            onClick={() => setConfirmChatCleanup('all')}
            className="alice-control alice-control--danger font-numbers"
            disabled={cleaningChat}
          >
            {t('settings.data.deleteAll')}
          </button>
        </div>
        {cleanupNotice && (
          <p role="status" className="font-numbers m-0 mt-3" style={{ fontSize: 14, opacity: 1 }}>
            {cleanupNotice}
          </p>
        )}
      </div>

      <LearnLanguagesSection />

      {confirmChatCleanup && (
        <ConfirmDialog
          title={t('settings.data.confirmTitle')}
          body={confirmChatCleanup === 'all'
            ? t('settings.data.confirmAll')
            : t.plural('settings.data.confirmSome', chatCleanupCount)}
          confirmLabel={cleaningChat ? t('settings.data.deleting') : t('settings.data.delete')}
          busy={cleaningChat}
          onCancel={() => setConfirmChatCleanup(null)}
          onConfirm={() => void handleChatCleanup(confirmChatCleanup)}
        />
      )}
    </>
  );
}
