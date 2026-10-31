import { TrustView, trustMetadata } from '@/views/TrustView';

export const metadata = trustMetadata('en');

export default function TrustPage() {
  return <TrustView locale="en" />;
}
