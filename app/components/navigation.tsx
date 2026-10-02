'use client';
import type { AnchorHTMLAttributes } from 'react';
import { useWebsiteLanguage } from './website-context';

// Standard anchor navigation eliminates the Vinext production RSC prefetch setup
// exception while preserving hash anchors, query parameters, keyboard usage,
// and opening links in a new tab.
export default function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const locale = useWebsiteLanguage();
  let destination = href;
  if (locale !== 'en' && typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !/^\/(admin|assets|materials|api)(\/|$)/.test(href)) {
    const url = new URL(href, 'https://heuresiscapital.com');
    url.searchParams.set('lang', locale);
    destination = url.pathname + url.search + url.hash;
  }
  return (
    <a href={destination} {...props}>
      {children}
    </a>
  );
}
