import { value } from '@/lib/website-schema';
export const dynamic = 'force-dynamic';
import { getResearch } from '@/lib/research-server';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { HomeView } from '@/components/public-pages/home';
import { localeFromParams, localizeResearch, localizeWebsite } from '@/lib/i18n';
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = localeFromParams(await searchParams);
  const [reports, website] = await Promise.all([getResearch(), publicWebsite()]);
  const content = localizeWebsite(website, locale);
  return <WebsiteFrame data={content} locale={locale}><HomeView website={content} reports={reports.map((report) => localizeResearch(report, locale))} locale={locale} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['home'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'A clearer view of capital markets.',
    description: value(section, 'intro') || value(section, 'description') || 'A clearer view of capital markets.',
    alternates: { canonical: '/' },
  };
}
