import { value } from '@/lib/website-schema';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { ServicesView } from '@/components/public-pages/services';
import { localeFromParams, localizeWebsite } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export default async function Services({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = localeFromParams(await searchParams);
  const website = localizeWebsite(await publicWebsite(), locale);
  return <WebsiteFrame data={website} locale={locale}><ServicesView website={website} locale={locale} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['services'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'Research services',
    description: value(section, 'intro') || value(section, 'description') || 'Research services',
    alternates: { canonical: '/services' },
  };
}
