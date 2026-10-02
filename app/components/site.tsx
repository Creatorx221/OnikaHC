'use client';

import Link from '@/components/navigation';
import { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, Mail, Copy, Check, Printer } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { brand, resolveBrandLogo } from '@/lib/brand';
import { site } from '@/lib/site-config';
import { useWebsite, useWebsiteLanguage } from '@/components/website-context';
import { value, items } from '@/lib/website-schema';
import { languages, t } from '@/lib/i18n';
import type { Research } from '@/lib/research';

const defaultNav = [
  { label: 'Research', url: '/research', visible: true },
  { label: 'Services', url: '/services', visible: true },
  { label: 'About', url: '/about', visible: true },
  { label: 'Contact', url: '/contact', visible: true },
];

function LanguageSwitcher() {
  const locale = useWebsiteLanguage();
  return <fieldset className="language-switcher"><legend className="language-legend">Website language</legend>
    {languages.map((language) => <a
      key={language.code}
      href={'?lang=' + language.code}
      lang={language.code}
      hrefLang={language.code}
      aria-label={language.label}
      aria-current={locale === language.code ? 'true' : undefined}
      onClick={(event) => {
        event.preventDefault();
        const url = new URL(window.location.href);
        if (language.code === 'en') url.searchParams.delete('lang');
        else url.searchParams.set('lang', language.code);
        window.location.assign(url.pathname + url.search + url.hash);
      }}
    >{language.short}</a>)}
  </fieldset>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState('');
  useEffect(() => setPath(window.location.pathname), []);

  const content = useWebsite();
  const locale = useWebsiteLanguage();
  const settings = content?.settings;
  const logo = resolveBrandLogo((settings && value(settings, 'logo')) || brand.logo);
  const configuredNav = settings ? items(settings, 'navigation') : defaultNav;
  const nav = configuredNav.filter((n) => n.visible !== false && value(n, 'url') && (value(n, 'url') !== '/resources' || content.resources?.visible === true));
  if (content.resources?.visible === true && !nav.some((n) => value(n, 'url') === '/resources')) {
    nav.push({ label: 'Resources', url: '/resources', visible: true });
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo-link" aria-label="Heuresis Capital home">
          <img
            className="full-logo"
            src={logo}
            width="3739"
            height="849"
            alt={settings ? value(settings, 'name') || 'Heuresis Capital' : 'Heuresis Capital'}
          />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={String(item.url)}
              className={path.startsWith(String(item.url)) ? 'active' : ''}
              aria-current={path === String(item.url) ? 'page' : undefined}
              href={String(item.url)}
            >
              {t(locale, String(item.label))}
            </Link>
          ))}
          {content.newsletter?.visible === true && <Link className="header-subscribe" href="/#newsletter">
            {t(locale, 'Research updates')} <ArrowUpRight size={15} />
          </Link>}
          <LanguageSwitcher />
        </nav>
        <div className="mobile-nav">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="menu-button" aria-label="Open navigation">
              <Menu size={24} />
            </SheetTrigger>
            <SheetContent className="mobile-sheet">
              <SheetTitle>Heuresis</SheetTitle>
              <SheetDescription>Capital</SheetDescription>
              <nav aria-label="Mobile navigation">
                {nav.map((item) => (
                  <Link key={String(item.url)} href={String(item.url)} onClick={() => setOpen(false)}>
                    {t(locale, String(item.label))}
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
                {content.newsletter?.visible === true && <Link href="/#newsletter" onClick={() => setOpen(false)}>
                  {t(locale, 'Research updates')} <Mail size={18} />
                </Link>}
              </nav>
              <LanguageSwitcher />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Footer({
  preview,
  policiesVisible,
  contactEmail,
  social,
}: {
  preview: boolean;
  policiesVisible: boolean;
  contactEmail: string | null;
  social: { label: string; url: string }[];
}) {
  const content = useWebsite();
  const locale = useWebsiteLanguage();
  const settings = content?.settings;
  const logo = resolveBrandLogo((settings && value(settings, 'logo')) || brand.logo);
  const builtInLogo = logo === brand.logo;
  const email = (settings && value(settings, 'email')) || contactEmail || brand.email;
  const footerText = (settings && value(settings, 'footerText')) || 'Considered perspectives on companies,\neconomies and market themes.';
  const copyright = (settings && value(settings, 'copyright')) || brand.name;
  const footerNote = (settings && value(settings, 'footerNote')) || (preview ? 'Preview edition · Draft policies' : 'Capital markets research');
  const configuredFooterLinks = settings ? items(settings, 'footerLinks') : [];
  const footerLinks = configuredFooterLinks.filter((item) => value(item, 'url') && (value(item, 'url') !== '/#newsletter' || content.newsletter?.visible === true));
  const configuredNav = settings ? items(settings, 'navigation') : defaultNav;
  const nav = configuredNav.filter((n) => n.visible !== false && value(n, 'url') && (value(n, 'url') !== '/resources' || content.resources?.visible === true));
  if (content.resources?.visible === true && !nav.some((n) => value(n, 'url') === '/resources')) {
    nav.push({ label: 'Resources', url: '/resources', visible: true });
  }
  const configuredSocial = settings ? items(settings, 'social') : [];
  const socialEntries: Record<string, unknown>[] = configuredSocial.length ? configuredSocial : social;
  const textValue = (input: unknown) => typeof input === 'string' ? input : '';
  const socialLinks = socialEntries
    .filter((entry) => entry.visible !== false && /^https:\/\/[^\s/]+/i.test(textValue(entry.url)))
    .map((entry) => ({
      platform: textValue(entry.platform) || textValue(entry.label) || 'Social',
      handle: textValue(entry.handle) || textValue(entry.label) || textValue(entry.platform) || 'Profile',
      url: textValue(entry.url),
    }));

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link className={builtInLogo ? 'footer-logo' : 'footer-logo footer-logo-custom'} href="/">
              <img src={builtInLogo ? brand.logoDark : logo} width="3739" height="849" alt="Heuresis Capital Research" />
            </Link>
            <p style={{ whiteSpace: 'pre-line' }}>{t(locale, footerText)}</p>
          </div>
          <div className="footer-nav">
            <span className="eyebrow">{t(locale, 'Explore')}</span>
            {nav.map((item) => (
              <Link key={String(item.url)} href={String(item.url)}>
                {t(locale, String(item.label))}
              </Link>
            ))}
          </div>
          <div className="footer-nav">
            <span className="eyebrow">{t(locale, 'Stay in the conversation')}</span>
            {footerLinks.map((item) => (
              <Link key={String(item.url)} href={String(item.url)}>
                {t(locale, String(item.label))} <ArrowUpRight size={16} />
              </Link>
            ))}
            {email && <a href={'mailto:' + email}>{email}</a>}
            {settings && value(settings, 'phone') && <a href={'tel:' + value(settings, 'phone')}>{value(settings, 'phone')}</a>}
            {settings && value(settings, 'address') && <p>{value(settings, 'address')}</p>}
            {socialLinks.length > 0 && <div className="footer-social">
              <span className="eyebrow">{t(locale, 'Follow Heuresis')}</span>
              {socialLinks.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.platform}: ${s.handle}`}>
                  <span>{s.platform}</span><strong>{s.handle}</strong><ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ))}
            </div>}
          </div>
        </div>
        <div className="footer-bottom">
          <Link href="/admin">{t(locale, 'Team sign in')}</Link>
          <span>© {new Date().getFullYear()} {copyright}</span>
          {policiesVisible && (
            <div>
              {(site.preview || content.privacy?.visible === true) && <Link href="/privacy">{t(locale, 'Privacy')}</Link>}
              {(site.preview || content.terms?.visible === true) && <Link href="/terms">{t(locale, 'Terms')}</Link>}
              {(site.preview || content['research-disclosures']?.visible === true) && <Link href="/research-disclosures">{t(locale, 'Research disclosures')}</Link>}
            </div>
          )}
          <span>{t(locale, footerNote)}</span>
        </div>
      </div>
    </footer>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label">
      <span />
      {children}
    </p>
  );
}

export function ResearchRow({
  report: r,
  compact = false,
}: {
  report: Research;
  compact?: boolean;
}) {
  const locale = useWebsiteLanguage();
  return (
    <article className={'research-row ' + (compact ? 'compact' : '')}>
      <div className="row-content">
        <div className="row-top">
          <span className="eyebrow">{t(locale, r.type)}</span>
          {r.status === 'sample' && <span className="sample-label">{t(locale, 'Sample')}</span>}
        </div>
        <h3>
          <Link href={'/research/' + r.slug}>{r.title}</Link>
        </h3>
        <p>{r.summary}</p>
        <div className="row-meta">
          {r.date && (
            <time dateTime={r.date}>
              {new Date(r.date + 'T12:00:00Z').toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'it' ? 'it-IT' : 'en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}{' '}
              ·{' '}
            </time>
          )}
          {r.author && <>{r.author} · </>}
          {r.readingMinutes} {t(locale, 'min read')}{!compact && <> · {r.topics.map((topic) => t(locale, topic)).join(' / ')}</>}
        </div>
      </div>
      <Link className="row-arrow" href={'/research/' + r.slug} aria-label={'Read ' + r.title}>
        <ArrowUpRight size={22} />
      </Link>
    </article>
  );
}

export function Approach({
  sections: customSections,
}: {
  sections?: { title: string; body: string }[];
}) {
  const content = useWebsite();
  const locale = useWebsiteLanguage();
  const approach = content?.approach;
  const sections = customSections || (approach && (items(approach, 'sections') as { title: string; body: string }[])) || [
    { title: 'Frame the question', body: 'Define the decision, the context and what needs to be understood.' },
    { title: 'Examine the evidence', body: 'Look closely at sources, comparability and the gaps in the data.' },
    { title: 'Test the assumptions', body: 'Explore scenarios and the evidence that could change the view.' },
    { title: 'Explain the implications', body: 'Make the reasoning, uncertainty and conclusions clear.' },
  ];

  return (
    <div className="approach-grid">
      {sections.map((s, i) => (
        <div key={s.title}>
          <span className="step-number">0{i + 1}</span>
          <h3>{t(locale, s.title)}</h3>
          <p>{t(locale, s.body)}</p>
        </div>
      ))}
    </div>
  );
}

export function Newsletter({
  policiesVisible = true,
}: {
  policiesVisible?: boolean;
}) {
  const content = useWebsite();
  const locale = useWebsiteLanguage();
  const newsletter = content?.newsletter;
  if (newsletter?.visible === false) return null;
  const settings = content?.settings;
  const email = (settings && value(settings, 'email')) || brand.email;

  const eyebrow = (newsletter && value(newsletter, 'eyebrow')) || 'Stay close to the thinking';
  const title = (newsletter && value(newsletter, 'title')) || 'The Heuresis Brief';
  const intro = (newsletter && value(newsletter, 'intro')) || 'Research and market perspectives, sent when there is something worth sharing.';
  const cardTitle = (newsletter && value(newsletter, 'cardTitle')) || 'Be part of the conversation.';
  const cardIntro = (newsletter && value(newsletter, 'cardIntro')) || 'Email us to express your interest in future research updates.';
  const button = (newsletter && value(newsletter, 'button')) || 'Request updates by email';
  const subject = (newsletter && value(newsletter, 'subject')) || t(locale, 'Research updates — Heuresis Capital');

  return (
    <section className="container newsletter section" id="newsletter">
      <div>
        <SectionLabel>{eyebrow}</SectionLabel>
        <h2>{title}</h2>
        <p style={{ whiteSpace: 'pre-line' }}>{intro}</p>
      </div>
      <div className="newsletter-request">
        <Mail size={24} strokeWidth={1.5} />
        <h3>{cardTitle}</h3>
        <p>{cardIntro}</p>
        <a
          className="button"
          href={
            'mailto:' +
            email +
            '?subject=' +
            encodeURIComponent(subject) +
            '&body=' +
            encodeURIComponent(t(locale, 'Hello Heuresis Capital,\r\n\r\nPlease let me know when your research updates are available.'))
          }
        >
          {button} <ArrowUpRight size={17} />
        </a>
        <p className="small">
          {t(locale, 'Opens your email app. This is a request, not an automatic subscription.')}{' '}
          {policiesVisible && <Link href="/privacy">{t(locale, 'Privacy notice')}</Link>}
        </p>
      </div>
    </section>
  );
}

export function ShareTools() {
  const locale = useWebsiteLanguage();
  const [state, setState] = useState('Copy link');
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState('Link copied');
    } catch {
      setState('Copy the address from your browser');
    }
  }
  return (
    <div className="share-tools">
      <button onClick={copy}>
        {state === 'Link copied' ? <Check size={16} /> : <Copy size={16} />}
        <span aria-live="polite">{t(locale, state)}</span>
      </button>
      <button onClick={() => window.print()}>
        <Printer size={16} />
        {t(locale, 'Print article')}
      </button>
    </div>
  );
}
