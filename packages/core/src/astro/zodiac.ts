export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

export const ELEMENT_INFO: Record<Element, { name: string; yoruba: string; color: string }> = {
  fire: { name: 'Feu', yoruba: 'Iná', color: '#E4572E' },
  earth: { name: 'Terre', yoruba: 'Ilẹ̀', color: '#B08D57' },
  air: { name: 'Air', yoruba: 'Afẹ́fẹ́', color: '#9FB8D9' },
  water: { name: 'Eau', yoruba: 'Omi', color: '#3D7EA6' },
};

export interface Sign {
  index: number;
  key: string;
  name: string;
  glyph: string;
  element: Element;
  modality: Modality;
  ruler: string;
  keywords: string[];
  sun: string;
  moon: string;
  asc: string;
}

export const SIGNS: Sign[] = [
  {
    index: 0, key: 'aries', name: 'Bélier', glyph: '♈', element: 'fire', modality: 'cardinal', ruler: 'Mars',
    keywords: ['élan', 'courage', 'impatience'],
    sun: "Tu es fait·e pour ouvrir des chemins, pas pour les suivre. Quand tu crois en quelque chose, tu fonces, et ce qui t'use le plus, c'est d'attendre que les autres se décident.",
    moon: "Tes émotions sont des éclairs : elles montent vite, brûlent fort et retombent. Tu as besoin d'agir pour digérer ce que tu ressens. Rester immobile face à une douleur t'est presque insupportable.",
    asc: "Les gens te perçoivent comme direct·e, parfois intimidant·e. On ne devine pas toujours la vulnérabilité derrière ton assurance.",
  },
  {
    index: 1, key: 'taurus', name: 'Taureau', glyph: '♉', element: 'earth', modality: 'fixed', ruler: 'Vénus',
    keywords: ['stabilité', 'loyauté', 'sensualité'],
    sun: "Tu construis lentement, mais ce que tu bâtis tient. Tu as besoin de sécurité concrète : un toit, des revenus, des personnes fiables. L'instabilité te coûte plus qu'aux autres.",
    moon: "Tu te rassures par le concret : manger, toucher, être chez toi. Quand on te bouscule émotionnellement, tu te fermes et tu tiens bon, parfois trop longtemps.",
    asc: "Tu dégages du calme et de la solidité. On vient vers toi pour se poser, et peu de gens voient l'effort que demande cette constance.",
  },
  {
    index: 2, key: 'gemini', name: 'Gémeaux', glyph: '♊', element: 'air', modality: 'mutable', ruler: 'Mercure',
    keywords: ['curiosité', 'parole', 'dualité'],
    sun: "Ton esprit ne s'arrête jamais. Tu comprends vite, tu relies les idées et tu vis souvent deux vies en parallèle : celle qu'on voit et celle qui se passe dans ta tête.",
    moon: "Tu analyses tes émotions au lieu de simplement les vivre. Parler te soulage, mais il t'arrive de rationaliser une blessure pour ne pas la sentir.",
    asc: "On te voit vif·ve, drôle, insaisissable. Tu t'adaptes à chaque personne au point qu'on ne sait pas toujours qui tu es vraiment, et toi non plus, parfois.",
  },
  {
    index: 3, key: 'cancer', name: 'Cancer', glyph: '♋', element: 'water', modality: 'cardinal', ruler: 'Lune',
    keywords: ['famille', 'protection', 'mémoire'],
    sun: "La famille, le foyer et les racines sont au centre de ta vie, même quand tu les fuis. Tu protèges les tiens avec une force qu'on ne soupçonne pas.",
    moon: "Ta mémoire émotionnelle est immense : tu n'oublies ni une blessure ni une bonté. Tu ressens ce que vivent les autres avant même qu'ils ne parlent.",
    asc: "Tu parais doux·ce et réservé·e au premier abord. Tu testes les gens avant de leur ouvrir ta porte, et ceux qui y entrent restent pour la vie.",
  },
  {
    index: 4, key: 'leo', name: 'Lion', glyph: '♌', element: 'fire', modality: 'fixed', ruler: 'Soleil',
    keywords: ['rayonnement', 'fierté', 'générosité'],
    sun: "Tu portes une lumière que les autres remarquent, même quand tu préférerais passer inaperçu·e. Ta dignité compte énormément : être humilié·e est ta plus grande blessure.",
    moon: "Tu as besoin d'être reconnu·e et aimé·e de façon visible. Quand on t'ignore, ça te touche bien plus profondément que tu ne l'admets.",
    asc: "Ta présence remplit l'espace. On te prête de l'assurance, même les jours où tu doutes complètement de toi.",
  },
  {
    index: 5, key: 'virgo', name: 'Vierge', glyph: '♍', element: 'earth', modality: 'mutable', ruler: 'Mercure',
    keywords: ['précision', 'service', 'exigence'],
    sun: "Tu vois les détails que personne ne voit et tu veux que les choses soient justes. Tu rends service sans compter, mais tu es ton juge le plus sévère.",
    moon: "Ton anxiété passe par le contrôle : organiser, prévoir, vérifier. Ton corps somatise souvent ce que ton cœur n'arrive pas à dire.",
    asc: "On te voit sérieux·se, fiable, discret·e. On ne devine pas l'agitation intérieure derrière ce calme.",
  },
  {
    index: 6, key: 'libra', name: 'Balance', glyph: '♎', element: 'air', modality: 'cardinal', ruler: 'Vénus',
    keywords: ['harmonie', 'justice', 'relation'],
    sun: "Tu cherches l'équilibre et la justice en tout. Tu te définis beaucoup à travers tes relations, et le conflit t'épuise au point que tu cèdes parfois contre toi-même.",
    moon: "Tu as besoin de paix autour de toi pour être en paix à l'intérieur. Tu caches tes colères pour préserver l'harmonie, jusqu'au jour où tout sort d'un coup.",
    asc: "Tu dégages du charme et de la diplomatie. Les gens se sentent bien avec toi, mais ils oublient de te demander comment tu vas.",
  },
  {
    index: 7, key: 'scorpio', name: 'Scorpion', glyph: '♏', element: 'water', modality: 'fixed', ruler: 'Pluton / Mars',
    keywords: ['intensité', 'mystère', 'transformation'],
    sun: "Tu vis tout en profondeur, jamais à moitié. Tu sens les intentions cachées et les mensonges, et tu as déjà traversé des épreuves qui t'ont fait renaître.",
    moon: "Tes émotions sont des eaux profondes : tu ressens intensément mais tu montres peu. La trahison est ta blessure centrale, et tu n'oublies jamais.",
    asc: "On te trouve magnétique et difficile à lire. Ton regard met mal à l'aise ceux qui ont quelque chose à cacher.",
  },
  {
    index: 8, key: 'sagittarius', name: 'Sagittaire', glyph: '♐', element: 'fire', modality: 'mutable', ruler: 'Jupiter',
    keywords: ['quête', 'liberté', 'foi'],
    sun: "Tu as besoin de sens, d'horizon et de vérité. L'enfermement, qu'il soit dans un lieu, un travail ou une relation, t'éteint. Tu cherches quelque chose de plus grand que toi.",
    moon: "Tu fuis la lourdeur émotionnelle par l'humour, le voyage ou la spiritualité. Ton optimisme est réel, mais il cache parfois des peines non soignées.",
    asc: "On te voit ouvert·e, franc·che, aventureux·se. Ta franchise peut blesser sans que tu le veuilles.",
  },
  {
    index: 9, key: 'capricorn', name: 'Capricorne', glyph: '♑', element: 'earth', modality: 'cardinal', ruler: 'Saturne',
    keywords: ['responsabilité', 'ambition', 'endurance'],
    sun: "Tu as dû grandir vite. Tu portes des responsabilités lourdes, souvent celles des autres, et tu avances avec une endurance que la vie a forgée.",
    moon: "Tu t'interdis souvent d'être faible. Tu gères tes émotions comme un dossier à régler, et la tendresse que tu donnes, tu as du mal à la recevoir.",
    asc: "Tu parais mature, sérieux·se, presque froid·e. Ceux qui te connaissent savent l'humour et la chaleur derrière cette armure.",
  },
  {
    index: 10, key: 'aquarius', name: 'Verseau', glyph: '♒', element: 'air', modality: 'fixed', ruler: 'Uranus / Saturne',
    keywords: ['indépendance', 'vision', 'différence'],
    sun: "Tu t'es souvent senti·e différent·e, en décalage avec ton milieu. Tu penses en avance, tu refuses les cadres imposés et ta liberté n'est pas négociable.",
    moon: "Tu prends de la distance avec tes émotions pour les comprendre. On te croit détaché·e alors que tu ressens beaucoup, à ta manière.",
    asc: "On te perçoit original·e, indépendant·e, un peu à part. Tu attires les gens singuliers.",
  },
  {
    index: 11, key: 'pisces', name: 'Poissons', glyph: '♓', element: 'water', modality: 'mutable', ruler: 'Neptune / Jupiter',
    keywords: ['intuition', 'compassion', 'perméabilité'],
    sun: "Tu ressens le monde invisible plus que la plupart des gens. Ta compassion est immense, mais tu absorbes les douleurs des autres comme une éponge.",
    moon: "Ta sensibilité est sans frontière : rêves marquants, pressentiments, larmes faciles. Tu as besoin de solitude pour te vider de ce qui ne t'appartient pas.",
    asc: "Tu dégages une douceur un peu rêveuse. Les gens se confient à toi spontanément, souvent trop.",
  },
];

export function signIndexFromLongitude(lon: number): number {
  return Math.floor((((lon % 360) + 360) % 360) / 30);
}

export const ELEMENT_DOMINANT: Record<Element, string> = {
  fire: "Le Feu domine ton thème. Tu vis par l'élan, la passion et l'action. Quand tu es éteint·e, c'est que quelque chose ou quelqu'un étouffe ta flamme, et ta santé comme ton moral en dépendent.",
  earth: "La Terre domine ton thème. Tu as besoin de résultats concrets, de sécurité et de temps. Tu es le pilier sur lequel on s'appuie, souvent au détriment de tes propres besoins.",
  air: "L'Air domine ton thème. Ton mental est ton premier outil : comprendre, parler, relier. Le danger, c'est de vivre dans ta tête et de couper le contact avec ton corps et tes émotions.",
  water: "L'Eau domine ton thème. Tu ressens tout, y compris ce que les autres ne disent pas. Ta sensibilité est un don spirituel réel, à condition d'apprendre à te protéger.",
};

export const ELEMENT_MISSING: Record<Element, string> = {
  fire: "Le Feu est peu présent chez toi. Tu peux manquer d'élan, avoir du mal à commencer ou à t'imposer. On te demande souvent d'oser, et c'est justement ce qui te coûte le plus.",
  earth: "La Terre est peu présente chez toi. La stabilité matérielle, la régularité et l'argent qui reste sont des terrains où tu dois redoubler d'attention : les choses t'échappent si tu ne les ancres pas.",
  air: "L'Air est peu présent chez toi. Prendre du recul, mettre des mots et ne pas tout vivre au premier degré, voilà ce que tu as à apprendre. Tu ressens avant de comprendre.",
  water: "L'Eau est peu présente chez toi. Tu peux paraître dur·e ou trop rationnel·le, alors qu'en vérité tu as appris à ne pas montrer ce qui te touche. Tes émotions attendent un espace sûr.",
};

export const VENUS_BY_ELEMENT: Record<Element, string> = {
  fire: "En amour, tu aimes avec passion et spontanéité. Tu as besoin d'admiration et d'élan. La routine tiède te fait fuir.",
  earth: "En amour, tu donnes de la stabilité et de la fidélité, et tu attends des preuves concrètes plutôt que des mots.",
  air: "En amour, tu as besoin d'un·e partenaire qui stimule ton esprit. La complicité intellectuelle compte autant que l'attirance.",
  water: "En amour, tu fusionnes. Tu aimes profondément, mais tu as peur d'être abandonné·e et tu peux t'oublier dans l'autre.",
};

export const MARS_BY_ELEMENT: Record<Element, string> = {
  fire: "Ton énergie d'action est directe et rapide. Ta colère explose puis s'éteint.",
  earth: "Ton énergie d'action est patiente et tenace. Tu avances lentement, mais rien ne t'arrête.",
  air: "Ton énergie d'action passe par la parole et la stratégie. Tu combats avec les idées.",
  water: "Ton énergie d'action suit tes émotions. Ta colère est rentrée et peut couver longtemps.",
};

export const SATURN_BY_ELEMENT: Record<Element, string> = {
  fire: "Ta leçon de vie porte sur la confiance en toi : oser exister pleinement sans attendre la permission des autres.",
  earth: "Ta leçon de vie porte sur la sécurité matérielle : bâtir pierre après pierre, sans te laisser paralyser par la peur de manquer.",
  air: "Ta leçon de vie porte sur la parole et les relations : dire ta vérité et choisir tes alliances avec lucidité.",
  water: "Ta leçon de vie porte sur les émotions : te protéger sans t'endurcir, et guérir de vieilles blessures familiales.",
};
