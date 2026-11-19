import {
  BookOpen, CircleDot, Gift, Grid3x3, Hand, HandHeart, HelpCircle, Landmark, ListChecks, Mail, Map, MoonStar,
  ShieldCheck, Sparkles, Ticket, Trees, Video, type LucideIcon,
} from 'lucide-react';
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

/* ---------- Refonte §3 : méga-menus avec icônes ---------- */

export type MenuItem = { href: string; icon: LucideIcon; title: string; text: string };
export type MenuGroup = {
  key: 'consult' | 'know' | 'odu' | 'benin' | 'house';
  title: string; icon: LucideIcon; image: string; items: MenuItem[];
  featured: { title: string; text: string; cta: string; href: string };
};

export function menuGroups(d: Dict): MenuGroup[] {
  const it = (href: string, icon: LucideIcon, k: keyof Dict['menu']['items']): MenuItem => ({ href, icon, title: d.menu.items[k][0], text: d.menu.items[k][1] });
  const f = (k: keyof Dict['menu']['featured'], href: string) => ({ title: d.menu.featured[k][0], text: d.menu.featured[k][1], cta: d.menu.featured[k][2], href });
  return [
    {
      key: 'consult', title: d.menu.groups.consult, icon: Gift, image: 'menu.consulter',
      items: [
        it('/consultations/reserver?offre=FIRST_FREE', Gift, 'free'),
        it('/consultations/reserver?offre=VIDEO', Video, 'video'),
        it('/consultations/reserver?offre=ASSISTED', HandHeart, 'assisted'),
        it('/protocole', ListChecks, 'protocol'),
        it('/charte', ShieldCheck, 'charter'),
      ],
      featured: f('consult', '/consultations/reserver?offre=FIRST_FREE'),
    },
    {
      key: 'know', title: d.menu.groups.know, icon: Sparkles, image: 'menu.connais',
      items: [it('/connais-toi', Sparkles, 'portrait'), it('/astrologie', MoonStar, 'astro')],
      featured: f('know', '/connais-toi'),
    },
    {
      key: 'odu', title: d.menu.groups.odu, icon: Grid3x3, image: 'menu.odu',
      items: [it('/odu', Grid3x3, 'odus'), it('/mon-odu', Hand, 'myOdu'), it('/odu?type=meji', CircleDot, 'meji')],
      featured: f('odu', '/mon-odu'),
    },
    {
      key: 'benin', title: d.menu.groups.benin, icon: Trees, image: 'menu.benin',
      items: [it('/initiation', Trees, 'initiation'), it('/circuits', Map, 'circuits'), it('/evenements', Ticket, 'events')],
      featured: f('benin', '/initiation'),
    },
    {
      key: 'house', title: d.menu.groups.house, icon: Landmark, image: 'menu.maison',
      items: [it('/a-propos', Landmark, 'about'), it('/enseignements', BookOpen, 'teach'), it('/faq', HelpCircle, 'faq'), it('/contact', Mail, 'contact')],
      featured: f('house', '/charte'),
    },
  ];
}
