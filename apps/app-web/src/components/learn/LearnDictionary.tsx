'use client';

import { useEffect, useState } from 'react';
import type { DictionaryIndex, DictionaryIndexEntry } from '@alice-wallet/alice-content/src/dictionary-types';
import { SvgIcon } from '@/components/SvgIcon';
import { EXTERNAL_ICON, NEXT_ICON, SEARCH_ICON } from '@/lib/atelier-icons';
import { entriesForLetter, indexLetters, otherLanguageName, searchDictionary } from '@/lib/learn/dictionary';
import { dictionaryLanguage, fetchDictionaryIndex, type DictionaryLang } from '@/lib/learn/dictionary-packs';
import type { LearnLang } from '@/lib/learn/language';
import { openExternalUrl } from '@/lib/open-external';
import type { LearnView } from '@/lib/learn/route';
import type { Locale } from '@/i18n';
import { formatLocale, useT } from '@/i18n';
import { useLearnT } from './learn-locale';

// The Dictionnaire de Bitcoin inside Learn: one letter at a time, in the
// dictionary's own order, with a search box over titles and their English or
// French equivalents. The pack follows Learn's interface language: its
// unofficial English translation in English, the French original otherwise.
// Every screen names the author, the licence and, for the translation, its
// status.

const cardBorder: React.CSSProperties = { border: '1px solid var(--alice-border)', borderRadius: 'var(--alice-radius-control)' };

export function formatCount(count: number, lang: string): string {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB').format(count);
}

function languageLabel(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([formatLocale(locale)], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

function formatDay(isoDate: string, locale: Locale): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(formatLocale(locale), { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => { e.preventDefault(); void openExternalUrl(href); }}
      style={{ color: 'var(--alice-muted)', textDecoration: 'underline' }}
    >
      {children} <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}><SvgIcon svg={EXTERNAL_ICON} size={16} /></span>
    </a>
  );
}

/** The attribution line every dictionary screen ends with. */
export function DictionaryAttribution({ index, lang, sourceUrl }: { index: DictionaryIndex | null; lang: Locale; sourceUrl?: string }) {
  const t = useT(lang);
  const source = index?.source;
  const translation = source?.translation;
  const author = source?.author ?? 'Loïc Pandul';
  const license = source?.license ?? 'CC BY-NC-SA 4.0';
  const repository = source?.repository ?? 'https://github.com/LoicPandul/Dictionnaire-de-Bitcoin';
  const licenseUrl = source?.licenseUrl ?? 'https://creativecommons.org/licenses/by-nc-sa/4.0/';
  const work = translation?.originalTitle ?? source?.title ?? 'Dictionnaire de Bitcoin';
  return (
    <p className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)', marginTop: 32, lineHeight: 1.7 }}>
      {t('learn.dictionary.attribution.by')}
      {author}, <ExternalLink href={sourceUrl ?? repository}>{work}</ExternalLink>
      {' · '}
      <ExternalLink href={licenseUrl}>{license}</ExternalLink>
      {translation
        ? t('learn.dictionary.attribution.translation', {
          language: languageLabel(translation.language, lang),
          original: languageLabel(translation.originalLanguage, lang),
          date: formatDay(translation.permissionDate, lang),
        }) + t(translation.reviewedByAuthor ? 'learn.dictionary.attribution.reviewed' : 'learn.dictionary.attribution.unreviewed')
        : source && t('learn.dictionary.attribution.text')}
    </p>
  );
}

function TermRow({ entry, pack, lang, onOpen }: { entry: DictionaryIndexEntry; pack: DictionaryLang; lang: Locale; onOpen: () => void }) {
  const t = useT(lang);
  const other = otherLanguageName(entry, pack);
  const equivalent = other
    ? t(other.lang === 'en' ? 'learn.dictionary.inEnglish' : 'learn.dictionary.inFrench', { term: other.name })
    : null;
  return (
    <li>
      <button
        onClick={onOpen}
        className="alice-control alice-control--quiet"
        style={{ width: '100%', justifyContent: 'space-between', textAlign: 'left', padding: '10px 12px', borderRadius: 0, borderBottom: '1px solid var(--alice-border)', gap: 12 }}
      >
        <span className="min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="font-numbers" style={{ fontSize: 14, color: 'var(--alice-text)' }}>{entry.title}</span>
          <span className="font-numbers truncate" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>
            {entry.category.toLowerCase()}{equivalent ? ` · ${equivalent}` : ''}
          </span>
        </span>
        <SvgIcon svg={NEXT_ICON} size={16} />
      </button>
    </li>
  );
}

export function LearnDictionary({
  lang,
  letter,
  onNavigate,
}: {
  lang: LearnLang;
  letter?: string;
  onNavigate: (view: LearnView) => void;
}) {
  const [index, setIndex] = useState<DictionaryIndex | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const t = useLearnT(lang);
  const text = t.locale;
  const pack = dictionaryLanguage(text);

  useEffect(() => {
    let cancelled = false;
    setIndex(null);
    setError(false);
    fetchDictionaryIndex(pack)
      .then((loaded) => { if (!cancelled) setIndex(loaded); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [pack]);

  const letters = index ? indexLetters(index.entries) : 'abcdefghijklmnopqrstuvwxyz'.split('');
  const current = letter && letters.includes(letter) ? letter : letters[0];
  const searching = query.trim().length >= 2;
  const shown = index ? (searching ? searchDictionary(index.entries, query) : entriesForLetter(index.entries, current)) : [];

  return (
    <div style={{ width: 'min(100% - 32px, 1100px)', margin: '0 auto', padding: '24px 0 72px', color: 'var(--alice-text)' }}>
      <header className="workspace-heading">
        <h1 className="font-pixel">{t('learn.dictionary.title')}</h1>
        <p>
          {index
            ? t('learn.dictionary.lead.count', { count: formatCount(index.count, text), author: index.source.author })
            : t('learn.dictionary.lead')}
        </p>
      </header>

      <label htmlFor="dictionary-search" className="alice-field-label">{t('learn.dictionary.search.label')}</label>
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <SvgIcon svg={SEARCH_ICON} size={16} />
        <input
          id="dictionary-search"
          type="search"
          aria-label={t('learn.dictionary.search.aria')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('learn.dictionary.search.placeholder')}
          className="alice-field flex-1"
          style={{ ...cardBorder, borderColor: 'var(--alice-control-border)', minWidth: 180, background: 'transparent', color: 'var(--alice-text)', padding: '10px 12px', fontSize: 14 }}
        />
      </div>

      {!searching && (
        <nav aria-label={t('learn.dictionary.letters')} className="flex flex-wrap" style={{ gap: 4, marginBottom: 18 }}>
          {letters.map((item) => (
            <button
              key={item}
              aria-pressed={item === current}
              onClick={() => onNavigate({ kind: 'dictionary', letter: item })}
              className="alice-control alice-control--choice font-pixel"
              style={{ padding: '8px 0', minWidth: 36, fontSize: 10 }}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </nav>
      )}

      {error && (
        <p className="font-numbers" style={{ color: 'var(--alice-muted)' }}>
          {t('learn.dictionary.unavailable')}
        </p>
      )}
      {!error && !index && (
        <p className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }} role="status">{t('common.loading')}</p>
      )}
      {index && (
        <section aria-live="polite">
          <h2 className="font-pixel flex items-baseline gap-2" style={{ fontSize: 10, margin: '0 0 10px' }}>
            {searching
              ? (shown.length > 0 ? t('learn.results') : t('learn.noResults'))
              : current.toUpperCase()}
            <span className="font-numbers" style={{ fontSize: 12, color: 'var(--alice-muted)' }}>{shown.length}</span>
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, ...cardBorder, overflow: 'hidden' }}>
            {shown.map((entry) => (
              <TermRow key={entry.slug} entry={entry} pack={pack} lang={text} onOpen={() => onNavigate({ kind: 'definition', slug: entry.slug })} />
            ))}
          </ul>
        </section>
      )}

      <DictionaryAttribution index={index} lang={text} />
    </div>
  );
}
