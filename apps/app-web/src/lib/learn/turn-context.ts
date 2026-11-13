import {
  LEARN_COURSES,
  LEARN_TUTORIALS,
} from '@alice-wallet/alice-content/src/generated/planb-learn-catalog';
import { registerLearnContextProvider, type LearnTurnContext } from '@alice-wallet/alice-ai';
import { currentLocale } from '../../i18n/translate.ts';
import { definitionExcerpt, matchDictionaryTerm } from './dictionary';
import { dictionaryAttribution, dictionaryLanguage, fetchDefinition, fetchDictionaryIndex, prefetchDictionaryIndex } from './dictionary-packs';
import { fetchCoursePack, fetchTutorialPack } from './packs';
import { defaultLearnLanguage, isWhitelistedLang, loadLearnLanguage } from './language';
import { firstRelevantLearnContext, rankLearnCandidates, type LearnCandidate } from './learn-candidates';
import { excerptOf, pickChapter, relevantExcerpt } from './turn-context-score';
import { mergeLearnContexts, PLANB_ATTRIBUTION } from './learn-sources';
import { conceptAffinity, describeLearnResource, learnIntent, type LearnConceptEdge } from './concept-map';

type MappedLearnContext = LearnTurnContext & { conceptEdges: LearnConceptEdge[] };


// Feeds the chat turn with the text of the course a question points at (see
// packages/alice-ai/src/learn-context.ts for the contract). Retrieval ranks
// several catalog candidates with explicit concept/purpose edges, separately
// from the UI suggestion budget, then checks the actual pack excerpts. Local languages
// (en/fr embedded, downloaded ones cached) answer instantly; anything slower
// than the bridge's timeout simply ships no excerpt.

function learnLanguage(): string {
  return loadLearnLanguage()
    ?? defaultLearnLanguage(typeof navigator === 'undefined' ? undefined : navigator.language);
}

async function courseContext(query: string, options?: { targetLanguage?: 'fr' | 'en' }): Promise<MappedLearnContext | null> {
  // Reading preferences choose the reader UI, not the language of a chat
  // excerpt. The resolved conversation language takes precedence here.
  const lang = options?.targetLanguage ?? learnLanguage();
  const candidates = rankLearnCandidates(query, [lang, 'fr', 'en'], LEARN_COURSES, LEARN_TUTORIALS);
  return firstRelevantLearnContext(candidates, (candidate, signal) => candidateContext(query, lang, candidate, signal));
}

async function candidateContext(query: string, lang: string, suggestion: LearnCandidate, signal: AbortSignal): Promise<MappedLearnContext | null> {
  if (suggestion.kind === 'tutorial' && suggestion.category && suggestion.slug) {
    const tutorial = LEARN_TUTORIALS.find(t => t.slug === suggestion.slug && t.category === suggestion.category);
    const packLang = tutorial?.languages.includes(lang) ? lang : 'en';
    if (!isWhitelistedLang(packLang)) return null;
    const pack = await fetchTutorialPack(packLang, suggestion.category, suggestion.slug, signal);
    const excerpt = relevantExcerpt(query, pack.name, pack.markdown);
    if (!excerpt) return null;
    const label = `${pack.name} (Plan ₿ Academy tutorial)`;
    return {
      label,
      excerpt,
      conceptEdges: describeLearnResource(suggestion.code, suggestion.relation, { title: pack.name, excerpt }),
      sources: [{ kind: 'tutorial', label: pack.name, path: `/learn/?tutorial=${suggestion.category}/${suggestion.slug}`, attribution: PLANB_ATTRIBUTION }],
    };
  }

  const course = LEARN_COURSES.find(c => c.code === suggestion.code);
  const packLang = course?.languages.includes(lang) ? lang : 'en';
  if (!isWhitelistedLang(packLang)) return null;
  const pack = await fetchCoursePack(packLang, suggestion.code, signal);
  const chapter = pickChapter(query, pack);
  if (!chapter) return null;
  const code = suggestion.code;
  return {
    label: `${pack.name} · ${chapter.title} (Plan ₿ Academy)`,
    excerpt: excerptOf(chapter.markdown),
    conceptEdges: describeLearnResource(code, suggestion.relation, { title: chapter.title, excerpt: excerptOf(chapter.markdown) }),
    sources: [{
      kind: 'course',
      label: `${code.toUpperCase()} · ${chapter.title}`,
      path: chapter.chapterId ? `/learn/?course=${code}&chapter=${chapter.chapterId}` : `/learn/?course=${code}`,
      attribution: PLANB_ATTRIBUTION,
    }],
  };
}

// The Dictionnaire de Bitcoin answers the "what is X" half of a question: when
// the question names a dictionary term as whole words, its definition shares
// the context budget with a course. Definitions remain first for definition
// requests; other mapped intents can prioritize the matching course purpose.
// The pack follows the answer's language, else the app language:
// the English translation for English, the French original otherwise. The
// English index keeps each French title, so a French term in an English
// question still finds its entry. The label, shown to the model and under the
// answer, says where the text comes from and when it is a translation.
async function dictionaryContext(query: string, options?: { targetLanguage?: 'fr' | 'en' }): Promise<MappedLearnContext | null> {
  // The dictionary cache is shared with the reader. Bound this caller's wait
  // without aborting or evicting a fetch another reader may still need. The
  // combined provider must finish before its outer 1.5s bridge timeout, even
  // when a dictionary request stalls while a course is already available.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      readDictionaryContext(query, options),
      new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), 1_200); }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

async function readDictionaryContext(query: string, options?: { targetLanguage?: 'fr' | 'en' }): Promise<MappedLearnContext | null> {
  try {
    const lang = dictionaryLanguage(options?.targetLanguage ?? currentLocale());
    const index = await fetchDictionaryIndex(lang);
    const match = matchDictionaryTerm(index.entries, query, lang);
    if (!match) return null;
    const definition = await fetchDefinition(match.entry.slug, lang);
    if (!definition) return null;
    const excerpt = definitionExcerpt(definition.body);
    if (!excerpt) return null;
    const attribution = dictionaryAttribution(index.source);
    const label = `${index.source.title} · ${definition.title} (${attribution})`;
    return {
      label,
      excerpt,
      conceptEdges: describeLearnResource(`definition/${definition.slug}`, 'defines', { title: definition.title, excerpt }),
      sources: [{
        kind: 'definition',
        label,
        path: `/learn/?definition=${definition.slug}`,
        attribution,
      }],
    };
  } catch {
    return null;
  }
}

async function learnContext(query: string, options?: { targetLanguage?: 'fr' | 'en' }): Promise<LearnTurnContext | null> {
  const [definition, course] = await Promise.all([
    dictionaryContext(query, options),
    courseContext(query, options).catch(() => null),
  ]);
  // Prefer the purpose requested by the user when both sources have direct
  // concept evidence. Unknown subjects keep the established definition-first
  // order, and both sources retain their authorship and Learn links.
  if (course && definition && learnIntent(query) !== 'defines' && conceptAffinity(query, course.conceptEdges).score > conceptAffinity(query, definition.conceptEdges).score) {
    return mergeLearnContexts(course, definition);
  }
  return mergeLearnContexts(definition, course);
}

/** Wire the provider once, from the app shell. */
export function registerLearnTurnContext(): void {
  registerLearnContextProvider(learnContext);
  prefetchDictionaryIndex();
}
