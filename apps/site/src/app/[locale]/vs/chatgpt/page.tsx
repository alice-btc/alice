import type { Metadata } from 'next';
import { VsChatGptView, vsChatGptMetadata } from '@/views/VsChatGptView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return vsChatGptMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <VsChatGptView locale={await localeFrom(params)} />;
}
