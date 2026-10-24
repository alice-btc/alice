import type { Metadata } from 'next';
import { ExplorerPanel } from '@/components/ExplorerPanel';

const TITLE = 'Explorer - Alice';
const DESCRIPTION = 'Follow transactions, inspect blocks and understand the network, with a privacy lens.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { type: 'website', siteName: 'Alice', title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return <ExplorerPanel />;
}
