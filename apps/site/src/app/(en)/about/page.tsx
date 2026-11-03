import { AboutView, aboutMetadata } from '@/views/AboutView';

export const metadata = aboutMetadata('en');

export default function AboutPage() {
  return <AboutView locale="en" />;
}
