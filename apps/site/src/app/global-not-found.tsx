import type { Metadata, Viewport } from 'next';
import { RootDocument } from '@/components/RootDocument';
import { rootMetadata } from '@/i18n/metadata';
import './globals.css';

// The one 404 for every URL the export does not have. With a root layout per
// language there is no single layout left for Next's default not-found page,
// which then shipped with no <html lang>, no styles and no metadataBase; this
// file is the documented replacement (experimental.globalNotFound). One
// static 404.html serves every language, so it stays in English.

export const metadata: Metadata = {
  ...rootMetadata('en'),
  title: '404: This page could not be found.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b1016',
};

export default function GlobalNotFound() {
  return (
    <RootDocument locale="en">
      <main id="main" className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-5 py-16">
        <h1 className="text-4xl font-semibold sm:text-5xl">404</h1>
        <p className="mt-4 text-lg text-[var(--alice-text)]">This page could not be found.</p>
      </main>
    </RootDocument>
  );
}
