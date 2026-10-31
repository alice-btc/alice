import { formatLocale, translate, type Locale } from '../i18n/translate.ts';

// The short "when" under a chat message, in the language of the surface the
// chat sits in: the app language for the main chat, the course language in
// Learn ("À l’instant", not "Just now").

export type RelativeTimeLang = Locale;

export function relativeTime(date: Date, lang: RelativeTimeLang = 'en', now: number = Date.now()): string {
  const seconds = Math.floor((now - date.getTime()) / 1000);
  if (seconds < 30) return translate(lang, 'chat.time.justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return translate(lang, 'chat.time.secondsAgo', { count: seconds });
  if (minutes < 60) return translate(lang, 'chat.time.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return translate(lang, 'chat.time.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  if (days === 1) return translate(lang, 'chat.time.yesterday');
  if (days < 7) return translate(lang, 'chat.time.daysAgo', { count: days });
  return date.toLocaleDateString(formatLocale(lang), { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date(now).getFullYear() ? 'numeric' : undefined });
}
