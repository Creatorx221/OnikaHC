'use client';

import { createContext, useContext } from 'react';
import { defaultWebsite, type Content } from '@/lib/website-schema';

const WebsiteContext = createContext<Record<string, Content>>(defaultWebsite());

export function WebsiteProvider({
  data,
  children,
}: {
  data: Record<string, Content>;
  children: React.ReactNode;
}) {
  return (
    <WebsiteContext.Provider value={data}>{children}</WebsiteContext.Provider>
  );
}

export function useWebsite() {
  return useContext(WebsiteContext);
}
