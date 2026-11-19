import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
import { Element, Modality, SIGNS, signIndexFromLongitude } from './zodiac';

export type PlanetKey =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

export const PLANETS: { key: PlanetKey; name: string; glyph: string; body: Astronomy.Body; weight: number }[] = [
  { key: 'sun', name: 'Soleil', glyph: '☉', body: Astronomy.Body.Sun, weight: 3 },
  { key: 'moon', name: 'Lune', glyph: '☽', body: Astronomy.Body.Moon, weight: 3 },
  { key: 'mercury', name: 'Mercure', glyph: '☿', body: Astronomy.Body.Mercury, weight: 1.5 },
  { key: 'venus', name: 'Vénus', glyph: '♀', body: Astronomy.Body.Venus, weight: 1.5 },
  { key: 'mars', name: 'Mars', glyph: '♂', body: Astronomy.Body.Mars, weight: 1.5 },
  { key: 'jupiter', name: 'Jupiter', glyph: '♃', body: Astronomy.Body.Jupiter, weight: 1 },
  { key: 'saturn', name: 'Saturne', glyph: '♄', body: Astronomy.Body.Saturn, weight: 1 },
  { key: 'uranus', name: 'Uranus', glyph: '♅', body: Astronomy.Body.Uranus, weight: 0.5 },
  { key: 'neptune', name: 'Neptune', glyph: '♆', body: Astronomy.Body.Neptune, weight: 0.5 },
  { key: 'pluto', name: 'Pluton', glyph: '♇', body: Astronomy.Body.Pluto, weight: 0.5 },
];

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export const ASPECTS: { type: AspectType; angle: number; orb: number; name: string; nature: 'hard' | 'soft' | 'neutral' }[] = [
  { type: 'conjunction', angle: 0, orb: 8, name: 'Conjonction', nature: 'neutral' },
  { type: 'sextile', angle: 60, orb: 5, name: 'Sextile', nature: 'soft' },
  { type: 'square', angle: 90, orb: 7, name: 'Carré', nature: 'hard' },
  { type: 'trine', angle: 120, orb: 7, name: 'Trigone', nature: 'soft' },
  { type: 'opposition', angle: 180, orb: 8, name: 'Opposition', nature: 'hard' },
];

export interface ChartInput {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string | null; // HH:mm
  timezone?: string | null; // IANA ex: Africa/Porto-Novo
  latitude?: number | null;
  longitude?: number | null;
}

export interface Point {
  longitude: number;
  sign: number;
  degreeInSign: number;
}

export interface PlanetPosition extends Point {
  key: PlanetKey;
  name: string;
  glyph: string;
  retrograde: boolean;
  house: number | null;
}

export interface Aspect {
  a: PlanetKey;
  b: PlanetKey;
  type: AspectType;
  nature: 'hard' | 'soft' | 'neutral';
  orb: number;
}

export interface NatalChart {
  utc: string;
  timeKnown: boolean;
  locationKnown: boolean;
  planets: PlanetPosition[];
  ascendant: Point | null;
  midheaven: Point | null;
  aspects: Aspect[];
  elements: Record<Element, number>;
  modalities: Record<Modality, number>;
  dominantElement: Element;
  weakestElement: Element;
}

const DEG = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;

function point(lon: number): Point {
  const l = norm(lon);
  return { longitude: l, sign: signIndexFromLongitude(l), degreeInSign: l % 30 };
}

function eclipticLongitude(body: Astronomy.Body, t: Date): number {
  const vec = Astronomy.GeoVector(body, t, true);
  return norm(Astronomy.Ecliptic(vec).elon);
}

export function toUtc(input: ChartInput): { date: Date; timeKnown: boolean } {
  const timeKnown = !!input.birthTime && /^\d{1,2}:\d{2}$/.test(input.birthTime);
  const time = timeKnown ? input.birthTime!.padStart(5, '0') : '12:00';
  let dt = DateTime.fromISO(`${input.birthDate}T${time}`, { zone: input.timezone || 'UTC' });
  if (!dt.isValid) dt = DateTime.fromISO(`${input.birthDate}T${time}`, { zone: 'UTC' });
  if (!dt.isValid) throw new Error('Date de naissance invalide');
  return { date: dt.toUTC().toJSDate(), timeKnown };
}

export function computeAngles(t: Date, latitude: number, longitude: number) {
  const jd = t.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const eps = (23.439291 - 0.0130042 * T) * DEG;
  const gast = Astronomy.SiderealTime(t);
  const ramc = norm(gast * 15 + longitude) * DEG;
  const phi = latitude * DEG;
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps));
  return { ascendant: point(asc / DEG), midheaven: point(mc / DEG) };
}

export function computeChart(input: ChartInput): NatalChart {
  const { date, timeKnown } = toUtc(input);
  const locationKnown = typeof input.latitude === 'number' && typeof input.longitude === 'number';

  let ascendant: Point | null = null;
  let midheaven: Point | null = null;
  if (timeKnown && locationKnown) {
    const a = computeAngles(date, input.latitude!, input.longitude!);
    ascendant = a.ascendant;
    midheaven = a.midheaven;
  }

  const next = new Date(date.getTime() + 86400000);
  const planets: PlanetPosition[] = PLANETS.map((p) => {
    const lon = eclipticLongitude(p.body, date);
    const lon2 = eclipticLongitude(p.body, next);
    let delta = lon2 - lon;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const pt = point(lon);
    return {
      key: p.key, name: p.name, glyph: p.glyph, ...pt,
      retrograde: p.key !== 'sun' && p.key !== 'moon' && delta < 0,
      house: ascendant ? ((pt.sign - ascendant.sign + 12) % 12) + 1 : null, // maisons signes entiers
    };
  });

  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECTS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({ a: planets[i].key, b: planets[j].key, type: asp.type, nature: asp.nature, orb: Math.round(orb * 10) / 10 });
          break;
        }
      }
    }
  }

  const elements: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  PLANETS.forEach((p, i) => {
    const s = SIGNS[planets[i].sign];
    elements[s.element] += p.weight;
    modalities[s.modality] += p.weight;
  });
  if (ascendant) {
    elements[SIGNS[ascendant.sign].element] += 3;
    modalities[SIGNS[ascendant.sign].modality] += 3;
  }
  const sorted = (Object.keys(elements) as Element[]).sort((a, b) => elements[b] - elements[a]);

  return {
    utc: date.toISOString(),
    timeKnown,
    locationKnown,
    planets,
    ascendant,
    midheaven,
    aspects,
    elements,
    modalities,
    dominantElement: sorted[0],
    weakestElement: sorted[3],
  };
}

/** Le ciel d'un instant donné (ex : « ciel du jour »). */
export function skyAt(date: Date = new Date()) {
  return PLANETS.map((p) => ({ key: p.key, name: p.name, glyph: p.glyph, ...point(eclipticLongitude(p.body, date)) }));
}

export function moonPhase(date: Date = new Date()) {
  const angle = Astronomy.MoonPhase(date); // 0 = nouvelle lune, 180 = pleine
  const names = ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'];
  return { angle, name: names[Math.round(angle / 45) % 8], illumination: (1 - Math.cos(angle * DEG)) / 2 };
}
