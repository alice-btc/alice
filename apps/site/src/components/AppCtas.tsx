'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DownloadNotice, type DownloadPlatform } from '@/components/DownloadNotice';
import {
  ANDROID_RELEASE_URL,
  APP_URL,
  DESKTOP_LINUX_APPIMAGE_URL,
  DESKTOP_LINUX_DEB_URL,
  DESKTOP_MAC_URL,
  DESKTOP_RELEASE_URL,
  DESKTOP_WINDOWS_URL,
} from '@/lib/site';
import {
  GlobeIcon,
  DownloadIcon,
  AppleGlyph,
  AndroidGlyph,
  WindowsGlyph,
  LinuxGlyph,
  ChevronDownIcon,
  ShieldCheckIcon,
} from '@/components/icons';
import { externalLinkProps } from '@/lib/links';
import type { CommonCopy } from '@/i18n/dictionaries/common';

type CtaCopy = CommonCopy['ctas'];
type NoticeCopy = CommonCopy['downloadNotice'];

type Size = 'sm' | 'md';

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-3 text-base',
};

export type PlatformItem = {
  icon: ReactNode;
  label: string;
  href?: string;
  /** Set when the download triggers an OS warning worth explaining first. */
  notice?: DownloadPlatform;
};

// Companion platforms shared by the desktop and mobile download menus.
export function appPlatformItems(copy: CtaCopy): PlatformItem[] {
  return [
    { icon: <GlobeIcon size={18} />, label: copy.webApp, href: APP_URL },
    // The Mac build is signed with a Developer ID and notarised since 0.2.5, so
    // macOS only asks the standard "downloaded from the Internet" question that
    // every app outside the App Store gets; nothing worth a notice.
    { icon: <AppleGlyph size={18} />, label: copy.mac, href: DESKTOP_MAC_URL },
    { icon: <WindowsGlyph size={16} />, label: copy.windows, href: DESKTOP_WINDOWS_URL, notice: 'windows' },
    // Desktop rows carry no version: every installer on the release page is the
    // same version, and the app updates itself from there. The APK keeps its
    // number because a sideloaded file is chosen by hand, with no update channel.
    // Linux raises no platform warning, so both packages link straight through.
    { icon: <LinuxGlyph size={18} />, label: copy.linuxAppImage, href: DESKTOP_LINUX_APPIMAGE_URL },
    { icon: <LinuxGlyph size={18} />, label: copy.linuxDebian, href: DESKTOP_LINUX_DEB_URL },
    // The phone apps are on their way to the stores; until then the rows
    // stay unlinked and read "Coming soon", and phones use the web app.
    { icon: <AppleGlyph size={18} />, label: copy.ios },
    { icon: <AndroidGlyph size={18} />, label: copy.android },
    { icon: <DownloadIcon size={18} />, label: copy.release, href: DESKTOP_RELEASE_URL },
  ];
}

// `note` is a one-line caveat under the group title, for what the reader
// should know before clicking any row in it, not just one.
export type PlatformGroup = { label: string; items: PlatformItem[]; note?: string };

// Experimental wallet access is intentionally outside the primary downloads.
export function downloadGroups(copy: CtaCopy): PlatformGroup[] {
  return [{ label: copy.appGroup, items: appPlatformItems(copy) }];
}

// Available items get a real link; items with no href (not yet distributed)
// render as plain, non-interactive rows labelled "Coming soon", the same
// honesty pattern used on /trust rather than a dead or invented link.
// Compact rows remain available for constrained placements.
export function PlatformRow({
  icon,
  label,
  href,
  notice,
  compact,
  comingSoon,
  noticeCopy,
}: PlatformItem & { compact?: boolean; comingSoon: string; noticeCopy: NoticeCopy }) {
  // An unsigned build is about to scare this person. Say it first: the dialog
  // takes the click, explains the exact screen coming, and only then hands
  // over the file.
  const [showNotice, setShowNotice] = useState(false);
  const box = compact
    ? 'flex flex-col gap-0.5 rounded-[3px] px-2 py-2'
    : 'flex items-center gap-3 rounded-[3px] px-3 py-2.5';
  const inner = compact ? (
    <>
      <span className="flex items-center gap-2">
        <span className="shrink-0 text-[var(--alice-primary)]">{icon}</span>
        <span className="text-[13px] font-semibold text-[var(--alice-heading)]">{label}</span>
      </span>
      {!href && <span className="pl-[26px] text-[10px] text-[var(--alice-muted)]">{comingSoon}</span>}
    </>
  ) : (
    <>
      <span className="text-[var(--alice-primary)]">{icon}</span>
      <span className="flex-1 text-[14px] font-semibold text-[var(--alice-heading)]">{label}</span>
      {!href && <span className="text-[11px] text-[var(--alice-muted)]">{comingSoon}</span>}
    </>
  );
  if (href && notice) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowNotice(true)}
          className={`${box} w-full cursor-pointer bg-transparent text-left transition-colors hover:bg-[var(--alice-bg)]`}
        >
          {inner}
        </button>
        {showNotice && (
          <DownloadNotice
            platform={notice}
            copy={noticeCopy}
            href={href}
            verifyHref={notice === 'android' ? ANDROID_RELEASE_URL : DESKTOP_RELEASE_URL}
            onCancel={() => setShowNotice(false)}
          />
        )}
      </>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        {...externalLinkProps(href)}
        className={`${box} transition-colors hover:bg-[var(--alice-bg)]`}
      >
        {inner}
      </a>
    );
  }
  return (
    <div
      aria-disabled="true"
      className={`${box} opacity-50`}
    >
      {inner}
    </div>
  );
}

// Hover/focus panel of platform-specific options, layered under a trigger CTA.
// Its top padding keeps a visual gap while remaining part of the hit area, so
// moving the pointer from the CTA to an item cannot close the panel mid-way.
function PlatformMenu({
  groups,
  placement,
  label,
  copy,
  noticeCopy,
}: {
  groups: PlatformGroup[];
  placement: { width: number; left: number; compact: boolean };
  label: string;
  copy: CtaCopy;
  noticeCopy: NoticeCopy;
}) {
  return (
    <div
      className="platform-menu absolute top-full z-[70] pt-2"
      style={{ width: placement.width, left: placement.left }}
    >
      {/* One compact list; groups stack under their titles. */}
      <div
        role="group"
        aria-label={label}
        className="grid grid-cols-1 gap-1.5 rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-bg-soft)] p-1.5 shadow-xl"
      >
        {groups.map((group, i) => (
          <div
            key={group.label}
            className={i > 0 ? 'border-t border-[var(--alice-border)] pt-1.5' : ''}
          >
            {/* No glyph on the group title: the icons belong to the rows,
                where they say which platform. One in the header only competes
                with them, and costs the title its single line. */}
            <div className={`${placement.compact ? 'px-2' : 'px-3'} pb-1 pt-1`}>
              <span className="whitespace-nowrap font-pixel text-[9px] uppercase tracking-widest text-[var(--alice-muted)]">
                {group.label}
              </span>
              {/* The note sits under its title and wraps. */}
              {group.note && (
                <p className="mt-1 text-[11px] leading-[1.35] text-[var(--alice-muted)]">
                  {group.note}
                </p>
              )}
            </div>
            {group.items.map((item) => (
              <PlatformRow
                key={`${group.label}:${item.label}`}
                {...item}
                compact={placement.compact}
                comingSoon={copy.comingSoon}
                noticeCopy={noticeCopy}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// A click (or tap) toggles the menu; on devices with a real pointer, hovering
// the trigger is enough (see .platform-selector in globals.css). The click
// path needs state rather than a bare <details> so an open menu can close on
// outside click or Escape instead of staying pinned over the page.
export function PlatformSelector({
  trigger,
  className,
  groups,
  copy,
  noticeCopy,
  menuLabel,
  ariaLabel,
  chevron = true,
  menuWidth = 300,
}: {
  trigger: ReactNode;
  className: string;
  groups: PlatformGroup[];
  copy: CtaCopy;
  noticeCopy: NoticeCopy;
  /** Accessible name of the menu; the downloads one when unset. */
  menuLabel?: string;
  /** For a trigger that shows only an icon. */
  ariaLabel?: string;
  chevron?: boolean;
  menuWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  // The panel is placed in viewport pixels, never by edge: centred on its
  // button, clamped 12px inside the viewport, and no wider than the viewport
  // allows. That is what keeps it whole on a phone, where the desktop-width
  // panel used to be cropped by the screen edges. Measured on mount and
  // resize (not on open), so the CSS hover-open path finds it ready too;
  // narrow placements switch the rows to their compact shape.
  const [placement, setPlacement] = useState({ width: 300, left: 0, compact: false });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const vw = window.innerWidth;
      const width = Math.min(menuWidth, vw - 24);
      const centre = rect.left + rect.width / 2;
      const inViewport = Math.min(Math.max(centre - width / 2, 12), vw - 12 - width);
      setPlacement({ width, left: inViewport - rect.left, compact: false });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [menuWidth]);

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
    <div
      ref={rootRef}
      className="platform-selector relative inline-block"
      data-open={open || undefined}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(value => !value)}
        className={`${className} cursor-pointer`}
      >
        {trigger}
        {chevron && <ChevronDownIcon size={14} />}
      </button>
      <PlatformMenu
        groups={groups}
        placement={placement}
        label={menuLabel ?? copy.downloadsAria}
        copy={copy}
        noticeCopy={noticeCopy}
      />
    </div>
  );
}

// The primary action, and the only one that needs no decision from the
// visitor: open the companion, which runs in any browser, phone included.
// Alice App is the main product and the whole page says so; the wallet is
// presented separately as an experimental project below the main content.
export function OpenAliceButton({ size = 'md', copy }: { size?: Size; copy: CtaCopy }) {
  return (
    <a href={APP_URL} {...externalLinkProps(APP_URL)} className={`cta cta-solid ${sizes[size]}`}>
      {copy.openWebApp}
    </a>
  );
}

// Main downloads are for Alice App; the experimental wallet has its own section.
export function DownloadButton({
  size = 'md',
  copy,
  noticeCopy,
}: {
  size?: Size;
  copy: CtaCopy;
  noticeCopy: NoticeCopy;
}) {
  return (
    <PlatformSelector
      className={`cta ${sizes[size]}`}
      trigger={
        <>
          <DownloadIcon size={size === 'sm' ? 16 : 18} />
          {copy.download}
        </>
      }
      groups={downloadGroups(copy)}
      copy={copy}
      noticeCopy={noticeCopy}
    />
  );
}

export function ReleaseLinks({ copy }: { copy: CtaCopy }) {
  return (
    <div className="mt-3 flex items-center text-sm">
      <a
        href={DESKTOP_RELEASE_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-[var(--alice-muted)] hover:text-[var(--alice-primary)] hover:underline"
      >
        <ShieldCheckIcon size={16} />
        {copy.releaseLinks}
      </a>
    </div>
  );
}

// The pair: open the companion (filled, the action most visitors want) and
// everything installable (outline).
export function AppCtas({
  size = 'md',
  copy,
  noticeCopy,
}: {
  size?: Size;
  copy: CtaCopy;
  noticeCopy: NoticeCopy;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <OpenAliceButton size={size} copy={copy} />
      <DownloadButton size={size} copy={copy} noticeCopy={noticeCopy} />
    </div>
  );
}
