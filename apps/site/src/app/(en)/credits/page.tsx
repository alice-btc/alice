import { CreditsView, creditsMetadata } from '@/views/CreditsView';

export const metadata = creditsMetadata('en');

export default function CreditsPage() {
  return <CreditsView locale="en" />;
}
