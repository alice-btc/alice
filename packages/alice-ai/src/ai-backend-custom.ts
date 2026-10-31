import { fetch } from 'expo/fetch';
import type { AIBackend, AIBackendStatus, AIResponse, SendMessageOptions, TokenUsage } from './ai-backend';
import type { Message } from './llm';
import { getPreset, PRESETS, getCustomServer, getAliceInstructions, type CustomServerConfig } from './ai-preferences';
import {
  applyAliceResponseConstraints,
  buildAliceSystemPrompt,
  requiresBufferedAliceResponse,
  withAliceInstructionReminder,
} from './ai-system-prompt';
import {
  customModelHint,
  customServerBase,
  customThinkingSwitch,
  detectCustomProtocol,
  fitCustomServerMessages,
  listedModelIds,
  ThinkingFilter,
  type CustomServerProtocol,
} from './custom-server-policy';

// A server the user runs: their own machine, their node, a company server.
// It speaks the OpenAI shape (llama-server, LM Studio, vLLM, Ollama too) or,
// failing that, Ollama's own /api/chat. What it serves is read from its
// model list, so a Qwen3.5 behind llama-server gets the same template and
// thinking rules as the bundled local model instead of a 400.

export type CustomServerProbe = { protocol: CustomServerProtocol; models: string[] };

/**
 * What the server at this address answers: the API it speaks and the models
 * it lists, or null when neither discovery path answers. The backend asks
 * this before its first message, and Settings asks it when the user saves
 * the address, so "connected" there means the server answered, not that an
 * address was saved.
 */
export async function probeCustomServer(config: CustomServerConfig): Promise<CustomServerProbe | null> {
  const base = customServerBase(config.url);
  const headers: Record<string, string> = config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {};
  const probe = async (path: string): Promise<unknown | null> => {
    try {
      const res = await fetch(`${base}${path}`, { method: 'GET', headers });
      if (!res.ok) return null;
      return await res.json().catch(() => ({}));
    } catch {
      return null;
    }
  };
  const openAi = await probe('/v1/models');
  const ollama = openAi === null ? await probe('/api/tags') : null;
  const protocol = detectCustomProtocol(openAi !== null, ollama !== null);
  return protocol ? { protocol, models: listedModelIds(openAi ?? ollama) } : null;
}

export class CustomAIBackend implements AIBackend {
  readonly type = 'custom' as const;
  private _status: AIBackendStatus = { state: 'idle' };
  private config: CustomServerConfig | null = null;
  private protocol: CustomServerProtocol = 'openai';
  private modelHint = '';

  async init(): Promise<void> {
    this.config = await getCustomServer();
    if (!this.config?.url) {
      this._status = { state: 'error', message: 'No custom server configured. Go to Settings > Customize Alice.' };
      return;
    }
    const probed = await probeCustomServer(this.config);
    if (!probed) {
      this._status = { state: 'error', message: `Cannot reach ${this.config.url}` };
      return;
    }
    this.protocol = probed.protocol;
    this.modelHint = customModelHint(this.config.model, probed.models);
    this._status = { state: 'ready' };
  }

  status(): AIBackendStatus {
    return this._status;
  }

  private authHeaders(): Record<string, string> {
    return this.config?.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {};
  }

  async sendMessage(messages: Message[], onChunk?: (chunk: string) => void, options?: SendMessageOptions): Promise<AIResponse> {
    if (!this.config?.url) throw new Error('No custom server configured.');

    const [preset, instructions] = await Promise.all([getPreset('cloud'), getAliceInstructions()]);
    const params = PRESETS[preset];
    const base = customServerBase(this.config.url);
    const shouldBuffer = requiresBufferedAliceResponse(instructions);
    const responseLanguage = options?.responseLanguage ?? 'en';
    const thinking = customThinkingSwitch(this.modelHint, this.protocol);

    const fullMessages = fitCustomServerMessages([
      { role: 'system' as const, content: buildAliceSystemPrompt(instructions, responseLanguage) + thinking.promptSuffix },
      ...withAliceInstructionReminder(messages, instructions, responseLanguage, options?.strictLanguageRetry),
    ], this.modelHint);

    const generation = { ...params, temperature: options?.temperatureOverride ?? params.temperature };
    const streamTo = shouldBuffer ? undefined : onChunk;
    const result = this.protocol === 'ollama'
      ? await this.sendOllama(base, fullMessages, generation, thinking.payload, streamTo)
      : await this.sendOpenAI(base, fullMessages, generation, thinking.payload, streamTo);
    const constrained = applyAliceResponseConstraints(instructions, result.content);
    if (shouldBuffer && onChunk) onChunk(constrained);
    // truncated is surfaced to the UI as a "may be incomplete" notice. Unlike
    // cloud, Custom never auto-continues (chat-context gates continuation on the
    // cloud backend), so this is a signal only.
    return { content: constrained, usage: result.usage, durationMs: result.durationMs, truncated: result.truncated };
  }

  private async sendOllama(
    base: string,
    messages: Message[],
    params: { temperature: number; maxTokens: number },
    extra: Record<string, unknown>,
    onChunk?: (chunk: string) => void,
  ): Promise<AIResponse> {
    const t0 = Date.now();
    const response = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({
        model: this.config!.model,
        messages,
        stream: Boolean(onChunk),
        options: { temperature: params.temperature, num_predict: params.maxTokens },
        ...extra,
      }),
    });

    if (!response.ok) throw new Error(`Server error ${response.status}`);

    if (onChunk && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const filter = new ThinkingFilter();
      let buffer = '';
      let usage: TokenUsage | undefined;
      let truncated = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.done && parsed.eval_count) {
              usage = {
                promptTokens: parsed.prompt_eval_count ?? 0,
                completionTokens: parsed.eval_count ?? 0,
                totalTokens: (parsed.prompt_eval_count ?? 0) + (parsed.eval_count ?? 0),
              };
            }
            // Ollama reports why it stopped in the final done frame:
            // 'length' means it hit num_predict and cut off. Older servers omit
            // done_reason, so absence is treated as "not truncated" (no false
            // positive).
            if (parsed.done && parsed.done_reason === 'length') truncated = true;
            const content = parsed.message?.content ?? '';
            if (content) {
              const visible = filter.push(content);
              if (visible) onChunk(visible);
            }
          } catch {}
        }
      }
      return { content: filter.visibleText(), usage, durationMs: Date.now() - t0, truncated };
    }

    const data = await response.json();
    const usage: TokenUsage | undefined = data.eval_count ? {
      promptTokens: data.prompt_eval_count ?? 0,
      completionTokens: data.eval_count ?? 0,
      totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
    } : undefined;
    return {
      content: new ThinkingFilter().push(data.message?.content ?? '') ,
      usage,
      durationMs: Date.now() - t0,
      truncated: data.done_reason === 'length',
    };
  }

  private async sendOpenAI(
    base: string,
    messages: Message[],
    params: { temperature: number; maxTokens: number },
    extra: Record<string, unknown>,
    onChunk?: (chunk: string) => void,
  ): Promise<AIResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...this.authHeaders() };

    const streaming = Boolean(onChunk);
    const payload: Record<string, unknown> = {
      model: this.config!.model,
      messages,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      stream: streaming,
      ...extra,
    };
    if (streaming) payload.stream_options = { include_usage: true };

    const t0 = Date.now();
    const response = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Server error ${response.status}`);

    if (onChunk && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const filter = new ThinkingFilter();
      let buffer = '';
      let usage: TokenUsage | undefined;
      let truncated = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trimEnd();
          if (!trimmed.startsWith('data: ')) continue;
          const json = trimmed.slice(6).trim();
          if (!json || json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            if (parsed.usage) {
              const u = parsed.usage;
              usage = {
                promptTokens: u.prompt_tokens ?? 0,
                completionTokens: u.completion_tokens ?? 0,
                totalTokens: u.total_tokens ?? (u.prompt_tokens ?? 0) + (u.completion_tokens ?? 0),
              };
            }
            // OpenAI-compatible finish_reason 'length' means max_tokens cut it off.
            if (parsed.choices?.[0]?.finish_reason === 'length') truncated = true;
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              const visible = filter.push(delta);
              if (visible) onChunk(visible);
            }
          } catch {}
        }
      }
      return { content: filter.visibleText(), usage, durationMs: Date.now() - t0, truncated };
    }

    const data = await response.json();
    const u = data.usage;
    const usage: TokenUsage | undefined = u ? {
      promptTokens: u.prompt_tokens ?? 0,
      completionTokens: u.completion_tokens ?? 0,
      totalTokens: u.total_tokens ?? (u.prompt_tokens ?? 0) + (u.completion_tokens ?? 0),
    } : undefined;
    return {
      content: new ThinkingFilter().push(data.choices?.[0]?.message?.content ?? ''),
      usage,
      durationMs: Date.now() - t0,
      truncated: data.choices?.[0]?.finish_reason === 'length',
    };
  }

  async dispose(): Promise<void> {
    this._status = { state: 'idle' };
  }
}
