// Listeners for a local model that finished installing and became the active
// one. No platform import, so this runs under node:test.

import type { LocalModelId } from './ai-preferences';

type Listener = (id: LocalModelId) => void;

const listeners = new Set<Listener>();

export function notifyLocalModelInstalled(id: LocalModelId): void {
  for (const listener of [...listeners]) listener(id);
}

export function subscribeLocalModelInstalled(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
