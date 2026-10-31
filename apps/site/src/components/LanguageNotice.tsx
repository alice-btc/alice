'use client';

import { useEffect, useState } from 'react';
import { CloseIcon } from '@/components/icons';

// A one-line offer of the site in the visitor's language, on the English home
// only, for a browser whose language has a translation. Never a redirect: the
// visitor chose this URL, so the page stays and only says the other one
// exists. Rendered after hydration (the server cannot know the browser's
// language), fixed so it shifts nothing, and gone for good once dismissed:
// that choice is the only thing written to the browser's storage, and only
// when the visitor closes the notice.

export type LanguageOffer = {
  locale: string;
  href: string;
  /** Accessible name of the notice, in its own language ("Langue"). */
  label: string;
  message: string;
  close: string;
};

const storageKey = (locale: string) => `alice-site:language-notice-dismissed:${locale}`;

function wasDismissed(locale: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(locale)) === '1';
  } catch {
    return false;
  }
}

function rememberDismissal(locale: string): void {
  try {
    window.localStorage.setItem(storageKey(locale), '1');
  } catch {
    // Storage blocked: the notice closes for this visit only.
  }
}

export function LanguageNotice({ offers }: { offers: LanguageOffer[] }) {
  const [offer, setOffer] = useState<LanguageOffer | null>(null);

  useEffect(() => {
    const language = (navigator.language || '').toLowerCase();
    const match = offers.find((each) => language.startsWith(each.locale));
    if (match && !wasDismissed(match.locale)) setOffer(match);
  }, [offers]);

  if (!offer) return null;

  return (
    <aside
      lang={offer.locale}
      aria-label={offer.label}
      // Above the docked ask bar on phones and tablets (the home page hides
      // that bar on large screens), clear of the 16px gutter.
      className="fixed inset-x-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[45] flex justify-start lg:bottom-4"
    >
      <div className="flex max-w-full items-center gap-1 rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-bg-soft)] py-1 pl-4 pr-1 text-sm shadow-xl">
        <a
          href={offer.href}
          hrefLang={offer.locale}
          className="truncate py-1.5 text-[var(--alice-heading)] underline decoration-[var(--alice-border)] underline-offset-4 hover:text-[var(--alice-primary)]"
        >
          {offer.message} →
        </a>
        <button
          type="button"
          onClick={() => {
            rememberDismissal(offer.locale);
            setOffer(null);
          }}
          aria-label={offer.close}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[3px] bg-transparent text-[var(--alice-muted)] hover:text-[var(--alice-heading)]"
        >
          <CloseIcon size={14} />
        </button>
      </div>
    </aside>
  );
}
