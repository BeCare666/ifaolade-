/** Domaines de vie d'une consultation (plan, étape 5.9). Identiques à ceux de l'API et du portrait. */
export const ODU_DOMAINS = ['amour', 'argent', 'sante', 'famille', 'installation', 'spirituel', 'enfants', 'adogo', 'afojete'] as const;
/** R20 : choix qui portent sur toute la vie (lecture « signe de naissance »), pas sur un domaine. */
export const LIFE_DOMAINS: readonly OduDomain[] = ['adogo', 'afojete'];
export type OduDomain = (typeof ODU_DOMAINS)[number];

export const DOMAIN_LABELS_FR: Record<OduDomain, string> = {
  amour: 'Amour', argent: 'Argent et travail', sante: 'Santé', famille: 'Famille',
  installation: 'Papiers et installation', spirituel: 'Spirituel et protection', enfants: 'Enfants et fertilité',
  adogo: 'Adɔ̀gò Fá (ventre de la mère)', afojete: 'Afɔ̀jɛ́tɛ́ (naissance)',
};

export interface OduLecture { domain: OduDomain; own: string | null; right: string | null; left: string | null }
