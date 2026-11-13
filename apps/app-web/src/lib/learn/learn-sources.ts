import type { LearnSource, LearnTurnContext } from '@alice-wallet/alice-ai';

// Pure half of the Learn turn-context provider's composition: how two
// excerpts share the context budget without losing their source provenance.

export const PLANB_ATTRIBUTION = 'Plan ₿ Network, CC BY-SA 4.0';

/**
 * The caller selects the order. The second source's exact citation label is
 * on its own line, joined to its first nonempty paragraph. A paragraph budget
 * can therefore keep both that evidence and its citation, or discard both;
 * it cannot keep an orphan heading and cite a source whose text was cut.
 */
export function mergeLearnContexts(first: LearnTurnContext | null, second: LearnTurnContext | null): LearnTurnContext | null {
  if (!first?.excerpt.trim()) return second?.excerpt.trim() ? second : null;
  if (!second?.excerpt.trim()) return first;
  const sources: LearnSource[] = [...(first.sources ?? []), ...(second.sources ?? [])];
  const citationLabel = second.sources?.[0]?.label ?? second.label;
  const heading = citationLabel === second.label ? second.label : `${second.label}\n${citationLabel}`;
  return {
    label: first.label,
    excerpt: `${first.excerpt.trimEnd()}\n\n${heading}\n${second.excerpt.trim()}`,
    ...(sources.length > 0 ? { sources } : {}),
  };
}
