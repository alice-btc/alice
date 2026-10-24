import type { ChatStorageCipher } from './chat-storage.ts';

export type BrowserStorageIssue = 'temporary' | 'unreadable' | 'write-failed';
const issues = new Set<BrowserStorageIssue>();
const listeners = new Set<() => void>();
export function reportBrowserStorageIssue(issue: BrowserStorageIssue): void {
  if (issues.has(issue)) return;
  issues.add(issue);
  for (const listener of listeners) listener();
}
export function browserStorageIssues(): string { return [...issues].sort().join(','); }
export function subscribeBrowserStorageIssues(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** An encrypted value with an in-memory session when no cipher is available.
 * Read failures never turn into permission to overwrite an existing value;
 * only an explicit remove() deletes what is stored. */
export function createProtectedBrowserValue(
  key: string,
  context: string,
  backing: () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null,
  getCipher: () => ChatStorageCipher | null,
  report: (issue: BrowserStorageIssue) => void = reportBrowserStorageIssue,
) {
  let temporary: string | null = null;
  let queue = Promise.resolve();
  const decode = async (raw: string | null, cipher: ChatStorageCipher) => {
    if (raw === null || !raw.startsWith('v1:')) return raw;
    try { return await cipher.decrypt(raw, context); }
    catch (error) { report('unreadable'); throw error; }
  };
  const serial = (operation: () => Promise<void>) => {
    const result = queue.then(operation);
    queue = result.catch(() => {});
    return result;
  };
  return {
    async read(): Promise<string | null> {
      await queue;
      const cipher = getCipher();
      if (!cipher) { report('temporary'); return temporary; }
      try { return await decode(backing()?.getItem(key) ?? null, cipher); }
      catch (error) { report('unreadable'); throw error; }
    },
    write(value: string): Promise<void> {
      return serial(async () => {
        const cipher = getCipher();
        if (!cipher) { temporary = value; report('temporary'); return; }
        try {
          const storage = backing();
          if (!storage) throw new Error('Browser storage is unavailable.');
          // Also validate when a caller writes before its first read.
          let verified = storage.getItem(key);
          await decode(verified, cipher);
          const encrypted = await cipher.encrypt(value, context);
          if (!encrypted.startsWith('v1:')) throw new Error('Invalid encrypted storage value.');
          // Encryption yields to other tabs. Recheck any value they wrote
          // before replacing it; keep an unreadable value intact.
          for (let attempt = 0; attempt < 3; attempt++) {
            const current = storage.getItem(key);
            if (current !== verified) {
              await decode(current, cipher);
              verified = current;
              continue;
            }
            storage.setItem(key, encrypted);
            return;
          }
          throw new Error('Local data changed during the write. Please retry.');
        } catch (error) { report('write-failed'); throw error; }
      });
    },
    remove(): Promise<void> {
      return serial(async () => {
        if (!getCipher()) report('temporary');
        // This is an explicit delete/reset operation, not a failed-read
        // fallback. It reaches the stored value with or without a cipher,
        // legacy plaintext and unreadable ciphertext alike, and writes nothing.
        try {
          const storage = backing();
          if (!storage) throw new Error('Browser storage is unavailable.');
          storage.removeItem(key);
          temporary = null;
        } catch (error) { report('write-failed'); throw error; }
      });
    },
  };
}
