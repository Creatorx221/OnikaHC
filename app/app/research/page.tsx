import { value } from '@/lib/website-schema';
import { getResearch } from '@/lib/research-server';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { ResearchView } from '@/components/public-pages/research';
import { localeFromParams, localizeResearch, localizeWebsite } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export default async function ResearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await searchParams;
  const locale = localeFromParams(p);
  const val = (k: string) => typeof p[k] === 'string' ? p[k] as string : '';
  const [reports, website] = await Promise.all([getResearch(), publicWebsite()]);
  const content = localizeWebsite(website, locale);
  return <WebsiteFrame data={content} locale={locale}><ResearchView website={content} reports={reports.map((report) => localizeResearch(report, locale))} initial={{q:val('q'),type:val('type'),topic:val('topic')}} locale={locale} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['research'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'Research library',
    description: value(section, 'intro') || value(section, 'description') || 'Research library',
    alternates: { canonical: '/research' },
  };
}
