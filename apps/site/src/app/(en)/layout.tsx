import type { Metadata, Viewport } from 'next';
import { RootDocument } from '@/components/RootDocument';
import { rootMetadata } from '@/i18n/metadata';
import '../globals.css';

// English, served at the root with no prefix. Every other language has its
// own root layout under app/[locale], so each export carries its own
// <html lang>.

export const metadata: Metadata = rootMetadata('en');

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b1016',
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
