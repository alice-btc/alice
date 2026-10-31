import { PricingView, pricingMetadata } from '@/views/PricingView';

export const metadata = pricingMetadata('en');

export default function PricingPage() {
  return <PricingView locale="en" />;
}
