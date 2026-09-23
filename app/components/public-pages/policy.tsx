import { value, type Content } from '@/lib/website-schema';
import { SectionLabel } from '@/components/site';

export function PolicyView({ policyContent, fallback, isVisible }: { policyContent: Content | undefined; fallback: {title:string;intro:string;sections:ReadonlyArray<readonly [string,string]>}; isVisible:boolean }) {
  const title = (policyContent && value(policyContent, 'title')) || fallback.title;
  const intro = (policyContent && value(policyContent, 'intro')) || fallback.intro;
  const sections = (policyContent && Array.isArray(policyContent.sections)
    ? (policyContent.sections as { title: string; body: string }[])
    : fallback.sections.map(([h, t]) => ({ title: h, body: t })));

  return (
    <main id="main" className="container">
      <div className="policy">
        <div className="page-intro">
          <SectionLabel>
            {isVisible ? 'Website information' : 'Draft · Review required'}
          </SectionLabel>
          <h1>{title}</h1>
          <div className="notice" style={{ whiteSpace: 'pre-line' }}>
            {intro}
          </div>
        </div>
        {sections.map((s, idx) => (
          <section key={idx}>
            <h2>{s.title}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
