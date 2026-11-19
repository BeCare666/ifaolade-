# PLAN DE RÉALISATION : application Ifá (vitrine, espace client, administration)

> Document de référence unique. **Rien ne se construit hors de ce document.**
> Chaque étape précise : ce qu'on fait, le livrable attendu et quand elle est « terminée ».
> Toute idée nouvelle est d'abord ajoutée ici (section 19, « Journal des décisions »), puis construite.

Nom de la plateforme : **Ifaôladé** (choisi le 2026-11-18). Identifiant technique : `ifaolade`.

---

## Sommaire

1. Vision et promesse
2. Règles de travail (pas d'improvisation)
3. Décisions techniques figées
4. Charte éthique, traduite en règles produit
5. Références visuelles analysées (edoto et dps)
6. Design system (couleurs, typo, composants, interdits)
7. Plan du site : la vitrine
8. Plan de l'espace client
9. Plan du tableau de bord admin
10. Parcours clés, pas à pas
11. Moteurs métier (Odu, astrologie, portrait), sans IA
12. Modèle de données
13. API : liste des routes
14. Intégrations (TiDB Cloud, Brevo, Cloudinary, paiements, visio, tâches planifiées)
15. Sécurité, confidentialité et conformité (RGPD et APDP Bénin)
16. Plan de réalisation étape par étape
17. Contenus que toi seul peux fournir
18. Lancement, croissance et risques
19. Journal des décisions
20. État actuel du dossier

---

## 1. Vision et promesse

**Le problème.** La diaspora et beaucoup d'Africains vivent des difficultés (papiers, couple, argent, famille, santé, blocages répétés). Beaucoup ont été arnaqués spirituellement : vente par la peur, urgence, prix opaques, ebo jamais faits, aucun suivi. Ils ne doutent pas d'Ifá. Ils doutent de ceux qui parlent en son nom.

**La promesse.** *Le premier service d'Ifá où tout est vérifiable.*
- Prix affichés à l'avance.
- Odu nommé et expliqué par écrit.
- Ebo détaillé ligne par ligne, accepté ou refusé librement, et prouvé en vidéo.
- Plan d'action concret dans la vie réelle.
- Suivi à J+7, J+30 et J+90.
- Jamais de peur, jamais de promesse de résultat garanti.

**L'effet recherché, « elle me connaît ».** La personne remplit son identité, sa naissance et un questionnaire. La plateforme lui rend un portrait précis, construit à partir de son thème astral calculé astronomiquement, de ses propres réponses et de la symbolique d'Ifá. La précision vient du calcul réel et de la qualité des textes que tu valides, pas d'un tour de passe-passe. Tout ce qui est symbolique est présenté comme tel (voir 4.7).

**Les quatre piliers de l'offre**
1. **Connais-toi** : un portrait gratuit (astrologie, signature Odu de naissance, questionnaire).
2. **Consultations** : la 1ʳᵉ est offerte, puis visio payante ou accompagnement complet par toi.
3. **Dossier spirituel et suivi** : Odu reçus, ewọ̀ (interdits), ebo et leurs preuves, suivis.
4. **Le Bénin** : initiation à Ifá dans la forêt, circuits Vodoun et patrimoine, grand événement annuel (Vodun Days à Ouidah).

**Pas d'IA.** Aucune lecture n'est générée par une IA. Tous les textes sont écrits et validés par toi. Les calculs sont déterministes : même entrée, même résultat, toujours.

---

## 2. Règles de travail (pas d'improvisation)

1. Une étape commence seulement quand la précédente est **terminée** selon son critère (section 16).
2. Chaque écran est construit **uniquement** avec les composants de la section 6.4. Si un composant manque, on l'ajoute d'abord au design system, puis on l'utilise.
3. Aucune couleur, taille ou ombre « en dur » dans une page : uniquement les tokens de la section 6.
4. Aucun texte spirituel (Odu, ese, portrait) n'est publié sans ta validation. Tous ces textes sont éditables dans l'admin.
5. Chaque fonctionnalité passe par trois contrôles avant d'être déclarée terminée :
   - le build passe, web et API ;
   - le parcours est testé de bout en bout sur ordinateur **et** sur mobile ;
   - l'état vide, l'état de chargement et l'état d'erreur existent.
6. Toute décision nouvelle est écrite dans la section 19, datée.

---

## 3. Décisions techniques figées

| Domaine | Choix | Raison |
|---|---|---|
| Monorepo | npm workspaces : `apps/web`, `apps/api`, `packages/core` | Même organisation que dps. Le moteur métier est partagé entre le web et l'API. |
| Front | **Next.js 15** (App Router), React 19, TypeScript strict | Rendu serveur pour le SEO de la vitrine, client pour les espaces |
| Styles | **Tailwind CSS 4**, tokens dans `globals.css` (`@theme`) | Même méthode que dps : tokens, pas de valeurs en dur |
| Animations | `motion` (framer-motion) : apparition au défilement façon `Reveal` d'edoto, transitions de vues | Sobre, jamais décoratif |
| Icônes | `lucide-react`, trait 1.5 | Comme edoto |
| Graphiques admin | Recharts, couleurs prises dans les tokens | Comme dps (Phase 6) |
| Back | **NestJS 11**, validation `class-validator`, garde JWT maison | Même socle que dps |
| ORM / base | **Prisma 6 + TiDB Cloud Serverless** (MySQL, TLS `sslaccept=strict`), `relationMode = "prisma"` | Compatibilité TiDB |
| Emails | **Brevo**, API transactionnelle v3 | Demandé |
| Médias | **Cloudinary**, upload signé direct depuis le navigateur | Photos, vidéos de preuve d'ebo |
| Paiement Afrique | **FeexPay** (Mobile Money MTN/Moov, carte), déjà maîtrisé sur edoto | Bénin et Afrique de l'Ouest |
| Paiement diaspora | **Stripe Checkout** (carte, Apple/Google Pay) | Europe, Amériques |
| Visio | **Jitsi Meet** (salle unique par consultation) au départ, remplaçable par Daily.co | Gratuit, sans compte client |
| Tâches planifiées | `@nestjs/schedule` (rappels de suivi, rappels de rendez-vous) | |
| Astronomie | `astronomy-engine` (calcul précis des planètes), `luxon` (fuseaux horaires) | Thème natal exact |
| Géocodage du lieu de naissance | API Open-Meteo Geocoding (gratuite, renvoie lat/lon **et** fuseau IANA) | Indispensable pour l'ascendant |
| Langues | FR d'abord, EN en phase 6, PT/ES plus tard (Brésil, Cuba) | Diaspora francophone en priorité |
| Déploiement | Web sur **Vercel**, API sur **Render**, comme dps (`DEPLOIEMENT_RENDER_VERCEL.md`) | Déjà maîtrisé |
| Monnaies | Prix stockés en centimes d'EUR. Affichage EUR et FCFA (1 € = 655,957 FCFA, taux fixe) | Simplicité, parité fixe |

---

## 4. Charte éthique, traduite en règles produit

Chaque engagement de la charte est **appliqué par le code**, pas seulement affiché.

| # | Engagement public | Règle dans l'application |
|---|---|---|
| 4.1 | Prix fixes, publiés à l'avance | Les offres viennent de la table `ConsultationOffer` et sont affichées sur la page Consultations. Le prix est figé au moment de la réservation. |
| 4.2 | Ebo détaillé ligne par ligne | Un ebo n'est enregistrable qu'avec des lignes (libellé, quantité, prix unitaire). Le total matériel et ta rémunération s'affichent **séparément**. |
| 4.3 | Liberté totale d'accepter ou de refuser | Les boutons « Accepter » et « Refuser » ont la même importance visuelle. Aucun compte à rebours. Aucun texte de menace. |
| 4.4 | Preuve de l'ebo | Un ebo passe à « Réalisé » seulement avec une vidéo envoyée sur Cloudinary. Le client la voit dans son dossier. L'option « assister en direct » est proposée. |
| 4.5 | Suivi jusqu'au résultat | La publication d'un compte rendu crée automatiquement les suivis J+7, J+30 et J+90. |
| 4.6 | Pas de promesse de résultat | Mention présente dans les CGV, sur la page Consultations et au pied de chaque compte rendu. |
| 4.7 | Honnêteté sur le symbolique | La « signature Odu de naissance » porte toujours la mention : *calculée, symbolique, ne remplace pas ton Odu de destinée (Kpɔ̀lí), qui se révèle par la divination et l'initiation*. |
| 4.8 | Orientation vers les professionnels | Si le domaine choisi est « Santé » ou « Enfants/fertilité », la consultation et le portrait affichent un encadré « Consulte aussi un médecin ». Un encadré psychologue est aussi prévu pour les situations de détresse. |
| 4.9 | Confidentialité absolue | Données chiffrées, accès limité, aucune donnée revendue, suppression du compte possible (section 15). |
| 4.10 | Second avis autorisé | Mention explicite dans la charte. Le client peut télécharger son compte rendu en PDF. |

---

## 5. Références visuelles analysées

> **Inspiration, pas copie.** De edoto et dps, on reprend seulement le **niveau de qualité** et les **principes** d'organisation : aération, hiérarchie, barre latérale repliable, tables avancées, bloc « À traiter ». **Les couleurs, la police, la disposition des pages et les composants sont propres à l'app Ifá.**
>
> | | edoto | dps | **App Ifá** |
> |---|---|---|---|
> | Couleurs | rose `#FF6EA9`, bleu ciel, fond rosé | bleu `#1657CC`, fond bleu-gris | **kaolin `#FAF8F4`, indigo adire `#1F2A44`, osùn `#9E3B26`** |
> | Police | Poppins | Inter + Plus Jakarta Sans | **Inter seule**, titres fins et resserrés |
> | Héros | texte + cercle en orbite animé | (pas de vitrine) | **texte + ta photo réelle + Odu qui se trace** |
> | Signature visuelle | blobs, dégradés, émojis | console bleue | **marques d'Odu, roue du thème, tracés à l'encre** |
> | Espace client | menu santé SSR | — | **menu propre à Ifá** : portrait, consultations, dossier spirituel, voyages |
> | Admin | — | modules santé (EI, NEWS, grilles) | **modules propres à Ifá** : consultations, ebo, suivis, Odu, Bénin |
>
> Les sections 5.1 à 5.3 indiquent précisément quels principes sont repris.

### 5.1 edoto, page vitrine (`Desktop/edoto/edoto`)

Ce qu'on **reprend** :
- **Mise en page éditoriale aérée** : grands titres en graisse normale (pas de gras), très grands (44 px mobile, 64 px ordinateur), interlignage serré (1,02), lettres resserrées (`tracking -0.04em`). Paragraphes en 15-16 px, interlignage 1,75-1,8, couleur adoucie.
- **Palette chaude et neutre** : fond `#F9F8F6`, texte `#161412`, texte secondaire `#6B645D`, bordures `#ECE6E0`, gris discret `#A8A29B`.
- **Sections photo + texte** en 2 colonnes 6/6, photo collante (`sticky`) à gauche, cadre photo aux coins doux (`rounded-[28px]`), zoom lent au survol (1,6 s).
- **Liste de services numérotée** : `01`, `02`, `03` en petites capitales espacées, filet fin au-dessus de chaque ligne, icône dans un cercle à bordure fine qui prend la couleur d'accent au survol.
- **Apparition au défilement** (`Reveal`) : opacité 0 → 1, décalage de 24 px, 0,9 s, courbe `[0.22, 1, 0.36, 1]`, une seule fois.
- **Une seule famille de police** sur tout le site, modifiable depuis l'admin (comme `siteFont.js`).
- Section **« Installer l'application »** (PWA Android/iPhone) et section **Partenaires**.

Ce qu'on **ne reprend pas** : les blobs flous, les dégradés rose-violet, les émojis dans l'interface (🌸), le cercle en orbite animé, les badges « ✨ ». Ce sont précisément les marqueurs du rendu « ère IA » à éviter.

### 5.2 edoto, espace client (`components/dashboard-ui/DashboardFrame.jsx`)

Ce qu'on **reprend tel quel** (même logique) :
- Barre latérale blanche avec filet `#E9E5DF`, **repliable en icônes** sur ordinateur (choix mémorisé dans le navigateur) et **tiroir** sur mobile (fermeture par Échap, page figée derrière).
- En haut de la barre : logo, nom de l'espace en petites capitales (`10px, tracking 0.22em`), carte identité (avatar, nom, détail).
- En-tête : recherche, cloche de notifications, avatar.
- Transition douce à chaque changement de vue, pied de page fixe.
- Sur mobile : **barre de navigation basse** (Accueil, Consultations, Dossier, Menu).

### 5.3 dps, tableau de bord admin (`E:/archive/dps/apps/web`)

Ce qu'on **reprend** (niveau « console SaaS » type Linear, Stripe, Vercel) :
- **Coquille `AppShell`** : barre latérale fixe de 256 px, logo seul en tête, menu en **groupes repliables titrés** ; en-tête fixe translucide (`surface/85 + blur`) avec **recherche rapide Ctrl+K** ; pied de page fixe de 44 px ; seul le contenu défile.
- **Tokens sémantiques** : `bg`, `bg-subtle`, `surface`, `border`, `text`, `text-muted`, `text-faint`, `primary`, `success`, `warning`, `danger`, `info` (chacun avec sa version `-soft`), trois ombres (`card`, `soft`, `elevated`) et trois rayons.
- **Accueil admin** : en-tête de page avec date du jour, bloc **« À traiter »** (actions urgentes cliquables), indicateurs clés avec icône et contexte, graphiques sur tokens, **activité récente**.
- **Le standard de la Phase 6 de dps**, appliqué dès le départ ici :
  - toutes les pages ont un `PageHeader` (titre, description, fil d'Ariane, zone d'actions) ;
  - les tables ont des filtres en puces, la recherche, le tri, la sélection, un menu d'actions par ligne, la taille de page et **l'état stocké dans l'URL**, et deviennent des cartes sur mobile ;
  - les actions sensibles demandent toujours une confirmation (`ConfirmDialog`) et affichent un toast ;
  - les pages de détail ont un en-tête d'entité, des **onglets**, un panneau de synthèse et une chronologie ;
  - les squelettes de chargement et les états vides distinguent « aucune donnée » et « aucun résultat pour ces filtres » ;
  - les chiffres sont en `tabular-nums` ;
  - les largeurs de contenu sont homogènes : `max-w-[1400px]` partout en admin.

Les défauts relevés par l'audit de dps (absence de titres, boutons texte isolés, désactivation sans confirmation, filtres de l'API inexploités) sont **interdits d'office** ici.

---

## 6. Design system

### 6.1 Direction

**« Kaolin, indigo, osùn. »** Trois matières réelles du culte, pas de doré :
- **efun / kaolin** : le blanc crayeux des tracés sacrés, pour les fonds ;
- **indigo adire** : le bleu nuit des pagnes teints, pour les textes forts et les actions principales ;
- **osùn** : le rouge-brun du bois de camwood, en accent rare.

Le rendu est sobre, éditorial et chaleureux, proche d'un beau livre d'ethnographie, pas d'une app mystique.

### 6.2 Tokens de couleur (valeurs exactes)

| Token | Clair | Sombre (espaces client et admin uniquement, en option) | Usage |
|---|---|---|---|
| `--bg` | `#FAF8F4` | `#14130F` | fond de page vitrine |
| `--bg-subtle` | `#F3F0EA` | `#1B1A16` | fond des consoles, zones alternées |
| `--surface` | `#FFFFFF` | `#201F1A` | cartes, barres |
| `--border` | `#E8E2D8` | `#2E2C26` | filets |
| `--text` | `#17150F` | `#F2EFE8` | texte principal |
| `--text-muted` | `#6A6359` | `#B3AC9F` | texte secondaire |
| `--text-faint` | `#A39C90` | `#7F786C` | légendes, numéros |
| `--primary` (indigo) | `#1F2A44` | `#AFC0E6` | boutons principaux, liens actifs |
| `--primary-hover` | `#16203A` | `#C6D3F0` | |
| `--primary-soft` | `#E7EAF2` | `#252C3D` | fonds d'éléments actifs |
| `--accent` (osùn) | `#9E3B26` | `#E08C72` | rare : numéro actif, survol d'icône, marque d'Odu « active » |
| `--accent-soft` | `#F6E7E1` | `#3A2620` | |
| `--success` | `#2F7A4F` / soft `#E6F2EA` | | ebo réalisé, payé |
| `--warning` | `#A86A12` / soft `#F8EEDC` | | en attente |
| `--danger` | `#B23A32` / soft `#F8E6E4` | | annulé, échec |
| `--info` | `#2D6A9A` / soft `#E5EFF7` | | information |

Éléments (graphiques astrologie et Odu), en teintes terre et non saturées :
Feu `#B4533A` · Terre `#8A7350` · Air `#7D93AD` · Eau `#2F5F7E`.

Ombres :
- `--shadow-card: 0 1px 2px rgba(23,21,15,.04)`
- `--shadow-soft: 0 1px 2px rgba(23,21,15,.04), 0 8px 24px -12px rgba(31,42,68,.12)`
- `--shadow-elevated: 0 4px 8px rgba(23,21,15,.06), 0 16px 40px -12px rgba(23,21,15,.18)`

Rayons : `sm 6px` · `md 10px` · `lg 16px` · photo `28px` · bouton `999px` (pilule, comme edoto).

### 6.3 Typographie

- **Une seule famille : Inter** (via `next/font`), variable `--font`, modifiable dans Admin › Paramètres › Police (comme edoto). Graisses utilisées : 400, 500, 600 uniquement.
- Les noms yoruba avec diacritiques (Ọ̀yẹ̀kú, Ìwòrì, Ọ̀ṣẹ́) **doivent** s'afficher correctement : sous-ensembles `latin` et `latin-ext` obligatoires, contrôle visuel à l'étape 2.3.
- Échelle :

| Rôle | Mobile | Ordinateur | Réglages |
|---|---|---|---|
| Titre héros | 44 | 72 | 400, `leading-[1.02]`, `tracking-[-0.04em]` |
| Titre de section | 36 | 56 | 400, `leading-[1.05]`, `tracking-[-0.035em]` |
| Titre de carte | 22 | 26 | 400, `tracking-[-0.01em]` |
| Corps | 15 | 16 | 400, `leading-[1.8]`, `text-muted` |
| Sur-titre | 12 | 12 | 500, majuscules, `tracking-[0.2em]`, `text-faint` |
| Console : titre de page | 22 | 24 | 600 |
| Console : texte | 14 | 14 | 400 |
| Chiffres | | | `tabular-nums` partout |

### 6.4 Composants (liste fermée)

**Base** : Button (primaire indigo, secondaire bordé, fantôme, danger ; tailles sm/md/lg ; pilule en vitrine, rayon md en console), IconButton, Badge (6 tons), Card, Input, Textarea, Select, Combobox (lieu de naissance), DatePicker, TimePicker, Checkbox, Radio cards (questionnaire), Switch, Tabs, Dropdown, Modal, Drawer, ConfirmDialog, Toast, Tooltip, Skeleton, EmptyState, ErrorState, Breadcrumb, PageHeader, Pagination, Avatar à initiales, Stepper.

**Console** : AppShell (admin), ClientFrame (client, inspiré de DashboardFrame), SidebarNav groupée, QuickSearch Ctrl+K, NotificationsBell, ProfileMenu, StatCard, AToTraiter, ActivityFeed, DataTable (filtres en puces, tri, sélection, actions, densité, colonnes, URL), Timeline, EntityHeader, KeyValue.

**Vitrine** : Reveal, PhotoFrame, NumberedRow (le « 01 / 02 / 03 » d'edoto), SectionIntro (sur-titre, titre, texte), CtaBand, Faq, Footer, Header avec MenuSheet mobile.

**Métier (spécifiques Ifá)** :
- `OduGlyph` : les deux colonnes de marques (I et II) dessinées à l'encre `--text` sur fond kaolin, comme tracées dans l'iyẹ̀rọ̀sùn sur l'ọpọ́n. Les marques apparaissent une à une, de haut en bas, jambe droite puis gauche (60 ms chacune). Tailles sm, md, lg.
- `OduMatrix` : la grille 16 × 16 des 256 Odu. Au survol, la ligne et la colonne s'éclairent et l'Odu s'affiche.
- `OduElements` : les 4 positions (Iná, Afẹ́fẹ́, Omi, Ilẹ̀) en barre horizontale, chacune active ou latente.
- `OpeleCast` : la chaîne d'ọ̀pẹ̀lẹ̀ en SVG (8 demi-graines), qui sert à l'animation de « lecture » pendant le calcul. 1,8 s, une seule fois.
- `NatalWheel` : la roue du thème (12 secteurs, filet fin, glyphes de planètes, ligne d'ascendant, aspects tracés au centre : bleu pour les harmonieux, osùn pour les tendus). Noir et blanc dominant, couleurs d'élément très légères.
- `ElementBalance` : 4 barres horizontales avec pourcentages.
- `EboItemsTable` : les lignes de l'ebo, le sous-total matériel, ta rémunération et le total.
- `FollowUpScale` : l'échelle de 0 à 10, « Qu'est-ce qui a changé ? ».

### 6.5 Mouvement

- Vitrine : uniquement `Reveal` (0,9 s), zoom photo au survol (1,6 s), `OduGlyph` et `OpeleCast`.
- Consoles : transition de vue (opacité et 8 px, 0,22 s), ouverture des tiroirs (0,22 s).
- Respect de `prefers-reduced-motion` : toutes les animations sont coupées si le système le demande.

### 6.6 Interdits (le rendu « ère IA » à éviter)

- Pas de doré ni de jaune métallique. Pas de dégradé violet/rose/bleu. Pas de texte en dégradé.
- Pas de blobs flous, de halos, de lueurs (`glow`), d'étoiles scintillantes ni de fond « cosmos ».
- Pas d'émojis dans l'interface. Pas d'icône « sparkles ✨ ».
- Pas de glassmorphisme généralisé : le flou est réservé à l'en-tête fixe.
- Pas de fond noir par défaut sur la vitrine.
- Pas de photos de banque d'images « mystiques ». Uniquement **tes vraies photos** : toi, l'ọpọ́n, la forêt, Ouidah, Abomey, les cérémonies (autorisations obtenues).

---

## 7. Plan du site : la vitrine

Toutes les pages ont : en-tête (logo, menu, « Connais-toi », « Mon espace »), pied de page (charte, contact, réseaux, mentions), balises SEO, partage social (image Open Graph générée avec l'`OduGlyph`).

### 7.1 Accueil `/`
1. **Héros** (2 colonnes) : à gauche, sur-titre « Ifá · Ọ̀rúnmìlà · Vodoun », titre « La vérité d'Ifá, sans peur et sans mensonge. », texte de 2 lignes, deux boutons (« Découvre qui tu es », principal ; « Consulter », secondaire). À droite, **ta photo** dans un `PhotoFrame` 4:5, avec un `OduGlyph` qui se trace dans le coin.
2. **Le constat** : 3 `NumberedRow` (« On vous a vendu la peur », « Des prix qui changent sans cesse », « Personne après le paiement »).
3. **Connais-toi** (fond `bg-subtle`) : un exemple de portrait flouté, 3 points (« 4 minutes », « gratuit », « confidentiel »), bouton.
4. **Le protocole en 6 étapes** : accueil, consultation, compte rendu écrit, ebo prouvé, plan d'action, suivi J+7/30/90. Frise horizontale sur ordinateur, verticale sur mobile.
5. **La charte** : 5 engagements, lien vers `/charte`.
6. **Les 16 Odu majeurs** : grille de 16 `OduGlyph`, lien vers `/odu`.
7. **Le Bénin** (photo + texte) : initiation en forêt, circuits, bouton « Les programmes ».
8. **Événement à venir** : carte du prochain événement (date, lieu, places restantes).
9. **Enseignements** : 3 derniers articles.
10. **Questions fréquentes** : 6 questions.
11. **Bandeau d'appel** : « Ta première consultation est offerte. »
12. Installer l'application (PWA), puis le pied de page.

### 7.2 Connais-toi `/connais-toi`
Un parcours en étapes (voir 10.1), puis `/connais-toi/portrait/[id]`.

### 7.3 Consultations `/consultations`
Les 3 offres en cartes, avec ce qui est inclus et le prix en EUR et FCFA :
- **Première consultation, offerte** : 20 min, visio ou réponse écrite, une seule question, Odu nommé.
- **Consultation visio** : 45 min, compte rendu écrit, plan d'action, suivi J+7.
- **Accompagnement complet** : consultation de 60 min, ebo supervisé (matériel facturé à part, au réel), preuve vidéo ou présence en direct, suivis J+7/30/90, échange écrit pendant 90 jours.

Puis le protocole, les engagements, la FAQ dédiée et le bouton « Réserver ».

### 7.4 Comment ça marche `/protocole`
Le protocole détaillé, avec un exemple de compte rendu anonymisé (image).

### 7.5 La charte `/charte`
Les 10 engagements de la section 4, rédigés pour le public, téléchargeables en PDF.

### 7.6 Bibliothèque des Odu `/odu` et `/odu/[slug]`
- Liste : `OduMatrix` 16 × 16, filtre « Méjì / Ọmọ Odù », recherche par nom yoruba ou fon.
- Fiche : `OduGlyph` grand format, nom yoruba et fon, rang, code binaire, jambes droite et gauche (liens), `OduElements`, mots-clés, texte d'enseignement (rédigé par toi), Odu voisins.

### 7.7 Astrologie `/astrologie`
- **Le ciel du jour** : calculé en direct dans le navigateur (positions des planètes, phase de la lune), sur une `NatalWheel` à l'heure actuelle.
- Les 12 signes (élément, mode, maître), en cartes.
- Le lien entre astrologie et Ifá (texte rédigé par toi, sans confusion des traditions).
- Bouton « Calcule ton thème » vers Connais-toi.

### 7.8 Initiation au Bénin `/initiation` et `/programmes/[slug]`
Pour chaque programme : photos, déroulé jour par jour, ce qui est inclus et ce qui ne l'est pas, conditions (préparation, tenue, interdits, santé), prix, prochaines sessions avec places restantes, acompte de 30 %, FAQ voyage (visa, vaccin contre la fièvre jaune obligatoire, aéroport de Cotonou, sécurité, assurance).
- **Itẹ̀fá / Fá : initiation en forêt sacrée** (durée et contenu fixés par toi, étape 17).
- **Retraite de connaissance de soi** (sans initiation).

### 7.9 Circuits découverte `/circuits`
Exemple de circuit, à valider avec tes partenaires sur place :
- Cotonou (marché Dantokpa, Fondation Zinsou) ;
- **Ouidah** (Route des Esclaves, Porte du Non-Retour, Temple des Pythons, Forêt sacrée de Kpassè) ;
- **Abomey** (Palais royaux, patrimoine UNESCO) ;
- Porto-Novo (musée da Silva, Jardin des plantes et de la nature) ;
- **Ganvié** (cité lacustre) ;
- Grand-Popo et la Bouche du Roy ;
- Possotomè et le lac Ahémé.

### 7.10 Événements `/evenements` et `/evenements/[slug]`
- Événement phare : **Vodun Days, Ouidah** (autour du 10 janvier, fête nationale des religions endogènes ; dates exactes à confirmer chaque année).
- Formule « Séjour Vodun Days » : circuit, hébergement, accès à l'événement, accompagnement par toi.

### 7.11 Enseignements `/enseignements` et `/enseignements/[slug]`
Articles en Markdown, par catégories : Comprendre Ifá, Se protéger des arnaques, Vodoun, Astrologie, Diaspora.
Articles prévus au lancement : « 7 signes d'un faux babalawo », « Combien coûte vraiment un ebo ? », « Ce qu'Ifá ne te demandera jamais », « Kpɔ̀lí : ton signe de Fá », « Les 16 Odu majeurs ».

### 7.12 Autres pages
`/a-propos` (toi, ta lignée, ta formation, ton temple, photos), `/contact`, `/faq`, `/mentions-legales`, `/cgv`, `/confidentialite`, `/cookies`, puis l'authentification : `/connexion`, `/inscription`, `/verifier-email`, `/mot-de-passe-oublie`, `/reinitialiser`.

---

## 8. Plan de l'espace client `/espace`

La coquille est `ClientFrame`, sur le modèle de DashboardFrame d'edoto. Menu :

| Menu | Contenu |
|---|---|
| **Accueil** | Bonjour, prochain rendez-vous (avec bouton « Rejoindre la visio » actif 10 min avant), suivi à remplir, actions du plan d'action en cours (cases à cocher), dernier message |
| **Mon portrait** | Le portrait complet, la `NatalWheel`, l'`ElementBalance`, la signature Odu ; refaire un portrait (historique conservé) |
| **Mes consultations** | Liste (statut, date, offre) puis détail en onglets : *Résumé* (question, rendez-vous, lien visio) · *Compte rendu* (Odu avec `OduGlyph`, ire/ibi, ese, message, plan d'action, ewọ̀, PDF) · *Ebo* (lignes, accepter/refuser, payer, vidéo de preuve) · *Suivi* (J+7/30/90, réponses, réponse du prêtre) |
| **Mon dossier spirituel** | Chronologie de tous les Odu reçus, liste permanente de tes ewọ̀ (interdits), tous les ebo et leurs preuves |
| **Réserver** | Choisir une offre, puis un créneau, puis la question, puis payer |
| **Mes voyages** | Réservations d'initiation et de circuits : statut, acompte, solde, documents de préparation, liste à apporter |
| **Événements** | Inscriptions et billets (QR code) |
| **Paiements** | Historique et reçus PDF |
| **Profil et confidentialité** | Identité, données de naissance, notifications, export de mes données, suppression du compte |

Barre basse sur mobile : Accueil · Consultations · Dossier · Menu.

---

## 9. Plan du tableau de bord admin `/admin`

La coquille est `AppShell`, sur le modèle de dps. Groupes du menu :

- **Tableau de bord**
- **Accompagnement** : Consultations · Agenda et créneaux · Ebo · Suivis · Clients
- **Contenus** : Bibliothèque Odu · Textes du portrait · Enseignements · Pages (charte, FAQ)
- **Bénin** : Programmes · Sessions · Réservations · Événements · Inscriptions
- **Finances** : Paiements · Offres et tarifs
- **Système** : Messages de contact · Emails (modèles Brevo) · Journal d'audit · Paramètres (police, intégrations, monnaie)

### 9.1 Accueil admin
- `PageHeader` : « Tableau de bord », date du jour, bouton « Ouvrir des créneaux ».
- **À traiter** (cartes cliquables, triées par urgence) :
  - consultations du jour ;
  - comptes rendus non publiés ;
  - ebo acceptés et payés à réaliser ;
  - ebo réalisés sans vidéo ;
  - suivis répondus sans ta réponse ;
  - réservations avec acompte payé et solde dû ;
  - messages non lus.
- **Indicateurs** (sur 30 jours, comparés aux 30 jours précédents) : portraits réalisés, comptes créés, taux de conversion portrait → consultation offerte → consultation payante, chiffre d'affaires, note moyenne de progression aux suivis.
- **Graphiques** : consultations par semaine, répartition des domaines (amour, argent…), entonnoir de conversion.
- **Activité récente** : flux tiré du journal d'audit.

### 9.2 Consultations
- Table avec filtres en puces (statut, offre, période, payé/offert), recherche par client, actions par ligne (Ouvrir, Copier le lien visio, Annuler avec confirmation).
- Détail en onglets :
  - **Préparation** : question, contexte, portrait du client, son historique ;
  - **Compte rendu** : sélecteur d'Odu (recherche et `OduMatrix`), ire/ibi et précision, ese, message, plan d'action (liste), ewọ̀ (liste), notes privées (jamais visibles par le client), boutons « Enregistrer le brouillon » et « Publier » (avec confirmation) ;
  - **Ebo** : proposer (`EboItemsTable` modifiable), suivre le statut, envoyer la vidéo (upload Cloudinary avec barre de progression) ;
  - **Suivis** : réponses du client, ta réponse.

### 9.3 Les autres modules
- **Agenda et créneaux** : vue semaine. Création en série (jours, heures, durée, fuseau Africa/Porto-Novo affiché). Les créneaux réservés ne peuvent pas être supprimés.
- **Clients** : table puis fiche (en-tête d'entité, onglets Dossier, Portraits, Consultations, Paiements, Voyages).
- **Bibliothèque Odu** : les 256, avec filtres (Méjì, jambe droite), et un éditeur (résumé, mots-clés, texte long en Markdown, statut « validé par le prêtre »).
- **Textes du portrait** : édition de tous les paragraphes du moteur (signes, éléments, dimensions, aspects, domaines). Tant qu'un texte n'est pas validé, c'est la version par défaut qui s'affiche.
- **Programmes, Sessions, Réservations, Événements, Inscriptions** : tables et formulaires (galerie Cloudinary, déroulé jour par jour, inclus/exclus).
- **Paiements** : table (fournisseur, statut, objet), rapprochement, export CSV.
- **Journal d'audit** : qui, quoi, quand, avant/après **lisible** champ par champ (pas de JSON brut), filtres, pagination serveur.

---

## 10. Parcours clés, pas à pas

### 10.1 Connais-toi (l'effet « elle me connaît »)
1. **Écran d'accueil** : « En 4 minutes, découvre ce que ta naissance et ton chemin disent de toi. » Mention de confidentialité et case de consentement (données sensibles, voir 15.2).
2. **Identité** : prénom (obligatoire), nom, genre (pour les accords en français, facultatif).
3. **Naissance** :
   - date (obligatoire) ;
   - heure (facultative ; si « je ne sais pas », l'ascendant n'est pas calculé et c'est dit) ;
   - lieu (Combobox Open-Meteo, qui fixe la latitude, la longitude et le fuseau).
4. **Questionnaire** : 12 questions à choix, une par écran, avec barre de progression, en cartes radio.
5. **Une phrase libre** : « Que veux-tu voir changer dans ta vie ? »
6. **Lecture** : animation `OpeleCast` de 1,8 s pendant le calcul (le calcul réel prend moins de 100 ms ; l'animation est volontaire et unique).
7. **Portrait**, partie visible sans compte :
   - Ton essence (Soleil et élément dominant) ;
   - Ton monde intérieur (Lune) ;
   - Ce que les autres voient (Ascendant).
8. **Portrait**, partie verrouillée : « Ce que tu portes en silence », amour et leçon de vie, ce que tu traverses (avec ta phrase citée), ta signature Odu, la voie. Pour la déverrouiller : créer un compte gratuit, ce qui donne aussi la 1ʳᵉ consultation offerte.
9. Après l'inscription, le portrait est rattaché au compte et entièrement visible. Bouton « Utiliser ma consultation offerte ».

**Ce qui rend le portrait juste** (sans IA) :
- les positions réelles des planètes, à la minute près, avec l'ascendant calculé ;
- les croisements entre le thème et les réponses (exemple : Lune en signe d'eau + forte sensibilité déclarée donnent un paragraphe dédié) ;
- l'élément **le plus faible**, très parlant pour les gens ;
- les aspects tendus marquants (Lune-Saturne, Vénus-Saturne…) ;
- la phrase de la personne, citée et intégrée ;
- des textes écrits par toi, à la deuxième personne, concrets.

### 10.2 La première consultation, offerte
1. Choisir le mode : visio (créneau) ou écrit.
2. Écrire sa question (une seule) et un contexte facultatif ; le portrait est lié automatiquement.
3. Confirmation par email (Brevo) avec le lien visio, puis rappel 24 h et 1 h avant.
4. Après la séance, tu publies le compte rendu et le client reçoit un email.
5. Règle : **une seule** consultation offerte par compte. Contrôle anti-abus : email vérifié et même téléphone.

### 10.3 La consultation payante
Offre → créneau (bloqué 15 min) → question → paiement (Stripe ou FeexPay au choix) → confirmation → visio → compte rendu → suivis.
Si le paiement n'est pas fait dans les 15 min, le créneau est libéré.

### 10.4 L'ebo transparent
1. Tu proposes l'ebo depuis la consultation : objet, lignes, ta rémunération, option « assister en direct ».
2. Le client reçoit un email et voit le détail. Il **accepte** ou **refuse**, sans pression.
3. S'il accepte, il paie.
4. Tu réalises l'ebo, filmé, avec son nom prononcé et la date. Tu envoies la vidéo (Cloudinary).
5. L'ebo passe à « Réalisé », le client reçoit un email et voit la vidéo dans son dossier.

### 10.5 Le suivi
La publication du compte rendu crée trois suivis (J+7, J+30, J+90). À chaque échéance, le client reçoit un email « Qu'est-ce qui a changé ? », répond sur une échelle de 0 à 10 et par un texte, et tu réponds. Ces réponses alimentent tes **vraies statistiques**, publiables honnêtement.

### 10.6 Initiation et circuits
Programme → session → nombre de participants → acompte de 30 % → email avec la liste de préparation → solde à J-30 (rappel automatique) → documents (programme détaillé, contacts, check-list : passeport, visa, vaccin contre la fièvre jaune, assurance).

### 10.7 Événement
Événement → nombre de places → paiement (ou gratuit) → billet avec QR code → contrôle à l'entrée depuis l'admin, en mobile.

---

## 11. Moteurs métier (déterministes, sans IA), dans `packages/core`

### 11.1 Odu, déjà codé (`src/odu`)
- Les 16 Méjì dans l'ordre de séniorité : Ogbè, Ọ̀yẹ̀kú, Ìwòrì, Òdí, Ìrosùn, Ọ̀wọ́nrín, Ọ̀bàrà, Ọ̀kànràn, Ògúndá, Ọ̀sá, Ìká, Òtúúrúpọ̀n, Òtúrá, Ìrẹtẹ̀, Ọ̀ṣẹ́, Òfún.
- Pour chacun : nom fon (Gbè, Yɛ̀kú, Wòlí, Dí, Lòsò, Wɛ̀nlɛ̀n, Abla, Aklan, Gùdá, Sá, Ká, Trukpɛ̀n, Tùlá, Lɛ̀tɛ̀, Cɛ, Fú), les 4 marques (1 = I, 2 = II), des mots-clés et une essence. **Tout est à valider par toi.**
- Les 256 sont générés automatiquement (jambe droite × jambe gauche), avec identifiant, slug, rang, code binaire sur 8 bits et lecture élémentaire des 4 positions (Iná, Afẹ́fẹ́, Omi, Ilẹ̀). **Cette correspondance des positions avec les éléments doit être confirmée par ton enseignement.**
- La « signature de naissance » est calculée par parité de sommes (lettres du prénom et du nom, jour, mois, année, heure) : 8 marques, donc 1 Odu. Elle est stable, reproductible, et présentée comme symbolique (4.7).
- Un tirage d'ọ̀pẹ̀lẹ̀ virtuel est prévu, réservé aux animations et démonstrations, **jamais présenté comme une consultation**.

### 11.2 Astrologie, déjà codée (`src/astro`)
- Conversion de l'heure locale de naissance en temps universel via le fuseau IANA, ce qui gère les changements d'heure historiques.
- Longitudes écliptiques vraies (de la date) du Soleil, de la Lune, de Mercure, Vénus, Mars, Jupiter, Saturne, Uranus, Neptune et Pluton, et rétrogradation (comparaison à J+1).
- Ascendant et Milieu du Ciel :
  - ASC = atan2(cos RAMC, −(sin RAMC · cos ε + tan φ · sin ε)) ;
  - MC = atan2(sin RAMC, cos RAMC · cos ε) ;
  - avec RAMC le temps sidéral local, ε l'obliquité et φ la latitude.
- Maisons en signes entiers à partir de l'ascendant.
- Aspects et orbes : conjonction 8°, sextile 5°, carré 7°, trigone 7°, opposition 8°.
- Équilibre des éléments et des modes pondéré : Soleil, Lune et Ascendant comptent 3 ; Mercure, Vénus et Mars 1,5 ; Jupiter et Saturne 1 ; les planètes lentes 0,5.
- Ciel du jour et phase de la lune.

### 11.3 Portrait, déjà codé (`src/profile`)
- Les 12 questions alimentent 10 dimensions : sensibilité, contrôle, don de soi, trahison, intuition, porteur de la famille, errance (racines), blocage (répétition), ambition, solitude.
- Les sections (dans l'ordre) :
  1. essence ;
  2. monde intérieur ;
  3. masque ;
  4. ce que tu portes en silence (les 3 dimensions les plus fortes, les aspects marquants, l'élément manquant) ;
  5. amour, action et leçon de vie (Vénus, Mars, Saturne) ;
  6. ce que tu traverses (ta phrase, le domaine, la durée) ;
  7. signature Odu ;
  8. la voie.
- Les sections 1 à 3 sont visibles sans compte, les autres sont verrouillées.
- **Étape restante** : déplacer tous les textes vers la base (table `PortraitText`) pour que tu puisses les éditer dans l'admin (étape 4.4).

---

## 12. Modèle de données

Il est écrit dans `apps/api/prisma/schema.prisma`. Tables :

| Table | Rôle |
|---|---|
| `User` | compte, rôle (CLIENT / PRIEST / ADMIN), vérification d'email, réinitialisation du mot de passe |
| `Reading` | portrait : entrée (naissance, réponses) et résultat calculé, rattaché ou non à un compte |
| `ConsultationOffer` | offres et tarifs |
| `Slot` | créneaux de l'agenda |
| `Consultation` | demande, statut, prix figé, lien visio, offerte ou non |
| `ConsultationReport` | Odu, ire/ibi, ese, message, plan d'action, ewọ̀, notes privées, date de publication |
| `Ebo` | lignes, matériel, rémunération, statut, vidéo de preuve |
| `FollowUp` | suivis J+7, J+30, J+90 : échéance, rappel, réponse, ta réponse |
| `Ewo` | interdits permanents du client |
| `Program`, `ProgramSession`, `Booking` | initiation et circuits, sessions, réservations (acompte et solde) |
| `Event`, `EventRegistration` | événements et inscriptions |
| `Article` | enseignements |
| `OduContent` | ton contenu pour chacun des 256 Odu |
| `Payment` | paiements (Stripe / FeexPay), objet et référence |
| `ContactMessage` | messages de contact |
| **À ajouter** (étape 3.1) | `PortraitText` (textes éditables), `AuditLog` (journal), `Notification` (cloche), `Setting` (police, taux, intégrations), `ConsentLog` (consentements) |

---

## 13. API : liste des routes (préfixe `/api`)

**Public** :
- `POST /auth/register|login|forgot|reset`, `GET /auth/verify`
- `POST /readings` (portrait, sans compte possible), `GET /readings/:id` (aperçu ou complet selon le propriétaire)
- `GET /odu`, `GET /odu/:slug`
- `GET /offers`, `GET /slots?from&to`
- `GET /programs`, `GET /programs/:slug`, `GET /events`, `GET /events/:slug`
- `GET /articles`, `GET /articles/:slug`
- `POST /contact`
- `POST /payments/webhooks/stripe|feexpay`

**Client (connecté)** :
- `GET/PATCH /me`, `GET /me/dossier`, `GET /me/export`, `DELETE /me`
- `POST /readings/:id/claim`, `GET /readings/mine`
- `POST /consultations`, `GET /consultations/mine`, `GET /consultations/:id`, `POST /consultations/:id/cancel`, `GET /consultations/:id/report.pdf`
- `POST /ebos/:id/accept|decline`
- `GET /follow-ups/mine`, `POST /follow-ups/:id/answer`
- `POST /bookings`, `GET /bookings/mine`, `POST /bookings/:id/cancel`
- `POST /events/:id/register`, `GET /events/registrations/mine`
- `POST /payments/checkout` (objet, référence, fournisseur), `GET /payments/:id`

**Admin** (PRIEST / ADMIN) :
- `GET /admin/stats`, `GET /admin/todo` (bloc À traiter)
- `GET /admin/consultations`, `PATCH /admin/consultations/:id`, `PUT /admin/consultations/:id/report`
- `POST /admin/consultations/:id/ebos`, `PATCH /admin/ebos/:id`
- `PATCH /admin/follow-ups/:id` (ta réponse)
- `GET|POST|DELETE /admin/slots`
- `GET|PUT /admin/offers`
- `GET /admin/users`, `GET /admin/users/:id`
- `PUT /admin/odu/:id`, `GET|PUT /admin/portrait-texts`
- CRUD `/admin/programs`, `/admin/programs/:id/sessions`, `/admin/bookings`, `/admin/events`, `/admin/events/:id/registrations`, `/admin/articles`
- `GET /admin/payments`, `GET /admin/audit`, `GET /admin/contact`
- `GET /admin/media/signature` (upload Cloudinary signé), `GET|PUT /admin/settings`

**Règles transverses** :
- validation stricte (`whitelist`) ;
- limitation de débit sur l'authentification ;
- pagination `?page&pageSize&sort&filtres` sur toutes les listes admin, avec réponse `{ items, total }` ;
- chaque écriture admin est inscrite dans `AuditLog`.

---

## 14. Intégrations

### 14.1 TiDB Cloud
1. Créer un cluster **Serverless**, région **eu-central-1 (Francfort)**, proche de la diaspora européenne et conforme au RGPD.
2. Créer la base `ifaolade`, copier la chaîne de connexion et y ajouter `?sslaccept=strict`.
3. `npx prisma db push`, puis le seed (offres, admin, programmes, événement, articles).
4. Activer les sauvegardes automatiques et tester une restauration une fois.

### 14.2 Brevo, modèles d'emails (tous en HTML, aux couleurs kaolin et indigo)
Bienvenue et vérification · Mot de passe · Portrait prêt · Consultation confirmée (avec lien visio et fichier .ics) · Rappel 24 h · Rappel 1 h · Paiement reçu · Compte rendu publié · Ebo proposé · Ebo réalisé (vidéo disponible) · Suivi J+7/30/90 · Réponse du prêtre · Réservation (acompte reçu, solde à J-30, préparation du voyage) · Billet d'événement · Notification admin (nouvelle demande, paiement, message).
Domaine d'envoi authentifié (SPF, DKIM, DMARC) **avant** le lancement.

### 14.3 Cloudinary
- Dossiers : `ifaolade/site` (photos de la vitrine), `ifaolade/programs`, `ifaolade/events`, `ifaolade/articles`, `ifaolade/ebo-proofs` (**privé**, accès par URL signée et expirante).
- Upload signé : l'API fournit la signature, le navigateur envoie le fichier directement.
- Images en `f_auto,q_auto`, vidéos transcodées et diffusées en streaming adaptatif.

### 14.4 Paiements
- Stripe Checkout : session, retour sur `/paiement/succes`, puis webhook `checkout.session.completed` qui valide le paiement. Le paiement n'est jamais validé côté navigateur.
- FeexPay : SDK déjà utilisé sur edoto. Le paiement est validé par le webhook **et** une re-vérification serveur du statut de la transaction.
- Traitement idempotent : un paiement validé deux fois ne déclenche qu'une seule fois la suite (consultation confirmée, ebo payé, réservation, billet).
- ⚠️ À vérifier avant de choisir : les conditions d'utilisation de chaque fournisseur sur les services spirituels et la voyance (certains les classent « à risque »).

### 14.5 Visio
Une salle Jitsi unique par consultation (`/ifaolade-<identifiant aléatoire>`), dont le lien est visible 10 min avant le rendez-vous. Pour la phase 2 : salle intégrée dans la page et enregistrement facultatif (avec consentement).

### 14.6 Tâches planifiées (toutes les heures)
Rappels 24 h et 1 h · libération des créneaux non payés après 15 min · suivis arrivés à échéance · solde des réservations à J-30 · nettoyage des portraits anonymes de plus de 90 jours.

---

## 15. Sécurité, confidentialité et conformité

### 15.1 Sécurité
- Mots de passe hachés (bcrypt, coût 11).
- JWT court (15 min) avec rafraîchissement en cookie `httpOnly`, `Secure`, `SameSite=Lax`, en remplacement du token en `localStorage`.
- Helmet, CORS limité au domaine du site, limitation de débit.
- Validation stricte des entrées, contenu Markdown nettoyé (`sanitize-html`, comme sur edoto).
- Rôles vérifiés côté API, **toujours**.
- Les notes privées du prêtre ne sortent jamais vers le client (test automatisé).
- Les vidéos de preuve sont privées, en URL signée.

### 15.2 Données sensibles
Les convictions religieuses sont une **catégorie particulière** de données, au sens du RGPD (article 9) comme de la loi béninoise (Code du numérique, loi n° 2017-20, contrôlée par l'**APDP**, que tu connais déjà par edoto).
- Consentement explicite et séparé avant le portrait et avant la consultation, enregistré dans `ConsentLog`.
- Minimisation : pas de données inutiles.
- Hébergement de la base en UE (Francfort).
- Export et suppression du compte en libre-service.
- Registre des traitements, désignation d'un délégué à la protection des données (le même modèle de documents qu'edoto), déclaration ou notification à l'APDP.
- Politique de confidentialité et CGV rédigées **avant** l'ouverture.

### 15.3 Juridique
Pas de promesse de résultat, prix TTC affichés, droit de rétractation (prestations à distance), conditions d'annulation et de remboursement claires (consultation et voyages), assurance responsabilité civile professionnelle pour les séjours, contrats écrits avec les partenaires (transport, hébergement, guides).

---

## 16. Plan de réalisation étape par étape

Chaque étape a un **livrable** et un critère **« Terminé quand »**. On ne passe à la suivante qu'à ce moment-là.

### Phase 0 : fondations (semaine 1)
- **0.1** Monorepo (npm workspaces) : `apps/web`, `apps/api`, `packages/core`.
  *Terminé quand* `npm install` puis `npm run build` passent sur les trois. **Déjà fait en partie** (section 20).
- **0.2** Le moteur `packages/core` compile, avec tests unitaires :
  - 256 Odu uniques ;
  - signature stable ;
  - ascendant vérifié sur **3 thèmes de référence** calculés aussi avec un logiciel d'astrologie reconnu, avec un écart inférieur à 0,5°.
- **0.3** Comptes de service créés : TiDB Cloud, Brevo, Cloudinary, Stripe, FeexPay, Vercel, Render, nom de domaine.
  *Terminé quand* toutes les clés sont dans `.env` (jamais commitées).
- **0.4** Dépôt Git, branches `main` et `dev`, CI (build et lint) sur GitHub Actions, comme edoto.

### Phase 1 : identité et design system (semaine 2)
- **1.1** ✅ Nom : **Ifaôladé**. Reste : le logo (monogramme inspiré des marques d'Odu, tracé à la main puis vectorisé) et le domaine (ex. ifaolade.com).
- **1.2** Tokens de la section 6 dans `globals.css` (`@theme`), en clair et en sombre.
- **1.3** Police Inter (`latin` et `latin-ext`) : contrôle visuel des diacritiques yoruba sur une page de test.
- **1.4** Tous les composants de base et de console de la section 6.4, dans une page `/design` (catalogue interne).
  *Terminé quand* chaque composant apparaît dans tous ses états (normal, survol, focus, désactivé, chargement, erreur) sur mobile et ordinateur.
- **1.5** Composants métier `OduGlyph`, `OduMatrix`, `OduElements`, `OpeleCast`, `NatalWheel`, `ElementBalance`.
  *Terminé quand* ils s'affichent avec des données réelles de `packages/core`.

### Phase 2 : API socle (semaines 3 et 4)
- **2.1** Prisma et TiDB : `db push`, seed. Ajout des tables `PortraitText`, `AuditLog`, `Notification`, `Setting`, `ConsentLog`.
- **2.2** Module Auth : inscription, connexion, vérification d'email, mot de passe oublié, rafraîchissement par cookie.
  *Terminé quand* les emails Brevo arrivent réellement.
- **2.3** Gardes de rôles et journal d'audit automatique (intercepteur).
- **2.4** Module Médias : signature Cloudinary, dossier privé pour les preuves.
- **2.5** Module Paiements : Stripe et FeexPay, webhooks, idempotence.
  *Terminé quand* un paiement test de chaque fournisseur valide bien son objet.
- **2.6** Tâches planifiées (section 14.6).

### Phase 3 : vitrine (semaines 5 et 6)
- **3.1** En-tête, pied de page, menu mobile, SEO, images Open Graph.
- **3.2** Accueil (les 12 sections de 7.1), avec **tes photos**.
- **3.3** Consultations, Protocole, Charte, À propos, FAQ, Contact, pages légales.
- **3.4** Bibliothèque Odu (liste et fiche) et page Astrologie (ciel du jour).
- **3.5** Initiation, Circuits, Événements, Enseignements.
  *Terminé quand* Lighthouse est au-dessus de 90 sur ordinateur et mobile (performance, accessibilité, SEO) et que toutes les pages sont lisibles à 360 px de large.

### Phase 4 : Connais-toi (semaine 7)
- **4.1** Le parcours en étapes de 10.1 (Combobox de lieu, heure inconnue, questionnaire, phrase libre).
- **4.2** L'animation `OpeleCast`, puis la page portrait (aperçu et partie verrouillée, déverrouillage par inscription, rattachement automatique).
- **4.3** Le portrait complet dans l'espace client et l'historique.
- **4.4** Les textes du portrait déplacés en base et éditables dans l'admin.
- **4.5** **Ta relecture complète** de tous les textes du portrait et des 16 Méjì.
  *Terminé quand* 10 personnes test (proches, diaspora) ont fait leur portrait et donné leur avis (« juste », « à côté », « choquant »), et que les textes sont corrigés.

### Phase 5 : consultations, ebo et suivi (semaines 8 et 9)
- **5.1** Créneaux (admin) et réservation (client), avec blocage de 15 min.
- **5.1 bis** Réservation sur le modèle d'edoto (`BookingDrawer`) : indicateur en 4 étapes (Consultation, Date et heure, Ta question, Confirmation) ; grille de la semaine, lundi à dimanche, flèches semaine précédente et suivante, heures regroupées Matin / Après-midi / Soir ; choix possible **avant** connexion (brouillon gardé dans le navigateur, repris après connexion) ; écran de confirmation avec ajout au calendrier (.ics).
- **5.9** **« J'ai déjà mon Odu »** : une personne qui a reçu un Odu ailleurs (consultation physique, autre babaláwo) le saisit et obtient une explication guidée.
  1. Tutoriel animé avant la saisie.
  2. Carte lumineuse de **8 cercles** (jambe droite à droite, jambe gauche à gauche, de haut en bas) : un cercle touché = **deux traits (II)**, un cercle non touché = **un trait (I)**.
  3. L'Odu apparaît (marques, nom yoruba et fon).
  4. La personne choisit le domaine de sa consultation (amour, argent, santé, famille, papiers, spirituel, enfants).
  5. Explication guidée, étape par étape : identité de l'Odu, jambe droite qui gouverne et jambe gauche qui nuance, lecture élémentaire, **interprétation de l'Odu dans ce domaine**, enseignement du prêtre, puis invitation à consulter.
  *Sans improvisation* : l'interprétation « Odu × domaine » ne s'affiche que si le prêtre l'a écrite et validée dans l'admin (éditeur Odu, un onglet par domaine). Sinon la page le dit honnêtement. La plateforme ne dit jamais si l'Odu est ire ou ibi : seul celui qui l'a fait sortir peut le dire.
- **5.2** Consultation offerte (règle « une par compte »).
- **5.3** Consultation payante (Stripe et FeexPay).
- **5.4** Visio Jitsi et rappels.
- **5.5** Compte rendu (éditeur admin, vue client, PDF).
- **5.6** Ebo (proposition, accepter/refuser, paiement, vidéo de preuve).
- **5.7** Suivis J+7/30/90 et réponses.
- **5.8** Dossier spirituel (chronologie, ewọ̀).
  *Terminé quand* un parcours complet est réussi par un vrai client test : portrait → compte → consultation offerte → compte rendu → consultation payante → ebo → preuve → suivi J+7 (simulé).

### Phase 6 : espace client et admin complets (semaines 10 et 11)
- **6.1** `ClientFrame` et tous les menus de la section 8.
- **6.2** `AppShell` admin et tous les modules de la section 9, au standard « Phase 6 dps » (tables avancées, onglets, confirmations, squelettes, états vides).
- **6.3** Accueil admin : À traiter, indicateurs, graphiques, activité.
- **6.4** Versions **anglaise et yoruba** (vitrine, Connais-toi et portrait, connexion / inscription). Adresses : français sans préfixe (`/consultations`), `/en/…`, `/yo/…` ; sélecteur de langue dans l'en-tête ; balises hreflang.
  *Hors périmètre, restent en français* : espace client, admin, emails, et les contenus saisis dans l'admin (offres, programmes, événements, articles, enseignements des Odu).
  *Terminé quand* chaque page de la vitrine et tout le parcours Connais-toi existent dans les trois langues. Le **yoruba doit être relu par un locuteur natif** avant l'ouverture publique, comme tous les textes spirituels (règle 2.4).

### Phase 7 : Bénin, voyages et événements (semaine 12)
- **7.1** Programmes et sessions (admin), pages publiques, réservation avec acompte et solde.
- **7.2** Documents de préparation et check-list voyage.
- **7.3** Événements, billets avec QR code, contrôle à l'entrée sur mobile.

### Phase 8 : qualité et lancement (semaines 13 et 14)
- **8.1** Tests de bout en bout (scénarios de la section 10), tests de sécurité : accès d'un client au dossier d'un autre client, notes privées, webhooks falsifiés.
- **8.2** Conformité : CGV, confidentialité, registre, APDP, bandeau cookies.
- **8.3** Mise en production : Vercel et Render, domaine, emails authentifiés, sauvegardes, supervision des erreurs.
- **8.4** PWA installable (icône, écran de démarrage), comme edoto.
- **8.5** Lancement doux auprès de 30 personnes de ta communauté, puis ouverture publique.

### Phase 9 : après le lancement
Application mobile (React Native / Expo, réutilisant `packages/core` et l'API), versions portugaise et espagnole, ouverture à d'autres prêtres vérifiés (charte signée, lignée contrôlée, avis), salle visio intégrée.

---

## 17. Contenus que toi seul peux fournir

| # | Contenu | Pour quelle étape |
|---|---|---|
| 1 | ✅ Nom : Ifaôladé. Reste : l'histoire du nom (pour la page À propos) | 1.1 |
| 2 | Ta biographie, ta lignée, ton initiation, ton temple, tes titres | 3.3 |
| 3 | Photos réelles : toi en consultation, l'ọpọ́n et l'ọ̀pẹ̀lẹ̀, la forêt, les lieux des circuits, les cérémonies (avec autorisations) | 3.2 |
| 4 | Validation ou correction des 16 Méjì (noms yoruba et fon, mots-clés, essence) et de la correspondance des positions avec les éléments | 4.5 |
| 5 | Textes d'enseignement des Odu (au moins les 16 Méjì au lancement) | 3.4 |
| 6 | Relecture de tous les textes du portrait | 4.5 |
| 7 | Tarifs définitifs des 3 offres, ta grille de rémunération sur l'ebo | 5.3 |
| 8 | Tes disponibilités hebdomadaires (créneaux) | 5.1 |
| 9 | Programme d'initiation : durée, déroulé, conditions, interdits, ce qui est inclus, prix, capacité | 7.1 |
| 10 | Circuits : partenaires (transport, hébergement, guides), prix, dates | 7.1 |
| 11 | Événement Vodun Days : formule, prix, partenaires | 7.3 |
| 12 | Les 5 premiers articles | 3.5 |
| 13 | Les 10 questions de la FAQ | 3.3 |

---

## 18. Lancement, croissance et risques

**Contenus d'acquisition** (TikTok, YouTube, Instagram, Facebook) :
- série « Les signes d'un faux babalawo » ;
- « Combien coûte vraiment un ebo » ;
- un Odu expliqué par semaine ;
- des lives sur l'Odu de l'année ;
- les coulisses de la forêt et de Ouidah.

Chaque contenu renvoie vers **Connais-toi**.

**Communautés cibles** : Paris, Bruxelles, Lyon, Montréal, Londres, Houston, Atlanta, puis le Brésil et Cuba.

**Indicateurs suivis** : portraits réalisés, taux d'inscription après portrait (objectif de départ : plus de 35 %), taux d'utilisation de la consultation offerte, conversion vers une consultation payante (objectif : plus de 15 %), progression moyenne aux suivis, taux d'acceptation des ebo.

**Risques et réponses** :

| Risque | Réponse |
|---|---|
| Un fournisseur de paiement refuse l'activité | Vérifier les conditions **avant** l'intégration ; garder deux fournisseurs |
| Le portrait paraît « générique » | Phase 4.5 : tests réels et réécriture des textes |
| Saturation de ton agenda | Créneaux limités, liste d'attente, puis réseau de prêtres vérifiés (phase 9) |
| Plainte ou litige | Charte appliquée par le code, traces écrites (compte rendu, ebo accepté, preuves), CGV claires |
| Fuite de données | Section 15, sauvegardes, accès minimal, journal d'audit |
| Contrefaçon de ta marque | Dépôt du nom (OAPI pour l'Afrique, INPI ou EUIPO pour l'Europe) |

---

## 19. Journal des décisions

| Date | Décision |
|---|---|
| 2026-11-18 | Stack : Next.js, NestJS, TiDB Cloud, Brevo, Cloudinary. Pas d'IA. |
| 2026-11-18 | Direction visuelle « kaolin, indigo, osùn » ; doré et codes « ère IA » interdits ; vitrine inspirée d'edoto, espace client du DashboardFrame d'edoto, admin de l'AppShell de dps. |
| 2026-11-18 | La 1ʳᵉ consultation est offerte, les suivantes sont payantes (visio ou accompagnement complet). |
| 2026-11-18 | La signature Odu de naissance est toujours présentée comme symbolique ; le Kpɔ̀lí ne se révèle que par la divination et l'initiation. |
| 2026-11-18 | Paiements : FeexPay (Afrique) et Stripe (diaspora). |
| 2026-11-18 | Nom de la plateforme : **Ifaôladé** (identifiant technique `ifaolade`, salles visio `ifaolade-…`). |
| 2026-11-19 | Ajout du **yoruba** à côté du français et de l'anglais (étape 6.4). Le yoruba est relu par un locuteur natif avant l'ouverture publique. |
| 2026-11-19 | Réservation sur le modèle d'edoto (étape 5.1 bis) et fonction « J'ai déjà mon Odu » avec carte de 8 cercles (étape 5.9). Les interprétations Odu × domaine sont écrites et validées par le prêtre. |
| 2026-11-19 | Décisions du prêtre : (1) les 112 interprétations Méjì × domaine sont rédigées par Claude à partir de l'essence publiée de chaque Méjì (sans ebo, ewọ̀, Òrìṣà ni verdict ire / ibi), publiées, et modifiables dans l'admin ; import `npm run db:seed-odu -w @ona/api` qui n'écrase jamais un texte existant ; relecture : `dossier_production/TEXTES_ODU_DOMAINES.md`. (2) La consultation gratuite reste telle qu'elle est (faite par le prêtre ; pas de tirage automatique). (3) Pas de Mini-IPIP pour l'instant : trop de questions décourageraient. |

---

## 20. État actuel du dossier `Desktop/ifa`

| Élément | État |
|---|---|
| `package.json` (workspaces), `.gitignore` | ✅ créés |
| `packages/core` : Odu (16 Méjì et 256), astrologie, questionnaire, moteur de portrait, packs anglais et yoruba | ✅ **22 tests passent** (`npm test -w @ona/core`) : 3 thèmes de référence à moins de 0,5°, packs en/yo complets, et les **6 corrections du portrait** (2026-11-19) : transition Soleil / élément dominant, toutes les dimensions fortes gardées (jusqu'à 5), domaine supplémentaire détecté dans la phrase libre, signature Odu qui ne prétend pas parler de la situation, phrases lourdes seulement si les réponses les appuient, accords masculin / féminin. |
| `apps/api` : config, schéma Prisma, seed (admin, 3 offres, 2 programmes, Vodun Days 2027, 5 articles en brouillon ; **prix et dates provisoires**) | ✅ |
| `apps/api` : tous les modules (auth, dossiers, portraits, Odu, consultations, paiements, programmes, événements, articles, médias, admin, contact) | ✅ **Branché sur TiDB** (base `ifaolade`) : `db push` et seed faits, parcours e2e réel 19/19, email Brevo reçu. ✅ **22 tests** (`npm test -w @ona/api`) : 17 de sécurité + 5 sur « J'ai déjà mon Odu ». |
| `apps/api` : tables `PortraitText`, `AuditLog`, `Notification`, `Setting`, `ConsentLog`, `RefreshToken`, `OduDomainText` ; cookie de rafraîchissement | ✅ étapes 2.1 à 2.3 faites et poussées sur TiDB ; `OduDomainText` (étape 5.9) poussée le 2026-11-19. |
| `apps/web`, phase 1 : tokens kaolin/indigo/osùn (clair + sombre), Inter latin-ext, composants de base et de console, composants métier (OduGlyph, OduMatrix, OduElements, OpeleCast, NatalWheel, ElementBalance), catalogue `/design` | ✅ compilé. ⏳ Restent au catalogue : Combobox, DatePicker, TimePicker, Dropdown, Pagination, DataTable, Timeline, AppShell, ClientFrame (construits avec les phases 4 à 6 qui les utilisent). ⏳ Vérification visuelle en navigateur non faite (extension Chrome non connectée). |
| `apps/web`, phase 3 (vitrine) : en-tête + menu mobile, pied de page, accueil (11 sections de §7.1), Consultations, Protocole, Charte, À propos, FAQ, Contact (formulaire branché sur l'API), mentions légales, CGV, confidentialité, cookies, bibliothèque Odu (grille 16 × 16 + liste avec recherche) et **256 fiches Odu générées à l'avance**, Astrologie (ciel du jour calculé en direct), Initiation, Circuits, fiche programme, Événements (liste + fiche), Enseignements (liste par catégorie + article Markdown sécurisé), page 404, pages d'attente pour Connais-toi / connexion / réservation / espace | ✅ `next build` : 280 pages, 0 erreur, 0 avertissement. ⏳ Section 12 de l'accueil (« Installer l'application ») : étape 8.4. ⏳ Lighthouse et contrôle à 360 px : à faire en navigateur. ⏳ Les pages qui lisent l'API (offres, programmes, événements, articles) affichent un état vide propre tant que l'API n'est pas branchée sur TiDB. |
| Phase 4 (Connais-toi) : moteur avec textes remplaçables + catalogue de toutes les clés (11 tests passent), table `PortraitText` + routes admin, parcours en étapes (consentement, identité, naissance avec lieu Open-Meteo, 12 questions, phrase libre, brouillon gardé dans le navigateur), animation ọ̀pẹ̀lẹ̀, portrait (roue, Soleil / Lune / Ascendant, éléments, signature, sections d'aperçu, partie verrouillée, déverrouillage par inscription avec rattachement automatique, encadré « consulte un médecin »), mode local si l'API est injoignable, pages inscription / connexion / vérification d'email / mot de passe oublié / réinitialisation, « Mon portrait » avec historique, éditeur admin des textes du portrait, purge des portraits anonymes à 90 jours | ✅ compilé. ⏳ **4.5** : ta relecture complète des textes et 10 personnes test. |
| Phase 5 (consultations) : réservation (offre, visio ou écrit pour l'offerte, créneaux heure du Bénin + heure locale, question, consentement), paiement Stripe et FeexPay (SDK v2 comme edoto) avec vérification serveur, page de résultat (re-vérification, paiement simulé en test), espace client consultation en 4 onglets (visio active 10 min avant, compte rendu imprimable / PDF, ebo : accepter ou refuser à égalité, paiement, vidéo de preuve, suivis 0-10), dossier spirituel, console prêtre (liste filtrable, fiche en 4 onglets, éditeur de compte rendu avec choix de l'Odu et aperçu, proposition d'ebo ligne par ligne, envoi de la preuve vidéo vers Cloudinary, réponses aux suivis), agenda (créneaux en série) | ✅ compilé (API et web). ⏳ Parcours de bout en bout à faire sur une vraie base (étape 5 « Terminé quand »). |
| Étape 5.1 bis : réservation sur le modèle d'edoto (4 étapes, grille de la semaine Matin / Après-midi / Soir, choix avant connexion avec brouillon repris, confirmation + ajout à l'agenda .ics) | ✅ compilé (2026-11-19). |
| Étape 5.9 : « J'ai déjà mon Odu » (`/mon-odu`, 3 langues) : tutoriel animé, carte lumineuse de 8 cercles (touché = II, non touché = I), recherche par nom, domaine de la consultation, explication guidée en 6 étapes, encadré médecin (règle 4.8) ; éditeur admin « Odu × domaine » (brouillon / publié, journal d'audit) | ✅ compilé, API testée sur TiDB. ✅ **112 textes Méjì × domaine importés et publiés** (2026-11-19), modifiables dans l'admin. ⏳ Relecture du prêtre (`TEXTES_ODU_DOMAINES.md`). |
| Phase 6 (espaces) : ClientFrame (barre latérale repliable mémorisée, tiroir mobile, barre basse), accueil client (alertes, prochain RDV, dernier Odu, plan d'action à cocher), voyages, événements, paiements + reçu imprimable, profil (modification, export JSON, suppression) ; AppShell admin complet (5 groupes, Ctrl+K), accueil admin (À traiter, 4 indicateurs vs 30 j précédents, entonnoir, domaines, activité), Ebo, Suivis, Clients + fiche en onglets, Bibliothèque Odu + éditeur Markdown, Enseignements, Programmes + sessions, Réservations, Événements, Paiements + export CSV, Messages | ✅ compilé. ✅ Journal d'audit et paramètres faits. ✅ **6.4 : français, anglais, yoruba** pour la vitrine et le portrait. ⏳ Le yoruba doit être relu par un locuteur natif. |
| Phase 7 (Bénin) : email de réservation avec liste de préparation, rappel du solde à J-30 (tâche quotidienne, une seule fois), email du billet, QR code du billet, contrôle à l'entrée (caméra + BarcodeDetector ou saisie), entrée enregistrée une seule fois | ✅ API : typage propre. ✅ Web : compilé avec la phase 8. |
| Phase 8 (qualité et lancement) : **15 tests de sécurité automatisés** (`npm test -w @ona/api`, tous passent : cloisonnement des dossiers, notes privées, brouillons, rôles, jeton falsifié, consultation offerte unique, créneau unique, suivis J+7/30/90, ebo détaillé, preuve après paiement, idempotence des paiements, webhook Stripe falsifié, FeexPay montant et réutilisation, paiement simulé interdit en production), garde-fous de démarrage en production, sonde `/api/health`, `render.yaml`, `vercel.json`, en-têtes de sécurité, `robots` + `sitemap` (256 Odu + contenus), application installable (manifeste, icônes générées, section « Installer » de l'accueil), guide `MISE_EN_PRODUCTION.md` | ✅ écrit et testé côté API. ⏳ 8.1 parcours réels, Lighthouse, mobile : sur une vraie base. ⏳ 8.2 conformité : passages `[à compléter]`, APDP, registre. ⏳ 8.3 et 8.5 : de ton côté, en suivant `MISE_EN_PRODUCTION.md`. |
| Contenus en attente du prêtre (§17) | Photos réelles (chaque cadre indique « Photo à fournir : … »), page À propos et pages légales (passages `[à compléter]`), règles d'annulation des CGV, prix définitifs, programme d'initiation, partenaires des circuits. |

**Prochaine action, de ton côté** : `dossier_production/MISE_EN_PRODUCTION.md`, étapes A à F (TiDB, Brevo, Cloudinary, FeexPay, Stripe, Render, Vercel). Dès que la base est branchée, on fait ensemble l'étape G (parcours réels) et on corrige.
**Restes à coder, connus et listés** : supervision des erreurs (Sentry, facultatif). Mini-IPIP et consultation gratuite automatique : écartés pour l'instant (décision du 2026-11-19).
