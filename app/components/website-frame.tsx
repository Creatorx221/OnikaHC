import type { CSSProperties, ReactNode } from 'react';
import { site } from '@/lib/site-config';
import { value, type Content } from '@/lib/website-schema';
import { WebsiteProvider } from '@/components/website-context';
import { Header, Footer } from '@/components/site';
import { t, type Locale } from '@/lib/i18n';

export function WebsiteFrame({
  data,
  children,
  preview = false,
  locale = 'en',
}: {
  data: Record<string, Content>;
  children: ReactNode;
  preview?: boolean;
  locale?: Locale;
}) {
  const accent = value(data.settings, 'accent');
  const style = /^#[0-9a-fA-F]{6}$/.test(accent)
    ? ({ '--gold': accent } as CSSProperties)
    : undefined;

  return (
    <WebsiteProvider data={data} locale={locale}>
      <div style={style}>
        <a className="skip-link" href="#main">{t(locale, 'Skip to content')}</a>
        {site.preview && !preview && (
          <div className="preview-bar">
            <span className="preview-dot" /> PREVIEW EDITION{' '}
            <span className="preview-detail">Illustrative research · Heuresis Capital</span>
          </div>
        )}
        <Header />
        {children}
        <Footer
          preview={preview || site.preview}
          policiesVisible={site.preview || site.policiesApproved || ['privacy', 'terms', 'research-disclosures'].some((key) => data[key]?.visible === true)}
          contactEmail={site.contactEmail}
          social={site.social}
        />
      </div>
    </WebsiteProvider>
  );
}
