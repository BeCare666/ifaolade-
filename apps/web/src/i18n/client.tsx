'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
import { INTL, lp, splitPath, type Lang } from './config';
import { getDict, type Dict } from './index';

const Ctx = createContext<Lang | null>(null);

/** Fournit la langue de la page aux composants navigateur et met à jour l'attribut lang du document. */
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  useEffect(() => { document.documentElement.lang = INTL[lang].slice(0, 2); }, [lang]);
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

/** Langue, dictionnaire et préfixeur de liens. Hors vitrine (espace, admin), la langue vient de l'adresse. */
export function useI18n(): { lang: Lang; d: Dict; href: (path: string) => string; intl: string } {
  const ctx = useContext(Ctx);
  const pathname = usePathname() || '/';
  const lang = ctx ?? splitPath(pathname).lang;
  return { lang, d: getDict(lang), href: (p: string) => lp(lang, p), intl: INTL[lang] };
}
