import { ALICE_SYMBOL_PATH, ALICE_WORDMARK_PATH } from '@/lib/brand';
import { rabbitPaths } from '@/lib/rabbit-paths';

// Integer-grid glyphs shared visually with the approved application controls.
function PixelGlyph({ size, path }: { size: number; path: string }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true"><path fillRule="evenodd" d={path} /></svg>;
}

export function PhoneIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M5 1h10v18H5zm2 2v12h6V3zm2 13v1h2v-1z" />;
}

export function DesktopIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M1 2h18v12h-8v2h4v2H5v-2h4v-2H1zm2 2v8h14V4z" />;
}

export function LaptopIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M3 3h14v11H3zm2 2v7h10V5zM1 15h18v2H1z" />;
}

export function CloudIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M7 2h6v2h3v3h2v2h1v7H1V9h2V7h3V4h1zm1 2v5H4v2H3v3h14v-3h-3V8h-2V4z" />;
}

export function KeyIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M6 2h8v1H6zM5 3h10v1H5zM5 4h2v4H5zM13 4h2v4H13zM5 8h10v1H5zM6 9h8v1H6zM9 10h2v2H9zM9 12h6v2H9zM9 14h2v2H9zM9 16h6v2H9z" />;
}

export function BookIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M1 3h7l2 2 2-2h7v13h-7l-2 2-2-2H1zm2 2v9h5l1 1V6L7 5zm8 1v9l1-1h5V5h-4z" />;
}

export function CompassIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M6 1h8v2h3v3h2v8h-2v3h-3v2H6v-2H3v-3H1V6h2V3h3zm0 2v2H4v2H3v6h1v2h2v2h8v-2h2v-2h1V7h-1V5h-2V3zm6 3h3l-3 6-7 3 3-7zm-2 3-2 3 3-1 1-3z" />;
}

export function ShieldIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M8 1h4v1h3v1h3v9h-2v3h-2v2h-2v2H8v-2H6v-2H4v-3H2V3h3V2h3zm0 3H4v7h2v3h2v2h4v-2h2v-3h2V5h-4V4z" />;
}

export function ShieldCheckIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M8 1h4v1h3v1h3v9h-2v3h-2v2h-2v2H8v-2H6v-2H4v-3H2V3h3V2h3zm0 3H4v7h2v3h2v2h4v-2h2v-3h2V5h-4V4zM6 8h2v2h2V8h2V6h2v4h-2v2H8v-1H6z" />;
}

export function GlobeIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true"><path fillRule="evenodd" d="M6 1h8v2h3v3h2v8h-2v3h-3v2H6v-2H3v-3H1V6h2V3h3zm0 2v2H5v1H3v8h2v1h1v2h8v-2h1v-1h2V6h-2V5h-1V3z"/><path d="M2 9h16v2H2zM7 3h2v4H7zM6 7h2v6H6zM7 13h2v4H7zM11 3h2v4h-2zM12 7h2v6h-2zM11 13h2v4h-2z"/></svg>;
}

export function DownloadIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M9 2h2v6H9zM5 8h10v2H5zM7 10h6v2H7zM9 12h2v2H9zM3 14h2v2H3zM15 14h2v2H15zM3 16h14v2H3z" />;
}

export function ChevronDownIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M3 6h2v2h2v2h2v2h2v-2h2V8h2V6h2v3h-2v2h-2v2h-2v2H9v-2H7v-2H5V9H3z" />;
}

// Simplified own line-art platform marks (not a reproduction of any trademarked
// logo file), sized to read clearly at ~18-20px next to the other icons.
export function AppleGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.6 2.6c.1 1.1-.3 2.2-1 3-.7.8-1.9 1.5-3 1.4-.1-1.1.4-2.2 1-3 .8-.9 2-1.5 3-1.4Z" />
      <path d="M19.8 17.3c-.5 1.2-.8 1.7-1.5 2.7-.9 1.4-2.2 3.1-3.9 3.1-1.4 0-1.8-.9-3.7-.9-1.9 0-2.4.9-3.7.9-1.6 0-2.8-1.5-3.8-2.9-2.4-3.4-2.7-7.4-1.2-9.5 1-1.5 2.7-2.4 4.2-2.4 1.5 0 2.5 1 3.7 1 1.2 0 1.9-1 3.7-1 1.3 0 2.8.7 3.7 2-3.3 1.8-2.8 6.5 1.5 8Z" />
    </svg>
  );
}

export function WindowsGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="3.5" width="8.2" height="8.2" />
      <rect x="13.3" y="3.5" width="8.2" height="8.2" />
      <rect x="2.5" y="12.3" width="8.2" height="8.2" />
      <rect x="13.3" y="12.3" width="8.2" height="8.2" />
    </svg>
  );
}

export function LinuxGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="12" cy="10" rx="5.2" ry="6" />
      <path d="M8.5 15.5c-.6 1.6-1.6 2.7-2.4 4.4-.4.9.3 1.6 1.2 1.2 1-.5 1.6-1 2.8-1 .8 0 1.1.7 1.9.7s1.1-.7 1.9-.7c1.2 0 1.8.5 2.8 1 .9.4 1.6-.3 1.2-1.2-.8-1.7-1.8-2.8-2.4-4.4" />
      <circle cx="9.8" cy="8.8" r="1" fill="var(--alice-bg)" />
      <circle cx="14.2" cy="8.8" r="1" fill="var(--alice-bg)" />
    </svg>
  );
}

export function AndroidGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.5 10.5h11v6.2a1.3 1.3 0 0 1-1.3 1.3h-8.4a1.3 1.3 0 0 1-1.3-1.3v-6.2Z" />
      <rect x="4.8" y="10.5" width="1.8" height="5.5" rx="0.9" />
      <rect x="17.4" y="10.5" width="1.8" height="5.5" rx="0.9" />
      <rect x="9.5" y="18" width="1.6" height="3" rx="0.8" />
      <rect x="12.9" y="18" width="1.6" height="3" rx="0.8" />
      <path d="M7.3 9.6a4.7 4.7 0 0 1 9.4 0Z" />
      <circle cx="9.8" cy="7.7" r="0.55" fill="var(--alice-bg)" />
      <circle cx="14.2" cy="7.7" r="0.55" fill="var(--alice-bg)" />
      <line x1="8.3" y1="4.3" x2="9.3" y2="5.9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="15.7" y1="4.3" x2="14.7" y2="5.9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

// Two people, on the pixel grid like the interface glyphs above.
export function CommunityIcon({ size = 20 }: { size?: number }) {
  return <PixelGlyph size={size} path="M6 4h3v1h1v3H9v1H6V8H5V5h1zM4 10h8v1h1v6H3v-6h1zM13 3h2v1h1v2h-1v1h-2V6h-1V4h1zM14 9h3v1h1v5h-4z" />;
}

// Line envelope for the contact links.
export function MailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3.5 6.5 7.4 5.6a1.8 1.8 0 0 0 2.2 0l7.4-5.6" />
    </svg>
  );
}

// The Nostr icon by Andrea Nicolini / mbarulli/nostr-logo, CC0 1.0, cropped
// to its drawing so it fills the box like the X mark.
export function NostrGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="44 40 176 176" fill="currentColor" aria-hidden="true">
      <path d="M210.8 199.4c0 3.1-2.5 5.7-5.7 5.7h-68c-3.1 0-5.7-2.5-5.7-5.7v-15.5c.3-19 2.3-37.2 6.5-45.5 2.5-5 6.7-7.7 11.5-9.1 9.1-2.7 24.9-.9 31.7-1.2 0 0 20.4.8 20.4-10.7s-9.1-8.6-9.1-8.6c-10 .3-17.7-.4-22.6-2.4-8.3-3.3-8.6-9.2-8.6-11.2-.4-23.1-34.5-25.9-64.5-20.1-32.8 6.2.4 53.3.4 116.1v8.4c0 3.1-2.6 5.6-5.7 5.6H57.7c-3.1 0-5.7-2.5-5.7-5.7v-144c0-3.1 2.5-5.7 5.7-5.7h31.7c3.1 0 5.7 2.5 5.7 5.7 0 4.7 5.2 7.2 9 4.5 11.4-8.2 26-12.5 42.4-12.5 36.6 0 64.4 21.4 64.4 68.7v83.2ZM150 99.3c0-6.7-5.4-12.1-12.1-12.1s-12.1 5.4-12.1 12.1 5.4 12.1 12.1 12.1S150 106 150 99.3Z" />
    </svg>
  );
}

// The X mark, from Simple Icons (CC0 1.0).
export function XGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

// The GitHub mark, from Simple Icons (CC0 1.0).
export function GitHubGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

// The D2 symbol is the A in the wordmark. The rabbit remains the assistant mascot.
export function AliceMark({ size = 22, showWordmark = true }: {
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <svg
      role="img"
      aria-label="Alice"
      data-alice-brand="d2"
      width={showWordmark ? size * 248 / 48 : size}
      height={size}
      viewBox={showWordmark ? '0 0 248 48' : '0 0 48 48'}
      fill="currentColor"
      shapeRendering="crispEdges"
      className="shrink-0 text-[var(--alice-primary)]"
    >
      <path d={showWordmark ? ALICE_WORDMARK_PATH : ALICE_SYMBOL_PATH} />
    </svg>
  );
}

export function AliceMascot({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="currentColor" className="shrink-0 text-[var(--alice-primary)]" aria-hidden="true"><path d={rabbitPaths.repos} /></svg>;
}

export function MenuIcon({ size = 16 }: { size?: number }) {
  return <PixelGlyph size={size} path="M2 4h16v2H2zm0 5h16v2H2zm0 5h11v2H2z" />;
}

export function CloseIcon({ size = 16 }: { size?: number }) {
  return <PixelGlyph size={size} path="M3 3h2v2h2v2h2v2h2V7h2V5h2V3h2v2h-2v2h-2v2h-2v2h2v2h2v2h2v2h-2v-2h-2v-2h-2v-2H9v2H7v2H5v2H3v-2h2v-2h2v-2h2V9H7V7H5V5H3z" />;
}

export function SendIcon({ size = 16 }: { size?: number }) {
  return <PixelGlyph size={size} path="M9 3h2v2h2v2h2v2h2v2h-3V9h-3v9H9V9H6v2H3V9h2V7h2V5h2z" />;
}

export function NextIcon({ size = 16 }: { size?: number }) {
  return <PixelGlyph size={size} path="M11 3h2v2h2v2h2v2h2v2h-2v2h-2v2h-2v2h-2v-3h2v-3H1V9h12V6h-2z" />;
}

export function ReceiveIcon({ size = 16 }: { size?: number }) {
  return <PixelGlyph size={size} path="M9 2h2v9h3V9h3v2h-2v2h-2v2h-2v2H9v-2H7v-2H5v-2H3V9h3v2h3z" />;
}

export function RefreshIcon({ size = 16 }: { size?: number }) {
  return <PixelGlyph size={size} path="M6 2h8v2h2v2h2V2h2v8h-8V8h4V6h-2V4H6v2H4v8h2v2h8v-2h2v-2h2v4h-2v2H4v-2H2V4h4z" />;
}
