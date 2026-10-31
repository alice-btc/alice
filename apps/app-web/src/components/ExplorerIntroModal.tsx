'use client';

import { useExplorerDialog } from '@/components/ExplorerUI';

import { SvgIcon } from '@/components/SvgIcon';
import { CLOSE_ICON } from '@/lib/atelier-icons';

import { useState } from 'react';
import { useT } from '@/i18n';

// First-open welcome for the Explorer section. Shown every time the section
// mounts until the user ticks "don't show this again" and confirms; a plain OK
// (or a backdrop click) closes it for now but lets it come back next visit.

const KEY = 'explorer.intro-dismissed.v1';

export function wasIntroDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    // Storage unavailable: never nag a user we cannot remember.
    return true;
  }
}

export function ExplorerIntroModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const dialogRef = useExplorerDialog(onClose);
  const [dontShowAgain, setDontShowAgain] = useState(false);

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="explorer-intro-title"
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
        <div className="flex justify-end"><button type="button" aria-label={t('explorer.intro.close')} onClick={onClose} className="alice-control alice-control--tool"><SvgIcon svg={CLOSE_ICON} size={16} /></button></div>
        <h3
          id="explorer-intro-title"
          className="font-pixel tracking-widest m-0"
          style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--alice-text)' }}
        >
          {t('explorer.intro.title')}
        </h3>
        <p
          className="font-numbers m-0 mt-3"
          style={{ fontSize: 15, lineHeight: '21px', color: 'var(--alice-muted)' }}
        >
          {t('explorer.intro.body')}
        </p>
        <p
          className="font-numbers m-0 mt-2"
          style={{ fontSize: 15, lineHeight: '21px', color: 'var(--alice-muted)' }}
        >
          {t('explorer.intro.optional')}
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
              {t('explorer.intro.dontShow')}
            </span>
          </label>
          <button
            type="button"
            onClick={confirm}
            className="alice-control alice-control--primary font-numbers cursor-pointer"
            style={{
              fontSize: 14,
              padding: '10px 22px',

              borderRadius: 'var(--alice-radius-control)',


            }}
          >
            {t('explorer.intro.start')}
          </button>
        </div>
      </div>
    </div>
  );
}
