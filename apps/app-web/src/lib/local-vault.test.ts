import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LocalVault, type LocalCipher } from './local-vault.ts';

/** A Storage over a Map, enough for the vault. */
function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    get length() { return map.size; },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
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

const KEYS = ['explorer.tabs.v1', 'alice_explorer_wallets'];
const PREFIXES = ['alice_explorer_node_'];

describe('LocalVault with a cipher', () => {
  it('reads nothing before it is ready, then everything it decrypted', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': enc('explorer.tabs.v1', '{"tabs":[1]}'), 'alice_theme_mode': 'dark' });
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    assert.equal(vault.isReady, false);
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    let told = 0;
    vault.whenReady(() => { told++; });
    await vault.ready();
    assert.equal(vault.isReady, true);
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
  });

  it('writes land in memory at once and rest encrypted, the last write winning', async () => {
    const store = memoryStorage();
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    await vault.ready();
    vault.setItem('explorer.tabs.v1', 'first');
    vault.setItem('explorer.tabs.v1', 'second');
    assert.equal(vault.getItem('explorer.tabs.v1'), 'second');
    assert.equal(store.getItem('explorer.tabs.v1'), null, 'the disk is written asynchronously');
    await vault.flush();
    assert.equal(store.getItem('explorer.tabs.v1'), enc('explorer.tabs.v1', 'second'));
    vault.removeItem('explorer.tabs.v1');
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    await vault.flush();
    assert.equal(store.getItem('explorer.tabs.v1'), null);
  });

  it('leaves a value it cannot read in place, invisible, and replaces it on the next write', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': enc('another-key', 'foreign') });
    const vault = new LocalVault(() => store, () => fakeCipher, KEYS, PREFIXES);
    await vault.ready();
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    assert.equal(store.getItem('explorer.tabs.v1'), enc('another-key', 'foreign'), 'untouched');
    vault.setItem('explorer.tabs.v1', 'mine');
    await vault.flush();
    assert.equal(store.getItem('explorer.tabs.v1'), enc('explorer.tabs.v1', 'mine'));
  });

  it('keeps a value in memory, and nothing in clear on disk, when encryption fails', async () => {
    const store = memoryStorage();
    const failing: LocalCipher = { encrypt: async () => { throw new Error('no key'); }, decrypt: fakeCipher.decrypt };
    const vault = new LocalVault(() => store, () => failing, KEYS, PREFIXES);
    await vault.ready();
    vault.setItem('alice_explorer_wallets', 'secret');
    await vault.flush();
    assert.equal(vault.getItem('alice_explorer_wallets'), 'secret');
    assert.equal(store.getItem('alice_explorer_wallets'), null);
  });
});

describe('LocalVault before the app hands the cipher over', () => {
  it('writes nothing to disk, keeps writes in memory, and loads once configured', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': enc('explorer.tabs.v1', 'saved') });
    const vault = new LocalVault(() => store, undefined, KEYS, PREFIXES);
    assert.equal(vault.configured, false);
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    vault.setItem('alice_explorer_wallets', 'early');
    await vault.flush();
    assert.equal(store.getItem('alice_explorer_wallets'), null, 'nothing lands in clear while unconfigured');
    let told = 0;
    vault.whenReady(() => { told++; });
    const readiness = vault.ready();
    vault.configure(() => fakeCipher);
    await readiness;
    assert.equal(told, 1);
    assert.equal(vault.getItem('explorer.tabs.v1'), 'saved');
    assert.equal(vault.getItem('alice_explorer_wallets'), 'early', 'the early write survived the load');
    // A second configuration is ignored.
    vault.configure(() => null);
    assert.equal(vault.getItem('explorer.tabs.v1'), 'saved');
  });
});

describe('LocalVault without a cipher', () => {
  it('is a plain window onto the backing store, ready at once', async () => {
    const store = memoryStorage({ 'explorer.tabs.v1': 'plain' });
    const vault = new LocalVault(() => store, () => null, KEYS, PREFIXES);
    let told = 0;
    vault.whenReady(() => { told++; });
    assert.equal(told, 1);
    assert.equal(vault.getItem('explorer.tabs.v1'), 'plain');
    vault.setItem('explorer.tabs.v1', 'next');
    assert.equal(store.getItem('explorer.tabs.v1'), 'next');
    vault.removeItem('explorer.tabs.v1');
    assert.equal(store.getItem('explorer.tabs.v1'), null);
    await vault.ready();
    assert.equal(vault.isReady, true);
  });

  it('reads nothing outside a browser', () => {
    const vault = new LocalVault(() => null, () => null, KEYS, PREFIXES);
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
    vault.setItem('explorer.tabs.v1', 'x');
    assert.equal(vault.getItem('explorer.tabs.v1'), null);
  });
});
