import Link from '@/components/navigation';
import { ArrowUpRight } from 'lucide-react';
import { site } from '@/lib/site-config';
import { value, enabled, items, type Content } from '@/lib/website-schema';
import { SectionLabel, Approach, Newsletter } from '@/components/site';
import { t, type Locale } from '@/lib/i18n';




export function AboutView({ website, locale = 'en' }: { website: Record<string, Content>; locale?: Locale }) {
  const about = website.about;
  const approach = website.approach;
  const team = website.team;

  const eyebrow = (about && value(about, 'eyebrow')) || 'About Heuresis';
  const title = (about && value(about, 'title')) || 'A considered perspective.\nA clearer understanding.';
  const intro =
    (about && value(about, 'intro')) ||
    'Heuresis Capital is a new capital markets research firm founded by a group of friends.';
  const quote =
    (about && value(about, 'quote')) || 'Good research gives a question the attention it deserves.';
  const paragraphs = (about && items(about, 'paragraphs')) || [
    {
      text: 'Our purpose is to make companies, economies and market themes easier to understand through careful analysis and clear writing.',
    },
    {
      text: 'We are building a research publication and a place to begin conversations about specific analytical questions.',
    },
  ];
  const customSections = (about && (items(about, 'sections') as { title: string; body: string }[])) || [];

  const showApproach = approach ? enabled(approach, 'visible') : site.preview || site.approachApproved;
  const approachEyebrow = (approach && value(approach, 'eyebrow')) || 'The way we think';
  const approachTitle = (approach && value(approach, 'title')) || 'Make the reasoning visible.';
  const approachIntro =
    (approach && value(approach, 'intro')) ||
    'Define the question. Show the evidence. Explain where assumptions begin and what could change the conclusion.';

  const showTeam = team ? enabled(team, 'visible') : true;
  const teamEyebrow = (team && value(team, 'eyebrow')) || t(locale, 'Our people');
  const teamTitle = (team && value(team, 'title')) || t(locale, 'The team');
  const teamIntro = team && value(team, 'intro');
  const teamMembers = (team && (items(team, 'members') as Content[]).filter((m) => m.visible !== false)) || [];

  return (
    <main id="main">
      <div className="container">
        <div className="page-intro">
          <SectionLabel>{eyebrow}</SectionLabel>
          <h1 style={{ whiteSpace: 'pre-line' }}>{title}</h1>
          <p className="lead">{intro}</p>
        </div>
        <section className="about-lead">
          {quote && (
            <div className="about-statement">
              <p>{quote}</p>
            </div>
          )}
          <div>
            {paragraphs.map((p, i) => (
              <p key={i}>{value(p, 'text')}</p>
            ))}
            {customSections.map((s, i) => (
              <div key={i} style={{ marginTop: 24 }}>
                <h3>{s.title}</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{s.body}</p>
              </div>
            ))}
            {site.preview && (
              <p className="small">
                Purpose and positioning are proposed copy for founder review. Geographic coverage and service
                availability have not yet been confirmed.
              </p>
            )}
          </div>
        </section>
      </div>

      {showApproach && (
        <section id="approach" className="warm section">
          <div className="container">
            <SectionLabel>{approachEyebrow}</SectionLabel>
            <h2 style={{ whiteSpace: 'pre-line' }}>{approachTitle}</h2>
            <p className="lead">{approachIntro}</p>
            {site.preview && (
              <p className="notice">
                The sequence below is a proposed editorial approach, not a claim of an established or audited process.
              </p>
            )}
            <Approach />
            {(site.preview || site.policiesApproved) && (
              <Link className="text-link" style={{ marginTop: 35 }} href="/research-disclosures">
                {t(locale, 'Methodology and research disclosures')}
              </Link>
            )}
          </div>
        </section>
      )}

      {showTeam && (
        <section id="team" className="container section">
          <div className="section-heading">
            <div>
              <SectionLabel>{teamEyebrow}</SectionLabel>
              <h2>{teamTitle}</h2>
            </div>
            {teamIntro && <p className="section-note">{teamIntro}</p>}
          </div>
          {teamMembers.length > 0 ? (
            <div className="team-grid">
              {teamMembers.map((m, idx) => (
                <article className="team-card" key={idx}>
                  {value(m, 'photo') && (
                    <div className="team-photo-wrap">
                      <img
                        src={value(m, 'photo')}
                        alt={`${value(m, 'name')} — ${value(m, 'role')}`}
                        className="team-photo"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="team-info">
                    <h3>{value(m, 'name')}</h3>
                    {value(m, 'role') && <p className="team-role">{value(m, 'role')}</p>}
                    {value(m, 'credentials') && <p className="team-credentials">{value(m, 'credentials')}</p>}
                    {value(m, 'bio') && <p className="team-bio">{value(m, 'bio')}</p>}
                    <div className="team-links">
                      {value(m, 'email') && (
                        <a href={`mailto:${value(m, 'email')}`} className="team-email">
                          {value(m, 'email')}
                        </a>
                      )}
                      {value(m, 'linkedin') && (
                        <a
                          href={value(m, 'linkedin')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-link"
                        >
                          {t(locale, 'Profile')} <ArrowUpRight size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="editorial-empty">
              <p>{t(locale, 'Our team profiles will appear here once published.')}</p>
            </div>
          )}
        </section>
      )}

      <Newsletter policiesVisible={site.preview || site.policiesApproved} />
    </main>
  );
}
