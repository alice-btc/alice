'use client';

import { MenuIcon, CloseIcon } from '@/components/icons';

import { useEffect, useRef, useState } from 'react';
import { downloadGroups, PlatformRow } from '@/components/AppCtas';
import type { CommonCopy } from '@/i18n/dictionaries/common';

/**
 * The phone nav: one button, everything inside. On small screens the nav
 * links and both CTA dropdowns have no room, so instead of picking a survivor
 * the whole navigation folds into this panel: page links first, then the
 * Alice App platform list also used by the desktop dropdown.
 */
export function MobileNavMenu({
  links,
  languages,
  menuLabel,
  pagesAria,
  ctas,
  noticeCopy,
}: {
  links: { label: string; href: string }[];
  /** The same page in each other language. */
  languages: { locale: string; label: string; href: string }[];
  menuLabel: string;
  pagesAria: string;
  ctas: CommonCopy['ctas'];
  noticeCopy: CommonCopy['downloadNotice'];
}) {
  const [open, setOpen] = useState(false);
  const groups = downloadGroups(ctas);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={menuLabel}
        onClick={() => setOpen(value => !value)}
        className="cta cta-mobile cursor-pointer px-3.5 py-1.5 text-sm"
      >
        {open ? <CloseIcon size={16} /> : <MenuIcon size={16} />}
        {menuLabel}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-[70] px-3 pt-2">
          <div
            className="max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-bg-soft)] p-2 shadow-xl"
          >
            <nav aria-label={pagesAria} className="flex flex-col" onClick={() => setOpen(false)}>
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-[3px] px-3 py-2.5 text-[15px] font-semibold text-[var(--alice-heading)] transition-colors hover:bg-[var(--alice-bg)]"
                >
                  {link.label}
                </a>
              ))}
              {languages.map((language) => (
                <a
                  key={language.locale}
                  href={language.href}
                  hrefLang={language.locale}
                  lang={language.locale}
                  className="rounded-[3px] px-3 py-2.5 text-[15px] text-[var(--alice-muted)] transition-colors hover:bg-[var(--alice-bg)]"
                >
                  {language.label}
                </a>
              ))}
            </nav>

            {/* Same companion downloads as the desktop menu. */}
            <div className="mt-2 grid grid-cols-1 gap-1 border-t border-[var(--alice-border)] pt-2">
              {groups.map((group, i) => (
                <div key={group.label} className={i > 0 ? 'border-l border-[var(--alice-border)] pl-1' : ''}>
                  <div className="px-2 pb-1 pt-1">
                    <span className="font-pixel text-[9px] uppercase tracking-widest text-[var(--alice-muted)]">
                      {group.label}
                    </span>
                    {group.note && (
                      <p className="mt-1 text-[10px] leading-[1.35] text-[var(--alice-muted)]">
                        {group.note}
                      </p>
                    )}
                  </div>
                  {group.items.map((item) => (
                    <PlatformRow
                      key={`${group.label}:${item.label}`}
                      {...item}
                      comingSoon={ctas.comingSoon}
                      noticeCopy={noticeCopy}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
