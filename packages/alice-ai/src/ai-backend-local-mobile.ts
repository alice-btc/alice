// Local AI in the Android and iOS apps: llama.cpp runs inside the app
// (apps/app-desktop/src-tauri/src/local_ai_engine.rs) and answers through
// Tauri commands, each piece of the answer arriving on a Channel. No port is
// opened and nothing leaves the phone. Models are downloaded and listed with
// the same commands as the desktop (ai-backend-local-desktop.ts).

import type { AIBackend, AIBackendStatus, AIResponse, SendMessageOptions } from './ai-backend';
import type { Message } from './llm';
import { getActiveModelId, getModelEntry } from './ai-preferences';
import { applyAliceResponseConstraints } from './ai-system-prompt';
import { getDesktopModelStatus } from './ai-backend-local-desktop';
import { LOCAL_CONTEXT_TOKENS } from './local-context-budget';
import type { DeviceMemory } from './local-model-memory';
import { prepareLocalRequest } from './local-request';
import { createTauriChannel, tauriInvoke } from './tauri-runtime';

export const NO_LOCAL_MODEL_MESSAGE =
  'No local model is installed yet. Download one from Settings, or keep using Private Cloud.';

type MobileGenerationResult = {
  content: string;
  promptTokens: number;
  completionTokens: number;
  truncated: boolean;
  cancelled: boolean;
  durationMs: number;
};

export type MobileEngineStatus = {
  loadedModel: string | null;
  contextTokens: number | null;
  busy: boolean;
};

export function getMobileEngineStatus(): Promise<MobileEngineStatus> {
  return tauriInvoke<MobileEngineStatus>('local_ai_engine_status');
}

/** What the phone reports it can still give the app; null when it did not say. */
export async function getDeviceMemory(): Promise<DeviceMemory | null> {
  try {
    const memory = await tauriInvoke<DeviceMemory>('local_ai_device_memory');
    return memory && memory.availableBytes > 0 ? memory : null;
  } catch {
    return null;
  }
}

export class LocalMobileAIBackend implements AIBackend {
  readonly type = 'local' as const;
  private _status: AIBackendStatus = { state: 'idle' };

  async init(): Promise<void> {
    this._status = { state: 'loading' };
    try {
      const activeModelId = await getActiveModelId();
      const entry = getModelEntry(activeModelId);
      if ((await getDesktopModelStatus(activeModelId)) !== 'installed') {
        // No model ships with Alice: on a fresh install this is the expected
        // state, not a failure.
        this._status = { state: 'error', message: NO_LOCAL_MODEL_MESSAGE };
        return;
      }
      // The engine keeps a model already loaded with this context and frees
      // another one first; it refuses, with the figures, a model the device
      // cannot hold.
      await tauriInvoke('local_ai_engine_load', { filename: entry.filename, ctxSize: LOCAL_CONTEXT_TOKENS });
      this._status = { state: 'ready' };
    } catch (e) {
      this._status = { state: 'error', message: e instanceof Error ? e.message : String(e) };
    }
  }

  status(): AIBackendStatus {
    return this._status;
  }

  async sendMessage(messages: Message[], onChunk?: (chunk: string) => void, options?: SendMessageOptions): Promise<AIResponse> {
    if (this._status.state !== 'ready') throw new Error('Local AI is not ready.');
    const prepared = await prepareLocalRequest(messages, options, LOCAL_CONTEXT_TOKENS, 'condensed');
    const streamFn = prepared.buffered ? undefined : onChunk;
    const onPiece = createTauriChannel<string>(piece => { streamFn?.(piece); });
    const result = await tauriInvoke<MobileGenerationResult>('local_ai_engine_generate', {
      request: {
        messages: prepared.messages,
        temperature: prepared.temperature,
        maxTokens: prepared.maxTokens,
        disableThinking: prepared.disableThinking,
      },
      onPiece,
    });
    const constrained = applyAliceResponseConstraints(prepared.instructions, result.content);
    if (prepared.buffered && onChunk) onChunk(constrained);
    return {
      content: constrained,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.promptTokens + result.completionTokens,
      },
      durationMs: result.durationMs,
      truncated: result.truncated,
    };
  }

  async dispose(): Promise<void> {
    this._status = { state: 'idle' };
    // Frees the model's memory while another backend is in use; the next
    // init loads it again from the file.
    await tauriInvoke('local_ai_engine_unload').catch(() => {});
  }
}
