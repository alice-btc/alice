import assert from 'node:assert/strict';
import test from 'node:test';
import { thinkingProbeRequest, finalOnlyProbeResponse } from './rag-thinking-probe.mjs';
import { createConversationHistory } from './rag-conversation-fixture.mjs';

function request() {
  return { stream: true, max_tokens: 768, seed: 42, temperature: .3,
    chat_template_kwargs: { enable_thinking: false },
    messages: [{ role: 'system', content: 'Trusted policy /no_think' },
      { role: 'user', content: 'Source mentions /no_think as data.' }] };
}
function response(reasoning = 'synthetic-private-marker', content = 'Final answer.', finish = 'stop') {
  const events = [
    { choices: [{ delta: { reasoning_content: reasoning } }] },
    { choices: [{ delta: { content }, finish_reason: finish }] },
    { choices: [], usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30, completion_tokens_details: { reasoning_tokens: 7 } } },
  ];
  return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n');
}
test('only three candidate controls change; baseline and input remain exact', () => {
  const original = request(), before = structuredClone(original);
  assert.deepEqual(thinkingProbeRequest(original, 'answer-only').body, original);
  const candidate = thinkingProbeRequest(original, 'thinking384').body;
  assert.equal(candidate.messages[0].content, 'Trusted policy');
  assert.deepEqual(candidate.messages.slice(1), original.messages.slice(1));
  assert.equal(candidate.chat_template_kwargs.enable_thinking, true);
  assert.equal(candidate.max_tokens, 1152);
  candidate.messages[0].content += ' /no_think';
  candidate.chat_template_kwargs.enable_thinking = false;
  candidate.max_tokens = 768;
  assert.deepEqual(candidate, before);
  assert.deepEqual(original, before);
});
test('reasoning is discarded; only final content and numeric metrics survive', async () => {
  const metrics = {};
  const sanitized = await finalOnlyProbeResponse(response(), { mode: 'thinking384', requestMaxTokens: 1152, tokenize: async text => { assert.equal(text, 'Final answer.'); return 3; }, metrics });
  const text = await sanitized.text();
  assert.match(text, /Final answer/);
  assert.doesNotMatch(text + JSON.stringify(metrics), /synthetic-private-marker|reasoning_content/);
  assert.equal(metrics.reasoningObserved, true);
  assert.equal(metrics.serverReasoningTokens, 7);
  assert.equal(metrics.finalTokens, 3);
});
test('over-768 final content is explicitly a length cut, never silently accepted', async () => {
  const metrics = {};
  const rawFinals = [];
  const sanitized = await finalOnlyProbeResponse(response(), { mode: 'thinking384', requestMaxTokens: 1152, tokenize: async () => 769, metrics, onFinal: text => rawFinals.push(text) });
  assert.equal(metrics.finalOverBudget, true);
  const emitted = await sanitized.text();
  assert.match(emitted, /"finish_reason":"length"/);
  assert.deepEqual(rawFinals, ['Final answer.']);
  const row = { conversationId: 'synthetic-budget-check', turnIndex: 0, question: 'First question' };
  const history = createConversationHistory();
  history.begin(row);
  assert.throws(() => history.complete(row, { source: 'model', answer: rawFinals[0], generation: { truncated: true } }), /truncated/);
  assert.throws(() => history.begin({ ...row, turnIndex: 1, question: 'Second question' }), /blocked/);
});
test('answer-only reasoning and leaked thought delimiters fail before delivery', async () => {
  await assert.rejects(finalOnlyProbeResponse(response(), { mode: 'answer-only', requestMaxTokens: 768, tokenize: async () => 3, metrics: {} }), /Answer-only arm/);
  await assert.rejects(finalOnlyProbeResponse(response('', '<think>hidden</think>Final'), { mode: 'thinking384', requestMaxTokens: 1152, tokenize: async () => 3, metrics: {} }), /delimiter/);
});
test('malformed SSE cannot expose private payload in an error', async () => {
  const broken = new Response('data: {"reasoning_content":"synthetic-private-marker\n\n');
  await assert.rejects(finalOnlyProbeResponse(broken, { mode: 'thinking384', requestMaxTokens: 1152, tokenize: async () => 0, metrics: {} }), error => {
    assert.doesNotMatch(String(error), /synthetic-private-marker/);
    return /response text deliberately omitted/.test(String(error));
  });
});

function sseEvents(events, splitBytes = false) {
  const text = events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n';
  if (!splitBytes) return new Response(text);
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({ start(controller) {
    for (let offset = 0; offset < bytes.length; offset += 7) controller.enqueue(bytes.slice(offset, offset + 7));
    controller.close();
  } }));
}
function usageEvent(prompt = 10, completion = 20, extra = {}) {
  return { choices: [], usage: { prompt_tokens: prompt, completion_tokens: completion,
    total_tokens: typeof prompt === 'number' ? prompt + 20 : 30, ...extra } };
}
test('split control delimiters keep only types, offsets and numeric usage on rejection', async () => {
  const metrics = {}, finals = [];
  const events = [
    { choices: [{ delta: { reasoning_content: 'private-reasoning-value' } }] },
    { choices: [{ delta: { content: 'safe<' } }] },
    { choices: [{ delta: { content: 'think>private-final-value</th' } }] },
    { choices: [{ delta: { content: 'ink><|im_start|><|im_end|><|analysis|>' }, finish_reason: 'stop' }] },
    usageEvent(2500, 700, { total_tokens: 3200, unknown_text: 'private-usage-value' }),
  ];
  await assert.rejects(finalOnlyProbeResponse(sseEvents(events, true), {
    mode: 'thinking384', requestMaxTokens: 1152, metrics,
    tokenize: async () => assert.fail('Suspect content must not reach tokenizer'),
    onFinal: text => finals.push(text),
  }), /delimiter/);
  assert.deepEqual(metrics.finalControlMarkers.map(x => x.kind), ['think-open', 'think-close', 'message-start', 'message-end', 'analysis']);
  assert.equal(metrics.finalControlMarkers[0].offsetUtf16, 4);
  assert.ok(metrics.finalControlMarkers.every(x => Number.isSafeInteger(x.offsetUtf16)));
  assert.deepEqual(metrics.serverUsage, { promptTokens: 2500, completionTokens: 700, totalTokens: 3200 });
  assert.equal(metrics.contextBudget.requiredTokens, 3716);
  assert.equal(metrics.contextBudget.verified, true);
  assert.equal(metrics.finalTokens, null);
  assert.deepEqual(finals, []);
  assert.doesNotMatch(JSON.stringify(metrics), /private-reasoning-value|private-final-value|private-usage-value|<think/);
});
test('each actual call requires valid usage and enough context, including the exact boundary', async () => {
  for (const [mode, maxTokens, boundary] of [['answer-only', 768, 7360], ['thinking384', 1152, 6976]]) {
    for (const prompt of [boundary, boundary + 1]) {
      const metrics = {}, finals = [];
      const run = finalOnlyProbeResponse(sseEvents([
        { choices: [{ delta: { content: 'A complete final answer.' }, finish_reason: 'stop' }] }, usageEvent(prompt),
      ]), { mode, requestMaxTokens: maxTokens, metrics, tokenize: async () => 5, onFinal: text => finals.push(text) });
      if (prompt === boundary) {
        assert.match(await (await run).text(), /complete final/);
        assert.equal(metrics.contextBudget.requiredTokens, 8192);
        assert.equal(metrics.contextBudget.verified, true);
        assert.equal(finals.length, 1);
      } else {
        await assert.rejects(run, /Context budget/);
        assert.equal(metrics.contextBudget.requiredTokens, 8193);
        assert.equal(metrics.contextBudget.verified, false);
        assert.deepEqual(finals, []);
      }
    }
  }
});
test('missing or invalid usage is unknown and rejected, never replaced with an accepted zero', async () => {
  for (const event of [null, usageEvent('private-invalid-count'), usageEvent(-1), usageEvent(0), usageEvent(10.5), usageEvent(10, 'private-invalid-count')]) {
    const metrics = {};
    const events = [{ choices: [{ delta: { content: 'Final answer.' }, finish_reason: 'stop' }] }];
    if (event) events.push(event);
    await assert.rejects(finalOnlyProbeResponse(sseEvents(events), {
      mode: 'thinking384', requestMaxTokens: 1152, metrics, tokenize: async () => assert.fail('No acceptance without usage'),
      onFinal: () => assert.fail('No final delivery without usage'),
    }), /Context budget/);
    assert.equal(metrics.contextBudget.verified, false);
    assert.doesNotMatch(JSON.stringify(metrics), /private-invalid-count/);
  }
});
test('server length cuts remain length cuts even below the final acceptance limit', async () => {
  const metrics = {};
  const result = await finalOnlyProbeResponse(response('', 'Incomplete final', 'length'), {
    mode: 'thinking384', requestMaxTokens: 1152, metrics, tokenize: async () => 3,
  });
  assert.match(await result.text(), /"finish_reason":"length"/);
  assert.equal(metrics.originalLengthCut, true);
  assert.equal(metrics.finalOverBudget, false);
});
test('numeric usage already received survives a later malformed event without its content', async () => {
  const metrics = {};
  const text = `data: ${JSON.stringify(usageEvent(100))}\n\ndata: {"reasoning_content":"private-broken-event\n\n`;
  await assert.rejects(finalOnlyProbeResponse(new Response(text), {
    mode: 'thinking384', requestMaxTokens: 1152, metrics, tokenize: async () => 3,
  }), /response text deliberately omitted/);
  assert.equal(metrics.serverUsage.promptTokens, 100);
  assert.equal(metrics.contextBudget.verified, true);
  assert.doesNotMatch(JSON.stringify(metrics), /private-broken-event/);
});
