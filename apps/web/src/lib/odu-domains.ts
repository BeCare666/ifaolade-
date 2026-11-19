/** Domaines de vie d'une consultation (plan, étape 5.9). Identiques à ceux de l'API et du portrait. */
export const ODU_DOMAINS = ['amour', 'argent', 'sante', 'famille', 'installation', 'spirituel', 'enfants'] as const;
export type OduDomain = (typeof ODU_DOMAINS)[number];

export const DOMAIN_LABELS_FR: Record<OduDomain, string> = {
  amour: 'Amour', argent: 'Argent et travail', sante: 'Santé', famille: 'Famille',
  installation: 'Papiers et installation', spirituel: 'Spirituel et protection', enfants: 'Enfants et fertilité',
};

export interface OduLecture { domain: OduDomain; own: string | null; right: string | null; left: string | null }
