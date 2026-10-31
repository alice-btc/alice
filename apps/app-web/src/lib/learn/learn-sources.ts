import type { LearnSource, LearnTurnContext } from '@alice-wallet/alice-ai';

// Pure half of the Learn turn-context provider's composition: how a
// dictionary definition and a course excerpt share one context, and which
// sources ride along. Node-testable.

export const PLANB_ATTRIBUTION = 'Plan ₿ Network, CC BY-SA 4.0';

/**
 * The definition first, the course after it under its own label line, both
 * sources listed in that order. The bridge trims the excerpt at a paragraph
 * boundary, and rag.ts keeps a later source only when its label survived.
 */
export function mergeLearnContexts(definition: LearnTurnContext | null, course: LearnTurnContext | null): LearnTurnContext | null {
  if (definition && course) {
    const sources: LearnSource[] = [...(definition.sources ?? []), ...(course.sources ?? [])];
    return {
      label: definition.label,
      excerpt: `${definition.excerpt}\n\n${course.label}\n${course.excerpt}`,
      ...(sources.length > 0 ? { sources } : {}),
    };
  }
  return definition ?? course;
}
