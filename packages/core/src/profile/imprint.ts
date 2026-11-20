/**
 * Empreinte du moment (refonte, étape R15).
 * Trois mesures réelles du geste, prises par l'écran tactile pendant que la personne garde son doigt posé :
 * - hesitationMs : temps entre l'apparition de l'écran et le premier contact ;
 * - jitterPx : déplacement moyen du doigt pendant l'appui, en pixels CSS ;
 * - lifts : nombre de levers du doigt avant la fin.
 * Elles reflètent un état du moment, jamais des pensées : la mention est toujours affichée.
 */
export interface Imprint { hesitationMs: number; jitterPx: number; lifts: number }
export type ImprintStability = 'stable' | 'mobile' | 'agite';
export type ImprintApproach = 'direct' | 'reflechi' | 'hesitant';
export interface ImprintClass { stability: ImprintStability; approach: ImprintApproach; interrupted: boolean }

/** Durée d'appui demandée (secondes). */
export const IMPRINT_HOLD_S = 6;

const num = (v: unknown, max: number) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : null;
};

/** Valeurs bornées ; null si l'empreinte est absente ou illisible (le portrait reste alors identique). */
export function cleanImprint(raw: unknown): Imprint | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const h = num(r.hesitationMs, 600_000);
  const j = num(r.jitterPx, 1000);
  const l = num(r.lifts, 50);
  if (h === null || j === null || l === null) return null;
  return { hesitationMs: Math.round(h), jitterPx: Math.round(j * 10) / 10, lifts: Math.round(l) };
}

export function classifyImprint(i: Imprint): ImprintClass {
  return {
    stability: i.jitterPx < 3 ? 'stable' : i.jitterPx < 10 ? 'mobile' : 'agite',
    approach: i.hesitationMs < 1500 ? 'direct' : i.hesitationMs < 6000 ? 'reflechi' : 'hesitant',
    interrupted: i.lifts > 0,
  };
}

export type ImprintTextKey =
  | 'imprint.stable' | 'imprint.mobile' | 'imprint.agite'
  | 'imprint.direct' | 'imprint.reflechi' | 'imprint.hesitant'
  | 'imprint.interrupted' | 'imprint.tension' | 'imprint.note';

/** Textes français (source), modifiables dans Admin › Textes du portrait (groupe « Empreinte du moment »). */
export const IMPRINT_TEXT: Record<ImprintTextKey, string> = {
  "imprint.stable": "En ce moment, tu tiens les choses en main : tu es dans le contrôle et la décision, même si cela te demande un effort que les autres ne voient pas.",
  "imprint.mobile": "En ce moment, tu avances avec une part de doute : tu tiens debout, mais quelque chose te travaille en arrière-plan.",
  "imprint.agite": "En ce moment, quelque chose t'agite : tu portes une tension que tu n'as peut-être pas encore nommée.",
  "imprint.direct": "Tu sais ce que tu cherches, et une part de toi est prête à l'entendre.",
  "imprint.reflechi": "Tu pèses les choses avant d'agir : tu ne te lances pas sans avoir réfléchi.",
  "imprint.hesitant": "Une part de toi retient une décision, ou n'ose pas encore regarder la situation en face.",
  "imprint.interrupted": "Tu voudrais des réponses tout de suite : l'impatience ou l'inquiétude te presse.",
  "imprint.tension": "Cet état rejoint ce que disent tes réponses : la tension que tu portes est réelle, et elle mérite d'être déposée plutôt que gardée pour toi.",
  "imprint.note": "Cette lecture reflète ton état du moment, pas tes pensées.",
};

export const IMPRINT_LABELS = {
  title: 'Ton empreinte du moment',
  sub: 'Main {stab} · approche {appr} · déplacement moyen {px} px · {h} s avant le contact',
  stable: 'stable', mobile: 'mobile', agite: 'agitée',
  direct: 'directe', reflechi: 'réfléchie', hesitant: 'hésitante',
};
export type ImprintLabels = typeof IMPRINT_LABELS;
