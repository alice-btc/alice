'use client';

import { CloseIcon } from '@/components/icons';

import { useEffect, useRef, useState } from 'react';
import type { CommonCopy } from '@/i18n/dictionaries/common';

// What an unsigned build does to a first-time visitor, said before it happens
// rather than after.
//
// The Windows installer ships without a code-signing certificate and the
// Android APK is installed outside the Play Store. The cost is not technical,
// it is a scary screen at the worst possible moment: someone who has just
// decided to try a Bitcoin companion is told their computer protected them
// from it.
//
// Saying it first turns an alarm into a formality. It also happens to be the
// honest thing: the warning is real, it is our doing, and the visitor deserves
// to know why before they click, not to discover it alone.
//
// The Mac build is signed with a Developer ID and notarised by Apple since
// 0.2.5, so macOS asks only its standard first-launch question, the same one
// every app outside the App Store gets. Linux and the web surfaces show
// nothing, because nothing happens there.

export type DownloadPlatform = 'android' | 'windows';

export function DownloadNotice({
  platform,
  copy,
  href,
  verifyHref,
  onCancel,
}: {
  platform: DownloadPlatform;
  copy: CommonCopy['downloadNotice'];
  href: string;
  verifyHref: string;
  onCancel: () => void;
}) {
  // The dictionary quotes each system's warning verbatim, in the language
  // that system shows it in, so the visitor recognises the screen.
  const notice = copy[platform];
  // The steps are needed *after* the download, when the operating system puts
  // its warning on screen. Closing this dialog on the download click threw
  // them away at exactly the moment they became useful, so the click starts
  // the file and leaves the instructions standing.
  const [started, setStarted] = useState(false);

  // The dialog takes the focus when it opens and gives it back to the button
  // that opened it when it closes; otherwise a keyboard user is left on a
  // control hidden behind the overlay.
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      // Before the download, a click outside is a way out. After it, it is a
      // stray click that would take the steps away mid-install; the close
      // button and Escape stay, and they are deliberate.
      onClick={started ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={notice.title}
        onClick={event => event.stopPropagation()}
        className="relative flex max-h-[calc(100vh-4rem)] w-full max-w-lg flex-col rounded-[4px] border"
        style={{
          borderColor: 'var(--alice-border)',
          backgroundColor: 'var(--alice-bg)',
        }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onCancel}
          aria-label={copy.closeAria}
          className="absolute right-3 top-3 cursor-pointer bg-transparent px-2 py-1 text-lg leading-none text-[var(--alice-muted)]"
        >
          <CloseIcon size={16} />
        </button>

        <div className="shrink-0 px-6 pt-6">
          <p className="font-pixel text-[11px] uppercase tracking-widest text-[var(--alice-primary)] pr-8">
            {started ? copy.eyebrowWhile : copy.eyebrowBefore}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-[var(--alice-heading)] sm:text-2xl">
            {notice.title}
          </h2>

          {started && (
            <p className="mt-3 text-sm leading-relaxed text-[var(--alice-primary)]">
              {copy.started}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <p
            className="mt-4 rounded-[4px] border-l-2 px-4 py-3 text-[15px] leading-relaxed"
            style={{
              borderColor: 'var(--alice-primary)',
              backgroundColor: 'var(--alice-bg-soft)',
              color: 'var(--alice-text)',
            }}
          >
            {notice.screen}
          </p>

          <p className="mt-4 leading-relaxed text-[var(--alice-text)]">{notice.why}</p>

          <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 leading-relaxed text-[var(--alice-text)]">
            {notice.steps.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <p className="mt-5 text-sm leading-relaxed text-[var(--alice-muted)]">
            {copy.verifyBefore}
            <a
              href={verifyHref}
              target="_blank"
              rel="noreferrer"
              className="underline"
              style={{ color: 'var(--alice-primary)' }}
            >
              {copy.verifyLink}
            </a>
            {copy.verifyAfter}
          </p>
        </div>

        <div className="shrink-0 flex flex-wrap items-center justify-end gap-3 px-6 pb-6 pt-4">
          {started ? (
            <>
              <a
                href={href}
                className="cursor-pointer px-3 py-2 text-sm text-[var(--alice-muted)] underline"
              >
                {copy.downloadAgain}
              </a>
              <button
                type="button"
                onClick={onCancel}
                className="cta cta-solid px-5 py-2.5 text-sm"
              >
                {copy.close}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="cursor-pointer bg-transparent px-3 py-2 text-sm text-[var(--alice-muted)]"
              >
                {copy.cancel}
              </button>
              <a
                href={href}
                onClick={() => setStarted(true)}
                className="cta cta-solid px-5 py-2.5 text-sm"
              >
                {copy.downloadAnyway}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
