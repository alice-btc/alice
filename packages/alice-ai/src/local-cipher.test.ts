import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { webcrypto } from 'node:crypto';
import { createWebCryptoLocalCipher, isLocalCipherValue, LOCAL_CIPHER_VERSION, type LocalKeyStore } from './local-cipher.ts';

const subtle = webcrypto.subtle as unknown as SubtleCrypto;
const random = (n: number) => webcrypto.getRandomValues(new Uint8Array(n));

function memoryKeyStore(): LocalKeyStore & { puts: number } {
  let stored: CryptoKey | null = null;
  const store = {
    puts: 0,
    get: async () => stored,
    put: async (key: CryptoKey) => { stored = key; store.puts += 1; },
  };
  return store;
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
    assert.equal(store.puts, 1);
    const key = await store.get();
    assert.ok(key);
    assert.equal(key.extractable, false);
    assert.deepEqual([...key.usages].sort(), ['decrypt', 'encrypt']);
    // A second cipher over the same store reads the same key: values carry over.
    const again = createWebCryptoLocalCipher(subtle, store, random);
    assert.equal(await again.decrypt(await cipher.encrypt('shared', 'k'), 'k'), 'shared');
    assert.equal(store.puts, 1);
  });

  it('keeps unicode intact', async () => {
    const cipher = createWebCryptoLocalCipher(subtle, memoryKeyStore(), random);
    const text = 'Réutilisation d’adresse, 2 000 blocs, ₿';
    assert.equal(await cipher.decrypt(await cipher.encrypt(text, 'k'), 'k'), text);
  });
});
