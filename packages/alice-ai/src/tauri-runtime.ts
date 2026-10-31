// Tauri 2 injects __TAURI_INTERNALS__ into every webview. @tauri-apps/api/core
// is a typed wrapper around this same object; using it directly keeps the
// shared AI package free of an additional desktop-only dependency.

/** True in any Alice app built with Tauri: desktop, Android or iOS. */
export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export type TauriShell = 'desktop' | 'android' | 'ios';

/**
 * Places a Tauri webview from its user agent. iPadOS asks for desktop sites
 * and reports itself as a Mac, so a Mac with a touch screen is an iPad.
 */
export function tauriShellFromHint(userAgent: string, maxTouchPoints: number): TauriShell {
  if (/android/i.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios';
  return 'desktop';
}

/** Which Tauri build this webview runs in, or null in a browser. */
export function tauriShell(): TauriShell | null {
  if (!isTauriApp()) return null;
  if (typeof navigator === 'undefined') return 'desktop';
  return tauriShellFromHint(navigator.userAgent ?? '', navigator.maxTouchPoints ?? 0);
}

/**
 * The desktop app only. Android and iOS share the webview bridge but not
 * llama-server, the title bar or the installers. iOS has the keychain cipher.
 */
export function isTauriDesktop(): boolean {
  return tauriShell() === 'desktop';
}

export function isTauriMobile(): boolean {
  const shell = tauriShell();
  return shell === 'android' || shell === 'ios';
}

/** The apps whose local stores are encrypted with a key in the system keychain. */
export function hasKeychainCipher(): boolean {
  const shell = tauriShell();
  return shell === 'desktop' || shell === 'ios';
}

/**
 * The apps that run a local model: every Tauri build. The desktop starts
 * llama-server next to the app; Android and iOS carry llama.cpp inside it
 * (apps/app-desktop/src-tauri/src/local_ai_engine.rs). The browser has nowhere
 * to put a weight file.
 */
export function hasLocalEngine(): boolean {
  return isTauriApp();
}

type TauriInvokeFn = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
type TauriTransformCallbackFn = (callback: (payload: unknown) => void, once?: boolean) => number;
type TauriInternals = { invoke: TauriInvokeFn; transformCallback?: TauriTransformCallbackFn };

function tauriInternals(): TauriInternals {
  const w = window as unknown as { __TAURI_INTERNALS__?: TauriInternals };
  const internals = w.__TAURI_INTERNALS__;
  if (!internals?.invoke) throw new Error('tauriInvoke called outside Tauri webview');
  return internals;
}

export function tauriInvoke<T = void>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const internals = tauriInternals();
  return internals.invoke.call(internals, cmd, args) as Promise<T>;
}

/** A Tauri Channel as the Rust side sees it: an argument serialized as `__CHANNEL__:<id>`. */
export type TauriChannel = { readonly id: number; toJSON(): string };

type TauriChannelMessage<T> = { index: number; message?: T; end?: boolean };

/**
 * A Tauri 2 Channel without @tauri-apps/api, for commands that stream (a
 * `tauri::ipc::Channel<T>` argument). The Rust side sends `{ message, index }`
 * for each value and `{ end: true, index }` when it drops the channel;
 * values are delivered in index order whatever order they arrive in, then
 * the callback is removed from the window, as the official class does.
 */
export function createTauriChannel<T>(onMessage: (message: T) => void): TauriChannel {
  const internals = tauriInternals();
  if (!internals.transformCallback) throw new Error('This Tauri webview has no channel support.');
  const pending = new Map<number, TauriChannelMessage<T>>();
  let next = 0;
  let id = 0;
  const cleanup = () => {
    try { Reflect.deleteProperty(window, `_${id}`); } catch { /* best effort */ }
  };
  const deliver = (raw: TauriChannelMessage<T>): boolean => {
    if (raw.end) { cleanup(); return false; }
    onMessage(raw.message as T);
    next += 1;
    return true;
  };
  id = internals.transformCallback(payload => {
    const raw = payload as TauriChannelMessage<T>;
    if (raw.index !== next) { pending.set(raw.index, raw); return; }
    if (!deliver(raw)) return;
    while (pending.has(next)) {
      const queued = pending.get(next) as TauriChannelMessage<T>;
      pending.delete(next);
      if (!deliver(queued)) return;
    }
  });
  return { id, toJSON: () => `__CHANNEL__:${id}` };
}
