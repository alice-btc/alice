import type { Metadata } from 'next';
import { CreditsView, creditsMetadata } from '@/views/CreditsView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return creditsMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <CreditsView locale={await localeFrom(params)} />;
}
