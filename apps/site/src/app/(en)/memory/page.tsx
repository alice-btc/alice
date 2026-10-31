import { MemoryView, memoryMetadata } from '@/views/MemoryView';

export const metadata = memoryMetadata('en');

export default function MemoryPage() {
  return <MemoryView locale="en" />;
}
