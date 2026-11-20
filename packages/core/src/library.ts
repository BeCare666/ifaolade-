/**
 * Bibliothèque spirituelle (refonte, étape R21) : rituels, wáàsù et divinités, modifiables et ajoutables dans l'admin.
 * Clés stables partagées par l'API et le site ; les libellés traduits sont dans les dictionnaires du site.
 */
export const LIBRARY_KINDS = ['rituel', 'wasu', 'divinite'] as const;
export type LibraryKind = (typeof LIBRARY_KINDS)[number];

export const LIBRARY_CATEGORIES: Record<LibraryKind, readonly string[]> = {
  // Décision du 2026-11-20 : « défense et renvoi » seulement, jamais un rituel pour nuire à une personne nommée.
  rituel: ['deblocage', 'protection', 'defense', 'purification', 'chemins', 'prosperite'],
  wasu: ['sens', 'iwa', 'ori', 'famille', 'epreuve', 'sagesse'],
  divinite: ['orisa', 'vodun', 'les-deux'],
};

/** Champs complémentaires (meta) par type : tous des textes courts, affichés en fiche. */
export const LIBRARY_META: Record<LibraryKind, readonly string[]> = {
  rituel: ['when', 'duration'],
  wasu: ['quote'],
  divinite: ['otherNames', 'role', 'colors', 'day', 'offerings', 'taboos', 'symbols'],
};

export const isLibraryKind = (k: string): k is LibraryKind => (LIBRARY_KINDS as readonly string[]).includes(k);
