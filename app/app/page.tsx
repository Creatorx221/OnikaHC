import { value } from '@/lib/website-schema';
export const dynamic = 'force-dynamic';
import { getResearch } from '@/lib/research-server';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { HomeView } from '@/components/public-pages/home';
export default async function Home() {
  const [reports, website] = await Promise.all([getResearch(), publicWebsite()]);
  return <WebsiteFrame data={website}><HomeView website={website} reports={reports} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['home'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'A clearer view of capital markets.',
    description: value(section, 'intro') || value(section, 'description') || 'A clearer view of capital markets.',
    alternates: { canonical: '/' },
  };
}
