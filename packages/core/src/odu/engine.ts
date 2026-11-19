import { MEJI, Mark, MejiBase, POSITION_ELEMENTS } from './data';

export interface Odu {
  id: number; // 0..255 = right * 16 + left
  slug: string;
  name: string;
  fonName: string;
  isMeji: boolean;
  rank: number; // 1..256
  right: MejiBase; // jambe droite (lue en premier, dominante)
  left: MejiBase;
  marks: { right: Mark[]; left: Mark[] };
  binary: string; // 8 bits, 1 = marque simple
  elements: { key: string; name: string; yoruba: string; active: number }[];
  keywords: string[];
  essence: string;
}

const cache: Odu[] = [];

function build(right: MejiBase, left: MejiBase): Odu {
  const isMeji = right.index === left.index;
  const id = right.index * 16 + left.index;
  const name = isMeji ? `${right.name} Méjì` : `${right.name} ${left.name}`;
  const fonName = isMeji ? `${right.fon} Méji` : `${right.fon}-${left.fon}`;
  const slug = isMeji ? `${right.ascii}-meji` : `${right.ascii}-${left.ascii}`;
  const elements = POSITION_ELEMENTS.map((e, i) => ({
    ...e,
    active: (right.marks[i] === 1 ? 1 : 0) + (left.marks[i] === 1 ? 1 : 0),
  }));
  const binary = [...right.marks, ...left.marks].map((m) => (m === 1 ? '1' : '0')).join('');
  const keywords = isMeji
    ? right.keywords
    : [...right.keywords.slice(0, 3), ...left.keywords.slice(0, 2)];
  const essence = isMeji
    ? right.essence
    : `${right.name} gouverne (jambe droite) : ${lower(right.essence)} Il est nuancé par ${left.name} (jambe gauche) : ${lower(left.essence)}`;
  return {
    id, slug, name, fonName, isMeji, rank: 0, right, left,
    marks: { right: [...right.marks], left: [...left.marks] },
    binary, elements, keywords, essence,
  };
}

function lower(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function allOdu(): Odu[] {
  if (cache.length) return cache;
  // Les 16 Méjì d'abord, puis les 240 Ọmọ Odù (Àmúlù) par ordre de jambe droite.
  const list: Odu[] = MEJI.map((m) => build(m, m));
  for (const r of MEJI) for (const l of MEJI) if (r.index !== l.index) list.push(build(r, l));
  list.forEach((o, i) => (o.rank = i + 1));
  cache.push(...list.sort((a, b) => a.rank - b.rank));
  return cache;
}

export function oduById(id: number): Odu | undefined {
  return allOdu().find((o) => o.id === id);
}

export function oduBySlug(slug: string): Odu | undefined {
  return allOdu().find((o) => o.slug === slug);
}

export function oduFromMarks(right: Mark[], left: Mark[]): Odu {
  const ri = MEJI.findIndex((m) => m.marks.every((v, i) => v === right[i]));
  const li = MEJI.findIndex((m) => m.marks.every((v, i) => v === left[i]));
  if (ri < 0 || li < 0) throw new Error('Marques invalides');
  return oduById(ri * 16 + li)!;
}

function letterValue(s: string): number {
  return s
    .normalize('NFD')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()
    .split('')
    .reduce((acc, c) => acc + (c.charCodeAt(0) - 96), 0);
}

function digitSum(n: number): number {
  return String(Math.abs(n)).split('').reduce((a, c) => a + Number(c), 0);
}

export interface SignatureInput {
  firstName: string;
  lastName?: string | null;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string | null;
}

/**
 * Signature symbolique de naissance.
 * ⚠️ Ce n'est PAS l'Odu de destinée (Kpɔ̀lí / Odù Ìtẹ̀fá), qui ne se révèle que par la
 * divination et l'initiation. C'est une porte d'entrée calculée, présentée comme telle.
 */
export function birthSignature(input: SignatureInput): Odu {
  const [y, m, d] = input.birthDate.split('-').map(Number);
  const [h, mi] = (input.birthTime || '0:0').split(':').map(Number);
  const n = letterValue(input.firstName);
  const l = letterValue(input.lastName || '');
  const s = digitSum(y);
  const toMark = (v: number): Mark => (v % 2 === 1 ? 1 : 2);
  const right = [d + n, m + l, s + d, n + l + m].map(toMark);
  const left = [y + h, d * m + mi, n * 2 + s, l + d + m + y].map(toMark);
  return oduFromMarks(right, left);
}

/** Tirage aléatoire (Opele virtuel) pour animations / démonstrations. */
export function castOpele(rand: () => number = Math.random): Odu {
  const leg = () => [0, 0, 0, 0].map(() => (rand() < 0.5 ? 1 : 2)) as Mark[];
  return oduFromMarks(leg(), leg());
}
