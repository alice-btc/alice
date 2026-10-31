import { LocalVault } from './local-vault.ts';
import { getWebStorageCipher, onWebStorageCipherRecovered, whenWebStorageCipherSettled } from './storage-cipher.ts';
import { observeVaultHealth } from './local-vault-health.ts';

// Practice-wallet words and state are not decrypted with the chat shell.
// The Playground (or its Explorer card) calls ready() only when it needs them.
export const playgroundVault = new LocalVault(() => {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage; } catch { return null; }
}, undefined, [], ['alice.test-wallet.']);
observeVaultHealth(playgroundVault);
// Configured once the device cipher is settled (see local-vault-setup.ts);
// ready() waits for it.
whenWebStorageCipherSettled(() => playgroundVault.configure(getWebStorageCipher));
onWebStorageCipherRecovered(() => playgroundVault.reopen());
