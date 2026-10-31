# Local chat encryption design

Status: implemented for Alice Desktop (keychain key) and for the web app (browser key). The iOS app uses the desktop's keychain cipher; it has been checked in the iOS simulator, not yet on a device (see [IOS.md](../IOS.md)). The same cipher now also protects the Explorer's and the Playground's local stores through the local vault. The shared adapter contract is ready for future native wallet implementations.

## Web hardening

The browser storage changes and static-export script policy are documented in
[Web storage hardening](web-storage-hardening.md). The web adapters no longer
persist sensitive values in plaintext when no cipher is available. Those
sessions are volatile and show an exceptional storage notice. Existing
unreadable values are preserved, and practice-wallet data is loaded separately
when needed. No PIN or cryptographic unlock step is introduced.

## Objective

Stored Alice discussions remain local and are encrypted at rest when the application cipher is available. Access to the encryption key depends on the platform and storage model described below. The design works without an Alice account, synchronization server, or mandatory PIN.

## Key model

Alice Desktop has no wallet seed and must not gain access to one. Its Rust/Tauri layer generates a random 32-byte key and stores it in the operating system keychain under the Alice Desktop application identity. The key never crosses the Tauri command boundary into JavaScript.

The native layer reads the keychain once per app session, keeps the key in zeroizing process memory, and reuses it for every conversation value. This limits operating system authorization to the first access instead of prompting once per stored record.

On Alice Desktop, the webview calls `chat_storage_status` at start, which loads or creates the key and answers `ok` or one of `no-secret-service` (no D-Bus session, or no Secret Service provider such as GNOME Keyring or KWallet), `locked` or `denied` (prompt dismissed, access refused, or a stored key that cannot be used). The keychain commands run on a blocking thread, so the window keeps drawing while a keychain prompt is open. Until the check answers, every encryption call waits for it; the local vaults are configured only after it. When the check fails, `getLocalCipher()` returns null for the session: conversations and managed stores stay in memory, the app shows a keychain banner with a Retry button. A successful retry does not reload the app: the conversations kept in memory are saved first, encrypted under their own ids and merged into the stored index (a conversation saved again since then is not replaced by its older copy, and the memory copies are dropped only once all are saved). Then the local vaults reopen with the key and the profile and memory read the disk again. The session could not read the disk, so a value it wrote started from nothing: where the disk holds a value, the disk's wins and the session's is let go; only the keys the disk lacks are saved. Settings › Data then says again that the history is encrypted with the system keychain; while the keychain was unavailable it said that conversations are not saved. There is never a fallback to a WebCrypto key or a key file: those produce the same `v1:` values, so data already sealed under the keychain key would become unreadable, and nothing is written in clear.

Alice for iOS runs the same Rust code. The `keyring` crate's `apple-native` backend stores the key as a generic password item in the iOS keychain, in the app's default access group, without an accessibility attribute, so iOS applies its default (`kSecAttrAccessibleWhenUnlocked`): the item is not synchronized through iCloud Keychain, but it can move to a new device through an encrypted backup. A keychain item can survive the app's removal, while the app's web storage does not, so a reinstall finds the old key and no values sealed under it.

The shared `ChatStorageCipher` adapter gives `ChatProvider` only `encrypt` and `decrypt` operations bound to a storage context. Future wallet-native implementations can provide a wallet-derived key without making `alice-ai` import Wallet Core or receive the seed.

## Browser key model

In a browser, `packages/alice-ai/src/local-cipher.ts` generates a non-extractable AES-256-GCM key with WebCrypto and keeps it in IndexedDB (`alice-local-cipher` database, `keys` store). Non-extractability prevents exporting the key through the WebCrypto API; it does not establish how the browser protects the persisted key on disk. Managed application values are ciphertext when the cipher is available, but resistance to a complete profile copy depends on the browser, operating system and key storage. This design has not demonstrated that protection through a profile-copy test. Any script of this origin can still use the key. Values have the same shape as the desktop's (`v1:` + base64(nonce || ciphertext), the storage key as additional authenticated data), so the same stores read both. `getLocalCipher()` returns the keychain cipher on Alice Desktop and Alice for iOS, the WebCrypto cipher in a browser and in the Android app, and null where neither exists (the web adapters then keep new sensitive values in memory only).

Verified scope: the browser cipher encrypts managed application values at rest when WebCrypto is available. The WebCrypto specification does not prescribe secure persistent storage of CryptoKey objects. Non-extractability alone therefore does not demonstrate protection against complete browser-profile copies, backups, an unencrypted disk, or other applications with the same privileges. Browser persistence and operating-system protections must be evaluated separately. Where no cipher is available, the web adapters keep new sensitive values in memory rather than persisting plaintext. Existing stored values are not a guarantee of universal encryption across environments.

This design does not protect against someone opening the app on an unlocked session or software running with access to that session. Desktop keychain protection is a separate storage mechanism and must be assessed against its own threat model. A PIN could provide an additional boundary depending on its implementation; it is deliberately not required yet.

Reference: [W3C Web Cryptography, security considerations](https://www.w3.org/TR/webcrypto/#security-considerations).

## Local vault for the Explorer and the Playground

`apps/app-web/src/lib/local-vault.ts` routes the app's own stores through the same cipher: the Explorer's open tabs and session links, saved wallets (extended public keys), node overrides, the Arkade, Bark and Spark registries, the Ask Alice question history, and the Playground wallet's words and state. The Explorer vault decrypts its managed keys at start into memory; the separate Playground vault waits until it is requested. Each vault serves synchronous reads from memory, writes encrypted one value at a time per key, and re-encrypts any value found in clear (the migration from the previous releases). Readers that may run before it is ready wait for `ready()` or `whenReady`. Alice Desktop's command layer only encrypts for known contexts: the conversation and profile keys, and the Explorer and Playground key prefixes listed in `lib.rs`.

Not in the vault, by choice: preferences, dismissed notices and the chain-data cache (public blocks and transactions, cleared like any cache).

## Record format

Each desktop conversation is stored as a versioned authenticated-encryption envelope:

```text
alice-chat-encrypted:v1:v1:<base64 nonce-and-ciphertext>
```

The AsyncStorage key is authenticated as additional data. Every write uses a fresh random nonce. The session index is encrypted too, so titles, timestamps, and message counts are not left in plaintext.

## Migration

1. Detect the existing plaintext index and session records.
2. Open or create the desktop key in the system keychain.
3. Encrypt and verify each plaintext session before replacing it.
4. Encrypt and verify the index after the sessions.
5. Accept mixed encrypted/plaintext state so an interrupted migration resumes safely.

Authentication failures stop reads and writes rather than replacing protected data with an empty history.

## Tests required before release

- ciphertext never contains titles or message excerpts;
- a different wallet cannot decrypt the records;
- wrong or modified ciphertext fails closed;
- every write uses a distinct nonce;
- migration preserves all valid messages and variants;
- interrupted migration resumes safely;
- cleanup operations work before and after migration;
- future iOS and Android storage adapters pass the same contract tests; the web adapter and the local vault have theirs (`local-cipher.test.ts`, `local-vault.test.ts`).
