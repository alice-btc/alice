import type { Metadata } from 'next';
import { TrustView, trustMetadata } from '@/views/TrustView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return trustMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <TrustView locale={await localeFrom(params)} />;
}
