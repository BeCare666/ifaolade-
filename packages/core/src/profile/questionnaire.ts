export type Dimension =
  | 'sensibilite' | 'controle' | 'don' | 'trahison' | 'intuition'
  | 'porteur' | 'errance' | 'blocage' | 'ambition' | 'solitude';

export interface QuestionOption {
  value: string;
  label: string;
  weights?: Partial<Record<Dimension, number>>;
}

export interface Question {
  id: string;
  title: string;
  hint?: string;
  type: 'single' | 'text';
  options?: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'blessure', title: 'Quand une situation te blesse profondément, tu…', type: 'single',
    options: [
      { value: 'parle', label: "En parles tout de suite", weights: { sensibilite: 1 } },
      { value: 'garde', label: 'Gardes tout pour toi et y repenses longtemps', weights: { sensibilite: 3, solitude: 2 } },
      { value: 'coupe', label: 'Coupes les ponts net', weights: { trahison: 2, controle: 2 } },
      { value: 'comprend', label: "Cherches d'abord à comprendre l'autre", weights: { don: 3 } },
    ],
  },
  {
    id: 'famille', title: 'Dans ta famille, tu es plutôt…', type: 'single',
    options: [
      { value: 'pilier', label: 'Celui ou celle sur qui tout le monde compte', weights: { porteur: 3, don: 2 } },
      { value: 'incompris', label: "Celui ou celle qu'on comprend mal", weights: { solitude: 2, errance: 2 } },
      { value: 'rebelle', label: 'Le rebelle, celui ou celle qui dérange', weights: { ambition: 2, controle: 1 } },
      { value: 'eloigne', label: "Celui ou celle qui s'est éloigné·e", weights: { errance: 3 } },
    ],
  },
  {
    id: 'repetition', title: 'As-tu le sentiment que les mêmes choses se répètent dans ta vie ?', hint: 'Mêmes échecs, mêmes types de personnes, mêmes blocages au moment où tout allait bien.', type: 'single',
    options: [
      { value: 'souvent', label: 'Oui, très souvent', weights: { blocage: 3 } },
      { value: 'parfois', label: 'Parfois', weights: { blocage: 1 } },
      { value: 'rarement', label: 'Rarement' },
    ],
  },
  {
    id: 'trahison', title: 'As-tu déjà été trahi·e par quelqu\'un de très proche ?', type: 'single',
    options: [
      { value: 'plusieurs', label: 'Oui, plusieurs fois', weights: { trahison: 3 } },
      { value: 'une', label: "Une fois, et ça m'a marqué·e", weights: { trahison: 2 } },
      { value: 'non', label: 'Non, pas vraiment' },
    ],
  },
  {
    id: 'reves', title: 'Tes rêves…', type: 'single',
    options: [
      { value: 'premonitoires', label: 'Sont souvent prémonitoires', weights: { intuition: 3 } },
      { value: 'intenses', label: 'Sont intenses mais confus', weights: { intuition: 2, sensibilite: 1 } },
      { value: 'oublie', label: "Je ne m'en souviens presque jamais" },
    ],
  },
  {
    id: 'argent', title: "Ta relation à l'argent :", type: 'single',
    options: [
      { value: 'fuit', label: "Il entre, mais il ne reste pas", weights: { blocage: 2, don: 1 } },
      { value: 'lutte', label: "Je lutte pour qu'il entre", weights: { blocage: 2, ambition: 1 } },
      { value: 'garde', label: "Je gère bien, mais je n'en profite pas", weights: { controle: 2 } },
      { value: 'ok', label: 'Ça va plutôt bien' },
    ],
  },
  {
    id: 'manque', title: "Ce qui te manque le plus aujourd'hui :", type: 'single',
    options: [
      { value: 'paix', label: 'La paix intérieure', weights: { sensibilite: 2 } },
      { value: 'stabilite', label: 'La stabilité matérielle', weights: { blocage: 1, ambition: 1 } },
      { value: 'amour', label: "L'amour vrai", weights: { solitude: 2 } },
      { value: 'sens', label: 'Un sens, une direction', weights: { errance: 3 } },
    ],
  },
  {
    id: 'chezsoi', title: 'Te sens-tu chez toi là où tu vis ?', type: 'single',
    options: [
      { value: 'oui', label: 'Oui' },
      { value: 'pas-vraiment', label: 'Pas vraiment', weights: { errance: 2 } },
      { value: 'nulle-part', label: 'Je ne me sens vraiment chez moi nulle part', weights: { errance: 3, solitude: 1 } },
    ],
  },
  {
    id: 'ambiance', title: 'Quand tu entres dans une pièce, tu ressens l\'énergie des gens…', type: 'single',
    options: [
      { value: 'immediat', label: 'Immédiatement, parfois trop', weights: { intuition: 2, sensibilite: 2 } },
      { value: 'unpeu', label: 'Un peu', weights: { intuition: 1 } },
      { value: 'non', label: 'Pas vraiment' },
    ],
  },
  {
    id: 'trop', title: 'On t\'a déjà dit que tu étais « trop »…', type: 'single',
    options: [
      { value: 'gentil', label: 'Trop gentil·le', weights: { don: 3 } },
      { value: 'dur', label: 'Trop dur·e', weights: { controle: 2 } },
      { value: 'exigeant', label: 'Trop exigeant·e', weights: { ambition: 2, controle: 1 } },
      { value: 'secret', label: 'Trop secret·ète', weights: { solitude: 2, sensibilite: 1 } },
    ],
  },
  {
    id: 'domaine', title: 'Quel domaine de ta vie demande le plus de lumière en ce moment ?', type: 'single',
    options: [
      { value: 'amour', label: 'Amour / couple' },
      { value: 'argent', label: 'Argent / travail / affaires' },
      { value: 'sante', label: 'Santé' },
      { value: 'famille', label: 'Famille' },
      { value: 'installation', label: 'Papiers / voyage / installation' },
      { value: 'spirituel', label: 'Spiritualité / protection' },
      { value: 'enfants', label: 'Enfants / fertilité' },
    ],
  },
  {
    id: 'duree', title: 'Depuis combien de temps vis-tu cette situation ?', type: 'single',
    options: [
      { value: 'recent', label: 'Moins de 6 mois' },
      { value: 'moyen', label: 'Entre 6 mois et 2 ans' },
      { value: 'long', label: 'Plus de 2 ans', weights: { blocage: 1 } },
      { value: 'toujours', label: 'Depuis toujours', weights: { blocage: 2 } },
    ],
  },
  {
    id: 'intention', title: 'En une phrase : que veux-tu voir changer dans ta vie ?', hint: 'Sois sincère. Cette phrase sera au cœur de ta lecture.', type: 'text',
  },
];

export function scoreAnswers(answers: Record<string, string>): Record<Dimension, number> {
  const scores: Record<Dimension, number> = {
    sensibilite: 0, controle: 0, don: 0, trahison: 0, intuition: 0,
    porteur: 0, errance: 0, blocage: 0, ambition: 0, solitude: 0,
  };
  for (const q of QUESTIONS) {
    if (q.type !== 'single') continue;
    const opt = q.options?.find((o) => o.value === answers[q.id]);
    if (!opt?.weights) continue;
    for (const [k, v] of Object.entries(opt.weights)) scores[k as Dimension] += v ?? 0;
  }
  return scores;
}

import { en } from '../i18n/en';
import type { Locale } from '../i18n/types';
import { yo } from '../i18n/yo';

/** Questionnaire dans la langue demandée (étape 6.4). Les valeurs et les poids ne changent jamais. */
export function questionsFor(locale: Locale = 'fr'): Question[] {
  const p = locale === 'en' ? en : locale === 'yo' ? yo : null;
  if (!p) return QUESTIONS;
  return QUESTIONS.map((q) => {
    const t = p.questions[q.id];
    if (!t) return q;
    return {
      ...q,
      title: t.title,
      hint: t.hint ?? q.hint,
      options: q.options?.map((o) => ({ ...o, label: t.options?.[o.value] ?? o.label })),
    };
  });
}
