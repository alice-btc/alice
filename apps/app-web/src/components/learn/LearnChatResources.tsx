'use client';

import { useRouter } from 'next/navigation';
import type { ChatMsg } from '@alice-wallet/alice-ai';
import { openAnchorFromChat } from '@/lib/learn/explorer-link';
import { loadProgress, readCount } from '@/lib/learn/progress';
import { requestPlaygroundView } from '@/lib/playground-open';
import type { LearnChatResources as Resources } from '@/lib/learn/suggest-catalog';
import { useT } from '@/i18n';
import { anchorTypeLabel } from './learn-locale';
import type { Recommendation } from './RecommendationsMenu';

// The resources suggested after Alice's reply, as recommendations (course or
// tutorial from the deterministic scorer, verified Explorer anchors from the
// hand-curated table). The resources are computed by the SEND HANDLER;
// this hook only decides WHEN to offer them: after the reply that answers the
// suggesting message is done, and none otherwise.
export function useLearnChatResources({
  resources,
  question,
  messages,
  busy,
  lang,
}: {
  resources: Resources | null;
  /** The user message these resources answer; they only show while it is
      still the conversation's latest question (survives remounts). */
  question: string;
  messages: ChatMsg[];
  busy: boolean;
  lang: 'fr' | 'en';
}): Recommendation[] {
  const router = useRouter();
  const t = useT(lang);
  if (!resources || busy) return [];
  const { learn, chapter, anchors, playground } = resources;
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant' || !last.content.trim()) return [];
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser || lastUser.content.trim() !== question) return [];

  const items: Recommendation[] = [];
  if (learn) {
    const code = learn.code.toUpperCase();
    const path = learn.kind === 'course' ? `/learn/?course=${learn.code}` : `/learn/?tutorial=${learn.code}`;
    const started = learn.kind === 'course' && readCount(loadProgress(), learn.code) > 0;
    items.push({
      key: path,
      kind: learn.kind === 'course' ? 'course' : 'tutorial',
      title: learn.title,
      detail: learn.kind === 'course'
        ? t(started ? 'chat.recommended.resume' : 'chat.recommended.course', { code })
        : t('chat.recommended.tutorial'),
      open: () => router.push(path),
    });
  }
  if (chapter) {
    const path = `/learn/?course=${chapter.courseCode}&chapter=${chapter.chapterId}`;
    items.push({
      key: path,
      kind: 'chapter',
      title: chapter.title,
      detail: t('chat.recommended.chapter', { code: chapter.courseCode.toUpperCase() }),
      open: () => router.push(path),
    });
  }
  if (playground) {
    items.push({
      key: 'playground',
      kind: 'playground',
      title: t('learn.resources.playground'),
      detail: t('chat.recommended.playground'),
      open: () => { requestPlaygroundView(playground); router.push('/playground'); },
    });
  }
  for (const anchor of anchors) {
    items.push({
      key: `${anchor.type}:${anchor.id}`,
      kind: 'explorer',
      title: anchor.label[lang],
      detail: `${t('chat.recommended.explorer')} · ${anchorTypeLabel(t, anchor)}`,
      open: () => openAnchorFromChat(anchor, lang, (path) => router.push(path)),
    });
  }
  return items;
}
