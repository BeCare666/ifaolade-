/** Contenus partagés de la vitrine. Textes à relire et valider par le prêtre (plan §2, règle 4). */

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Ifaôladé';

export const NAV = [
  { href: '/consultations', label: 'Consultations' },
  { href: '/protocole', label: 'Comment ça marche' },
  { href: '/odu', label: 'Les Odu' },
  { href: '/astrologie', label: 'Astrologie' },
  { href: '/initiation', label: 'Initiation au Bénin' },
  { href: '/enseignements', label: 'Enseignements' },
];

export const NAV_SECONDARY = [
  { href: '/circuits', label: 'Circuits découverte' },
  { href: '/evenements', label: 'Événements' },
  { href: '/charte', label: 'La charte' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/faq', label: 'Questions fréquentes' },
  { href: '/contact', label: 'Contact' },
];

export const LEGAL = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/cgv', label: 'CGV' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/cookies', label: 'Cookies' },
];

/** Plan §4 : les 10 engagements, rédigés pour le public. */
export const CHARTER = [
  { title: 'Des prix fixes, publiés à l\'avance', text: 'Chaque consultation a un prix affiché avant la réservation. Ce prix ne change pas en cours de route.' },
  { title: 'Un ebo détaillé ligne par ligne', text: 'Chaque élément du matériel est listé avec sa quantité et son coût réel. La rémunération du prêtre est affichée à part.' },
  { title: 'La liberté totale d\'accepter ou de refuser', text: 'Aucun compte à rebours, aucune menace. Refuser un ebo ne change rien à la qualité de ton accompagnement.' },
  { title: 'La preuve que l\'ebo est fait', text: 'Chaque ebo réalisé est filmé, avec ton nom prononcé et la date. Tu peux aussi y assister en direct.' },
  { title: 'Un suivi jusqu\'au résultat', text: 'Nous revenons vers toi à J+7, J+30 et J+90 pour savoir ce qui a changé, et ajuster si nécessaire.' },
  { title: 'Aucune promesse de résultat garanti', text: 'Ifá éclaire et ouvre les chemins. Personne d\'honnête ne peut garantir un résultat, et nous ne le ferons jamais.' },
  { title: 'L\'honnêteté sur le symbolique', text: 'Ce qui est calculé, comme ta signature de naissance, est présenté comme symbolique. Ton Odu de destinée ne se révèle que par la divination.' },
  { title: 'L\'orientation vers les professionnels', text: 'Pour la santé, le corps ou une détresse profonde, nous te disons aussi de consulter un médecin ou un psychologue. Les deux chemins se complètent.' },
  { title: 'Une confidentialité absolue', text: 'Tes données sont chiffrées, jamais revendues. Tu peux les exporter ou supprimer ton compte à tout moment.' },
  { title: 'Le droit à un second avis', text: 'Ton compte rendu t\'appartient. Tu peux le télécharger et le montrer à qui tu veux.' },
];

/** Plan §7.1 section 4 : le protocole en 6 étapes. */
export const PROTOCOL = [
  { title: 'Accueil', text: 'Tu poses ta question et tu décris ta situation. Ton portrait, si tu l\'as fait, éclaire déjà le contexte.' },
  { title: 'Consultation', text: 'En visio, l\'ọ̀pẹ̀lẹ̀ ou les ikin bien visibles à l\'écran. L\'Odu qui parle pour toi est nommé devant toi.' },
  { title: 'Compte rendu écrit', text: 'L\'Odu, son message, l\'ese cité, ire ou ibi, et tes ewọ̀ (interdits), écrits et conservés dans ton dossier.' },
  { title: 'Ebo prouvé', text: 'Si un ebo est nécessaire, il est détaillé ligne par ligne. Tu acceptes ou tu refuses. S\'il est fait, il est filmé.' },
  { title: 'Plan d\'action', text: 'Trois à cinq actions concrètes, dans ta vie réelle. Ifá oriente, mais c\'est toi qui marches.' },
  { title: 'Suivi', text: 'À J+7, J+30 et J+90, nous te demandons ce qui a changé. Ta réponse guide la suite.' },
];

export const PAINS = [
  { title: 'On vous a vendu la peur', text: '« Si tu ne paies pas aujourd\'hui, il va t\'arriver malheur. » Ifá ne parle pas ainsi. La peur est l\'outil des charlatans, pas celui d\'Ọ̀rúnmìlà.' },
  { title: 'Des prix qui changent sans cesse', text: 'Un ebo en appelle un autre, puis un autre. Pas de détail, pas de justification, et une facture qui ne s\'arrête jamais.' },
  { title: 'Personne après le paiement', text: 'Aucune preuve que le travail a été fait. Aucun compte rendu. Aucun suivi. Vous restez seul avec vos questions.' },
];

export const FAQ = [
  { q: 'La première consultation est-elle vraiment gratuite ?', a: 'Oui. Une consultation offerte par personne : une question, l\'Odu nommé et son message, en visio ou par écrit. Aucune carte bancaire n\'est demandée.' },
  { q: 'Comment savoir que l\'ebo a réellement été fait ?', a: 'Chaque ebo réalisé est filmé, avec ton nom prononcé et la date. La vidéo est déposée dans ton dossier, et tu peux aussi demander à y assister en direct.' },
  { q: 'Suis-je obligé d\'accepter un ebo ?', a: 'Non. Tu reçois une proposition détaillée et tu es entièrement libre de la refuser. Ton suivi continue normalement.' },
  { q: 'Je vis loin du Bénin. Est-ce que ça marche à distance ?', a: 'Oui. La consultation se fait en visio, l\'ọ̀pẹ̀lẹ̀ ou les ikin restent visibles à l\'écran. Les ebo sont réalisés ici et filmés pour toi.' },
  { q: 'Le portrait « Connais-toi » remplace-t-il une consultation ?', a: 'Non. Le portrait éclaire qui tu es à partir de ton thème astral, de tes réponses et d\'une signature symbolique. Seule une consultation révèle l\'Odu qui parle de ta situation précise.' },
  { q: 'Mes informations restent-elles confidentielles ?', a: 'Oui. Tes données sont chiffrées, hébergées en Europe, jamais revendues. Tu peux les exporter ou supprimer ton compte à tout moment.' },
  { q: 'Comment payer ?', a: 'Par Mobile Money (MTN, Moov) ou par carte bancaire. Les prix sont affichés en euros et en francs CFA.' },
  { q: 'Puis-je venir me faire initier au Bénin ?', a: 'Oui. Des sessions d\'initiation sont organisées en forêt, avec une préparation avant le départ et un suivi après le retour. Les places sont limitées.' },
  { q: 'Et si ma situation concerne la santé ?', a: 'Consulte d\'abord un médecin : c\'est indispensable. Ifá peut éclairer et accompagner, jamais remplacer un soin médical.' },
  { q: 'Qui est derrière cette plateforme ?', a: 'Un prêtre d\'Ifá initié, au Bénin. Sa lignée, sa formation et son temple sont présentés sur la page À propos.' },
];

export const ARTICLE_CATEGORIES: Record<string, string> = {
  'comprendre-ifa': 'Comprendre Ifá',
  arnaques: 'Se protéger des arnaques',
  vodoun: 'Vodoun',
  astrologie: 'Astrologie',
  diaspora: 'Diaspora',
};

export const frDate = (d: string | Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat('fr-FR', { ...opts, timeZone: 'Africa/Porto-Novo' }).format(new Date(d));
