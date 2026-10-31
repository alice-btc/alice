'use client';

import { SvgIcon } from '@/components/SvgIcon';
import { CLOSE_ICON, CHECK_ICON } from '@/lib/atelier-icons';

import { useState } from 'react';
import { useLearnT } from './learn-locale';
import { WithBitcoinGlyph } from '@/components/AmountDisplay';

// First-open welcome for the Learn section, the twin of ExplorerIntroModal:
// shown on every mount until the user ticks "don't show this again". It says
// what the interface alone does not: this is a full course library, and the
// content is Plan ₿ Academy's under CC BY-SA 4.0 (the attribution belongs in
// front of the reader, not only in a footer). Languages get a button rather
// than a sentence.

const KEY = 'learn.intro-dismissed.v1';

export function wasLearnIntroDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    // Storage unavailable: never nag a user we cannot remember.
    return true;
  }
}

export function LearnIntroModal({
  lang,
  onClose,
  onPickLanguage,
}: {
  lang: string;
  onClose: () => void;
  /** Opens the language picker straight from the dialog. */
  onPickLanguage: () => void;
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const t = useLearnT(lang);

  function confirm() {
    if (dontShowAgain) {
      try {
        window.localStorage.setItem(KEY, '1');
      } catch {
        // Best effort: worst case the intro shows again.
      }
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50 }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="learn-intro-title"
        onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          padding: 20,
          maxHeight: 'calc(100dvh - 48px)',
          overflowY: 'auto',
          backgroundColor: 'var(--alice-bg)',
          border: '1px solid var(--alice-border)',
          borderRadius: 'var(--alice-radius-control)',
          color: 'var(--alice-text)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
        <h3
          id="learn-intro-title"
          className="font-pixel tracking-widest m-0"
          style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--alice-text)' }}
        >
          {t('learn.intro.title')}
        </h3>
        <button type="button" autoFocus className="alice-control alice-control--tool" aria-label={t('common.close')} onClick={onClose}><SvgIcon svg={CLOSE_ICON} size={16} /></button>
        </div>
        <p className="font-numbers m-0 mt-3" style={{ fontSize: 15, lineHeight: '21px', color: 'var(--alice-muted)' }}>
          {t('learn.intro.library')}
        </p>
        <p className="font-numbers m-0 mt-2" style={{ fontSize: 15, lineHeight: '21px', color: 'var(--alice-muted)' }}>
          <WithBitcoinGlyph text={t('learn.intro.license')} />
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ width: 14, height: 14, accentColor: 'var(--alice-primary)' }}
            />
            <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-muted)' }}>
              {t('learn.intro.dontShow')}
            </span>
          </label>
          {/* The two actions wrap on a phone instead of running past the
              dialog (the French labels are the longer ones). */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { confirm(); onPickLanguage(); }}
              className="alice-control alice-control--quiet"
              style={{ padding: '10px 14px' }}
            >
              {t('learn.intro.pickLanguage')}
            </button>
            <button
              type="button"
              onClick={confirm}
              className="alice-control alice-control--primary"
              style={{ padding: '10px 22px' }}
            >
              <SvgIcon svg={CHECK_ICON} size={20} /> {t('learn.intro.explore')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
