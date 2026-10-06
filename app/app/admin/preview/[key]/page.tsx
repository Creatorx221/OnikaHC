import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireEditor } from '@/lib/cms-auth';
import { getContentRecord, publicWebsite } from '@/lib/website-store';
import { definitions } from '@/lib/website-schema';
import { WebsiteFrame } from '@/components/website-frame';
import { HomeView } from '@/components/public-pages/home';
import { AboutView } from '@/components/public-pages/about';
import { ServicesView } from '@/components/public-pages/services';
import { ContactView } from '@/components/public-pages/contact';
import { ResearchView } from '@/components/public-pages/research';
import { ResourcesView } from '@/components/public-pages/resources';
import { PolicyView } from '@/components/public-pages/policy';
import { getResearch } from '@/lib/research-server';
import { policies } from '@/lib/policies';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Saved draft preview',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default async function PreviewPage({ params }: { params: Promise<{key:string}> }) {
  try {
    await requireEditor();
  } catch {
    redirect('/admin');
  }

  const { key } = await params;
  if (!Object.hasOwn(definitions, key)) notFound();
  const [record, published, reports] = await Promise.all([
    getContentRecord(key), publicWebsite(), getResearch(),
  ]);
  const website = { ...published, [key]: record.draft };
  const page = ['settings','home','newsletter'].includes(key)
    ? <HomeView website={website} reports={reports} />
    : ['about','approach','team'].includes(key)
      ? <AboutView website={website} />
      : key === 'services'
        ? <ServicesView website={website} />
        : key === 'contact'
          ? <ContactView website={website} initialType="general" initialTopic="" />
          : key === 'research'
            ? <ResearchView website={website} reports={reports} initial={{q:'',type:'',topic:''}} />
            : key === 'resources'
              ? <ResourcesView website={website} />
              : Object.hasOwn(policies, key)
                ? <PolicyView policyContent={website[key]} fallback={policies[key as keyof typeof policies]} isVisible={website[key]?.visible === true} />
                : notFound();

  return <WebsiteFrame data={website} preview>
    <output className="preview-bar draft-preview-banner">
      Saved draft preview · {definitions[key].title} · Visible only to approved editors
    </output>
    {page}
  </WebsiteFrame>;
}
