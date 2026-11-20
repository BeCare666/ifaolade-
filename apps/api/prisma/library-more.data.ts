/**
 * REFONTE R22 (suite, demandée le 2026-11-20) : Odùduwà, Àbíkú, les Dan, Tɔxɔsu, Yalodé.
 * Brouillons publiés, à relire et compléter par le prêtre (les noms et attributs varient selon les couvents).
 */
import type { Seed } from './library.data';

export const LIBRARY_MORE: Seed[] = [
  {
    kind: 'divinite', slug: 'oduduwa', title: 'Odùduwà', subtitle: 'L’ancêtre fondateur d’Ilé-Ifẹ̀', category: 'orisa', order: 13,
    excerpt: "Odùduwà est l'ancêtre dont descendent les rois yoruba. Selon un récit, c'est lui qui posa la terre sur les eaux à Ilé-Ifẹ̀, berceau du monde.",
    meta: { otherNames: 'Odùdúà, Ọlọ́fin', role: 'Fondation, royauté, origine des lignées yoruba', colors: 'Blanc', day: 'Selon les lignées', offerings: 'Escargots, kola blanche, ẹ̀kọ', taboos: 'Selon les lignées', symbols: 'La chaîne, la poule à cinq doigts, la terre posée sur l’eau' },
    oduIds: [0, 255],
    body: `## Qui est-il

Odùduwà est considéré comme l'**ancêtre fondateur** des Yoruba et le père des premiers rois : de ses descendants seraient issus les royaumes d'Ọ̀yọ́, de Kétu et d'autres. Ilé-Ifẹ̀, sa ville, est appelée le berceau du monde.

## Son histoire

Deux récits coexistent. Dans le premier, Olódùmarè confia à Ọbàtálá la tâche de créer la terre ; mais Ọbàtálá, ayant bu du vin de palme, s'endormit en chemin. Odùduwà prit alors la chaîne, descendit sur les eaux, versa la terre contenue dans une coquille et y lâcha une poule à cinq doigts qui l'étala. Ainsi naquit Ilé-Ifẹ̀. Dans le second, Odùduwà est un roi venu d'ailleurs qui unifia les peuples d'Ifẹ̀. Les deux disent la même chose : **il est l'origine**.

## Ce qu'il enseigne

- Savoir d'où l'on vient donne la force de savoir où l'on va.
- Une tâche négligée passe à celui qui veille.
- Les lignées se tiennent par la mémoire de leur fondateur.`,
  },
  {
    kind: 'divinite', slug: 'abiku', title: 'Àbíkú', subtitle: 'Les enfants qui viennent et repartent', category: 'les-deux', order: 14,
    excerpt: "Àbíkú n'est pas une divinité : c'est le nom donné aux enfants qui, selon la tradition, naissent pour mourir jeunes et revenir dans la même famille. Ifá a des réponses pour retenir ces enfants.",
    meta: { otherNames: 'Àbíkú (yoruba : « né pour mourir »), Ogbanje (igbo)', role: 'Phénomène spirituel lié aux naissances et aux enfants', offerings: 'Fixées en consultation', taboos: 'Selon l’Odu de l’enfant', symbols: 'Les noms donnés pour retenir l’enfant (Dúrójayé, Kòkúmọ́, Malọmọ…)' },
    oduIds: [17, 51, 187],
    body: `## Ce que la tradition appelle Àbíkú

Dans la culture yoruba, un **àbíkú** est un enfant venu d'un groupe d'esprits compagnons dans l'autre monde. Il aurait promis à ses compagnons de revenir vite. Il naît, puis meurt jeune, puis renaît dans la même famille, encore et encore, au grand chagrin de sa mère.

## Ce qu'Ifá répond

Ifá ne laisse pas une famille sans réponse. La consultation peut révéler qu'un enfant est àbíkú, et le prêtre propose alors des rites pour **rompre le pacte** avec ses compagnons et le retenir parmi les vivants. On lui donne aussi des noms qui supplient : **Dúrójayé** (« reste pour profiter du monde »), **Kòkúmọ́** (« il ne meurt plus »), **Malọmọ** (« ne repars pas »).

## Ce qu'il faut savoir aujourd'hui

La croyance en l'àbíkú est née à une époque où beaucoup d'enfants mouraient de maladies que l'on soigne aujourd'hui. **Un enfant malade doit d'abord voir un médecin.** Les rites d'Ifá accompagnent la médecine, ils ne la remplacent jamais. Et aucune mère ne doit être accusée de la mort de ses enfants.`,
  },
  {
    kind: 'divinite', slug: 'dan-ayidohwedo', title: 'Dan Ayidohwedo', subtitle: 'Le serpent arc-en-ciel', category: 'vodun', order: 15,
    excerpt: "Ayidohwedo est la forme céleste de Dan : l'arc-en-ciel, serpent qui relie le ciel à la terre et aux eaux. Il porte la richesse et la continuité de la vie.",
    meta: { otherNames: 'Aïdo-Hwedo, Dan Ayido Hwɛdo', role: 'Arc-en-ciel, lien entre le ciel et l’eau, richesse, continuité', colors: 'Les couleurs de l’arc-en-ciel', day: 'Selon le couvent', offerings: 'Selon le couvent', taboos: 'Tuer un serpent sacré', symbols: 'L’arc-en-ciel, le serpent qui se mord la queue' },
    oduIds: [170, 238],
    body: `## Qui est-il

**Ayidohwedo** est le Dan du ciel : l'**arc-en-ciel**. Dans la tradition fon, il est le serpent qui accompagna Mawu pendant la création et qui, enroulé sous la terre, la soutient. On dit que lorsqu'il apparaît dans le ciel, il vient boire aux eaux de la terre.

## Le Dan, plusieurs visages

Dan n'est pas une seule figure. Il se manifeste sous plusieurs formes selon les lieux et les couvents : l'arc-en-ciel (Ayidohwedo), le python (Dangbe à Ouidah), et d'autres Dan honorés dans des familles et des régions précises. Tous partagent une même idée : **le mouvement continu de la vie et de la richesse**.

## Ce qu'il enseigne

- Ce qui relie est plus fort que ce qui sépare.
- La richesse circule ; celui qui la bloque la perd.
- Le monde tient tant que le cercle n'est pas rompu.`,
  },
  {
    kind: 'divinite', slug: 'dangbe', title: 'Dangbe', subtitle: 'Le python sacré de Ouidah', category: 'vodun', order: 16,
    excerpt: "À Ouidah, le python Dangbe est honoré dans le temple des Pythons, face à la basilique. On ne le tue jamais : il a, dit-on, protégé autrefois les habitants.",
    meta: { otherNames: 'Dangbé', role: 'Protection de Ouidah, paix, fécondité', colors: 'Blanc', day: 'Selon le temple', offerings: 'Selon le temple', taboos: 'Tuer ou maltraiter un python', symbols: 'Le python royal, le temple des Pythons de Ouidah' },
    oduIds: [170],
    body: `## Qui est-il

**Dangbe** est la forme terrestre de Dan, incarnée par le **python royal**, serpent paisible et sans venin. Son grand sanctuaire est le **temple des Pythons de Ouidah**, où vivent de nombreux pythons, face à la basilique de l'Immaculée-Conception.

## Son histoire

On raconte qu'au cours d'une guerre, des habitants en fuite se cachèrent dans une forêt où un python vint se placer à l'entrée de leur refuge. Les poursuivants, voyant le serpent, crurent l'endroit vide et passèrent leur chemin. Depuis, le python est sacré : quand il entre dans une maison, on le ramène au temple avec respect, et celui qui en tue un, même par accident, doit accomplir des rites de réparation.

## Ce qu'il enseigne

- La protection vient parfois de ce que l'on craint.
- La paix est une force.
- Respecter le vivant, c'est se protéger soi-même.`,
  },
  {
    kind: 'divinite', slug: 'toxosu', title: 'Tɔxɔsu', subtitle: 'Tohossou · les rois des eaux d’Abomey', category: 'vodun', order: 17,
    excerpt: "Les Tɔxɔsu sont les Vodun royaux du Danxomè : des enfants de rois nés différents, rendus aux eaux et devenus protecteurs du royaume. Zumadunu est le premier d'entre eux.",
    meta: { otherNames: 'Tohossou, Tɔ̀xɔ̀sú (« rois des eaux »)', role: 'Vodun royaux, protection de la famille royale et des enfants nés différents', offerings: 'Selon le couvent', taboos: 'Mépriser un enfant né différent', symbols: 'Les eaux, les lagunes, les couvents royaux d’Abomey' },
    oduIds: [51, 238],
    body: `## Qui sont-ils

Dans le royaume du **Danxomè** (Abomey), les **Tɔxɔsu** (« rois des eaux ») sont des Vodun liés à la famille royale. La tradition dit qu'il s'agit d'enfants de rois nés avec une apparence hors du commun. Ils ne furent pas considérés comme des malheurs, mais comme des êtres surnaturels : on les rendit aux eaux, d'où ils veillent depuis sur le royaume.

## Zumadunu

Le premier et le plus célèbre est **Zumadunu**, présenté comme le fils d'un roi d'Abomey. Le culte des Tɔxɔsu fut organisé au sein de la famille royale et confié à des couvents. Il est indissociable de l'histoire du Danxomè.

## Ce qu'ils enseignent

- Un enfant né différent n'est pas une malédiction : il peut être un protecteur.
- La force d'une lignée inclut ceux qu'on cache.
- La mémoire d'un royaume se garde aussi dans ses eaux.`,
  },
  {
    kind: 'divinite', slug: 'yalode', title: 'Yalodé', subtitle: 'Ìyálóde · la protectrice des femmes', category: 'les-deux', order: 18,
    excerpt: "Ìyálóde est le titre de la première des femmes, « la mère du dehors ». Au Bénin, Yalodé est honorée comme le Vodun des femmes, de leur force et de leur prospérité, proche d'Ọ̀ṣun.",
    meta: { otherNames: 'Ìyálóde (yoruba, titre), Yalodé (Bénin), associée à Ọ̀ṣun', role: 'Protection des femmes, fécondité, commerce, autorité féminine', colors: 'Jaune, blanc', offerings: 'Selon le couvent (miel et douceurs souvent cités)', taboos: 'Le mépris envers les femmes', symbols: 'Les cauris, le miroir, le marché' },
    oduIds: [238, 153],
    body: `## Qui est-elle

Dans les villes yoruba, **Ìyálóde** (« la mère du dehors ») est le titre de la femme qui dirige les femmes, notamment sur les **marchés** : elle siège au conseil et défend leurs intérêts. Ọ̀ṣun est souvent appelée Ìyálóde, la première des femmes.

Au Bénin, **Yalodé** est honorée comme un Vodun : la protectrice des femmes, de leur fécondité, de leur commerce et de leur dignité. Selon les régions et les couvents, elle est rapprochée d'Ọ̀ṣun ou honorée pour elle-même.

## Ce qu'elle enseigne

- L'autorité des femmes est une force pour toute la communauté.
- Le marché, lieu des femmes, est aussi un lieu d'échange sacré.
- Ce qui est fait aux femmes est fait à la vie.

> Yalodé rappelle que la prospérité d'une maison passe par l'honneur qu'on rend à ses femmes.`,
  },
];
