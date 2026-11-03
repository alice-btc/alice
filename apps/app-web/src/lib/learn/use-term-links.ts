'use client';

import { useEffect, useState } from 'react';
import { fetchDictionaryIndex, type DictionaryLang } from './dictionary-packs';
import { buildTermMatcher, type TermMatcher } from './term-links';

// One matcher per dictionary language for every reply on the page, built from
// that pack's index the first time a reply asks for it. A failed load leaves
// replies unlinked and is tried again by the next reply that mounts.
const pending = new Map<DictionaryLang, Promise<TermMatcher>>();

function loadMatcher(lang: DictionaryLang): Promise<TermMatcher> {
  let matcher = pending.get(lang);
  if (!matcher) {
    matcher = fetchDictionaryIndex(lang).then(index => buildTermMatcher(index.entries, lang));
    matcher.catch(() => { pending.delete(lang); });
    pending.set(lang, matcher);
  }
  return matcher;
}

/** The term matcher of the `lang` pack once it is ready; null before, or when `lang` is null. */
export function useTermMatcher(lang: DictionaryLang | null): TermMatcher | null {
  const [ready, setReady] = useState<{ lang: DictionaryLang; matcher: TermMatcher } | null>(null);
  useEffect(() => {
    if (!lang || ready?.lang === lang) return;
    let cancelled = false;
    loadMatcher(lang).then(matcher => { if (!cancelled) setReady({ lang, matcher }); }).catch(() => {});
    return () => { cancelled = true; };
  }, [lang, ready]);
  return lang && ready?.lang === lang ? ready.matcher : null;
}
