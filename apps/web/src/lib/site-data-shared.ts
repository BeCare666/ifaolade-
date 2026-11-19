/** Refonte §8 : types et utilitaires partagés serveur / client (aucun « use client » ici). */
export interface SiteImageValue { url: string; alt: string | null; credit: string | null }
export interface Practitioner {
  id: string; name: string; title: string | null; lineage: string | null; initiatedYear: number | null;
  languages: string | null; bio: string | null; photoUrl: string | null; order: number;
}
export interface SiteData {
  images: Record<string, SiteImageValue>;
  practitioners: Practitioner[];
  texts: Record<string, string>;
  settings: Record<string, string | number | undefined>;
}
export const EMPTY_SITE_DATA: SiteData = { images: {}, practitioners: [], texts: {}, settings: {} };

/** Texte de l'admin s'il existe, sinon celui du dictionnaire. */
export const pick = (data: SiteData, key: string, fallback: string) => data.texts[key]?.trim() || fallback;
