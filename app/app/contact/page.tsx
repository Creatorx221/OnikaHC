import { value } from '@/lib/website-schema';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { ContactView } from '@/components/public-pages/contact';

export const dynamic = 'force-dynamic';
export default async function Contact({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await searchParams;
  const initialType = typeof p.type === 'string' && ['general', 'bespoke', 'access'].includes(p.type) ? p.type : 'general';
  const initialTopic = typeof p.topic === 'string' ? p.topic : '';
  const website = await publicWebsite();
  return <WebsiteFrame data={website}><ContactView website={website} initialType={initialType} initialTopic={initialTopic} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['contact'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'Contact',
    description: value(section, 'intro') || value(section, 'description') || 'Contact',
    alternates: { canonical: '/contact' },
  };
}
