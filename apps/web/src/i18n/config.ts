/** Étape 6.4 : français (sans préfixe), anglais (/en), yoruba (/yo). */
export const LANGS = ['fr', 'en', 'yo'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'fr';
export const LANG_LABELS: Record<Lang, string> = { fr: 'Français', en: 'English', yo: 'Yorùbá' };
/** Code pour Intl (dates, nombres) et l'attribut lang. */
export const INTL: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB', yo: 'yo-NG' };

export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

/** Préfixe un chemin interne selon la langue : /consultations → /en/consultations. */
export function lp(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG) return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

/** Langue et chemin « nu » d'une adresse : /yo/odu/ogbe-meji → { lang: 'yo', path: '/odu/ogbe-meji' }. */
export function splitPath(pathname: string): { lang: Lang; path: string } {
  const seg = pathname.split('/')[1];
  if (seg === 'en' || seg === 'yo') return { lang: seg, path: pathname.slice(seg.length + 1) || '/' };
  return { lang: 'fr', path: pathname || '/' };
}

export const tpl = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
