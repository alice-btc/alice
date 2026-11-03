import { AccountDeletionView, accountDeletionMetadata } from '@/views/AccountDeletionView';

export const metadata = accountDeletionMetadata('en');

export default function AccountDeletionPage() {
  return <AccountDeletionView locale="en" />;
}
