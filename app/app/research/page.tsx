import { value } from '@/lib/website-schema';
import { getResearch } from '@/lib/research-server';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { ResearchView } from '@/components/public-pages/research';

export const dynamic = 'force-dynamic';
export default async function ResearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await searchParams;
  const val = (k: string) => typeof p[k] === 'string' ? p[k] as string : '';
  const [reports, website] = await Promise.all([getResearch(), publicWebsite()]);
  return <WebsiteFrame data={website}><ResearchView website={website} reports={reports} initial={{q:val('q'),type:val('type'),topic:val('topic')}} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['research'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'Research library',
    description: value(section, 'intro') || value(section, 'description') || 'Research library',
    alternates: { canonical: '/research' },
  };
}
