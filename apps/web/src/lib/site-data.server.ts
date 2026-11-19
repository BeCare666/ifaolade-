import { apiGet } from './api';
import { EMPTY_SITE_DATA, type SiteData } from './site-data-shared';

/** Lecture côté serveur (5 minutes de cache). Si l'API est injoignable, la vitrine garde ses textes et cadres par défaut. */
export async function getSiteData(lang: string): Promise<SiteData> {
  const [app, settings] = await Promise.all([
    apiGet<Omit<SiteData, 'settings'>>(`/site/appearance?locale=${lang}`, 300),
    apiGet<SiteData['settings']>('/settings/public', 300),
  ]);
  return { ...EMPTY_SITE_DATA, ...(app ?? {}), settings: settings ?? {} };
}
