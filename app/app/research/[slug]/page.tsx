export const dynamic = 'force-dynamic';

import Link from '@/components/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { findResearch, getResearch } from '@/lib/research-server';
import { publicWebsite } from '@/lib/website-store';
import { WebsiteFrame } from '@/components/website-frame';
import { site } from '@/lib/site-config';
import { ResearchRow, ShareTools } from '@/components/site';
import { ScenarioChart } from '@/components/scenario-chart';
import { hasResearchTranslation, localeFromParams, localizeResearch, localizeWebsite, t } from '@/lib/i18n';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const locale = localeFromParams(await searchParams);
  const original = await findResearch(slug);
  if (!original) return { title: 'Research not found', robots: { index: false, follow: false } };
  const report = localizeResearch(original, locale);
  const path = '/research/' + report.slug;
  return {
    title: report.title,
    description: report.summary,
    alternates: { canonical: locale === 'en' ? path : path + '?lang=' + locale },
    robots: report.status === 'sample' || site.preview ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { type: 'article', title: report.title, description: report.summary, url: site.domain + path + (locale === 'en' ? '' : '?lang=' + locale) },
  };
}

export default async function Article({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const locale = localeFromParams(await searchParams);
  const original = await findResearch(slug);
  if (!original) notFound();
  const report = localizeResearch(original, locale);
  const related = (await getResearch())
    .filter((item) => item.slug !== slug)
    .sort((a, b) => Number(b.type === report.type) - Number(a.type === report.type))
    .slice(0, 2)
    .map((item) => localizeResearch(item, locale));
  const website = localizeWebsite(await publicWebsite(), locale);

  return <WebsiteFrame data={website} locale={locale}>
    <main id="main" className="container">
      <header className="article-header">
        <Link className="breadcrumb" href="/research"><ArrowLeft size={14} /> {t(locale, 'Research library')}</Link>
        <div className="row-top"><span className="eyebrow">{t(locale, report.type)}</span>{report.status === 'sample' && <span className="sample-label">{t(locale, 'Illustrative sample')}</span>}</div>
        <h1>{report.title}</h1>
        <p className="lead">{report.summary}</p>
        {locale !== 'en' && !hasResearchTranslation(original, locale) && <output className="notice block">{t(locale, 'This publication is currently available in English only.')}</output>}
        <div className="article-metadata">
          {report.author && <span>{report.author}</span>}
          {report.date && <time dateTime={report.date}>{report.date}</time>}
          {report.updated && <span>{t(locale, 'Updated')} {report.updated}</span>}
          <span>{report.readingMinutes} {t(locale, 'min read')}</span>
          <span>{report.topics.map((topic) => t(locale, topic)).join(' / ')}</span>
        </div>
        {report.status === 'sample' && <div className="notice">{t(locale, 'An original sample for the private preview. No actual issuer, current market data or investment recommendation. No publication date or analyst attribution is implied.')}</div>}
        <ShareTools />
        {report.pdf && <a className="text-link" href={report.pdf} download><Download size={16} />{t(locale, 'Download report PDF')}</a>}
      </header>
      <div className="article-layout">
        <aside className="toc"><p>{t(locale, 'In this perspective')}</p><nav aria-label={t(locale, 'Article contents')}>
          {report.sections.map((section) => <a href={'#' + section.id} key={section.id}>{section.title}</a>)}
          <a href="#disclosures">{t(locale, 'Sources & disclosures')}</a>
        </nav></aside>
        <article className="article-body">
          <section className="takeaways"><h2>{t(locale, 'Three key takeaways')}</h2><ol>{report.takeaways.map((takeaway, index) => <li key={index}>{takeaway}</li>)}</ol></section>
          {report.sections.map((section) => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.chart && <ScenarioChart />}</section>)}
          <section className="supporting-materials" hidden={!report.materials?.length}><h2>{t(locale, 'Supporting materials')}</h2>{report.materials?.map((material) => <a className="material-download" key={material.id} href={material.url} download><Download size={18} /><span>{material.name}<small>{(material.size / 1024).toFixed(0)} KB</small></span></a>)}</section>
          <section id="disclosures" className="disclosure"><h2>{t(locale, 'Sources, methodology & disclosures')}</h2><ul className="sources">{report.sources.map((source) => <li key={source.label}>{source.url ? <a href={source.url} rel="noopener noreferrer" target="_blank">{source.label}</a> : source.label}</li>)}</ul><p>{report.disclosures}</p>{(site.preview || site.policiesApproved) && <Link className="text-link" href="/research-disclosures">{t(locale, 'Read the research disclosures')}</Link>}</section>
        </article>
      </div>
      <section className="related"><h2>{t(locale, 'Continue exploring')}</h2>{related.map((item) => <ResearchRow key={item.slug} report={item} />)}</section>
      {report.status === 'published' && report.author && report.date && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: report.title, datePublished: report.date, author: { '@type': 'Person', name: report.author }, publisher: { '@type': 'Organization', name: site.name }, url: site.domain + '/research/' + report.slug }).replace(/</g, '\\u003c') }} />}
    </main>
  </WebsiteFrame>;
}
