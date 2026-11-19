/** Langues du moteur (plan, étape 6.4). Le français est la langue source. */
export type Locale = 'fr' | 'en' | 'yo';
export const LOCALES: Locale[] = ['fr', 'en', 'yo'];

export type SignKey =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';
export type ElementKey = 'fire' | 'earth' | 'air' | 'water';
export type PlanetName = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
export type DimensionKey = 'sensibilite' | 'controle' | 'don' | 'trahison' | 'intuition' | 'porteur' | 'errance' | 'blocage' | 'ambition' | 'solitude';
export type FixedKey = 'moon.water-sensitive' | 'moon.no-time' | 'now.intention' | 'odu.disclaimer' | 'voie.1' | 'voie.2' | 'essence.bridge' | 'now.also' | 'odu.situation';
export type DomainKey = 'amour' | 'argent' | 'sante' | 'famille' | 'installation' | 'spirituel' | 'enfants';

/**
 * Pack de traduction du moteur. Les gabarits utilisent {clé} :
 * {name}, {sign}, {element}, {v}, {m}, {s}, {fon}, {k}, {phrase}, {right}, {left}, {re}, {le}.
 */
export interface CorePack {
  signs: Record<SignKey, { name: string; keywords: string[]; sun: string; moon: string; asc: string }>;
  elements: Record<ElementKey, string>;
  modalities: { cardinal: string; fixed: string; mutable: string };
  planets: Record<PlanetName, string>;
  moonPhases: [string, string, string, string, string, string, string, string];
  elementDominant: Record<ElementKey, string>;
  elementMissing: Record<ElementKey, string>;
  venus: Record<ElementKey, string>;
  mars: Record<ElementKey, string>;
  saturn: Record<ElementKey, string>;
  dimensions: Record<DimensionKey, { title: string; text: string }>;
  domains: Record<'amour' | 'argent' | 'sante' | 'famille' | 'installation' | 'spirituel' | 'enfants', string>;
  domainLabels: Record<DomainKey, string>;
  durations: Record<'recent' | 'moyen' | 'long' | 'toujours', string>;
  /** Clé : « planèteA-planèteB-nature », ex. « moon-saturn-hard ». */
  aspects: Record<string, string>;
  fixed: Record<FixedKey, string>;
  sections: {
    essence: string; essenceSub: string;
    emotions: string; emotionsSub: string;
    masque: string; masqueSub: string;
    profondeur: string; profondeurSub: string;
    amour: string; amourSub: string;
    maintenant: string;
    odu: string; oduSub: string; keywords: string;
    voie: string;
  };
  questions: Record<string, { title: string; hint?: string; options?: Record<string, string> }>;
  /** Index 0 à 15 dans l'ordre de séniorité (Ogbè … Òfún). */
  meji: { keywords: string[]; essence: string }[];
  oduComposite: string;
  oduMejiSuffix: string;
  positions: Record<ElementKey, string>;
}

export const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
