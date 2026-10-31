import { getLocalCipher, type LocalCipher } from '../../../../packages/alice-ai/src/local-cipher.ts';
import { reportBrowserStorageIssue, storageIssueFor } from '../../../../packages/alice-ai/src/browser-storage-security.ts';

// The chat-storage envelope around a local cipher value (see chat-storage.ts).
const ENCRYPTED_CHAT_PREFIX = 'alice-chat-encrypted:v1:';
const temporaryChat = new Map<string, string>();
function isChat(key: string): boolean {
  return key === 'alice_chat_sessions' || key.startsWith('alice_chat_session_');
}
function memoryOnly(key: string): boolean {
  if (!isChat(key) || getLocalCipher()) return false;
  reportBrowserStorageIssue('temporary');
  return true;
}
/** Rejects unless `value` is absent, legacy plaintext, or ciphertext that
 *  authenticates under this key. */
async function authenticateStored(key: string, value: string | null, cipher: LocalCipher): Promise<void> {
  if (value === null || !value.startsWith(ENCRYPTED_CHAT_PREFIX)) return;
  try { await cipher.decrypt(value.slice(ENCRYPTED_CHAT_PREFIX.length), key); }
  catch (error) { reportBrowserStorageIssue(storageIssueFor(error, 'unreadable')); throw error; }
}
async function writeChat(key: string, value: string): Promise<void> {
  const cipher = getLocalCipher();
  // The shared chat API also serves native callers without a cipher. The
  // web adapter refuses accidental plaintext writes from those call sites,
  // and accepts only a value that authenticates under this key.
  if (!cipher || !value.startsWith(ENCRYPTED_CHAT_PREFIX)) {
    throw new Error('Chat persistence requires encryption.');
  }
  await cipher.decrypt(value.slice(ENCRYPTED_CHAT_PREFIX.length), key);
  // Never replace a record that does not authenticate, including one another
  // tab wrote while authentication was pending. No await separates the
  // final comparison from the synchronous write. This is not a transaction
  // across browser processes.
  let verified = localStorage.getItem(key);
  await authenticateStored(key, verified, cipher);
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = localStorage.getItem(key);
    if (current === verified) {
      localStorage.setItem(key, value);
      return;
    }
    await authenticateStored(key, current, cipher);
    verified = current;
  }
  throw new Error('Local data changed during the write. Please retry.');
}
/** Forgets the chats this page kept in memory, once they are saved
 *  encrypted (see storage-cipher.ts, when the keychain comes back). */
export function clearTemporaryChats(): void {
  temporaryChat.clear();
}
const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    if (memoryOnly(key)) return temporaryChat.get(key) ?? null;
    try { return localStorage.getItem(key); }
    catch (error) { if (isChat(key)) reportBrowserStorageIssue('unreadable'); throw error; }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    if (memoryOnly(key)) { temporaryChat.set(key, value); return; }
    try {
      if (isChat(key)) await writeChat(key, value);
      else localStorage.setItem(key, value);
    } catch (error) { if (isChat(key)) reportBrowserStorageIssue(storageIssueFor(error, 'write-failed')); throw error; }
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    // An explicit delete also reaches records stored earlier, without a
    // cipher too: removing a value never writes plaintext.
    try {
      localStorage.removeItem(key);
      temporaryChat.delete(key);
    }
    catch (error) { if (isChat(key)) reportBrowserStorageIssue('write-failed'); throw error; }
  },
  async multiRemove(keys: string[]): Promise<void> {
    for (const key of keys) await AsyncStorage.removeItem(key);
  },
  /** Stored keys and this page's temporary chat keys. */
  async getAllKeys(): Promise<string[]> {
    if (typeof window === 'undefined') return [];
    try {
      const keys = new Set(temporaryChat.keys());
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key !== null) keys.add(key);
      }
      return [...keys];
    } catch (error) { reportBrowserStorageIssue('write-failed'); throw error; }
  },
};
export default AsyncStorage;
