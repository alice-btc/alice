import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { webcrypto } from 'node:crypto';
import {
  createWebCryptoLocalCipher,
  indexedDbKeyStore,
  isLocalCipherValue,
  LOCAL_CIPHER_VERSION,
  type LocalKeyStore,
} from './local-cipher.ts';

const subtle = webcrypto.subtle as unknown as SubtleCrypto;
const random = (n: number) => webcrypto.getRandomValues(new Uint8Array(n));

function memoryKeyStore(): LocalKeyStore & { adds: number } {
  let stored: CryptoKey | null = null;
  const store = {
    adds: 0,
    get: async () => stored,
    getOrAdd: async (candidate: CryptoKey) => {
      if (stored) return stored;
      stored = candidate;
      store.adds += 1;
      return candidate;
    },
  };
  return store;
}

/** The real WebCrypto, counting the keys it is asked to make. */
function countingSubtle() {
  const counts = { generateKey: 0 };
  const call = (name: 'generateKey' | 'encrypt' | 'decrypt') => (...args: unknown[]) =>
    (subtle[name] as unknown as (...a: unknown[]) => unknown).apply(subtle, args);
  const wrapped = {
    generateKey: (...args: unknown[]) => { counts.generateKey += 1; return call('generateKey')(...args); },
    encrypt: call('encrypt'),
    decrypt: call('decrypt'),
  } as unknown as SubtleCrypto;
  return { subtle: wrapped, counts };
}

/** Resolves for both callers only once both have arrived. */
function meetingPoint() {
  let arrived = 0;
  let release!: () => void;
  const met = new Promise<void>(resolve => { release = resolve; });
  return () => { arrived += 1; if (arrived === 2) release(); return met; };
}

/**
 * Just enough IndexedDB for the key store: one database, transactions run
 * one at a time (as readwrite ones on one store do), their writes kept only
 * when they commit, and a readwrite commit that can be made to fail after
 * every request in it succeeded (quota, a database closing).
 */
function fakeIndexedDb(initial?: Record<string, unknown>) {
  const data = new Map<string, unknown>(Object.entries(initial ?? {}));
  const stores = new Set<string>(initial ? ['keys'] : []);
  let version = initial ? 1 : 0;
  let turn: Promise<void> = Promise.resolve();
  const control = { failNextWriteCommit: null as Error | null, transactions: [] as string[] };
  const later = () => new Promise<void>(resolve => { setTimeout(resolve, 0); });

  function transaction(name: string, mode: IDBTransactionMode) {
    if (!stores.has(name)) throw new Error(`NotFoundError: no store ${name}`);
    control.transactions.push(mode);
    const pending: Array<() => void> = [];
    const writes = new Map<string, unknown>();
    let over = false;
    const tx = {
      error: null as unknown,
      oncomplete: null as null | (() => void),
      onabort: null as null | (() => void),
      objectStore: () => ({
        get: (key: string) => request(() => (writes.has(key) ? writes.get(key) : data.get(key))),
        add: (value: unknown, key: string) => request(() => {
          if (mode !== 'readwrite') throw new Error('ReadOnlyError');
          if (writes.has(key) || data.has(key)) throw new Error('ConstraintError: key exists');
          writes.set(key, value);
          return key;
        }),
        put: (value: unknown, key: string) => request(() => {
          if (mode !== 'readwrite') throw new Error('ReadOnlyError');
          writes.set(key, value);
          return key;
        }),
      }),
      abort: () => abort(null),
    };
    function abort(error: unknown) {
      if (over) return;
      over = true;
      tx.error = error;
      setTimeout(() => tx.onabort?.(), 0);
    }
    function request(op: () => unknown) {
      const req = { result: undefined as unknown, error: null as unknown, onsuccess: null as null | (() => void) };
      pending.push(() => {
        try {
          req.result = op();
        } catch (error) {
          req.error = error;
          abort(error);
          return;
        }
        req.onsuccess?.();
      });
      return req;
    }
    turn = turn.then(async () => {
      await later();
      while (pending.length && !over) {
        pending.shift()!();
        await later();
      }
      if (over) return;
      over = true;
      if (mode === 'readwrite' && control.failNextWriteCommit) {
        const failure = control.failNextWriteCommit;
        control.failNextWriteCommit = null;
        tx.error = failure;
        tx.onabort?.();
        return;
      }
      for (const [key, value] of writes) data.set(key, value);
      tx.oncomplete?.();
    });
    return tx;
  }

  const db = { createObjectStore: (name: string) => { stores.add(name); }, transaction, close: () => {} };
  const factory = {
    open(_name: string, wanted: number) {
      const req = {
        result: null as unknown,
        error: null as unknown,
        onupgradeneeded: null as null | (() => void),
        onsuccess: null as null | (() => void),
        onerror: null as null | (() => void),
        onblocked: null as null | (() => void),
      };
      setTimeout(() => {
        req.result = db;
        if (version < wanted) { version = wanted; req.onupgradeneeded?.(); }
        req.onsuccess?.();
      }, 0);
      return req;
    },
  };
  return { factory: factory as unknown as IDBFactory, data, control };
}

describe('createWebCryptoLocalCipher', () => {
  it('round-trips text under a versioned, base64 value with a fresh nonce each time', async () => {
    const cipher = createWebCryptoLocalCipher(subtle, memoryKeyStore(), random);
    const a = await cipher.encrypt('{"tabs":[]}', 'explorer.tabs.v1');
    const b = await cipher.encrypt('{"tabs":[]}', 'explorer.tabs.v1');
    assert.ok(isLocalCipherValue(a) && a.startsWith(LOCAL_CIPHER_VERSION));
    assert.notEqual(a, b, 'two encryptions of the same text differ by their nonce');
    assert.match(a.slice(LOCAL_CIPHER_VERSION.length), /^[A-Za-z0-9+/]+=*$/);
    assert.equal(await cipher.decrypt(a, 'explorer.tabs.v1'), '{"tabs":[]}');
    assert.equal(await cipher.decrypt(b, 'explorer.tabs.v1'), '{"tabs":[]}');
  });

  it('binds the value to its storage key: another context cannot read it', async () => {
    const cipher = createWebCryptoLocalCipher(subtle, memoryKeyStore(), random);
    const value = await cipher.encrypt('xpub6...', 'alice_explorer_wallets');
    await assert.rejects(cipher.decrypt(value, 'explorer.tabs.v1'), /could not be authenticated/);
  });

  it('refuses tampered, foreign or truncated values', async () => {
    const cipher = createWebCryptoLocalCipher(subtle, memoryKeyStore(), random);
    const value = await cipher.encrypt('hello', 'k');
    const flipped = value.slice(0, -2) + (value.endsWith('A=') ? 'B=' : 'A=');
    await assert.rejects(cipher.decrypt(flipped, 'k'), /authenticated|decoded/);
    await assert.rejects(cipher.decrypt('plain text', 'k'), /known encrypted form/);
    await assert.rejects(cipher.decrypt(`${LOCAL_CIPHER_VERSION}AAAA`, 'k'), /too short/);
  });

  it('creates the key once, non-extractable, and reuses it from the store', async () => {
    const store = memoryKeyStore();
    const cipher = createWebCryptoLocalCipher(subtle, store, random);
    await cipher.encrypt('one', 'k');
    await cipher.encrypt('two', 'k');
    assert.equal(store.adds, 1);
    const key = await store.get();
    assert.ok(key);
    assert.equal(key.extractable, false);
    assert.deepEqual([...key.usages].sort(), ['decrypt', 'encrypt']);
    // A second cipher over the same store reads the same key: values carry over.
    const again = createWebCryptoLocalCipher(subtle, store, random);
    assert.equal(await again.decrypt(await cipher.encrypt('shared', 'k'), 'k'), 'shared');
    assert.equal(store.adds, 1);
  });

  it('keeps unicode intact', async () => {
    const cipher = createWebCryptoLocalCipher(subtle, memoryKeyStore(), random);
    const text = 'Réutilisation d’adresse, 2 000 blocs, ₿';
    assert.equal(await cipher.decrypt(await cipher.encrypt(text, 'k'), 'k'), text);
  });

  it('never makes a new key while the stored one cannot be read, and retries the store later', async () => {
    const store = memoryKeyStore();
    const first = createWebCryptoLocalCipher(subtle, store, random);
    const sealed = await first.encrypt('saved before', 'k');
    let unavailable = true;
    const flaky: LocalKeyStore = {
      get: () => (unavailable ? Promise.reject(new Error('IndexedDB is unavailable.')) : store.get()),
      getOrAdd: candidate => store.getOrAdd(candidate),
    };
    const counted = countingSubtle();
    const cipher = createWebCryptoLocalCipher(counted.subtle, flaky, random);
    await assert.rejects(cipher.encrypt('new', 'k'), /IndexedDB is unavailable/);
    // A key that cannot be reached is not reported as a forged value.
    await assert.rejects(cipher.decrypt(sealed, 'k'), /IndexedDB is unavailable/);
    assert.equal(counted.counts.generateKey, 0, 'no candidate key while the store failed');
    assert.equal(store.adds, 1);
    unavailable = false;
    assert.equal(await cipher.decrypt(sealed, 'k'), 'saved before', 'the next use reaches the same key');
    assert.equal(counted.counts.generateKey, 0);
  });

  it('refuses a stored key it cannot use instead of replacing it', async () => {
    const counted = countingSubtle();
    let offered = 0;
    const odd: LocalKeyStore = {
      get: async () => ({ type: 'public', algorithm: { name: 'RSA-OAEP' }, usages: ['encrypt'] }) as unknown as CryptoKey,
      getOrAdd: async candidate => { offered += 1; return candidate; },
    };
    const cipher = createWebCryptoLocalCipher(counted.subtle, odd, random);
    await assert.rejects(cipher.encrypt('x', 'k'), /present but unusable/);
    assert.equal(counted.counts.generateKey, 0);
    assert.equal(offered, 0);
  });
});

describe('indexedDbKeyStore', () => {
  it('lets two tabs that both found no key end up on the same one', async () => {
    const idb = fakeIndexedDb();
    const meet = meetingPoint();
    // Each tab's first read waits for the other's: both see an empty store.
    const tab = () => {
      const store = indexedDbKeyStore('alice-local-cipher', idb.factory);
      return { get: () => store.get().then(async key => { await meet(); return key; }), getOrAdd: store.getOrAdd };
    };
    const counted = countingSubtle();
    const a = createWebCryptoLocalCipher(counted.subtle, tab(), random);
    const b = createWebCryptoLocalCipher(counted.subtle, tab(), random);
    const [fromA, fromB] = await Promise.all([a.encrypt('from a', 'k'), b.encrypt('from b', 'k')]);
    assert.equal(counted.counts.generateKey, 2, 'both tabs made a candidate');
    assert.equal(idb.data.size, 1, 'one key is kept');
    assert.equal(await a.decrypt(fromB, 'k'), 'from b');
    assert.equal(await b.decrypt(fromA, 'k'), 'from a');
    // A third tab, opened later, reads the kept key without making one.
    const c = createWebCryptoLocalCipher(counted.subtle, indexedDbKeyStore('alice-local-cipher', idb.factory), random);
    assert.equal(await c.decrypt(fromA, 'k'), 'from a');
    assert.equal(counted.counts.generateKey, 2);
  });

  it('reports no key kept when the transaction aborts after its add succeeded', async () => {
    const idb = fakeIndexedDb();
    const store = indexedDbKeyStore('alice-local-cipher', idb.factory);
    const candidate = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    idb.control.failNextWriteCommit = new Error('QuotaExceededError');
    await assert.rejects(store.getOrAdd(candidate), /QuotaExceededError/);
    assert.equal(idb.data.size, 0);
    assert.equal(await store.get(), null);
    // Through the cipher: the failed creation is an error, then a retry keeps one key.
    const cipher = createWebCryptoLocalCipher(subtle, store, random);
    idb.control.failNextWriteCommit = new Error('QuotaExceededError');
    await assert.rejects(cipher.encrypt('x', 'k'), /QuotaExceededError/);
    assert.equal(idb.data.size, 0);
    const value = await cipher.encrypt('kept', 'k');
    assert.equal(idb.data.size, 1);
    const fresh = createWebCryptoLocalCipher(subtle, indexedDbKeyStore('alice-local-cipher', idb.factory), random);
    assert.equal(await fresh.decrypt(value, 'k'), 'kept', 'the key in use is the key on disk');
  });

  it('keeps the key already stored rather than the candidate it is offered', async () => {
    const existing = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const idb = fakeIndexedDb({ 'local-v1': existing });
    const store = indexedDbKeyStore('alice-local-cipher', idb.factory);
    const candidate = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    assert.equal(await store.getOrAdd(candidate), existing);
    assert.equal(idb.data.get('local-v1'), existing);
    assert.deepEqual(idb.control.transactions, ['readwrite']);
  });

  it('leaves an unusable stored record in place and makes no key', async () => {
    const idb = fakeIndexedDb({ 'local-v1': 'not a key' });
    const counted = countingSubtle();
    const cipher = createWebCryptoLocalCipher(counted.subtle, indexedDbKeyStore('alice-local-cipher', idb.factory), random);
    await assert.rejects(cipher.encrypt('x', 'k'), /present but unusable/);
    assert.equal(counted.counts.generateKey, 0);
    assert.equal(idb.data.get('local-v1'), 'not a key');
  });
});
