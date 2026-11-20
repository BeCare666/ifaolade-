import { apiGet } from './api';
import { DEFAULT_IMAGES } from './default-images';
import { EMPTY_SITE_DATA, type SiteData } from './site-data-shared';

/** Lecture côté serveur (5 minutes de cache). Si l'API est injoignable, la vitrine garde ses textes et cadres par défaut. */
export async function getSiteData(lang: string): Promise<SiteData> {
  const [app, settings] = await Promise.all([
    apiGet<Omit<SiteData, 'settings'>>(`/site/appearance?locale=${lang}`, 300),
    apiGet<SiteData['settings']>('/settings/public', 300),
  ]);
  // Images de départ (R8) sous les images choisies dans l'admin : aucun cadre vide sur la vitrine.
  return { ...EMPTY_SITE_DATA, ...(app ?? {}), images: { ...DEFAULT_IMAGES, ...(app?.images ?? {}) }, settings: settings ?? {} };
}
