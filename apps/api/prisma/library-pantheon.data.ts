/**
 * REFONTE R22 (suite, demandée le 2026-11-20) : le reste du panthéon yoruba et fon, relié aux Odu où il parle.
 * Brouillons publiés, à relire par le prêtre : récits, attributs et Odu liés varient selon les lignées et les couvents.
 * Méjì : Ogbè 0, Ọ̀yẹ̀kú 17, Ìwòrì 34, Òdí 51, Ìrosùn 68, Ọ̀wọ́nrín 85, Ọ̀bàrà 102, Ọ̀kànràn 119, Ògúndá 136,
 * Ọ̀sá 153, Ìká 170, Òtúúrúpọ̀n 187, Òtúrá 204, Ìrẹtẹ̀ 221, Ọ̀ṣẹ́ 238, Òfún 255.
 */
import type { Seed } from './library.data';

const d = (s: Omit<Seed, 'kind'>): Seed => ({ kind: 'divinite', ...s });

export const LIBRARY_PANTHEON: Seed[] = [
  // ------------------------------------------------ Les origines
  d({
    slug: 'olodumare', title: 'Olódùmarè', subtitle: 'L’Être suprême, source de tout souffle', category: 'orisa', order: 20,
    excerpt: "Olódùmarè est l'Être suprême de la tradition yoruba. On ne lui élève pas d'autel : on s'adresse à lui à travers les Òrìṣà et à travers sa propre tête.",
    meta: { otherNames: 'Olórun (le maître du ciel), Ọlọ́fin, Ẹlẹ́dàá', role: 'Créateur suprême, source de l’àṣẹ (le pouvoir de faire advenir)', colors: 'Blanc', symbols: 'Le ciel, le souffle (èémí)' },
    oduIds: [0, 255],
    body: `## Qui est-il

Olódùmarè est l'**Être suprême**, au-dessus de tous les Òrìṣà. Il donne le souffle (èémí) à chaque être et l'**àṣẹ**, le pouvoir qui fait advenir les choses. Il est si grand qu'on ne lui consacre ni temple ni sacrifice direct : on s'adresse à lui par les Òrìṣà, qui sont ses messagers et ses ministres.

## Ce que dit Ifá

Dans les récits d'Ifá, c'est devant Olódùmarè que chaque âme choisit sa destinée, et c'est lui qui distribue les pouvoirs aux divinités. Quand les Òrìṣà échouent, ils remontent le consulter.

## Ce qu'il enseigne

- Toute force vient d'une source plus grande que nous.
- Les divinités servent un ordre ; elles ne le remplacent pas.
- Le souffle qui t'anime est un don : il oblige.`,
  }),
  d({
    slug: 'mawu', title: 'Mawu', subtitle: 'Mawu-Lisa · le couple créateur du Bénin', category: 'vodun', order: 21,
    excerpt: "Dans la tradition fon, Mawu (la lune, la nuit, la douceur) et Lisa (le soleil, le jour, la force) forment le couple créateur. Ensemble, ils sont l'équilibre du monde.",
    meta: { otherNames: 'Mawu-Lisa, Sɛgbo-Lisa selon les régions', role: 'Création, équilibre des contraires, ordre du monde', colors: 'Blanc', symbols: 'La lune et le soleil, le caméléon pour Lisa' },
    oduIds: [0, 17, 255],
    body: `## Qui est-elle

Pour les Fon, le monde a été créé par **Mawu-Lisa**. **Mawu** est féminine : la lune, la nuit, la fraîcheur, la douceur, la sagesse. **Lisa** est masculin : le soleil, le jour, la chaleur, la force. Ils sont souvent présentés comme les jumeaux enfantés par Nana Buluku. Ensemble, ils disent que **la création naît de l'équilibre des contraires**.

## Son histoire

On raconte que Mawu créa le monde porté par le serpent Dan Ayidohwedo, puis répartit les domaines entre ses enfants : la terre à Sakpata, le ciel et la foudre à Hɛvioso, la mer à Agbe, le fer à Gu. À Lɛgba, le plus jeune, elle confia la tâche de porter les messages entre tous.

## Ce qu'elle enseigne

- Le jour a besoin de la nuit, la force a besoin de la douceur.
- Chacun a reçu un domaine : nul ne peut tout tenir seul.
- La sagesse est souvent silencieuse, comme la lune.`,
  }),
  d({
    slug: 'nana-buluku', title: 'Nana Buluku', subtitle: 'L’ancêtre première, mère de Mawu-Lisa', category: 'vodun', order: 22,
    excerpt: "Nana Buluku est la grande ancêtre de la tradition fon : celle qui, selon les récits, enfanta Mawu et Lisa avant de se retirer. Elle est l'origine plus ancienne que l'origine.",
    meta: { otherNames: 'Nanan Bouclou, Nanã (Brésil, Cuba)', role: 'Origine première, ancienneté, mémoire', colors: 'Blanc, mauve dans la diaspora', symbols: 'L’eau stagnante, la boue originelle, le grand âge' },
    oduIds: [255, 17],
    body: `## Qui est-elle

**Nana Buluku** est la figure la plus ancienne : la mère de Mawu et de Lisa. Après les avoir mis au monde, elle se retira et laissa la création à ses enfants. On ne lui demande pas grand-chose : on la **respecte** comme on respecte la grand-mère de toutes les grand-mères.

## Dans la diaspora

Au Brésil et à Cuba, elle est devenue **Nanã**, la très vieille mère liée à l'eau dormante et à la boue d'où l'humanité a été pétrie.

## Ce qu'elle enseigne

- Tout ce qui est jeune vient de quelque chose de plus ancien.
- Se retirer à temps est aussi une sagesse.
- Le respect des anciens est la racine de toute vie.`,
  }),
  d({
    slug: 'odu-gbadu', title: 'Odù · Gbadu', subtitle: 'L’épouse d’Ifá, mère des seize Méjì', category: 'les-deux', order: 23,
    excerpt: "Odù, appelée Gbadu au Bénin, est l'épouse d'Ọ̀rúnmìlà et la mère des seize Méjì. Son mystère est si puissant que seuls certains initiés peuvent la recevoir.",
    meta: { otherNames: 'Odù, Ìgbà Odù, Gbadu (Fon), Fá Gbadu', role: 'Mère des Odu, puissance cachée d’Ifá', taboos: 'Regarder ce qui est réservé aux initiés', symbols: 'La calebasse fermée' },
    oduIds: [255, 0, 34],
    body: `## Qui est-elle

Odù est la **puissance féminine d'Ifá**. Les récits disent qu'elle fut donnée en épouse à Ọ̀rúnmìlà et qu'elle mit au monde les seize Méjì, les Odu principaux. Au Bénin, sous le nom de **Gbadu**, elle est la mère du Fá ; le bokɔnɔ qui atteint un haut degré d'initiation la « reçoit ».

## Son histoire

Un verset d'Ifá raconte qu'Ọ̀rúnmìlà avait une première épouse sans enfant. Ifá lui conseilla d'épouser Odù. Elle vint avec une condition : qu'il ne regarde jamais son vrai visage et ne révèle pas ses secrets. Il accepta ; elle lui donna seize enfants, qui sont les seize Méjì. Depuis, sa calebasse reste fermée.

## Ce qu'elle enseigne

- Toute parole a une mère : derrière chaque Odu, il y a un mystère.
- Certaines choses se gardent fermées pour rester puissantes.
- Le respect d'une promesse fait naître la descendance.`,
  }),

  // ------------------------------------------------ Òrìṣà yoruba
  d({
    slug: 'osoosi', title: 'Ọ̀ṣọ́ọ̀sì', subtitle: 'Le chasseur à la flèche unique', category: 'orisa', order: 30,
    excerpt: "Ọ̀ṣọ́ọ̀sì est l'Òrìṣà de la chasse et de la forêt. Il ne tire qu'une flèche, et elle atteint toujours son but : il est la précision, la justice et la subsistance.",
    meta: { otherNames: 'Ọ̀chọ́sí (Cuba), Oxóssi (Brésil)', role: 'Chasse, forêt, précision, justice, subsistance', colors: 'Vert, bleu turquoise', offerings: 'Gibier, maïs, fruits de la forêt', taboos: 'Gaspiller ce que la forêt donne', symbols: 'L’arc et la flèche (ọfà)' },
    oduIds: [136, 34],
    body: `## Qui est-il

Ọ̀ṣọ́ọ̀sì est le **chasseur** des Òrìṣà, frère et compagnon d'Ògún. Ògún ouvre le chemin dans la forêt, Ọ̀ṣọ́ọ̀sì y trouve la nourriture. Son arme est l'arc, et la tradition dit qu'il n'a besoin que d'une flèche.

## Son histoire

On raconte qu'un oiseau maléfique se posa sur le palais du roi d'Ifẹ̀ pendant une fête. Les chasseurs les plus célèbres tirèrent toutes leurs flèches sans l'atteindre. Le dernier, qui n'avait qu'une seule flèche, consulta Ifá, fit le sacrifice demandé, tira, et abattit l'oiseau. On l'appela **Ọ̀ṣọ́ọ̀sì**, et il devint le patron des chasseurs.

## Ce qu'il enseigne

- Une seule action juste vaut mieux que cent agitées.
- Consulter avant d'agir rend la main sûre.
- On prend à la nature ce dont on a besoin, pas plus.`,
  }),
  d({
    slug: 'osanyin', title: 'Ọ̀sanyìn', subtitle: 'Le maître des feuilles qui guérissent', category: 'les-deux', order: 31,
    excerpt: "Ọ̀sanyìn connaît le secret de chaque feuille. Sans lui, aucun bain, aucun remède, aucun rituel d'Ifá n'a de force. Au Bénin, on parle d'Aroni et des maîtres des plantes.",
    meta: { otherNames: 'Ọ̀sányìn, Osain (Cuba), Ossaim (Brésil), Aroni (lié à la forêt)', role: 'Plantes, feuilles, médecine traditionnelle', colors: 'Vert', offerings: 'Selon les plantes et les lignées', taboos: 'Cueillir sans demander la permission', symbols: 'Le bâton de fer à oiseaux, les feuilles (ewé)' },
    oduIds: [187, 153, 34],
    body: `## Qui est-il

Ọ̀sanyìn est l'Òrìṣà des **feuilles** (ewé). Chaque plante a une parole, et lui seul la connaît. C'est pourquoi on dit dans les couvents : **« Kò sí ewé, kò sí Òrìṣà »**, sans feuille, pas d'Òrìṣà. Tout bain, tout remède, toute consécration passe par lui.

## Son histoire

On raconte qu'Ọ̀sanyìn gardait seul toutes les feuilles dans une calebasse. Les autres Òrìṣà, jaloux, demandèrent à Ọya d'agiter le vent ; la calebasse se renversa et les feuilles s'envolèrent. Chaque Òrìṣà en ramassa quelques-unes : c'est pourquoi chacun a ses plantes. Mais Ọ̀sanyìn garda la connaissance de leurs paroles, et sans lui elles restent muettes.

## Ce qu'il enseigne

- La nature soigne quand on la connaît et qu'on la respecte.
- Le savoir partagé sans sa parole ne fonctionne pas.
- Les plantes de la tradition accompagnent la médecine ; elles ne la remplacent pas.`,
  }),
  d({
    slug: 'ibeji', title: 'Ìbejì · Hoho', subtitle: 'Les jumeaux sacrés', category: 'les-deux', order: 32,
    excerpt: "Chez les Yoruba et les Fon, les jumeaux sont sacrés. Ìbejì (Hoho au Bénin) apportent chance et prospérité à la famille qui les honore, et se fâchent quand on les néglige.",
    meta: { otherNames: 'Ìbejì (yoruba), Hoho / Hohovi (fon), Táíwò et Kẹ́hìndé', role: 'Jumeaux, chance, abondance, joie des enfants', colors: 'Rouge et bleu, ou selon les familles', offerings: 'Haricots, bananes, douceurs, jouets', taboos: 'Négliger ou séparer les jumeaux', symbols: 'Les statuettes ère ìbejì' },
    oduIds: [238, 187, 102],
    body: `## Qui sont-ils

Les jumeaux sont considérés comme des êtres à part, porteurs de **chance** et d'**abondance**. Le premier né s'appelle **Táíwò** (« celui qui goûte le monde »), le second **Kẹ́hìndé** (« celui qui arrive après »), considéré comme l'aîné qui a envoyé son cadet en éclaireur. Au Bénin, on parle des **Hoho**.

## La tradition

Quand un jumeau meurt, la famille fait sculpter une statuette (**ère ìbejì**) que la mère nourrit, habille et porte comme l'enfant vivant. Les jumeaux et leur mère reçoivent souvent des dons dans la rue : les honorer apporte la bénédiction.

## Ce qu'ils enseignent

- La joie des enfants est une richesse.
- Ce qui va par deux ne doit pas être séparé.
- Celui qui donne aux jumeaux reçoit en retour.`,
  }),
  d({
    slug: 'oba', title: 'Ọbà', subtitle: 'L’épouse fidèle et la rivière Ọbà', category: 'orisa', order: 33,
    excerpt: "Ọbà est la première épouse de Ṣàngó, divinité de la rivière qui porte son nom. Son histoire parle de fidélité, de rivalité entre épouses et de la dignité blessée.",
    meta: { otherNames: 'Ọbà (rivière Ọbà)', role: 'Fidélité conjugale, protection des épouses, rivière', colors: 'Rose foncé, bordeaux', symbols: 'L’oreille couverte, la rivière Ọbà' },
    oduIds: [238, 102],
    body: `## Qui est-elle

Ọbà est la **première épouse de Ṣàngó**. Elle est liée à la rivière Ọbà et protège les épouses, la fidélité et la dignité dans le mariage.

## Son histoire

On raconte que Ọbà, voyant que Ṣàngó préférait la cuisine d'Ọ̀ṣun, demanda à sa rivale son secret. Ọ̀ṣun, par jeu ou par ruse, lui dit qu'elle mettait un morceau de son oreille dans la sauce. Ọbà se coupa l'oreille et la servit à Ṣàngó, qui en fut horrifié. Humiliée, Ọbà s'enfuit et devint rivière ; à l'endroit où sa rivière rejoint celle d'Ọ̀ṣun, les eaux, dit-on, sont toujours agitées.

## Ce qu'elle enseigne

- L'amour ne se gagne pas en se mutilant.
- La rivalité détruit les deux rivales.
- La fidélité mérite d'être honorée, pas exploitée.`,
  }),
  d({
    slug: 'olokun', title: 'Olókun', subtitle: 'Le maître des profondeurs de l’océan', category: 'les-deux', order: 34,
    excerpt: "Olókun règne sur les profondeurs de la mer, là où la lumière n'arrive pas. Il garde les richesses englouties et les mystères que l'on ne voit pas.",
    meta: { otherNames: 'Olókun, proche d’Agbe chez les Fon', role: 'Profondeurs marines, richesse cachée, mystère', colors: 'Bleu foncé, blanc', offerings: 'Selon les lignées, offertes à la mer', symbols: 'Les profondeurs, les coraux, les chaînes' },
    oduIds: [51, 238, 17],
    body: `## Qui est-il

Si Yemọja est la surface vivante des eaux, **Olókun** en est le **fond** : les profondeurs obscures où dorment les trésors et les secrets. Selon les régions, Olókun est vu comme masculin ou féminin ; à Benin City (Nigeria), il est un dieu majeur de la richesse et de la fécondité.

## Son histoire

On raconte qu'Olókun, jaloux de la terre ferme créée par les autres divinités, souleva les eaux pour la recouvrir. Ọ̀rúnmìlà, ou selon d'autres Ọbàtálá, l'enchaîna au fond de l'océan pour que le monde reste habitable. Depuis, Olókun garde les profondeurs ; ceux qui l'honorent reçoivent ses richesses, ceux qui le défient voient la mer se lever.

## Ce qu'il enseigne

- Ce qui est profond ne se voit pas, mais tient tout.
- La richesse véritable est souvent cachée.
- Même la force la plus grande a besoin de limites.`,
  }),
  d({
    slug: 'osumare', title: 'Ọ̀ṣùmàrè', subtitle: 'L’arc-en-ciel des Yoruba', category: 'orisa', order: 35,
    excerpt: "Ọ̀ṣùmàrè est le serpent arc-en-ciel de la tradition yoruba, frère de Dan Ayidohwedo chez les Fon. Il relie le ciel à la terre et apporte la richesse.",
    meta: { otherNames: 'Ọ̀ṣùmàrè, Oxumarê (Brésil), proche de Dan Ayidohwedo', role: 'Arc-en-ciel, continuité, richesse, cycles', colors: 'Les couleurs de l’arc-en-ciel', symbols: 'Le serpent, l’arc-en-ciel' },
    oduIds: [170, 238],
    body: `## Qui est-il

**Ọ̀ṣùmàrè** est l'arc-en-ciel, pensé comme un **serpent** qui monte des eaux vers le ciel. Il est la figure yoruba la plus proche de **Dan Ayidohwedo** chez les Fon : même image, même idée de continuité.

## Ce que dit la tradition

On dit qu'Ọ̀ṣùmàrè porte l'eau de la terre jusqu'au ciel pour qu'elle retombe en pluie : il est le cycle de la vie. Quand l'arc-en-ciel apparaît, certains disent qu'il vient annoncer la richesse ; d'autres qu'il vient boire.

## Ce qu'il enseigne

- La vie est un cycle : ce qui monte redescend, ce qui part revient.
- Les couleurs ensemble font la beauté : aucune ne suffit seule.
- La richesse vient de ce qui circule.`,
  }),
  d({
    slug: 'iyami', title: 'Ìyàmí Ọ̀ṣọ̀rọ̀ngà', subtitle: 'Les Mères, les oiseaux de la nuit', category: 'orisa', order: 36,
    excerpt: "Ìyàmí, « nos mères », sont les puissances féminines que la tradition craint et respecte. Elles peuvent détruire ou protéger. Ifá enseigne comment obtenir leur faveur.",
    meta: { otherNames: 'Àwọn Ìyá wa, Ẹlẹ́yẹ (celles qui possèdent l’oiseau), Àjẹ́', role: 'Puissance féminine, justice cachée, protection ou destruction', taboos: 'Offenser les femmes âgées, manquer de respect aux mères', symbols: 'L’oiseau, la nuit, la calebasse' },
    oduIds: [153, 238, 255],
    body: `## Qui sont-elles

**Ìyàmí** (« nos mères ») sont les puissances féminines mystérieuses de la tradition yoruba, liées à l'**oiseau** et à la nuit. On les appelle aussi Àjẹ́. Elles ne sont ni bonnes ni mauvaises : elles sont une **force** qui peut détruire celui qui offense et protéger celui qui respecte.

## Ce que dit Ifá

Le Méjì Ọ̀sá raconte que les humains et les oiseaux avaient juré de ne jamais se nuire, et que les humains rompirent ce pacte. Olódùmarè donna alors aux Mères le pouvoir d'agir dans la vie des hommes. Depuis, Ifá enseigne qu'il faut obtenir leur faveur par le respect, le sacrifice et la justice envers les femmes.

## Ce qu'elles enseignent

- La force cachée est plus grande que la force visible.
- Le respect des mères et des femmes âgées protège.
- L'injustice faite en secret est vue.`,
  }),
  d({
    slug: 'orisa-oko', title: 'Òrìṣà Oko', subtitle: 'Le maître des champs et des récoltes', category: 'orisa', order: 37,
    excerpt: "Òrìṣà Oko est la divinité de l'agriculture. Il fait pousser l'igname, nourrit les familles et garde la justice dans les villages.",
    meta: { otherNames: 'Òrìṣà Oko, Orishaoko (Cuba)', role: 'Agriculture, récoltes, fertilité de la terre, justice villageoise', colors: 'Blanc et rouge, rose', offerings: 'Igname nouvelle, maïs, haricots', symbols: 'La houe, l’igname' },
    oduIds: [187, 221, 0],
    body: `## Qui est-il

**Òrìṣà Oko** est le maître des **champs**. Il veille sur la semence, la pluie qui tombe au bon moment et la récolte. Il est aussi réputé pour rendre la justice dans les conflits de village, notamment les accusations de sorcellerie.

## Ce que dit la tradition

On raconte qu'Òrìṣà Oko vivait autrefois dans les champs et apprit aux humains à cultiver l'igname. Lors de la fête de l'igname nouvelle, on lui offre les premiers tubercules avant de manger soi-même.

## Ce qu'il enseigne

- On ne récolte que ce qu'on a semé.
- Les premiers fruits se partagent.
- La patience du cultivateur est une sagesse.`,
  }),
  d({
    slug: 'onile', title: 'Onílẹ̀ · Ayí', subtitle: 'La Terre, mère qui porte tout', category: 'les-deux', order: 38,
    excerpt: "Onílẹ̀, « la propriétaire de la terre », est la Terre elle-même, divinité qui porte les vivants et reçoit les morts. On l'honore avant de bâtir, de cultiver ou de prêter serment.",
    meta: { otherNames: 'Onílẹ̀, Ilẹ̀, Ayé (yoruba), Ayí (fon)', role: 'La Terre, serments, justice, ancêtres', colors: 'Brun, ocre', offerings: 'Libations versées sur le sol, kola', taboos: 'Trahir un serment prêté sur la terre', symbols: 'Le sol, les deux statuettes reliées (édan)' },
    oduIds: [221, 187],
    body: `## Qui est-elle

Onílẹ̀ est la **Terre**. Elle porte les vivants et accueille les morts. C'est pourquoi on lui verse quelques gouttes de chaque boisson et qu'on la salue avant de bâtir une maison ou d'ouvrir un champ. Chez les Fon, la terre est **Ayí**, et son roi est Sakpata.

## Ce que dit la tradition

Les sociétés yoruba des anciens (Ògbóni) font de la Terre le témoin de tous les serments : celui qui jure sur la terre et ment sera, dit-on, rattrapé par elle, car on ne peut pas marcher ailleurs que sur elle.

## Ce qu'elle enseigne

- Tu marches chaque jour sur ce qui te porte : remercie.
- Un serment fait sur la terre ne s'efface pas.
- Ce que l'on enterre n'est pas perdu : la terre le garde.`,
  }),
  d({
    slug: 'aganju', title: 'Aganjú', subtitle: 'Le volcan et le passeur du fleuve', category: 'orisa', order: 39,
    excerpt: "Aganjú est la force brute de la terre en feu, le volcan, la nature sauvage. Il est aussi le passeur qui aide à traverser le fleuve.",
    meta: { otherNames: 'Aganjú, Aganyú (Cuba)', role: 'Volcan, déserts, force de la nature, passage', colors: 'Rouge, brun', symbols: 'La double hache, le fleuve à traverser' },
    oduIds: [85, 119],
    body: `## Qui est-il

**Aganjú** est lié à la **terre en feu**, aux volcans et aux espaces sauvages. Selon certains récits, il fut un roi d'Ọ̀yọ́, parent de Ṣàngó. Dans la diaspora cubaine, il est le passeur qui porte les voyageurs d'une rive à l'autre.

## Ce que dit la tradition

On raconte qu'Aganjú faisait traverser le fleuve à tous ceux qui le demandaient, riches ou pauvres, sans distinction. Un jour, un enfant très lourd lui demanda passage : c'était un Òrìṣà déguisé, venu éprouver sa générosité. Aganjú le porta jusqu'au bout malgré la douleur.

## Ce qu'il enseigne

- La force est faite pour porter les autres.
- On ne choisit pas qui l'on aide selon sa richesse.
- Les passages difficiles se traversent avec un guide.`,
  }),
  d({
    slug: 'erinle', title: 'Ẹrinlẹ̀', subtitle: 'Le chasseur-guérisseur de la rivière', category: 'orisa', order: 40,
    excerpt: "Ẹrinlẹ̀ est un chasseur devenu rivière, à la fois chasseur, pêcheur et guérisseur. Il rassemble la forêt et l'eau.",
    meta: { otherNames: 'Ẹrinlẹ̀, Inle (Cuba)', role: 'Chasse, pêche, guérison, abondance', colors: 'Bleu, vert, doré dans la diaspora', symbols: 'Le poisson, l’arc, le bâton de guérisseur' },
    oduIds: [136, 187],
    body: `## Qui est-il

**Ẹrinlẹ̀** est un grand chasseur qui, selon la tradition, se transforma en rivière près d'Ilobu. Il réunit en lui la **forêt** et l'**eau** : chasseur, pêcheur et guérisseur. Dans la diaspora cubaine, il est appelé Inle, le médecin des Òrìṣà.

## Ce que dit la tradition

On raconte qu'Ẹrinlẹ̀, lors d'une sécheresse, frappa le sol et fit jaillir une source qui sauva le peuple. Il devint la rivière qui porte son nom, et ses eaux sont réputées guérir.

## Ce qu'il enseigne

- Le guérisseur connaît à la fois la forêt et l'eau.
- Une source peut naître au milieu de la sécheresse.
- Nourrir et soigner sont deux formes du même amour.`,
  }),

  // ------------------------------------------------ Vodun du Bénin
  d({
    slug: 'hevioso', title: 'Hɛvioso', subtitle: 'Xɛbioso · la famille du tonnerre', category: 'vodun', order: 50,
    excerpt: "Hɛvioso est le Vodun du tonnerre et de la foudre au Bénin, à la tête d'une famille de divinités du ciel. Il punit le mensonge, le vol et la sorcellerie.",
    meta: { otherNames: 'Xɛbioso, Sogbo, So (selon les régions)', role: 'Tonnerre, foudre, justice céleste, pluie', colors: 'Rouge et blanc', offerings: 'Bélier, selon les couvents', taboos: 'Le vol, le mensonge', symbols: 'La hache à double tranchant, la foudre, le bélier' },
    oduIds: [102, 68, 119],
    body: `## Qui est-il

**Hɛvioso** (Xɛbioso) est le Vodun du **tonnerre** au Bénin, rapproché de Ṣàngó chez les Yoruba. Il est à la tête d'une famille de Vodun du ciel : **Sogbo**, maître de la foudre, **Badé**, et d'autres selon les régions. Il apporte la pluie et frappe ceux qui volent, mentent ou pratiquent la sorcellerie.

## Ce que dit la tradition

Quand la foudre tombe sur une maison, les prêtres de Hɛvioso viennent chercher la « pierre de foudre » et purifier les lieux : on considère que Hɛvioso a désigné une faute. Le bélier, animal fougueux, lui est consacré.

## Ce qu'il enseigne

- La justice vient d'en haut, même quand personne n'a vu.
- La pluie qui nourrit et la foudre qui frappe viennent du même ciel.
- Celui qui est honnête n'a pas peur de l'orage.`,
  }),
  d({
    slug: 'agbe', title: 'Agbe', subtitle: 'Le maître de la mer', category: 'vodun', order: 51,
    excerpt: "Agbe est le Vodun de la mer au Bénin, avec son épouse Naeté. Il règne sur l'océan et les richesses qui en viennent ; sa fille Avlekete est l'une des Vodun les plus aimées de la côte.",
    meta: { otherNames: 'Agbè, Hu (la mer), Naeté (son épouse)', role: 'La mer, la pêche, les richesses venues de l’océan', colors: 'Bleu, blanc', offerings: 'Offertes à la mer selon les couvents', symbols: 'La mer, les vagues, le poisson' },
    oduIds: [51, 238],
    body: `## Qui est-il

Dans la famille du ciel et des eaux, **Agbe** reçut la **mer**. Avec son épouse **Naeté**, il règne sur l'océan, les vagues et ce que la mer donne ou reprend. Les pêcheurs de la côte béninoise l'honorent avant de partir.

## Ce que dit la tradition

Agbe est souvent associé à Hɛvioso, car l'eau de la mer monte au ciel et redescend en pluie. Sa fille **Avlekete** est réputée la plus vive et la plus proche des humains.

## Ce qu'il enseigne

- Ce que la mer donne, elle peut le reprendre : la richesse demande l'humilité.
- Partir en mer, c'est partir protégé.
- Le ciel et l'eau sont une même famille.`,
  }),
  d({
    slug: 'avlekete', title: 'Avlekete', subtitle: 'La fille vive de la mer', category: 'vodun', order: 52,
    excerpt: "Avlekete, fille d'Agbe, est une Vodun de la mer réputée rapide et proche des humains. Elle répond vite à ceux qui l'appellent et protège les pêcheurs et les commerçants de la côte.",
    meta: { otherNames: 'Avrekete, Avlékété', role: 'Mer, rapidité, protection des pêcheurs et du commerce côtier', colors: 'Bleu, blanc', symbols: 'La mer, la coquille' },
    oduIds: [153, 238],
    body: `## Qui est-elle

**Avlekete** est la plus jeune des enfants d'Agbe, Vodun de la mer. Elle est réputée **vive**, joueuse et proche des humains : là où son père est lointain comme l'océan, elle est la vague qui vient jusqu'aux pieds.

## Ce que dit la tradition

On dit qu'Avlekete porte les messages de la mer vers la terre et qu'elle **répond vite** à ceux qui l'implorent avec sincérité. Ses couvents sont nombreux sur la côte, de Ouidah à Grand-Popo.

## Ce qu'elle enseigne

- La rapidité d'une réponse dépend de la sincérité de la demande.
- La joie est aussi une force sacrée.
- Ce qui vient de loin a parfois besoin d'un messager proche.`,
  }),
  d({
    slug: 'mami-wata', title: 'Mami Wata', subtitle: 'La mère des eaux, beauté et richesse', category: 'vodun', order: 53,
    excerpt: "Mami Wata est la divinité des eaux la plus connue de la côte ouest-africaine : beauté, richesse, séduction et guérison. Elle donne beaucoup et exige beaucoup.",
    meta: { otherNames: 'Mami Wata, Mamisi (ses adeptes)', role: 'Eaux, beauté, richesse, séduction, guérison', colors: 'Blanc et rouge', offerings: 'Parfums, miroirs, douceurs, boissons sucrées', taboos: 'Trahir un engagement pris envers elle', symbols: 'Le miroir, le peigne, le serpent' },
    oduIds: [238, 51],
    body: `## Qui est-elle

**Mami Wata** (« mère des eaux ») est vénérée sur toute la côte de l'Afrique de l'Ouest et du Centre. Elle est la **beauté**, la **richesse**, la séduction et la guérison. Ses adeptes, les **mamisi**, s'habillent souvent de blanc et lui offrent parfums, miroirs et douceurs.

## Ce que dit la tradition

On raconte qu'elle apparaît au bord de l'eau, peignant sa longue chevelure, et qu'elle peut emmener sous les eaux ceux qu'elle choisit, pour les renvoyer riches et sages. Mais elle est exigeante : un engagement pris envers elle ne se rompt pas.

## Ce qu'elle enseigne

- La beauté et la richesse sont des dons qui obligent.
- On ne fait pas de promesse aux eaux sans la tenir.
- Ce qui attire peut aussi engloutir : il faut garder la tête claire.`,
  }),
  d({
    slug: 'zangbeto', title: 'Zangbeto', subtitle: 'Les gardiens de la nuit', category: 'vodun', order: 54,
    excerpt: "Les Zangbeto sont les gardiens de la nuit des villages goun et fon. Couverts de raphia, ils patrouillent après le coucher du soleil, chassent les voleurs et les mauvais esprits.",
    meta: { otherNames: 'Zangbeto (« les chasseurs de la nuit »)', role: 'Sécurité des villages, ordre, protection nocturne', taboos: 'Tenter de voir qui est sous le raphia', symbols: 'Le costume de raphia en forme de meule' },
    oduIds: [17, 170],
    body: `## Qui sont-ils

Les **Zangbeto** (« ceux qui chassent la nuit ») sont les **gardiens** des villages, surtout chez les Goun de Porto-Novo et sur la côte. Leur costume de raphia, en forme de grande meule de paille, tourne sur lui-même pendant leurs sorties. Personne ne doit chercher à savoir qui se trouve dessous : on dit qu'il n'y a personne, seulement l'esprit.

## Ce que dit la tradition

Autrefois, les Zangbeto patrouillaient la nuit pour **arrêter les voleurs** et éloigner les mauvais esprits. Ils jouaient le rôle de la police et de la justice du village. Aujourd'hui encore, leurs sorties sont des moments de fête et de crainte respectueuse.

## Ce qu'ils enseignent

- La paix d'une communauté se garde aussi la nuit.
- Le mystère protège : tout ne doit pas être dévoilé.
- La justice appartient à tous, pas à un seul homme.`,
  }),
  d({
    slug: 'minona', title: 'Minona', subtitle: 'La protectrice des femmes et du Fá', category: 'vodun', order: 55,
    excerpt: "Minona est une Vodun féminine liée au Fá : protectrice des femmes, de la fécondité et des récoltes. Certains récits en font la mère ou la sœur de Fá.",
    meta: { otherNames: 'Minona, Minɔnà', role: 'Protection des femmes, fécondité, récoltes, divination', colors: 'Blanc', symbols: 'La calebasse, la noix de palme' },
    oduIds: [255, 238],
    body: `## Qui est-elle

**Minona** est une Vodun **féminine** très liée au Fá. Selon les récits, elle est la mère, la sœur ou la compagne de Fá ; tous s'accordent pour en faire la **protectrice des femmes**, de leur fécondité et de leurs récoltes.

## Ce que dit la tradition

On dit que c'est Minona qui enseigna aux femmes les secrets qui protègent les grossesses et les champs, et qu'elle veille sur les épouses des bokɔnɔ. Dans certaines maisons, elle reçoit un autel à côté de celui du Fá.

## Ce qu'elle enseigne

- La sagesse d'Ifá a aussi un visage féminin.
- Ce qui naît (enfant ou récolte) a besoin d'une protectrice.
- La divination et la vie quotidienne marchent ensemble.`,
  }),
  d({
    slug: 'aizan', title: 'Aïzan', subtitle: 'La gardienne du marché et du seuil', category: 'vodun', order: 56,
    excerpt: "Aïzan protège les marchés, les portes et les espaces publics. Elle est souvent représentée par un monticule de terre et des franges de palme, à l'entrée des lieux qu'elle garde.",
    meta: { otherNames: 'Aïzan, Ayizan (Haïti)', role: 'Protection des marchés, des seuils et des lieux publics, purification', colors: 'Blanc', symbols: 'La frange de palme (azan), le monticule de terre' },
    oduIds: [85, 0],
    body: `## Qui est-elle

**Aïzan** est la gardienne des **marchés** et des **seuils**. On la trouve à l'entrée des marchés, des villages et des couvents, sous la forme d'un monticule de terre orné de franges de palme. Elle **purifie** ceux qui entrent et éloigne ce qui est mauvais.

## Dans la diaspora

En Haïti, **Ayizan** est la gardienne des initiations et du marché : la palme effrangée est son symbole de purification.

## Ce qu'elle enseigne

- Les lieux de rencontre doivent être protégés.
- On entre dans un espace sacré en se purifiant.
- Le commerce honnête est sous la garde des divinités.`,
  }),
  d({
    slug: 'loko', title: 'Loko', subtitle: 'L’arbre iroko, demeure des esprits', category: 'vodun', order: 57,
    excerpt: "Loko est le Vodun de l'arbre iroko, géant de la forêt considéré comme la demeure des esprits. On ne l'abat pas sans rite, et on lui confie les prières de longévité.",
    meta: { otherNames: 'Loko, Ìrókò (yoruba), Iroko (Cuba)', role: 'L’arbre sacré, longévité, demeure des esprits, guérison', colors: 'Blanc, vert', taboos: 'Abattre un iroko sans rite', symbols: 'L’arbre iroko, le tissu blanc noué autour du tronc' },
    oduIds: [221, 187],
    body: `## Qui est-il

**Loko** est le Vodun de l'**iroko**, l'un des plus grands arbres de la forêt d'Afrique de l'Ouest. On le reconnaît au tissu blanc noué autour de son tronc. Chez les Yoruba, l'arbre est **Ìrókò**, réputé abriter des esprits.

## Ce que dit la tradition

Un iroko ne s'abat pas sans demander la permission par un rite : on dit que les esprits qui y vivent poursuivraient celui qui les chasse. Sous ses branches, on prie pour la **longévité** et la guérison, car l'arbre vit plus longtemps que plusieurs générations.

## Ce qu'il enseigne

- Ce qui a des racines profondes traverse les siècles.
- La nature a ses habitants : on entre chez eux avec respect.
- La longévité se cultive, comme un arbre.`,
  }),
  d({
    slug: 'age', title: 'Agè', subtitle: 'Le maître de la brousse et des chasseurs', category: 'vodun', order: 58,
    excerpt: "Agè est le Vodun de la brousse, des animaux sauvages et des chasseurs. Il partage avec Gu le monde de la forêt et donne au chasseur respectueux ce qu'il cherche.",
    meta: { otherNames: 'Agè, Agɛ', role: 'Brousse, animaux sauvages, chasse, agriculture de forêt', colors: 'Vert, brun', symbols: 'Les animaux sauvages, la brousse' },
    oduIds: [136, 34],
    body: `## Qui est-il

Dans le partage du monde par Mawu-Lisa, **Agè** reçut la **brousse** : les animaux sauvages, les terres non cultivées, la chasse. Il est le proche parent de Gu (Ògún) et l'équivalent béninois de l'esprit d'Ọ̀ṣọ́ọ̀sì.

## Ce que dit la tradition

Les chasseurs saluent Agè avant d'entrer dans la brousse et lui offrent une part du gibier au retour. Celui qui tue sans nécessité ou gaspille la viande perd, dit-on, la faveur d'Agè et revient bredouille.

## Ce qu'il enseigne

- La nature donne à celui qui ne prend que ce dont il a besoin.
- On entre dans la brousse en invité, pas en maître.
- Partager le fruit de la chasse garde la chance.`,
  }),
];
