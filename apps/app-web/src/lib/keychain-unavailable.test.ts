import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { webcrypto } from 'node:crypto';
import AsyncStorage, { clearTemporaryChats } from './async-storage-web.ts';
import {
  getWebStorageCipher,
  onWebStorageCipherRecovered,
  resetWebStorageCipherForTests,
  retryWebStorageCipher,
  whenWebStorageCipherSettled,
} from './storage-cipher.ts';
import { LocalVault } from './local-vault.ts';
import {
  createWebCryptoLocalCipher,
  getLocalCipher,
  isKeychainUnavailableError,
  keychainFailureFrom,
  localCipherStatus,
  resetLocalCipherForTests,
  retryLocalCipher,
} from '../../../../packages/alice-ai/src/local-cipher.ts';
import { listSessions, loadSession, restoreSession, saveSession, setChatStorageBackendForTests } from '../../../../packages/alice-ai/src/chat-storage.ts';
import {
  browserStorageIssues,
  createProtectedBrowserValue,
  resetBrowserStorageIssuesForTests,
} from '../../../../packages/alice-ai/src/browser-storage-security.ts';

// Alice Desktop on a Linux session without a usable Secret Service: the
// keychain check fails, and the session must run in memory, say so, never
// write a value in clear and never seal one under another key.

const originals = Object.fromEntries(
  (['window', 'localStorage', 'indexedDB'] as const).map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
);
afterEach(() => {
  for (const [name, descriptor] of Object.entries(originals)) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
  resetLocalCipherForTests();
  resetWebStorageCipherForTests();
  resetBrowserStorageIssuesForTests();
  setChatStorageBackendForTests(null);
});

const INDEX = 'alice_chat_sessions';
const SEALED = 'alice-chat-encrypted:v1:v1:sealed-under-the-keychain-key';
const conversation = (text: string) => [{ id: `m-${text}`, role: 'user' as const, content: text, time: new Date('2026-01-01T00:00:00Z') }];

/** A desktop webview whose keychain answers `status` (a rejection string
 *  or null for ok), with a keychain cipher behind the encrypt commands. */
function desktop(status: () => string | null) {
  const disk = new Map<string, string>();
  const calls: string[] = [];
  let key: CryptoKey | null = null;
  const native = createWebCryptoLocalCipher(webcrypto.subtle as unknown as SubtleCrypto,
    { get: async () => key, getOrAdd: async (candidate: CryptoKey) => { key ??= candidate; return key; } },
    n => webcrypto.getRandomValues(new Uint8Array(n)));
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { __TAURI_INTERNALS__: {
    invoke: async (command: string, args: Record<string, string>) => {
      calls.push(command);
      if (command === 'chat_storage_status') {
        const failure = status();
        if (failure !== null) throw failure;
        return undefined;
      }
      if (command === 'chat_storage_encrypt') return native.encrypt(args.plaintext, args.context);
      if (command === 'chat_storage_decrypt') return native.decrypt(args.ciphertext, args.context);
      throw new Error(`Unexpected native command ${command}`);
    },
  } } });
  // A browser key store must never be reached from the desktop.
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: { open: () => { throw new Error('IndexedDB used on the desktop'); } } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (k: string) => disk.get(k) ?? null,
    setItem: (k: string, v: string) => { disk.set(k, v); },
    removeItem: (k: string) => { disk.delete(k); },
    key: (i: number) => [...disk.keys()][i] ?? null,
    get length() { return disk.size; },
  } });
  resetLocalCipherForTests();
  resetWebStorageCipherForTests();
  resetBrowserStorageIssuesForTests();
  setChatStorageBackendForTests(AsyncStorage);
  clearTemporaryChats();
  return { disk, calls, native };
}

const settled = () => new Promise<void>(resolve => whenWebStorageCipherSettled(resolve));

for (const failure of ['no-secret-service', 'locked', 'denied'] as const) {
  test(`keychain ${failure}: the session is temporary, said precisely, and nothing reaches the disk`, async () => {
    const { disk, calls } = desktop(() => failure);
    disk.set(INDEX, SEALED);
    getWebStorageCipher();
    await settled();

    assert.equal(localCipherStatus(), failure);
    assert.equal(getLocalCipher(), null);
    assert.equal(getWebStorageCipher(), null);
    const issues = browserStorageIssues().split(',');
    assert.ok(issues.includes('keychain-unavailable'));
    assert.ok(!issues.includes('write-failed'));
    assert.ok(!issues.includes('unreadable'));

    // The conversation lives in memory for the session.
    const id = (await saveSession(conversation('kept in memory'), null, undefined))!;
    assert.deepEqual((await loadSession(id)).map(m => m.content), ['kept in memory']);
    assert.deepEqual((await listSessions()).map(s => s.id), [id]);
    // The disk holds what it held, sealed, and nothing else.
    assert.deepEqual([...disk.entries()], [[INDEX, SEALED]]);
    // The keychain was asked once; no value went to it, no other key was made.
    assert.deepEqual(calls, ['chat_storage_status']);
  });
}

test('a value written while the check is pending waits for it, and fails as keychain-unavailable', async () => {
  const { disk, calls } = desktop(() => 'locked');
  const cipher = getWebStorageCipher()!;
  assert.ok(cipher, 'a cipher while the keychain has not answered');
  assert.equal(localCipherStatus(), 'pending');
  await assert.rejects(cipher.encrypt('private words', INDEX), error => isKeychainUnavailableError(error));
  assert.equal(disk.size, 0);
  assert.deepEqual(calls, ['chat_storage_status']);
  assert.ok(browserStorageIssues().split(',').includes('keychain-unavailable'));
  assert.ok(!browserStorageIssues().split(',').includes('write-failed'));
});

test('a working keychain encrypts through the shell after a single check', async () => {
  const { disk, calls } = desktop(() => null);
  const cipher = getWebStorageCipher()!;
  await settled();
  assert.equal(localCipherStatus(), 'ok');
  const id = (await saveSession(conversation('sealed words'), null, cipher))!;
  assert.deepEqual((await loadSession(id, cipher)).map(m => m.content), ['sealed words']);
  for (const value of disk.values()) {
    assert.ok(value.startsWith('alice-chat-encrypted:v1:v1:'));
    assert.ok(!value.includes('sealed words'));
  }
  assert.equal(calls.filter(command => command === 'chat_storage_status').length, 1);
  assert.equal(browserStorageIssues(), '');
});

test('the local vault opens memory-only when the keychain failed, and writes nothing', async () => {
  const { disk } = desktop(() => 'no-secret-service');
  disk.set('alice_explorer_wallets', 'v1:sealed');
  const vault = new LocalVault(() => globalThis.localStorage as Storage, undefined, ['alice_explorer_wallets'], []);
  whenWebStorageCipherSettled(() => vault.configure(getWebStorageCipher));
  await vault.ready();
  assert.equal(vault.status().mode, 'volatile');
  vault.setItem('alice_explorer_wallets', '[{"xpub":"session only"}]');
  assert.equal(vault.getItem('alice_explorer_wallets'), '[{"xpub":"session only"}]');
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual([...disk.entries()], [['alice_explorer_wallets', 'v1:sealed']]);
});

test('retry asks the keychain again and reports when it is back', async () => {
  let answer: string | null = 'locked';
  const { calls } = desktop(() => answer);
  getWebStorageCipher();
  await settled();
  assert.equal(await retryLocalCipher(), 'locked');
  assert.equal(getLocalCipher(), null, 'still temporary after a failed retry');
  answer = null;
  assert.equal(await retryLocalCipher(), null);
  assert.equal(localCipherStatus(), 'ok');
  assert.equal(calls.filter(command => command === 'chat_storage_status').length, 3);
});

test('a rejection the shell does not name counts as a refusal', () => {
  assert.equal(keychainFailureFrom('no-secret-service'), 'no-secret-service');
  assert.equal(keychainFailureFrom('locked'), 'locked');
  assert.equal(keychainFailureFrom(new Error('command chat_storage_status not found')), 'denied');
  assert.equal(keychainFailureFrom(undefined), 'denied');
});

test('retry: once the keychain is back, the session is saved encrypted, without a reload', async () => {
  let answer: string | null = 'locked';
  const { disk, native } = desktop(() => answer);
  // A conversation saved in an earlier session, under the keychain key.
  const earlier = { id: 'earlier', title: 'Earlier', createdAt: 1, updatedAt: 1, messageCount: 1 };
  disk.set(INDEX, `alice-chat-encrypted:v1:${await native.encrypt(JSON.stringify([earlier]), INDEX)}`);
  disk.set('alice_chat_session_earlier', `alice-chat-encrypted:v1:${await native.encrypt(JSON.stringify([
    { id: 'm-e', role: 'user', content: 'from before', time: '2026-01-01T00:00:00.000Z' },
  ]), 'alice_chat_session_earlier')}`);
  disk.set('alice_explorer_wallets', await native.encrypt('[{"xpub":"from before"}]', 'alice_explorer_wallets'));

  const vault = new LocalVault(() => globalThis.localStorage as Storage, undefined, ['alice_explorer_wallets', 'alice_explorer_labels'], []);
  whenWebStorageCipherSettled(() => vault.configure(getWebStorageCipher));
  onWebStorageCipherRecovered(() => vault.reopen());
  let providerCipher: unknown = 'unset';
  onWebStorageCipherRecovered(() => { providerCipher = getWebStorageCipher(); });
  getWebStorageCipher();
  await settled();
  await vault.ready();

  // The session runs in memory.
  const id = (await saveSession(conversation('said while locked'), null, undefined))!;
  vault.setItem('alice_explorer_wallets', '[{"xpub":"added while locked"}]');
  vault.setItem('alice_explorer_labels', '{"tx":"labelled while locked"}');
  // A learning profile built over months is on disk; the session, which
  // cannot read it, starts one from nothing. The memory has nothing stored.
  const months = '{"version":3,"concepts":{"utxo":9,"fees":7}}';
  const profileDisk = { value: await native.encrypt(months, 'alice_learning_profile_v3') as string | null };
  const memoryDisk = { value: null as string | null };
  const backed = (disk: { value: string | null }) => () => ({
    getItem: () => disk.value, setItem: (_k: string, v: string) => { disk.value = v; }, removeItem: () => { disk.value = null; },
  });
  const profile = createProtectedBrowserValue('alice_learning_profile_v3', 'alice_learning_profile_v3', backed(profileDisk), getWebStorageCipher, () => {});
  const memory = createProtectedBrowserValue('alice_personal_memory_v1', 'alice_personal_memory_v1', backed(memoryDisk), getWebStorageCipher, () => {});
  const sealedMonths = profileDisk.value;
  await profile.write('{"version":3,"concepts":{"utxo":1}}');
  await memory.write('{"items":["said while locked"]}');
  assert.equal(profileDisk.value, sealedMonths);
  assert.equal(memoryDisk.value, null);

  // Still locked: nothing changes.
  assert.equal(await retryWebStorageCipher(), 'locked');
  assert.ok(browserStorageIssues().split(',').includes('keychain-unavailable'));

  answer = null;
  assert.equal(await retryWebStorageCipher(), null);
  assert.equal(localCipherStatus(), 'ok');
  assert.equal(browserStorageIssues(), '');
  assert.ok(providerCipher && providerCipher !== 'unset', 'the chat provider gets the cipher');

  // The conversation said while locked is saved under its own id, encrypted,
  // next to the one from before.
  const cipher = getWebStorageCipher()!;
  const sessions = await listSessions(cipher);
  assert.deepEqual(sessions.map(s => s.id).sort(), ['earlier', id].sort());
  assert.deepEqual((await loadSession(id, cipher)).map(m => m.content), ['said while locked']);
  assert.deepEqual((await loadSession('earlier', cipher)).map(m => m.content), ['from before']);
  for (const [key, value] of disk) {
    assert.ok(!value.includes('said while locked') && !value.includes('added while locked'), key);
  }

  // The vault keeps the disk's wallet list, which the session never read,
  // and saves, encrypted, the key the disk did not hold.
  await vault.flush();
  assert.equal(vault.status().mode, 'encrypted');
  assert.equal(vault.getItem('alice_explorer_wallets'), '[{"xpub":"from before"}]');
  assert.equal(await native.decrypt(disk.get('alice_explorer_wallets')!, 'alice_explorer_wallets'), '[{"xpub":"from before"}]');
  assert.equal(await native.decrypt(disk.get('alice_explorer_labels')!, 'alice_explorer_labels'), '{"tx":"labelled while locked"}');

  // The profile of months is kept, the one of a locked session let go; the
  // memory, with nothing on disk, saves its session value.
  assert.equal(await profile.read(), months);
  assert.equal(profileDisk.value, sealedMonths);
  assert.equal(await memory.read(), '{"items":["said while locked"]}');
  const sealedMemory: string | null = memoryDisk.value as string | null;
  assert.ok(sealedMemory?.startsWith('v1:'));
  assert.equal(await native.decrypt(sealedMemory!, 'alice_personal_memory_v1'), '{"items":["said while locked"]}');
});

test('a conversation saved again since the key came back is not replaced by its older memory copy', async () => {
  desktop(() => null);
  getWebStorageCipher();
  await settled();
  const cipher = getWebStorageCipher()!;
  const id = (await saveSession(conversation('the newer reply'), null, cipher))!;
  const stored = (await listSessions(cipher)).find(s => s.id === id)!;
  await restoreSession({ ...stored, updatedAt: stored.updatedAt - 1 }, conversation('the older copy'), cipher);
  assert.deepEqual((await loadSession(id, cipher)).map(m => m.content), ['the newer reply']);
});

test('a vault not read yet when the keychain comes back opens with the key', async () => {
  let answer: string | null = 'locked';
  const { disk, native } = desktop(() => answer);
  disk.set('alice.test-wallet.state', await native.encrypt('{"words":"sealed"}', 'alice.test-wallet.state'));
  const vault = new LocalVault(() => globalThis.localStorage as Storage, undefined, [], ['alice.test-wallet.']);
  whenWebStorageCipherSettled(() => vault.configure(getWebStorageCipher));
  onWebStorageCipherRecovered(() => vault.reopen());
  getWebStorageCipher();
  await settled();
  // Asked about before any load: no cipher then.
  assert.equal(vault.getItem('alice.test-wallet.state'), null);
  answer = null;
  assert.equal(await retryWebStorageCipher(), null);
  await vault.ready();
  assert.equal(vault.status().mode, 'encrypted');
  assert.equal(vault.getItem('alice.test-wallet.state'), '{"words":"sealed"}');
});
