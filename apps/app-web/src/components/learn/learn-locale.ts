import { isSupportedLanguage } from '@alice-wallet/alice-ai';
import { useT, type Locale, type Translator } from '@/i18n';

// Learn's chrome speaks the reading language when the interface has a
// dictionary for it, and the app language otherwise (a course read in
// German keeps buttons in the app language).
export function learnLocale(lang: string): Locale | undefined {
  return isSupportedLanguage(lang) ? lang : undefined;
}

export function useLearnT(lang: string): Translator {
  return useT(learnLocale(lang));
}

/** BLOCK 840000, TX, ADDRESS: the kind of on-chain object an anchor opens. */
export function anchorTypeLabel(t: Translator, anchor: { type: 'block' | 'tx' | 'address'; id: string }): string {
  if (anchor.type === 'block') return t('learn.anchor.block', { id: anchor.id });
  return anchor.type === 'tx' ? t('learn.anchor.tx') : t('learn.anchor.address');
}
