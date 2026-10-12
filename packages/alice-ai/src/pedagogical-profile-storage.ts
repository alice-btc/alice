import { getLocalCipher, isLocalCipherValue } from './local-cipher';

const PROFILE_KEY = 'alice_learning_profile_v3';
const LEGACY_PROFILE_KEY = 'alice_pedagogical_profile_v1';
const PROFILE_CONTEXT = 'alice_learning_profile_v3';
const LEGACY_PROFILE_CONTEXT = 'alice_pedagogical_profile_v2';

import type { PedagogicalProfileStorage } from './pedagogical-profile-core';

// Browser storage is intentionally local to the browser profile. The value
// rests encrypted on every device that has a cipher: the keychain key on
// Alice Desktop, a non-extractable WebCrypto key in a browser. A value
// written in clear before that is still read, and encrypted on its next write.
async function readEncrypted(value: string | null, context: string): Promise<string | null> {
  if (!value || !isLocalCipherValue(value)) return value;
  const cipher = getLocalCipher();
  if (!cipher) throw new Error('The learning profile is encrypted and this device cannot decrypt it.');
  return cipher.decrypt(value, context);
}

export const pedagogicalProfileStorage: PedagogicalProfileStorage = {
  read: async () => readEncrypted(localProfileStorage()?.getItem(PROFILE_KEY) ?? null, PROFILE_CONTEXT),
  write: async value => {
    const storage = localProfileStorage();
    if (!storage) throw new Error('Browser storage is unavailable.');
    const cipher = getLocalCipher();
    storage.setItem(PROFILE_KEY, cipher ? await cipher.encrypt(value, PROFILE_CONTEXT) : value);
  },
  remove: async () => { localProfileStorage()?.removeItem(PROFILE_KEY); },
  readLegacy: async () => readEncrypted(localProfileStorage()?.getItem(LEGACY_PROFILE_KEY) ?? null, LEGACY_PROFILE_CONTEXT),
  removeLegacy: async () => { localProfileStorage()?.removeItem(LEGACY_PROFILE_KEY); },
};

function localProfileStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
