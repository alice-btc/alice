import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { webcrypto } from 'node:crypto';
import { LocalVault, LocalVaultUnsavedError, type LocalCipher } from './local-vault.ts';

/** A Storage over a Map, enough for the vault. */
function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  const written: string[] = [];
  return {
    map,
    /** Every value ever handed to setItem, to prove what never reached disk. */
    written,
    get length() { return map.size; },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { written.push(v); map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
  };
}

/** A reversible stand-in for the real cipher: "v1:" + base64(context|text). */
const fakeCipher: LocalCipher = {
  encrypt: async (plaintext, context) => `v1:${Buffer.from(`${context}|${plaintext}`).toString('base64')}`,
  decrypt: async (ciphertext, context) => {
    const text = Buffer.from(ciphertext.slice(3), 'base64').toString();
    if (!text.startsWith(`${context}|`)) throw new Error('could not be authenticated');
    return text.slice(context.length + 1);
  },
};
const enc = (context: string, plaintext: string) => `v1:${Buffer.from(`${context}|${plaintext}`).toString('base64')}`;

/** The browser cipher's format over a fresh, real AES-256-GCM key. */
async function realCipher(): Promise<LocalCipher> {
  const subtle = webcrypto.subtle;
  const key = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const encoder = new TextEncoder();
  return {
    async encrypt(plaintext, context) {
      const iv = webcrypto.getRandomValues(new Uint8Array(12));
      const sealed = await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode(context) }, key, encoder.encode(plaintext));
      return `v1:${Buffer.concat([iv, new Uint8Array(sealed)]).toString('base64')}`;
    },
    async decrypt(ciphertext, context) {
      const bytes = new Uint8Array(Buffer.from(ciphertext.slice(3), 'base64'));
      const plaintext = await subtle.decrypt(
        { name: 'AES-GCM', iv: bytes.slice(0, 12), additionalData: encoder.encode(context) },
        key,
        bytes.slice(12),
      );
      return new TextDecoder().decode(plaintext);
    },
  };
}

/** A cipher whose decryptions wait until the test lets them through. */
function gatedCipher(base: LocalCipher) {
  const waiting: Array<() => void> = [];
  let open = false;
  return {
    cipher: {
      encrypt: base.encrypt,
      decrypt: async (ciphertext: string, context: string) => {
        if (!open) await new Promise<void>(resolve => { waiting.push(resolve); });
        return base.decrypt(ciphertext, context);
      },
    } satisfies LocalCipher,
    waiting: () => waiting.length,
    open: () => { open = true; for (const release of waiting.splice(0)) release(); },
  };
}

const tick = () => new Promise<void>(resolve => { setImmediate(resolve); });
async function until(condition: () => boolean) {
  for (let i = 0; i < 100 && !condition(); i++) await tick();
  assert.ok(condition(), 'the awaited state was never reached');
}

const KEYS = ['explorer.tabs.v1', 'alice_explorer_wallets'];
const PREFIXES = ['alice_explorer_node_'];

describe('LocalVault with a cipher', () => {
  it('reads nothing before it is ready, then everything it decrypted', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': enc('explorer.tabs.v1', '{"tabs":[1]}'), 'alice_theme_mode': 'dark' });
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    assert.equal(vault.isReady, false);
    assert.equal(vault.status().mode, 'pending');
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    let told = 0;
    vault.whenReady(() => { told++; });
    await vault.ready();
    assert.equal(vault.isReady, true);
    assert.equal(vault.status().mode, 'encrypted');
    assert.equal(told, 1);
    assert.equal(vault.getItem('explorer.tabs.v1'), '{"tabs":[1]}');
    // A key the vault does not manage is not its business.
    assert.equal(vault.manages('alice_theme_mode'), false);
    vault.whenReady(() => { told++; });
    assert.equal(told, 2, 'a listener after readiness runs at once');
  });

  it('migrates values found in clear: readable at once, encrypted on disk after', async () => {
    const store = memoryStorage({ 'alice_explorer_wallets': '[{"xpub":"x"}]', 'alice_explorer_node_mainnet': 'https://node.local' });
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    await vault.ready();
    assert.equal(vault.getItem('alice_explorer_wallets'), '[{"xpub":"x"}]');
    assert.equal(vault.getItem('alice_explorer_node_mainnet'), 'https://node.local');
    await vault.flush();
    assert.equal(store.getItem('alice_explorer_wallets'), enc('alice_explorer_wallets', '[{"xpub":"x"}]'));
    assert.equal(store.getItem('alice_explorer_node_mainnet'), enc('alice_explorer_node_mainnet', 'https://node.local'));
    assert.ok(!store.map.get('alice_explorer_wallets')!.includes('xpub'), 'nothing of the value is on disk in clear');
    assert.deepEqual(vault.status().unsaved, []);
  });

  it('writes land in memory at once and rest encrypted, the last write winning', async () => {
    const store = memoryStorage();
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    await vault.ready();
    vault.setItem('explorer.tabs.v1', 'first');
    vault.setItem('explorer.tabs.v1', 'second');
    assert.equal(vault.getItem('explorer.tabs.v1'), 'second');
    assert.equal(store.getItem('explorer.tabs.v1'), null, 'the disk is written asynchronously');
    assert.deepEqual(vault.status().unsaved, ['explorer.tabs.v1']);
    await vault.flush();
    assert.equal(store.getItem('explorer.tabs.v1'), enc('explorer.tabs.v1', 'second'));
    assert.deepEqual(store.written, [enc('explorer.tabs.v1', 'second')], 'the superseded write never landed');
    vault.removeItem('explorer.tabs.v1');
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    await vault.flush();
    assert.equal(store.getItem('explorer.tabs.v1'), null);
  });

  it('leaves a value it cannot read in place, and keeps what is written over it in memory', async () => {
    const foreign = enc('another-key', 'foreign');
    const store = memoryStorage({ 'explorer.tabs.v1': foreign });
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    await vault.ready();
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    assert.deepEqual(vault.status().unreadable, ['explorer.tabs.v1']);
    vault.setItem('explorer.tabs.v1', 'mine');
    assert.equal(vault.getItem('explorer.tabs.v1'), 'mine', 'the session still sees its own write');
    await assert.rejects(vault.flush(), (error: unknown) =>
      error instanceof LocalVaultUnsavedError && error.keys.join() === 'explorer.tabs.v1');
    assert.equal(store.getItem('explorer.tabs.v1'), foreign, 'untouched by a write');
    vault.removeItem('explorer.tabs.v1');
    await assert.rejects(vault.flush(), LocalVaultUnsavedError);
    assert.equal(store.getItem('explorer.tabs.v1'), foreign, 'untouched by a removal');
    assert.deepEqual(vault.status().unsaved, ['explorer.tabs.v1']);
  });

  it('keeps a value in memory, nothing in clear on disk, and says so, when encryption fails', async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => { unhandled.push(reason); };
    process.on('unhandledRejection', onUnhandled);
    try {
      const store = memoryStorage();
      let failing = true;
      const flaky: LocalCipher = {
        encrypt: async (plaintext, context) => {
          if (failing) throw new Error('no key');
          return fakeCipher.encrypt(plaintext, context);
        },
        decrypt: fakeCipher.decrypt,
      };
      const vault = new LocalVault(() => store, () => flaky, KEYS, PREFIXES);
      await vault.ready();
      vault.setItem('alice_explorer_wallets', 'secret'); // fire and forget, as the stores do
      await assert.rejects(vault.flush(), LocalVaultUnsavedError, 'a failed write is not reported as saved');
      assert.equal(vault.getItem('alice_explorer_wallets'), 'secret');
      assert.equal(store.getItem('alice_explorer_wallets'), null);
      assert.deepEqual(vault.status().unsaved, ['alice_explorer_wallets']);
      // Once the key is back, the next write lands and the vault says so.
      failing = false;
      vault.setItem('alice_explorer_wallets', 'secret');
      await vault.flush();
      assert.equal(store.getItem('alice_explorer_wallets'), enc('alice_explorer_wallets', 'secret'));
      assert.deepEqual(vault.status().unsaved, []);
      await tick();
      assert.deepEqual(unhandled, [], 'no write left a rejection unhandled');
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });

  it('protects a value it cannot read from a write made before the vault was ready', async () => {
    const foreign = enc('another-key', 'foreign');
    const store = memoryStorage({ 'alice_explorer_wallets': foreign });
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    vault.setItem('alice_explorer_wallets', '[]'); // a store saving its empty start
    await assert.rejects(vault.flush(), LocalVaultUnsavedError);
    assert.equal(store.getItem('alice_explorer_wallets'), foreign);
    assert.deepEqual(vault.status().unreadable, ['alice_explorer_wallets']);
  });

  it('protects it from a write made while the load is still decrypting', async () => {
    const foreign = enc('another-key', 'foreign');
    const store = memoryStorage({ 'explorer.tabs.v1': foreign });
    const gate = gatedCipher(fakeCipher);
    const vault = new LocalVault(() => store, () => gate.cipher, KEYS, PREFIXES);
    const readiness = vault.ready();
    await until(() => gate.waiting() === 1);
    vault.setItem('explorer.tabs.v1', 'typed during the load');
    gate.open();
    await readiness;
    await assert.rejects(vault.flush(), LocalVaultUnsavedError);
    assert.equal(store.getItem('explorer.tabs.v1'), foreign);
    assert.equal(vault.getItem('explorer.tabs.v1'), 'typed during the load');
  });

  it('lets a write made during the load win over the readable value it loads', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': enc('explorer.tabs.v1', 'saved') });
    const gate = gatedCipher(fakeCipher);
    const vault = new LocalVault(() => store, () => gate.cipher, KEYS, PREFIXES);
    const readiness = vault.ready();
    await until(() => gate.waiting() === 1);
    vault.setItem('explorer.tabs.v1', 'newer');
    gate.open();
    await readiness;
    assert.equal(vault.getItem('explorer.tabs.v1'), 'newer', 'the load does not bring the older value back');
    await vault.flush();
    assert.equal(store.getItem('explorer.tabs.v1'), enc('explorer.tabs.v1', 'newer'));
  });

  it('does not bring back a value removed before the load', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': enc('explorer.tabs.v1', 'saved') });
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    vault.removeItem('explorer.tabs.v1');
    await vault.ready();
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    await vault.flush();
    assert.equal(store.getItem('explorer.tabs.v1'), null);
  });

  it('checks what another tab wrote since the load before replacing it', async () => {
    const store = memoryStorage();
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    await vault.ready();
    // Another tab, on the same key, writes a readable value: last write wins.
    store.map.set('explorer.tabs.v1', enc('explorer.tabs.v1', 'from the other tab'));
    vault.setItem('explorer.tabs.v1', 'from this tab');
    await vault.flush();
    assert.equal(store.getItem('explorer.tabs.v1'), enc('explorer.tabs.v1', 'from this tab'));
    // Something this device cannot read appears under another key: left alone.
    const foreign = enc('another-key', 'foreign');
    store.map.set('alice_explorer_wallets', foreign);
    vault.setItem('alice_explorer_wallets', '[]');
    await assert.rejects(vault.flush(), LocalVaultUnsavedError);
    assert.equal(store.getItem('alice_explorer_wallets'), foreign);
    assert.deepEqual(vault.status().unreadable, ['alice_explorer_wallets']);
  });

  it('with real AES-GCM keys: a profile whose key changed keeps the old values intact', async () => {
    const store = memoryStorage();
    const original = await realCipher();
    const before = new LocalVault(() => store, () => original, KEYS, PREFIXES);
    await before.ready();
    before.setItem('alice_explorer_wallets', '[{"xpub":"tpub..."}]');
    await before.flush();
    const sealed = store.getItem('alice_explorer_wallets')!;
    assert.ok(sealed.startsWith('v1:') && !sealed.includes('tpub'));

    // The key was lost: the next start runs with a new one.
    const replaced = await realCipher();
    const after = new LocalVault(() => store, () => replaced, KEYS, PREFIXES);
    await after.ready();
    assert.equal(after.getItem('alice_explorer_wallets'), null);
    assert.deepEqual(after.status().unreadable, ['alice_explorer_wallets']);
    after.setItem('alice_explorer_wallets', '[]');
    after.removeItem('alice_explorer_wallets');
    after.setItem('alice_explorer_wallets', '[{"xpub":"other"}]');
    await assert.rejects(after.flush(), LocalVaultUnsavedError);
    assert.equal(store.getItem('alice_explorer_wallets'), sealed);

    // With the original key back, the original value is all there.
    const recovered = new LocalVault(() => store, () => original, KEYS, PREFIXES);
    await recovered.ready();
    assert.equal(recovered.getItem('alice_explorer_wallets'), '[{"xpub":"tpub..."}]');
  });

  it('tells subscribers what changed, with one status object per state', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': enc('another-key', 'foreign') });
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    let calls = 0;
    const unsubscribe = vault.subscribe(() => { calls++; });
    const first = vault.status();
    assert.equal(vault.status(), first, 'unchanged state, same object');
    await vault.ready();
    assert.ok(calls > 0);
    const loaded = vault.status();
    assert.notEqual(loaded, first);
    assert.deepEqual(loaded, { mode: 'encrypted', readFailed: false, unreadable: ['explorer.tabs.v1'], unsaved: [] });
    unsubscribe();
    const seen = calls;
    vault.setItem('alice_explorer_wallets', '[]');
    await vault.flush();
    assert.equal(calls, seen, 'no call after unsubscribing');
  });
});

describe('LocalVault before the app hands the cipher over', () => {
  it('writes nothing to disk, keeps writes in memory, and saves them encrypted once configured', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': enc('explorer.tabs.v1', 'saved') });
    const vault = new LocalVault(() => store, undefined, KEYS, PREFIXES);
    assert.equal(vault.configured, false);
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    vault.setItem('alice_explorer_wallets', 'early');
    await assert.rejects(vault.flush(), LocalVaultUnsavedError, 'an unconfigured write is not saved');
    assert.equal(store.getItem('alice_explorer_wallets'), null, 'nothing lands in clear while unconfigured');
    let told = 0;
    vault.whenReady(() => { told++; });
    const readiness = vault.ready();
    vault.configure(() => fakeCipher);
    await readiness;
    assert.equal(told, 1);
    assert.equal(vault.getItem('explorer.tabs.v1'), 'saved');
    assert.equal(vault.getItem('alice_explorer_wallets'), 'early', 'the early write survived the load');
    await vault.flush();
    assert.equal(store.getItem('alice_explorer_wallets'), enc('alice_explorer_wallets', 'early'));
    // A second configuration is ignored.
    vault.configure(() => null);
    assert.equal(vault.getItem('explorer.tabs.v1'), 'saved');
    assert.equal(vault.status().mode, 'encrypted');
  });
});

describe('LocalVault without a cipher', () => {
  it('keeps the session in memory and never writes a value in clear', async () => {
    const sealed = enc('alice_explorer_wallets', '[{"xpub":"x"}]');
    const store = memoryStorage({ 'explorer.tabs.v1': 'plain', 'alice_explorer_wallets': sealed });
    const vault = new LocalVault(() => store, () => null, KEYS, PREFIXES);
    let told = 0;
    vault.whenReady(() => { told++; });
    assert.equal(told, 1, 'ready at once');
    assert.equal(vault.status().mode, 'volatile');
    // A value left in clear by an older version is still read; a sealed one is not.
    assert.equal(vault.getItem('explorer.tabs.v1'), 'plain');
    assert.equal(vault.getItem('alice_explorer_wallets'), null);

    vault.setItem('explorer.tabs.v1', 'next');
    vault.setItem('alice_explorer_wallets', '[{"xpub":"new"}]');
    assert.equal(vault.getItem('explorer.tabs.v1'), 'next');
    assert.equal(vault.getItem('alice_explorer_wallets'), '[{"xpub":"new"}]');
    await assert.rejects(vault.flush(), LocalVaultUnsavedError, 'a volatile session is not a saved one');
    assert.deepEqual(store.written, [], 'nothing was ever written');
    assert.equal(store.getItem('explorer.tabs.v1'), 'plain');
    assert.equal(store.getItem('alice_explorer_wallets'), sealed, 'the sealed value is kept for a device that can read it');
    assert.deepEqual(vault.status().unreadable, ['alice_explorer_wallets']);

    // A removal clears a value left in clear, never a sealed one.
    vault.removeItem('explorer.tabs.v1');
    vault.removeItem('alice_explorer_wallets');
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    assert.equal(vault.getItem('alice_explorer_wallets'), null);
    await assert.rejects(vault.flush(), LocalVaultUnsavedError);
    assert.equal(store.getItem('explorer.tabs.v1'), null);
    assert.equal(store.getItem('alice_explorer_wallets'), sealed);
    assert.deepEqual(vault.status().unsaved, ['alice_explorer_wallets']);
  });

  it('reads nothing outside a browser', () => {
    const vault = new LocalVault(() => null, () => null, KEYS, PREFIXES);
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    vault.setItem('explorer.tabs.v1', 'x');
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
  });
});

describe('default Explorer scope', () => {
  it('does not decrypt the practice wallet when the app shell starts', async () => {
    const store = memoryStorage({
      'explorer.tabs.v1': enc('explorer.tabs.v1', 'tabs'),
      'alice.test-wallet.mnemonic': enc('alice.test-wallet.mnemonic', 'synthetic words'),
    });
    const read: string[] = [];
    const cipher: LocalCipher = {
      encrypt: fakeCipher.encrypt,
      decrypt: async (value, key) => { read.push(key); return fakeCipher.decrypt(value, key); },
    };
    const explorer = new LocalVault(() => store, () => cipher);
    await explorer.ready();
    assert.deepEqual(read, ['explorer.tabs.v1']);
    assert.equal(explorer.getItem('alice.test-wallet.mnemonic'), null);
    const practice = new LocalVault(() => store, () => cipher, [], ['alice.test-wallet.']);
    assert.equal(read.length, 1);
    await practice.ready();
    assert.equal(practice.getItem('alice.test-wallet.mnemonic'), 'synthetic words');
  });
});

describe('storage read failures', () => {
  for (const operation of ['length', 'getItem'] as const) {
    it(`preserves stored data after ${operation} fails during loading`, async () => {
      const key = KEYS[0];
      const original = enc(key, 'old data');
      const store = memoryStorage({ [key]: original });
      let denied = true;
      const backing = new Proxy(store, {
        get(target, property, receiver) {
          if (denied && property === operation) {
            if (operation === 'length') throw new Error('denied');
            return () => { throw new Error('denied'); };
          }
          return Reflect.get(target, property, receiver);
        },
      });
      const vault = new LocalVault(() => backing, () => fakeCipher, KEYS, PREFIXES);
      await vault.ready();
      assert.equal(vault.status().readFailed, true);
      denied = false;
      vault.setItem(key, 'new data');
      await assert.rejects(vault.flush(), LocalVaultUnsavedError);
      assert.equal(vault.getItem(key), 'new data');
      assert.equal(store.map.get(key), original);
      vault.removeItem(key);
      await assert.rejects(vault.flush(), LocalVaultUnsavedError);
      assert.equal(store.map.get(key), original);
    });
  }
});
