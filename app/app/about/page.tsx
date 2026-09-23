import { value } from '@/lib/website-schema';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { AboutView } from '@/components/public-pages/about';

export const dynamic = 'force-dynamic';
export default async function About() {
  const website = await publicWebsite();
  return <WebsiteFrame data={website}><AboutView website={website} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['about'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'About Heuresis',
    description: value(section, 'intro') || value(section, 'description') || 'About Heuresis',
    alternates: { canonical: '/about' },
  };
}
