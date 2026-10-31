import {
  checkLocalCipher,
  getLocalCipher,
  retryLocalCipher,
  type KeychainFailure,
  type LocalCipher,
} from '../../../../packages/alice-ai/src/local-cipher.ts';
import { isTauriDesktop } from '../../../../packages/alice-ai/src/tauri-runtime.ts';
import {
  clearBrowserStorageIssues,
  reportBrowserStorageIssue,
  storageIssueFor,
} from '../../../../packages/alice-ai/src/browser-storage-security.ts';
import {
  listSessions,
  loadSession,
  restoreSession,
  type ChatSession,
} from '../../../../packages/alice-ai/src/chat-storage.ts';
import { clearTemporaryChats } from './async-storage-web.ts';

let checking: Promise<KeychainFailure | null> | null = null;
/** The start check of the device cipher, reported once: on Alice Desktop a
 *  keychain that cannot give its key turns the session temporary. */
function checkWebStorageCipher(): Promise<KeychainFailure | null> {
  checking ??= checkLocalCipher().then(failure => {
    if (failure && typeof window !== 'undefined') reportBrowserStorageIssue('keychain-unavailable');
    return failure;
  });
  return checking;
}

/**
 * Runs `callback` once the device cipher is settled: at once in a browser,
 * after the keychain check on Alice Desktop. For the stores that pick their
 * cipher once (the local vaults), so a desktop whose keychain failed opens
 * them memory-only instead of with a cipher that cannot work.
 */
export function whenWebStorageCipherSettled(callback: () => void): void {
  if (!isTauriDesktop()) { callback(); return; }
  void checkWebStorageCipher().then(callback);
}

type RecoveryListener = () => void | Promise<void>;
const recoveryListeners = new Set<RecoveryListener>();
/**
 * Called when the keychain comes back during a session that ran in memory:
 * the stores that picked their cipher once (the vaults, the chat provider)
 * take it now, after the conversations are saved. Returns the unsubscribe.
 */
export function onWebStorageCipherRecovered(listener: RecoveryListener): () => void {
  recoveryListeners.add(listener);
  return () => { recoveryListeners.delete(listener); };
}

/**
 * The banner's Retry: asks the keychain again. When it answers, nothing is
 * reloaded: the conversations kept in memory are saved encrypted under their
 * own ids first, before any store takes the key, then the vaults reopen with
 * it and the profile and memory read the disk again. What the disk already
 * holds wins over what the session wrote without reading it (see
 * LocalVault.reopen and createProtectedBrowserValue). Resolves with null on
 * success, or with the failure, the session staying in memory.
 */
export async function retryWebStorageCipher(): Promise<KeychainFailure | null> {
  let kept: Array<{ session: ChatSession; messages: Awaited<ReturnType<typeof loadSession>> }> = [];
  const failure = await retryLocalCipher(async () => {
    // Read while the chat storage still answers from memory.
    const sessions = await listSessions().catch(() => [] as ChatSession[]);
    for (const session of sessions) {
      const messages = await loadSession(session.id).catch(() => []);
      if (messages.length) kept.push({ session, messages });
    }
  });
  if (failure) return failure;
  checking = Promise.resolve(null);
  const cipher = getWebStorageCipher();
  // The conversations first: a reply saved once the provider has the key
  // would otherwise race this copy for the index.
  let saved = true;
  if (cipher) {
    // Oldest first, so each lands in its place in the index.
    kept = kept.sort((a, b) => a.session.updatedAt - b.session.updatedAt);
    for (const { session, messages } of kept) {
      try { await restoreSession(session, messages, cipher); } catch { saved = false; }
    }
    // The memory copies go only once every one is on disk; otherwise the
    // banner says the conversations were not saved.
    if (saved) clearTemporaryChats();
    else reportBrowserStorageIssue('write-failed');
  }
  clearBrowserStorageIssues(['keychain-unavailable', 'temporary']);
  for (const listener of [...recoveryListeners]) {
    try { await listener(); } catch { /* each store reports its own failures */ }
  }
  return null;
}

/** Tests only. */
export function resetWebStorageCipherForTests(): void {
  checking = null;
  recoveryListeners.clear();
}

const wrapped = new WeakMap<LocalCipher, LocalCipher>();
export function getWebStorageCipher(): LocalCipher | null {
  if (isTauriDesktop()) void checkWebStorageCipher();
  const cipher = getLocalCipher();
  if (!cipher) {
    if (typeof window !== 'undefined') reportBrowserStorageIssue('temporary');
    return null;
  }
  let reporting = wrapped.get(cipher);
  if (!reporting) {
    reporting = {
      async encrypt(value, context) {
        try { return await cipher.encrypt(value, context); }
        catch (error) { reportBrowserStorageIssue(storageIssueFor(error, 'write-failed')); throw error; }
      },
      async decrypt(value, context) {
        try { return await cipher.decrypt(value, context); }
        catch (error) { reportBrowserStorageIssue(storageIssueFor(error, 'unreadable')); throw error; }
      },
    };
    wrapped.set(cipher, reporting);
  }
  return reporting;
}
