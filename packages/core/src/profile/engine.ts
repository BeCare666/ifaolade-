import { computeChart, NatalChart, PlanetKey } from '../astro/chart';
import {
  ELEMENT_DOMINANT, ELEMENT_INFO, ELEMENT_MISSING, MARS_BY_ELEMENT,
  SATURN_BY_ELEMENT, SIGNS, VENUS_BY_ELEMENT,
} from '../astro/zodiac';
import { birthSignature, Odu } from '../odu/engine';
import { corePack, fill, oduText, type DomainKey, type FixedKey, type Locale, type SignKey } from '../i18n';
import type { Element } from '../astro/zodiac';
import { Dimension, scoreAnswers } from './questionnaire';
import { classifyImprint, cleanImprint, IMPRINT_LABELS, IMPRINT_TEXT, type Imprint, type ImprintTextKey } from './imprint';

export interface ReadingInput {
  firstName: string;
  lastName?: string | null;
  gender?: 'f' | 'm' | 'x' | null;
  birthDate: string;
  birthTime?: string | null;
  birthPlace?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  answers: Record<string, string>;
  /** Empreinte du moment (R15), facultative. */
  imprint?: Imprint | null;
}

export interface ReadingSection {
  key: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  preview: boolean; // visible sans compte
}

export interface Reading {
  version: number;
  locale?: Locale;
  firstName: string;
  highlights: string[];
  sections: ReadingSection[];
  chart: NatalChart;
  odu: { id: number; slug: string; name: string; fonName: string; marks: Odu['marks']; keywords: string[] };
  dimensions: Record<Dimension, number>;
  topDimensions: Dimension[];
  domain: string | null;
}

const DIMENSION_TEXT: Record<Dimension, { title: string; text: string }> = {
  sensibilite: {
    title: 'Une sensibilité profonde',
    text: "Tu ressens beaucoup plus que ce que tu montres. Tu as appris à sourire alors que tu portes des choses lourdes, et la plupart des gens autour de toi ne savent pas réellement ce que tu traverses.",
  },
  controle: {
    title: 'Le besoin de maîtriser',
    text: "Tu gardes le contrôle parce que, quand tu as lâché prise par le passé, tu en as payé le prix. Ta force vient de là, mais aussi ta fatigue : tu ne te reposes jamais vraiment.",
  },
  don: {
    title: 'Tu donnes plus que tu ne reçois',
    text: "Tu donnes ton temps, ton argent, ton écoute, souvent à des personnes qui ne le rendent pas. Ce n'est pas de la naïveté, c'est ta nature. Mais il est temps d'apprendre à distinguer qui mérite ce que tu offres.",
  },
  trahison: {
    title: 'La marque de la trahison',
    text: "Une trahison t'a profondément transformé·e. Depuis, tu observes avant de faire confiance, et une part de toi attend que l'histoire se répète. Cette méfiance t'a protégé·e, mais elle t'empêche aussi de recevoir.",
  },
  intuition: {
    title: 'Une ouverture spirituelle réelle',
    text: "Tes rêves, tes pressentiments et ce que tu ressens en présence des gens ne sont pas des coïncidences. Tu as une ouverture naturelle à l'invisible, qui demande à être comprise, encadrée et protégée.",
  },
  porteur: {
    title: 'Le pilier de la famille',
    text: "On compte sur toi, depuis longtemps. Tu portes des responsabilités qui ne devraient pas toutes être les tiennes, et quand toi tu tombes, il y a rarement quelqu'un pour te relever.",
  },
  errance: {
    title: 'La quête des racines',
    text: "Tu as le sentiment d'être entre deux mondes, de ne pas être tout à fait à ta place. Ce déracinement n'est pas qu'une question de géographie : il touche à ton identité, à ta lignée et à ce que tes ancêtres attendent de toi.",
  },
  blocage: {
    title: 'Les schémas qui se répètent',
    text: "Tu as souvent l'impression que, juste au moment où les choses s'ouvrent, quelque chose se referme. Ce schéma répétitif a une origine, et il se comprend. Rien de tout cela n'est une fatalité.",
  },
  ambition: {
    title: 'Une ambition qui cherche sa voie',
    text: "Tu sais que tu es fait·e pour plus grand que ce que tu vis aujourd'hui. Cette sensation d'être sous-employé·e par la vie te pousse, mais elle te frustre aussi profondément.",
  },
  solitude: {
    title: 'Une solitude intérieure',
    text: "Même entouré·e, tu te sens souvent seul·e. Tu as besoin d'être compris·e en profondeur, et les relations superficielles te vident plus qu'elles ne te nourrissent.",
  },
};

const DOMAIN_TEXT: Record<string, string> = {
  amour: "Ton cœur traverse une période de questionnement. Ce que tu vis en amour n'est pas un hasard : c'est le reflet de blessures plus anciennes qui demandent à être guéries avant que la relation juste puisse s'installer.",
  argent: "Ta prospérité est freinée. Ce n'est pas un manque de travail ni de talent : il y a un désalignement entre ton chemin, ton Orí, et la direction où tu mets ton énergie. Quand ce décalage se corrige, les portes s'ouvrent autrement.",
  sante: "Ton corps te parle. Avant tout, consulte un médecin : c'est indispensable. Spirituellement, la santé est aussi liée à ce que tu portes émotionnellement et à l'équilibre de tes éléments.",
  famille: "Les liens familiaux pèsent sur toi. Il y a dans ta lignée des choses non dites, non réglées, qui continuent d'agir aujourd'hui. Les comprendre, c'est te libérer sans renier les tiens.",
  installation: "Ton installation, tes papiers ou ton voyage stagnent. Ce type de blocage est très souvent vécu par celles et ceux de la diaspora : être loin de la terre des ancêtres demande de garder le lien et d'être protégé·e sur la route.",
  spirituel: "Tu sens qu'une protection ou une direction spirituelle te manque. Ce besoin est légitime, et il mérite une réponse honnête, encadrée et sans peur.",
  enfants: "La question des enfants ou de la fertilité occupe ton cœur. Elle se traite avec le plus grand respect : un accompagnement médical d'abord, et spirituellement, Òdí et Òtúúrúpọ̀n parlent de matrice et d'enfantement.",
};

const DURATION_TEXT: Record<string, string> = {
  recent: "Cette situation est récente. C'est le meilleur moment pour agir, avant qu'elle ne s'installe.",
  moyen: "Cette situation dure depuis un moment. Elle a déjà commencé à t'user, et il est temps de la regarder en face.",
  long: "Cette situation dure depuis longtemps. Ce qui persiste aussi longtemps a presque toujours une racine précise.",
  toujours: "Tu as l'impression que cela a toujours été là. Quand un schéma est présent depuis l'origine, il est souvent lié à la lignée ou à la destinée choisie avant la naissance.",
};

type Rule = { pair: [PlanetKey, PlanetKey]; nature: 'hard' | 'soft' | 'conj'; text: string };
const ASPECT_RULES: Rule[] = [
  { pair: ['sun', 'moon'], nature: 'hard', text: "Ta tête et ton cœur tirent souvent dans des directions opposées. Ce que tu veux et ce dont tu as besoin ne coïncident pas toujours, et tu as peut-être grandi entre deux parents ou deux mondes en tension." },
  { pair: ['sun', 'moon'], nature: 'soft', text: "Ta volonté et tes émotions s'accordent naturellement. Quand tu es aligné·e, tu avances avec une cohérence qui inspire confiance." },
  { pair: ['moon', 'saturn'], nature: 'hard', text: "Tu as dû grandir trop vite émotionnellement. Très tôt, tu as appris à ne pas déranger, à te débrouiller seul·e, et encore aujourd'hui, demander de l'aide te coûte." },
  { pair: ['moon', 'saturn'], nature: 'conj', text: "Tu portes une gravité émotionnelle ancienne. On t'a souvent dit que tu étais mature pour ton âge, et c'est vrai, à un certain prix." },
  { pair: ['venus', 'saturn'], nature: 'hard', text: "En amour, tu as connu des retards, des déceptions ou la peur d'être abandonné·e. Tu aimes avec prudence parce qu'on t'a déjà fait payer ta confiance." },
  { pair: ['sun', 'saturn'], nature: 'hard', text: "Tu as souvent eu le sentiment de devoir prouver ta valeur deux fois plus que les autres. Rien ne t'a été donné facilement." },
  { pair: ['mars', 'saturn'], nature: 'hard', text: "Tu connais la frustration d'avancer avec le frein à main serré. Ton énergie est grande, mais les obstacles arrivent au moment où tu accélères." },
  { pair: ['moon', 'pluto'], nature: 'hard', text: "Tes émotions sont d'une intensité rare. Tu as traversé des épisodes qui t'ont transformé·e de l'intérieur, comme une mort et une renaissance." },
  { pair: ['moon', 'pluto'], nature: 'conj', text: "Tu ressens au plus profond, et rien chez toi n'est superficiel. Les relations tièdes ne t'intéressent pas." },
  { pair: ['moon', 'neptune'], nature: 'hard', text: "Ta sensibilité est poreuse : tu absorbes les émotions et les énergies des autres sans t'en rendre compte. Te protéger spirituellement n'est pas un luxe pour toi." },
  { pair: ['moon', 'neptune'], nature: 'conj', text: "Ton intuition est remarquable : rêves, ressentis, signes. Le monde invisible te parle facilement." },
  { pair: ['sun', 'jupiter'], nature: 'soft', text: "Une chance réelle t'accompagne. Les ouvertures arrivent souvent par des personnes, au bon moment." },
  { pair: ['venus', 'mars'], nature: 'conj', text: "Ta passion est magnétique. Tu attires facilement, mais tu dois choisir avec lucidité." },
  { pair: ['venus', 'pluto'], nature: 'hard', text: "En amour, tu vis des liens intenses, parfois toxiques ou possessifs. Tu apprends à aimer sans te perdre." },
];

function matchRule(chart: NatalChart, rule: Rule) {
  return chart.aspects.find((a) => {
    const same = (a.a === rule.pair[0] && a.b === rule.pair[1]) || (a.a === rule.pair[1] && a.b === rule.pair[0]);
    if (!same) return false;
    if (rule.nature === 'conj') return a.type === 'conjunction';
    return a.nature === rule.nature;
  });
}

function planet(chart: NatalChart, key: PlanetKey) {
  return chart.planets.find((p) => p.key === key)!;
}

const FIXED = {
  'moon.water-sensitive': "Ta Lune d'eau confirme ce que tu as exprimé : ta sensibilité n'est pas une faiblesse. C'est un canal. Mal protégé, il t'épuise, mais bien canalisé, il devient une vraie force spirituelle.",
  'moon.no-time': '(Sans heure de naissance, la position exacte de ta Lune reste approximative.)',
  'now.intention': "Tu as écrit : « {phrase} ». Cette phrase n'est pas anodine, elle contient déjà la direction de ton chemin.",
  'odu.disclaimer': "Important : cette signature est calculée à partir de ton nom et de ta naissance, comme une porte d'entrée symbolique. Ton Odu de destinée (Kpɔ̀lí) ne se révèle que par la divination et l'initiation auprès d'un prêtre. Aucun calcul ne peut le remplacer.",
  'voie.1': "Ce portrait éclaire qui tu es. Il ne dit pas encore pourquoi tu vis précisément ce que tu vis, ni ce qu'il faut faire. Cela, seule une consultation d'Ifá peut le révéler : l'Odu qui parle de ta situation exacte, son message et le chemin à suivre.",
  'voie.2': 'Ta première consultation est offerte.',
  'essence.bridge': "Ton Soleil appartient à l'élément {sunEl}. Pourtant, l'ensemble de ton thème est porté par un autre élément :",
  'now.also': 'Ta phrase touche aussi un autre domaine de ta vie :',
  'odu.situation': "Cette signature décrit un tempérament, pas ta situation. Pour ce que tu traverses ({domain}), c'est l'Odu sorti en consultation qui parlera, avec son interprétation précise dans ce domaine.",
} as const;

const DOMAIN_LABEL: Record<DomainKey, string> = {
  amour: 'amour et couple', argent: 'argent et travail', sante: 'santé', famille: 'famille',
  installation: 'papiers et installation', spirituel: 'spiritualité et protection', enfants: 'enfants et fertilité',
};

/**
 * Correction 5 : une phrase lourde tirée d'un aspect n'apparaît que si les réponses de la personne vont dans ce sens
 * (au moins une de ces dimensions ≥ 2, ou le domaine indiqué). Les aspects sans condition restent toujours possibles.
 */
const ASPECT_REQUIRES: Record<string, { dims: Dimension[]; domains?: DomainKey[] }> = {
  'moon-saturn-hard': { dims: ['porteur', 'controle', 'solitude'] },
  'moon-saturn-conj': { dims: ['porteur', 'controle'] },
  'venus-saturn-hard': { dims: ['trahison', 'solitude'], domains: ['amour'] },
  'sun-saturn-hard': { dims: ['ambition', 'blocage'] },
  'mars-saturn-hard': { dims: ['blocage', 'ambition'] },
  'moon-pluto-hard': { dims: ['sensibilite', 'trahison'] },
  'moon-pluto-conj': { dims: ['sensibilite'] },
  'moon-neptune-hard': { dims: ['intuition', 'sensibilite'] },
  'moon-neptune-conj': { dims: ['intuition'] },
  'venus-pluto-hard': { dims: ['trahison', 'solitude'], domains: ['amour'] },
};

/** Correction 3 : mots de la phrase libre qui désignent un domaine de vie (français, anglais, yoruba ; sans accents). */
const DOMAIN_KEYWORDS: Record<DomainKey, string[]> = {
  famille: ['mere', 'maman', 'pere', 'papa', 'famille', 'frere', 'soeur', 'parents', 'oncle', 'tante', 'mother', 'father', 'family', 'brother', 'sister', 'iya', 'baba', 'ebi'],
  amour: ['mari', 'epoux', 'epouse', 'couple', 'amour', 'mariage', 'fiance', 'copain', 'copine', 'husband', 'wife', 'love', 'marriage', 'partner', 'oko', 'aya', 'ife', 'igbeyawo'],
  argent: ['argent', 'travail', 'emploi', 'boulot', 'dette', 'business', 'commerce', 'salaire', 'money', 'job', 'work', 'debt', 'owo', 'ise', 'owo-oya'],
  sante: ['sante', 'malade', 'maladie', 'douleur', 'guerir', 'health', 'sick', 'illness', 'ilera', 'aisan'],
  installation: ['papiers', 'papier', 'visa', 'titre de sejour', 'prefecture', 'naturalisation', 'voyage', 'demenager', 'papers', 'residence', 'immigration', 'iwe ase', 'irin-ajo'],
  spirituel: ['protection', 'spirituel', 'attaque', 'sorcellerie', 'envoutement', 'spiritual', 'witchcraft', 'aabo', 'emi'],
  enfants: ['enfant', 'enfants', 'grossesse', 'bebe', 'fertilite', 'enceinte', 'child', 'children', 'pregnancy', 'baby', 'omo', 'oyun'],
};
const strip = (s: string) => s.normalize('NFD').replace(/[̀-̣ͯ]/g, '').toLowerCase();

export function domainsInText(text: string): DomainKey[] {
  const t = ` ${strip(text).replace(/[^a-z\s-]/g, ' ')} `;
  return (Object.keys(DOMAIN_KEYWORDS) as DomainKey[]).filter((d) => DOMAIN_KEYWORDS[d].some((k) => t.includes(` ${k} `) || t.includes(` ${k}s `)));
}

/**
 * Correction 6 : accords en français selon le genre indiqué. Les textes sources utilisent « mot·suffixe »
 * (seul·e, vif·ve, doux·ce, sérieux·se, franc·che, rationnel·le, un·e). Sans genre indiqué, la forme inclusive reste.
 */
const SPECIAL_F: Record<string, string> = { 'discret·e': 'discrète', 'secret·ète': 'secrète', 'un·e': 'une' };
export function genderize(text: string, gender?: 'f' | 'm' | 'x' | null): string {
  if (gender !== 'f' && gender !== 'm') return text;
  return text.replace(/([A-Za-zÀ-ÖØ-öø-ÿ]+)·([a-zà-öø-ÿ]+)/g, (whole, base: string, suf: string) => {
    if (gender === 'm') return base;
    const special = SPECIAL_F[whole.toLowerCase()];
    if (special) return base[0] === base[0].toUpperCase() ? special[0].toUpperCase() + special.slice(1) : special;
    const last = base.slice(-1);
    // vif·ve → vive, doux·ce → douce, sérieux·se → sérieuse, franc·che → franche ; sinon on ajoute (seul·e → seule, rationnel·le → rationnelle)
    if (['f', 'x', 'c'].includes(last) && suf !== 'e') return base.slice(0, -1) + suf;
    return base + suf;
  });
}


const aspectKey = (r: Rule) => `aspect.${r.pair[0]}-${r.pair[1]}-${r.nature}`;

export interface PortraitText { key: string; group: string; label: string; default: string }

/**
 * Catalogue de TOUS les textes du portrait, avec leur clé stable (plan §11.3, étape 4.4).
 * Le prêtre les remplace depuis l'admin ; buildReading() reçoit les textes validés.
 */
export function portraitTextCatalog(): PortraitText[] {
  const out: PortraitText[] = [];
  for (const s of SIGNS) {
    out.push({ key: `sign.${s.key}.sun`, group: 'Soleil (essence)', label: `Soleil en ${s.name}`, default: s.sun });
    out.push({ key: `sign.${s.key}.moon`, group: 'Lune (monde intérieur)', label: `Lune en ${s.name}`, default: s.moon });
    out.push({ key: `sign.${s.key}.asc`, group: 'Ascendant (masque)', label: `Ascendant ${s.name}`, default: s.asc });
  }
  const els = Object.keys(ELEMENT_INFO) as (keyof typeof ELEMENT_INFO)[];
  for (const e of els) {
    const n = ELEMENT_INFO[e].name;
    out.push({ key: `element.dominant.${e}`, group: 'Éléments', label: `${n} dominant`, default: ELEMENT_DOMINANT[e] });
    out.push({ key: `element.missing.${e}`, group: 'Éléments', label: `${n} manquant`, default: ELEMENT_MISSING[e] });
    out.push({ key: `venus.${e}`, group: 'Vénus, Mars, Saturne', label: `Vénus en signe de ${n}`, default: VENUS_BY_ELEMENT[e] });
    out.push({ key: `mars.${e}`, group: 'Vénus, Mars, Saturne', label: `Mars en signe de ${n}`, default: MARS_BY_ELEMENT[e] });
    out.push({ key: `saturn.${e}`, group: 'Vénus, Mars, Saturne', label: `Saturne en signe de ${n}`, default: SATURN_BY_ELEMENT[e] });
  }
  for (const [d, v] of Object.entries(DIMENSION_TEXT)) {
    out.push({ key: `dimension.${d}.title`, group: 'Dimensions (questionnaire)', label: `Titre : ${v.title}`, default: v.title });
    out.push({ key: `dimension.${d}.text`, group: 'Dimensions (questionnaire)', label: `Texte : ${v.title}`, default: v.text });
  }
  for (const [d, v] of Object.entries(DOMAIN_TEXT)) out.push({ key: `domain.${d}`, group: 'Domaine de vie', label: d, default: v });
  for (const [d, v] of Object.entries(DURATION_TEXT)) out.push({ key: `duration.${d}`, group: 'Durée de la situation', label: d, default: v });
  for (const r of ASPECT_RULES) {
    const nature = r.nature === 'hard' ? 'tendu' : r.nature === 'soft' ? 'harmonieux' : 'conjonction';
    out.push({ key: aspectKey(r), group: 'Aspects', label: `${r.pair[0]}–${r.pair[1]} (${nature})`, default: r.text });
  }
  for (const [k, v] of Object.entries(FIXED)) out.push({ key: k, group: 'Textes fixes', label: k, default: v });
  for (const [k, v] of Object.entries(IMPRINT_TEXT)) out.push({ key: k, group: 'Empreinte du moment', label: k.replace('imprint.', ''), default: v });
  return out;
}

const FR_SECTIONS = {
  essence: 'Ton essence', essenceSub: 'Soleil en {sign} · élément {element}',
  emotions: 'Ton monde intérieur', emotionsSub: 'Lune en {sign}',
  masque: 'Ce que les autres voient de toi', masqueSub: 'Ascendant {sign}',
  profondeur: 'Ce que tu portes en silence', profondeurSub: 'Les nœuds de ton thème et de ton vécu',
  amour: 'Amour, action et leçon de vie', amourSub: 'Vénus en {v} · Mars en {m} · Saturne en {s}',
  maintenant: 'Ce que tu traverses maintenant',
  odu: 'Ta signature Odu de naissance', oduSub: '{name} · en Fá : {fon}', keywords: 'Mots-clés : {k}.',
  voie: 'La voie',
};

/**
 * Portrait (plan §11.3) dans la langue demandée (étape 6.4).
 * Les textes réécrits par le prêtre (table PortraitText) sont en français : ils ne s'appliquent qu'au français.
 */
export function buildReading(input: ReadingInput, texts: Record<string, string> = {}, locale: Locale = 'fr'): Reading {
  const P = corePack(locale);
  const T = (key: string, def: string) => (locale === 'fr' && texts[key] && texts[key].trim()) || def;

  const chart = computeChart(input);
  const odu = birthSignature(input);
  const dims = scoreAnswers(input.answers);
  // Correction 2 : toutes les dimensions fortes (≥ 3) sont gardées, jusqu'à 5 ; à défaut, les 3 premières ≥ 2.
  const byScore = (Object.keys(dims) as Dimension[]).sort((a, b) => dims[b] - dims[a]);
  const strong = byScore.filter((d) => dims[d] >= 3).slice(0, 5);
  const topDimensions = strong.length ? strong : byScore.filter((d) => dims[d] >= 2).slice(0, 3);

  const sun = SIGNS[planet(chart, 'sun').sign];
  const moon = SIGNS[planet(chart, 'moon').sign];
  const asc = chart.ascendant ? SIGNS[chart.ascendant.sign] : null;
  const venus = SIGNS[planet(chart, 'venus').sign];
  const mars = SIGNS[planet(chart, 'mars').sign];
  const saturn = SIGNS[planet(chart, 'saturn').sign];
  const name = input.firstName.trim();
  const domain = input.answers['domaine'] || null;
  const intention = (input.answers['intention'] || '').trim();

  type S = (typeof SIGNS)[number];
  const sName = (s: S) => (P ? P.signs[s.key as SignKey].name : s.name);
  const sText = (s: S, f: 'sun' | 'moon' | 'asc') => (P ? P.signs[s.key as SignKey][f] : T(`sign.${s.key}.${f}`, s[f]));
  const el = (e: Element) => (P ? P.elements[e] : ELEMENT_INFO[e].name);
  const dimTitle = (d: Dimension) => (P ? P.dimensions[d].title : T(`dimension.${d}.title`, DIMENSION_TEXT[d].title));
  const dimText = (d: Dimension) => (P ? P.dimensions[d].text : T(`dimension.${d}.text`, DIMENSION_TEXT[d].text));
  const fx = (k: FixedKey) => (P ? P.fixed[k] : T(k, FIXED[k]));
  const dom = (k: string) => (P ? (P.domains as Record<string, string>)[k] : T(`domain.${k}`, DOMAIN_TEXT[k]));
  const dur = (k: string) => (P ? (P.durations as Record<string, string>)[k] : T(`duration.${k}`, DURATION_TEXT[k]));
  const elDom = (e: Element) => (P ? P.elementDominant[e] : T(`element.dominant.${e}`, ELEMENT_DOMINANT[e]));
  const elMis = (e: Element) => (P ? P.elementMissing[e] : T(`element.missing.${e}`, ELEMENT_MISSING[e]));
  const ven = (e: Element) => (P ? P.venus[e] : T(`venus.${e}`, VENUS_BY_ELEMENT[e]));
  const mar = (e: Element) => (P ? P.mars[e] : T(`mars.${e}`, MARS_BY_ELEMENT[e]));
  const sat = (e: Element) => (P ? P.saturn[e] : T(`saturn.${e}`, SATURN_BY_ELEMENT[e]));
  const asp = (r: Rule) => (P ? P.aspects[`${r.pair[0]}-${r.pair[1]}-${r.nature}`] ?? r.text : T(aspectKey(r), r.text));
  const SEC = P ? P.sections : FR_SECTIONS;
  const sunText = sText(sun, 'sun');

  const sections: ReadingSection[] = [];

  sections.push({
    key: 'essence', title: SEC.essence, subtitle: fill(SEC.essenceSub, { sign: sName(sun), element: el(sun.element) }),
    preview: true,
    // Correction 1 : transition quand l'élément du Soleil diffère de l'élément dominant.
    paragraphs: [
      `${name}, ${lowerFirst(sunText)}`,
      ...(sun.element !== chart.dominantElement ? [fill(fx('essence.bridge'), { sunEl: el(sun.element) })] : []),
      elDom(chart.dominantElement),
    ],
  });

  const moonParas = [sText(moon, 'moon')];
  if (dims.sensibilite >= 3 && moon.element === 'water') moonParas.push(fx('moon.water-sensitive'));
  if (!chart.timeKnown) moonParas.push(fx('moon.no-time'));
  sections.push({ key: 'emotions', title: SEC.emotions, subtitle: fill(SEC.emotionsSub, { sign: sName(moon) }), preview: true, paragraphs: moonParas });

  if (asc) {
    sections.push({ key: 'masque', title: SEC.masque, subtitle: fill(SEC.masqueSub, { sign: sName(asc) }), preview: true, paragraphs: [sText(asc, 'asc')] });
  }

  // R15 : empreinte du moment, visible sans compte, juste après les sections d'aperçu.
  const imprint = cleanImprint(input.imprint);
  if (imprint) {
    const c = classifyImprint(imprint);
    const IT = (k: ImprintTextKey) => (P ? P.imprint.texts[k] : T(k, IMPRINT_TEXT[k]));
    const IL = P ? P.imprint.labels : IMPRINT_LABELS;
    const tense = c.stability === 'agite' && (['controle', 'blocage', 'trahison', 'porteur'] as Dimension[]).some((x) => topDimensions.includes(x));
    sections.push({
      key: 'empreinte', title: IL.title,
      subtitle: fill(IL.sub, { stab: IL[c.stability], appr: IL[c.approach], px: String(imprint.jitterPx), h: (imprint.hesitationMs / 1000).toFixed(1) }),
      preview: true,
      paragraphs: [
        IT(`imprint.${c.stability}`),
        IT(`imprint.${c.approach}`),
        ...(c.interrupted ? [IT('imprint.interrupted')] : []),
        ...(tense ? [IT('imprint.tension')] : []),
        IT('imprint.note'),
      ],
    });
  }

  const supported = (r: Rule) => {
    const req = ASPECT_REQUIRES[`${r.pair[0]}-${r.pair[1]}-${r.nature}`];
    if (!req) return true;
    return req.dims.some((d) => dims[d] >= 2) || (!!domain && !!req.domains?.includes(domain as DomainKey));
  };
  const patterns = ASPECT_RULES.filter((r) => matchRule(chart, r) && supported(r)).slice(0, 3).map(asp);
  const dimParas = topDimensions.map((d) => `**${dimTitle(d)}.** ${dimText(d)}`);
  sections.push({
    key: 'profondeur', title: SEC.profondeur, subtitle: SEC.profondeurSub,
    preview: false,
    paragraphs: [...dimParas, ...patterns, elMis(chart.weakestElement)],
  });

  sections.push({
    key: 'amour', title: SEC.amour, subtitle: fill(SEC.amourSub, { v: sName(venus), m: sName(mars), s: sName(saturn) }),
    preview: false,
    paragraphs: [ven(venus.element), mar(mars.element), sat(saturn.element)],
  });

  const nowParas: string[] = [];
  if (intention) nowParas.push(fill(fx('now.intention'), { phrase: intention }));
  if (domain && DOMAIN_TEXT[domain]) nowParas.push(dom(domain));
  // Correction 3 : la phrase libre évoque-t-elle un autre domaine que celui choisi ?
  const also = intention ? domainsInText(intention).find((x) => x !== domain) : undefined;
  if (also) nowParas.push(`${fx('now.also')} ${lowerFirst(dom(also))}`);
  const duree = input.answers['duree'];
  if (duree && DURATION_TEXT[duree]) nowParas.push(dur(duree));
  if (nowParas.length) sections.push({ key: 'maintenant', title: SEC.maintenant, preview: false, paragraphs: nowParas });

  const ot = oduText(odu, locale);
  sections.push({
    key: 'odu', title: SEC.odu, subtitle: fill(SEC.oduSub, { name: odu.name, fon: odu.fonName }),
    preview: false,
    // La mention symbolique (règle 4.7) est toujours présente.
    paragraphs: [
      ot.essence,
      fill(SEC.keywords, { k: ot.keywords.join(' · ') }),
      // Correction 4 : la signature ne prétend pas parler de la situation.
      ...(domain && DOMAIN_TEXT[domain] ? [fill(fx('odu.situation'), { domain: P ? P.domainLabels[domain as DomainKey] : DOMAIN_LABEL[domain as DomainKey] })] : []),
      fx('odu.disclaimer'),
    ],
  });

  sections.push({ key: 'voie', title: SEC.voie, preview: false, paragraphs: [fx('voie.1'), fx('voie.2')] });

  const highlights = [lowerFirst(sunText).split('.')[0] + '.', ...topDimensions.slice(0, 2).map(dimTitle)];

  // Correction 6 : accords selon le genre (français uniquement).
  if (locale === 'fr') {
    for (const s of sections) {
      s.title = genderize(s.title, input.gender);
      s.paragraphs = s.paragraphs.map((p) => genderize(p, input.gender));
    }
  }

  return {
    version: 1,
    locale,
    firstName: name,
    highlights,
    sections,
    chart,
    odu: { id: odu.id, slug: odu.slug, name: odu.name, fonName: odu.fonName, marks: odu.marks, keywords: ot.keywords },
    dimensions: dims,
    topDimensions,
    domain,
  };
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
