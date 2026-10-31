import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { createTauriChannel } from './tauri-runtime.ts';

type Callback = (payload: unknown) => void;

// A webview bridge as Tauri 2 injects it: transformCallback registers the
// callback under window._<id> and hands the id back.
function installInternals() {
  const callbacks = new Map<number, Callback>();
  let nextId = 100;
  const w = globalThis as unknown as Record<string, unknown>;
  w.window = w;
  w.__TAURI_INTERNALS__ = {
    invoke: () => Promise.resolve(),
    transformCallback: (callback: Callback) => {
      const id = nextId++;
      callbacks.set(id, callback);
      w[`_${id}`] = callback;
      return id;
    },
  };
  return { callbacks, w };
}

afterEach(() => {
  const w = globalThis as unknown as Record<string, unknown>;
  delete w.__TAURI_INTERNALS__;
  delete w.window;
});

describe('createTauriChannel', () => {
  it('serializes as the Rust side expects and delivers messages in order', () => {
    const { callbacks, w } = installInternals();
    const received: string[] = [];
    const channel = createTauriChannel<string>(message => received.push(message));
    assert.equal(JSON.stringify({ onPiece: channel }), `{"onPiece":"__CHANNEL__:${channel.id}"}`);
    const callback = callbacks.get(channel.id) as Callback;
    callback({ message: 'a', index: 0 });
    // Out of order, as the bridge may deliver them: held until their turn.
    callback({ message: 'c', index: 2 });
    callback({ message: 'b', index: 1 });
    assert.deepEqual(received, ['a', 'b', 'c']);
    assert.equal(typeof w[`_${channel.id}`], 'function');
    callback({ end: true, index: 3 });
    assert.equal(w[`_${channel.id}`], undefined);
  });

  it('cleans up after an end that arrives before the last message', () => {
    const { callbacks, w } = installInternals();
    const received: string[] = [];
    const channel = createTauriChannel<string>(message => received.push(message));
    const callback = callbacks.get(channel.id) as Callback;
    callback({ end: true, index: 1 });
    assert.deepEqual(received, []);
    callback({ message: 'only', index: 0 });
    assert.deepEqual(received, ['only']);
    assert.equal(w[`_${channel.id}`], undefined);
  });

  it('refuses to run outside a Tauri webview', () => {
    const w = globalThis as unknown as Record<string, unknown>;
    w.window = w;
    assert.throws(() => createTauriChannel(() => {}), /outside Tauri webview/);
  });
});
