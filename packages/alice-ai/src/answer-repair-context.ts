import type { Message } from './llm';

/** A repair is only meaningful if its complete reference context survives
 * backend adaptation and context fitting. This value is never sent as an API
 * option: it checks the messages immediately before model execution. */
export function assertAnswerRepairContext(messages: readonly Message[], required?: string): void {
  if (required === undefined) return;
  if (!required || !messages.some(message => message.content.includes(required))) {
    throw new Error('The corrective answer cannot be generated without its source context.');
  }
}
