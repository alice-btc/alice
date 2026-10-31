import type { Metadata } from 'next';
import { MemoryView, memoryMetadata } from '@/views/MemoryView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return memoryMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <MemoryView locale={await localeFrom(params)} />;
}
