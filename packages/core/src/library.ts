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

/**
 * R22 : relie un nom cité dans un Odu (« Egúngún (les ancêtres) », « Lisa », « Les mères (Ìyàmí) »…) à la fiche
 * d'une divinité. Ordre : titre, autres noms, nom entre parenthèses, puis sous-titre. Les petits mots sont ignorés.
 */
export interface DivinityRef { slug: string; title: string; subtitle?: string | null; otherNames?: string | null }
const STOP = new Set(['la', 'le', 'les', 'de', 'des', 'du', 'ta', 'ton', 'tes', 'et', 'of', 'the', 'au', 'aux', 'un', 'une']);
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ɔ/g, 'o').replace(/ɛ/g, 'e').toLowerCase();
const words = (s: string) => norm(s).split(/[^a-z]+/).filter((t) => t.length >= 2 && !STOP.has(t));

export function makeDivinityLinker(refs: DivinityRef[]): (name: string) => string | undefined {
  const idx = refs.map((r) => ({ slug: r.slug, title: new Set(words(r.title)), other: new Set(words(r.otherNames ?? '')), sub: new Set(words(r.subtitle ?? '')) }));
  const match = (head: string[]) => {
    if (!head.length) return undefined;
    const all = (set: Set<string>) => head.every((w) => set.has(w));
    return (idx.find((e) => all(e.title)) ?? idx.find((e) => all(e.other)) ?? idx.find((e) => all(new Set([...e.title, ...e.other]))))?.slug;
  };
  return (name) => {
    const outside = words(name.replace(/\(.*?\)/g, ' '));
    const inside = (name.match(/\((.*?)\)/)?.[1] ?? '').split(',').map((p) => words(p));
    return match(outside) ?? inside.map(match).find(Boolean) ?? (outside.length ? idx.find((e) => outside.every((w) => e.sub.has(w)))?.slug : undefined);
  };
}
