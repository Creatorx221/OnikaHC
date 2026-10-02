'use client';

import { createContext, useContext, useEffect } from 'react';
import { defaultWebsite, type Content } from '@/lib/website-schema';
import type { Locale } from '@/lib/i18n';

const WebsiteContext = createContext<Record<string, Content>>(defaultWebsite());
const LanguageContext = createContext<Locale>('en');

export function WebsiteProvider({
  data,
  locale,
  children,
}: {
  data: Record<string, Content>;
  locale: Locale;
  children: React.ReactNode;
}) {
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return (
    <LanguageContext.Provider value={locale}>
      <WebsiteContext.Provider value={data}>{children}</WebsiteContext.Provider>
    </LanguageContext.Provider>
  );
}

export function useWebsite() {
  return useContext(WebsiteContext);
}

export function useWebsiteLanguage() {
  return useContext(LanguageContext);
}
