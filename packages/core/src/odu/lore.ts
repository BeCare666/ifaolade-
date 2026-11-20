/**
 * Contenu traditionnel de départ des Odu (refonte, étape R13).
 *
 * - Les 16 Méjì ont leurs textes propres, ci-dessous.
 * - Les 240 Ọmọ Odù sont composés à partir de leurs deux Méjì : la jambe droite gouverne, la jambe gauche nuance.
 * - Chaque champ est remplaçable par le prêtre dans l'admin (colonne OduContent.lore) : ces textes ne sont
 *   qu'un point de départ, chaque lignée enseigne ses propres nuances.
 * - Aucun vers yoruba n'est inventé : l'éloge est écrit en français.
 */
import type { Odu } from './engine';

export interface BirthLore {
  /** Ce que la personne est. */
  nature: string;
  /** Ce qui se dessine pour sa vie (tendances, jamais une promesse). */
  path: string;
  /** Ce qu'elle doit faire. */
  todo: string[];
  /** Ce qu'elle ne doit pas faire. */
  avoid: string[];
  /** Ce qu'il lui est conseillé de manger. */
  eat: string[];
  /** Ses interdits alimentaires (èèwọ̀) de départ. */
  noEat: string[];
  /** Les divinités à honorer. */
  divinities: string[];
  /** Ses couleurs. */
  colors: string[];
}

export interface OduLore {
  /** Éloge de l'Odu. */
  oriki: string;
  /** Òrìṣà qui parlent dans cet Odu (tradition yoruba). */
  orisha: string[];
  /** Vodun qui parlent dans cet Odu (Fá du Bénin). */
  vodun: string[];
  /** Leçons de vie. */
  lessons: string[];
  /** Enseignement (Markdown). */
  teaching: string;
  /** Lecture quand l'Odu est le signe de naissance. */
  birth: BirthLore;
}

/** Ligne commune à toutes les listes d'interdits : l'èèwọ̀ exact se révèle en consultation. */
export const EEWO_NOTE = "Ton èèwọ̀ personnel exact, que seule la consultation révèle";

export const MEJI_LORE: Record<string, OduLore> = {
  ogbe: {
    oriki: "Ogbè, aîné des Odu, lumière qui ouvre le jour. Toi qui tiens la vie debout et fais naître ce qui n'était pas, tu éclaires la route de celui qui marche droit. Là où tu parles, l'ombre recule et la parole donnée devient chemin.",
    orisha: ['Ọbàtálá', 'Ọ̀rúnmìlà', 'Orí'],
    vodun: ['Lisa', 'Mawu', 'Fá'],
    lessons: [
      'Ce qui commence dans la droiture grandit ; ce qui commence dans le mensonge finit par tomber.',
      "La lumière ne se garde pas pour soi : elle sert à éclairer les autres.",
      "Ta tête (Orí) est ta première divinité : écoute-la avant d'écouter la foule.",
      'Une victoire obtenue par la ruse se paie plus tard.',
      'Le respect des aînés ouvre les portes que la force n’ouvre pas.',
    ],
    teaching: "## La lumière de l'origine\n\nOgbè est le premier des seize Méjì : toutes ses marques sont simples, la lumière y est pleine. Il parle de **naissance**, de **commencement** et de **victoire**.\n\n## Ce qu'il demande\n\n- commencer chaque chose avec une intention claire ;\n- vivre au grand jour, sans double vie ;\n- honorer sa tête (Orí) et ceux qui ont ouvert la route.\n\n> Ce que la lumière éclaire ne peut plus être caché.",
    birth: {
      nature: "Tu es une personne de lumière et de commencement. On vient vers toi pour être éclairé ; tu as le goût de la droiture, de la clarté et des chemins ouverts. Ta force est ta franchise, ton risque est l'orgueil de celui qui croit toujours avoir raison.",
      path: "Ta vie se construit par des commencements : projets, lieux, responsabilités nouvelles. Ce que tu bâtis honnêtement tient dans la durée. Les périodes d'ombre que tu traverses servent à révéler ce qui doit être remis droit.",
      todo: ['Honorer ta tête (Orí) par des prières et des offrandes régulières', 'Tenir ta parole, même dans les petites choses', 'Commencer tes projets le matin, l’esprit clair', 'Porter du blanc dans les moments importants'],
      avoid: ["Mentir ou mener une double vie", "Humilier ceux qui t'entourent", "Te laisser aller à l'orgueil", 'Les querelles inutiles en public'],
      eat: ['Escargots (ìgbín)', 'Ẹ̀kọ (bouillie ou pâte de maïs blanc)', 'Igname blanche', 'Noix de kola blanche (obì àbàtà)'],
      noEat: ['Le vin de palme et l’alcool fort', "L'huile de palme en excès"],
      divinities: ['Ọbàtálá (Lisa)', 'Ọ̀rúnmìlà (Fá)', 'Orí, ta tête'],
      colors: ['Blanc'],
    },
  },
  oyeku: {
    oriki: "Ọ̀yẹ̀kú, nuit qui porte la lumière en son ventre. Toi qui gardes la porte des ancêtres, tu protèges la vie contre ce qui la menace. Celui qui t'honore ne marche jamais seul : ceux qui l'ont précédé marchent devant lui.",
    orisha: ['Egúngún (les ancêtres)', 'Ọbàtálá', 'Ọ̀rúnmìlà'],
    vodun: ['Kúvitó (les revenants)', 'Mawu'],
    lessons: [
      'Ce qui se termine prépare ce qui va naître.',
      'On ne marche pas loin sans honorer ceux qui ont ouvert la route.',
      "La patience de la nuit fait mûrir ce que le jour révélera.",
      'Protéger la vie passe avant tout autre combat.',
    ],
    teaching: "## La nuit qui contient le jour\n\nỌ̀yẹ̀kú est le second Méjì : toutes ses marques sont doubles. Il est le pendant d'Ogbè, la nuit face à la lumière. Il parle des **ancêtres**, des **fins** et des **renaissances**.\n\n## Ce qu'il demande\n\n- honorer les défunts de la famille ;\n- accepter ce qui doit se terminer ;\n- se protéger avant d'entreprendre.\n\n> Ceux qui sont partis veillent sur ceux qui restent.",
    birth: {
      nature: "Tu es une personne profonde, liée aux ancêtres et aux mystères. Tu ressens ce que les autres ne voient pas ; tu sais traverser les fins sans te perdre. Ta force est ta résistance, ton risque est de t'enfermer dans la tristesse ou la peur.",
      path: "Ta vie connaît des fins et des renaissances : chaque étape close en ouvre une autre. La protection de ta famille et la mémoire de tes ancêtres jouent un grand rôle dans ce qui t'arrive. Ce qui semble perdu revient souvent sous une autre forme.",
      todo: ['Honorer régulièrement les ancêtres de ta famille', 'Te protéger spirituellement avant les grands changements', 'Prendre au sérieux tes rêves', 'Prendre soin de ta santé sans attendre'],
      avoid: ['Négliger la mémoire des défunts', 'Sortir seul la nuit sans raison', 'Les disputes autour des héritages', 'Ignorer les signaux de ton corps'],
      eat: ['Haricots (ẹ̀wà)', 'Igname', 'Plats partagés en famille'],
      noEat: ["La viande d'un animal trouvé mort", 'La nourriture offerte aux morts'],
      divinities: ['Les ancêtres (Egúngún, Kúvitó)', 'Ọbàtálá (Mawu)', 'Ọ̀rúnmìlà (Fá)'],
      colors: ['Noir', 'Blanc'],
    },
  },
  iwori: {
    oriki: "Ìwòrì, regard tourné vers l'intérieur. Toi qui vois le fond des choses, tu sépares le vrai du faux et changes ce qui doit changer. Celui qui t'écoute apprend à se connaître avant de juger le monde.",
    orisha: ['Ọ̀rúnmìlà', 'Orí', 'Èṣù'],
    vodun: ['Fá', 'Lɛgba'],
    lessons: [
      "Regarde en toi avant d'accuser les autres.",
      "Le discernement vaut plus que la force.",
      'Ce que tu refuses de transformer finit par te transformer.',
      'La connaissance sans sagesse est une arme retournée contre soi.',
    ],
    teaching: "## Le regard intérieur\n\nÌwòrì parle d'**introspection**, de **discernement** et de **transformation**. C'est l'Odu de la vision intérieure et de l'étude.\n\n## Ce qu'il demande\n\n- s'examiner honnêtement ;\n- apprendre et transmettre ;\n- se méfier des apparences.\n\n> L'œil qui se regarde lui-même voit plus loin que celui qui regarde les autres.",
    birth: {
      nature: "Tu es une personne de réflexion et d'intuition, faite pour comprendre, étudier et voir clair. Tu perçois les intentions cachées. Ta force est ton discernement, ton risque est la méfiance qui t'isole.",
      path: "Ta vie avance par prises de conscience. Les études, la connaissance et la vie spirituelle t'ouvrent des portes. Des transformations profondes marquent ton parcours : chacune te rapproche de ce que tu es vraiment.",
      todo: ['Étudier, apprendre, transmettre', 'Méditer ou prier chaque jour', 'Vérifier avant de faire confiance', 'Suivre ton intuition quand elle insiste'],
      avoid: ['Juger trop vite', 'Te replier sur toi', 'Utiliser ce que tu sais pour manipuler', 'Garder des rancunes'],
      eat: ['Igname pilée (iyán)', 'Légumes verts', 'Noix de kola'],
      noEat: ["L'alcool fort qui trouble l'esprit"],
      divinities: ['Ọ̀rúnmìlà (Fá)', 'Orí, ta tête', 'Èṣù (Lɛgba)'],
      colors: ['Vert', 'Jaune'],
    },
  },
  odi: {
    oriki: "Òdí, sceau et matrice du monde. Toi qui fermes pour protéger et portes ce qui va naître, tu changes l'obstacle en passage. Ce que tu gardes, nul ne le prend ; ce que tu enfantes porte ton sceau.",
    orisha: ['Yemọja', 'Ògún', 'Èṣù'],
    vodun: ['Tɔxɔsu', 'Gu', 'Lɛgba'],
    lessons: [
      "Ce qui est fermé n'est pas perdu : il est protégé.",
      "L'obstacle annonce souvent une naissance.",
      'Garde tes secrets : tout ne se dit pas à tout le monde.',
      'La fidélité protège mieux qu’un mur.',
    ],
    teaching: "## Le sceau et la matrice\n\nÒdí parle de **ce qui est fermé pour être protégé**, de **fertilité** et des **obstacles qui précèdent une naissance**.\n\n## Ce qu'il demande\n\n- protéger ce qui est précieux ;\n- rester fidèle à ses engagements ;\n- traverser l'obstacle au lieu de le fuir.\n\n> La graine fermée dans la terre est déjà un arbre.",
    birth: {
      nature: "Tu es une personne protectrice et fidèle, qui garde, porte et fait naître. Tu as une grande force intérieure et un sens du secret. Ta force est ta loyauté, ton risque est de te fermer à ceux qui veulent t'aider.",
      path: "Ta vie passe par des portes qui semblent fermées avant de s'ouvrir. La famille, les enfants et ce que tu fais naître (projets, foyer, œuvre) sont au cœur de ton chemin. Ce que tu gagnes après l'obstacle est durable.",
      todo: ['Protéger ton foyer et tes proches', 'Tenir tes engagements', 'Garder pour toi ce qui doit rester secret', 'Honorer les eaux (mer, rivière)'],
      avoid: ["L'infidélité", 'Dévoiler les secrets qu’on te confie', 'Abandonner devant le premier obstacle', 'Les relations nouées dans le mensonge'],
      eat: ['Poisson', 'Melon et graines de melon (ẹ̀gúsí)', 'Igname'],
      noEat: ['La nourriture préparée par une personne qui te veut du mal'],
      divinities: ['Yemọja', 'Ògún (Gu)', 'Èṣù (Lɛgba)'],
      colors: ['Bleu', 'Blanc'],
    },
  },
  irosun: {
    oriki: "Ìrosùn, mémoire du sang, poudre rouge de l'ọpọ́n. Toi qui relies l'enfant à sa lignée, tu parles dans les rêves et avertis avant que le malheur n'arrive. Celui qui t'écoute voit venir de loin.",
    orisha: ['Egúngún (la lignée)', 'Ṣàngó', 'Ọ̀ṣun'],
    vodun: ['Hɛvioso', 'Kúvitó (les ancêtres)'],
    lessons: [
      'Tu portes la mémoire de ta lignée : honore-la.',
      'Les rêves avertissent ; celui qui les écoute évite la chute.',
      'La vigilance vaut mieux que le regret.',
      'Ce qui est dans le sang se règle avec la famille.',
    ],
    teaching: "## La mémoire du sang\n\nÌrosùn tient son nom de l'**osùn**, la poudre rouge. Il parle de la **lignée**, des **rêves qui avertissent** et de la **vigilance**.\n\n## Ce qu'il demande\n\n- connaître et honorer sa lignée ;\n- noter et écouter ses rêves ;\n- rester vigilant face à ce qui se prépare.\n\n> Le sang se souvient de ce que la tête a oublié.",
    birth: {
      nature: "Tu es une personne enracinée dans ta lignée, sensible aux rêves et aux signes. Tu as de la mémoire, du caractère et un sens aigu du danger. Ta force est ta vigilance, ton risque est l'inquiétude permanente.",
      path: "Ta vie est liée à l'histoire de ta famille : ce qui n'a pas été réglé avant toi peut se présenter à toi, et c'est aussi de ta lignée que vient ta force. Tes rêves t'avertissent souvent de ce qui arrive.",
      todo: ['Honorer les ancêtres de ta lignée', 'Noter tes rêves et en parler à ton babaláwo', 'Rester vigilant face aux personnes nouvelles', 'Porter du rouge pour te protéger'],
      avoid: ['Renier ta famille ou ton origine', 'Ignorer un avertissement reçu en rêve', 'La colère violente', 'Les conflits de sang (entre parents)'],
      eat: ['Haricots rouges', "Igname à l'huile de palme", 'Gombo (ìlá)'],
      noEat: ['Les viandes trop saignantes'],
      divinities: ['Les ancêtres de ta lignée', 'Ṣàngó (Hɛvioso)', 'Ọ̀ṣun'],
      colors: ['Rouge'],
    },
  },
  owonrin: {
    oriki: "Ọ̀wọ́nrín, l'imprévu qui renverse. Toi qui mets le monde sens dessus dessous pour qu'il se remette d'aplomb, tu cours plus vite que la nouvelle. Celui qui t'honore change le désordre en chance.",
    orisha: ['Èṣù', 'Ṣàngó', 'Ọya'],
    vodun: ['Lɛgba', 'Hɛvioso'],
    lessons: [
      "L'imprévu n'est pas toujours un malheur : c'est souvent une porte.",
      'Garde ton calme quand tout se renverse.',
      "Honore celui qui ouvre les chemins avant de te mettre en route.",
      'La vitesse sans direction mène au désordre.',
    ],
    teaching: "## L'imprévu qui renverse\n\nỌ̀wọ́nrín parle de **retournements soudains**, de **vitesse** et du **désordre qui précède un nouvel ordre**.\n\n## Ce qu'il demande\n\n- rester calme dans les changements brusques ;\n- honorer Èṣù, qui ouvre et ferme les routes ;\n- ne pas confondre agitation et action.\n\n> Le marché renversé se relève, mais pas avec les mêmes marchandises.",
    birth: {
      nature: "Tu es une personne vive, rapide et pleine de ressources, capable de rebondir là où d'autres s'effondrent. Tu aimes le mouvement. Ta force est ton adaptation, ton risque est l'instabilité.",
      path: "Ta vie connaît des retournements : des chances arrivent sans prévenir, des situations basculent vite. Celui qui sait saisir l'imprévu en tire de grands gains. Les voyages et les changements de cap sont fréquents.",
      todo: ['Honorer Èṣù (Lɛgba) avant tes démarches importantes', 'Garder une réserve (argent, temps) pour l’imprévu', 'Prendre le temps de réfléchir avant de décider', 'Tenir tes comptes en ordre'],
      avoid: ['Les décisions prises dans la précipitation', 'Les paris et les jeux d’argent', 'Te disperser dans trop de projets', 'Provoquer les gens par la parole'],
      eat: ['Ẹ̀kọ', 'Igname grillée', "Plats à l'huile de palme"],
      noEat: ["L'huile de palmiste (àdín)"],
      divinities: ['Èṣù (Lɛgba)', 'Ṣàngó (Hɛvioso)', 'Ọya'],
      colors: ['Rouge', 'Noir'],
    },
  },
  obara: {
    oriki: "Ọ̀bàrà, le dernier devenu premier. Toi qu'on a méprisé et que la fortune est venue chercher, tu fais de la parole une maison ou une ruine. Celui qui t'honore apprend l'humilité et reçoit la richesse.",
    orisha: ['Ṣàngó', 'Ọ̀ṣun', 'Èṣù'],
    vodun: ['Hɛvioso', 'Lɛgba'],
    lessons: [
      'Celui qu’on méprise aujourd’hui peut être roi demain.',
      'La parole construit ou détruit : choisis-la.',
      "L'humilité attire la richesse, l'orgueil la chasse.",
      'Ne promets pas ce que tu ne peux pas tenir.',
    ],
    teaching: "## Le dernier devenu premier\n\nỌ̀bàrà parle de la **parole**, de la **prospérité tardive** et de l'**humilité**. Il raconte la fortune qui vient à celui que l'on avait méprisé.\n\n## Ce qu'il demande\n\n- tenir sa langue ;\n- rester humble dans la réussite ;\n- partager ce que l'on reçoit.\n\n> La calebasse qu'on a laissée au fond de la case contenait l'or.",
    birth: {
      nature: "Tu es une personne de parole et de présence, avec un vrai don pour convaincre. Tu as souvent été sous-estimé. Ta force est ta capacité à te relever, ton risque est de parler trop ou de promettre trop.",
      path: "Ta prospérité vient souvent tard, après des périodes où l'on ne t'a pas pris au sérieux. Le commerce, la parole publique et les responsabilités te réussissent si tu restes humble. Ce que tu donnes te revient multiplié.",
      todo: ['Peser chaque parole avant de la dire', 'Partager une part de ce que tu gagnes', 'Rester humble quand tout va bien', 'Honorer Ṣàngó (Hɛvioso)'],
      avoid: ['Les promesses que tu ne tiendras pas', 'La vantardise', 'Mépriser les petites gens', 'Les mensonges, même pour plaisanter'],
      eat: ['Àmàlà et gombo (ìlá)', 'Igname', 'Bananes plantains'],
      noEat: ['Les haricots blancs (ẹ̀wà sẹ́ẹ́sẹ́)'],
      divinities: ['Ṣàngó (Hɛvioso)', 'Ọ̀ṣun', 'Èṣù (Lɛgba)'],
      colors: ['Rouge', 'Blanc'],
    },
  },
  okanran: {
    oriki: "Ọ̀kànràn, cœur qui parle avant de réfléchir. Toi qui dis la vérité tranchante, tu provoques la querelle et rends la justice. Celui qui t'honore apprend à garder son cœur et voit la justice se lever pour lui.",
    orisha: ['Èṣù', 'Ṣàngó', 'Ògún'],
    vodun: ['Lɛgba', 'Hɛvioso', 'Gu'],
    lessons: [
      'Une vérité dite avec colère blesse plus qu’elle ne guérit.',
      'Le cœur doit être gardé comme une maison.',
      'La justice finit toujours par se manifester.',
      'Ne te mêle pas des querelles des autres.',
    ],
    teaching: "## Le cœur qui parle trop vite\n\nỌ̀kànràn parle de **vérité**, de **conflits nés de la parole** et de **justice**.\n\n## Ce qu'il demande\n\n- maîtriser ses colères ;\n- dire la vérité avec mesure ;\n- confier sa cause à la justice plutôt qu'à la vengeance.\n\n> Le cœur qui s'emporte brûle d'abord sa propre maison.",
    birth: {
      nature: "Tu es une personne entière, sincère et passionnée, incapable de supporter l'injustice. Tu dis ce que tu penses. Ta force est ta franchise, ton risque est la colère qui provoque les conflits.",
      path: "Ta vie est marquée par des combats pour la justice et la vérité. Des conflits nés de la parole peuvent te coûter, mais la justice finit par te donner raison. Les métiers de défense, de droit ou de protection te conviennent.",
      todo: ['Compter jusqu’à dix avant de répondre', 'Défendre les causes justes avec méthode', 'Faire la paix rapidement après une dispute', 'Honorer Èṣù (Lɛgba)'],
      avoid: ['La colère et la violence', 'Les commérages', 'Te mêler des querelles des autres', 'Les décisions prises sous le coup de l’émotion'],
      eat: ['Ẹ̀kọ', 'Igname grillée', 'Noix de kola'],
      noEat: ["L'huile de palmiste (àdín)", "L'alcool fort qui échauffe le cœur"],
      divinities: ['Èṣù (Lɛgba)', 'Ṣàngó (Hɛvioso)', 'Ògún (Gu)'],
      colors: ['Rouge', 'Noir'],
    },
  },
  ogunda: {
    oriki: "Ògúndá, lame qui ouvre la route. Toi qui défriches la forêt et sépares ce qui doit l'être, tu donnes la victoire à celui qui travaille. Là où tu passes, le chemin s'ouvre.",
    orisha: ['Ògún', 'Ọ̀ṣọ́ọ̀sì', 'Ọ̀rúnmìlà'],
    vodun: ['Gu', 'Agè (la brousse)'],
    lessons: [
      'Le travail ouvre les routes que la chance ne trouve pas.',
      'Certaines séparations sont nécessaires pour avancer.',
      'Le fer protège celui qui le respecte et blesse celui qui le néglige.',
      'Finis ce que tu commences.',
    ],
    teaching: "## La lame qui ouvre la route\n\nÒgúndá est l'Odu d'**Ògún**, maître du fer. Il parle de **travail**, de **détermination** et des **séparations nettes**.\n\n## Ce qu'il demande\n\n- travailler avec constance ;\n- trancher quand il le faut ;\n- respecter les outils et les armes.\n\n> La machette qui reste dans sa gaine ne défriche aucun champ.",
    birth: {
      nature: "Tu es une personne de travail et de détermination, faite pour ouvrir des chemins. Tu as du courage et de l'endurance. Ta force est ton énergie, ton risque est la dureté et les ruptures brutales.",
      path: "Ta vie avance par le travail : ce que tu obtiens, tu le gagnes par l'effort. Les métiers techniques, manuels, les routes et les métaux te réussissent. Des séparations marquent ton parcours, souvent pour ton bien.",
      todo: ['Travailler avec constance, sans abandonner', 'Honorer Ògún (Gu)', 'Prendre soin de tes outils et de tes véhicules', 'Trancher clairement quand une situation doit finir'],
      avoid: ['La violence et les armes', 'La paresse', 'Les ruptures faites dans la colère', 'Rouler vite ou imprudemment'],
      eat: ['Igname grillée (iṣu sísun)', "Plats à l'huile de palme", 'Noix de kola'],
      noEat: ['La nourriture obtenue par le vol ou la ruse'],
      divinities: ['Ògún (Gu)', 'Ọ̀ṣọ́ọ̀sì', 'Ọ̀rúnmìlà (Fá)'],
      colors: ['Vert', 'Noir'],
    },
  },
  osa: {
    oriki: "Ọ̀sá, vent qui déplace les choses. Toi qui portes la force des mères et souffles le changement, tu fais partir et tu fais venir. Celui qui te respecte traverse la tempête sans être emporté.",
    orisha: ['Ọya', 'Ìyàmí (les mères)', 'Ṣàngó'],
    vodun: ['Hɛvioso', 'Avlekete'],
    lessons: [
      'Le vent qui arrache aussi sème plus loin.',
      'Respecte les forces que tu ne comprends pas.',
      'Les départs font partie du chemin.',
      'Honore les mères : leur colère est aussi grande que leur protection.',
    ],
    teaching: "## Le vent qui déplace\n\nỌ̀sá parle de **changements brusques**, de **départs** et des **forces des mères** (Ìyàmí), qu'il faut respecter.\n\n## Ce qu'il demande\n\n- accepter le changement ;\n- respecter les femmes et les mères ;\n- se protéger avant de partir.\n\n> Le vent ne demande pas la permission pour passer.",
    birth: {
      nature: "Tu es une personne de mouvement et de grande force intérieure, qui ne tient pas en place. Tu sens les changements avant qu'ils arrivent. Ta force est ton courage, ton risque est l'instabilité et les départs précipités.",
      path: "Ta vie connaît des changements brusques : déménagements, voyages, changements de situation. Tu peux réussir loin de ton lieu de naissance. Les femmes et les mères ont un rôle décisif, en bien comme en mal, dans ton parcours.",
      todo: ['Respecter les femmes et les mères', 'Te protéger spirituellement avant un voyage', 'Honorer Ọya', 'Garder des racines même quand tu pars'],
      avoid: ['Partir sur un coup de tête', 'Offenser les femmes âgées', 'Les lieux isolés la nuit', 'Les conflits avec ta mère'],
      eat: ['Àkàrà (beignets de haricots)', 'Aubergines', 'Igname'],
      noEat: ['La viande de bélier (àgbò)'],
      divinities: ['Ọya', 'Les mères (Ìyàmí)', 'Ṣàngó (Hɛvioso)'],
      colors: ['Bordeaux', 'Brun'],
    },
  },
  ika: {
    oriki: "Ìká, main qui retient. Toi qui gardes la parole et mesures chaque pas, tu sais que la force se tient plus qu'elle ne se montre. Celui qui t'honore apprend la prudence et ne tombe pas dans le piège.",
    orisha: ['Èṣù', 'Ọ̀rúnmìlà', 'Ọ̀ṣun'],
    vodun: ['Dan', 'Lɛgba'],
    lessons: [
      'La parole gardée est une force.',
      'La prudence n’est pas la peur.',
      'Ce que tu contrôles en toi, personne ne peut le contrôler.',
      'Méfie-toi de celui qui flatte.',
    ],
    teaching: "## La main qui retient\n\nÌká parle de **prudence**, de **maîtrise de soi** et du **pouvoir de la parole gardée**.\n\n## Ce qu'il demande\n\n- mesurer ses paroles et ses actes ;\n- se méfier de la flatterie ;\n- user de son pouvoir avec mesure.\n\n> Le serpent qui se tait vit longtemps.",
    birth: {
      nature: "Tu es une personne réservée, stratège et maîtresse d'elle-même. Tu observes avant d'agir. Ta force est ta prudence, ton risque est de garder trop pour toi ou d'être tenté par le contrôle des autres.",
      path: "Ta vie se construit par la patience et la stratégie. Tu réussis là où il faut de la discrétion et de la mesure. Des pièges se présentent sur ta route : ta prudence te protège si tu l'écoutes.",
      todo: ['Réfléchir avant de parler', 'Garder tes projets secrets jusqu’à leur réussite', 'Honorer Dan et Èṣù (Lɛgba)', 'Choisir tes amis avec soin'],
      avoid: ['Utiliser ton pouvoir pour dominer', 'La flatterie, reçue ou donnée', 'Les paroles méchantes', 'Les associations douteuses'],
      eat: ['Igname', 'Haricots', 'Œufs'],
      noEat: ['La viande de serpent'],
      divinities: ['Dan', 'Èṣù (Lɛgba)', 'Ọ̀rúnmìlà (Fá)'],
      colors: ['Brun', 'Vert'],
    },
  },
  oturupon: {
    oriki: "Òtúúrúpọ̀n, corps et terre. Toi qui portes l'enfant et guéris ce qui souffre, tu parles par la santé et par la terre qui nourrit. Celui qui t'honore apprend à écouter son corps.",
    orisha: ['Ọbalúayé (Ṣọ̀pọ̀nná)', 'Ilẹ̀ (la Terre)', 'Ọ̀ṣun'],
    vodun: ['Sakpata', 'Ayí (la Terre)'],
    lessons: [
      'Le corps parle : écoute-le avant qu’il ne crie.',
      'La terre nourrit celui qui la respecte.',
      'La guérison demande du temps et des soins réguliers.',
      'Ce qui naît demande d’être protégé.',
    ],
    teaching: "## Le corps et la terre\n\nÒtúúrúpọ̀n parle de **santé**, de **guérison**, d'**enfantement** et de la **terre**.\n\n## Ce qu'il demande\n\n- prendre soin de son corps ;\n- respecter la terre ;\n- consulter un médecin quand le corps souffre.\n\n> La terre porte tout le monde, mais elle n'oublie pas qui la piétine.",
    birth: {
      nature: "Tu es une personne concrète, enracinée et endurante, proche de la terre et du corps. Tu as souvent un don pour soigner. Ta force est ta solidité, ton risque est de négliger ta propre santé.",
      path: "Ta vie est liée à la santé, la tienne et celle des autres, et à la terre : soins, agriculture, maison. Tu traverses des épreuves physiques dont tu sors renforcé. La famille et les enfants occupent une place importante.",
      todo: ['Consulter un médecin régulièrement', 'Avoir un rythme de vie sain', 'Honorer la terre (Ilẹ̀, Ayí)', 'Aider ceux qui souffrent'],
      avoid: ['Négliger les signaux de ton corps', 'Les excès (alcool, nourriture, nuits blanches)', 'Maltraiter la terre ou les animaux', 'Les lieux insalubres'],
      eat: ['Maïs grillé', 'Haricots', 'Igname'],
      noEat: ['Le vin de palme en excès'],
      divinities: ['Ọbalúayé (Sakpata)', 'La Terre (Ilẹ̀, Ayí)', 'Ọ̀ṣun'],
      colors: ['Brun', 'Ocre'],
    },
  },
  otura: {
    oriki: "Òtúrá, paix et vision. Toi qui élèves l'esprit et rassembles ce qui était dispersé, tu portes la parole sacrée qui guide. Celui qui t'honore trouve la paix et la donne autour de lui.",
    orisha: ['Ọbàtálá', 'Ọ̀rúnmìlà', 'Ọ̀ṣun'],
    vodun: ['Lisa', 'Fá'],
    lessons: [
      'La paix se construit d’abord en soi.',
      'Une parole sacrée bien suivie guide toute une vie.',
      'Toutes les voies vers le divin méritent le respect.',
      'L’harmonie vaut plus que la victoire.',
    ],
    teaching: "## La paix et la vision\n\nÒtúrá parle d'**élévation spirituelle**, d'**harmonie** et d'une **parole sacrée** qui guide. Dans plusieurs lignées, il est aussi l'Odu qui reconnaît les autres traditions religieuses.\n\n## Ce qu'il demande\n\n- cultiver la paix intérieure ;\n- respecter toutes les croyances ;\n- suivre une discipline spirituelle.\n\n> Celui qui prie en paix est entendu de loin.",
    birth: {
      nature: "Tu es une personne spirituelle, pacifique et visionnaire, qui cherche l'harmonie. Tu inspires confiance. Ta force est ta sagesse, ton risque est de fuir les conflits au lieu de les régler.",
      path: "Ta vie a une forte dimension spirituelle : tu peux devenir un guide pour d'autres. Les voyages, les études et la rencontre d'autres cultures t'enrichissent. Tu obtiens la paix après avoir accepté ta vocation.",
      todo: ['Prier ou méditer chaque jour', 'Respecter toutes les croyances', 'Porter du blanc', 'Être un artisan de paix autour de toi'],
      avoid: ['Les disputes religieuses', 'L’alcool fort', 'Les lieux de violence', 'Abandonner ta vie spirituelle'],
      eat: ['Escargots (ìgbín)', 'Ẹ̀kọ', 'Riz blanc', 'Lait'],
      noEat: ['Le vin de palme et l’alcool fort'],
      divinities: ['Ọbàtálá (Lisa)', 'Ọ̀rúnmìlà (Fá)', 'Ọ̀ṣun'],
      colors: ['Blanc'],
    },
  },
  irete: {
    oriki: "Ìrẹtẹ̀, pression qui finit par vaincre. Toi qui écrases l'obstacle à force de patience, tu donnes la longue vie à celui qui persévère. Ce que tu tiens, tu ne le lâches pas.",
    orisha: ['Ọbalúayé (Ṣọ̀pọ̀nná)', 'Ilẹ̀ (la Terre)', 'Ìyàmí (les mères)'],
    vodun: ['Sakpata', 'Ayí (la Terre)'],
    lessons: [
      'La patience vient à bout de la pierre.',
      'Ce qui dure se construit lentement.',
      'Ne lâche pas ce qui est juste, même quand c’est difficile.',
      'Respecte la terre : elle est la mère de tous.',
    ],
    teaching: "## La pression qui finit par vaincre\n\nÌrẹtẹ̀ parle de **persévérance**, de **ténacité** et de **longévité**.\n\n## Ce qu'il demande\n\n- tenir dans la durée ;\n- ne pas abandonner à mi-chemin ;\n- honorer la terre.\n\n> La goutte qui tombe chaque jour creuse le rocher.",
    birth: {
      nature: "Tu es une personne tenace et endurante, qui ne lâche pas. Tu avances lentement mais sûrement. Ta force est ta persévérance, ton risque est l'entêtement.",
      path: "Ta vie se gagne dans la durée : tes victoires viennent après de longs efforts. Tu as des chances de longue vie si tu prends soin de toi. Les biens solides (terre, maison) te réussissent.",
      todo: ['Persévérer dans tes projets', 'Honorer la terre (Ilẹ̀, Ayí)', 'Prendre soin de ta santé sur la durée', 'Économiser régulièrement'],
      avoid: ['L’entêtement quand tu as tort', 'Abandonner à mi-chemin', 'Les conflits autour des terres', 'Les excès qui usent le corps'],
      eat: ['Maïs grillé', 'Haricots', 'Igname'],
      noEat: ['Le vin de palme en excès'],
      divinities: ['Ọbalúayé (Sakpata)', 'La Terre (Ilẹ̀, Ayí)', 'Ọ̀rúnmìlà (Fá)'],
      colors: ['Brun', 'Ocre'],
    },
  },
  ose: {
    oriki: "Ọ̀ṣẹ́, douceur qui triomphe. Toi qui apportes l'abondance, l'amour et la beauté, tu vaincs l'adversité sans lever la main. Celui qui t'honore voit la rivière couler vers sa maison.",
    orisha: ['Ọ̀ṣun', 'Ìyàmí (les mères)', 'Yemọja'],
    vodun: ['Tɔxɔsu', 'Avlekete', 'Mami Wata'],
    lessons: [
      'La douceur vient à bout de la dureté.',
      'L’abondance se partage ou elle se tarit.',
      'Prends soin de ta beauté comme d’un don.',
      'L’ennemi est vaincu par la patience, pas par la violence.',
    ],
    teaching: "## La douceur qui triomphe\n\nỌ̀ṣẹ́ parle d'**abondance**, d'**amour**, de **beauté** et de **victoire sur l'adversité**. C'est un Odu cher à **Ọ̀ṣun**.\n\n## Ce qu'il demande\n\n- rester doux sans être faible ;\n- partager l'abondance ;\n- honorer les eaux douces.\n\n> La rivière contourne le rocher, et c'est elle qui arrive à la mer.",
    birth: {
      nature: "Tu es une personne douce, attirante et généreuse, qui aime la beauté et l'harmonie. Tu sais charmer et réconcilier. Ta force est ta douceur, ton risque est la jalousie que tu suscites.",
      path: "Ta vie est tournée vers l'abondance, l'amour et la création. Tu triomphes de tes adversaires par la patience. Le commerce, les arts et tout ce qui touche à la beauté te réussissent.",
      todo: ['Honorer Ọ̀ṣun et les eaux douces', 'Partager ce que tu reçois', 'Prendre soin de toi et de ta beauté', 'Te protéger de la jalousie'],
      avoid: ['Afficher ta richesse', 'Les amours cachées', 'La vengeance', 'Négliger les promesses faites à une divinité'],
      eat: ['Miel', 'Oranges', 'Ẹ̀kọ', 'Poisson de rivière'],
      noEat: ['La nourriture offerte par une personne jalouse'],
      divinities: ['Ọ̀ṣun', 'Les mères (Ìyàmí)', 'Yemọja (Tɔxɔsu)'],
      colors: ['Jaune', 'Ambre'],
    },
  },
  ofun: {
    oriki: "Òfún, blanc originel. Toi qui portes le souffle de la création et régénères ce qui s'épuise, tu es le kaolin dont le monde a été fait. Celui qui t'honore retrouve sa pureté et son souffle.",
    orisha: ['Ọbàtálá (Òrìṣà-ńlá)', 'Odù (la mère des Odu)', 'Ìyàmí (les mères)'],
    vodun: ['Mawu', 'Lisa'],
    lessons: [
      'La pureté du cœur est la première protection.',
      'Ce qui s’épuise peut être régénéré.',
      'Le souffle est sacré : ne le gaspille pas en paroles vaines.',
      'Rends ce que tu as reçu.',
    ],
    teaching: "## Le blanc originel\n\nÒfún parle de **pureté**, du **souffle créateur** et de la **régénération profonde**. Il est lié à **Ọbàtálá** et au kaolin (ẹfun).\n\n## Ce qu'il demande\n\n- garder un cœur pur ;\n- se régénérer par le repos et la prière ;\n- rendre ce que l'on a reçu.\n\n> Le kaolin ne se salit pas : c'est la main qui le salit.",
    birth: {
      nature: "Tu es une personne de pureté et de création, avec une grande force de régénération. Tu as un lien fort avec le sacré. Ta force est ta capacité à renaître, ton risque est l'épuisement à force de donner.",
      path: "Ta vie connaît des renouvellements profonds : tu peux tout reconstruire. La vie spirituelle, la création et le soin des autres sont au cœur de ton chemin. Tu reçois beaucoup quand tu rends ce que tu as reçu.",
      todo: ['Porter du blanc', 'Te reposer et te régénérer régulièrement', 'Honorer Ọbàtálá (Mawu-Lisa)', 'Garder ta parole pure'],
      avoid: ['L’alcool et le vin de palme', 'Les paroles impures ou grossières', 'L’épuisement', 'Garder pour toi ce qui doit être rendu'],
      eat: ['Escargots (ìgbín)', 'Ẹ̀kọ', 'Igname blanche', 'Riz blanc'],
      noEat: ['Le vin de palme et l’alcool fort', "L'huile de palme en excès"],
      divinities: ['Ọbàtálá (Mawu-Lisa)', 'Odù, la mère des Odu', 'Les mères (Ìyàmí)'],
      colors: ['Blanc'],
    },
  },
};

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const uniq = (a: string[]) => [...new Set(a)];
const firstSentence = (s: string) => (s.match(/^[^.]*\./)?.[0] ?? s).trim();

/** Contenu de départ d'un Odu : propre aux Méjì, composé pour les Ọmọ Odù. */
export function defaultLore(o: Odu): OduLore {
  const R = MEJI_LORE[o.right.ascii];
  const L = MEJI_LORE[o.left.ascii];
  if (o.isMeji) return { ...R, birth: { ...R.birth, noEat: [...R.birth.noEat, EEWO_NOTE] } };
  const rn = o.right.name;
  const ln = o.left.name;
  return {
    oriki: `${o.name}, né de ${rn} et de ${ln}. ${R.oriki} Par sa jambe gauche, ${ln} y ajoute sa marque : ${lowerFirst(firstSentence(o.left.essence))}`,
    orisha: uniq([...R.orisha, ...L.orisha]).slice(0, 5),
    vodun: uniq([...R.vodun, ...L.vodun]).slice(0, 4),
    lessons: uniq([...R.lessons.slice(0, 3), ...L.lessons.slice(0, 2)]),
    teaching: `## ${rn} gouverne\n\n${o.right.essence}\n\n${R.lessons.slice(0, 2).map((l) => `- ${l}`).join('\n')}\n\n## ${ln} nuance\n\n${o.left.essence}\n\n${L.lessons.slice(0, 2).map((l) => `- ${l}`).join('\n')}\n\n> ${o.name} se lit d'abord par ${rn}, la jambe droite, qui donne la direction ; ${ln}, la jambe gauche, précise et colore ce qu'il dit.`,
    birth: {
      nature: `${R.birth.nature} Par la jambe gauche, ${ln} nuance ce caractère : ${lowerFirst(firstSentence(L.birth.nature))}`,
      path: `${R.birth.path} ${ln} y ajoute sa couleur : ${lowerFirst(firstSentence(L.birth.path))}`,
      todo: uniq([...R.birth.todo.slice(0, 3), ...L.birth.todo.slice(0, 2)]),
      avoid: uniq([...R.birth.avoid.slice(0, 3), ...L.birth.avoid.slice(0, 2)]),
      eat: uniq([...R.birth.eat.slice(0, 3), ...L.birth.eat.slice(0, 1)]),
      noEat: uniq([...R.birth.noEat, ...L.birth.noEat.slice(0, 1), EEWO_NOTE]),
      divinities: uniq([...R.birth.divinities.slice(0, 2), ...L.birth.divinities.slice(0, 2)]),
      colors: uniq([...R.birth.colors, ...L.birth.colors.slice(0, 1)]),
    },
  };
}

/** Champs que le prêtre peut remplacer (OduContent.lore). Un champ vide ou absent garde le texte de départ. */
export type LoreOverride = Partial<Omit<OduLore, 'birth'>> & { birth?: Partial<BirthLore> };

const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim().length > 0 : false);

export function mergeLore(base: OduLore, over?: LoreOverride | null): OduLore {
  if (!over) return base;
  const out: OduLore = { ...base, birth: { ...base.birth } };
  for (const k of ['oriki', 'orisha', 'vodun', 'lessons', 'teaching'] as const) {
    if (filled(over[k])) (out as unknown as Record<string, unknown>)[k] = over[k];
  }
  for (const k of Object.keys(base.birth) as (keyof BirthLore)[]) {
    if (over.birth && filled(over.birth[k])) (out.birth as unknown as Record<string, unknown>)[k] = over.birth[k];
  }
  return out;
}
