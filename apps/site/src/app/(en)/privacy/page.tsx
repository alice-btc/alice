import { PrivacyView, privacyMetadata } from '@/views/PrivacyView';

export const metadata = privacyMetadata('en');

export default function PrivacyPage() {
  return <PrivacyView locale="en" />;
}
