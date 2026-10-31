import { VsChatGptView, vsChatGptMetadata } from '@/views/VsChatGptView';

export const metadata = vsChatGptMetadata('en');

export default function VsChatGptPage() {
  return <VsChatGptView locale="en" />;
}
