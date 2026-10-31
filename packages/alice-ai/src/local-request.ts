// What a local model is asked, whichever engine answers: llama-server over
// HTTP on the desktop (ai-backend-local-desktop.ts) or llama.cpp inside the
// Android and iOS apps (ai-backend-local-mobile.ts). The persona prompt, the
// instruction reminder, the context budget and the thinking switch are
// decided here once. A phone gets the condensed persona: it reads the prompt
// on its CPU before the first word, where the desktop has a GPU.

import type { SendMessageOptions } from './ai-backend';
import type { Message } from './llm';
import { getActiveModelId, getAliceInstructions, getPreset, PRESETS } from './ai-preferences';
import { buildAliceLocalSystemPrompt, buildAliceSystemPrompt, requiresBufferedAliceResponse, withAliceInstructionReminder } from './ai-system-prompt';
import { fitMessagesToEstimatedLocalContext } from './local-context-budget';
import { fitLocalModelRoles, usesAnswerOnlyLocalMode, withLocalAnswerLanguageLine } from './local-model-message-policy';

export type PreparedLocalRequest = {
  messages: Message[];
  temperature: number;
  maxTokens: number;
  /**
   * Qwen3 and SmolLM3 models reason by default and the <think> block eats the
   * whole token budget, truncating the visible answer mid-sentence. The
   * prompt already carries the /no_think soft switch; the engine adds its own
   * channel (the chat-template kwarg on llama-server, an empty think block
   * in the app engine).
   */
  disableThinking: boolean;
  /** Alice's custom instructions, applied to the finished answer. */
  instructions: string;
  /** The answer is shown only once complete, for instructions that need the whole text. */
  buffered: boolean;
};

export async function prepareLocalRequest(
  messages: Message[],
  options: SendMessageOptions | undefined,
  contextTokens: number,
  persona: 'full' | 'condensed' = 'full',
): Promise<PreparedLocalRequest> {
  const [preset, instructions, activeModelId] = await Promise.all([
    getPreset('local'),
    getAliceInstructions(),
    getActiveModelId(),
  ]);
  const params = PRESETS[preset];
  const disableThinking = usesAnswerOnlyLocalMode(activeModelId);
  const language = options?.responseLanguage ?? 'en';
  const buildPersona = persona === 'condensed' ? buildAliceLocalSystemPrompt : buildAliceSystemPrompt;
  const systemPrompt = buildPersona(instructions, language) + (disableThinking ? ' /no_think' : '');
  const fullMessages = withLocalAnswerLanguageLine([
    { role: 'system' as const, content: systemPrompt },
    ...withAliceInstructionReminder(messages, instructions, language, options?.strictLanguageRetry),
  ], language);
  const fitted = fitMessagesToEstimatedLocalContext(
    fullMessages,
    params.maxTokens,
    contextTokens,
    candidate => fitLocalModelRoles(candidate, activeModelId),
  );
  return {
    messages: fitted.messages,
    temperature: options?.temperatureOverride ?? params.temperature,
    maxTokens: fitted.responseTokens,
    disableThinking,
    instructions,
    buffered: requiresBufferedAliceResponse(instructions),
  };
}
