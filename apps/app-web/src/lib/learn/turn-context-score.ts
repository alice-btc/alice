import type { LearnChapter, LearnCoursePack } from '@alice-wallet/alice-content/src/learn-types';
import { tokens as suggestionTokens, stem } from './suggest.ts';
import { asksToolUsage, conceptsIn, relatedConcepts, withoutToolSetup } from './concept-map.ts';

// Pure half of the Learn turn-context provider (turn-context.ts): mapping a
// question onto the right chapter of a course pack, and trimming that chapter
// to a context-sized excerpt. No fetch, no catalog import, node-testable.

const EXCERPT_CHARS = 1_800;
const NOTICE_CHARS = 1_000;
const OUTLINE_CHARS = 400;
/** A tool's tutorial is a walkthrough: its steps need more room than a course
 *  chapter's opening. The turn's own budget still decides what finally fits,
 *  and keeps a whole prefix (knowledge-context-budget.ts). */
const TOOL_EXCERPT_CHARS = 3_600;
/** Sections that present the tool rather than walk through it. */
const PRESENTATION_HEADING = /^(?:pr[ée]sentation|introduction|overview|about|what is|qu.est.ce|a propos|à propos)\b/i;
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

/** A warning the tutorial opens with ("> ⚠️ …"), apart from the text after it. */
export function leadingNotice(markdown: string): { notice: string; rest: string } {
  const quote = markdown.match(/^\s*((?:>[^\n]*(?:\n|$))+)/);
  if (!quote || !quote[1].includes('⚠')) return { notice: '', rest: markdown };
  const text = quote[1].split('\n').map(line => line.replace(/^>\s?/, '')).join('\n').trim();
  return { notice: wholeSentences(text, NOTICE_CHARS), rest: markdown.slice(quote[0].length) };
}

function wholeSentences(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const head = text.slice(0, limit);
  const end = Math.max(head.lastIndexOf('. '), head.lastIndexOf('.** '), head.lastIndexOf('.\n'));
  return end >= 0 ? head.slice(0, end + 1) : '';
}

// A question says "importer", the heading "Importation": inside a tutorial
// already chosen by its tool's name, a shared 5-letter start is the same word.
function wordFamily(token: string): string {
  return token.length >= 6 ? token.slice(0, 5) : token;
}

function wordFamilies(text: string): Set<string> {
  return new Set(tokens(text).map(wordFamily));
}

/** Images and video embeds carry nothing a model can read. */
function withoutMedia(markdown: string): string {
  return markdown.replace(/^!\[[^\]]*\]\([^)]*\)[ \t]*$/gm, '').replace(/^:::video[^\n]*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

type TutorialSection = { level: 2 | 3; heading: string; parent: string; body: string };

function tutorialSections(markdown: string): { intro: string; sections: TutorialSection[] } {
  const sections: TutorialSection[] = [];
  const intro: string[] = [];
  let parent = '';
  let fenced = false;
  let current: (TutorialSection & { lines: string[] }) | null = null;
  const close = () => { if (current) sections.push({ level: current.level, heading: current.heading, parent: current.parent, body: current.lines.join('\n').trim() }); };
  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    const heading = fenced ? null : line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!heading) { (current ? current.lines : intro).push(line); continue; }
    close();
    const level = heading[1].length as 2 | 3;
    if (level === 2) parent = heading[2];
    current = { level, heading: heading[2], parent: level === 3 ? parent : '', body: '', lines: [] };
  }
  close();
  return { intro: intro.join('\n').trim(), sections };
}

/** Whole paragraphs up to the limit, so the model never reads half a step. */
function wholeParagraphs(text: string, limit: number): string {
  const kept: string[] = [];
  let length = 0;
  for (const paragraph of text.split(/\n{2,}/)) {
    const next = length + paragraph.length + (kept.length ? 2 : 0);
    if (next > limit) break;
    kept.push(paragraph);
    length = next;
  }
  return kept.join('\n\n');
}

/**
 * The section at `start` under its headings, then the sections that follow it
 * under the same `##` heading while they fit: the ways to connect to a node
 * read together, not the first one alone.
 */
function sectionExcerpt(sections: readonly TutorialSection[], start: number, limit: number): string {
  const first = sections[start];
  const group = first.level === 2 ? first.heading : first.parent;
  const parts: string[] = first.level === 3 && first.parent ? [`## ${first.parent}`] : [];
  let length = parts.join('\n\n').length;
  for (let index = start; index < sections.length; index++) {
    const section = sections[index];
    if (index > start && (section.level === 2 || section.parent !== group)) break;
    const heading = `${'#'.repeat(section.level)} ${section.heading}`;
    const room = limit - length - heading.length - (parts.length ? 4 : 2);
    const body = room > 0 ? wholeParagraphs(section.body, room) : '';
    if (!body && section.body) break;
    parts.push(body ? `${heading}\n\n${body}` : heading);
    length = parts.join('\n\n').length;
    if (body.length < section.body.length) break;
  }
  return parts.length > (first.level === 3 && first.parent ? 1 : 0) ? parts.join('\n\n') : '';
}

function outlineOf(sections: readonly TutorialSection[]): string {
  let outline = '';
  for (const section of sections) {
    if (section.level !== 2) continue;
    const next = outline ? `${outline} ; ${section.heading}` : section.heading;
    if (next.length > OUTLINE_CHARS) break;
    outline = next;
  }
  return outline;
}

function tutorialOverview(intro: string, sections: readonly TutorialSection[], limit: number): string {
  const outline = outlineOf(sections);
  const outlineLine = outline ? `Tutorial sections: ${outline}` : '';
  // A tutorial that starts on a heading ("## Introduction") opens there.
  const opening = wholeParagraphs(intro || (sections[0]?.body ?? ''), limit - (outlineLine ? outlineLine.length + 2 : 0));
  return [opening, outlineLine].filter(Boolean).join('\n\n');
}

/**
 * The start of the walkthrough itself, for a question about setting the tool
 * up: the list of sections, then the first sections after the presentation,
 * whole, in the tutorial's order. The model reads real steps instead of a
 * table of contents it would complete from memory. A line says which sections
 * are quoted, so the others are known to exist and not to be read here.
 */
function tutorialWalkthrough(sections: readonly TutorialSection[], limit: number): string {
  const outline = outlineOf(sections);
  const steps = sections.filter(section => section.body && !PRESENTATION_HEADING.test(section.heading.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  if (!outline || steps.length === 0) return '';
  const outlineLine = `Tutorial sections: ${outline}`;
  const quoted: string[] = [];
  const parts: string[] = [];
  let length = outlineLine.length + 120;
  for (const section of steps) {
    const heading = `${'#'.repeat(section.level)} ${section.heading}`;
    const body = wholeParagraphs(section.body, limit - length - heading.length - 4);
    // A section cut short ends the excerpt: the next one would read as its sequel.
    if (!body) break;
    parts.push(`${heading}\n\n${body}`);
    quoted.push(section.heading);
    length += heading.length + body.length + 4;
    if (body.length < section.body.length) break;
  }
  if (parts.length === 0) return '';
  const whole = quoted.length === steps.length && parts.join('').length >= steps.reduce((sum, section) => sum + section.body.length, 0);
  const scope = whole
    ? 'The walkthrough is quoted below in full.'
    : `Quoted below, from the start of the walkthrough: ${quoted.join(' ; ')}. The other sections are not quoted here.`;
  return [outlineLine, scope, ...parts].join('\n\n');
}

/** The opening warning as one paragraph, so the turn's budget keeps or drops
 *  it whole, without the sentence left hanging on a link that is not quoted. */
function noticeParagraph(notice: string): string {
  return notice.replace(/\s*\n+\s*/g, ' ').replace(/\s[^.!?]*:\s*$/, '').trim();
}

/**
 * The excerpt of a tutorial whose tool the question names with a usage word
 * (learn-candidates.ts). The question's subject picks the section that speaks
 * to it; a question about setting the tool up gets the start of the
 * walkthrough, one about the tool itself the opening and the list of
 * sections. An opening warning always comes first, marked for the app. A
 * question with several subject words the tutorial never mentions gets
 * nothing.
 */
export function toolTutorialExcerpt(
  query: string,
  title: string,
  markdown: string,
  /** How the caller frames the opening warning for its reader (the chat turn
   *  marks it so the app can show it itself). */
  frameNotice: (notice: string) => string = notice => notice,
): string | null {
  if (comparisonNeedsBothSides(query)) return null;
  const { notice: warning, rest } = leadingNotice(markdown);
  const paragraph = noticeParagraph(warning);
  const notice = paragraph ? frameNotice(paragraph) : '';
  const limit = TOOL_EXCERPT_CHARS - (notice ? notice.length + 2 : 0);
  const titleTokens = new Set(tokens(title));
  const subject = [...new Set(tokens(withoutToolSetup(query)))].filter(token => !titleTokens.has(token));
  const { intro, sections } = tutorialSections(withoutMedia(rest));
  let body = '';
  if (subject.length) {
    let best = -1;
    let bestScore = 0;
    sections.forEach((section, index) => {
      const own = wordFamilies(section.heading);
      const parent = wordFamilies(section.parent);
      const text = wordFamilies(wholeParagraphs(section.body, limit));
      const score = subject.reduce((sum, token) => {
        const family = wordFamily(token);
        return sum + (own.has(family) ? 2 : 0) + (parent.has(family) ? 1 : 0) + (text.has(family) ? 1 : 0);
      }, 0);
      if (score > bestScore) { best = index; bestScore = score; }
    });
    if (best >= 0) body = sectionExcerpt(sections, best, limit);
    else if (subject.length > 1) return null;
  }
  // The tool as a whole: how to set it up reads the walkthrough from its
  // start, what it is reads the opening.
  if (!body && subject.length === 0 && asksToolUsage(query)) body = tutorialWalkthrough(sections, limit);
  if (!body) body = tutorialOverview(intro, sections, limit);
  if (!body) return null;
  return [notice, body].filter(Boolean).join('\n\n');
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
