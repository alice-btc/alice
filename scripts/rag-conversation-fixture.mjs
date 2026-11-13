import assert from 'node:assert/strict';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const only = (value, keys, label) => {
  assert.ok(object(value), `${label} must be an object`);
  assert.ok(Object.keys(value).every(key => keys.includes(key)), `${label} contains an unsupported field (no supplied history or assistant replies)`);
};

/** Validate the whole fixture before filtering; never accept prewritten answers. */
export function conversationRows(fixture, conversationId = null, memoryMode = false) {
  only(fixture, ['conversations', 'purpose', 'provenance', 'frozenAt', 'reviewPolicy', 'sourcesReviewed'], 'Fixture');
  assert.ok(Array.isArray(fixture.conversations) && fixture.conversations.length > 0, 'Require conversations');
  const ids = new Set();
  const rows = [];
  for (const conversation of fixture.conversations) {
    only(conversation, ['id', 'language', 'purpose', 'turns'], 'Conversation');
    assert.ok(typeof conversation.id === 'string' && /^[a-z0-9][a-z0-9_-]*$/i.test(conversation.id), 'Invalid conversation ID');
    assert.ok(!ids.has(conversation.id), 'Duplicate conversation ID');
    ids.add(conversation.id);
    assert.ok(['fr', 'en'].includes(conversation.language), 'Invalid conversation language');
    assert.ok(Array.isArray(conversation.turns) && conversation.turns.length >= 2, 'Require at least two conversation turns');
    for (const [turnIndex, turn] of conversation.turns.entries()) {
      only(turn, ['question', 'mustCover', 'mustNotClaim', 'critical', ...(memoryMode ? ['resetHistory', 'memoryAction', 'memoryExpected'] : [])], 'Turn');
      if (memoryMode) {
        assert.ok(turn.resetHistory === undefined || typeof turn.resetHistory === 'boolean', 'Invalid resetHistory');
        assert.ok(turn.memoryAction === undefined || ['disable', 'clear'].includes(turn.memoryAction), 'Invalid memoryAction');
        if (turn.memoryExpected !== undefined) {
          only(turn.memoryExpected, ['stored', 'selected', 'excluded', 'disabled'], 'Memory expectations');
          for (const key of ['stored', 'selected', 'excluded']) assert.ok(turn.memoryExpected[key] === undefined || (Array.isArray(turn.memoryExpected[key]) && turn.memoryExpected[key].every(value => typeof value === 'string' && value.trim())), 'Invalid memory expectation');
          assert.ok(turn.memoryExpected.disabled === undefined || typeof turn.memoryExpected.disabled === 'boolean', 'Invalid disabled expectation');
        }
      }
      assert.ok(typeof turn.question === 'string' && turn.question.trim(), 'Require nonempty question');
      for (const key of ['mustCover', 'mustNotClaim']) assert.ok(Array.isArray(turn[key]) && turn[key].every(item => typeof item === 'string' && item.trim()), `Invalid ${key}`);
      assert.ok(turn.critical === undefined || typeof turn.critical === 'boolean', 'Invalid critical flag');
      rows.push({ ...turn, id: `${conversation.id}-t${turnIndex + 1}`, conversationId: conversation.id, turnIndex, language: conversation.language });
    }
  }
  assert.ok(conversationId === null || ids.has(conversationId), 'Unknown conversation ID');
  return conversationId === null ? rows : rows.filter(row => row.conversationId === conversationId);
}

/** Store only raw user turns and successfully completed, actually produced replies. */
export function createConversationHistory() {
  const states = new Map();
  const stateFor = id => {
    if (!states.has(id)) states.set(id, { history: [], nextTurn: 0, pending: null, failed: false });
    return states.get(id);
  };
  return {
    begin(row) {
      const state = stateFor(row.conversationId);
      assert.ok(!state.failed, 'Conversation blocked by an earlier failed or truncated answer');
      assert.ok(state.pending === null && state.nextTurn === row.turnIndex, 'Conversation turns must execute once in order');
      if (row.resetHistory) state.history = [];
      state.pending = { turnIndex: row.turnIndex, question: row.question };
      return state.history.map(message => ({ ...message }));
    },
    complete(row, result) {
      const state = stateFor(row.conversationId);
      try {
        assert.ok(!state.failed && state.pending?.turnIndex === row.turnIndex && state.pending?.question === row.question, 'No matching pending conversation turn');
        assert.ok(!result.error && !result.generation?.truncated && !result.truncated, 'Failed or truncated conversation answer');
        assert.ok(typeof result.answer === 'string' && result.answer.trim(), 'Empty conversation answer');
        assert.ok(['model', 'direct-response'].includes(result.source), 'Missing conversation answer source');
        state.history.push({ role: 'user', content: row.question }, { role: 'assistant', content: result.answer });
        state.nextTurn++;
        state.pending = null;
      } catch (error) {
        state.failed = true;
        throw error;
      }
    },
    fail(row) { stateFor(row.conversationId).failed = true; },
  };
}
