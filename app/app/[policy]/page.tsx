import { notFound } from 'next/navigation';
import { site } from '@/lib/site-config';
import { policies } from '@/lib/policies';
import { publicWebsite } from '@/lib/website-store';
import { value, enabled } from '@/lib/website-schema';
import { SectionLabel } from '@/components/site';

function getPolicy(p: string) {
  return Object.prototype.hasOwnProperty.call(policies, p)
    ? policies[p as keyof typeof policies]
    : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  const p = getPolicy(policy);
  const website = await publicWebsite();
  const policyContent = website[policy];

  const title = (policyContent && value(policyContent, 'title')) || p?.title || 'Page not found';
  const intro = (policyContent && value(policyContent, 'intro')) || p?.intro;
  const isVisible = policyContent ? enabled(policyContent, 'visible') : site.preview || site.policiesApproved;

  return {
    title,
    description: intro,
    alternates: { canonical: '/' + policy },
    robots: !isVisible ? { index: false, follow: false } : { index: true, follow: true },
  };
}

import { WebsiteFrame } from '@/components/website-frame';
import { PolicyView } from '@/components/public-pages/policy';
export default async function Policy({ params }: { params: Promise<{policy:string}> }) {
  const { policy } = await params;
  const fallback = getPolicy(policy);
  if (!fallback) notFound();
  const website = await publicWebsite();
  const policyContent = website[policy];
  const isVisible = policyContent ? enabled(policyContent, 'visible') : site.preview || site.policiesApproved;
  if (!isVisible && !site.preview) notFound();
  return <WebsiteFrame data={website}><PolicyView policyContent={policyContent} fallback={fallback} isVisible={isVisible} /></WebsiteFrame>;
}
