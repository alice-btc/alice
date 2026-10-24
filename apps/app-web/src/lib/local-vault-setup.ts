// Hands the device cipher to the local vault. Imported once by the app
// shell (chat-provider.tsx), before anything renders, so every store of the
// Explorer and the Playground encrypts from the first write. Kept apart from
// local-vault.ts so that module stays free of the AI package at runtime and
// its tests run under plain Node.

import { getWebStorageCipher } from './storage-cipher.ts';
import { localVault } from './local-vault.ts';
import { observeVaultHealth } from './local-vault-health.ts';

observeVaultHealth(localVault);

localVault.configure(getWebStorageCipher);
// Start decrypting now, so the stores find their values by the time a page
// mounts rather than on their first read.
void localVault.ready();
