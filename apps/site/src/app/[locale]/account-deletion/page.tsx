import type { Metadata } from 'next';
import { AccountDeletionView, accountDeletionMetadata } from '@/views/AccountDeletionView';
import { localeFrom, type LocaleParams } from '@/i18n/params';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return accountDeletionMetadata(await localeFrom(params));
}

export default async function Page({ params }: LocaleParams) {
  return <AccountDeletionView locale={await localeFrom(params)} />;
}
