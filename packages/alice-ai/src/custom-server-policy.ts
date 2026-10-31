import type { Message } from './llm';
import { fitLocalModelRoles, localModelFamily, usesAnswerOnlyLocalMode } from './local-model-message-policy.ts';

// What the custom-server backend needs to know about the server it was
// pointed at, read from what the server itself answers, never guessed from
// the presence of an API key: which API it speaks, and which model family it
// serves, so the same template and thinking rules as the bundled local
// models apply when the family is one of theirs (a llama-server or Ollama
// running Qwen3.5 is the common case on a Mac).

export type CustomServerProtocol = 'openai' | 'ollama';

/**
 * The API the server speaks. The OpenAI shape wins when /v1/models answers,
 * which Ollama also does; /api/chat is used only for a server that answers
 * /api/tags and nothing else. Null when neither answers.
 */
export function detectCustomProtocol(openAiModelsOk: boolean, ollamaTagsOk: boolean): CustomServerProtocol | null {
  if (openAiModelsOk) return 'openai';
  if (ollamaTagsOk) return 'ollama';
  return null;
}

/**
 * The server's address as the backend uses it: what the user typed, without
 * trailing slashes and without a trailing "/v1", since the backend adds each
 * path itself. An address copied from a client's example
 * ("http://localhost:11434/v1") otherwise asked for /v1/v1/models.
 */
export function customServerBase(url: string): string {
  return url.trim().replace(/\/+$/, '').replace(/\/v1$/i, '').replace(/\/+$/, '');
}

/** Model ids from a /v1/models body ({data: [{id}]}) or an /api/tags body ({models: [{name|model}]}). */
export function listedModelIds(body: unknown): string[] {
  if (!body || typeof body !== 'object') return [];
  const ids: string[] = [];
  const record = body as { data?: unknown; models?: unknown };
  for (const list of [record.data, record.models]) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      if (!entry || typeof entry !== 'object') continue;
      const item = entry as { id?: unknown; name?: unknown; model?: unknown };
      for (const value of [item.id, item.name, item.model]) {
        if (typeof value === 'string' && value.trim()) { ids.push(value.trim()); break; }
      }
    }
  }
  return ids;
}

/**
 * The id that names the model family: the configured name when it does
 * ("qwen3.5:4b"), else the first listed id that does (llama-server lists the
 * GGUF path, "…/Qwen3.5-4B-Q4_K_M.gguf"), else the configured name as is.
 */
export function customModelHint(configured: string, listed: readonly string[]): string {
  for (const id of [configured, ...listed]) {
    if (localModelFamily(id) !== 'other') return id;
  }
  return configured;
}

/**
 * The messages as the server's template accepts them: a family that takes a
 * system message only at the beginning gets the later system turns (internal
 * context, language reminder) as user turns, exactly as on the local
 * backend. Any other family keeps the messages unchanged.
 */
export function fitCustomServerMessages(messages: Message[], modelHint: string): Message[] {
  return fitLocalModelRoles(messages, modelHint);
}

/**
 * How to keep a thinking model from spending its budget on a <think> block:
 * the /no_think soft switch in the prompt, plus the request field each API
 * understands. Nothing for a family without a thinking mode, so a server
 * strict about unknown fields never sees them.
 */
export function customThinkingSwitch(modelHint: string, protocol: CustomServerProtocol): {
  promptSuffix: string;
  payload: Record<string, unknown>;
} {
  if (!usesAnswerOnlyLocalMode(modelHint)) return { promptSuffix: '', payload: {} };
  return {
    promptSuffix: ' /no_think',
    payload: protocol === 'openai' ? { chat_template_kwargs: { enable_thinking: false } } : { think: false },
  };
}

/**
 * The answer without its thinking block, closed or still open: a model that
 * reasons anyway, or a template that emits an empty block, must not show it.
 */
export function stripThinking(text: string): string {
  const closed = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  const open = closed.search(/<think>/i);
  const visible = open === -1 ? closed : closed.slice(0, open);
  return visible.replace(/^\s+/, '');
}

/**
 * Streams the visible part of an answer whose thinking block arrives in
 * pieces: the delta returned by push() never includes text inside <think>,
 * nor a tag that is still being spelled out.
 */
export class ThinkingFilter {
  private full = '';
  private shown = '';

  push(chunk: string): string {
    this.full += chunk;
    let visible = stripThinking(this.full);
    // Hold back a possible partial "<think>" at the very end.
    const tail = visible.match(/<(?:t(?:h(?:i(?:n(?:k)?)?)?)?)?$/i);
    if (tail) visible = visible.slice(0, -tail[0].length);
    if (!visible.startsWith(this.shown)) return '';
    const delta = visible.slice(this.shown.length);
    this.shown = visible;
    return delta;
  }

  /** The whole visible answer once the stream ended. */
  visibleText(): string {
    return stripThinking(this.full);
  }
}
