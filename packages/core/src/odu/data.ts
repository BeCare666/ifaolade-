/**
 * Les 16 Odu Méjì (Ojú Odù), dans l'ordre de séniorité yoruba.
 * marks : de haut en bas. 1 = une marque (I), 2 = deux marques (II).
 * Les résumés sont des points de départ ÉDITABLES par le prêtre depuis l'admin
 * (table OduContent) : chaque lignée enseigne ses propres nuances.
 */
export type Mark = 1 | 2;

export interface MejiBase {
  index: number;
  name: string; // yoruba
  ascii: string; // slug-friendly
  fon: string; // nom Fon (Bénin, système Fá)
  marks: [Mark, Mark, Mark, Mark];
  keywords: string[];
  essence: string;
}

export const MEJI: MejiBase[] = [
  {
    index: 0, name: 'Ogbè', ascii: 'ogbe', fon: 'Gbè', marks: [1, 1, 1, 1],
    keywords: ['lumière', 'commencement', 'vie', 'victoire', 'droiture'],
    essence: "La lumière pleine. Ogbè parle d'ouverture, de naissance des choses, de chemins qui s'éclairent et de la force de la droiture.",
  },
  {
    index: 1, name: 'Ọ̀yẹ̀kú', ascii: 'oyeku', fon: 'Yɛ̀kú', marks: [2, 2, 2, 2],
    keywords: ['nuit', 'mystère', 'ancêtres', 'fin et renaissance', 'protection'],
    essence: "La nuit qui contient la lumière. Ọ̀yẹ̀kú parle des ancêtres, de ce qui se termine pour renaître, et de la protection face à ce qui menace la vie.",
  },
  {
    index: 2, name: 'Ìwòrì', ascii: 'iwori', fon: 'Wòlí', marks: [2, 1, 1, 2],
    keywords: ['introspection', 'discernement', 'vision intérieure', 'transformation'],
    essence: "Le regard qui se retourne vers l'intérieur. Ìwòrì demande de s'examiner, de discerner le vrai du faux et de transformer ce qui doit l'être.",
  },
  {
    index: 3, name: 'Òdí', ascii: 'odi', fon: 'Dí', marks: [1, 2, 2, 1],
    keywords: ['matrice', 'sceau', 'fermeture', 'fertilité', 'obstacle à franchir'],
    essence: "Le sceau et la matrice. Òdí parle de ce qui est fermé pour être protégé, de fertilité, et des obstacles qui précèdent une naissance.",
  },
  {
    index: 4, name: 'Ìrosùn', ascii: 'irosun', fon: 'Lòsò', marks: [1, 1, 2, 2],
    keywords: ['lignée', 'ancêtres', 'sang', 'rêves', 'vigilance'],
    essence: "La mémoire du sang. Ìrosùn relie à la lignée, aux rêves qui avertissent et à la vigilance face à ce qui se prépare.",
  },
  {
    index: 5, name: 'Ọ̀wọ́nrín', ascii: 'owonrin', fon: 'Wɛ̀nlɛ̀n', marks: [2, 2, 1, 1],
    keywords: ['imprévu', 'retournement', 'vitesse', 'chaos fertile'],
    essence: "L'imprévu qui renverse. Ọ̀wọ́nrín parle des retournements soudains, de la vitesse et du désordre qui précède un nouvel ordre.",
  },
  {
    index: 6, name: 'Ọ̀bàrà', ascii: 'obara', fon: 'Abla', marks: [1, 2, 2, 2],
    keywords: ['parole', 'richesse tardive', 'royauté', 'humilité'],
    essence: "Le dernier devenu premier. Ọ̀bàrà parle de la parole qui construit ou détruit et de la prospérité qui vient après le mépris.",
  },
  {
    index: 7, name: 'Ọ̀kànràn', ascii: 'okanran', fon: 'Aklan', marks: [2, 2, 2, 1],
    keywords: ['cœur', 'vérité tranchante', 'conflit', 'justice'],
    essence: "Le cœur qui parle trop vite. Ọ̀kànràn parle de vérité, de conflits nés de la parole et de la justice qui finit par se manifester.",
  },
  {
    index: 8, name: 'Ògúndá', ascii: 'ogunda', fon: 'Gùdá', marks: [1, 1, 1, 2],
    keywords: ['ouvrir le chemin', 'travail', 'fer', 'séparation nette'],
    essence: "La lame qui ouvre la route. Ògúndá parle de travail, de détermination et des séparations nécessaires pour avancer.",
  },
  {
    index: 9, name: 'Ọ̀sá', ascii: 'osa', fon: 'Sá', marks: [2, 1, 1, 1],
    keywords: ['vent', 'changement brusque', 'départ', 'forces de la mère'],
    essence: "Le vent qui déplace. Ọ̀sá parle de changements brusques, de départs, et des forces puissantes qu'il faut respecter.",
  },
  {
    index: 10, name: 'Ìká', ascii: 'ika', fon: 'Ká', marks: [2, 1, 2, 2],
    keywords: ['contrôle', 'prudence', 'parole retenue', 'mesure'],
    essence: "La main qui retient. Ìká parle de prudence, de maîtrise de soi et du pouvoir de la parole gardée.",
  },
  {
    index: 11, name: 'Òtúúrúpọ̀n', ascii: 'oturupon', fon: 'Trukpɛ̀n', marks: [2, 2, 1, 2],
    keywords: ['corps', 'santé', 'terre', 'guérison', 'enfantement'],
    essence: "Le corps et la terre. Òtúúrúpọ̀n parle de santé, de guérison, de l'enfantement et de ce que le corps exprime.",
  },
  {
    index: 12, name: 'Òtúrá', ascii: 'otura', fon: 'Tùlá', marks: [1, 2, 1, 1],
    keywords: ['paix', 'spiritualité', 'vision', 'harmonie'],
    essence: "La paix et la vision. Òtúrá parle d'élévation spirituelle, d'harmonie retrouvée et d'une parole sacrée qui guide.",
  },
  {
    index: 13, name: 'Ìrẹtẹ̀', ascii: 'irete', fon: 'Lɛ̀tɛ̀', marks: [1, 1, 2, 1],
    keywords: ['ténacité', 'persévérance', 'écraser l\'obstacle', 'longévité'],
    essence: "La pression qui finit par vaincre. Ìrẹtẹ̀ parle de persévérance, de ténacité et de victoires obtenues dans la durée.",
  },
  {
    index: 14, name: 'Ọ̀ṣẹ́', ascii: 'ose', fon: 'Cɛ', marks: [1, 2, 1, 2],
    keywords: ['douceur', 'abondance', 'amour', 'victoire sur l\'adversité'],
    essence: "La douceur qui triomphe. Ọ̀ṣẹ́ parle d'abondance, d'amour, de beauté et de victoire sur l'adversité.",
  },
  {
    index: 15, name: 'Òfún', ascii: 'ofun', fon: 'Fú', marks: [2, 1, 2, 1],
    keywords: ['pureté', 'souffle', 'création', 'régénération'],
    essence: "Le blanc originel. Òfún parle de pureté, du souffle créateur et de la régénération profonde.",
  },
];

/** Lecture élémentaire des 4 positions d'une jambe (enseignement de la maison, éditable). */
export const POSITION_ELEMENTS = [
  { key: 'fire', name: 'Feu', yoruba: 'Iná' },
  { key: 'air', name: 'Air', yoruba: 'Afẹ́fẹ́' },
  { key: 'water', name: 'Eau', yoruba: 'Omi' },
  { key: 'earth', name: 'Terre', yoruba: 'Ilẹ̀' },
] as const;
