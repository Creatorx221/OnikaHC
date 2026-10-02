
import { Download } from 'lucide-react';
import { value, items, type Content } from '@/lib/website-schema';
import { SectionLabel, Newsletter } from '@/components/site';
import { site } from '@/lib/site-config';
import { t, type Locale } from '@/lib/i18n';




export function ResourcesView({ website, locale = 'en' }: { website: Record<string, Content>; locale?: Locale }) {
  const resources = website.resources;
  const eyebrow = (resources && value(resources, 'eyebrow')) || 'Supporting materials';
  const title = (resources && value(resources, 'title')) || 'Documents & resources';
  const intro =
    (resources && value(resources, 'intro')) ||
    'Download research materials and reference documents.';
  const documents = (resources && (items(resources, 'documents') as Content[]).filter((d) => d.visible !== false && value(d, 'file'))) || [];

  return (
    <main id="main" className="container">
      <div className="page-intro">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1>{title}</h1>
        {intro && <p className="lead">{intro}</p>}
      </div>
      {documents.length > 0 ? (
        <div className="resources-list">
          {documents.map((doc, idx) => (
            <article className="resource-item" key={idx}>
              <div className="resource-info">
                {value(doc, 'category') && <span className="eyebrow">{value(doc, 'category')}</span>}
                <h2>{value(doc, 'title')}</h2>
                {value(doc, 'description') && <p>{value(doc, 'description')}</p>}
              </div>
              <a
                className="button resource-download-btn"
                href={value(doc, 'file')}
                download
              >
                <Download size={18} />
                {t(locale, 'Download document')}
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="editorial-empty">
          <h2>{t(locale, 'No documents currently published.')}</h2>
          <p>{t(locale, 'Published materials and reports will be made available here.')}</p>
        </div>
      )}
      <Newsletter policiesVisible={site.preview || site.policiesApproved} />
    </main>
  );
}
