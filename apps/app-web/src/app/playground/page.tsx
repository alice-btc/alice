import type { Metadata } from 'next';
import { PlaygroundPanel } from '@/components/PlaygroundPanel';

const TITLE = 'Playground - Alice';
const DESCRIPTION = 'A real Bitcoin wallet on a network where coins are free and worthless. Make every mistake here.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { type: 'website', siteName: 'Alice', title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return <PlaygroundPanel />;
}
