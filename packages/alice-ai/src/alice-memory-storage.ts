import type { AliceMemoryStorage } from './alice-memory-core';
import { getLocalCipher } from './local-cipher';
import { createProtectedBrowserValue } from './browser-storage-security';

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

export const aliceMemoryStorage: AliceMemoryStorage = createProtectedBrowserValue(
  MEMORY_KEY, MEMORY_CONTEXT, localMemoryStorage, getLocalCipher,
);
