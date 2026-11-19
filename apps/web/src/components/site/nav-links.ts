import type { Dict } from '@/i18n';

/** Menus de la vitrine, libellés selon la langue (chemins sans préfixe). */
export const mainNav = (d: Dict) => [
  { href: '/consultations', label: d.nav.consultations },
  { href: '/protocole', label: d.nav.protocole },
  { href: '/odu', label: d.nav.odu },
  { href: '/mon-odu', label: d.nav.monOdu },
  { href: '/astrologie', label: d.nav.astrologie },
  { href: '/initiation', label: d.nav.initiation },
  { href: '/enseignements', label: d.nav.enseignements },
];

export const secondaryNav = (d: Dict) => [
  { href: '/circuits', label: d.nav.circuits },
  { href: '/evenements', label: d.nav.evenements },
  { href: '/charte', label: d.nav.charte },
  { href: '/a-propos', label: d.nav.apropos },
  { href: '/faq', label: d.nav.faq },
  { href: '/contact', label: d.nav.contact },
];

export const legalNav = (d: Dict) => [
  { href: '/mentions-legales', label: d.nav.mentions },
  { href: '/cgv', label: d.nav.cgv },
  { href: '/confidentialite', label: d.nav.confidentialite },
  { href: '/cookies', label: d.nav.cookies },
];
