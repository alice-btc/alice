'use client';

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  currentInterfaceLanguage,
  getAppLanguage,
  isSupportedLanguage,
  languageFromLocale,
  setAppLanguage,
  subscribeLanguagePreferences,
} from '@alice-wallet/alice-ai';
import {
  setCurrentLocale,
  translate,
  translatePlural,
  type Locale,
  type MessageKey,
  type MessageParams,
  type PluralKey,
} from './translate';

// The interface follows the app language: the device language until one is
// chosen in Settings › General. The static export is rendered in English; on
// the client the stored choice (or the device language) is read before the
// first paint, then every later change, from any screen, re-renders the tree
// without a reload.

// Same key as ai-preferences.ts; it is stored in the clear, so it can be read
// synchronously before the first paint.
const APP_LANGUAGE_KEY = 'alice_app_language';

function storedLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(APP_LANGUAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch { /* storage unavailable: fall back to the interface locale */ }
  return languageFromLocale(currentInterfaceLanguage());
}

type LanguageContextValue = {
  locale: Locale;
  /** Saves the app language; every subscriber, this provider included, follows. */
  setLocale: (locale: Locale) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: setAppLanguage,
});

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useIsomorphicLayoutEffect(() => {
    setLocaleState(storedLocale());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      getAppLanguage()
        .then(language => { if (!cancelled) setLocaleState(language); })
        .catch(() => { /* keep the current locale */ });
    };
    refresh();
    const unsubscribe = subscribeLanguagePreferences(refresh);
    return () => { cancelled = true; unsubscribe(); };
  }, []);

  // During render, not in an effect: lib code that calls t() while the
  // children render (tab labels, examples) must already see this locale.
  setCurrentLocale(locale);

  useIsomorphicLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    await setAppLanguage(next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLocale(): LanguageContextValue {
  return useContext(LanguageContext);
}

export type Translator = ((key: MessageKey, params?: MessageParams) => string) & {
  /** The counted form of `key` for `count`, `{count}` filled in. */
  plural: (key: PluralKey, count: number, params?: MessageParams) => string;
  locale: Locale;
};

function translator(locale: Locale): Translator {
  const t = ((key: MessageKey, params?: MessageParams) => translate(locale, key, params)) as Translator;
  t.plural = (key, count, params) => translatePlural(locale, key, count, params);
  t.locale = locale;
  return t;
}

/**
 * The interface's words in the app language. Pass a locale to speak another
 * one on a surface that has its own (Learn reads in its course language).
 */
export function useT(override?: Locale): Translator {
  const { locale } = useLocale();
  const active = override ?? locale;
  return useMemo(() => translator(active), [active]);
}
