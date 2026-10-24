import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMsg } from './chat-context';
import { reportBrowserStorageIssue } from './browser-storage-security.ts';

const SESSION_INDEX_KEY = 'alice_chat_sessions';
const SESSION_PREFIX = 'alice_chat_session_';
const ENCRYPTED_VALUE_PREFIX = 'alice-chat-encrypted:v1:';
export const MAX_CHAT_SESSIONS = 50;

export type ChatCleanupMode = 'all' | 'oldest-10' | 'keep-newest-10';

export interface ChatStorageSummary {
  count: number;
  maxSessions: number;
  oldestAt: number | null;
  newestAt: number | null;
  estimatedBytes: number;
}

export interface ChatCleanupResult {
  deletedCount: number;
  remainingCount: number;
  deletedIds: string[];
}

export interface ChatCleanupPlan {
  removed: ChatSession[];
  kept: ChatSession[];
}

export interface ChatStorageCipher {
  encrypt(plaintext: string, context: string): Promise<string>;
  decrypt(ciphertext: string, context: string): Promise<string>;
}

export interface ChatStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface ChatStorageBackend extends ChatStorageAdapter {
  removeItem(key: string): Promise<void>;
  /** Every stored key, so an explicit "delete all" reaches unlisted records. */
  getAllKeys?(): Promise<readonly string[]>;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

const migrationPromises = new WeakMap<ChatStorageCipher, Promise<void>>();
let backend: ChatStorageBackend = AsyncStorage;

/** Tests only: route chat storage through another adapter; null restores AsyncStorage. */
export function setChatStorageBackendForTests(next: ChatStorageBackend | null): void {
  backend = next ?? AsyncStorage;
}

export function isEncryptedChatStorageValue(value: string): boolean {
  return value.startsWith(ENCRYPTED_VALUE_PREFIX);
}

export async function encodeChatStorageValue(
  plaintext: string,
  context: string,
  cipher?: ChatStorageCipher,
): Promise<string> {
  if (!cipher) return plaintext;
  const ciphertext = await cipher.encrypt(plaintext, context);
  const verified = await cipher.decrypt(ciphertext, context);
  if (verified !== plaintext) {
    throw new Error('Chat storage encryption verification failed.');
  }
  return ENCRYPTED_VALUE_PREFIX + ciphertext;
}

export async function decodeChatStorageValue(
  value: string,
  context: string,
  cipher?: ChatStorageCipher,
): Promise<string> {
  if (!isEncryptedChatStorageValue(value)) return value;
  if (!cipher) {
    reportBrowserStorageIssue('unreadable');
    throw new Error('Encrypted chat storage is unavailable without its encryption provider.');
  }
  try { return await cipher.decrypt(value.slice(ENCRYPTED_VALUE_PREFIX.length), context); }
  catch (error) { reportBrowserStorageIssue('unreadable'); throw error; }
}

async function readStorageValue(key: string, cipher?: ChatStorageCipher): Promise<string | null> {
  const raw = await backend.getItem(key);
  if (raw === null) return null;
  return decodeChatStorageValue(raw, key, cipher);
}

async function writeStorageValue(
  key: string,
  plaintext: string,
  cipher?: ChatStorageCipher,
): Promise<void> {
  // Authenticate the stored record before replacing it, also when nothing
  // read it first: an unreadable record is kept and the write fails. The web
  // adapter checks again right before writing, for changes made meanwhile.
  const current = await backend.getItem(key);
  if (current !== null) await decodeChatStorageValue(current, key, cipher);
  const encoded = await encodeChatStorageValue(plaintext, key, cipher);
  await backend.setItem(key, encoded);
}

async function migrateChatStorage(cipher?: ChatStorageCipher): Promise<void> {
  if (!cipher) return;
  const existing = migrationPromises.get(cipher);
  if (existing) return existing;

  const migration = migrateChatStorageValues(backend, cipher);

  migrationPromises.set(cipher, migration);
  try {
    await migration;
  } catch (error) {
    migrationPromises.delete(cipher);
    throw error;
  }
}

export async function migrateChatStorageValues(
  storage: ChatStorageAdapter,
  cipher: ChatStorageCipher,
): Promise<void> {
  const rawIndex = await storage.getItem(SESSION_INDEX_KEY);
  if (!rawIndex) return;
  const indexPlaintext = await decodeChatStorageValue(rawIndex, SESSION_INDEX_KEY, cipher);
  const sessions = JSON.parse(indexPlaintext) as ChatSession[];
  if (!Array.isArray(sessions)) throw new Error('Invalid chat session index.');

  for (const session of sessions) {
    const key = SESSION_PREFIX + session.id;
    const rawSession = await storage.getItem(key);
    if (rawSession && !isEncryptedChatStorageValue(rawSession)) {
      const encrypted = await encodeChatStorageValue(rawSession, key, cipher);
      await storage.setItem(key, encrypted);
    }
  }
  if (!isEncryptedChatStorageValue(rawIndex)) {
    const encrypted = await encodeChatStorageValue(
      indexPlaintext,
      SESSION_INDEX_KEY,
      cipher,
    );
    await storage.setItem(SESSION_INDEX_KEY, encrypted);
  }
}

export async function listSessions(cipher?: ChatStorageCipher): Promise<ChatSession[]> {
  await migrateChatStorage(cipher);
  const raw = await readStorageValue(SESSION_INDEX_KEY, cipher);
  if (!raw) return [];
  try {
    const sessions: ChatSession[] = JSON.parse(raw);
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function saveSession(
  messages: ChatMsg[],
  existingId?: string | null,
  cipher?: ChatStorageCipher,
): Promise<string | null> {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return null;

  const sessions = await listSessions(cipher);
  const existingSession = existingId ? sessions.find(s => s.id === existingId) : undefined;
  const id = existingSession?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const title = userMessages[0].content.slice(0, 80);
  const session: ChatSession = {
    id,
    title,
    createdAt: existingSession?.createdAt ?? (messages[0]?.time instanceof Date ? messages[0].time.getTime() : Date.now()),
    updatedAt: Date.now(),
    messageCount: messages.length,
  };

  const serialized = messages.map(m => ({
    ...m,
    time: m.time instanceof Date ? m.time.toISOString() : m.time,
  }));

  const nextSessions = [session, ...sessions.filter(s => s.id !== id)];
  const removed = nextSessions.splice(MAX_CHAT_SESSIONS);

  await writeStorageValue(SESSION_PREFIX + id, JSON.stringify(serialized), cipher);
  await writeStorageValue(SESSION_INDEX_KEY, JSON.stringify(nextSessions), cipher);
  // Old conversations go only once the new one and the index are saved.
  await Promise.all(removed.map(s => backend.removeItem(SESSION_PREFIX + s.id)));
  return id;
}

export async function loadSession(id: string, cipher?: ChatStorageCipher): Promise<ChatMsg[]> {
  await migrateChatStorage(cipher);
  const raw = await readStorageValue(SESSION_PREFIX + id, cipher);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<ChatMsg & { time: string }>;
    return parsed.map(m => ({ ...m, time: new Date(m.time) }));
  } catch {
    return [];
  }
}

export async function deleteSession(id: string, cipher?: ChatStorageCipher): Promise<void> {
  await migrateChatStorage(cipher);
  await backend.removeItem(SESSION_PREFIX + id);
  const sessions = await listSessions(cipher);
  const filtered = sessions.filter(s => s.id !== id);
  await writeStorageValue(SESSION_INDEX_KEY, JSON.stringify(filtered), cipher);
}

export async function getChatStorageSummary(cipher?: ChatStorageCipher): Promise<ChatStorageSummary> {
  await migrateChatStorage(cipher);
  const sessions = await listSessions(cipher);
  const serializedSessions = await Promise.all(
    sessions.map(session => backend.getItem(SESSION_PREFIX + session.id)),
  );
  const index = JSON.stringify(sessions);
  return {
    count: sessions.length,
    maxSessions: MAX_CHAT_SESSIONS,
    oldestAt: sessions.length > 0
      ? Math.min(...sessions.map(session => session.updatedAt))
      : null,
    newestAt: sessions.length > 0
      ? Math.max(...sessions.map(session => session.updatedAt))
      : null,
    estimatedBytes: index.length * 2
      + serializedSessions.reduce((total, value) => total + (value?.length ?? 0) * 2, 0),
  };
}

export async function cleanupSessions(
  mode: ChatCleanupMode,
  cipher?: ChatStorageCipher,
): Promise<ChatCleanupResult> {
  if (mode === 'all' && backend.getAllKeys) {
    // A migration already reading legacy data must finish before enumeration,
    // or its pending writes could resurrect explicitly deleted conversations.
    // Its failure cannot prevent the user's explicit deletion of unreadable data.
    if (cipher) await migrationPromises.get(cipher)?.catch(() => {});
    return removeAllChatRecords(backend.getAllKeys());
  }
  await migrateChatStorage(cipher);
  const sessions = await listSessions(cipher);
  const { removed, kept } = planSessionCleanup(sessions, mode);

  await Promise.all(removed.map(session => backend.removeItem(SESSION_PREFIX + session.id)));
  await writeStorageValue(SESSION_INDEX_KEY, JSON.stringify(kept), cipher);
  return {
    deletedCount: removed.length,
    remainingCount: kept.length,
    deletedIds: removed.map(session => session.id),
  };
}

// An explicit "delete all" removes chat records by key, not only those an
// index lists: a legacy index hidden without a cipher, or an unreadable one,
// cannot leave conversations behind. Other keys are untouched. The index goes
// last, so after a failure the remaining records stay listed for a retry.
async function removeAllChatRecords(allKeys: Promise<readonly string[]>): Promise<ChatCleanupResult> {
  const bodies = (await allKeys).filter(key => key.startsWith(SESSION_PREFIX));
  await Promise.all(bodies.map(key => backend.removeItem(key)));
  await backend.removeItem(SESSION_INDEX_KEY);
  const deletedIds = bodies.map(key => key.slice(SESSION_PREFIX.length));
  return { deletedCount: deletedIds.length, remainingCount: 0, deletedIds };
}

export function planSessionCleanup(
  sessions: ChatSession[],
  mode: ChatCleanupMode,
): ChatCleanupPlan {
  if (mode === 'all') {
    return { removed: sessions, kept: [] };
  }
  if (mode === 'oldest-10') {
    const removeCount = Math.min(10, sessions.length);
    return {
      removed: sessions.slice(sessions.length - removeCount),
      kept: sessions.slice(0, sessions.length - removeCount),
    };
  }
  return {
    removed: sessions.slice(10),
    kept: sessions.slice(0, 10),
  };
}
