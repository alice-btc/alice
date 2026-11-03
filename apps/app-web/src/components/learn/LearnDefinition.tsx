'use client';

import { useEffect, useState } from 'react';
import type { DictionaryDefinition, DictionaryIndex } from '@alice-wallet/alice-content/src/dictionary-types';
import { SvgIcon } from '@/components/SvgIcon';
import { NEXT_ICON } from '@/lib/atelier-icons';
import { requestLearnAsk } from '@/lib/learn/ask';
import { definitionExcerpt, letterOfSlug, otherLanguageName } from '@/lib/learn/dictionary';
import { dictionaryLanguage, dictionaryWorkName, fetchDefinition, fetchDictionaryIndex, type DictionaryLang } from '@/lib/learn/dictionary-packs';
import type { LearnLang } from '@/lib/learn/language';
import type { LearnView } from '@/lib/learn/route';
import { DictionaryAttribution } from './LearnDictionary';
import { LearnMarkdown } from './LearnMarkdown';
import { useLearnT } from './learn-locale';

// One definition of the Dictionnaire de Bitcoin, read like a tutorial page:
// the term, its equivalent in the other language when the dictionary gives
// one, the author's text or its translation, the terms it points to, and a way
// to ask Alice about it with the definition attached.

// A French reading language always reads the French pack, so only the English
// sentence has a translation to name.
export function definitionAskRequest(definition: DictionaryDefinition, lang: 'fr' | 'en', pack: DictionaryLang) {
  const excerpt = definitionExcerpt(definition.body, 900);
  return {
    label: `${lang === 'fr' ? 'DÉFINITION' : 'DEFINITION'} · ${definition.title}`,
    text: lang === 'fr'
      ? `Contexte : je lis la définition « ${definition.title} » du Dictionnaire de Bitcoin de Loïc Pandul : « ${excerpt} » `
      : `Context: I am reading the definition "${definition.title}" in ${dictionaryWorkName(pack)}: "${excerpt}" `,
    draft: lang === 'fr' ? `Explique-moi « ${definition.title} » plus simplement.` : `Explain "${definition.title}" more simply, in English.`,
  };
}

export function LearnDefinition({
  slug,
  lang,
  onNavigate,
}: {
  slug: string;
  lang: LearnLang;
  onNavigate: (view: LearnView) => void;
}) {
  const [definition, setDefinition] = useState<DictionaryDefinition | null>(null);
  const [index, setIndex] = useState<DictionaryIndex | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const t = useLearnT(lang);
  const text = t.locale;
  const pack = dictionaryLanguage(t.locale);

  useEffect(() => {
    let cancelled = false;
    setDefinition(null);
    setIndex(null);
    setState('loading');
    Promise.all([fetchDefinition(slug, pack), fetchDictionaryIndex(pack)])
      .then(([found, loaded]) => {
        if (cancelled) return;
        setDefinition(found);
        setIndex(loaded);
        setState(found ? 'ready' : 'missing');
      })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [slug, pack]);

  const frame: React.CSSProperties = { width: 'min(100% - 32px, 760px)', margin: '0 auto', padding: '24px 0 72px', color: 'var(--alice-text)' };

  if (state === 'loading') {
    return (
      <div style={frame}>
        <p className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }} role="status">{t('common.loading')}</p>
      </div>
    );
  }
  if (state !== 'ready' || !definition) {
    return (
      <div style={frame}>
        <p className="font-numbers" style={{ color: 'var(--alice-muted)' }}>
          {state === 'missing'
            ? t('learn.definition.missing')
            : t('learn.definition.unavailable')}
        </p>
        <button onClick={() => onNavigate({ kind: 'dictionary' })} className="alice-control alice-control--quiet" style={{ padding: 0 }}>
          {t('learn.openDictionary')} <SvgIcon svg={NEXT_ICON} size={16} />
        </button>
      </div>
    );
  }

  const other = otherLanguageName(definition, pack);
  const equivalent = other
    ? t(other.lang === 'en' ? 'learn.definition.inEnglish' : 'learn.definition.inFrench', { term: other.name })
    : null;
  // The original sits in the French repository's folder of the slug's letter,
  // whatever letter the translated title starts with.
  const sourceUrl = index ? `${index.source.definitionsBase}/${letterOfSlug(definition.slug)}/${definition.slug}/definition.md` : undefined;

  return (
    <div style={frame}>
      <div className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{definition.category}</div>
      <h1 className="font-pixel" style={{ fontSize: 14, lineHeight: '24px', margin: '12px 0 4px' }}>{definition.title}</h1>
      {equivalent && (
        <p className="font-numbers" style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--alice-muted)' }}>{equivalent}</p>
      )}

      <LearnMarkdown markdown={definition.body} assetBase="" videos={{}} lang={lang} />

      {definition.seeAlso.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 className="font-pixel" style={{ fontSize: 10, margin: '0 0 10px' }}>{t('learn.definition.seeAlso')}</h2>
          <div className="flex flex-wrap" style={{ gap: 6 }}>
            {definition.seeAlso.map((ref) => (
              <button
                key={ref.slug}
                onClick={() => onNavigate({ kind: 'definition', slug: ref.slug })}
                className="alice-control alice-control--choice font-numbers"
                style={{ padding: '8px 12px', fontSize: 13 }}
              >
                {ref.title}
              </button>
            ))}
          </div>
        </section>
      )}

      <div style={{ marginTop: 28 }}>
        <button
          onClick={() => requestLearnAsk(definitionAskRequest(definition, text, pack))}
          className="alice-control"
          style={{ padding: '10px 14px' }}
        >
          {t('learn.askAlice')} <SvgIcon svg={NEXT_ICON} size={16} />
        </button>
      </div>

      <DictionaryAttribution index={index} lang={t.locale} sourceUrl={sourceUrl} />
    </div>
  );
}
