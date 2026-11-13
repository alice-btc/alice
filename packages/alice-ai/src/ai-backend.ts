export type { Message } from './llm';
import type { AssuranceLevel } from './venice-attestation-chain.ts';
import type { SupportedLanguage } from './language-policy';
import type { PartKind, PartMessage } from './message-parts';

export type AIBackendType = 'local' | 'cloud' | 'custom';

export type AIBackendStatus =
  | { state: 'idle' }
  | { state: 'loading'; progress?: number }
  | { state: 'ready' }
  | { state: 'error'; message: string };

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type AIResponse = {
  content: string;
  usage?: TokenUsage;
  durationMs?: number;
  // True when the provider stopped on max_tokens rather than the model ending
  // its own answer, so the UI can say the reply is incomplete.
  truncated?: boolean;
  /**
   * Technical attestation result for Private Cloud. `attested-unpinned` is not
   * permission to advertise full E2EE verification.
   */
  privacyAssurance?: AssuranceLevel;
  /** Numeric-only runtime diagnostics. Never contains prompts or response text. */
  backendTimings?: Record<string, number>;
};

// Per-message options. Backends that do not support an option ignore it.
export type SendMessageOptions = {
  responseLanguage?: SupportedLanguage;
  strictLanguageRetry?: boolean;
  temperatureOverride?: number;
  /**
   * Upper bound on the preset temperature, ignored when an override is set.
   * On-device and custom backends honour it; Private Cloud keeps its preset.
   */
  temperatureCap?: number;
  /** Internal invariant for a corrective attempt; never serialized as a provider option. */
  requiredAnswerRepairContext?: string;
  requestId?: string;
};

/** The sampling temperature a backend sends for these options. */
export function effectiveTemperature(presetTemperature: number, options?: SendMessageOptions): number {
  if (options?.temperatureOverride !== undefined) return options.temperatureOverride;
  return options?.temperatureCap === undefined ? presetTemperature : Math.min(presetTemperature, options.temperatureCap);
}

export interface AIBackend {
  readonly type: AIBackendType;
  /**
   * The part kinds this backend can actually turn into something a model reads.
   * Undefined means the historical baseline: text only. A backend flattens any
   * accepted part to text via `normalizeMessages` before calling its model, so
   * the UI can tell the user up front what will really be understood rather than
   * letting an unread attachment look processed.
   */
  readonly acceptedParts?: readonly PartKind[];
  init(): Promise<void>;
  status(): AIBackendStatus;
  /**
   * Content may be a bare string (every existing caller, unchanged) or a list of
   * typed parts. Accepting parts here is additive: a string flows through exactly
   * as before.
   */
  sendMessage(
    messages: PartMessage[],
    onChunk?: (chunk: string) => void,
    options?: SendMessageOptions,
  ): Promise<AIResponse>;
  dispose(): Promise<void>;
}
