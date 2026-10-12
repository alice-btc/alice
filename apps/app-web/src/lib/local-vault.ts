// The local vault: what the Explorer and the Playground keep on this device
// goes through here instead of straight into localStorage, so it rests on
// disk encrypted. The cipher is the device's (alice-ai's getLocalCipher: the
// keychain on Alice Desktop, a non-extractable WebCrypto key in a browser),
// handed to the vault by local-vault-setup.ts when the app shell loads; each
// value is bound to its own storage key.
//
// The stores read synchronously, as they always did, from an in-memory copy
// the vault fills once at start by decrypting every managed key; writes land
// in memory at once and are persisted, encrypted, right after, one at a
// time per key so the last write wins. Values found in clear (written before
// the vault existed) are read as they are and re-written encrypted: the
// migration is silent and complete after one start. A value this device can
// no longer read (its key was lost with the browser profile) is left in
// place and invisible; the next write replaces it.
//
// Until the app has handed over the cipher, the vault keeps everything in
// memory and writes nothing: a read sees nothing, a write never lands in
// clear. Where the device has no cipher at all (no WebCrypto, or Node in
// tests) the vault is a plain window onto localStorage, so the stores and
// their tests behave as before. Readers that may run before the vault is
// ready wait for `ready()` or `whenReady`.

import type { ChatStorageCipher } from '@alice-wallet/alice-ai';

export type LocalCipher = ChatStorageCipher;

/** A provider of the device cipher: null when the device has none. */
export type LocalCipherProvider = () => LocalCipher | null;

/** The exact keys and the key prefixes the vault owns. Anything else stays
 *  in localStorage in clear (preferences, dismissed notices). */
export const VAULT_KEYS: readonly string[] = [
  'explorer.tabs.v1',
  'explorer.session-tabs.v1',
  'explorer.pending-open.v1',
  'alice_explorer_wallets',
  'alice_arkade_settlements_v1',
  'alice_arkade_frontier_v1',
  'alice_bark_rounds_v2',
  'alice_bark_frontier_v1',
  'alice_spark_onchain_v2',
  'alice_spark_deposits_v1',
  'alice.ask-alice.questions',
];
export const VAULT_PREFIXES: readonly string[] = ['alice_explorer_node_', 'alice.test-wallet.'];

// The shape every local cipher produces (see alice-ai's local-cipher.ts).
const CIPHER_VALUE_PREFIX = 'v1:';
function isCipherValue(value: string): boolean {
  return value.startsWith(CIPHER_VALUE_PREFIX);
}

/** What a store sees: localStorage's three calls, plus readiness. */
export interface VaultStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** True once every managed value has been read (at once without a cipher). */
  readonly isReady: boolean;
  ready(): Promise<void>;
  whenReady(callback: () => void): void;
}

type Backing = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

export class LocalVault implements VaultStorage {
  private readonly values = new Map<string, string>();
  private readonly writes = new Map<string, Promise<void>>();
  private readonly readyListeners: Array<() => void> = [];
  private provider: LocalCipherProvider | undefined;
  private cipherResolved: LocalCipher | null | undefined;
  private loading: Promise<void> | null = null;
  private readonly backing: () => Backing | null;
  private readonly keys: readonly string[];
  private readonly prefixes: readonly string[];
  private loaded = false;

  /** True once every managed value has been read; at once in plain mode. */
  get isReady(): boolean {
    return this.loaded || (this.provider !== undefined && this.plain());
  }

  /** `provider` undefined means "not configured yet": memory only, nothing
   *  written, until `configure` hands the device cipher over. */
  constructor(
    backing: () => Backing | null,
    provider?: LocalCipherProvider,
    keys: readonly string[] = VAULT_KEYS,
    prefixes: readonly string[] = VAULT_PREFIXES,
  ) {
    this.backing = backing;
    this.provider = provider;
    this.keys = keys;
    this.prefixes = prefixes;
  }

  /** Hand the device cipher over (once, at app start). A load that was
   *  waiting for it starts now. */
  configure(provider: LocalCipherProvider): void {
    if (this.provider) return;
    this.provider = provider;
    if (this.loading || this.readyListeners.length) {
      this.loading = null;
      void this.ready();
    }
  }

  get configured(): boolean {
    return this.provider !== undefined;
  }

  /** Whether a key is the vault's to encrypt. */
  manages(key: string): boolean {
    return this.keys.includes(key) || this.prefixes.some(p => key.startsWith(p));
  }

  private cipher(): LocalCipher | null | undefined {
    if (!this.provider) return undefined;
    if (this.cipherResolved === undefined) this.cipherResolved = this.provider();
    return this.cipherResolved;
  }

  /** Plain mode: the device has no cipher, the backing store is read directly. */
  private plain(): boolean {
    return this.cipher() === null;
  }

  ready(): Promise<void> {
    if (!this.provider) {
      // Nothing can be read yet: resolve once configured, through the listeners.
      return new Promise(resolve => { this.readyListeners.push(resolve); });
    }
    if (!this.loading) this.loading = this.load();
    return this.loading;
  }

  whenReady(callback: () => void): void {
    if (this.provider && (this.plain() || this.isReady)) { callback(); return; }
    this.readyListeners.push(callback);
    if (this.provider) void this.ready();
  }

  private async load(): Promise<void> {
    const cipher = this.cipher();
    const store = this.backing();
    if (cipher && store) {
      const managed: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key && this.manages(key)) managed.push(key);
      }
      for (const key of managed) {
        if (this.values.has(key)) continue; // written in memory before the load: newer
        const raw = store.getItem(key);
        if (raw === null) continue;
        if (isCipherValue(raw)) {
          try {
            this.values.set(key, await cipher.decrypt(raw, key));
          } catch {
            // Unreadable here (another device's key, a lost profile key): invisible.
          }
        } else {
          // Written in clear before the vault: kept, and encrypted from now on.
          this.values.set(key, raw);
          void this.persist(key, raw);
        }
      }
    }
    this.loaded = true;
    const listeners = this.readyListeners.splice(0);
    for (const l of listeners) l();
  }

  getItem(key: string): string | null {
    if (this.plain()) return this.backing()?.getItem(key) ?? null;
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.plain()) { this.backing()?.setItem(key, value); return; }
    this.values.set(key, value);
    if (this.provider) void this.persist(key, value);
  }

  removeItem(key: string): void {
    if (this.plain()) { this.backing()?.removeItem(key); return; }
    this.values.delete(key);
    if (this.provider) void this.persist(key, null);
  }

  /** One write at a time per key, in order, so the last call is what rests on disk. */
  private persist(key: string, value: string | null): Promise<void> {
    const previous = this.writes.get(key) ?? Promise.resolve();
    const next = previous.then(async () => {
      const store = this.backing();
      const cipher = this.cipher();
      if (!store || cipher === undefined) return;
      try {
        if (value === null) store.removeItem(key);
        else if (cipher) store.setItem(key, await cipher.encrypt(value, key));
        else store.setItem(key, value);
      } catch {
        // Storage full, denied, or the cipher's key unavailable: the session
        // keeps the value in memory; nothing is ever written in clear.
      }
    });
    this.writes.set(key, next);
    return next;
  }

  /** Every pending write, for a test or a flush before leaving. */
  flush(): Promise<void> {
    return Promise.all(this.writes.values()).then(() => undefined);
  }
}

function browserStorage(): Backing | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The device's vault, shared by every store of the app; configured by
 *  local-vault-setup.ts (the app) or by a test. */
export const localVault = new LocalVault(browserStorage);

/** The vault as a store, or null outside a browser. */
export function vaultStorage(): VaultStorage | null {
  return browserStorage() ? localVault : null;
}
