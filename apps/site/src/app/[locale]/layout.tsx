import type { Metadata, Viewport } from 'next';
import { RootDocument } from '@/components/RootDocument';
import { rootMetadata } from '@/i18n/metadata';
import { localeFrom, prefixedLocaleParams, type LocaleParams } from '@/i18n/params';
import '../globals.css';

// Every language but English, under its own prefix (/fr/...). The pages
// below are the same views as the English ones, given this segment's locale.

export const dynamicParams = false;

export function generateStaticParams() {
  return prefixedLocaleParams();
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return rootMetadata(await localeFrom(params));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b1016',
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  return <RootDocument locale={await localeFrom(params)}>{children}</RootDocument>;
}
