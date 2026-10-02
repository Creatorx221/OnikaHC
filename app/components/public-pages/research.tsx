
import { site } from '@/lib/site-config';
import { value } from '@/lib/website-schema';
import { SectionLabel } from '@/components/site';
import { Library } from '@/components/library';



import type { Content } from '@/lib/website-schema';
import type { Research } from '@/lib/research';
import type { Locale } from '@/lib/i18n';

export function ResearchView({ website, reports, initial, locale = 'en' }: { website: Record<string, Content>; reports: Research[]; initial: {q: string;type: string;topic: string}; locale?: Locale }) {
  const research = website.research;

  const eyebrow = (research && value(research, 'eyebrow')) || 'The research library';
  const title = (research && value(research, 'title')) || 'Explore the thinking.';
  const intro =
    (research && value(research, 'intro')) ||
    'Perspectives that look beneath the headline.\nFind a question, follow the evidence, form a clearer view.';

  return (
    <main id="main" className="container">
      <div className="page-intro">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 style={{ whiteSpace: 'pre-line' }}>{title}</h1>
        <p className="lead" style={{ whiteSpace: 'pre-line' }}>
          {intro}
        </p>
        {site.preview && (
          <div className="notice">
            <strong>Illustrative research.</strong> These six illustrative samples demonstrate the reading experience.
            They are not published research or current investment recommendations.
          </div>
        )}
      </div>
      <Library items={reports} initial={initial} locale={locale} />
    </main>
  );
}
