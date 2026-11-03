import type { Metadata } from 'next';
import { AboutView, aboutMetadata } from '@/views/AboutView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return aboutMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <AboutView locale={await localeFrom(params)} />;
}
