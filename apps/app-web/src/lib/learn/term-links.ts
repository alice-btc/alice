import type { DictionaryIndexEntry } from '@alice-wallet/alice-content/src/dictionary-types';
import { isFrenchNameReadAsEnglish, isGenericTerm, termKey } from './dictionary.ts';

// Dictionary terms inside one of Alice's replies, turned into links to their
// definitions. Whole words only, the first time a term appears, and a handful
// per reply, the most specific first. Pure and node-testable: ChatMessage
// renders the segments, the reader opens a definition from the link.

/** The longest name, in words, a reply is searched for. */
const MAX_WORDS = 5;
export const MAX_LINKS_PER_REPLY = 6;

// Names that are also everyday words, or brands named like one: a link on
// them would point at the dictionary where the reply means the ordinary word.
const EVERYDAY_WORDS = new Set([
  'account', 'anchor', 'annex', 'annexe', 'aperture', 'baleine', 'binaire', 'binary', 'bit', 'blink',
  'byte', 'c', 'champion', 'chance', 'change', 'clone', 'cluster', 'coin', 'commit', 'compte', 'connector',
  'container', 'cookie', 'database', 'depot', 'depth', 'eclipse', 'element', 'entree', 'envoy', 'facture', 'fountain', 'gardien',
  'engraving', 'genese', 'git', 'input', 'interface', 'issue', 'jade', 'jam', 'label', 'latence', 'latency', 'layer', 'ledger',
  'lock', 'loop', 'luck', 'magma', 'mapper', 'merchant', 'merge', 'noise', 'objectif', 'ocean', 'octet',
  'offer', 'oracle', 'output', 'ownership', 'part', 'passport', 'peach', 'phoenix', 'pile', 'polar', 'portal',
  'premium', 'purpose', 'redeem', 'relai', 'relay', 'robinet', 'schema', 'sentinel', 'share', 'snapshot',
  'sondage', 'sortie', 'spark', 'sphinx', 'spiral', 'stack', 'stamp', 'stash', 'synonym', 'tide',
  'universe', 'valency', 'variance', 'vault', 'voltage', 'whale', 'zap', 'zeu',
]);

// English titles of one word that English replies mostly use in their
// everyday sense ("commitment", "tweak", "slip"): left out of the English
// pack only, where a reply says them without meaning the dictionary entry.
const EVERYDAY_ENGLISH = new Set([
  'anne', 'aqua', 'assignment', 'bounty', 'bulletproof', 'clementine', 'commitment', 'consignment',
  'contributor', 'distributed', 'faraday', 'maintainer', 'matt', 'percolation', 'roast', 'simplicity',
  'slip', 'stark', 'tweak',
]);

export interface TermMatcher {
  /** Name key (see termKey) to the slug of its definition. */
  slugByKey: Map<string, string>;
}

/**
 * Every title first, then the English and French equivalents and the French
 * aliases: a title wins a shared name. In the English pack, a French name that
 * reads as an everyday English word ("part", "chance") is left out, and so is
 * an English title of the EVERYDAY_ENGLISH kind.
 */
export function buildTermMatcher(entries: readonly DictionaryIndexEntry[], lang: 'en' | 'fr' = 'fr'): TermMatcher {
  const slugByKey = new Map<string, string>();
  const add = (name: string | undefined, slug: string) => {
    if (!name) return;
    const key = termKey(name);
    if (key.length < 3 || isGenericTerm(key) || EVERYDAY_WORDS.has(key)) return;
    if (lang === 'en' && EVERYDAY_ENGLISH.has(key)) return;
    if (key.split(' ').length > MAX_WORDS || slugByKey.has(key)) return;
    slugByKey.set(key, slug);
  };
  for (const entry of entries) add(entry.title, entry.slug);
  for (const entry of entries) {
    add(entry.english, entry.slug);
    for (const french of [entry.french, ...(entry.frenchAliases ?? [])]) {
      if (lang === 'en' && french && isFrenchNameReadAsEnglish(termKey(french))) continue;
      add(french, entry.slug);
    }
  }
  return { slugByKey };
}

export interface TermSegment {
  text: string;
  /** Set when the segment is a dictionary term to link. */
  slug?: string;
}

interface Found {
  slug: string;
  key: string;
  words: number;
  length: number;
  start: number;
  end: number;
}

// Words, numbers included, with their place in the text; two words belong to
// one name only when a single space, hyphen or apostrophe separates them.
function wordsOf(text: string): { key: string; start: number; end: number }[] {
  return [...text.matchAll(/[\p{L}\p{N}]+/gu)].map(match => ({
    key: termKey(match[0]),
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
}

function findTerms(text: string, matcher: TermMatcher): Found[] {
  const words = wordsOf(text);
  const found: Found[] = [];
  let i = 0;
  while (i < words.length) {
    let match: Found | null = null;
    for (let n = Math.min(MAX_WORDS, words.length - i); n >= 1 && !match; n -= 1) {
      const span = words.slice(i, i + n);
      const joined = span.every((word, k) => k === 0 || /^[ \u00a0'’-]$/.test(text.slice(span[k - 1].end, word.start)));
      if (!joined) continue;
      const key = span.map(word => word.key).join(' ');
      const slug = matcher.slugByKey.get(key);
      if (slug) match = { slug, key, words: n, length: key.length, start: span[0].start, end: span[n - 1].end };
    }
    if (match) {
      found.push(match);
      i += match.words;
    } else {
      i += 1;
    }
  }
  return found;
}

/**
 * The definitions a reply links to: at most MAX_LINKS_PER_REPLY. First the
 * definitions the reply drew on (`quoted`), then names of several words before
 * single words, longer names before shorter ones, then the order they appear
 * in. A name inside a longer one already linked is left out ("nœud" next to
 * "nœud complet").
 */
export function chooseLinkedTerms(text: string, matcher: TermMatcher, quoted: ReadonlySet<string> = new Set()): Set<string> {
  const first = new Map<string, Found>();
  for (const term of findTerms(text, matcher)) if (!first.has(term.slug)) first.set(term.slug, term);
  const rank = (term: Found) => (quoted.has(term.slug) ? 0 : 1);
  const ranked = [...first.values()].sort((a, b) => rank(a) - rank(b) || b.words - a.words || b.length - a.length || a.start - b.start);
  const kept: Found[] = [];
  for (const term of ranked) {
    if (kept.length === MAX_LINKS_PER_REPLY) break;
    if (kept.some(longer => ` ${longer.key} `.includes(` ${term.key} `))) continue;
    kept.push(term);
  }
  return new Set(kept.map(term => term.slug));
}

/**
 * One stretch of a reply cut into plain text and links. `linked` is shared
 * across the stretches of one reply, so each chosen term is linked once, the
 * first time it appears.
 */
export function linkTerms(text: string, matcher: TermMatcher, chosen: Set<string>, linked: Set<string>): TermSegment[] {
  const segments: TermSegment[] = [];
  let cursor = 0;
  for (const term of findTerms(text, matcher)) {
    if (!chosen.has(term.slug) || linked.has(term.slug)) continue;
    linked.add(term.slug);
    if (term.start > cursor) segments.push({ text: text.slice(cursor, term.start) });
    segments.push({ text: text.slice(term.start, term.end), slug: term.slug });
    cursor = term.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}
