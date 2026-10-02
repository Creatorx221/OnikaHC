import { value } from '@/lib/website-schema';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { ResourcesView } from '@/components/public-pages/resources';
import { enabled } from '@/lib/website-schema';
import { notFound } from 'next/navigation';
import { localeFromParams, localizeWebsite } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export default async function Resources({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = localeFromParams(await searchParams);
  const website = localizeWebsite(await publicWebsite(), locale);
  const resources = website.resources;
  if (!resources || !enabled(resources, 'visible')) notFound();
  return <WebsiteFrame data={website} locale={locale}><ResourcesView website={website} locale={locale} /></WebsiteFrame>;
}

export async function generateMetadata() {
  const section = (await publicWebsite())['resources'];
  return {
    title: value(section, 'title').replace(/\s+/g, ' ').trim() || 'Documents & resources',
    description: value(section, 'intro') || value(section, 'description') || 'Documents & resources',
    alternates: { canonical: '/resources' },
  };
}
