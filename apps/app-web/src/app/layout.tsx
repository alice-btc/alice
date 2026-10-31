import type { Metadata, Viewport } from 'next';
import { ChatProviderWrapper } from '@/lib/chat-provider';
import { LanguageProvider } from '@/i18n';
import './globals.css';

const DESCRIPTION =
  'Alice is a Bitcoin education AI companion that helps you learn about Bitcoin, privacy, and self-sovereignty in a friendly, accessible way.';

// The preview image of each section is the opengraph-image.png next to its
// page, rendered by scripts/generate-og.mjs; Next adds it to these tags.
export const metadata: Metadata = {
  metadataBase: new URL('https://app.alicebtc.com'),
  title: 'Alice - Your Bitcoin Companion',
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Alice',
    title: 'Alice - Your Bitcoin Companion',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alice - Your Bitcoin Companion',
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/alice-symbol.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/alice-symbol.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d1117',
  // iOS zooms into a field whose text is under 16px when it takes focus and
  // stays zoomed (the Explorer and Learn searches). The iOS app build caps the
  // scale; Tauri sets TAURI_ENV_PLATFORM while it runs the export. Alice Web
  // and the other apps keep the browser's own zoom.
  ...(process.env.TAURI_ENV_PLATFORM === 'ios' ? { maximumScale: 1 } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `lang` is English in the static export; LanguageProvider sets the app
    // language on the client before the first paint.
    <html lang="en" className="dark">
      <body className="bg-[var(--alice-bg)]">
        <LanguageProvider>
          <ChatProviderWrapper>{children}</ChatProviderWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
