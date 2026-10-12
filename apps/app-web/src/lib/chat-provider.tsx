'use client';

// First of all: hand the device cipher to the local vault, so every store
// encrypts from its first write.
import '@/lib/local-vault-setup';
import { Suspense, useEffect, useState } from 'react';
import {
  AccountProvider,
  ChatProvider,
  loadRagCorpus,
  restoreDownloadedPacks,
  checkForPackUpdates,
  KNOWLEDGE_PACK_CATALOG,
  getLocalCipher,
  type ChatStorageCipher,
} from '@alice-wallet/alice-ai';
import { AppUpdateNotices } from '@/components/AppUpdateNotices';
import { MenuCommands } from '@/components/MenuCommands';
import { ModelDownloadToasts } from '@/components/ModelDownloadToasts';
import { AccountPasswordDialog } from '@/components/AccountPasswordDialog';
import { PaymentConfirmedDialog } from '@/components/PaymentConfirmedDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import { initThemeFromStorage } from '@/lib/theme-init';
import { registerLearnTurnContext } from '@/lib/learn/turn-context';

export function ChatProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // The conversations rest encrypted on every device that has a cipher: the
  // keychain key on Alice Desktop, a non-extractable WebCrypto key in a
  // browser (see alice-ai's local-cipher.ts).
  const [storageCipher] = useState<ChatStorageCipher | undefined>(
    () => getLocalCipher() ?? undefined,
  );
  // Desktop and web have the headroom to load the corpus right away, so the
  // first question never waits for it.
  useEffect(() => { void loadRagCorpus(); }, []);

  useEffect(() => {
    initThemeFromStorage();
    // When a question points at a course, its chapter joins the turn context
    // (local model included: the pack is on this device).
    registerLearnTurnContext();
    void restoreDownloadedPacks().then(() => {
      // Silent, throttled to once per day: only refreshes packs already
      // downloaded, never fetches anything new on its own.
      void checkForPackUpdates(KNOWLEDGE_PACK_CATALOG);
    });
    // The semantic search model (~150 MB) is deliberately NOT preloaded here:
    // its download starts on the first question (rag.ts asks the runtime),
    // never on a data-saving connection, and Settings › AI can force or
    // remove it. Retrieval stays lexical until the model is ready.
  }, []);

  return (
    <AccountProvider>
      <ChatProvider storageCipher={storageCipher}>
        <div className="alice-app-frame">
          <MenuCommands />
          <div className="alice-app-viewport">
            <ModelDownloadToasts />
            {children}
          </div>
          {/* useSearchParams needs a boundary so the rest of the tree can still
              be prerendered. */}
          <Suspense fallback={null}>
            <SettingsDialog />
          </Suspense>
          <AccountPasswordDialog />
          {/* Above the account dialog: a settled payment can land at any moment,
              wherever the user happens to be. */}
          <PaymentConfirmedDialog />
          <AppUpdateNotices />
        </div>
      </ChatProvider>
    </AccountProvider>
  );
}
