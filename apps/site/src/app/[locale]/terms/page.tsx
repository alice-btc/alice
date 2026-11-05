import type { Metadata } from 'next';
import { TermsView, termsMetadata } from '@/views/TermsView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return termsMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <TermsView locale={await localeFrom(params)} />;
}
