/**
 * Enseignements approfondis des Odu (refonte, étape R22, demandés le 2026-11-20).
 * Brouillons publiés, à relire par le prêtre : chaque lignée a ses versets et ses récits.
 * Honnêteté : « Un récit d'Ifá » = récit connu de la tradition (version résumée) ; « Une parabole » = illustration
 * écrite pour la plateforme à partir de l'essence de l'Odu, jamais présentée comme un verset.
 * Le prêtre remplace tout enseignement dans Admin › Odu › fiche (champ Enseignement).
 */
import type { Odu } from './engine';

export interface MejiTeaching {
  /** Deux paragraphes : la parole de l'Odu. */
  intro: string[];
  story: { kind: 'itan' | 'parabole'; title: string; text: string };
  teaches: string[];
  asks: string[];
  warns: string[];
  word: string;
  question: string;
}

export const MEJI_TEACHING: Record<string, MejiTeaching> = {
  ogbe: {
    intro: [
      "Ogbè Méjì est le premier des seize Méjì, celui dont toutes les marques sont simples : la lumière y est entière. Il parle de la vie qui commence, des chemins qui s'ouvrent et de la victoire que donne la droiture. Quand il sort, c'est souvent qu'une période nouvelle est possible, à condition de la commencer proprement.",
      "Mais la lumière a une exigence : elle montre tout. Ogbè ne promet pas la réussite à celui qui triche ; il éclaire ce qui était caché. C'est pourquoi il est aussi l'Odu de la vérité qui finit par se savoir, et de l'orgueil qui guette ceux qui se croient au-dessus des autres.",
    ],
    story: { kind: 'itan', title: 'Le plus jeune couronné le premier', text: "On raconte que les seize Odu partirent ensemble vers Ifẹ̀ pour y être reçus. Ogbè, l'un des plus jeunes, s'arrêta en chemin pour aider le fils d'un roi de la forêt en difficulté : il consulta, fit le sacrifice demandé et le tira d'affaire. Reconnaissant, le roi lui montra le chemin le plus court. Ogbè arriva le premier à Ifẹ̀ et fut couronné. Les aînés, qui avaient refusé d'aider, arrivèrent après lui. Depuis, Ogbè est le roi des Odu." },
    teaches: [
      "La première place revient à celui qui sert, pas à celui qui se presse.",
      "Ce qui commence dans la droiture tient dans la durée.",
      "Ta tête (Orí) est ta première divinité : honore-la avant de demander aux autres.",
      "La lumière ne se garde pas : elle sert à éclairer.",
    ],
    asks: ["Commencer chaque chose avec une intention claire.", "Tenir sa parole, même dans les petites choses.", "Aider sur le chemin, même quand on est pressé.", "Remercier sa tête chaque matin."],
    warns: ["L'orgueil de celui qui croit avoir toujours raison.", "La double vie et les arrangements cachés.", "Le mépris envers les plus jeunes ou les plus pauvres."],
    word: "Ce que la lumière éclaire ne peut plus être caché.",
    question: "Quelle chose devrais-tu commencer aujourd'hui, à visage découvert ?",
  },
  oyeku: {
    intro: [
      "Ọ̀yẹ̀kú Méjì est la nuit complète, toutes marques doubles : le pendant d'Ogbè. Là où Ogbè est le jour qui commence, Ọ̀yẹ̀kú est la nuit qui protège et qui prépare. Il parle des ancêtres, de la mort et de ce qui se termine pour que quelque chose d'autre puisse naître.",
      "Ọ̀yẹ̀kú n'est pas un Odu de malheur. Il rappelle que la vie a des fins, et que les accepter évite d'être brisé par elles. Il demande de protéger la vie, d'honorer ceux qui sont partis, et de ne pas avoir peur de la nuit : c'est elle qui fait mûrir.",
    ],
    story: { kind: 'parabole', title: 'La graine et la nuit', text: "Une graine se plaignait d'être enterrée dans le noir. « Pourquoi m'avoir cachée ? Je veux la lumière. » La terre lui répondit : « Si je te laisse à la lumière maintenant, l'oiseau te mangera. Reste dans ma nuit le temps de devenir racine. » Quand la graine sortit enfin, elle était déjà plante, et l'oiseau ne pouvait plus rien contre elle." },
    teaches: [
      "Ce qui se termine prépare ce qui va naître.",
      "On ne marche pas loin sans honorer ceux qui ont ouvert la route.",
      "La nuit protège ce qui n'est pas encore prêt.",
      "Protéger la vie passe avant tous les autres combats.",
    ],
    asks: ["Honorer les défunts de la famille.", "Accepter la fin de ce qui doit finir.", "Se protéger avant d'entreprendre.", "Prendre soin de sa santé sans attendre."],
    warns: ["S'accrocher à ce qui est déjà mort.", "Négliger les avertissements du corps.", "Oublier ses ancêtres."],
    word: "Ceux qui sont partis veillent sur ceux qui restent.",
    question: "Qu'est-ce que tu dois laisser finir pour que ta vie recommence ?",
  },
  iwori: {
    intro: [
      "Ìwòrì Méjì est le regard qui se retourne vers l'intérieur. Il parle d'introspection, de discernement, d'étude et de transformation. C'est l'Odu de ceux qui cherchent à comprendre, et de la vision profonde que donne l'examen de soi.",
      "Ìwòrì demande de distinguer le vrai du faux : dans les autres, mais d'abord en soi. Il annonce souvent qu'une transformation est en cours ou nécessaire. Celui qui refuse de se regarder voit tout de travers ; celui qui accepte de se regarder voit plus loin que les autres.",
    ],
    story: { kind: 'itan', title: 'Ọ̀rúnmìlà et l’épouse Odù', text: "Un verset rattaché à la famille d'Ìwòrì raconte qu'Ọ̀rúnmìlà, dont la première épouse n'avait pas d'enfant, consulta Ifá. On lui conseilla d'épouser Odù, une femme de grand mystère, à condition de respecter ses secrets. Il accepta, et Odù lui donna les seize Méjì. Ìwòrì rappelle ainsi que la connaissance la plus profonde exige du respect et de la discrétion." },
    teaches: [
      "Regarde en toi avant d'accuser les autres.",
      "Le discernement vaut plus que la force.",
      "Ce que tu refuses de transformer finit par te transformer.",
      "La connaissance sans respect se retourne contre celui qui la porte.",
    ],
    asks: ["S'examiner honnêtement.", "Étudier, apprendre, transmettre.", "Vérifier avant de croire.", "Suivre une intuition qui insiste."],
    warns: ["Juger trop vite.", "Utiliser le savoir pour manipuler.", "Se méfier de tout le monde au point de s'isoler."],
    word: "L'œil qui se regarde voit plus loin que celui qui regarde les autres.",
    question: "Quelle vérité sur toi-même évites-tu de regarder ?",
  },
  odi: {
    intro: [
      "Òdí Méjì est le sceau et la matrice. Il parle de ce qui est fermé pour être protégé, de gestation, de fertilité et des obstacles qui précèdent une naissance. Le sceau garantit qu'une chose se réalisera ; la matrice garde l'enfant le temps qu'il devienne.",
      "Quand Òdí sort, il arrive souvent que tout semble fermé. Il demande de ne pas confondre la gestation avec l'échec. Il demande aussi la fidélité, la discrétion et le respect de ce qui est sacré dans le couple et dans la famille.",
    ],
    story: { kind: 'parabole', title: 'La porte qui protégeait', text: "Un homme frappait depuis des jours à la porte d'une maison sans qu'on lui ouvre. Furieux, il partit. Le soir même, un orage terrible éclata sur la route qu'il voulait prendre. Il comprit plus tard que la maison était celle d'un vieil homme qui, voyant venir l'orage, avait gardé sa porte fermée pour qu'il rebrousse chemin vers le village. Ce qui l'avait refusé l'avait sauvé." },
    teaches: [
      "Ce qui est fermé n'est pas perdu : il est protégé.",
      "L'obstacle annonce souvent une naissance.",
      "Tout ne se dit pas à tout le monde.",
      "La fidélité protège mieux qu'un mur.",
    ],
    asks: ["Protéger son foyer.", "Tenir ses engagements.", "Garder ses projets secrets jusqu'à leur naissance.", "Honorer les eaux."],
    warns: ["L'infidélité.", "Dévoiler les secrets confiés.", "Forcer une porte au lieu d'attendre qu'elle s'ouvre."],
    word: "La graine fermée dans la terre est déjà un arbre.",
    question: "Et si ce qui te bloque était en train de te protéger ?",
  },
  irosun: {
    intro: [
      "Ìrosùn Méjì tient son nom de l'osùn, la poudre rouge du bois de camwood. Il parle du sang et de la lignée, de la mémoire de la famille, des rêves qui avertissent et de la vigilance. Il relie la personne à ceux dont elle descend.",
      "Ìrosùn rappelle que le passé n'est pas mort : il est dans le sang. Ce qui n'a pas été réglé par les anciens peut se présenter aux jeunes, et la force de la lignée peut aussi venir les protéger. Il demande d'écouter les rêves et les signes, et de ne pas ignorer un avertissement.",
    ],
    story: { kind: 'parabole', title: 'Le rêve du pêcheur', text: "Un pêcheur rêva trois nuits de suite de sa grand-mère, morte depuis longtemps, qui lui tenait la main sur la plage sans rien dire. Le quatrième matin, il resta à terre. Ses compagnons partirent ; une tempête soudaine les surprit au large. Ils revinrent sains et saufs, mais sans leurs filets. Le pêcheur alla porter une offrande sur la tombe de sa grand-mère, et apprit ce jour-là à écouter les siens, même dans le sommeil." },
    teaches: [
      "Tu portes la mémoire de ta lignée : honore-la.",
      "Les rêves avertissent ; celui qui les écoute évite la chute.",
      "Ce qui est dans le sang se règle avec la famille.",
      "La vigilance vaut mieux que le regret.",
    ],
    asks: ["Connaître l'histoire de sa famille.", "Noter ses rêves et en parler à son babaláwo.", "Honorer les ancêtres de la lignée.", "Rester attentif à ce qui se prépare."],
    warns: ["Renier sa famille ou son origine.", "Ignorer un avertissement reçu.", "Les conflits de sang entre parents."],
    word: "Le sang se souvient de ce que la tête a oublié.",
    question: "Qu'est-ce que ta famille t'a transmis que tu n'as pas encore regardé ?",
  },
  owonrin: {
    intro: [
      "Ọ̀wọ́nrín Méjì est l'imprévu qui renverse. Il parle de retournements soudains, de vitesse, de chances qui arrivent sans prévenir et de désordres qui précèdent un nouvel ordre. C'est l'Odu du marché renversé, et de celui qui sait ramasser ce qui est tombé.",
      "Ọ̀wọ́nrín est lié à Èṣù, le maître des carrefours. Il rappelle que le monde change plus vite que nos plans, et que la sagesse n'est pas de tout prévoir mais de rester calme quand tout bascule. Ce qui semble un chaos peut devenir une chance pour celui qui garde la tête froide.",
    ],
    story: { kind: 'itan', title: 'Le bonnet aux deux couleurs', text: "Un récit lié à Èṣù raconte qu'il traversa un village coiffé d'un bonnet rouge d'un côté et blanc de l'autre. Les cultivateurs des deux bords de la route se disputèrent sur sa couleur, jusqu'à se battre. Èṣù revint et montra les deux côtés. Chacun avait dit vrai, et chacun s'était trompé. Ọ̀wọ́nrín enseigne ainsi que ce qui nous renverse vient souvent de ce que nous croyions tout voir." },
    teaches: [
      "L'imprévu n'est pas toujours un malheur : c'est souvent une porte.",
      "Garde ton calme quand tout se renverse.",
      "La vérité a toujours deux côtés.",
      "Honore celui qui ouvre les chemins avant de te mettre en route.",
    ],
    asks: ["Garder une réserve pour l'imprévu.", "Réfléchir avant de décider dans l'urgence.", "Honorer Èṣù avant les démarches importantes.", "Tenir ses comptes en ordre."],
    warns: ["Les décisions prises dans la précipitation.", "Les jeux d'argent et les paris.", "Se disperser dans trop de projets."],
    word: "Le marché renversé se relève, mais pas avec les mêmes marchandises.",
    question: "Quel renversement récent pourrait être, en vérité, une ouverture ?",
  },
  obara: {
    intro: [
      "Ọ̀bàrà Méjì est le dernier devenu premier. Il parle de la parole, de la royauté, de la prospérité qui vient tard et de l'humilité. C'est l'Odu de celui qu'on a méprisé et que la fortune vient chercher.",
      "Ọ̀bàrà met en garde contre la vantardise et les promesses qu'on ne tiendra pas : la parole peut bâtir une maison ou la détruire. Il annonce souvent une réussite, à condition de rester humble et de partager. Celui qui méprise les petits se prive de ce qu'ils portent.",
    ],
    story: { kind: 'itan', title: 'La citrouille du fils méprisé', text: "Dans une version transmise par la tradition, un roi invita tous ses enfants et leur offrit à chacun un présent. Les aînés reçurent de beaux objets ; le plus pauvre, Ọ̀bàrà, ne reçut qu'une citrouille, et les autres se moquèrent de lui. Il la rapporta chez lui, la partagea pour nourrir sa famille, et découvrit qu'elle était remplie de richesses. Celui qu'on avait méprisé devint le plus riche, et c'est chez lui que les autres vinrent ensuite demander à manger." },
    teaches: [
      "Celui qu'on méprise aujourd'hui peut être roi demain.",
      "La parole construit ou détruit : choisis-la.",
      "L'humilité attire la richesse ; l'orgueil la chasse.",
      "Ce qui est partagé se multiplie.",
    ],
    asks: ["Peser chaque parole avant de la dire.", "Partager une part de ce que l'on reçoit.", "Rester humble dans la réussite.", "Honorer Ṣàngó."],
    warns: ["Les promesses non tenues.", "La vantardise.", "Le mépris envers les petites gens."],
    word: "La calebasse qu'on a laissée au fond de la case contenait l'or.",
    question: "Quel cadeau as-tu méprisé parce qu'il ne brillait pas ?",
  },
  okanran: {
    intro: [
      "Ọ̀kànràn Méjì est le cœur qui parle trop vite. Il parle de vérité, de conflits nés de la parole, de justice et de nouveaux départs. C'est l'Odu de la franchise, et du prix qu'elle coûte quand elle n'est pas maîtrisée.",
      "Ọ̀kànràn demande de garder son cœur comme on garde une maison. Il met en garde contre la colère et les querelles des autres, et promet que la justice finit par se manifester pour celui qui ne se fait pas justice lui-même. Il demande aussi de concentrer ses forces : un changement dispersé n'aboutit à rien.",
    ],
    story: { kind: 'parabole', title: 'Les deux voisins', text: "Deux voisins se disputaient une bande de terre. L'un, sûr de son droit, insultait l'autre chaque matin devant tout le village. L'autre se taisait et alla voir les anciens avec ses témoins. Quand le jugement fut rendu, la terre lui revint ; mais personne n'oublia les insultes du premier, qui perdit ce jour-là bien plus qu'une bande de terre : le respect de son village." },
    teaches: [
      "Une vérité dite avec colère blesse plus qu'elle ne guérit.",
      "Le cœur doit être gardé comme une maison.",
      "La justice finit toujours par se manifester.",
      "Un changement réussit quand il vise un seul but.",
    ],
    asks: ["Maîtriser ses colères.", "Dire la vérité avec mesure.", "Confier sa cause à la justice plutôt qu'à la vengeance.", "Concentrer ses forces sur un objectif."],
    warns: ["La violence des paroles.", "Se mêler des querelles des autres.", "Décider sous le coup de l'émotion."],
    word: "Le cœur qui s'emporte brûle d'abord sa propre maison.",
    question: "Quelle colère pourrais-tu remettre entre les mains de la justice plutôt que dans les tiennes ?",
  },
  ogunda: {
    intro: [
      "Ògúndá Méjì est la lame qui ouvre la route. Il est l'Odu d'Ògún, maître du fer : il parle de travail, de détermination, de courage face aux obstacles et des séparations nettes qui permettent d'avancer.",
      "Ògúndá enseigne que la réussite vient de l'effort et de la responsabilité. Il demande de cesser d'accuser les autres pour ce qui ne va pas, et de prendre sa machette : défricher soi-même le chemin. Il met aussi en garde contre la violence, les accidents et les ruptures faites dans la colère.",
    ],
    story: { kind: 'itan', title: 'Ògún ouvre la forêt', text: "Quand les divinités voulurent descendre sur la terre, une forêt impénétrable leur barrait la route. Aucune n'y parvint. Ògún prit sa machette de fer et ouvrit le chemin pour toutes. Elles voulurent le faire roi. Mais un jour, rentrant à Ìrè et trouvant ses sujets silencieux, il crut à une offense et frappa dans sa colère. Quand il comprit qu'ils observaient un jour de silence rituel, il planta sa machette dans le sol et disparut dans la terre. Ògúndá porte les deux leçons : la force qui ouvre, et la colère qui fait regretter." },
    teaches: [
      "Le travail ouvre les routes que la chance ne trouve pas.",
      "Accuser les autres n'a jamais défriché un champ.",
      "Certaines séparations sont nécessaires pour avancer.",
      "La colère fait regretter ce que la force a fait.",
    ],
    asks: ["Travailler avec constance.", "Prendre la responsabilité de ses problèmes.", "Trancher quand une situation doit finir.", "Honorer Ògún."],
    warns: ["La violence et les armes.", "La prudence oubliée sur la route et avec les outils.", "Les ruptures faites dans la colère."],
    word: "La machette qui reste dans sa gaine ne défriche aucun champ.",
    question: "Quel chemin attends-tu que quelqu'un d'autre ouvre pour toi ?",
  },
  osa: {
    intro: [
      "Ọ̀sá Méjì est le vent qui déplace. Il parle de changements brusques, de départs, de voyages, et des forces puissantes des Mères (Ìyàmí) qu'il faut respecter. Il est lié à Ọya, maîtresse du vent et de la tempête.",
      "Ọ̀sá enseigne que tout ne se contrôle pas. Certaines forces, invisibles, protègent ou détruisent selon le respect qu'on leur porte. Il demande d'honorer les mères et les femmes âgées, de se protéger avant de partir, et d'accepter le changement au lieu de lui résister.",
    ],
    story: { kind: 'itan', title: 'Le pacte des hommes et des oiseaux', text: "Un récit d'Ọ̀sá raconte que les humains et les oiseaux descendirent ensemble du ciel et jurèrent de ne jamais se nuire. Un jour de famine, les humains rompirent le pacte et mangèrent des oiseaux. La gardienne des oiseaux se plaignit à Olódùmarè, qui donna aux Mères (Ìyàmí) le pouvoir d'agir dans la vie des hommes. Depuis, dit Ifá, il faut obtenir leur faveur par le respect et le sacrifice." },
    teaches: [
      "Le vent qui arrache sème aussi plus loin.",
      "Respecte les forces que tu ne comprends pas.",
      "Une promesse rompue a toujours un prix.",
      "Les départs font partie du chemin.",
    ],
    asks: ["Respecter les mères et les femmes âgées.", "Se protéger avant un voyage.", "Honorer Ọya.", "Garder des racines même en partant."],
    warns: ["Partir sur un coup de tête.", "Offenser les femmes âgées.", "Rompre un pacte ou un serment."],
    word: "Le vent ne demande pas la permission pour passer.",
    question: "Quel changement résistes-tu à accepter, alors qu'il est déjà là ?",
  },
  ika: {
    intro: [
      "Ìká Méjì est la main qui retient. Il parle de contrôle, de prudence, de maîtrise de soi et du pouvoir de la parole gardée. Il enseigne aussi à se détourner du mal : en pensée, en parole et en acte.",
      "Ìká rappelle que le mal ne paie pas. Celui qui le fait est rattrapé par ses conséquences, et celui qui garde une pensée et une parole droites reçoit la bénédiction. Il demande la mesure en toute chose, la discrétion et la méfiance envers la flatterie.",
    ],
    story: { kind: 'parabole', title: 'Le serpent et le bavard', text: "Un serpent et un perroquet vivaient dans le même arbre. Le perroquet racontait à tous les passants ce qu'il voyait dans la forêt : où étaient les nids, où dormaient les animaux. Le serpent se taisait. Un jour, des chasseurs, guidés par les cris du perroquet, trouvèrent l'arbre ; ils prirent le perroquet et ne virent même pas le serpent, immobile dans les feuilles. Le silence l'avait gardé." },
    teaches: [
      "La parole gardée est une force.",
      "Le mal se retourne contre celui qui le fait.",
      "La prudence n'est pas la peur.",
      "Ce que tu maîtrises en toi, personne ne peut le maîtriser.",
    ],
    asks: ["Réfléchir avant de parler.", "Garder ses projets secrets jusqu'à leur réussite.", "Choisir ses amis avec soin.", "Se détourner des pensées mauvaises."],
    warns: ["Utiliser son pouvoir pour dominer.", "La flatterie, reçue ou donnée.", "Les paroles méchantes."],
    word: "Le serpent qui se tait vit longtemps.",
    question: "Quelle parole devrais-tu garder pour toi cette semaine ?",
  },
  oturupon: {
    intro: [
      "Òtúúrúpọ̀n Méjì est le corps et la terre. Il parle de santé, de guérison, d'enfantement, et de ce que le corps exprime. Il est aussi lié aux ancêtres (Egúngún) qui viennent régler les conflits dans les familles.",
      "Òtúúrúpọ̀n demande d'écouter le corps avant qu'il ne crie, et de respecter la terre qui nourrit. Il met en garde contre le manque de courage : la peur qui empêche d'agir coûte souvent plus cher que l'action elle-même. Il n'éloigne jamais du médecin : il pousse à prendre soin.",
    ],
    story: { kind: 'parabole', title: 'Le champ abandonné', text: "Un cultivateur, effrayé par une mauvaise saison, laissa son champ en friche et attendit des jours meilleurs. Son voisin, aussi inquiet que lui, sema malgré tout. La pluie vint tard, mais elle vint. À la récolte, le voisin avait de quoi nourrir sa famille ; le premier n'avait que des herbes. La terre donne à celui qui ose lui confier sa semence." },
    teaches: [
      "Le corps parle : écoute-le avant qu'il ne crie.",
      "La terre nourrit celui qui la respecte.",
      "La peur qui empêche d'agir coûte plus cher que l'action.",
      "La guérison demande du temps et des soins réguliers.",
    ],
    asks: ["Consulter un médecin régulièrement.", "Avoir un rythme de vie sain.", "Honorer la terre et les ancêtres.", "Aider ceux qui souffrent."],
    warns: ["Négliger les signaux du corps.", "Les excès qui usent.", "Laisser la peur décider à sa place."],
    word: "La terre porte tout le monde, mais elle n'oublie pas qui la piétine.",
    question: "Qu'est-ce que ton corps essaie de te dire depuis longtemps ?",
  },
  otura: {
    intro: [
      "Òtúrá Méjì est la paix et la vision. Il parle d'élévation spirituelle, d'harmonie, d'amour et d'une parole sacrée qui guide. Dans plusieurs lignées, il est aussi l'Odu qui reconnaît la valeur des autres traditions religieuses.",
      "Òtúrá demande de s'examiner, l'esprit, le cœur et l'âme, pour trouver la sagesse dont on a besoin. Il annonce souvent une vocation spirituelle, ou le besoin de retrouver une paix perdue. Avec Ọ̀ṣẹ́, il forme le signe qui porte les sacrifices vers les divinités.",
    ],
    story: { kind: 'parabole', title: 'Les deux prières', text: "Deux hommes priaient dans le même village, l'un à la mosquée, l'autre devant l'autel de son père. Chaque soir, ils se disputaient pour savoir qui avait la vraie prière. Une année, la sécheresse frappa. Le plus vieux du village leur dit : « Priez chacun à votre manière, mais pour la même pluie. » Ils le firent. La pluie tomba, et personne ne sut jamais quelle prière l'avait appelée." },
    teaches: [
      "La paix se construit d'abord en soi.",
      "Toutes les voies sincères vers le divin méritent le respect.",
      "L'harmonie vaut plus que la victoire.",
      "Une parole sacrée bien suivie guide toute une vie.",
    ],
    asks: ["Prier ou méditer chaque jour.", "Respecter toutes les croyances.", "Être un artisan de paix.", "Porter du blanc dans les moments importants."],
    warns: ["Les disputes religieuses.", "Fuir les conflits au lieu de les apaiser.", "Abandonner sa vie spirituelle."],
    word: "Celui qui prie en paix est entendu de loin.",
    question: "Avec qui pourrais-tu faire la paix sans avoir besoin d'avoir raison ?",
  },
  irete: {
    intro: [
      "Ìrẹtẹ̀ Méjì est la pression qui finit par vaincre. Il parle de ténacité, de persévérance et de longévité. Ọ̀rúnmìlà y parle de l'initiation qui peut assurer une longue vie, la santé et la prospérité, et de l'accomplissement par le rite et le sacrifice.",
      "Ìrẹtẹ̀ enseigne que les grandes victoires se gagnent dans la durée. Il demande de ne pas abandonner à mi-chemin, de respecter la terre et de tenir ses engagements. Il met en garde contre l'entêtement : persévérer dans le juste n'est pas s'obstiner dans l'erreur.",
    ],
    story: { kind: 'parabole', title: 'La goutte et le rocher', text: "Une goutte d'eau tombait chaque jour sur un grand rocher. Le rocher se moquait d'elle : « Tu crois me faire quoi, toi si petite ? » La goutte ne répondait pas et tombait encore. Des années plus tard, un enfant trouva dans le rocher un creux parfait, rempli d'eau claire, où les oiseaux venaient boire. Le rocher n'avait jamais vu le travail se faire ; il n'en voyait que le résultat." },
    teaches: [
      "La patience vient à bout de la pierre.",
      "Ce qui dure se construit lentement.",
      "Persévérer dans le juste n'est pas s'obstiner dans l'erreur.",
      "La longévité se prépare comme une récolte.",
    ],
    asks: ["Persévérer dans ses projets.", "Prendre soin de sa santé sur la durée.", "Honorer la terre.", "Tenir ses engagements spirituels."],
    warns: ["L'entêtement quand on a tort.", "Abandonner à mi-chemin.", "Les conflits autour des terres et des héritages."],
    word: "La goutte qui tombe chaque jour creuse le rocher.",
    question: "Quel effort quotidien, même minuscule, pourrait changer ta vie dans dix ans ?",
  },
  ose: {
    intro: [
      "Ọ̀ṣẹ́ Méjì est la douceur qui triomphe. Il parle d'abondance, d'amour, de beauté, de fécondité et de victoire sur l'adversité. Il est cher à Ọ̀ṣun, et la tradition dit que c'est par lui que l'argent est descendu du ciel vers la terre.",
      "Ọ̀ṣẹ́ promet souvent un retournement heureux : un mariage, un enfant, une prospérité, après un sacrifice et une patience. Il demande de vaincre par la douceur plutôt que par la force, de partager l'abondance et de se protéger de la jalousie qu'elle suscite.",
    ],
    story: { kind: 'itan', title: 'La femme qui attendait', text: "Un verset d'Ọ̀ṣẹ́ parle d'une femme qui désirait depuis longtemps un enfant sans en avoir. Elle vint consulter. Ifá lui demanda un sacrifice et de la patience, et lui annonça qu'elle trouverait un époux, qu'elle aurait des enfants et que ses biens grandiraient. Elle fit ce qui était demandé, et tout arriva. Ọ̀ṣẹ́ rappelle que ce qui tarde n'est pas refusé." },
    teaches: [
      "La douceur vient à bout de la dureté.",
      "L'abondance se partage ou elle se tarit.",
      "Ce qui tarde n'est pas refusé.",
      "L'ennemi est vaincu par la patience, pas par la vengeance.",
    ],
    asks: ["Honorer Ọ̀ṣun et les eaux douces.", "Partager ce que l'on reçoit.", "Prendre soin de soi et de sa beauté.", "Se protéger de la jalousie."],
    warns: ["Afficher sa richesse.", "La vengeance.", "Les promesses faites aux divinités et oubliées."],
    word: "La rivière contourne le rocher, et c'est elle qui arrive à la mer.",
    question: "Où pourrais-tu gagner par la douceur ce que tu n'as pas obtenu par la force ?",
  },
  ofun: {
    intro: [
      "Òfún Méjì est le blanc originel, le kaolin dont le monde a été fait. Il parle de pureté, de souffle créateur et de régénération profonde. Il est lié à Ọbàtálá et à Odù, la mère des Odu, et certains le disent l'aîné des seize.",
      "Òfún enseigne qu'on peut toujours renaître, à condition de purifier son cœur et de rendre ce que l'on doit. Il met en garde contre l'orgueil de l'aîné qui refuse d'aider, et rappelle que la prière disciplinée aligne la personne sur sa destinée.",
    ],
    story: { kind: 'itan', title: 'L’aîné arrivé le dernier', text: "Selon une tradition, Òfún, l'aîné des Odu, conduisait ses frères vers Ifẹ̀. En chemin, le fils d'un roi de la forêt lui demanda de l'aide ; Òfún refusa, pressé d'arriver. Ogbè, lui, s'arrêta, aida, et reçut un raccourci : il arriva le premier et fut couronné. Òfún arriva le dernier, dut saluer le plus jeune, et se retira dans la forêt. Depuis, dit-on, on salue Òfún d'un cri particulier quand il apparaît, en mémoire de cette leçon." },
    teaches: [
      "La pureté du cœur est la première protection.",
      "Ce qui s'épuise peut être régénéré.",
      "Le rang ne protège pas celui qui refuse d'aider.",
      "Rends ce que tu as reçu.",
    ],
    asks: ["Garder une parole pure.", "Se reposer et se régénérer.", "Honorer Ọbàtálá.", "Prier avec discipline."],
    warns: ["L'orgueil de l'aîné.", "L'épuisement à force de donner sans recevoir.", "Garder pour soi ce qui doit être rendu."],
    word: "Le kaolin ne se salit pas : c'est la main qui le salit.",
    question: "Qu'as-tu reçu que tu n'as pas encore rendu ?",
  },
};

const list = (a: string[]) => a.map((x) => `- ${x}`).join('\n');
const storyLabel = (k: 'itan' | 'parabole') => (k === 'itan' ? "Un récit d'Ifá" : 'Une parabole');

/** Enseignement complet d'un Méjì (Markdown). */
export function mejiTeachingMarkdown(ascii: string, name: string): string {
  const t = MEJI_TEACHING[ascii];
  return [
    '## La parole de l\'Odu', '', ...t.intro.flatMap((p) => [p, '']),
    `## ${storyLabel(t.story.kind)} : ${t.story.title}`, '', t.story.text, '',
    `## Ce qu'enseigne ${name}`, '', list(t.teaches), '',
    '## Ce qu\'il demande', '', list(t.asks), '',
    '## Ce dont il met en garde', '', list(t.warns), '',
    `> ${t.word}`, '',
    '## Pour toi aujourd\'hui', '', `*${t.question}*`,
  ].join('\n');
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Enseignement propre d'un Ọmọ Odù, né de la rencontre de ses deux jambes (Markdown). */
export function omoTeachingMarkdown(o: Odu): string {
  const R = MEJI_TEACHING[o.right.ascii];
  const L = MEJI_TEACHING[o.left.ascii];
  const rn = o.right.name;
  const ln = o.left.name;
  return [
    `## ${o.name} : la rencontre de ${rn} et de ${ln}`, '',
    `${o.name} naît de deux Méjì. ${rn}, à droite, gouverne et donne la direction ; ${ln}, à gauche, nuance et précise. Pour comprendre ce qu'il dit, on écoute d'abord ${rn}, puis on regarde comment ${ln} colore son message.`, '',
    `${o.right.essence}`, '',
    `${o.left.essence}`, '',
    `## Ce que ${rn} lui donne`, '', list(R.teaches.slice(0, 3)), '',
    `## Ce que ${ln} y ajoute`, '', list(L.teaches.slice(0, 2)), '',
    `## Ce que demande ${o.name}`, '', list([R.asks[0], R.asks[1], L.asks[0]]), '',
    '## Ce dont il met en garde', '', list([R.warns[0], L.warns[0]]), '',
    `## ${storyLabel(R.story.kind)} de ${rn} : ${R.story.title}`, '', R.story.text, '',
    `Dans ${o.name}, ce récit se lit avec la voix de ${ln} : ${lowerFirst(L.teaches[0])}`, '',
    `> ${R.word}`, '',
    '## Pour toi aujourd\'hui', '', `*${R.question}*`, '', `*Et, avec ${ln} : ${lowerFirst(L.question)}*`,
  ].join('\n');
}
