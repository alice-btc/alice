// Hands the device cipher to the local vault. Imported once by the app
// shell (chat-provider.tsx), before anything renders, so every store of the
// Explorer and the Playground encrypts from the first write. Kept apart from
// local-vault.ts so that module stays free of the AI package at runtime and
// its tests run under plain Node.

import { getWebStorageCipher, onWebStorageCipherRecovered, whenWebStorageCipherSettled } from './storage-cipher.ts';
import { localVault } from './local-vault.ts';
import { observeVaultHealth } from './local-vault-health.ts';

observeVaultHealth(localVault);

// At once in a browser; on Alice Desktop once the keychain has answered, so a
// keychain that failed leaves the vault memory-only (volatile) rather than
// holding a cipher that cannot work. Until then the vault keeps what is
// written in memory and its readers wait.
whenWebStorageCipherSettled(() => {
  localVault.configure(getWebStorageCipher);
  // Start decrypting now, so the stores find their values by the time a page
  // mounts rather than on their first read.
  void localVault.ready();
});
// The keychain came back after a failure: the vault takes the key and saves
// what the session kept that the disk does not hold (see LocalVault.reopen).
onWebStorageCipherRecovered(() => localVault.reopen());
