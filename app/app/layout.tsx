import type { Metadata } from 'next';
import { site } from '@/lib/site-config';
import { publicWebsite } from '@/lib/website-store';
import { value } from '@/lib/website-schema';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const website = await publicWebsite();
  const settings = website.settings;
  const title = (settings && value(settings, 'name')) || 'Heuresis Capital';
  const description =
    (settings && value(settings, 'description')) ||
    'Considered perspectives on companies, economies and market themes.';

  return {
    metadataBase: new URL(site.domain),
    title: {
      default: `${title} | A clearer view of capital markets`,
      template: `%s | ${title}`,
    },
    description,
    robots: site.preview
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: { canonical: '/' },
    openGraph: {
      siteName: title,
      type: 'website',
      title,
      description,
      url: site.domain,
    },
    twitter: { card: 'summary', title, description },
    icons: { icon: '/symbol.svg' },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
