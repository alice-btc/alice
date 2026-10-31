import type { Metadata } from 'next';
import { PricingView, pricingMetadata } from '@/views/PricingView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pricingMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <PricingView locale={await localeFrom(params)} />;
}
