import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { webcrypto } from 'node:crypto';
import { createWebCryptoLocalCipher } from './local-cipher.ts';
import type { ChatMsg } from './chat-context';
import {
  cleanupSessions,
  deleteSession,
  encodeChatStorageValue,
  listSessions,
  loadSession,
  MAX_CHAT_SESSIONS,
  saveSession,
  setChatStorageBackendForTests,
  type ChatSession,
  type ChatStorageBackend,
} from './chat-storage.ts';

const INDEX = 'alice_chat_sessions';
const body = (id: string) => `alice_chat_session_${id}`;
// Well-formed envelope and cipher prefix, but no valid authentication tag.
const CORRUPT = 'alice-chat-encrypted:v1:v1:' + Buffer.alloc(40, 7).toString('base64');

afterEach(() => setChatStorageBackendForTests(null));

function cipher() {
  let key: CryptoKey | null = null;
  return createWebCryptoLocalCipher(webcrypto.subtle as unknown as SubtleCrypto,
    { get: async () => key, getOrAdd: async (k: CryptoKey) => { key ??= k; return key; } },
    n => webcrypto.getRandomValues(new Uint8Array(n)));
}

function disk(options: { failSet?: (key: string) => boolean; withKeys?: boolean } = {}) {
  const values = new Map<string, string>();
  const storage: ChatStorageBackend = {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) {
      if (options.failSet?.(key)) throw new Error('quota');
      values.set(key, value);
    },
    async removeItem(key) { values.delete(key); },
  };
  if (options.withKeys !== false) storage.getAllKeys = async () => [...values.keys()];
  setChatStorageBackendForTests(storage);
  return values;
}

function conversation(text: string): ChatMsg[] {
  return [{ id: `m-${text}`, role: 'user', content: text, time: new Date('2026-01-01T00:00:00Z') }];
}

function sessionList(count: number): ChatSession[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `s${index}`, title: `t${index}`, createdAt: count - index, updatedAt: count - index, messageCount: 1,
  }));
}

test('a conversation round-trips encrypted and no plaintext reaches storage', async () => {
  const values = disk(); const c = cipher();
  const id = await saveSession(conversation('private words'), null, c);
  assert.ok(id);
  assert.deepEqual((await loadSession(id, c)).map(m => m.content), ['private words']);
  assert.equal((await listSessions(c))[0]?.id, id);
  for (const value of values.values()) {
    assert.ok(value.startsWith('alice-chat-encrypted:v1:v1:'));
    assert.ok(!value.includes('private words'));
  }
});

test('an unreadable conversation under a readable index is not overwritten', async () => {
  const values = disk(); const c = cipher();
  const id = (await saveSession(conversation('first'), null, c))!;
  values.set(body(id), CORRUPT);
  const index = values.get(INDEX);
  // No loadSession call precedes this save.
  await assert.rejects(saveSession(conversation('replacement'), id, c));
  assert.equal(values.get(body(id)), CORRUPT);
  assert.equal(values.get(INDEX), index);
});

test('an unreadable conversation can still be deleted explicitly', async () => {
  const values = disk(); const c = cipher();
  const keep = (await saveSession(conversation('keep'), null, c))!;
  const id = (await saveSession(conversation('lost'), null, c))!;
  values.set(body(id), CORRUPT);
  await deleteSession(id, c);
  assert.equal(values.has(body(id)), false);
  assert.deepEqual((await listSessions(c)).map(s => s.id), [keep]);
});

test('old conversations are not trimmed when saving a new one fails', async () => {
  const c = cipher();
  const values = disk({ failSet: key => key === INDEX });
  const sessions = sessionList(MAX_CHAT_SESSIONS);
  values.set(INDEX, await encodeChatStorageValue(JSON.stringify(sessions), INDEX, c));
  for (const s of sessions) values.set(body(s.id), await encodeChatStorageValue('[]', body(s.id), c));
  await assert.rejects(saveSession(conversation('new'), null, c), /quota/);
  for (const s of sessions) assert.ok(values.has(body(s.id)), `${s.id} kept`);
});

test('trimming still removes the oldest conversation after a successful save', async () => {
  const c = cipher(); const values = disk();
  const sessions = sessionList(MAX_CHAT_SESSIONS);
  values.set(INDEX, await encodeChatStorageValue(JSON.stringify(sessions), INDEX, c));
  for (const s of sessions) values.set(body(s.id), await encodeChatStorageValue('[]', body(s.id), c));
  await saveSession(conversation('new'), null, c);
  assert.equal(values.has(body(`s${MAX_CHAT_SESSIONS - 1}`)), false);
  assert.equal((await listSessions(c)).length, MAX_CHAT_SESSIONS);
});

test('deleting all removes unlisted and unreadable chat records but no other key', async () => {
  const values = disk(); const c = cipher();
  const id = (await saveSession(conversation('listed'), null, c))!;
  values.set(body('orphan'), 'legacy plaintext body');
  values.set(INDEX, CORRUPT);
  values.set('alice_personal_memory_v1', 'v1:other');
  values.set('alice_theme_mode', 'dark');
  const result = await cleanupSessions('all', c);
  assert.deepEqual(result.deletedIds.sort(), [id, 'orphan'].sort());
  assert.equal(result.remainingCount, 0);
  assert.deepEqual([...values.keys()].sort(), ['alice_personal_memory_v1', 'alice_theme_mode']);
});

test('deleting all reports a storage failure instead of claiming success', async () => {
  const values = disk(); const c = cipher();
  await saveSession(conversation('listed'), null, c);
  const failing: ChatStorageBackend = {
    getItem: async key => values.get(key) ?? null,
    setItem: async (key, value) => { values.set(key, value); },
    removeItem: async () => { throw new Error('denied'); },
    getAllKeys: async () => [...values.keys()],
  };
  setChatStorageBackendForTests(failing);
  const before = new Map(values);
  await assert.rejects(cleanupSessions('all', c), /denied/);
  assert.deepEqual(values, before);
});

test('an adapter without key listing keeps the index-based cleanup', async () => {
  const values = disk({ withKeys: false }); const c = cipher();
  const id = (await saveSession(conversation('listed'), null, c))!;
  const result = await cleanupSessions('all', c);
  assert.deepEqual(result.deletedIds, [id]);
  assert.equal(values.has(body(id)), false);
  assert.deepEqual(await listSessions(c), []);
});

test('delete all waits for an in-flight legacy migration so history cannot reappear', async () => {
  const values = disk(); const inner = cipher();
  let entered!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  const c = {
    decrypt: inner.decrypt,
    encrypt: async (value: string, context: string) => {
      if (context === body('legacy-race')) { entered(); await held; }
      return inner.encrypt(value, context);
    },
  };
  values.set(INDEX, JSON.stringify([{ id: 'legacy-race', title: 'old', createdAt: 1, updatedAt: 1, messageCount: 1 }]));
  values.set(body('legacy-race'), '[]');
  const migrating = listSessions(c);
  await started;
  const deleting = cleanupSessions('all', c);
  // Allow the old deletion path to finish before the delayed migration writes.
  await new Promise(resolve => setImmediate(resolve));
  release();
  await Promise.all([migrating, deleting]);
  assert.equal(values.has(INDEX), false);
  assert.equal(values.has(body('legacy-race')), false);
});
