import assert from 'node:assert/strict';

/** Ephemeral storage adapter; production parsers, filters and writes remain unchanged. */
export function createMemoryEvaluation(runtime) {
  const stores = new Map();
  const storageFor = id => {
    if (!stores.has(id)) {
      let value = null;
      stores.set(id, { read: async () => value, write: async next => { value = next; }, remove: async () => { value = null; } });
    }
    return stores.get(id);
  };
  return {
    async begin(row) {
      const storage = storageFor(row.conversationId);
      if (row.memoryAction === 'disable') await runtime.setAliceMemoryEnabledInStorage(false, storage);
      if (row.memoryAction === 'clear') await runtime.clearAliceMemoryFromStorage(storage);
      return runtime.getAliceMemoryFromStorage(storage);
    },
    read: row => runtime.getAliceMemoryFromStorage(storageFor(row.conversationId)),
    write: (row, candidates) => runtime.writeAliceCandidatesToStorage(candidates, storageFor(row.conversationId)),
  };
}

export function selectedMemoryIds(memory, context) {
  return memory.items.filter(item => context.split('\n').some(line => line === `- (noted ${item.updatedDay}) ${item.text}`)).map(item => item.id);
}

/** These gates prove storage/selection/prompt transport, never semantic use in an answer. */
export function assertMemoryExpectations(expected = {}, memory, selectedIds, requests, source) {
  const folded = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const contains = (items, fragment) => items.some(item => folded(item.text).includes(folded(fragment)));
  const selected = memory.items.filter(item => selectedIds.includes(item.id));
  for (const fragment of expected.stored ?? []) assert.ok(contains(memory.items, fragment), `Missing stored memory: ${fragment}`);
  for (const fragment of expected.selected ?? []) assert.ok(contains(selected, fragment), `Missing selected memory: ${fragment}`);
  for (const fragment of expected.excluded ?? []) assert.ok(!contains(selected, fragment), `Unexpected selected memory: ${fragment}`);
  if (expected.disabled) {
    assert.equal(memory.enabled, false, 'Memory must be disabled');
    for (const request of requests) for (const item of memory.items) {
      assert.ok(!request.messages.some(message => message.content.includes(item.text)), `Disabled memory leaked into model request: ${item.id}`);
    }
  }
  if (source === 'model' && selected.length) {
    assert.ok(requests.length > 0, 'Missing recorded model request');
    for (const request of requests) for (const item of selected) {
      assert.ok(request.messages.some(message => message.content.includes(item.text)), `Selected memory missing from model request: ${item.id}`);
    }
  }
}
