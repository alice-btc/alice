import { currentLocale, t, type MessageKey } from '../../i18n/translate.ts';
import { MoneroError } from './monero.ts';

/** Translate at render time so an open error follows a language change. */
export function moneroErrorText(error: unknown, fallback: MessageKey): string {
  if (!(error instanceof MoneroError)) return t(fallback);
  if (currentLocale() === 'en') return error.message;
  return t(`explorerMonero.error.${error.code}`);
}
