import type { LearnCatalogCourse, LearnCatalogTutorial } from '@alice-wallet/alice-content/src/learn-types';
import { stem, tokens, type LearnSuggestion } from './suggest.ts';
import { conceptAffinity, describeLearnResource, type LearnConceptEdge, type LearnRelation } from './concept-map.ts';

export type LearnCandidate = LearnSuggestion & { relation: LearnRelation; concepts: LearnConceptEdge[] };
export const MAX_LEARN_CANDIDATES = 3;

/** Retrieval ranking is separate from the UI's once-per-chat suggestions. */
export function rankLearnCandidates(
  query: string,
  languages: readonly string[],
  courses: readonly LearnCatalogCourse[],
  tutorials: readonly LearnCatalogTutorial[],
): LearnCandidate[] {
  const queryTokens = new Set(tokens(query).map(stem));
  if (!queryTokens.size) return [];
  const candidates = new Map<string, LearnCandidate>();
  const consider = (candidate: Omit<LearnCandidate, 'score' | 'concepts'>, fields: Record<string, string>, weights: Record<string, number>) => {
    const concepts = describeLearnResource(candidate.code, candidate.relation, fields);
    const affinity = conceptAffinity(query, concepts);
    const matched = new Set<string>();
    let lexical = 0;
    for (const [field, text] of Object.entries(fields)) {
      const haystack = new Set(tokens(text).map(stem));
      for (const token of queryTokens) if (haystack.has(token)) { lexical += weights[field] ?? 1; matched.add(token); }
    }
    // Direct concept metadata can recover synonyms or short technical queries.
    // Nearby concepts alone never turn generic word overlap into evidence.
    if (!affinity.direct && (matched.size < 2 || lexical < 4.5)) return;
    const score = lexical + affinity.score;
    if (score <= 0) return;
    const previous = candidates.get(candidate.code);
    if (!previous || score > previous.score) candidates.set(candidate.code, { ...candidate, score, concepts });
  };
  for (const lang of new Set(languages)) {
    for (const course of courses) {
      const meta = course.i18n[lang] ?? course.i18n.en;
      if (!meta) continue;
      consider({ kind: 'course', code: course.code, title: meta.name, relation: course.type === 'practice' ? 'applies' : 'explains' },
        { title: meta.name, goal: meta.goal, objectives: meta.objectives.join(' ') }, { title: 3, goal: 1.5, objectives: 1 });
    }
    for (const tutorial of tutorials) {
      const meta = tutorial.i18n[lang] ?? tutorial.i18n.en;
      if (!meta) continue;
      consider({ kind: 'tutorial', code: `${tutorial.category}/${tutorial.slug}`, category: tutorial.category, slug: tutorial.slug, title: meta.name, relation: 'applies' },
        { title: meta.name, description: meta.description, category: `${tutorial.category} ${tutorial.subcategory ?? ''}` }, { title: 3, description: 1.5, category: 1 });
    }
  }
  return [...candidates.values()].sort((a, b) => b.score - a.score || a.code.localeCompare(b.code)).slice(0, MAX_LEARN_CANDIDATES);
}

/**
 * A fixed three-request ceiling, bounded by the existing 1.5s Learn bridge.
 * Start together so a failed/slow first candidate cannot consume every slot;
 * consume in relevance order, and abort unused reads as soon as one is valid.
 */
export async function firstRelevantLearnContext<T>(
  candidates: readonly LearnCandidate[],
  load: (candidate: LearnCandidate, signal: AbortSignal) => Promise<T | null>,
  timeoutMs = 1_200,
): Promise<T | null> {
  const controllers: AbortController[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  const bound = Math.max(1, Math.min(1_200, timeoutMs));
  const pending = candidates.slice(0, MAX_LEARN_CANDIDATES).map(candidate => {
    const controller = new AbortController();
    controllers.push(controller);
    return new Promise<T | null>(resolve => {
      const timer = setTimeout(() => { controller.abort(); resolve(null); }, bound);
      timers.push(timer);
      Promise.resolve().then(() => load(candidate, controller.signal))
        .then(value => { clearTimeout(timer); resolve(value); }, () => { clearTimeout(timer); resolve(null); });
    });
  });
  try {
    for (const result of pending) {
      const value = await result;
      if (value) return value;
    }
    return null;
  } finally {
    for (const timer of timers) clearTimeout(timer);
    for (const controller of controllers) controller.abort();
  }
}
