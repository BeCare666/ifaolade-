/**
 * REFONTE R22 : contenus de départ de la bibliothèque (brouillons publiés, décision du 2026-11-20).
 * À relire et modifier par le prêtre dans Admin › Bibliothèque. Chaque lignée a ses nuances.
 * Odu liés : identifiants des Méjì (index × 17) : Ogbè 0, Ọ̀yẹ̀kú 17, Ìwòrì 34, Òdí 51, Ìrosùn 68, Ọ̀wọ́nrín 85,
 * Ọ̀bàrà 102, Ọ̀kànràn 119, Ògúndá 136, Ọ̀sá 153, Ìká 170, Òtúúrúpọ̀n 187, Òtúrá 204, Ìrẹtẹ̀ 221, Ọ̀ṣẹ́ 238, Òfún 255.
 */
export interface Seed {
  kind: 'rituel' | 'wasu' | 'divinite';
  slug: string; title: string; subtitle?: string; excerpt: string; body: string; privateBody?: string;
  category: string; meta?: Record<string, string>; oduIds?: number[]; order?: number;
}

const PRIVE = (items: string) => `À compléter par le prêtre selon la lignée et la personne.\n\nÉléments habituellement utilisés (point de départ) :\n${items}\n\nQuantités, jour, heure et paroles : fixés en consultation par la divination.`;

export const LIBRARY: Seed[] = [
  // ---------------------------------------------------------------- Divinités
  {
    kind: 'divinite', slug: 'orunmila', title: 'Ọ̀rúnmìlà', subtitle: 'Fá au Bénin · le témoin de la destinée', category: 'les-deux', order: 1,
    excerpt: "Ọ̀rúnmìlà est la sagesse d'Ifá. Présent quand chaque âme a choisi sa destinée, il est le seul à pouvoir dire, par la divination, ce que cette destinée demande.",
    meta: { otherNames: 'Ifá, Àgbọnnìrègún, Fá (Bénin)', role: 'Sagesse, divination, témoin de la destinée (ẹlẹ́rìí ìpín)', colors: 'Vert et jaune', day: 'Le jour d’Ifá (tous les cinq jours dans le calendrier traditionnel)', offerings: 'Noix de kola, igname pilée, rats et poissons fumés selon les lignées', taboos: 'Le mensonge, l’impatience', symbols: 'L’ọpọ́n (plateau), l’ọ̀pẹ̀lẹ̀ (chapelet), les ikin (noix de palme sacrées), l’ìrọ̀kẹ́' },
    oduIds: [0, 34, 204, 221],
    body: `## Qui est-il

Ọ̀rúnmìlà n'est pas une divinité de la force mais de la connaissance. La tradition dit qu'il était présent quand chaque âme, avant de naître, s'est agenouillée pour choisir sa destinée (orí). C'est pourquoi on l'appelle **ẹlẹ́rìí ìpín**, « le témoin du destin » : lui seul se souvient de ce que tu as choisi.

## Son histoire

On raconte que les divinités descendirent ensemble sur la terre et que chacune reçut un pouvoir. Ọ̀rúnmìlà reçut la parole d'Olódùmarè, rangée dans les 256 Odu. Quand les hommes perdaient leur chemin, ils venaient à lui ; il jetait l'ọ̀pẹ̀lẹ̀, lisait l'Odu et disait quel sacrifice remettrait la vie dans l'ordre. Il eut pour épouse Odù, de qui naquirent les seize Méjì. Au Bénin, on le connaît sous le nom de **Fá**, et ses prêtres sont les **bokɔnɔ**.

## Ce qu'il enseigne

- La destinée existe, mais elle se protège par le caractère (ìwà) et le sacrifice.
- Rien n'arrive sans raison : chaque difficulté a un message.
- Consulter n'est pas chercher une promesse, c'est chercher à comprendre.

> « Ifá ne parle pas pour faire peur ; il parle pour que tu marches droit. »`,
  },
  {
    kind: 'divinite', slug: 'esu', title: 'Èṣù', subtitle: 'Lɛgba au Bénin · le messager des carrefours', category: 'les-deux', order: 2,
    excerpt: "Èṣù porte les sacrifices aux divinités et les messages aux hommes. Sans lui, aucune prière n'arrive. Il n'est pas le mal : il est le gardien de l'ordre et du choix.",
    meta: { otherNames: 'Ẹlẹ́gbára, Lɛgba (Fon), Lɛgbanɔ', role: 'Messager, gardien des carrefours, porteur des sacrifices', colors: 'Rouge et noir', day: 'Le premier jour de la semaine traditionnelle', offerings: 'Huile de palme rouge, alcool, ẹ̀kọ, igname grillée', taboos: 'L’huile de palmiste (àdín)', symbols: 'Le carrefour, le gourdin ògó, la calebasse' },
    oduIds: [85, 119, 34],
    body: `## Qui est-il

Èṣù est le plus mal compris des Òrìṣà. On l'a souvent présenté comme un démon ; c'est une erreur. Il est le **messager** : il porte le sacrifice des hommes jusqu'aux divinités, et c'est lui qui rend une prière efficace. Au Bénin, sous le nom de **Lɛgba**, il garde l'entrée des maisons, des marchés et des villages.

## Son histoire

Un récit célèbre raconte qu'Èṣù traversa un village coiffé d'un bonnet rouge d'un côté et blanc de l'autre. Les cultivateurs des deux bords de la route se disputèrent sur la couleur du bonnet, jusqu'à se battre. Èṣù revint alors et montra les deux côtés. Leçon : chacun ne voit qu'une part de la vérité, et la colère naît de ce qu'on croit tout voir.

## Ce qu'il enseigne

- Chaque choix ouvre un chemin et en ferme un autre.
- Ce qui n'est pas donné à Èṣù lui est pris : celui qui oublie de remercier perd plus qu'il n'économise.
- La vérité a toujours deux faces.

> On salue Èṣù en premier, pour que tout le reste arrive à destination.`,
  },
  {
    kind: 'divinite', slug: 'obatala', title: 'Ọbàtálá', subtitle: 'Lisa au Bénin · le roi au vêtement blanc', category: 'les-deux', order: 3,
    excerpt: "Ọbàtálá a façonné le corps des humains. Divinité de la pureté, de la patience et de la justice, il est vêtu de blanc et demande un cœur droit.",
    meta: { otherNames: 'Òrìṣà-ńlá, Ọbàtálá, Lisa (Fon, uni à Mawu)', role: 'Créateur des corps, pureté, sagesse, justice', colors: 'Blanc', day: 'Le jour d’Òrìṣà-ńlá dans le calendrier traditionnel', offerings: 'Escargots (ìgbín), ẹ̀kọ, kola blanche, beurre de karité, eau fraîche', taboos: 'Le vin de palme, l’huile de palme, le sel selon les lignées', symbols: 'Le kaolin (ẹfun), le tissu blanc, l’escargot' },
    oduIds: [0, 204, 255],
    body: `## Qui est-il

Ọbàtálá, le « roi au vêtement blanc », est l'Òrìṣà à qui Olódùmarè confia la tâche de façonner le corps des humains. Il est la pureté, la patience et la justice. Au Bénin, il correspond à **Lisa**, uni à **Mawu** dans le couple créateur Mawu-Lisa.

## Son histoire

On raconte qu'Ọbàtálá, pendant qu'il façonnait les humains, but du vin de palme et que ses mains devinrent moins sûres. Certains corps naquirent différents. Revenu à lui, il fit le serment de ne plus jamais boire de vin de palme, et devint le protecteur de toutes les personnes nées avec un handicap. C'est pourquoi ses fidèles évitent l'alcool et respectent ceux que la vie a faits autrement.

## Ce qu'il enseigne

- La patience vaut plus que la force.
- Une faute reconnue devient une sagesse.
- Tout être humain a été façonné avec soin : nul ne doit être méprisé.

> Ce qui est blanc ne se salit pas de lui-même ; c'est la main qui le salit.`,
  },
  {
    kind: 'divinite', slug: 'ogun', title: 'Ògún', subtitle: 'Gu au Bénin · le maître du fer et des chemins', category: 'les-deux', order: 4,
    excerpt: "Ògún a ouvert le chemin de la forêt pour que les autres divinités puissent descendre sur la terre. Maître du fer, du travail et de la vérité, il protège ceux qui travaillent.",
    meta: { otherNames: 'Ògún Onírè, Gu (Fon)', role: 'Fer, outils, travail, chemins, chasse, vérité des serments', colors: 'Vert et noir', day: 'Le jour d’Ògún dans le calendrier traditionnel', offerings: 'Igname grillée, huile de palme, vin de palme, kola, chien selon les lignées', taboos: 'Le mensonge prononcé sur le fer', symbols: 'La machette, le fer, la feuille de palmier (màrìwò)' },
    oduIds: [136, 51, 119],
    body: `## Qui est-il

Ògún est le maître du **fer**. Sans lui, pas d'outil, pas de champ, pas de route, pas de voiture. Il est le patron de tous ceux qui travaillent le métal : forgerons, chasseurs, mécaniciens, chauffeurs, chirurgiens. Au Bénin, il est **Gu**, et la célèbre statue de fer de Gu d'Abomey le représente.

## Son histoire

Quand les divinités voulurent descendre sur la terre, une forêt impénétrable leur barrait la route. Aucune n'y parvint. Ògún prit sa machette de fer et ouvrit le chemin. En remerciement, les autres voulurent le faire roi. Il régna sur la ville d'Ìrè, mais un jour, trouvant ses sujets silencieux à son retour, il crut à une offense et frappa dans sa colère. Quand il comprit qu'ils observaient un jour de silence rituel, il planta sa machette dans le sol et disparut dans la terre. On jure depuis sur le fer : Ògún punit le parjure.

## Ce qu'il enseigne

- Le travail ouvre les routes que la chance ne trouve pas.
- La colère fait regretter ce que la force a fait.
- Une parole donnée sur le fer est sacrée.

> Ògún a ouvert la route ; à toi de la parcourir.`,
  },
  {
    kind: 'divinite', slug: 'sango', title: 'Ṣàngó', subtitle: 'Hɛvioso au Bénin · le tonnerre et la justice', category: 'les-deux', order: 5,
    excerpt: "Ancien roi d'Ọ̀yọ́ devenu divinité du tonnerre, Ṣàngó punit le mensonge et le vol. Il est la justice qui frappe d'en haut, la fierté, la danse et le feu.",
    meta: { otherNames: 'Jàkúta, Ọba Kòso, Hɛvioso (Xɛbioso, Fon)', role: 'Tonnerre, foudre, justice, royauté', colors: 'Rouge et blanc', day: 'Le jour de Jàkúta dans le calendrier traditionnel', offerings: 'Bélier, àmàlà et gombo, kola amère (orógbó)', taboos: 'Les haricots blancs (ẹ̀wà sẹ́ẹ́sẹ́), le mensonge', symbols: 'La double hache (oṣé), les pierres de foudre (ẹdùn àrá), le tambour bàtá' },
    oduIds: [102, 68, 119],
    body: `## Qui est-il

Ṣàngó fut, selon la tradition, le quatrième roi (Aláàfin) d'Ọ̀yọ́. Puissant, fier, maître du feu, il devint après sa mort l'Òrìṣà du **tonnerre** et de la **justice**. Au Bénin, la foudre est **Hɛvioso** ; les deux figures se rejoignent.

## Son histoire

On raconte que Ṣàngó, cherchant à maîtriser le feu du ciel, provoqua par mégarde la foudre sur son propre palais. Sa famille périt. Abandonné de ses proches, il quitta la ville. Ses ennemis dirent : « Ọba so » (le roi s'est pendu). Ses fidèles répondirent : « Ọba kò so » (le roi ne s'est pas pendu) : il est monté au ciel et parle par le tonnerre. Depuis, quand la foudre tombe sur une maison, on dit que Ṣàngó a frappé un menteur ou un voleur.

## Ce qu'il enseigne

- Le pouvoir sans maîtrise se retourne contre celui qui le tient.
- La justice peut tarder, elle ne s'égare pas.
- La fierté est belle quand elle protège, dangereuse quand elle méprise.

> Ṣàngó n'a pas besoin de crier : son tonnerre suffit.`,
  },
  {
    kind: 'divinite', slug: 'oya', title: 'Ọya', subtitle: 'Le vent, la tempête et la rivière Niger', category: 'orisa', order: 6,
    excerpt: "Ọya est le vent qui précède l'orage, la tempête qui change tout. Épouse de Ṣàngó, gardienne des portes entre les vivants et les morts, elle est la force du changement.",
    meta: { otherNames: 'Ọya Ìyánsàn, la rivière Niger (Odò Ọya)', role: 'Vent, tempête, changement, passage entre la vie et la mort', colors: 'Bordeaux, brun', day: 'Le jour de Ṣàngó, avec lui', offerings: 'Àkàrà (beignets de haricots), aubergines, vin de palme', taboos: 'La viande de bélier (àgbò)', symbols: 'Le chasse-mouches (ìrùkẹ̀), le sabre, les cornes de buffle' },
    oduIds: [153],
    body: `## Qui est-elle

Ọya est le **vent** : la brise qui annonce l'orage, et la tempête qui arrache. Elle est l'épouse la plus fidèle de Ṣàngó, celle qui marche devant lui. Elle garde aussi la porte entre le monde des vivants et celui des ancêtres, et accompagne les âmes au moment de la mort.

## Son histoire

La tradition raconte qu'Ọya pouvait se changer en buffle. Un chasseur la vit retirer sa peau de buffle au bord de la forêt, la cacha et l'épousa. Elle lui donna neuf enfants (d'où son nom Ìyánsàn, « mère de neuf »), à condition qu'il ne révèle jamais son secret. Une épouse jalouse le lui jeta un jour au visage. Ọya reprit sa peau, laissa ses cornes à ses enfants pour qu'ils l'appellent en cas de danger, et retourna à la forêt.

## Ce qu'elle enseigne

- Le changement n'est pas une punition : c'est le souffle de la vie.
- Un secret confié est sacré ; le trahir détruit le foyer.
- La force d'une femme ne se possède pas.

> Quand le vent se lève, ne lui demande pas de se taire : demande-lui où il te conduit.`,
  },
  {
    kind: 'divinite', slug: 'osun', title: 'Ọ̀ṣun', subtitle: 'Les eaux douces, l’amour et la fécondité', category: 'orisa', order: 7,
    excerpt: "Ọ̀ṣun est la rivière douce qui nourrit, soigne et rend fécond. Seule femme parmi les premières divinités descendues sur la terre, elle prouva que rien ne réussit sans elle.",
    meta: { otherNames: 'Ọ̀ṣun Òṣogbo, Yèyé', role: 'Eaux douces, amour, beauté, fécondité, richesse, guérison', colors: 'Jaune, ambre', day: 'Le jour d’Ọ̀ṣun dans le calendrier traditionnel', offerings: 'Miel, oranges, ẹ̀kọ, poisson de rivière, cauris', taboos: 'Le manque de respect envers les femmes', symbols: 'Le miroir, l’éventail, les bracelets de cuivre, la rivière Ọ̀ṣun à Òṣogbo' },
    oduIds: [238, 68, 102],
    body: `## Qui est-elle

Ọ̀ṣun est la **rivière douce** : celle qui donne à boire, qui lave, qui soigne. Elle est l'amour, la beauté, la fécondité et la richesse. Son grand sanctuaire, la forêt sacrée d'Ọ̀ṣun-Òṣogbo au Nigeria, est inscrit au patrimoine mondial de l'UNESCO.

## Son histoire

Quand Olódùmarè envoya les seize premières divinités organiser la terre, Ọ̀ṣun était la seule femme. Les hommes tinrent leurs conseils sans elle. Alors plus rien ne réussit : la pluie ne tomba plus, les femmes ne conçurent plus, les sacrifices n'étaient pas acceptés. Les divinités remontèrent voir Olódùmarè, qui leur demanda : « Où est Ọ̀ṣun ? » Elles revinrent vers elle et lui demandèrent pardon. Dès qu'elle fut associée, la vie reprit.

## Ce qu'elle enseigne

- La douceur n'est pas la faiblesse : c'est elle qui fait vivre.
- Une assemblée qui écarte les femmes se prive de la vie.
- L'abondance se partage, ou elle se tarit.

> La rivière contourne le rocher, et c'est elle qui arrive à la mer.`,
  },
  {
    kind: 'divinite', slug: 'yemoja', title: 'Yemọja', subtitle: 'La mère dont les enfants sont des poissons', category: 'orisa', order: 8,
    excerpt: "Yemọja est la mère des eaux et la mère de nombreux Òrìṣà. Elle protège les femmes, les enfants et les voyageurs, et porte la patience immense de l'océan.",
    meta: { otherNames: 'Yemọja (Yeyé ọmọ ẹja), Yemanjá (Brésil), Yemayá (Cuba)', role: 'Maternité, eaux, protection des femmes et des enfants', colors: 'Bleu et blanc', day: 'Le jour des eaux dans le calendrier traditionnel', offerings: 'Melon, poisson, mélasse, fleurs blanches', taboos: 'Négliger sa mère', symbols: 'Les coquillages, l’éventail, la mer, la rivière Ògùn' },
    oduIds: [51, 238],
    body: `## Qui est-elle

Son nom vient de **Yeyé ọmọ ẹja** : « la mère dont les enfants sont des poissons ». Yemọja est la grande mère des eaux et la mère de plusieurs Òrìṣà. Dans la diaspora (Brésil, Cuba), elle est devenue la reine de la mer, sous les noms de Yemanjá et Yemayá.

## Son histoire

On raconte que Yemọja, maltraitée par un époux qui se moquait de son corps de mère, s'enfuit. Il la poursuivit. Dans sa fuite, elle tomba, et de son corps jaillirent les rivières et la lagune, puis naquirent plusieurs divinités. La mère blessée devint ainsi la source de la vie qui coule. Depuis, celui qui méprise une mère s'expose à sa tristesse, aussi profonde que l'eau.

## Ce qu'elle enseigne

- Une mère se respecte, toujours.
- La patience de l'eau use la pierre.
- Ce qui est blessé peut devenir source.

> L'océan n'a pas de bord ; l'amour d'une mère non plus.`,
  },
  {
    kind: 'divinite', slug: 'obaluaye-sakpata', title: 'Ọbalúayé · Sakpata', subtitle: 'Le maître de la terre et des maladies', category: 'les-deux', order: 9,
    excerpt: "Ọbalúayé, Sakpata au Bénin, est le roi de la terre. Il envoie la maladie et la retire. On le respecte au point de ne prononcer son nom qu'avec précaution.",
    meta: { otherNames: 'Ṣọ̀pọ̀nná, Ọmọlu, Sakpata (Fon), Ayíxɔ́su (roi de la terre)', role: 'Terre, maladie et guérison, épidémies', colors: 'Rouge, noir et blanc tachetés ; brun', day: 'Le jour de Sakpata dans le calendrier traditionnel', offerings: 'Maïs grillé, haricots, huile de palme', taboos: 'Prononcer son nom à la légère', symbols: 'Le balai sacré (ṣàṣàrá), le costume de raphia qui couvre le visage' },
    oduIds: [187, 221],
    body: `## Qui est-il

Ọbalúayé (« le roi qui possède le monde »), appelé **Sakpata** au Bénin, est le maître de la **terre**. Il est aussi le maître de la maladie : il la donne, et lui seul peut la retirer. Pour ne pas l'offenser, on l'appelle souvent par des surnoms, comme Ayíxɔ́su, « roi de la terre ».

## Son histoire

On raconte qu'il arriva un jour à une fête des divinités, le corps couvert de plaies, et qu'on se moqua de lui pendant qu'il dansait. Blessé, il répandit la maladie. Ọya, ou selon d'autres Yemọja, couvrit son corps d'un habit de raphia et le soigna. Depuis, il danse le visage caché, et ses prêtres sont réputés connaître les plantes qui guérissent.

## Ce qu'il enseigne

- On ne se moque jamais de celui qui souffre.
- La terre porte tout le monde et n'oublie pas qui la piétine.
- La maladie est aussi un message : elle demande de prendre soin.

> Au Bénin comme ailleurs, l'hommage à Sakpata ne remplace jamais le médecin ; il l'accompagne.`,
  },
  {
    kind: 'divinite', slug: 'dan', title: 'Dan', subtitle: 'Le serpent arc-en-ciel · Vodun de la continuité', category: 'vodun', order: 10,
    excerpt: "Dan est le serpent qui porte la terre et relie le ciel à l'eau. Vodun de la continuité, de la richesse et de la vie qui se transmet, il est honoré à Ouidah au temple des Pythons.",
    meta: { otherNames: 'Dan Ayidohwedo (l’arc-en-ciel), Dangbe (le python de Ouidah)', role: 'Continuité, richesse, mouvement de la vie, arc-en-ciel', colors: 'Les couleurs de l’arc-en-ciel, blanc', day: 'Selon le couvent', offerings: 'Œufs, eau, lait selon les couvents', taboos: 'Tuer ou maltraiter un python', symbols: 'Le serpent qui se mord la queue, l’arc-en-ciel, le temple des Pythons de Ouidah' },
    oduIds: [170, 238],
    body: `## Qui est-il

**Dan** est un Vodun majeur du Bénin. Il est le serpent qui s'enroule autour de la terre pour la soutenir, et l'arc-en-ciel (**Ayidohwedo**) qui relie le ciel et les eaux. Il est la **continuité** : ce qui se transmet, ce qui circule, la richesse qui passe de main en main. À Ouidah, le python **Dangbe** est honoré dans le temple des Pythons.

## Son histoire

La tradition raconte que lorsque la terre fut créée, elle était trop lourde pour tenir. Le serpent s'enroula autour d'elle et la porta ; tant qu'il tient sa queue dans sa bouche, le monde ne se défait pas. À Ouidah, on raconte aussi qu'un python protégea autrefois les habitants en fuite en les cachant : depuis, on ne tue pas le python, et quand il entre dans une maison, on le reconduit avec respect.

## Ce qu'il enseigne

- La vie est un cercle : ce que tu donnes revient.
- La richesse doit circuler pour rester vivante.
- La patience et la discrétion protègent.

> Le serpent qui se tait vit longtemps.`,
  },
  {
    kind: 'divinite', slug: 'egungun', title: 'Egúngún', subtitle: 'Kúvitó au Bénin · les ancêtres qui reviennent', category: 'les-deux', order: 11,
    excerpt: "Les Egúngún sont les ancêtres qui reviennent danser parmi les vivants, sous des costumes qui couvrent tout le corps. Ils rappellent que les morts ne sont pas absents.",
    meta: { otherNames: 'Egún, Kúvitó (Fon), les Revenants', role: 'Ancêtres, mémoire de la lignée, justice familiale', colors: 'Toutes les couleurs des tissus d’apparat', day: 'Les fêtes annuelles des Revenants', offerings: 'Nourriture partagée en famille, eau, kola', taboos: 'Toucher un Egúngún, manquer de respect aux défunts', symbols: 'Le costume (agọ̀) qui couvre tout le corps, la voix transformée' },
    oduIds: [17, 68, 187],
    body: `## Qui sont-ils

Les **Egúngún** (au Bénin, **Kúvitó**, les Revenants) sont les ancêtres de la lignée qui reviennent visiter les vivants. Ils apparaissent sous des costumes somptueux qui couvrent tout le corps : aucun bout de peau ne doit être visible, car celui qui danse n'est plus un homme, c'est un ancêtre.

## Leur histoire

On raconte qu'autrefois les vivants oubliaient leurs morts. Les malheurs se multipliaient : maladies, querelles, enfants qui ne naissaient pas. Ifá révéla que les ancêtres, oubliés, souffraient et n'avaient plus la force de protéger leurs descendants. On institua alors les fêtes des Egúngún : chaque année, les ancêtres reviennent, bénissent, rendent la justice dans les familles, puis repartent.

## Ce qu'ils enseignent

- Tu ne viens pas de nulle part : tu es la suite de quelqu'un.
- Ce qui n'a pas été réglé par les anciens peut revenir vers les jeunes.
- Honorer ses morts, c'est protéger ses enfants.

> Les morts ne sont pas morts : ils marchent derrière toi.`,
  },
  {
    kind: 'divinite', slug: 'ori', title: 'Orí', subtitle: 'Ta tête, ta première divinité', category: 'orisa', order: 12,
    excerpt: "Orí est la tête intérieure, la destinée choisie avant la naissance. La tradition dit qu'aucun Òrìṣà ne peut aider une personne si son Orí ne l'accepte pas.",
    meta: { otherNames: 'Orí inú (la tête intérieure), Ẹ̀lẹ́dàá', role: 'Destinée personnelle, intuition, chance', colors: 'Blanc', day: 'Chaque matin', offerings: 'Eau fraîche, kola blanche, beurre de karité, prière', taboos: 'Agir contre sa conscience', symbols: 'La tête, l’ìbọrí (sanctuaire de la tête)' },
    oduIds: [0, 34],
    body: `## Qui est-il

**Orí** signifie « tête ». Mais il ne s'agit pas seulement de la tête de chair : c'est l'**Orí inú**, la tête intérieure, la destinée que chacun a choisie avant de naître. Ifá enseigne que c'est la première divinité de chaque personne.

## Son histoire

Un récit d'Ifá raconte que les Òrìṣà furent un jour invités à un long voyage à travers un fleuve dangereux. Chacun promit d'accompagner son fidèle jusqu'au bout. Mais au moment de traverser, un à un, ils s'arrêtèrent. Seul Orí traversa avec la personne jusqu'à l'autre rive. Ifá conclut : « Aucun Òrìṣà ne peut bénir un homme sans l'accord de son Orí. »

## Ce qu'il enseigne

- Ta destinée t'appartient : elle se soigne chaque jour.
- Écoute ton intuition avant d'écouter la foule.
- Personne ne peut marcher à ta place.

> Ce que la tête a choisi, les pieds finissent par le trouver.`,
  },

  // ---------------------------------------------------------------- Rituels (défense et renvoi seulement)
  {
    kind: 'rituel', slug: 'deblocage-isilekun', title: 'Rituel de déblocage', subtitle: 'Ìṣílẹ̀kùn · ouvrir ce qui est fermé', category: 'deblocage', order: 1,
    excerpt: "Quand tout semble bloqué malgré les efforts (dossier, emploi, mariage, projet), Ifá cherche d'abord la cause. Le rituel de déblocage répond à cette cause, pas aux symptômes.",
    meta: { when: 'Après une consultation qui a identifié un blocage et sa cause', duration: 'Une séance, parfois suivie d’une seconde après sept jours' },
    oduIds: [51, 221, 136],
    body: `## Le sens

Dans Ifá, un blocage n'est jamais un hasard. Il peut venir d'un interdit transgressé, d'une dette envers les ancêtres, d'une parole donnée et non tenue, ou d'une jalousie. Le rituel de déblocage ne force pas une porte : il **retire ce qui la tient fermée**.

## Le déroulé général

1. **La consultation** : l'Odu sorti dit d'où vient le blocage et ce qui doit être offert.
2. **La préparation** : le babaláwo rassemble les éléments que l'Odu a demandés.
3. **Le rituel** : prières, paroles de l'Odu, offrande portée à la divinité concernée. La personne y participe ou y assiste en direct.
4. **La clôture** : on vérifie par l'ọ̀pẹ̀lẹ̀ que l'offrande est acceptée.
5. **Le suivi** : à J+7, J+30 et J+90, on regarde ensemble ce qui a bougé.

## Ce qu'il ne fait pas

Il ne remplace ni les démarches, ni le travail, ni un avocat. Il remet la personne dans le bon courant ; c'est elle qui marche.`,
    privateBody: PRIVE('- Noix de kola (obì)\n- Eau fraîche\n- Huile de palme\n- Un tissu blanc\n- Éléments propres à l’Odu sorti'),
  },
  {
    kind: 'rituel', slug: 'protection-maison', title: 'Protection de la maison et de la famille', subtitle: 'Ààbò ilé', category: 'protection', order: 2,
    excerpt: "Protéger le foyer, c'est protéger tout ce qui y vit. Ce rituel place la maison sous la garde d'Èṣù à la porte et des ancêtres à l'intérieur.",
    meta: { when: 'À l’installation dans une nouvelle maison, ou après une période de troubles répétés', duration: 'Une séance' },
    oduIds: [17, 51, 85],
    body: `## Le sens

La tradition considère la maison comme un corps : elle a une porte (la bouche), un cœur (le lieu où l'on se réunit) et des ancêtres qui l'habitent. Quand les disputes, les maladies ou les pertes s'enchaînent, Ifá peut demander de **refermer les ouvertures** par où le malheur entre.

## Le déroulé général

1. Consultation sur la maison et ses habitants.
2. Salut à Èṣù (Lɛgba), gardien du seuil.
3. Prières pour les ancêtres de la famille.
4. Offrande et paroles de protection à l'entrée et au centre de la maison.
5. Vérification par l'ọ̀pẹ̀lẹ̀.

## Ce qu'il demande

La paix entre les habitants. Un rituel de protection ne tient pas dans une maison où l'on se maudit chaque jour.`,
    privateBody: PRIVE('- Huile de palme et ẹ̀kọ pour Èṣù\n- Kola\n- Eau\n- Kaolin (ẹfun)\n- Éléments propres à l’Odu sorti'),
  },
  {
    kind: 'rituel', slug: 'defense-renvoi', title: 'Défense et renvoi du mal', subtitle: 'Ìdápadà · rendre le mal à son origine', category: 'defense', order: 3,
    excerpt: "Quand une attaque spirituelle est confirmée par la divination, ce rituel protège la personne et renvoie le mal à son origine. Il ne vise jamais à nuire à quelqu'un.",
    meta: { when: 'Uniquement quand la consultation confirme une attaque', duration: 'Une séance, avec protection à porter ensuite' },
    oduIds: [119, 136, 170],
    body: `## Le sens

Ifá reconnaît que la jalousie et la malveillance existent. Mais il enseigne aussi que **celui qui envoie le mal le reçoit en retour**. Le rituel de défense ne crée pas de mal nouveau : il **ferme la personne** à ce qui lui est envoyé et laisse ce mal retourner d'où il vient. C'est la règle de la maison : aucun rituel n'est fait ici pour nuire à une personne nommée.

## Le déroulé général

1. **Vérifier** : la divination dit s'il s'agit vraiment d'une attaque, ou d'autre chose (santé, conflit, choix personnels). Beaucoup de « attaques » n'en sont pas.
2. **Protéger** : prières à Ògún et à Èṣù, gardiens des chemins.
3. **Renvoyer** : paroles de l'Odu qui rendent au mal sa direction d'origine.
4. **Fermer** : un élément de protection que la personne garde.
5. **Suivre** : nous revenons vers toi à J+7, J+30, J+90.

## Ce qu'il ne fait pas

Il ne punit personne, ne nomme pas de coupable et ne remplace pas une plainte ou un médecin quand il en faut un.`,
    privateBody: PRIVE('- Éléments pour Ògún et Èṣù (huile de palme, kola, alcool)\n- Feuilles prescrites par l’Odu\n- Élément de protection à porter\n- Éléments propres à l’Odu sorti'),
  },
  {
    kind: 'rituel', slug: 'bain-purification', title: 'Bain de purification', subtitle: 'Ìwẹ̀ · laver ce qui alourdit', category: 'purification', order: 4,
    excerpt: "Le bain de feuilles est l'un des gestes les plus anciens d'Ifá. Il lave ce qui alourdit : fatigue spirituelle, deuil, contact avec la mort, sentiment de souillure.",
    meta: { when: 'Après un deuil, une rupture, une période sombre, ou avant un nouveau départ', duration: 'Un à sept bains selon l’Odu' },
    oduIds: [255, 17, 204],
    body: `## Le sens

Les feuilles (ewé) ont chacune leur parole. Préparées avec les paroles d'Ifá, elles deviennent un **bain** qui lave le corps et la tête. On ne se lave pas seulement de la saleté : on se lave de ce qui colle à l'âme.

## Le déroulé général

1. La consultation désigne les feuilles et le nombre de bains.
2. Le babaláwo prépare l'eau de feuilles en récitant les paroles de l'Odu.
3. La personne se lave, de préférence à l'aube, en commençant par la tête.
4. On laisse sécher sans s'essuyer, puis on porte du blanc.
5. Les restes du bain sont rendus à la terre ou à l'eau courante.

## Ce qu'il demande

De la discrétion et du calme pendant les jours du bain. Une purification se garde par la parole et les actes.`,
    privateBody: PRIVE('- Feuilles désignées par l’Odu\n- Eau de source ou de pluie\n- Savon noir (ọṣẹ dúdú)\n- Tissu blanc'),
  },
  {
    kind: 'rituel', slug: 'ouverture-chemins', title: 'Ouverture des chemins', subtitle: 'Ìlà ọ̀nà · avec Èṣù et Ògún', category: 'chemins', order: 5,
    excerpt: "Avant un voyage, un nouveau travail, une démarche importante, on demande à Èṣù et à Ògún d'ouvrir la route. Ce rituel prépare le terrain pour que l'effort porte.",
    meta: { when: 'Avant un départ, un entretien, une installation, un lancement', duration: 'Une séance' },
    oduIds: [85, 136, 153],
    body: `## Le sens

Èṣù garde les carrefours, Ògún ouvre les routes. Ensemble, ils décident si un chemin s'ouvre ou se ferme. Ouvrir les chemins, ce n'est pas obtenir un résultat garanti : c'est **retirer les obstacles invisibles** pour que les efforts visibles portent.

## Le déroulé général

1. Consultation sur la démarche à venir.
2. Salut et offrande à Èṣù au carrefour symbolique.
3. Offrande à Ògún pour la route.
4. Paroles de l'Odu sur le chemin à prendre.
5. Vérification, puis conseils concrets pour la démarche.

## Ce qu'il demande

De faire ta part : préparer ton dossier, ton entretien, ton voyage. Ifá ouvre, tu marches.`,
    privateBody: PRIVE('- Huile de palme, ẹ̀kọ, alcool pour Èṣù\n- Igname grillée et kola pour Ògún\n- Éléments propres à l’Odu sorti'),
  },
  {
    kind: 'rituel', slug: 'prosperite-aje', title: 'Rituel de prospérité', subtitle: 'Ajé · appeler l’abondance', category: 'prosperite', order: 6,
    excerpt: "Ajé est la force de la richesse. Ce rituel demande que le travail porte des fruits et que l'argent gagné reste, au lieu de filer entre les doigts.",
    meta: { when: 'Au lancement d’une activité, ou quand l’argent gagné ne reste jamais', duration: 'Une séance, renouvelée selon l’Odu' },
    oduIds: [238, 102, 221],
    body: `## Le sens

Dans la tradition, **Ajé** est la force de la richesse, liée au cauri (ancienne monnaie) et à Ọ̀ṣun. Ifá distingue gagner de l'argent et le garder : beaucoup gagnent, peu gardent. Le rituel s'adresse aux deux.

## Le déroulé général

1. Consultation : l'Odu dit pourquoi l'argent ne vient pas ou ne reste pas (dettes spirituelles, interdits, mauvaise association).
2. Offrande à Ajé et à la divinité désignée.
3. Paroles de l'Odu sur le partage et la gestion.
4. Un objet de prospérité confié à la personne.
5. Suivi à J+30 et J+90.

## Ce qu'il demande

Le partage et l'honnêteté. Ifá répète que l'abondance qui ne se partage pas se tarit.`,
    privateBody: PRIVE('- Cauris\n- Miel\n- Kola\n- Éléments pour Ọ̀ṣun\n- Éléments propres à l’Odu sorti'),
  },

  // ---------------------------------------------------------------- Wáàsù
  {
    kind: 'wasu', slug: 'tu-nes-pas-ne-par-hasard', title: 'Tu n’es pas né par hasard', category: 'sens', order: 1,
    excerpt: "Avant de naître, dit Ifá, tu t'es agenouillé et tu as choisi. Ce que tu vis n'est pas une punition aveugle : c'est un chemin que ton âme connaît déjà.",
    meta: { quote: '« Ce que la tête a choisi, les pieds finissent par le trouver. »' },
    oduIds: [0, 34],
    body: `Il y a des jours où l'on se demande pourquoi on est là. Pourquoi ces épreuves, pourquoi cette famille, pourquoi ce pays, pourquoi ce corps. Ifá répond par une histoire.

## L'agenouillement

Avant de naître, chaque âme se présente devant Olódùmarè. Elle s'agenouille (**àkúnlẹ̀yàn**, « ce que l'on choisit à genoux ») et choisit sa tête, sa destinée. Ọ̀rúnmìlà est là, témoin. Puis l'âme passe la porte de la naissance et oublie. Elle oublie, mais son Orí se souvient.

C'est pourquoi tu sens parfois, au fond de toi, qu'une chose est juste ou qu'une autre ne l'est pas, sans pouvoir l'expliquer. Ce n'est pas un caprice : c'est ta tête qui se souvient de ce que tu as choisi.

## Ce que cela change

Si tu as choisi, alors **ta vie a un sens, même quand tu ne le vois pas**. L'épreuve n'est pas un mur ; c'est un passage que tu as accepté pour devenir quelqu'un. Cela ne veut pas dire qu'il faut tout subir. Ifá dit aussi que la destinée se protège : par le caractère, par le sacrifice, par les bons choix.

## Ce que tu peux faire aujourd'hui

- Remercie ta tête chaque matin, même d'une phrase.
- Quand une décision t'inquiète, demande-toi : « Est-ce que ceci ressemble à la personne que je suis venue être ? »
- Ne compare pas ton chemin à celui des autres : ils n'ont pas choisi la même chose que toi.

Tu n'es pas là par erreur. Tu es là parce que tu l'as voulu, avant même de savoir parler.`,
  },
  {
    kind: 'wasu', slug: 'iwa-le-caractere', title: 'Ìwà : le caractère est la vraie beauté', category: 'iwa', order: 2,
    excerpt: "Ifá raconte qu'Ọ̀rúnmìlà épousa Ìwà, le Caractère, puis la perdit en la négligeant. Il dut tout abandonner pour la retrouver. Aucune richesse ne remplace un bon caractère.",
    meta: { quote: '« Ìwà lẹ̀sìn » : le caractère est la vraie religion.' },
    oduIds: [0, 170, 255],
    body: `On parle beaucoup de chance, de protection, de rituels. Ifá, lui, parle d'abord d'autre chose : **ìwà**, le caractère.

## L'histoire d'Ìwà

On raconte qu'Ọ̀rúnmìlà épousa une femme d'une grande beauté nommée Ìwà. Avec le temps, il la traita sans égards, la critiqua, la négligea. Un jour, Ìwà partit. Aussitôt, la maison d'Ọ̀rúnmìlà se vida : ses clients ne venaient plus, ses biens se dispersaient, son nom perdait sa valeur. Il partit à sa recherche, de ville en ville, chantant son nom, jusqu'à la retrouver. Elle accepta de revenir. Depuis, Ifá enseigne : **on peut tout avoir, sans ìwà on finit par tout perdre**.

## Ce que veut dire un bon caractère

- Dire la vérité, même quand elle coûte.
- Tenir sa parole.
- Respecter les aînés et ne pas mépriser les plus petits.
- Garder la patience dans l'épreuve et l'humilité dans la réussite.

## Pourquoi c'est la vraie protection

Un rituel peut ouvrir une porte ; seul le caractère te permet de rester dans la maison. Beaucoup de personnes cherchent une protection contre leurs ennemis, alors que leur plus grand danger est une parole de trop, une promesse non tenue, une colère.

Avant de chercher qui t'en veut, regarde comment tu traites ceux qui t'aiment. C'est là que commence la vraie protection.`,
  },
  {
    kind: 'wasu', slug: 'ori-ta-tete-te-suit', title: 'Orí : personne ne marchera à ta place', category: 'ori', order: 3,
    excerpt: "Quand le chemin devient difficile, les amis s'arrêtent, les divinités elles-mêmes s'arrêtent. Seul Orí traverse avec toi jusqu'à l'autre rive.",
    meta: { quote: '« Aucun Òrìṣà ne peut bénir un homme sans l’accord de son Orí. »' },
    oduIds: [0, 34, 204],
    body: `Il existe une solitude que tout le monde connaît : le moment où l'on comprend que personne ne peut vivre sa vie à sa place.

## Le fleuve

Ifá raconte que les Òrìṣà furent invités à accompagner les humains dans un long voyage. Chacun promit de rester jusqu'au bout. Mais devant le fleuve le plus dangereux, ils s'arrêtèrent un à un. Seul Orí entra dans l'eau et traversa avec la personne. Les Òrìṣà comprirent alors que nul ne pouvait aider quelqu'un dont la tête n'avance pas.

## Ce que cela veut dire pour toi

Tu peux consulter, prier, offrir, demander conseil, et tu dois le faire. Mais **le dernier pas est le tien**. Aucune protection ne remplace la décision que toi seul peux prendre : quitter ce qui te détruit, commencer ce que tu repousses, dire ce que tu tais.

## Prendre soin de son Orí

- Dormir, se reposer : une tête épuisée choisit mal.
- Éviter les paroles et les personnes qui te rabaissent.
- Remercier, même pour peu.
- Écouter cette petite voix qui insiste.

Les autres peuvent t'accompagner jusqu'au bord. La traversée, c'est toi et ta tête. Et ta tête, Ifá le dit, a été choisie pour réussir.`,
  },
  {
    kind: 'wasu', slug: 'ceux-qui-viennent-avant-nous', title: 'Ceux qui sont venus avant nous', category: 'famille', order: 4,
    excerpt: "Nous portons le nom, le visage et parfois les blessures de nos ancêtres. Les honorer n'est pas vivre dans le passé : c'est réparer ce qui pèse et recevoir ce qui protège.",
    meta: { quote: '« Les morts ne sont pas morts : ils marchent derrière toi. »' },
    oduIds: [17, 68, 187],
    body: `Personne n'arrive au monde seul. Avant toi, il y a eu une mère, une grand-mère, un ancêtre dont tu ne connais même pas le nom. Ils t'ont transmis la vie, mais aussi leurs combats, leurs dettes et leurs bénédictions.

## Ce que dit Ifá

Les Odu comme Ọ̀yẹ̀kú et Ìrosùn rappellent que **ce qui n'a pas été réglé par les anciens peut revenir vers les jeunes**. Une dispute d'héritage jamais apaisée, une promesse faite à une divinité et oubliée, une injustice commise : tout cela peut se manifester des années plus tard, dans une autre génération.

Ce n'est pas une malédiction aveugle. C'est une **mémoire** qui demande à être entendue.

## Honorer, ce n'est pas adorer

Honorer ses ancêtres, c'est :
- connaître leurs noms, et les dire ;
- réparer ce qui peut l'être : demander pardon, rendre, réconcilier ;
- partager un repas en leur mémoire ;
- vivre de façon à ce qu'ils soient fiers.

## Le cadeau

Quand une famille honore ses morts, quelque chose se dénoue. Les jeunes respirent mieux. Les décisions deviennent plus claires. On ne marche plus seul : on marche avec toute une lignée derrière soi.

Ce soir, dis le nom d'un ancêtre. C'est peut-être la première fois depuis longtemps que quelqu'un le prononce avec amour.`,
  },
  {
    kind: 'wasu', slug: 'lepreuve-qui-fait-naitre', title: 'L’épreuve qui fait naître', category: 'epreuve', order: 5,
    excerpt: "Òdí est le sceau et la matrice : ce qui est fermé pour être protégé. Ifá enseigne que beaucoup de blocages sont des gestations. Ce qui te serre aujourd'hui prépare peut-être une naissance.",
    meta: { quote: '« La graine fermée dans la terre est déjà un arbre. »' },
    oduIds: [51, 221, 17],
    body: `Il y a des périodes où tout se ferme. Les portes ne s'ouvrent plus, les réponses ne viennent pas, les efforts semblent tomber dans le vide. On se croit puni, abandonné.

## La matrice

Ifá a un Odu pour cela : **Òdí**, le sceau, la matrice. Dans la matrice, l'enfant est enfermé, serré, dans l'obscurité. S'il pouvait penser, il croirait sans doute qu'il est prisonnier. Pourtant il est en train de devenir.

Beaucoup d'épreuves fonctionnent ainsi. Ce qui te serre aujourd'hui t'oblige à grandir dans une direction que tu n'aurais pas choisie.

## Distinguer l'épreuve et l'erreur

Ifá ne dit pas que toute souffrance est bonne. Certaines viennent de mauvais choix, et il faut les corriger. La consultation sert à cela : savoir si l'on doit **changer de chemin** ou **tenir bon**.

## Tenir

- Ne prends pas de décision définitive au milieu de la nuit la plus noire.
- Garde un petit geste chaque jour, même minuscule, qui te relie à ce que tu veux devenir.
- Entoure-toi de ceux qui croient en toi quand tu n'y crois plus.

Ìrẹtẹ̀ le dit à sa manière : la goutte qui tombe chaque jour finit par creuser le rocher. Ton épreuve a une fin, et ce qui en sortira sera plus fort que ce qui y est entré.`,
  },
  {
    kind: 'wasu', slug: 'la-sagesse-de-la-tortue', title: 'La sagesse lente', category: 'sagesse', order: 6,
    excerpt: "Ifá aime les histoires où le plus lent, le plus petit, le plus méprisé finit par l'emporter. La sagesse n'est pas d'aller vite : c'est de savoir où l'on va.",
    meta: { quote: '« Celui qui marche lentement arrive aussi, et il arrive entier. »' },
    oduIds: [102, 170, 204],
    body: `Nous vivons à une époque où tout doit aller vite : réussir vite, guérir vite, aimer vite, oublier vite. Ifá, lui, parle souvent de lenteur.

## Le dernier devenu premier

Ọ̀bàrà raconte l'histoire du plus jeune, du plus méprisé, celui qu'on laissait au fond de la case. Les autres allaient vite, parlaient fort, promettaient beaucoup. Lui consultait, écoutait, faisait ce qu'on lui demandait. À la fin, c'est à lui que revint la couronne. Les autres étaient arrivés plus tôt, mais ils avaient oublié l'essentiel en chemin.

## Ce qu'est la sagesse selon Ifá

- **Consulter avant d'agir** : demander, écouter, puis décider.
- **Retenir sa parole** (Ìká) : tout ce qu'on sait ne doit pas être dit.
- **Chercher la paix** (Òtúrá) : une victoire qui détruit la relation est une défaite.
- **Accepter de ne pas savoir** : même Ọ̀rúnmìlà jette l'ọ̀pẹ̀lẹ̀ avant de parler.

## Une question pour cette semaine

Qu'est-ce que tu essaies d'obtenir trop vite ? Une relation, une réponse, une réussite ? Et si la lenteur était la protection qu'Ifá t'offre ?

La sagesse n'est pas de tout comprendre. C'est de savoir attendre le bon moment, et de le reconnaître quand il arrive.`,
  },
];
