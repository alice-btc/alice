import type { AliceMemoryStorage } from './alice-memory-core';
import { getLocalCipher, isLocalCipherValue } from './local-cipher';

const MEMORY_KEY = 'alice_personal_memory_v1';
const MEMORY_CONTEXT = 'alice_personal_memory_v1';

function localMemoryStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// The memory rests encrypted on every device that has a cipher (the
// keychain on Alice Desktop, a non-extractable WebCrypto key in a browser);
// a value written in clear before that is still read, and encrypted on its
// next write.
export const aliceMemoryStorage: AliceMemoryStorage = {
  read: async () => {
    const value = localMemoryStorage()?.getItem(MEMORY_KEY) ?? null;
    if (!value || !isLocalCipherValue(value)) return value;
    const cipher = getLocalCipher();
    if (!cipher) throw new Error('Alice Memory is encrypted and this device cannot decrypt it.');
    return cipher.decrypt(value, MEMORY_CONTEXT);
  },
  write: async value => {
    const storage = localMemoryStorage();
    if (!storage) throw new Error('Browser storage is unavailable.');
    const cipher = getLocalCipher();
    storage.setItem(MEMORY_KEY, cipher ? await cipher.encrypt(value, MEMORY_CONTEXT) : value);
  },
  remove: async () => { localMemoryStorage()?.removeItem(MEMORY_KEY); },
};
