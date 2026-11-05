import { TermsView, termsMetadata } from '@/views/TermsView';

export const metadata = termsMetadata('en');

export default function TermsPage() {
  return <TermsView locale="en" />;
}
