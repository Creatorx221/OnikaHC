import Link from '@/components/navigation';
import { ArrowUpRight } from 'lucide-react';
import { site } from '@/lib/site-config';
import { value, enabled, items, type Content } from '@/lib/website-schema';
import { SectionLabel, Newsletter } from '@/components/site';




export function ServicesView({ website }: { website: Record<string, Content> }) {
  const services = website.services;

  const eyebrow = (services && value(services, 'eyebrow')) || 'Research capabilities';
  const title = (services && value(services, 'title')) || 'Start with the question.\nBuild the understanding.';
  const intro =
    (services && value(services, 'intro')) ||
    'Focused research around the businesses, economic forces and market themes that matter to a decision.';
  const isVisible = services ? enabled(services, 'visible') : site.preview || site.capabilitiesApproved;
  const emptyTitle = (services && value(services, 'emptyTitle')) || 'Our research scope is being prepared.';
  const emptyIntro = (services && value(services, 'emptyIntro')) || 'Confirmed capabilities will be shared here when available.';
  const serviceList = (services && (items(services, 'items') as Content[]).filter((s) => s.visible !== false)) || [];

  return (
    <main id="main">
      <div className="container">
        <div className="page-intro">
          <SectionLabel>{eyebrow}</SectionLabel>
          <h1 style={{ whiteSpace: 'pre-line' }}>{title}</h1>
          <p className="lead">{intro}</p>
          {site.preview && (
            <div className="notice">
              <strong>Proposed capabilities.</strong> These service descriptions and intended audiences are for review.
              Scope and availability are to be confirmed.
            </div>
          )}
        </div>

        {isVisible ? (
          <div className="service-list">
            {serviceList.map((c, i) => (
              <section className="service-row" id={value(c, 'type') === 'Bespoke' ? 'bespoke' : undefined} key={value(c, 'title')}>
                <span className="coverage-index">0{i + 1}</span>
                <div>
                  <h2>{value(c, 'title')}</h2>
                  <p>{value(c, 'question') || value(c, 'short')}</p>
                  <Link
                    className="text-link"
                    href={
                      value(c, 'url') ||
                      '/contact?type=bespoke&topic=' + encodeURIComponent(value(c, 'title'))
                    }
                  >
                    {value(c, 'label') || 'Discuss this research'} <ArrowUpRight size={17} />
                  </Link>
                </div>
                <div>
                  {value(c, 'deliverable') && (
                    <>
                      <h4>Possible output</h4>
                      <p>{value(c, 'deliverable')}</p>
                    </>
                  )}
                  {value(c, 'audience') && (
                    <>
                      <h4>Intended audience</h4>
                      <p>{value(c, 'audience')}</p>
                    </>
                  )}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="editorial-empty">
            <h2>{emptyTitle}</h2>
            <p>{emptyIntro}</p>
          </div>
        )}

        {isVisible && (
          <section className="process">
            <SectionLabel>Bespoke research</SectionLabel>
            <h2>A scope agreed together.</h2>
            <div className="approach-grid">
              {[
                ['Initial discussion', 'Understand your question, context and intended use.'],
                ['Agreed scope', 'Agree the coverage, format, sources and practical constraints.'],
                ['Research', 'Examine the evidence and test the key assumptions.'],
                ['Delivery', 'Present the analysis and explain its limitations.'],
              ].map(([t, p], i) => (
                <div key={t}>
                  <span className="step-number">0{i + 1}</span>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <Newsletter policiesVisible={site.preview || site.policiesApproved} />
    </main>
  );
}
