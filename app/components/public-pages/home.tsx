
import Link from '@/components/navigation';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { site } from '@/lib/site-config';
import { value, enabled, items } from '@/lib/website-schema';
import { ResearchRow, Newsletter, SectionLabel, Approach } from '@/components/site';

import type { Content } from '@/lib/website-schema';
import type { Research } from '@/lib/research';
import { t, type Locale } from '@/lib/i18n';

export function HomeView({ website, reports, locale = 'en' }: { website: Record<string, Content>; reports: Research[]; locale?: Locale }) {
  const home = website.home;
  const services = website.services;
  const approach = website.approach;

  const featured = reports[0];
  const second = reports[1] || featured;

  const eyebrow = value(home, 'eyebrow') || 'Perspective. Evidence. Understanding.';
  const title = value(home, 'title') || 'A clearer view of capital markets.';
  const intro =
    value(home, 'intro') ||
    'Company fundamentals. Economic forces. Structural change. Heuresis Capital brings them into focus through careful research and clear thinking.';
  const primaryLabel = value(home, 'primaryLabel') === 'Explore research' ? t(locale, 'Explore publications') : value(home, 'primaryLabel') || t(locale, 'Explore publications');
  const primaryUrl = value(home, 'primaryUrl') || '/research';
  const secondaryLabel = value(home, 'secondaryLabel') || 'Discuss your research needs';
  const secondaryUrl = value(home, 'secondaryUrl') || '/contact?type=bespoke';

  const showFeature = enabled(home, 'showFeature');
  const featureLabel = value(home, 'featureLabel') || 'The Heuresis perspective';
  const featureTitle = value(home, 'featureTitle') || 'Good questions. Considered answers.';
  const featureIntro =
    value(home, 'featureIntro') ||
    'Our first publications are in preparation. Discover the thinking behind Heuresis.';
  const featureLinkLabel = value(home, 'featureLinkLabel') || 'Our approach';
  const featureLinkUrl = value(home, 'featureLinkUrl') || '/about';

  const showResearch = enabled(home, 'showResearch');
  const researchLabel = value(home, 'researchLabel') || 'Ideas worth examining';
  const researchTitle = value(home, 'researchTitle') || 'Latest research';
  const emptyTitle = value(home, 'emptyTitle') || 'The first chapter is taking shape.';
  const emptyIntro =
    value(home, 'emptyIntro') ||
    'Our first research publications will appear here. In the meantime, explore our purpose.';

  const showCoverage = enabled(home, 'showCoverage') && enabled(services, 'visible');
  const showApproach = enabled(home, 'showApproach') && enabled(approach, 'visible');
  const showBespoke = enabled(home, 'showBespoke');
  const bespokeLabel = value(home, 'bespokeLabel') || 'A question of your own?';
  const bespokeTitle =
    value(home, 'bespokeTitle') || 'Research shaped around what you need to understand.';
  const bespokeIntro =
    value(home, 'bespokeIntro') ||
    'From company fundamentals to a sector’s changing economics, a well-defined question is the starting point for bespoke research.';
  const bespokeButton = value(home, 'bespokeButton') || 'Discuss a research project';
  const bespokeUrl = value(home, 'bespokeUrl') || '/contact?type=bespoke';

  const serviceItems = (services && items(services, 'items')) || [];
  const visibleServices = serviceItems.filter((s) => s.visible !== false);

  return (
    <main id="main">
      <section className="container hero">
        <div className="hero-copy">
          <SectionLabel>{eyebrow}</SectionLabel>
          <h1 style={{ whiteSpace: 'pre-line' }}>{title}</h1>
          <p className="lead">{intro}</p>
          <div className="actions">
            <Link className="button" href={primaryUrl}>
              {primaryLabel} <ArrowRight size={17} />
            </Link>
            <Link className="text-link" href={secondaryUrl}>
              {secondaryLabel} <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        {showFeature && (
          <aside className="hero-feature">
            <div className="feature-top">
              <span className="eyebrow">{featured ? t(locale, 'In focus') : featureLabel}</span>
              <span className="small">
                {featured?.status === 'sample' ? t(locale, 'Illustrative sample') : t(locale, 'Research & ideas')}
              </span>
            </div>
            {featured ? (
              <>
                <div className="feature-number" aria-hidden="true">
                  01<span>/ {t(locale, 'Research perspective')}</span>
                </div>
                <span className="eyebrow">{featured.type}</span>
                <h2>
                  <Link href={'/research/' + featured.slug}>{featured.title}</Link>
                </h2>
                <p>{featured.summary}</p>
                <Link className="text-link" href={'/research/' + featured.slug}>
                  {t(locale, 'Read the perspective')} <ArrowUpRight size={18} />
                </Link>
              </>
            ) : (
              <>
                <img className="brand-symbol" src="/symbol.svg" alt="" />
                <h2 style={{ whiteSpace: 'pre-line' }}>{featureTitle}</h2>
                <p>{featureIntro}</p>
                <Link className="text-link" href={featureLinkUrl}>
                  {featureLinkLabel} <ArrowUpRight size={18} />
                </Link>
              </>
            )}
            <div className="feature-bottom">
              <span>HEURESIS CAPITAL</span>
              <span aria-hidden="true">↗</span>
            </div>
          </aside>
        )}
      </section>

      {showResearch && (
        <section className="research-home container section">
          <div className="section-heading">
            <div>
              <SectionLabel>{researchLabel}</SectionLabel>
              <h2>{researchTitle}</h2>
            </div>
            <Link className="text-link" href="/research">
              {t(locale, 'View all research')} <ArrowRight size={17} />
            </Link>
          </div>
          {reports.length ? (
            <div className="latest-grid">
              <article className="latest-feature">
                <span className="eyebrow">{second.type}</span>
                <h3>
                  <Link href={'/research/' + second.slug}>{second.title}</Link>
                </h3>
                <p>{second.summary}</p>
                <div className="row-meta">
                  {second.status === 'sample' ? t(locale, 'Illustrative sample') : second.date} ·{' '}
                  {second.readingMinutes} {t(locale, 'min read')}
                </div>
                <Link
                  className="circle-link"
                  href={'/research/' + second.slug}
                  aria-label={'Read ' + second.title}
                >
                  <ArrowUpRight size={21} />
                </Link>
              </article>
              <div>
                {reports
                  .filter((r) => r.slug !== second.slug)
                  .slice(0, 3)
                  .map((r) => (
                    <ResearchRow key={r.slug} report={r} compact />
                  ))}
              </div>
            </div>
          ) : (
            <div className="editorial-empty">
              <h3>{emptyTitle}</h3>
              <p>{emptyIntro}</p>
              <Link className="text-link" href="/about">
                {t(locale, 'About Heuresis')} <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
      )}

      {showCoverage && visibleServices.length > 0 && (
        <section className="warm section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionLabel>{t(locale, 'Connecting the picture')}</SectionLabel>
                <h2>{t(locale, 'Research across the market')}</h2>
              </div>
              <p className="section-note">{t(locale, 'Explore our research areas.')}</p>
            </div>
            <div className="coverage-grid">
              {visibleServices.slice(0, 4).map((c, i) => (
                <Link
                  className="coverage-item"
                  href={'/research?type=' + encodeURIComponent(value(c, 'type'))}
                  key={value(c, 'title')}
                >
                  <span className="coverage-index">0{i + 1}</span>
                  <h3>
                    {value(c, 'title')} <ArrowUpRight size={18} />
                  </h3>
                  <p>{value(c, 'short')}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {showApproach && (
        <section className="container section">
          <div className="approach-heading">
            <div>
              <SectionLabel>{(approach && value(approach, 'eyebrow')) || 'The way we think'}</SectionLabel>
              <h2 style={{ whiteSpace: 'pre-line' }}>
                {(approach && value(approach, 'title')) || 'Make the reasoning visible.'}
              </h2>
            </div>
            <div>
              <p>
                {(approach && value(approach, 'intro')) ||
                  'From a company’s earnings to a shift in market conditions, useful research makes the reasoning visible.'}
              </p>
              <Link className="text-link" href="/about#approach">
                {t(locale, 'Explore our approach')} <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
          <Approach />
        </section>
      )}

      {showBespoke && (
        <section className="bespoke-band">
          <div className="container bespoke-inner">
            <div>
              <SectionLabel>{bespokeLabel}</SectionLabel>
              <h2 style={{ whiteSpace: 'pre-line' }}>{bespokeTitle}</h2>
            </div>
            <div>
              <p>{bespokeIntro}</p>
              <Link className="button light-button" href={bespokeUrl}>
                {bespokeButton} <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Newsletter policiesVisible={site.preview || site.policiesApproved} />
    </main>
  );
}
