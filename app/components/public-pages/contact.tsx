import { site } from '@/lib/site-config';
import { value, items, type Content } from '@/lib/website-schema';
import { SectionLabel } from '@/components/site';
import { EnquiryForm } from '@/components/enquiry-form';
import { t, type Locale } from '@/lib/i18n';




export function ContactView({ website, initialType, initialTopic, locale = 'en' }: { website: Record<string, Content>; initialType: string; initialTopic: string; locale?: Locale }) {
  const contact = website.contact;
  const settings = website.settings;

  const eyebrow = (contact && value(contact, 'eyebrow')) || 'Begin a conversation';
  const title = (contact && value(contact, 'title')) || 'What would you like\nto understand?';
  const intro =
    (contact && value(contact, 'intro')) ||
    'Share the question behind your research needs.\nA focused conversation is a useful place to begin.';
  const asideTitle = (contact && value(contact, 'asideTitle')) || 'A little context goes a long way.';
  const asideIntro =
    (contact && value(contact, 'asideIntro')) || 'For a bespoke research discussion, it helps to consider:';
  const prompts = (contact && (items(contact, 'prompts') as Content[])) || [
    { text: 'The analytical question or decision.' },
    { text: 'The companies, sector or market involved.' },
    { text: 'How you intend to use the research.' },
    { text: 'Any timing or scope constraints.' },
  ];
  const formTitle = (contact && value(contact, 'formTitle')) || 'Start with your question.';
  const formIntro =
    (contact && value(contact, 'formIntro')) ||
    'Prepare your message below, then open it in your email app to review and send.';
  const contactEmail = (settings && value(settings, 'email')) || site.contactEmail;

  return (
    <main id="main" className="container">
      <div className="page-intro">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 style={{ whiteSpace: 'pre-line' }}>{title}</h1>
        <p className="lead" style={{ whiteSpace: 'pre-line' }}>
          {intro}
        </p>
      </div>
      <div className="contact-grid">
        <aside className="contact-aside">
          <h2>{asideTitle}</h2>
          <p>{asideIntro}</p>
          <ul>
            {prompts.map((item, i) => (
              <li key={i}>{value(item, 'text')}</li>
            ))}
          </ul>
          <div className="contact-direct">
            <span className="eyebrow">{t(locale, 'Contact Heuresis Capital')}</span>
            <a href={'mailto:' + contactEmail}>{contactEmail}</a>
            <p>{t(locale, 'Prefer to write directly? Send your question to our team.')}</p>
          </div>
        </aside>
        <EnquiryForm
          policiesVisible={site.preview || site.policiesApproved}
          initialType={initialType}
          initialTopic={initialTopic}
          formTitle={formTitle}
          formIntro={formIntro}
        />
      </div>
    </main>
  );
}
