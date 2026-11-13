// Evaluation only. No production backend imports this module.
import assert from 'node:assert/strict';

export const PROBE_REVISION = '1a6f0a006db041bf742861e0bd4e995bba5fc0ae';
export const PROBE_REASONING_BUDGET = 384; // Per block in b9850, not a global thinking cap.
export const PROBE_FINAL_LIMIT = 768;
export const PROBE_CONTEXT_LIMIT = 8192;
export const PROBE_CONTEXT_MARGIN = 64;
export const PROBE_VARIANT = 'thinking384-transition-v2';
export const PROBE_REASONING_BUDGET_MESSAGE = '\nEnd the reasoning now. Provide only the final answer, stating uncertainty when needed.';

export function thinkingProbeRequest(original, mode) {
  assert.ok(['answer-only', 'thinking384'].includes(mode), 'Unknown probe mode');
  assert.equal(original.stream, true, 'Probe requires the production streaming request');
  assert.equal(original.max_tokens, PROBE_FINAL_LIMIT, 'Production final budget changed');
  assert.equal(original.chat_template_kwargs?.enable_thinking, false, 'Production thinking switch changed');
  assert.equal(original.messages[0]?.role, 'system', 'Leading system policy required');
  assert.ok(original.messages[0].content.endsWith(' /no_think'), 'Expected production suffix missing');
  assert.ok(!Object.hasOwn(original, 'reasoning_budget'), 'Undocumented request budget is forbidden');
  const body = structuredClone(original);
  if (mode === 'thinking384') {
    body.messages[0].content = body.messages[0].content.slice(0, -' /no_think'.length);
    body.chat_template_kwargs.enable_thinking = true;
    body.max_tokens = PROBE_FINAL_LIMIT + PROBE_REASONING_BUDGET;
  }
  return {
    body,
    mutations: {
      removedLeadingSystemNoThinkSuffix: mode === 'thinking384',
      originalEnableThinking: false, sentEnableThinking: body.chat_template_kwargs.enable_thinking,
      originalMaxTokens: original.max_tokens, sentMaxTokens: body.max_tokens,
    },
  };
}

function safeJson(text) {
  try { return JSON.parse(text); }
  catch { throw new Error('Invalid SSE JSON; response text deliberately omitted'); }
}

function tokenCountOrNull(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function controlMarkers(text) {
  // Keep exactly the existing rejection pattern. Only allowlisted names and
  // UTF-16 offsets leave this function; no matched or surrounding text does.
  const names = { '<think': 'think-open', '</think': 'think-close',
    '<|im_start|>': 'message-start', '<|im_end|>': 'message-end', '<|analysis|>': 'analysis' };
  return [...text.matchAll(/<\/?think\b|<\|(?:im_start|im_end|analysis)\|>/gi)]
    .map(match => ({ kind: names[match[0].toLowerCase()], offsetUtf16: match.index }));
}

/**
 * Discard reasoning_content at the transport boundary. It is never forwarded,
 * logged or accumulated. Final content is buffered for both arms, so leaked
 * reasoning delimiters and over-budget answers cannot enter later turns.
 * b9850 rearms its 384-token budget for each thinking block. 1152 is the global
 * TOTAL cap; it does not reserve or independently cap 768 final tokens.
 * Final-text retokenization above 768 remains a rejected length cut.
 */
export async function finalOnlyProbeResponse(response, { mode, requestMaxTokens, tokenize, metrics, onFinal = () => {}, startedAt = performance.now() }) {
  assert.ok(['answer-only', 'thinking384'].includes(mode), 'Unknown probe mode');
  assert.equal(requestMaxTokens, mode === 'thinking384' ? 1152 : 768, 'Unexpected sent total token limit');
  assert.ok(response.ok && response.body, `Probe completion HTTP ${response.status}`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '', finalText = '', finishReason = null, usage = null, done = false;
  Object.assign(metrics, {
    firstReasoningDeltaMs: null, firstFinalDeltaMs: null,
    reasoningObserved: false, reasoningCharacters: 0,
    serverReasoningTokens: null, serverUsage: null, usageValid: false,
    finalTokens: null, finalOverBudget: false, finalCharacters: 0, finalControlMarkers: [],
    contextBudget: { promptTokens: null, requestMaxTokens, marginTokens: PROBE_CONTEXT_MARGIN,
      contextLimit: PROBE_CONTEXT_LIMIT, requiredTokens: null, verified: false },
  });
  function consume(line) {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trim();
    if (!data) return;
    if (data === '[DONE]') { done = true; return; }
    const event = safeJson(data);
    assert.ok(!event.error, 'Server SSE error; response text deliberately omitted');
    if (event.usage) {
      const u = event.usage;
      // Preserve numeric evidence before later checks can reject the answer.
      metrics.serverUsage = {
        promptTokens: tokenCountOrNull(u.prompt_tokens),
        completionTokens: tokenCountOrNull(u.completion_tokens),
        totalTokens: tokenCountOrNull(u.total_tokens),
      };
      metrics.serverReasoningTokens = tokenCountOrNull(u.completion_tokens_details?.reasoning_tokens);
      usage = {
        prompt_tokens: metrics.serverUsage.promptTokens ?? 0,
        completion_tokens: metrics.serverUsage.completionTokens ?? 0,
        total_tokens: metrics.serverUsage.totalTokens ?? 0,
      };
    }
    const choices = event.choices ?? [];
    assert.ok(Array.isArray(choices) && choices.length <= 1, 'Unexpected SSE choice count');
    const choice = choices[0];
    if (choice) {
      const reasoning = choice.delta?.reasoning_content;
      if (typeof reasoning === 'string' && reasoning.length) {
        metrics.reasoningObserved = true;
        metrics.reasoningCharacters += reasoning.length;
        metrics.firstReasoningDeltaMs ??= performance.now() - startedAt;
      }
      const content = choice.delta?.content;
      if (typeof content === 'string' && content.length) {
        metrics.firstFinalDeltaMs ??= performance.now() - startedAt;
        finalText += content;
        assert.ok(finalText.length < 100_000, 'Unexpected final text size');
      }
      if (choice.finish_reason !== null && choice.finish_reason !== undefined) {
        assert.ok(['stop', 'length'].includes(choice.finish_reason), 'Unexpected completion finish reason');
        finishReason = choice.finish_reason;
      }
    }
  }
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      pending += decoder.decode(chunk.value, { stream: true });
      assert.ok(pending.length < 1_000_000, 'Oversized SSE line');
      const lines = pending.split('\n');
      pending = lines.pop() ?? '';
      for (const line of lines) consume(line.trimEnd());
    }
    pending += decoder.decode();
    if (pending.trim()) consume(pending.trimEnd());
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
    metrics.transportFinishedMs = performance.now() - startedAt;
    metrics.finalCharacters = finalText.length;
    metrics.finalControlMarkers = controlMarkers(finalText);
    metrics.originalLengthCut = finishReason === 'length';
    metrics.usageValid = metrics.serverUsage !== null && Object.values(metrics.serverUsage).every(value => value !== null);
    const promptTokens = metrics.serverUsage?.promptTokens ?? null;
    metrics.contextBudget.promptTokens = promptTokens;
    if (promptTokens !== null && promptTokens > 0) {
      metrics.contextBudget.requiredTokens = promptTokens + requestMaxTokens + PROBE_CONTEXT_MARGIN;
      metrics.contextBudget.verified = metrics.usageValid && metrics.contextBudget.requiredTokens <= PROBE_CONTEXT_LIMIT;
    }
  }
  assert.ok(done && finishReason !== null, 'Incomplete SSE response');
  assert.ok(mode !== 'answer-only' || !metrics.reasoningObserved, 'Answer-only arm emitted reasoning');
  // A parser mismatch must fail closed; never persist a thought-tagged content field.
  assert.equal(metrics.finalControlMarkers.length, 0, 'Reasoning/control delimiter in final content; text omitted');
  assert.ok(metrics.contextBudget.verified, 'Context budget not verified from per-call server usage');
  onFinal(finalText); // Final model text only, separate from numeric transport metrics.
  metrics.finalTokens = await tokenize(finalText);
  assert.ok(Number.isInteger(metrics.finalTokens) && metrics.finalTokens >= 0, 'Invalid final token count');
  metrics.finalOverBudget = metrics.finalTokens > PROBE_FINAL_LIMIT;
  if (metrics.finalOverBudget) finishReason = 'length';
  // Only allowlisted final text and numeric usage reach the production parser.
  const event = { choices: [{ index: 0, delta: { content: finalText }, finish_reason: finishReason }], ...(usage ? { usage } : {}) };
  return new Response(`data: ${JSON.stringify(event)}\n\ndata: [DONE]\n\n`, {
    status: 200, headers: { 'content-type': 'text/event-stream' },
  });
}
