/** Refonte §8.1 : emplacements d'images de la vitrine (clé → usage et format affichés dans l'admin). */
export const IMAGE_SLOTS: Record<string, { label: string; ratio: string }> = {
  'home.hero': { label: 'Accueil : héros (photo du prêtre)', ratio: '4:5' },
  'home.benin.1': { label: 'Accueil : Bénin, image 1', ratio: '3:4' },
  'home.benin.2': { label: 'Accueil : Bénin, image 2', ratio: '3:4' },
  'menu.consulter': { label: 'Menu « Consulter » : carte', ratio: '4:3' },
  'menu.connais': { label: 'Menu « Connais-toi » : carte', ratio: '4:3' },
  'menu.odu': { label: 'Menu « Les Odu » : carte', ratio: '4:3' },
  'menu.benin': { label: 'Menu « Bénin » : carte', ratio: '4:3' },
  'menu.maison': { label: 'Menu « La maison » : carte', ratio: '4:3' },
  'about.main': { label: 'À propos : photo principale', ratio: '4:5' },
  'about.opon': { label: "À propos : l'ọpọ́n", ratio: '1:1' },
  'about.temple': { label: 'À propos : le temple', ratio: '1:1' },
  'initiation.1': { label: 'Initiation : image 1', ratio: '3:4' },
  'initiation.2': { label: 'Initiation : image 2', ratio: '3:4' },
  'initiation.3': { label: 'Initiation : image 3', ratio: '3:4' },
  'auth.side': { label: 'Connexion et inscription : image latérale', ratio: '4:5' },
  'og.default': { label: 'Partage sur les réseaux (1200 × 630)', ratio: '1.91:1' },
};

/** Refonte §8.4 : textes de mise en avant modifiables par langue. Vide = texte du dictionnaire. */
export const TEXT_KEYS: Record<string, string> = {
  'home.heroOverline': 'Accueil : surtitre du héros',
  'home.heroTitle': 'Accueil : titre du héros',
  'home.heroText': 'Accueil : texte du héros',
  'home.heroCta': 'Accueil : bouton principal',
  'home.heroCta2': 'Accueil : bouton secondaire',
  'home.offerTitle': 'Accueil : carte « consultation offerte »',
  'home.livesTitle': 'Accueil : titre « Ce que tu vis »',
  'home.stepsTitle': 'Accueil : titre des 3 étapes',
  'home.priestTitle': 'Accueil : titre de la section babaláwo',
  'home.ctaTitle': "Accueil : titre de l'appel final",
  'home.ctaText': "Accueil : texte de l'appel final",
  'odu.elementsText': 'Odu : explication de la lecture élémentaire',
  'odu.manifest': 'Odu : état « manifesté »',
  'odu.balance': 'Odu : état « en équilibre »',
  'odu.latent': 'Odu : état « latent »',
  'odu.teachingPending': 'Odu : enseignement pas encore rédigé',
  'initiation.emptyTitle': 'Initiation : aucune session annoncée',
  'circuits.emptyTitle': 'Circuits : aucun départ annoncé',
  'teach.empty': 'Enseignements : aucun texte publié',
};

export const LOCALES = ['fr', 'en', 'yo'] as const;
