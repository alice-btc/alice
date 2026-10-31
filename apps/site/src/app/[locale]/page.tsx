import type { Metadata } from 'next';
import { HomeView, homeMetadata } from '@/views/HomeView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return homeMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <HomeView locale={await localeFrom(params)} />;
}
