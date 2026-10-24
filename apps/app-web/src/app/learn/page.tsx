import type { Metadata } from 'next';
import { LearnPanel } from '@/components/LearnPanel';

const TITLE = 'Learn - Alice';
const DESCRIPTION = 'Bitcoin courses and tutorials, at your own pace, with Alice to explain them.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { type: 'website', siteName: 'Alice', title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function LearnPage() {
  return <LearnPanel />;
}
