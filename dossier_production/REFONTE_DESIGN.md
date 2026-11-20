# Refonte du rendu d'Ifaôladé : plan pas à pas

Version du 2026-11-19. Ce document complète `PLAN_APP_IFA.md`. Chaque étape dit **quoi**, **où** dans le code, et **quand elle est terminée**. Rien n'est laissé à l'improvisation.

---

## 0. Ce que l'analyse a montré (état avant refonte)

| Zone | Constat | Gravité |
|---|---|---|
| En-tête vitrine | 6 liens texte, sans icône, sans sous-menu. Aucune mise en avant de la consultation offerte. | Haute |
| Menu mobile | Liste de liens séparés par un trait. Pas d'icône, pas de groupe, pas de réseaux sociaux. | Haute |
| Pied de page | 3 colonnes de texte. Aucun réseau social, aucun contact direct. | Moyenne |
| Logo | Glyphe Ogbè + nom en Inter : correct mais générique, ne dit ni « luxe » ni « tradition ». | Haute |
| Accueil | Le visiteur ne comprend pas en 3 secondes : « je peux connaître l'origine de mes problèmes, avec un vrai babaláwo, et la première consultation est offerte ». | Haute |
| Images | 14 cadres « Photo à fournir », aucun modifiable dans l'admin. | Haute |
| Avatar | Initiales seulement, pas de photo possible. | Moyenne |
| Admin et espace client | Fonctionnels mais visuellement sobres ; en-têtes sans icône ni avatar. | Moyenne |
| Données Odu | Lecture élémentaire marquée « à valider », messages « bientôt », textes d'accueil : codés en dur, non modifiables. | Haute |
| Polices | Inter sans le sous-ensemble `vietnamese`, qui contient les voyelles yoruba à point souscrit (ọ, ẹ) et les accents combinés : rendu de secours possible sur « Ọ̀yẹ̀kú ». | Haute |

---

## 1. Direction artistique (fixe, à respecter partout)

### 1.1 Principe
**La beauté de la tradition, pas l'esthétique d'une IA.** Trois matières réelles du culte d'Ifá et du Bénin servent de langage visuel :

| Matière | Rôle | Valeur |
|---|---|---|
| **Kaolin (ẹfun)** | fond, clarté | `#FAF8F4` |
| **Indigo adire** (tissu yoruba teint à l'indigo) | couleur principale, bandes sombres | `#1F2A44`, nuit `#141B2E` |
| **Osùn** (poudre rouge de bois de camwood) | accent rare : un point, un trait, une pastille | `#9E3B26` |
| **Ìyẹ̀rọ̀sùn** (poudre de l'ọpọ́n, ton sable) | fonds secondaires, cartes | `#EFE7D8` |

Interdits (déjà dans la charte de design) : **aucun doré, aucun dégradé, aucune lueur décorative, aucune forme floue (« blob »), aucune illustration générée par IA, aucune représentation de divinité.**

### 1.2 Motifs
- **Adire** : motifs géométriques dessinés en SVG à la main (carreaux, points, lignes en zigzag de l'adire eleko), à 4–8 % d'opacité, uniquement sur les bandes indigo et le pied de page. Fichier : `components/brand/patterns.tsx`.
- **Bord d'ọpọ́n** : couronne crantée de 16 encoches (une par Méjì) qui encadre le logo, l'avatar du prêtre et les grands chiffres. Fichier : `components/brand/opon-ring.tsx`.
- **Marques d'Odu** (I et II) : utilisées comme séparateurs et puces.

### 1.3 Typographie
| Usage | Police | Raison |
|---|---|---|
| Titres, logo, grands chiffres | **Cormorant Garamond** (500, 600) | Garalde classique, élégante, sous-ensembles `latin-ext` + `vietnamese` (ọ, ẹ, ṣ, accents combinés) |
| Texte, interface | **Inter** (variable) | Lisibilité, ajout du sous-ensemble `vietnamese` |

Échelle : `text-hero` passe en Cormorant (56 / 88 px), `text-section` (40 / 64 px), `text-card-title` (24 / 28 px). Le reste ne change pas.

### 1.4 Icônes
- Interface : **lucide-react**, trait 1,5, taille 18–20, toujours dans une **pastille** (cercle ou carré arrondi, fond `primary-soft`) dans les menus.
- Réseaux sociaux : SVG officiels des marques (formes publiques Simple Icons, licence CC0), dessinés en ligne, dans des pastilles rondes qui s'inversent au survol. Fichier : `components/brand/social-icons.tsx`.

**Terminé quand** : les tokens sont dans `globals.css`, les deux polices chargées avec les bons sous-ensembles, « Ọ̀yẹ̀kú Ọ̀ṣẹ́ Ìwòrì » s'affiche sans police de secours.

---

## 2. Logo Ifaôladé (étape R1)

Fichier : `components/brand/logo.tsx` (SVG pur, aucune image).

1. **Le sceau** : un cercle en couronne d'ọpọ́n à 16 encoches ; au centre, les deux jambes d'**Ogbè Méjì** (4 + 4 marques simples : la lumière, le premier Odu), tracées en indigo ; un point **osùn** au sommet, à la place du « visage » de l'ọpọ́n (aucune représentation de divinité).
2. **Le nom** : « Ifaôladé » en Cormorant Garamond 600, interlettrage +1 %.
3. **La signature** : « IFÁ · Ọ̀RÚNMÌLÀ » en Inter 500, 9 px, capitales espacées, sous le nom.
4. **Variantes** : `full` (sceau + nom + signature), `compact` (sceau + nom), `seal` (sceau seul : favicon, icône d'application, avatar par défaut du prêtre), `inverse` (kaolin sur indigo).
5. L'icône de l'application (`icon.tsx`, `apple-icon.tsx`) reprend le sceau.

**Terminé quand** : le logo remplace `BrandMark` partout (vitrine, drawer, pied de page, admin, espace client, emails restent en texte) et le favicon est le sceau.

---

## 3. En-tête de la vitrine (étape R2)

Fichier : `components/site/header.tsx` (réécrit) + `components/site/nav-links.ts` (structure).

### 3.1 Barre de service (au-dessus, 36 px, indigo nuit, masquée sous 640 px)
- À gauche : pastille osùn « Première consultation offerte » → `/consultations/reserver?offre=FIRST_FREE`.
- À droite : WhatsApp et email (depuis l'admin, §8.3), sélecteur de langue.

### 3.2 Barre principale (72 px, kaolin, devient translucide et réduite à 60 px au défilement)
- Logo `compact`.
- **5 menus déroulants (« méga-menus »)**, chacun avec icône, titre et une ligne de description par lien, plus une **carte mise en avant** à droite (image modifiable dans l'admin) :

| Menu | Liens (icône) | Carte mise en avant |
|---|---|---|
| **Consulter** | Consultation offerte (Gift) · Consultation en visio (Video) · Accompagnement complet (HandHeart) · Comment ça marche (ListChecks) · La charte (ShieldCheck) | « Ta première consultation est offerte » |
| **Connais-toi** | Mon portrait gratuit (Sparkles) · Astrologie et ciel du jour (MoonStar) | Extrait de portrait |
| **Les Odu** | Les 256 Odu (Grid3x3) · J'ai déjà mon Odu (Hand) · Les 16 Méjì (CircleDot) | Glyphe de l'Odu du jour |
| **Bénin** | Initiation en forêt sacrée (Trees) · Circuits découverte (Map) · Événements et Vodun Days (Ticket) | Prochain événement |
| **La maison** | À propos (Landmark) · Enseignements (BookOpen) · Questions fréquentes (HelpCircle) · Contact (Mail) | Le prêtre (photo + nom) |

- Ouverture au survol (délai 120 ms) **et** au clic, fermeture à Échap et au clic extérieur, navigation clavier (flèches), `aria-expanded`, panneau animé (opacité + 8 px, 180 ms).
- À droite : bouton principal **« Consultation offerte »** ; si connecté, **avatar rond** (photo ou initiales) avec menu (Mon espace, Mes consultations, Profil, Déconnexion) ; sinon « Connexion ».

**Terminé quand** : les 5 menus s'ouvrent à la souris et au clavier, l'avatar affiche la photo, le rendu tient de 1024 à 1920 px.

---

## 4. Menu mobile (drawer) (étape R3)

Fichier : `components/site/mobile-menu.tsx`.

1. Plein écran sur téléphone, panneau de 420 px sur tablette, glisse depuis la droite (ressort, 280 ms), fond kaolin, motif adire discret en tête.
2. **En-tête** : logo `compact`, bouton fermer ; si connecté, carte avec avatar, prénom, « Mon espace ».
3. **Deux actions en tuiles** : « Consultation offerte » (indigo) et « Mon portrait » (sable).
4. **Les 5 groupes en accordéon** : pastille d'icône, titre, chevron ; les liens du groupe avec icône et description.
5. **Langues** : trois pastilles FR / EN / YO.
6. **Pied du drawer** : réseaux sociaux (pastilles rondes), contact WhatsApp, liens légaux, « © Ifaôladé ».
7. Fermeture : bouton, Échap, glissement vers la droite, changement de page. Le défilement de la page est bloqué tant qu'il est ouvert.

**Terminé quand** : utilisable à une main sur 360 px, aucun débordement horizontal.

---

## 5. Pied de page (étape R4)

Fichier : `components/site/footer.tsx`.

1. **Bande d'appel** indigo avec motif adire : « Ta première consultation est offerte » + bouton.
2. **Corps** : logo `full` + phrase de la maison + **réseaux sociaux** + contacts (WhatsApp, email, Bénin) ; 4 colonnes de liens **avec icônes** (Consulter, Connais-toi et Odu, Bénin, La maison).
3. **Bas** : langues, mentions légales, « Aucune promesse de résultat garanti. Aucune vente par la peur. »

---

## 6. Accueil qui « se vend » dès le premier regard (étape R5)

Fichier : `app/(site)/[lang]/page.tsx`. Ordre des sections :

1. **Héros indigo, plein écran** (motif adire) :
   - surtitre : « Babaláwo initié · Bénin » ;
   - titre (Cormorant) : **« Découvre l'origine de ce qui te bloque. »** ;
   - texte : « Un vrai babaláwo consulte Ifá pour toi, t'explique ton Odu par écrit et t'accompagne jusqu'au résultat. **Ta première consultation est offerte.** » ;
   - boutons : **« Réserver ma consultation offerte »** (osùn) · « Faire mon portrait en 4 min » (contour kaolin) ;
   - 4 garanties avec icônes : Prêtre initié · Prix affichés · Ebo détaillé et prouvé · Suivi jusqu'à J+90 ;
   - à droite : photo du prêtre (image modifiable) dans un cadre arrondi, carte flottante « Consultation offerte · 20 min · en visio ou par écrit », glyphe d'Odu animé.
2. **Bandeau de réassurance** : chiffres réels seulement, lus dans la base (consultations réalisées, suivis) et masqués tant qu'ils sont à zéro. **Aucun chiffre inventé.**
3. **« Ce que tu vis »** : 6 tuiles avec icône (blocages qui se répètent, papiers, amour, argent, famille, protection) → chacune mène à la réservation avec le domaine présélectionné.
4. **La consultation offerte en 3 étapes** (icônes, numéros en Cormorant) : tu poses ta question → le babaláwo consulte Ifá → tu reçois ton Odu expliqué par écrit.
5. **Le babaláwo** : fiche(s) gérées dans l'admin (§8.2) : photo, nom, titre, lignée, années d'initiation, langues. **N'affiche que ce que tu as saisi** : pas de « équipe » si tu es seul.
6. **Connais-toi** (portrait), **J'ai déjà mon Odu** (aperçu de la carte de 8 cercles), **les 16 Méjì**, **Bénin**, **événement**, **enseignements**, **FAQ**, **appel final**.

Les textes des sections 1, 3 et 4 sont modifiables dans l'admin, par langue (§8.4).

**Terminé quand** : un visiteur qui voit l'écran d'accueil sans défiler lit « origine », « vrai babaláwo » et « offerte », et peut réserver en un clic.

---

## 7. Avatar utilisateur (étape R6)

1. Base : `User.avatarUrl String?`.
2. API :
   - `GET me/avatar/signature` : signature Cloudinary, dossier `ifaolade/avatars`, formats jpg/png/webp, transformation imposée `c_fill,g_face,w_400,h_400`.
   - `PUT me/avatar` `{ url }` : refusée si l'URL n'est pas sur `res.cloudinary.com/<ton cloud>/…/ifaolade/avatars/`.
   - `DELETE me/avatar`.
3. Web : composant `UserAvatar` (cercle, anneau kaolin + liseré indigo, initiales en Cormorant si pas de photo, tailles 28 à 96).
4. Profil : zone « Ma photo » (choisir, recadrage carré automatique par Cloudinary, retirer).
5. Partout : en-tête vitrine, espace client, admin, liste et fiche client admin.

---

## 8. Tout ce qui se voit est modifiable dans l'admin (étape R7)

### 8.1 Images du site
Table `SiteImage { key, url, alt, credit, updatedAt }`. Une page **Admin › Apparence › Images** liste chaque emplacement avec son aperçu, son usage, le format attendu, un bouton « Remplacer » (Cloudinary) et le champ « crédit ».

| Clé | Où | Format |
|---|---|---|
| `home.hero` | Héros de l'accueil (le prêtre) | 4:5 |
| `home.benin.1`, `home.benin.2` | Accueil, section Bénin | 3:4 |
| `menu.consulter`, `menu.connais`, `menu.odu`, `menu.benin`, `menu.maison` | Cartes des méga-menus | 4:3 |
| `about.main`, `about.opon`, `about.temple` | À propos | 4:5, 1:1 |
| `initiation.1` à `initiation.3` | Initiation | 3:4 |
| `circuits.<programme>` | Circuits (ou couverture du programme) | 4:3 |
| `og.default` | Image de partage sur les réseaux | 1200×630 |

Le composant `Photo` lit d'abord l'image de l'admin, puis l'image de départ (§9), sinon le cadre « Photo à fournir ».

### 8.2 Le(s) babaláwo
Table `Practitioner { id, name, title, lineage, initiatedYear, languages, bio, photoUrl, order, active }`. Admin › Apparence › Babaláwo.

### 8.3 Réseaux sociaux et contacts
Réglages publics : `social.facebook`, `social.instagram`, `social.youtube`, `social.tiktok`, `social.x`, `contact.whatsapp`, `contact.email`, `contact.place`. Une icône n'apparaît que si son lien est renseigné.

### 8.4 Textes de la vitrine
Table `SiteText { key, locale, value }` : héros, tuiles « Ce que tu vis », 3 étapes, bandeau d'appel. Repli sur le dictionnaire si vide. Admin › Apparence › Textes, onglets FR / EN / YO.

### 8.5 Données des Odu
| Donnée | Avant | Après |
|---|---|---|
| Essence, mots-clés, enseignement (256) | modifiables | inchangé |
| Interprétations par domaine (Méjì + Ọmọ Odù) | modifiables | inchangé |
| **Lecture élémentaire** (Iná, Afẹ́fẹ́, Omi, Ilẹ̀ et le texte d'explication) | codée, « à valider » | réglages `odu.elements.text` + libellés des 3 états, modifiables ; mention « à valider » retirée |
| Messages « en cours de rédaction » / « bientôt » | codés | textes de la vitrine (§8.4) |

**Terminé quand** : aucune image, aucun lien social et aucun texte de mise en avant n'exige de toucher au code.

---

## 9. Images de départ (étape R8, avec ta validation)

1. Sources autorisées : **Unsplash** et **Pexels** (licences gratuites pour usage commercial, sans attribution obligatoire ; on garde quand même le crédit dans `SiteImage.credit`).
2. Sujets **seulement** : forêt tropicale, Ouidah et la Porte du Non-Retour, marchés du Bénin, cauris, tissu indigo, poterie, lever de soleil sur la lagune.
3. **Interdit** : toute photo d'une personne présentée comme le prêtre, un babaláwo ou un client. Le portrait du prêtre ne peut être que **ta vraie photo**.
4. Procédure : je te présente la liste (sujet, lien de la page source, licence, taille) ; après ton accord, chaque image est importée dans **ton** Cloudinary (`ifaolade/site`) et rattachée à son emplacement. Rien n'est téléchargé sans ton accord.

---

## 10. Espace client premium (étape R9)

Fichier : `components/espace/client-frame.tsx`.

1. **Barre latérale** indigo nuit (motif adire en pied) : logo `inverse`, carte profil (avatar, prénom, « Membre depuis… »), menu avec pastilles d'icônes et indicateur actif osùn, bouton « Réserver » mis en avant, déconnexion.
2. **En-tête** de page : titre en Cormorant, fil d'Ariane, cloche, avatar avec menu.
3. **Mobile** : barre basse à 5 icônes (Accueil, Consultations, Réserver au centre en rond, Dossier, Menu) + drawer complet avec groupes et icônes.
4. **Accueil client** : bannière de bienvenue (prénom, prochain rendez-vous), tuiles d'actions avec icônes, dernier Odu reçu (glyphe), consultation offerte disponible ou utilisée.

---

## 11. Admin premium (étape R10)

Fichier : `components/admin/admin-shell.tsx`.

1. Barre latérale claire, groupes titrés, pastilles d'icônes, compteurs (« À traiter »), repliable en icônes seules, mémorisée.
2. En-tête : recherche Ctrl+K, cloche, avatar, lien « Voir le site ».
3. Nouveau groupe **Apparence** : Images, Babaláwo, Textes de la vitrine, Réseaux et contacts.
4. Tableau de bord : cartes d'indicateurs avec pastille d'icône, salutation, raccourcis.
5. Mobile : drawer avec les mêmes groupes et icônes.

---

## 11 bis. Vue d'analyse du portrait (étape R12, demandée le 2026-11-19)

Après la dernière question de « Connais-toi », avant le portrait :

1. Un **écran plein** recouvre toute la plateforme (en-tête et pied de page masqués), fond **kaolin lumineux** avec motif adire en filigrane : on est « hors du site », devant l'ọpọ́n.
2. Au centre, le **sceau d'ọpọ́n** dont les 16 encoches s'allument une à une ; l'**ọ̀pẹ̀lẹ̀** tombe, et les 8 marques de la signature se tracent.
3. Sous le sceau, **les vraies étapes du calcul**, cochées au fur et à mesure (rien de décoratif, chaque ligne correspond à un calcul réellement fait) :
   - position du Soleil, de la Lune et de l'Ascendant à l'heure et au lieu de naissance ;
   - équilibre des quatre éléments ;
   - lecture de tes réponses (10 dimensions) ;
   - ta phrase ;
   - signature Odu de naissance.
4. Durée **6 secondes** au minimum, même si le calcul est plus rapide ; le portrait apparaît ensuite en fondu.
5. Accessibilité : texte lu par les lecteurs d'écran (« Analyse en cours »), animation réduite si « réduire les animations » est activé.

## 11 ter. Les Odu complets, remplis par défaut (étape R13, demandée le 2026-11-20)

Chaque fiche d'Odu montre, **remplis par défaut et modifiables dans l'admin** (Admin › Odu › fiche) :

| Bloc | Contenu |
|---|---|
| **Éloge** | texte d'éloge de l'Odu (en français ; aucun vers yoruba inventé) |
| **Qui parle dans cet Odu** | Òrìṣà (tradition yoruba) et Vodun (Fá du Bénin) |
| **Leçons de vie** | 4 à 5 leçons |
| **Enseignement** | texte Markdown |
| **Selon le domaine** | les 7 domaines (textes déjà publiés pour les Méjì ; pour un Ọmọ Odù sans texte propre, ceux de ses deux Méjì, présentés comme tels) |
| **Si c'est ton signe de naissance** | ce que tu es, ce qui se dessine pour ta vie, ce que tu dois faire, ce que tu dois éviter, ce qu'il est conseillé de manger, tes interdits alimentaires (èèwọ̀), les divinités à honorer, tes couleurs |

Règles :
1. Les textes de départ des **16 Méjì** sont écrits dans `packages/core/src/odu/lore.ts`. Pour les **240 Ọmọ Odù**, ils sont composés à partir des deux Méjì : la jambe droite gouverne, la jambe gauche nuance. Chaque champ modifié dans l'admin remplace le texte de départ (colonne `OduContent.lore`). Un bouton « Revenir au texte de départ » efface la modification.
2. Le bloc « signe de naissance » apparaît sur la fiche de l'Odu **et** dans le portrait, sous la signature. Il garde la mention de la règle 4.7 (signature calculée et symbolique, qui ne remplace pas le Kpɔ̀lí) et ne promet rien (règle 4.6).
3. Mention sous les blocs traditionnels : « Texte traditionnel de départ : chaque lignée a ses nuances, ton babaláwo le précise en consultation. »
4. Les textes de départ sont en français ; en anglais et en yoruba, la mention « contenu en français » s'affiche.
5. Relecture du prêtre : `TEXTES_ODU_TRADITION.md` reprend les 16 Méjì.

**Terminé quand** : les 256 fiches affichent les 6 blocs sans aucun « en cours de rédaction », chaque champ est modifiable dans l'admin, et le portrait affiche la lecture de naissance.

## 11 quater. Fenêtre d'accueil (étape R14, demandée le 2026-11-20)

1. À la **première visite** sur la vitrine, une fenêtre transparente (fond indigo translucide flouté) monte du bas de l'écran.
2. Elle porte **trois grands boutons ronds avec icône, disposés en demi-cercle** (celui du milieu plus haut) : **Connais-toi** (`/connais-toi`), **Faire une consultation** (`/consultations/reserver?offre=FIRST_FREE`), **Les Odu** (`/odu`). Un clic mène à la page.
3. Elle se ferme avec la croix, la touche Échap ou un clic à côté. Elle ne s'affiche plus ensuite (mémorisé dans le navigateur). Elle n'apparaît pas sur les pages de connexion, d'inscription, de la console et de confirmation d'email.
4. Trois langues ; « réduire les animations » respecté ; le focus va au premier bouton.


## 11 quinquies. Parcours sans distraction (étape R16, demandée le 2026-11-20)

Objectif : la personne qui consulte est « seule dans un champ, la tête dans le guidon ». Rien ne l'invite à défiler ni à partir.

**Connais-toi** (`/connais-toi`) :
1. Plein écran au-dessus du site : **ni en-tête, ni pied de page, ni barre basse, ni fenêtre d'accueil**. La page ne défile pas.
2. En haut : le sceau Ifaôladé (petit), une **barre de progression fine**, une croix « Quitter » (retour à l'accueil, le brouillon est gardé).
3. Au centre : **une seule question à la fois**, centrée verticalement. Rien à gauche, rien à droite.
4. En bas : « Retour » et « Continuer », toujours à la même place.
5. Le portrait (`/connais-toi/portrait/…`) reste une page normale du site.

**J'ai déjà mon Odu** (`/mon-odu`) :
1. Plein écran sur fond indigo nuit, même barre du haut (progression, croix).
2. **Seulement la carte des 8 cercles au centre** ; sous la carte, le nom de l'Odu qui se forme et le bouton « Faire sortir mon Odu ». La recherche par nom s'ouvre dans un tiroir (icône loupe), elle n'est plus affichée sous la carte.
3. **Démonstration** : au premier passage, elle passe au premier plan au-dessus de la carte, comme une vidéo : une main animée touche les cercles, une légende courte change à chaque geste, en boucle. Bouton « J'ai compris » ; un bouton « ? » la rejoue.
4. Choix du domaine puis explication guidée : mêmes écrans plein cadre, une étape à la fois.

**Terminé quand** : sur téléphone et ordinateur, aucun élément du site n'est visible pendant les deux parcours et aucune page ne défile (sauf un texte d'explication trop long, qui défile dans son cadre).

## 11 sexies. Empreinte du moment (étape R15, demandée le 2026-11-20)

Dernière étape de Connais-toi, **facultative** (« Passer cette étape »).

1. Écran : un dessin d'empreinte au centre, la phrase « Pense à ce qui t'occupe en ce moment, puis pose ton doigt sur l'empreinte et garde-le 6 secondes. » Les sillons s'allument au fil des secondes.
2. **Mesures réelles** (événements tactiles, tous téléphones, sans autorisation ni caméra) :
   - **hésitation** : temps entre l'apparition de l'écran et le premier contact ;
   - **stabilité** : déplacement moyen du doigt pendant l'appui (en pixels) ;
   - **interruptions** : nombre de fois où le doigt est levé avant la fin.
3. Classement : stabilité **stable** (< 3 px), **mobile** (< 10 px), **agitée** ; approche **directe** (< 1,5 s), **réfléchie** (< 6 s), **hésitante** ; **interrompue** si au moins un lever.
4. Les trois mesures sont envoyées avec le portrait (`imprint`) et enregistrées dans `Reading.input`.
5. Portrait : section **« Ton empreinte du moment »**, visible sans compte, placée après « Ce que les autres voient de toi » : les mesures affichées, une phrase pour la stabilité, une pour l'approche, une si interrompue, et **une nuance** si la main est agitée alors que les réponses montrent une tension (dimensions contrôle, blocage, trahison, porteur). Mention toujours présente : « Mesure réelle de ton geste à cet instant : elle reflète ton état du moment, pas tes pensées. »
6. Les textes sont dans le catalogue du portrait (groupe « Empreinte du moment »), modifiables dans Admin › Textes du portrait. Anglais et yoruba fournis.
7. L'analyse de 6 secondes ajoute la ligne « Lecture de ton empreinte du moment » quand l'étape a été faite.

**Terminé quand** : l'étape fonctionne au doigt sur téléphone et à la souris sur ordinateur, les mesures apparaissent dans le portrait, et un portrait sans empreinte reste identique à avant.

## 11 septies. Corrections et bibliothèque spirituelle (étapes R17 à R22, demandées le 2026-11-20)

Décisions prises avec toi le 2026-11-20 : Afɔ̀jɛ́tɛ́ = consultation faite à la naissance ; rituels de combat = **défense et renvoi seulement** (jamais pour nuire à une personne nommée) ; rituels en public = **sens et déroulé général** (matériel et quantités réservés à l'admin et au dossier client) ; ordre = **structure d'abord, puis contenus par lots**.

### R17. Empreinte : ne rien dévoiler de la mesure
1. Le portrait ne dit jamais ce qui a été observé : ni « tu as hésité », ni « ton doigt a bougé », ni « tu as levé le doigt », ni chiffres. Il décrit seulement l'état du moment.
2. Pendant l'appui, si le doigt est levé, le message est neutre : « Pose ton doigt et garde-le jusqu'au bout. »
3. Mention : « Cette lecture reflète ton état du moment, pas tes pensées. »

### R18. Fenêtre d'accueil à 4 boutons, toutes les 5 minutes
1. Quatre boutons sur l'arc : **Connais-toi**, **Faire une consultation** (au sommet), **J'ai déjà mon Odu**, **Les Odu**.
2. Elle réapparaît **toutes les 5 minutes** de navigation sur la vitrine (onglet visible), jamais pendant Connais-toi, J'ai déjà mon Odu, la connexion, l'inscription, le paiement.

### R19. Bouton « Odu » de la barre basse mobile
Au toucher, un panneau monte du bas avec deux grandes cartes illustrées : **Voir les Odu** (bibliothèque) et **Vérifier mon Odu** (carte des 8 cercles). Animation douce, fermeture par glissement, croix ou clic à côté.

### R20. Deux choix de plus dans « Sur quoi portait ta consultation ? »
- **Mon Odu reçu dans le ventre de ma mère** · *Adɔ̀gò Fá : consultation faite pendant la grossesse*
- **Mon Odu de naissance** · *Afɔ̀jɛ́tɛ́ : consultation faite à la naissance*
Pour ces deux choix, l'explication porte sur toute la vie : ce que la personne est, son chemin, ce qu'elle doit faire et éviter, ses interdits alimentaires, les divinités à honorer, ses couleurs (bloc « signe de naissance » de R13), précédé du texte du prêtre s'il en a publié un. Les deux choix ont leur onglet dans l'éditeur admin « Odu × domaine ».

### R21. Bibliothèque spirituelle : rituels, wáàsù, divinités (modifiables et ajoutables)
Un seul modèle `LibraryEntry { kind, slug, title, subtitle, excerpt, body, privateBody, category, meta, oduIds, coverUrl, published, order }` :

| Type | Catégories | Public | Admin seulement |
|---|---|---|---|
| **Rituel** (`/rituels`) | Déblocage, Protection, Défense et renvoi, Purification, Ouverture des chemins, Prospérité | but, sens, quand le faire, Odu liés, déroulé général | matériel, quantités, étapes détaillées (`privateBody`) |
| **Wáàsù** (`/wasu`) | Le sens de la vie, Le caractère (ìwà), La destinée (orí), La famille, L'épreuve, La sagesse | texte complet | — |
| **Divinité** (`/divinites`) | Òrìṣà, Vodun, Les deux | histoire, rôle, autres noms, couleurs, jour, offrandes, interdits, symboles, Odu liés | — |

Admin › **Bibliothèque** : Rituels, Wáàsù, Divinités (liste, nouveau, modifier, brouillon / publié, supprimer). Chaque fiche d'Odu affiche les rituels, wáàsù et divinités qui lui sont liés. Menu de la vitrine : groupe « Les Odu » enrichi de ces trois entrées.

### R22. Contenus par lots (recherches)
1. **Lot 1** : les 16 Méjì en profondeur (explication avancée, textes des 9 choix).
2. **Lots 2 à 16** : les 240 Ọmọ Odù par famille de jambe droite (15 par lot), chacun avec **ses propres** textes dans les 7 domaines + Adɔ̀gò Fá + Afɔ̀jɛ́tɛ́ ; fin du message « pas encore de texte propre ».
3. **Lot 17** : divinités (Òrìṣà et Vodun principaux) avec leur histoire.
4. **Lot 18** : rituels (au moins un par catégorie et par Méjì) et wáàsù (au moins un par thème).
Chaque lot : textes importés et publiés, modifiables dans l'admin, fichier de relecture pour le prêtre dans `dossier_production/`, build, commit.

## 12. Contrôles de fin (étape R11)

1. `npm test` (core, api) et `next build` sans erreur.
2. Les 3 langues : aucune clé manquante (le typage l'impose).
3. Pages contrôlées à 360, 768, 1280 et 1920 px : accueil, consultations, Odu, mon-odu, connexion, espace client, admin.
4. Clavier : menus, drawer, avatar utilisables sans souris.
5. Contraste AA sur les bandes indigo.
6. Mise à jour de `PLAN_APP_IFA.md` §20 et commit.

---

## Ordre d'exécution

R0 tokens et polices → R1 logo → R2 en-tête → R3 drawer → R4 pied de page → R6 avatar → R7 admin « Apparence » (images, babaláwo, réseaux, textes, données Odu) → R5 accueil → R9 espace client → R10 admin → R12 vue d'analyse → R8 images (ta validation) → R11 contrôles.

---

## État au 2026-11-19

| Étape | État |
|---|---|
| R0 polices (Cormorant Garamond + Inter, sous-ensembles yoruba) et couleurs | ✅ |
| R1 logo (sceau d'ọpọ́n, 4 variantes), icône de l'application | ✅ |
| R2 en-tête : barre de service, 5 méga-menus avec icônes et cartes, avatar | ✅ |
| R3 menu mobile plein écran (accordéons, tuiles, langues, réseaux, glisser pour fermer) | ✅ |
| R4 pied de page (bande d'appel, réseaux, 4 colonnes avec icônes) | ✅ |
| R5 accueil (héros indigo, réassurance réelle, « Ce que tu vis », 3 étapes, babaláwo, J'ai déjà mon Odu) | ✅ |
| R6 avatar (photo recadrée par Cloudinary, partout) | ✅ |
| R7 admin › Apparence (images, babaláwo, textes FR/EN/YO, réseaux et contacts) + données Odu modifiables | ✅ API testée (25/25) |
| R9 espace client premium · R10 admin premium | ✅ |
| R12 vue d'analyse du portrait (6 s, plein écran) | ✅ |
| R13 Odu complets (éloge, Òrìṣà et Vodun, leçons, enseignement, 7 domaines, signe de naissance sur la fiche et dans le portrait), modifiables dans Admin › Odu › fiche | ✅ core 25/25, API 28/28, colonne `lore` poussée sur TiDB. ⏳ relecture du prêtre : `TEXTES_ODU_TRADITION.md` |
| R14 fenêtre d'accueil (demi-cercle translucide, 3 boutons : Connais-toi, Consultation, Les Odu), une seule fois | ✅ |
| R15 empreinte du moment (dernière étape facultative de Connais-toi : hésitation, stabilité, levers ; section visible sans compte dans le portrait, textes modifiables) | ✅ core 30/30, API 28/28 |
| R16 parcours sans distraction : Connais-toi et J'ai déjà mon Odu en plein écran (ni en-tête, ni pied de page, ni barre basse), une étape à la fois, démonstration au premier plan, recherche en tiroir | ✅ ⏳ contrôle sur téléphone |
| R17 empreinte : rien de la mesure n'est dévoilé | ✅ |
| R18 fenêtre d'accueil 4 boutons, toutes les 5 minutes | ✅ |
| R19 bouton Odu de la barre basse (icône Jɔ̀gbɛ̀) : Voir les Odu / Vérifier mon Odu ; « Connais-toi » avec icône empreinte | ✅ |
| R20 Adɔ̀gò Fá et Afɔ̀jɛ́tɛ́ dans les domaines | ✅ |
| R21 bibliothèque : rituels, wáàsù, divinités (admin + pages) | ✅ table poussée sur TiDB, API 30/30 |
| R22 contenus : brouillons publiés (décision du 2026-11-20) : 1 680 textes propres aux 240 Ọmọ Odù dans les 7 domaines, 12 divinités, 6 rituels, 6 wáàsù ; Adɔ̀gò Fá et Afɔ̀jɛ́tɛ́ lisent la lecture de toute la vie | ✅ publiés, ⏳ relecture du prêtre (`TEXTES_BIBLIOTHEQUE.md`, admin) ; ⏳ enseignements avancés des 256 Odu à approfondir |
| R8 images de départ : 16 emplacements remplis (11 photos Unsplash vérifiées : cauris, indigo, jarres, forêt, village lacustre, marché, Cotonou, lagune), remplaçables dans Admin › Apparence › Images, « Revenir à l’image de départ » | ✅ ⏳ à remplacer par tes vraies photos (prêtre, ọpọ́n, temple) |
| Corrections du 2026-11-19 : email à confirmer avant toute connexion (page « email envoyé », renvoi du lien, lien recliquable sans erreur), console du prêtre `/console` (redirige vers `/admin`, refuse les clients), menu de langue qui s’ouvre sur ordinateur, barre basse mobile sur toute la vitrine | ✅ API 27/27 + build |
| R11 contrôles : typage ✅ ; compilation complète interrompue (mémoire du PC insuffisante) ; contrôle visuel à faire | ⏳ |
