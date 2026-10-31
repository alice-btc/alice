import type { Metadata } from 'next';
import { PrivacyView, privacyMetadata } from '@/views/PrivacyView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return privacyMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <PrivacyView locale={await localeFrom(params)} />;
}
