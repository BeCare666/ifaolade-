import type { SiteImageValue } from './site-data-shared';

/**
 * Refonte §9 (étape R8) : images de départ, toutes sous licence Unsplash (usage commercial libre).
 * Une image envoyée dans Admin › Apparence › Images remplace celle-ci. Aucune ne montre une personne
 * présentée comme le prêtre : le portrait du prêtre ne peut être que sa vraie photo.
 */
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=80`;

const COWRIES = { url: u('1776164893324-19d102148b2a'), alt: 'Cauris posés sur un tissu teint à l’indigo', credit: 'Hans-Peter Traunig, Unsplash' };
const INDIGO = { url: u('1761808070289-595a9df13616'), alt: 'Tissu teint à l’indigo posé à sécher', credit: 'C Cai, Unsplash' };
const POTS = { url: u('1739742822255-1f79a1bef2a7'), alt: 'Jarres de terre cuite dans l’herbe, au soleil', credit: 'Kevin Wright, Unsplash' };
const FOREST = { url: u('1727168858488-5b09d88262dc'), alt: 'Forêt tropicale dense, bananiers dans l’ombre', credit: 'Julian Morenz, Unsplash' };
const RIVER = { url: u('1740447342649-8b68b10b42d0'), alt: 'Rivière qui serpente dans la forêt, vue du ciel', credit: 'Ato Aikins, Unsplash' };
const LAKE = { url: u('1761998849345-7757a8c3b818'), alt: 'Village au bord de l’eau, au pied de la forêt', credit: 'Toza Productions, Unsplash' };
const MARKET = { url: u('1753818293309-7a9829090678'), alt: 'Grand marché à ciel ouvert en Afrique de l’Ouest', credit: 'Greg Keelen, Unsplash' };
const BANANAS = { url: u('1765584830103-7cfc6d132a20'), alt: 'Régimes de bananes sur un étal de marché', credit: 'Ben Iwara, Unsplash' };
const COTONOU = { url: u('1600241005059-71de13374958'), alt: 'Cotonou vue du ciel sous un ciel d’orage', credit: 'Yanick Folly, Unsplash' };
const LAGOON = { url: u('1692703272747-6f81cd557251'), alt: 'Soleil couchant sur une lagune', credit: 'Quade du Toit, Unsplash' };
const PALMS = { url: u('1701116422804-e3ea06beb150'), alt: 'Palmiers au bord de l’eau au crépuscule', credit: 'Carolina Nichitin, Unsplash' };

export const DEFAULT_IMAGES: Record<string, SiteImageValue> = {
  'home.hero': COWRIES,
  'home.benin.1': FOREST,
  'home.benin.2': BANANAS,
  'menu.consulter': COWRIES,
  'menu.connais': LAGOON,
  'menu.odu': INDIGO,
  'menu.benin': LAKE,
  'menu.maison': POTS,
  'about.main': POTS,
  'about.opon': COWRIES,
  'about.temple': RIVER,
  'initiation.1': LAKE,
  'initiation.2': FOREST,
  'initiation.3': POTS,
  'auth.side': PALMS,
  'og.default': COTONOU,
};

export const DEFAULT_MARKET = MARKET;
