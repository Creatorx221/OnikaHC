import { value } from '@/lib/website-schema';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { ServicesView } from '@/components/public-pages/services';

export const dynamic = 'force-dynamic';
export default async function Services() {
  const website = await publicWebsite();
  return <WebsiteFrame data={website}><ServicesView website={website} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['services'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'Research services',
    description: value(section, 'intro') || value(section, 'description') || 'Research services',
    alternates: { canonical: '/services' },
  };
}
