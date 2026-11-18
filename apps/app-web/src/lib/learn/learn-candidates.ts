import type { LearnCatalogCourse, LearnCatalogTutorial } from '@alice-wallet/alice-content/src/learn-types';
import { stem, tokens, type LearnSuggestion } from './suggest.ts';
import { asksToolUsage, conceptAffinity, describeLearnResource, type LearnConceptEdge, type LearnRelation } from './concept-map.ts';

export type LearnCandidate = LearnSuggestion & {
  relation: LearnRelation;
  concepts: LearnConceptEdge[];
  /** Names of the tutorial's tool found in the question (see toolNames). */
  toolNames?: string[];
};
export const MAX_LEARN_CANDIDATES = 3;

// A tutorial about a tool carries the tool's name in its title, and the name
// is the one title word left untranslated: "COLDCARD Mk4" and "Sparrow
// Wallet" read the same in English and French, "password manager" does not.
// A word shared by many titles ("wallet", "bitcoin") names a kind of tool, not
// one tool.
const MAX_TITLES_PER_TOOL_NAME = 8;
const MIN_TOOL_NAME_LENGTH = 4;
const GENERIC_TITLE_WORDS = new Set([
  'wallet', 'bitcoin', 'lightning', 'server', 'node', 'network', 'desktop', 'mobile',
  'academy', 'tutorial', 'simple', 'model', 'open', 'safe', 'mini', 'nano', 'core', 'test', 'self',
  // Bitcoin and computing vocabulary French titles keep in English.
  'airgap', 'auth', 'authenticator', 'backup', 'browser', 'business', 'chat', 'coin', 'coinjoin',
  'company', 'conference', 'contribution', 'control', 'crypto', 'custody', 'daemon', 'drive', 'easy',
  'embedded', 'expert', 'explorer', 'guide', 'hodl', 'hole', 'labelling', 'login', 'machine', 'mail',
  'market', 'mempool', 'miner', 'mining', 'multisig', 'noise', 'onchain', 'only', 'passphrase',
  'payjoin', 'phrase', 'podcast', 'pool', 'public', 'recover', 'replay', 'return', 'scanner', 'seed',
  'sign', 'smoke', 'speed', 'store', 'swap', 'terminal', 'updating', 'usdt', 'utxo', 'vault',
  'vulnerability', 'watch', 'watchtower', 'white', 'zero',
].map(stem));
const TOOL_NAME_SCORE = 6;
const TOOL_NAME_COVERAGE_SCORE = 6;
const toolNamesByCatalog = new WeakMap<readonly LearnCatalogTutorial[], Map<string, Set<string>>>();

/** Tool names per tutorial code, e.g. "wallet/sparrow" → {"sparrow"}. */
export function toolNames(tutorials: readonly LearnCatalogTutorial[]): Map<string, Set<string>> {
  const cached = toolNamesByCatalog.get(tutorials);
  if (cached) return cached;
  const untranslated = new Map<string, string[]>();
  const titles = new Map<string, number>();
  for (const tutorial of tutorials) {
    const english = tutorial.i18n.en?.name;
    const french = tutorial.i18n.fr?.name;
    if (!english || !french) continue;
    const frenchTokens = new Set(tokens(french).map(stem));
    const shared = [...new Set(tokens(english).map(stem))].filter(token => frenchTokens.has(token));
    untranslated.set(`${tutorial.category}/${tutorial.slug}`, shared);
    for (const token of shared) titles.set(token, (titles.get(token) ?? 0) + 1);
  }
  const names = new Map<string, Set<string>>();
  for (const [code, shared] of untranslated) {
    names.set(code, new Set(shared.filter(token => token.length >= MIN_TOOL_NAME_LENGTH
      && !GENERIC_TITLE_WORDS.has(token)
      && (titles.get(token) ?? 0) <= MAX_TITLES_PER_TOOL_NAME)));
  }
  toolNamesByCatalog.set(tutorials, names);
  return names;
}

// Words that ask about a subject without being part of it.
const ASKING_WORDS = new Set([
  'explique', 'expliquer', 'explain', 'parle', 'tell', 'about', 'presente', 'present', 'definition', 'define', 'definis',
].map(stem));

/**
 * The question is the tool's name and nothing else: "Ledger", "C'est quoi
 * Sparrow Wallet ?". It names every tool of the tutorial, so "Mint" alone is
 * not "Linux Mint", and adds no word from outside its title.
 */
export function namesWholeTool(queryTokens: ReadonlySet<string>, ownNames: readonly string[], title: string): boolean {
  if (!ownNames.length || !ownNames.every(name => queryTokens.has(name))) return false;
  const titleTokens = new Set(tokens(title).map(stem));
  return [...queryTokens].every(token => titleTokens.has(token) || ASKING_WORDS.has(token));
}

/**
 * A name typed on its own may be one of the tool's names only: "Mint" for
 * "Linux Mint", "Shamir" for "Trezor Shamir Backup". Not inside a question
 * ("What is a mint?" asks for the term), where the whole name is expected.
 */
function isBareName(message: string): boolean {
  return !message.includes('?') && message.trim().split(/\s+/).length <= 3;
}

function namesPartOfTool(queryTokens: ReadonlySet<string>, ownNames: readonly string[], title: string): boolean {
  if (!ownNames.some(name => queryTokens.has(name))) return false;
  const titleTokens = new Set(tokens(title).map(stem));
  return [...queryTokens].every(token => titleTokens.has(token));
}

/**
 * The tutorials a name typed on its own may mean: `whole` names every tool of
 * the tutorial, `part` one of them. "Sparrow" is the whole of "Sparrow Wallet"
 * and a part of "Jade Plus - Sparrow"; "Trezor" is the whole of 4 tutorials.
 */
export function tutorialsNamedBy(message: string, tutorials: readonly LearnCatalogTutorial[]): { whole: LearnCatalogTutorial[]; part: LearnCatalogTutorial[] } {
  const queryTokens = new Set(tokens(message).map(stem));
  const whole: LearnCatalogTutorial[] = [];
  const part: LearnCatalogTutorial[] = [];
  if (!queryTokens.size) return { whole, part };
  const names = toolNames(tutorials);
  const bare = isBareName(message);
  for (const tutorial of tutorials) {
    const ownNames = [...(names.get(`${tutorial.category}/${tutorial.slug}`) ?? [])];
    const titles = Object.values(tutorial.i18n).flatMap(meta => (meta ? [meta.name] : []));
    if (titles.some(title => namesWholeTool(queryTokens, ownNames, title))) whole.push(tutorial);
    else if (bare && titles.some(title => namesPartOfTool(queryTokens, ownNames, title))) part.push(tutorial);
  }
  return { whole, part };
}

/** True when a short message is the name of a tool that has a tutorial. */
export function namesTutorialTool(message: string, tutorials: readonly LearnCatalogTutorial[]): boolean {
  const named = tutorialsNamedBy(message, tutorials);
  return named.whole.length > 0 || named.part.length > 0;
}

/**
 * The tutorials a bare name hesitates between, or none when it points at one:
 * several tutorials named whole ("Trezor": Model One, Safe 3, Safe 5...), or
 * no whole one and several in part. One whole tutorial settles it, and so do
 * the tool's own tutorial among its variations ("Sparrow") and a single
 * partial one ("Mint").
 */
export function ambiguousToolTutorials(message: string, tutorials: readonly LearnCatalogTutorial[]): LearnCatalogTutorial[] {
  const { whole, part } = tutorialsNamedBy(message, tutorials);
  if (whole.length === 1 || whole.length + part.length < 2) return [];
  // "Sparrow Wallet" beside "Sparrow Wallet - Multisig": the tutorial whose
  // title every other one extends is the tool's own, the others build on it.
  // "Ledger Flex" and "Ledger Nano S Plus" extend nothing: two devices.
  const titleTokens = whole.map(tutorial => new Set(tokens(tutorial.i18n.en?.name ?? Object.values(tutorial.i18n)[0]?.name ?? '').map(stem)));
  const own = whole.filter((_, index) => titleTokens.every((other, at) => at === index
    || other.size > titleTokens[index].size && [...titleTokens[index]].every(token => other.has(token))));
  if (own.length === 1) return [];
  return [...whole, ...part];
}

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
  const usage = asksToolUsage(query);
  const bareName = isBareName(query);
  const names = toolNames(tutorials);
  const consider = (candidate: Omit<LearnCandidate, 'score' | 'concepts' | 'toolNames'>, fields: Record<string, string>, weights: Record<string, number>) => {
    const concepts = describeLearnResource(candidate.code, candidate.relation, fields);
    const affinity = conceptAffinity(query, concepts);
    const matched = new Set<string>();
    let lexical = 0;
    for (const [field, text] of Object.entries(fields)) {
      const haystack = new Set(tokens(text).map(stem));
      for (const token of queryTokens) if (haystack.has(token)) { lexical += weights[field] ?? 1; matched.add(token); }
    }
    // "How do I set up my Coldcard?" shares one word with the tutorial it
    // asks for. The tool's name with a usage word is enough to read the pack,
    // and so is the name on its own, whole or in part ("Mint"); the excerpt
    // gate still decides whether the pack answers the question.
    const ownNames = candidate.kind === 'tutorial' ? [...(names.get(candidate.code) ?? [])] : [];
    const named = usage || namesWholeTool(queryTokens, ownNames, fields.title ?? '') || bareName && namesPartOfTool(queryTokens, ownNames, fields.title ?? '')
      ? ownNames.filter(name => queryTokens.has(name))
      : [];
    // Direct concept metadata can recover synonyms or short technical queries.
    // Nearby concepts alone never turn generic word overlap into evidence.
    if (!named.length && !affinity.direct && (matched.size < 2 || lexical < 4.5)) return;
    // The tutorial of the tool itself outranks one that pairs it with another:
    // "Sparrow Wallet" before "Jade Plus - Sparrow".
    const naming = named.length ? TOOL_NAME_SCORE + TOOL_NAME_COVERAGE_SCORE * named.length / ownNames.length : 0;
    const score = lexical + affinity.score + naming;
    if (score <= 0) return;
    const previous = candidates.get(candidate.code);
    if (!previous || score > previous.score) {
      candidates.set(candidate.code, { ...candidate, score, concepts, ...(named.length ? { toolNames: named } : {}) });
    }
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
  // A tool named with a usage word is an explicit request for its tutorial.
  // It goes before a course on the same subject, whose score also counts the
  // purpose bonus a tutorial loses when the verb is "import" or "receive".
  const namesTool = (candidate: LearnCandidate) => candidate.toolNames?.length ? 1 : 0;
  return [...candidates.values()]
    .sort((a, b) => namesTool(b) - namesTool(a) || b.score - a.score || a.code.localeCompare(b.code))
    .slice(0, MAX_LEARN_CANDIDATES);
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
