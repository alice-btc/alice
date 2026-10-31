import {
  LEARN_COURSES,
  LEARN_TUTORIALS,
} from '@alice-wallet/alice-content/src/generated/planb-learn-catalog';
import { registerLearnContextProvider, type LearnTurnContext } from '@alice-wallet/alice-ai';
import { definitionExcerpt, matchDictionaryTerm } from './dictionary';
import { fetchDefinition, fetchDictionaryIndex, prefetchDictionaryIndex } from './dictionary-packs';
import { fetchCoursePack, fetchTutorialPack } from './packs';
import { defaultLearnLanguage, isWhitelistedLang, loadLearnLanguage } from './language';
import { takeSuggestion } from './suggest';
import { excerptOf, pickChapter, relevantExcerpt } from './turn-context-score';
import { mergeLearnContexts, PLANB_ATTRIBUTION } from './learn-sources';


// Feeds the chat turn with the text of the course a question points at (see
// packages/alice-ai/src/learn-context.ts for the contract). The suggestion
// scorer already knows how to map a question onto the catalog, the same
// engine that fills the "To go further" block; here its match is followed one
// step further, into the pack itself, chapter by chapter. Local languages
// (en/fr embedded, downloaded ones cached) answer instantly; anything slower
// than the bridge's timeout simply ships no excerpt.

function learnLanguage(): string {
  return loadLearnLanguage()
    ?? defaultLearnLanguage(typeof navigator === 'undefined' ? undefined : navigator.language);
}

async function courseContext(query: string, options?: { targetLanguage?: 'fr' | 'en' }): Promise<LearnTurnContext | null> {
  // Reading preferences choose the reader UI, not the language of a chat
  // excerpt. The resolved conversation language takes precedence here.
  const lang = options?.targetLanguage ?? learnLanguage();
  // A throwaway Set: the context lookup must never consume the "suggest each
  // content once per session" budget owned by the visible block.
  const suggestion = takeSuggestion(query, [lang, 'fr', 'en'], LEARN_COURSES, LEARN_TUTORIALS, new Set());
  if (!suggestion) return null;

  if (suggestion.kind === 'tutorial' && suggestion.category && suggestion.slug) {
    const tutorial = LEARN_TUTORIALS.find(t => t.slug === suggestion.slug && t.category === suggestion.category);
    const packLang = tutorial?.languages.includes(lang) ? lang : 'en';
    if (!isWhitelistedLang(packLang)) return null;
    const pack = await fetchTutorialPack(packLang, suggestion.category, suggestion.slug);
    const excerpt = relevantExcerpt(query, pack.name, pack.markdown);
    if (!excerpt) return null;
    const label = `${pack.name} (Plan ₿ Academy tutorial)`;
    return {
      label,
      excerpt,
      sources: [{ kind: 'tutorial', label: pack.name, path: `/learn/?tutorial=${suggestion.category}/${suggestion.slug}`, attribution: PLANB_ATTRIBUTION }],
    };
  }

  const course = LEARN_COURSES.find(c => c.code === suggestion.code);
  const packLang = course?.languages.includes(lang) ? lang : 'en';
  if (!isWhitelistedLang(packLang)) return null;
  const pack = await fetchCoursePack(packLang, suggestion.code);
  const chapter = pickChapter(query, pack);
  if (!chapter) return null;
  const code = suggestion.code;
  return {
    label: `${pack.name} · ${chapter.title} (Plan ₿ Academy)`,
    excerpt: excerptOf(chapter.markdown),
    sources: [{
      kind: 'course',
      label: `${code.toUpperCase()} · ${chapter.title}`,
      path: chapter.chapterId ? `/learn/?course=${code}&chapter=${chapter.chapterId}` : `/learn/?course=${code}`,
      attribution: PLANB_ATTRIBUTION,
    }],
  };
}

// The Dictionnaire de Bitcoin answers the "what is X" half of a question: when
// the question names a dictionary term as whole words, its definition goes
// first, the course excerpt after it, under the same context budget (the
// bridge cuts at a paragraph boundary, so a long definition simply leaves the
// course out). The dictionary is French; the model reads both languages, and
// the label says where the text comes from.
async function dictionaryContext(query: string): Promise<LearnTurnContext | null> {
  try {
    const index = await fetchDictionaryIndex();
    const match = matchDictionaryTerm(index.entries, query);
    if (!match) return null;
    const definition = await fetchDefinition(match.entry.slug);
    if (!definition) return null;
    const excerpt = definitionExcerpt(definition.body);
    if (!excerpt) return null;
    return {
      label: `${index.source.title} · ${definition.title} (${index.source.author}, ${index.source.license})`,
      excerpt,
      sources: [{
        kind: 'definition',
        label: definition.title,
        path: `/learn/?definition=${definition.slug}`,
        attribution: `${index.source.author}, ${index.source.license}`,
      }],
    };
  } catch {
    return null;
  }
}

async function learnContext(query: string, options?: { targetLanguage?: 'fr' | 'en' }): Promise<LearnTurnContext | null> {
  const [definition, course] = await Promise.all([
    dictionaryContext(query),
    courseContext(query, options).catch(() => null),
  ]);
  return mergeLearnContexts(definition, course);
}

/** Wire the provider once, from the app shell. */
export function registerLearnTurnContext(): void {
  registerLearnContextProvider(learnContext);
  prefetchDictionaryIndex();
}
