// The short "when" under a chat message. The main chat is in English; the
// side chats follow the language of the surface they sit in (Learn in French
// says "À l’instant", not "Just now").

export type RelativeTimeLang = 'en' | 'fr';

export function relativeTime(date: Date, lang: RelativeTimeLang = 'en', now: number = Date.now()): string {
  const fr = lang === 'fr';
  const seconds = Math.floor((now - date.getTime()) / 1000);
  if (seconds < 30) return fr ? 'À l’instant' : 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return fr ? `il y a ${seconds} s` : `${seconds}s ago`;
  if (minutes < 60) return fr ? `il y a ${minutes} min` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return fr ? `il y a ${hours} h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return fr ? 'Hier' : 'Yesterday';
  if (days < 7) return fr ? `il y a ${days} j` : `${days}d ago`;
  return date.toLocaleDateString(fr ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date(now).getFullYear() ? 'numeric' : undefined });
}
