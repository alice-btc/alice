'use client';

import { useEffect, useRef, useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import { CHEVRON_DOWN_ICON, EXPLORE_ICON, LEARN_ICON, PLAY_ICON } from '@/lib/atelier-icons';
import type { Translator } from '@/i18n';
import { useDismiss } from '@/lib/use-dismiss';

export interface Recommendation {
  /** The page it opens, so a course quoted by the reply and the same course
      suggested for it make one entry. */
  key: string;
  kind: 'course' | 'chapter' | 'tutorial' | 'playground' | 'explorer';
  title: string;
  /** The small line under the title: "Cours BTC101", "Tutoriel", "Explorer · BLOC 840000". */
  detail: string;
  open: () => void;
}

const ICONS: Record<Recommendation['kind'], string> = {
  course: LEARN_ICON,
  chapter: LEARN_ICON,
  tutorial: LEARN_ICON,
  playground: PLAY_ICON,
  explorer: EXPLORE_ICON,
};

const MENU_WIDTH = 320;

/** One entry per page, the first occurrence kept. */
export function uniqueRecommendations(items: Recommendation[]): Recommendation[] {
  const seen = new Set<string>();
  return items.filter(item => (seen.has(item.key) ? false : (seen.add(item.key), true)));
}

// What Alice advises to read or try after her reply, behind one button at the
// start of the reply's action row, drawn like a file attached to a message:
// "Cours conseillés" (or "À explorer" when the Playground or the Explorer is
// among them) and the count. The list opens upwards, so it never covers the
// composer or the keyboard: on hover where there is a mouse, on a tap
// otherwise.
export function RecommendationsMenu({ items, t }: { items: Recommendation[]; t: Translator }) {
  const [open, setOpen] = useState(false);
  // Rightwards from the button, leftwards when the screen has no room for it.
  const [leftwards, setLeftwards] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useDismiss(open, ref, setOpen);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  if (items.length === 0) return null;
  const learnOnly = items.every(item => item.kind === 'course' || item.kind === 'chapter' || item.kind === 'tutorial');
  const label = learnOnly ? t('chat.recommended.courses') : t('chat.recommended.explore');
  const hover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const place = () => {
    const box = ref.current?.getBoundingClientRect();
    setLeftwards(box ? box.left + MENU_WIDTH + 8 > window.innerWidth : false);
  };
  const enter = () => {
    if (!hover()) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    place();
    setOpen(true);
  };
  const leave = () => {
    if (!hover()) return;
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div ref={ref} className="alice-reco" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        className="alice-reco-trigger font-numbers"
        aria-haspopup="menu"
        aria-expanded={open}
        // With a mouse the hover has already opened it: a click keeps it open.
        onClick={() => { place(); setOpen(value => (hover() ? true : !value)); }}
      >
        <span className="alice-reco-tile"><SvgIcon svg={LEARN_ICON} size={14} /></span>
        <span>{label}</span>
        <span className="alice-reco-count">{items.length}</span>
        <span className="alice-reco-chevron" aria-hidden="true"><SvgIcon svg={CHEVRON_DOWN_ICON} size={10} /></span>
      </button>
      {open && (
        <div role="menu" aria-label={label} className={`alice-reco-menu${leftwards ? ' alice-reco-menu--leftwards' : ''}`}>
          {items.map(item => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className="alice-reco-item font-numbers"
              onClick={() => { setOpen(false); item.open(); }}
            >
              <span className="alice-reco-icon"><SvgIcon svg={ICONS[item.kind]} size={16} /></span>
              <span className="alice-reco-text">
                <span className="alice-reco-title">{item.title}</span>
                <span className="alice-reco-detail">{item.detail}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
