import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  customModelHint,
  customServerBase,
  customThinkingSwitch,
  detectCustomProtocol,
  fitCustomServerMessages,
  listedModelIds,
  stripThinking,
  ThinkingFilter,
} from './custom-server-policy.ts';

describe('custom server: protocol', () => {
  it('speaks OpenAI whenever /v1/models answers, Ollama only as a fallback, nothing otherwise', () => {
    assert.equal(detectCustomProtocol(true, true), 'openai');
    assert.equal(detectCustomProtocol(true, false), 'openai');
    assert.equal(detectCustomProtocol(false, true), 'ollama');
    assert.equal(detectCustomProtocol(false, false), null);
  });

  it('reads model ids from both discovery shapes', () => {
    assert.deepEqual(listedModelIds({ data: [{ id: 'gpt-x' }, { id: ' ' }] }), ['gpt-x']);
    assert.deepEqual(listedModelIds({ models: [{ name: 'qwen3.5:4b', model: 'qwen3.5:4b' }] }), ['qwen3.5:4b']);
    assert.deepEqual(listedModelIds({ models: [{ model: '/models/Qwen3.5-4B-Q4_K_M.gguf' }] }), ['/models/Qwen3.5-4B-Q4_K_M.gguf']);
    assert.deepEqual(listedModelIds(null), []);
    assert.deepEqual(listedModelIds('x'), []);
  });
});

describe('custom server: model family', () => {
  it('takes the family from the configured name first, then from what the server lists', () => {
    assert.equal(customModelHint('qwen3.5:4b', ['whatever']), 'qwen3.5:4b');
    assert.equal(customModelHint('local', ['/models/Qwen3.5-4B-Q4_K_M.gguf']), '/models/Qwen3.5-4B-Q4_K_M.gguf');
    assert.equal(customModelHint('local', ['llama-3.1-8b']), 'local');
  });

  it('moves later system turns to user turns for Qwen3.5, as the local backend does, and leaves others alone', () => {
    const messages = [
      { role: 'system' as const, content: 'policy' },
      { role: 'user' as const, content: 'hi' },
      { role: 'system' as const, content: 'context' },
      { role: 'user' as const, content: 'question' },
    ];
    const qwen = fitCustomServerMessages(messages, 'Qwen3.5-4B-Q4_K_M.gguf');
    assert.deepEqual(qwen.map(m => m.role), ['system', 'user', 'user', 'user']);
    assert.match(qwen[2].content, /^Application context/);
    assert.match(qwen[2].content, /context$/);
    const other = fitCustomServerMessages(messages, 'llama-3.1-8b');
    assert.deepEqual(other.map(m => m.role), ['system', 'user', 'system', 'user']);
    assert.deepEqual(messages.map(m => m.role), ['system', 'user', 'system', 'user'], 'the input is not changed');
  });
});

describe('custom server: thinking', () => {
  it('switches thinking off for a Qwen or SmolLM3 family, on each API, and sends nothing extra otherwise', () => {
    assert.deepEqual(customThinkingSwitch('qwen3.5:4b', 'openai'), {
      promptSuffix: ' /no_think',
      payload: { chat_template_kwargs: { enable_thinking: false } },
    });
    assert.deepEqual(customThinkingSwitch('smollm3-3b', 'ollama'), { promptSuffix: ' /no_think', payload: { think: false } });
    assert.deepEqual(customThinkingSwitch('llama-3.1-8b', 'openai'), { promptSuffix: '', payload: {} });
  });

  it('strips a thinking block, empty, filled, or left open', () => {
    assert.equal(stripThinking('<think>\n\n</think>\n\nA UTXO is…'), 'A UTXO is…');
    assert.equal(stripThinking('<think>let me see</think>Answer'), 'Answer');
    assert.equal(stripThinking('Answer <think>never closed'), 'Answer ');
    assert.equal(stripThinking('No block here'), 'No block here');
  });

  it('streams only the visible text, holding back a tag spelled out in pieces', () => {
    const filter = new ThinkingFilter();
    const out: string[] = [];
    for (const chunk of ['<thi', 'nk>', 'hidden', '</think>', '\n\nVisible', ' text', ' <th', 'ink>again']) {
      const delta = filter.push(chunk);
      if (delta) out.push(delta);
    }
    assert.equal(out.join(''), 'Visible text ');
    assert.equal(filter.visibleText(), 'Visible text ');
  });
});

describe('custom server: address', () => {
  it('drops trailing slashes and a trailing /v1, which the backend adds itself', () => {
    assert.equal(customServerBase('http://localhost:11434'), 'http://localhost:11434');
    assert.equal(customServerBase('http://localhost:11434/'), 'http://localhost:11434');
    assert.equal(customServerBase('http://localhost:11434/v1'), 'http://localhost:11434');
    assert.equal(customServerBase(' http://localhost:11434/v1/ '), 'http://localhost:11434');
    assert.equal(customServerBase('https://ai.example.org/llama/v1'), 'https://ai.example.org/llama');
    assert.equal(customServerBase('https://ai.example.org/v1beta'), 'https://ai.example.org/v1beta');
  });
});
