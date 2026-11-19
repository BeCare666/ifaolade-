'use client';

import { createContext, useContext } from 'react';
import { EMPTY_SITE_DATA, type SiteData } from './site-data-shared';

export type { Practitioner, SiteData, SiteImageValue } from './site-data-shared';

const Ctx = createContext<SiteData>(EMPTY_SITE_DATA);
export function SiteDataProvider({ value, children }: { value: SiteData; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useSiteData = () => useContext(Ctx);
