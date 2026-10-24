import { LocalVault } from './local-vault.ts';
import { getWebStorageCipher } from './storage-cipher.ts';
import { observeVaultHealth } from './local-vault-health.ts';

// Practice-wallet words and state are not decrypted with the chat shell.
// The Playground (or its Explorer card) calls ready() only when it needs them.
export const playgroundVault = new LocalVault(() => {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage; } catch { return null; }
}, getWebStorageCipher, [], ['alice.test-wallet.']);
observeVaultHealth(playgroundVault);
