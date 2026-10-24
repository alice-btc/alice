import { getLocalCipher, type LocalCipher } from '../../../../packages/alice-ai/src/local-cipher.ts';
import { reportBrowserStorageIssue } from '../../../../packages/alice-ai/src/browser-storage-security.ts';

const wrapped = new WeakMap<LocalCipher, LocalCipher>();
export function getWebStorageCipher(): LocalCipher | null {
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
        catch (error) { reportBrowserStorageIssue('write-failed'); throw error; }
      },
      async decrypt(value, context) {
        try { return await cipher.decrypt(value, context); }
        catch (error) { reportBrowserStorageIssue('unreadable'); throw error; }
      },
    };
    wrapped.set(cipher, reporting);
  }
  return reporting;
}
