// The local vault: what the Explorer keeps on this device
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
// migration is silent and complete after one start.
//
// A value this device cannot read (its key was lost with the browser
// profile, or could not be reached) is left on disk exactly as it is: the
// key it sits under is marked unreadable, and what the session writes there
// stays in memory. Before replacing a value it did not read itself, a write
// checks that it decrypts, so a write made before the vault was ready, or
// while it was loading, cannot replace one either.
//
// Until the app has handed over the cipher, the vault keeps everything in
// memory and writes nothing. Where the device has no cipher at all (no
// WebCrypto, or Node in tests) the session is volatile: values left in
// clear by an older version are still read, nothing is ever written, and a
// removal only clears a value that was in clear. Readers that may run
// before the vault is ready wait for `ready()` or `whenReady`; `status()`
// and `subscribe` say what is unreadable or not saved, and `flush` rejects
// while anything is.

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
export const VAULT_PREFIXES: readonly string[] = ['alice_explorer_node_'];

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

/** What the vault can say about itself, for a notice or a test. */
export interface VaultStatus {
  /** 'pending' until the cipher is handed over and the stored values read;
   *  'encrypted' once values rest on disk encrypted; 'volatile' when the
   *  device has no cipher and what is written lives in this session only. */
  readonly mode: 'pending' | 'encrypted' | 'volatile';
  /** Keys whose stored value this device cannot decrypt: left on disk as
   *  they are, and what is written to them stays in memory. */
  readonly unreadable: readonly string[];
  /** Storage could not be read completely; disk writes are refused this session. */
  readonly readFailed: boolean;
  /** Keys whose latest value is in memory only: not written yet, refused
   *  (unreadable key, volatile session) or failed (storage full, key lost). */
  readonly unsaved: readonly string[];
}

/** `flush` while some values are in memory only. */
export class LocalVaultUnsavedError extends Error {
  readonly keys: readonly string[];

  constructor(keys: readonly string[]) {
    super(`Local values not saved on this device: ${keys.join(', ')}.`);
    this.name = 'LocalVaultUnsavedError';
    this.keys = keys;
  }
}

type Backing = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

export class LocalVault implements VaultStorage {
  private readonly values = new Map<string, string>();
  private readonly writes = new Map<string, Promise<void>>();
  /** Per key, the number of the latest write: an older one never lands after it. */
  private readonly generations = new Map<string, number>();
  private readonly unsavedKeys = new Set<string>();
  private readonly unreadableKeys = new Set<string>();
  /** Per key, the encrypted value this session last read or wrote. */
  private readonly sealed = new Map<string, string>();
  private readonly readyListeners: Array<() => void> = [];
  private readonly statusListeners = new Set<() => void>();
  private statusSnapshot: VaultStatus | null = null;
  private provider: LocalCipherProvider | undefined;
  private cipherResolved: LocalCipher | null | undefined;
  private loading: Promise<void> | null = null;
  private readonly backing: () => Backing | null;
  private readonly keys: readonly string[];
  private readonly prefixes: readonly string[];
  private loaded = false;
  private readFailed = false;

  /** True once every managed value has been read; at once without a cipher. */
  get isReady(): boolean {
    return this.loaded || (this.provider !== undefined && this.cipher() === null);
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
    this.changed();
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
    if (this.cipherResolved === undefined) {
      try {
        this.cipherResolved = this.provider() ?? null;
      } catch {
        this.cipherResolved = null;
      }
    }
    return this.cipherResolved;
  }

  /** Configured, but no browser storage at all (a server render): nothing is kept. */
  private outsideBrowser(): boolean {
    return this.provider !== undefined && typeof window === 'undefined' && !this.backing();
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
    if (this.isReady) { callback(); return; }
    this.readyListeners.push(callback);
    if (this.provider) void this.ready();
  }

  /** Never rejects: a value that cannot be read is marked, not thrown. */
  private async load(): Promise<void> {
    const cipher = this.cipher();
    try {
      const store = this.backing();
      if (!store && typeof window !== 'undefined') this.readFailed = true;
      for (const key of store ? this.managedKeys(store) : []) {
        const raw = store!.getItem(key);
        if (raw === null) continue;
        if (!isCipherValue(raw)) {
          // Written in clear before the vault: kept, and encrypted from now on,
          // unless the session already wrote something newer. Without a
          // cipher, getItem reads it from disk as it is.
          if (cipher && !this.generations.has(key)) {
            this.values.set(key, raw);
            this.write(key, raw);
          }
          continue;
        }
        if (!cipher) { this.markUnreadable(key); continue; }
        try {
          const plaintext = await cipher.decrypt(raw, key);
          this.sealed.set(key, raw);
          // Written in memory before or during the load: newer.
          if (!this.generations.has(key)) this.values.set(key, plaintext);
        } catch {
          // Another device's key, a lost profile key, a key out of reach.
          this.markUnreadable(key);
        }
      }
    } catch {
      // Preserve disk contents when the initial snapshot could not be read.
      this.readFailed = true;
    }
    this.loaded = true;
    this.changed();
    const listeners = this.readyListeners.splice(0);
    for (const l of listeners) {
      try { l(); } catch { /* A reader cannot interrupt the other subscribers. */ }
    }
  }

  private managedKeys(store: Backing): string[] {
    const managed: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key && this.manages(key)) managed.push(key);
    }
    return managed;
  }

  getItem(key: string): string | null {
    if (this.outsideBrowser()) return null;
    const store = this.backing();
    if (store && this.cipher() === null && !this.unsavedKeys.has(key)) {
      // Volatile: what the session has not changed is read from disk, if in clear.
      const raw = store.getItem(key);
      return raw !== null && !isCipherValue(raw) ? raw : null;
    }
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.outsideBrowser()) return;
    this.values.set(key, value);
    this.write(key, value);
  }

  removeItem(key: string): void {
    if (this.outsideBrowser()) return;
    this.values.delete(key);
    this.write(key, null);
  }

  /** One write at a time per key, in order, so the last call is what rests
   *  on disk. Never rejects: a failure leaves the key in `unsaved`. */
  private write(key: string, value: string | null): void {
    const generation = (this.generations.get(key) ?? 0) + 1;
    this.generations.set(key, generation);
    if (!this.unsavedKeys.has(key)) {
      this.unsavedKeys.add(key);
      this.changed();
    }
    const previous = this.writes.get(key) ?? Promise.resolve();
    const next = previous
      .then(() => this.persist(key, value, generation))
      .then(
        saved => {
          if (saved && this.generations.get(key) === generation && this.unsavedKeys.delete(key)) this.changed();
        },
        () => {
          // Storage full or denied, the cipher's key out of reach: the value
          // stays in memory and in `unsaved`; nothing is written in clear.
        },
      );
    this.writes.set(key, next);
  }

  /** Puts one write on disk; true once it rests there. */
  private async persist(key: string, value: string | null, generation: number): Promise<boolean> {
    await this.ready();
    if (this.generations.get(key) !== generation) return false; // a newer write follows
    const store = this.backing();
    const cipher = this.cipher();
    if (!store || this.readFailed || this.unreadableKeys.has(key)) return false;
    const sealed = cipher && value !== null ? await cipher.encrypt(value, key) : null;
    let verified: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (this.generations.get(key) !== generation) return false;
      const current = store.getItem(key);
      if (current !== null && isCipherValue(current) && current !== this.sealed.get(key) && current !== verified) {
        // An encrypted value this session neither read nor wrote (another
        // tab's, or one the load could not reach): replaced only if it
        // decrypts here. Then the disk is read again, as it may have moved.
        const readable = cipher ? await cipher.decrypt(current, key).then(() => true, () => false) : false;
        if (!readable) { this.markUnreadable(key); return false; }
        verified = current;
        continue;
      }
      // From here on, nothing is awaited between the check and the write.
      if (!cipher) {
        // Volatile: nothing is written; a removal clears a value left in clear.
        if (value !== null) return false;
        if (current !== null) store.removeItem(key);
        return true;
      }
      if (sealed === null) {
        store.removeItem(key);
        this.sealed.delete(key);
      } else {
        store.setItem(key, sealed);
        this.sealed.set(key, sealed);
      }
      return true;
    }
    return false; // the disk kept changing under this write: left as it is
  }

  private markUnreadable(key: string): void {
    if (this.unreadableKeys.has(key)) return;
    this.unreadableKeys.add(key);
    this.changed();
  }

  /** What the vault can say about itself; the same object until it changes. */
  status(): VaultStatus {
    if (!this.statusSnapshot) {
      const cipher = this.cipher();
      this.statusSnapshot = {
        mode: cipher === undefined || (cipher && !this.loaded) ? 'pending' : cipher ? 'encrypted' : 'volatile',
        unreadable: [...this.unreadableKeys],
        readFailed: this.readFailed,
        unsaved: [...this.unsavedKeys],
      };
    }
    return this.statusSnapshot;
  }

  /** Calls `listener` whenever `status()` changes; returns the unsubscribe. */
  subscribe(listener: () => void): () => void {
    this.statusListeners.add(listener);
    return () => { this.statusListeners.delete(listener); };
  }

  private changed(): void {
    this.statusSnapshot = null;
    for (const listener of [...this.statusListeners]) {
      try {
        listener();
      } catch {
        // A listener's failure is its own; the vault carries on.
      }
    }
  }

  /** Every pending write, for a test or a flush before leaving. Rejects
   *  with LocalVaultUnsavedError while any value is in memory only, so a
   *  failed or refused write is never taken for a saved one. */
  async flush(): Promise<void> {
    if (this.provider) {
      await this.ready();
      let pending: Array<Promise<void>>;
      do {
        pending = [...this.writes.values()];
        await Promise.all(pending);
      } while ([...this.writes.values()].some((write, i) => write !== pending[i]));
    }
    if (this.unsavedKeys.size) throw new LocalVaultUnsavedError([...this.unsavedKeys]);
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
