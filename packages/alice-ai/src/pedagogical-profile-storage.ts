import { getLocalCipher } from './local-cipher';
import { createProtectedBrowserValue } from './browser-storage-security';
import type { PedagogicalProfileStorage } from './pedagogical-profile-core';

const current = createProtectedBrowserValue(
  'alice_learning_profile_v3', 'alice_learning_profile_v3', localProfileStorage, getLocalCipher,
);
const legacy = createProtectedBrowserValue(
  'alice_pedagogical_profile_v1', 'alice_pedagogical_profile_v2', localProfileStorage, getLocalCipher,
);
export const pedagogicalProfileStorage: PedagogicalProfileStorage = {
  ...current,
  readLegacy: legacy.read,
  removeLegacy: legacy.remove,
};

function localProfileStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
