import { HomeView, homeMetadata } from '@/views/HomeView';

export const metadata = homeMetadata('en');

export default function HomePage() {
  return <HomeView locale="en" />;
}
