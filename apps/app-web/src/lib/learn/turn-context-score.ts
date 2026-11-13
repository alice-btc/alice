import type { LearnChapter, LearnCoursePack } from '@alice-wallet/alice-content/src/learn-types';
import { tokens as suggestionTokens, stem } from './suggest.ts';
import { conceptsIn, relatedConcepts } from './concept-map.ts';

// Pure half of the Learn turn-context provider (turn-context.ts): mapping a
// question onto the right chapter of a course pack, and trimming that chapter
// to a context-sized excerpt. No fetch, no catalog import, node-testable.

const EXCERPT_CHARS = 1_800;
const MIN_CONTEXT_QUERY_COVERAGE = 0.5;
// Context evidence needs subject words, not question scaffolding or the
// ubiquitous domain name. UI suggestions retain their separate policy.
const CONTEXT_STOPWORDS = new Set([
  'bitcoin', 'btc', 'explain', 'explique', 'about', 'actually', 'really',
  'could', 'would', 'should', 'have', 'has', 'had', 'been', 'being', 'when',
  'where', 'which', 'whose', 'there', 'their', 'them', 'these', 'those',
  'than', 'then', 'also', 'into', 'from', 'some', 'many', 'much', 'more',
  'less', 'other', 'else', 'thing', 'something', 'someone', 'everyone',
  'instead', 'between', 'different', 'difference', 'what', 'own', 'itself',
  'vraiment', 'aussi', 'entre', 'autre', 'autres', 'chose', 'choses',
  'moins', 'meme', 'peu', 'tres', 'tout', 'tous', 'toutes', 'quelqu',
  'quand', 'depuis', 'avant', 'apres', 'cela', 'celui', 'celles', 'ceux',
  'alors', 'leurs', 'leur', 'etre', 'avoir', 'fait', 'faut', 'peuvent',
  'completement', 'semble', 'seem', 'seems', 'today', 'tonight', 'soir',
  'expliquez', 'fonctionne', 'fonctionnent', 'follow', 'topic',
  'work', 'works', 'level', 'niveau', 'fonctionnement',
].flatMap(token => [token, stem(token)]));

function tokens(text: string): string[] {
  return suggestionTokens(text.replace(/œ/gi, 'oe')).map(stem)
    .filter(token => !CONTEXT_STOPWORDS.has(token));
}

/** Score the exact emitted prefix, not terms that occur after its cutoff. */
export function scoreChapter(queryTokens: readonly string[], chapter: LearnChapter, requireAllTerms = false): number {
  const parsed = new Set(queryTokens);
  if (parsed.size === 0) return 0;
  const excerpt = excerptOf(chapter.markdown);
  if (!excerpt) return 0;
  const title = new Set(tokens(chapter.title));
  // URLs, media IDs and image descriptions are not explanatory evidence.
  const prose = excerpt.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/:::video[^\n]*/g, ' ');
  const body = new Set(tokens(prose));
  const matched = [...parsed].filter(token => title.has(token) || body.has(token));
  // A repeated title word alone is not evidence. A one-term technical query
  // may match one term, but richer questions need two distinct subject terms.
  if (matched.length < Math.min(2, parsed.size) || !matched.some(token => body.has(token))) return 0;
  // An adjacent specialist chapter can mention the subject incidentally.
  // Require title corroboration and coverage of the question's focus, too.
  // Comparisons must not silently lose one named side. This deliberately
  // prefers no optional excerpt over incomplete comparison evidence.
  if (requireAllTerms && matched.length < parsed.size) return 0;
  const titleMatches = [...parsed].filter(token => title.has(token)).length;
  if (titleMatches < Math.min(2, Math.max(1, title.size), parsed.size)
    || matched.length / parsed.size < MIN_CONTEXT_QUERY_COVERAGE) return 0;
  return matched.reduce((score, token) => score + (title.has(token) ? 2 : 0) + (body.has(token) ? 1 : 0), 0);
}

function comparisonNeedsBothSides(query: string): boolean {
  return /\b(?:between|versus|vs|difference|different|entre|compare|comparaison)\b/.test(
    query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
  );
}

export function relevantExcerpt(query: string, title: string, markdown: string): string | null {
  const chapter: LearnChapter = { chapterId: null, title, markdown, videoIds: [] };
  return scoreChapter(tokens(query), chapter, comparisonNeedsBothSides(query)) > 0 ? excerptOf(markdown) : null;
}

export function queryTokens(query: string): string[] {
  return tokens(query);
}

/**
 * A course chapter may teach a requested concept through a named neighbour
 * (e.g. payment channels inside Lightning). Keep the original body coverage
 * gates: graph proximity alone is never evidence, nor is it enough to answer
 * a comparison. Tutorials retain the stricter title+body matcher above.
 */
function conceptChapterScore(query: string, chapter: LearnChapter): number {
  if (comparisonNeedsBothSides(query)) return 0;
  const requested = conceptsIn(query);
  if (!requested.length) return 0;
  const excerpt = excerptOf(chapter.markdown);
  if (!excerpt) return 0;
  const prose = excerpt.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ').replace(/:::video[^\n]*/g, ' ');
  const bodyConcepts = conceptsIn(prose);
  if (!requested.every(id => bodyConcepts.includes(id))) return 0;
  const titleConcepts = conceptsIn(chapter.title);
  const nearby = relatedConcepts(requested);
  if (!titleConcepts.some(id => requested.includes(id) || nearby.includes(id))) return 0;
  const focus = [...new Set(tokens(query))];
  const body = new Set(tokens(prose));
  const title = new Set(tokens(chapter.title));
  const matched = focus.filter(token => body.has(token) || title.has(token));
  if (matched.length < Math.min(2, focus.length) || matched.length / focus.length < MIN_CONTEXT_QUERY_COVERAGE) return 0;
  if (!matched.some(token => body.has(token))) return 0;
  return matched.reduce((score, token) => score + (title.has(token) ? 2 : 0) + (body.has(token) ? 1 : 0), 0);
}

export function pickChapter(query: string, pack: LearnCoursePack): LearnChapter | null {
  const parsed = tokens(query);
  let best: LearnChapter | null = null;
  let bestScore = 0;
  for (const part of pack.parts) {
    for (const chapter of part.chapters) {
      if (!chapter.markdown.trim()) continue;
      const score = scoreChapter(parsed, chapter, comparisonNeedsBothSides(query)) || conceptChapterScore(query, chapter);
      if (score > bestScore) {
        best = chapter;
        bestScore = score;
      }
    }
  }
  return best;
}

/** Cuts at a paragraph boundary, so the model never reads half a sentence. */
export function excerptOf(markdown: string, limit = EXCERPT_CHARS): string {
  if (!Number.isFinite(limit) || limit <= 0) return '';
  const boundedLimit = Math.min(EXCERPT_CHARS, Math.floor(limit));
  if (markdown.length <= boundedLimit) return markdown.trim();
  const head = markdown.slice(0, boundedLimit + 2);
  const paragraph = head.lastIndexOf('\n\n');
  return paragraph >= 0 ? head.slice(0, paragraph).trim() : '';
}
