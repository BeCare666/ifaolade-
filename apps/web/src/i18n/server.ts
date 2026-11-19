import type { Metadata } from 'next';
import { isLang, lp, LANGS, type Lang } from './config';
import { getDict } from './index';

export type LangParams = { params: Promise<{ lang: string }> };

/** Langue d'une page de la vitrine (segment [lang]). */
export async function pageLang(params: Promise<{ lang: string }>): Promise<Lang> {
  const { lang } = await params;
  return isLang(lang) ? lang : 'fr';
}

/** Métadonnées d'une page : titre, description, adresse canonique et hreflang (étape 6.4). */
export function pageMeta(lang: Lang, path: string, title: string, description?: string): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: lp(lang, path),
      languages: { ...Object.fromEntries(LANGS.map((l) => [l, lp(l, path)])), 'x-default': path },
    },
    openGraph: { title, description, locale: lang === 'fr' ? 'fr_FR' : lang === 'en' ? 'en_GB' : 'yo_NG' },
  };
}

export { getDict };
