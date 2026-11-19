import { PLANETS, type PlanetKey } from '../astro/chart';
import { ELEMENT_INFO, SIGNS, type Element, type Modality } from '../astro/zodiac';
import type { Odu } from '../odu/engine';
import { en } from './en';
import { fill, LOCALES, type CorePack, type Locale } from './types';
import { yo } from './yo';

export * from './types';
export { en } from './en';
export { yo } from './yo';

const PACKS: Record<Exclude<Locale, 'fr'>, CorePack> = { en, yo };

/** Pack de la langue demandée ; null pour le français (langue source, textes d'origine). */
export const corePack = (l: Locale): CorePack | null => (l === 'fr' ? null : PACKS[l]);
export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (LOCALES as string[]).includes(v);

const FR_MODALITIES: Record<Modality, string> = { cardinal: 'Cardinal', fixed: 'Fixe', mutable: 'Mutable' };
const FR_PHASES = ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'];
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export function signName(index: number, l: Locale = 'fr') {
  const s = SIGNS[index];
  return corePack(l)?.signs[s.key as keyof CorePack['signs']].name ?? s.name;
}
export function signKeywords(index: number, l: Locale = 'fr') {
  const s = SIGNS[index];
  return corePack(l)?.signs[s.key as keyof CorePack['signs']].keywords ?? s.keywords;
}
export const elementName = (e: Element, l: Locale = 'fr') => corePack(l)?.elements[e] ?? ELEMENT_INFO[e].name;
export const modalityName = (m: Modality, l: Locale = 'fr') => corePack(l)?.modalities[m] ?? FR_MODALITIES[m];
export const planetName = (k: PlanetKey, l: Locale = 'fr') => corePack(l)?.planets[k] ?? PLANETS.find((p) => p.key === k)!.name;
export const moonPhaseName = (angle: number, l: Locale = 'fr') => (corePack(l)?.moonPhases ?? FR_PHASES)[Math.round(angle / 45) % 8];
export const positionName = (k: Element, l: Locale = 'fr') => corePack(l)?.positions[k] ?? ELEMENT_INFO[k].name;

/** Mots-clés et essence d'un Odu dans la langue demandée (règle : le texte du prêtre prime en français). */
export function oduText(o: Odu, l: Locale = 'fr'): { keywords: string[]; essence: string } {
  const p = corePack(l);
  if (!p) return { keywords: o.keywords, essence: o.essence };
  const r = p.meji[o.right.index];
  const left = p.meji[o.left.index];
  if (o.isMeji) return { keywords: r.keywords, essence: r.essence };
  return {
    keywords: [...r.keywords.slice(0, 3), ...left.keywords.slice(0, 2)],
    essence: fill(p.oduComposite, { right: o.right.name, left: o.left.name, re: lowerFirst(r.essence), le: lowerFirst(left.essence) }),
  };
}
