import type { DictionaryIndexEntry } from '@alice-wallet/alice-content/src/dictionary-types';

// Pure half of the Learn dictionary: ordering, search and the "does this
// question name a dictionary term?" test the chat turn relies on. No fetch,
// node-testable. The packs themselves are loaded by dictionary-packs.ts.

/** Lowercase, accents folded, œ expanded, one space between words. */
export function normalizeTerm(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

/** The dictionary's own order: by letter, then by title. */
export function sortEntries<T extends DictionaryIndexEntry>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => a.letter.localeCompare(b.letter) || collator.compare(a.title, b.title) || a.slug.localeCompare(b.slug));
}

export function entriesForLetter<T extends DictionaryIndexEntry>(entries: readonly T[], letter: string): T[] {
  return sortEntries(entries.filter(entry => entry.letter === letter));
}

/** The letter a definition is filed under, from its ASCII slug. */
export function letterOfSlug(slug: string): string {
  const first = slug.charAt(0);
  return /^[a-z]$/.test(first) ? first : 'a';
}

function names(entry: DictionaryIndexEntry): string[] {
  return [entry.title, entry.english, entry.french].filter((name): name is string => Boolean(name));
}

/**
 * Terms a search box query points at, best first: an exact title, then a
 * title that starts with the query, then a word of a title or equivalent that
 * starts with it, then any term containing it. Two characters minimum.
 */
export function searchDictionary<T extends DictionaryIndexEntry>(entries: readonly T[], query: string, limit = 60): T[] {
  const needle = normalizeTerm(query);
  if (needle.length < 2) return [];
  const scored: { entry: T; rank: number }[] = [];
  for (const entry of entries) {
    let rank = Infinity;
    for (const name of names(entry)) {
      const haystack = normalizeTerm(name);
      if (haystack === needle) rank = Math.min(rank, 0);
      else if (haystack.startsWith(needle)) rank = Math.min(rank, 1);
      else if (haystack.includes(` ${needle}`)) rank = Math.min(rank, 2);
      else if (haystack.includes(needle)) rank = Math.min(rank, 3);
    }
    if (rank !== Infinity) scored.push({ entry, rank });
  }
  return scored
    .sort((a, b) => a.rank - b.rank || collator.compare(a.entry.title, b.entry.title))
    .slice(0, limit)
    .map(item => item.entry);
}

// Names too generic to count as "the question is about this term": they
// appear in almost every Bitcoin question.
const GENERIC_NAMES = new Set(['bitcoin', 'btc', 'bitcoins']);

/** Drop a plural marker so "utxos" meets "utxo" and "clés" meets "clé". */
function singular(token: string): string {
  return token.length > 3 ? token.replace(/(s|x)$/, '') : token;
}

function phrase(text: string): string {
  return normalizeTerm(text).split(' ').filter(Boolean).map(singular).join(' ');
}

export interface DictionaryMatch<T extends DictionaryIndexEntry> {
  entry: T;
  /** The name that matched: the title, or an English or French equivalent. */
  name: string;
}

/**
 * The dictionary term a question names, when it names one unambiguously: the
 * longest title or equivalent found as whole words in the question. Three
 * characters at least, and never a word every question carries ("bitcoin").
 * Null when nothing specific is named, so the chat falls back to the courses.
 */
export function matchDictionaryTerm<T extends DictionaryIndexEntry>(entries: readonly T[], question: string): DictionaryMatch<T> | null {
  const padded = ` ${phrase(question)} `;
  if (padded.trim().length === 0) return null;
  let best: DictionaryMatch<T> | null = null;
  let bestLength = 0;
  for (const entry of entries) {
    for (const name of names(entry)) {
      const normalized = phrase(name);
      if (normalized.length < 3 || GENERIC_NAMES.has(normalized)) continue;
      if (!padded.includes(` ${normalized} `)) continue;
      // Longest wins; on a tie the title beats an equivalent, then the
      // dictionary's own order keeps the result deterministic.
      const longer = normalized.length > bestLength;
      const sameLengthButTitle = normalized.length === bestLength && best !== null && name === entry.title && best.name !== best.entry.title;
      if (longer || sameLengthButTitle) {
        best = { entry, name };
        bestLength = normalized.length;
      }
    }
  }
  return best;
}

/**
 * A definition body as plain prose for the model: images, formulas and
 * formatting out, cut at a sentence end under the limit.
 */
export function definitionExcerpt(body: string, limit = 1_200): string {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (prose.length <= limit) return prose;
  const head = prose.slice(0, limit + 1);
  const end = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  return (end > limit / 2 ? head.slice(0, end + 1) : head.slice(0, limit)).trim();
}
