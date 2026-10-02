import { value } from '@/lib/website-schema';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { AboutView } from '@/components/public-pages/about';
import { localeFromParams, localizeWebsite } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export default async function About({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = localeFromParams(await searchParams);
  const website = localizeWebsite(await publicWebsite(), locale);
  return <WebsiteFrame data={website} locale={locale}><AboutView website={website} locale={locale} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['about'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'About Heuresis',
    description: value(section, 'intro') || value(section, 'description') || 'About Heuresis',
    alternates: { canonical: '/about' },
  };
}
