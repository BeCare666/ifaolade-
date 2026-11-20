import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

/** Polices proposées dans Admin › Paramètres (plan §6.3 : une seule famille, modifiable comme sur edoto). */
export const ALLOWED_FONTS = ['Inter', 'Manrope', 'DM Sans', 'Work Sans', 'IBM Plex Sans', 'Source Sans 3', 'Nunito Sans', 'Poppins'];

interface Def { label: string; default: number | string; validate: (v: unknown) => boolean; hint: string; public?: boolean; type?: 'number' | 'string' | 'font' }

const optional = (re: RegExp) => (v: unknown) => typeof v === 'string' && (v === '' || (v.length <= 300 && re.test(v)));
const social = (label: string, host: string): Def => ({
  label, default: '', public: true, type: 'string',
  validate: optional(new RegExp(`^https://([a-z0-9-]+\\.)*${host.replace(/\./g, '\\.')}/`, 'i')),
  hint: `Adresse complète commençant par https://${host}/ , ou vide pour masquer l'icône.`,
});

/** Étape 2.1 : paramètres modifiables. La valeur d'environnement sert de valeur par défaut. */
export const SETTINGS: Record<string, Def> = {
  'site.font': {
    label: 'Police du site', default: 'Inter', public: true, type: 'font',
    validate: (v) => typeof v === 'string' && ALLOWED_FONTS.includes(v),
    hint: `Une parmi : ${ALLOWED_FONTS.join(', ')}. Doit afficher correctement les diacritiques yoruba.`,
  },
  'money.eurToXof': {
    label: 'Taux EUR → FCFA', default: Number(process.env.EUR_TO_XOF || 655.957),
    validate: (v) => typeof v === 'number' && v > 100 && v < 2000, hint: 'Parité fixe : 655,957.',
  },
  // Créneaux : délai minimum entre maintenant et le début d'un créneau réservable (demande du 2026-11-20).
  'booking.minLeadHours': {
    label: 'Délai minimum avant un créneau (heures)', default: Number(process.env.BOOKING_MIN_LEAD_HOURS || 24), public: true,
    validate: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 168,
    hint: 'Un créneau ne peut plus être réservé s’il commence dans moins de ce délai. Entier de 0 à 168, ex. 24.',
  },
  'booking.depositRate': {
    label: 'Acompte des voyages (part du total)', default: Number(process.env.BOOKING_DEPOSIT_RATE || 0.3),
    validate: (v) => typeof v === 'number' && v > 0 && v <= 1, hint: 'Entre 0 et 1, ex. 0,3 pour 30 %.',
  },
  // Refonte §8.3 : réseaux sociaux et contacts. Une icône n'apparaît sur le site que si le lien est renseigné.
  'social.facebook': social('Facebook', 'facebook.com'),
  'social.instagram': social('Instagram', 'instagram.com'),
  'social.youtube': social('YouTube', 'youtube.com'),
  'social.tiktok': social('TikTok', 'tiktok.com'),
  'social.x': social('X (Twitter)', 'x.com'),
  'contact.whatsapp': {
    label: 'WhatsApp', default: '', public: true, type: 'string',
    validate: optional(/^\+\d{8,15}$/), hint: 'Numéro international sans espace, ex. +22990000000, ou vide.',
  },
  'contact.email': {
    label: 'Email de contact public', default: '', public: true, type: 'string',
    validate: optional(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), hint: 'Adresse affichée sur le site, ou vide.',
  },
  'contact.place': {
    label: 'Lieu affiché', default: 'Bénin', public: true, type: 'string',
    validate: (v) => typeof v === 'string' && v.length <= 80, hint: '80 caractères au plus, ex. « Ouidah, Bénin ».',
  },
};

@Injectable()
export class SettingsService {
  private cache: { at: number; map: Record<string, unknown> } | null = null;
  constructor(private prisma: PrismaService) {}

  private async load() {
    if (this.cache && Date.now() - this.cache.at < 60_000) return this.cache.map;
    const rows = await this.prisma.setting.findMany();
    const map: Record<string, unknown> = Object.fromEntries(Object.entries(SETTINGS).map(([k, d]) => [k, d.default]));
    for (const r of rows) if (SETTINGS[r.key]) map[r.key] = r.value;
    this.cache = { at: Date.now(), map };
    return map;
  }

  async get<T = number | string>(key: keyof typeof SETTINGS | string): Promise<T> {
    return (await this.load())[key] as T;
  }

  async list() {
    const map = await this.load();
    return Object.entries(SETTINGS).map(([key, d]) => ({ key, label: d.label, hint: d.hint, type: d.type ?? 'number', value: map[key], default: d.default }));
  }

  async publicValues() {
    const map = await this.load();
    return Object.fromEntries(Object.entries(SETTINGS).filter(([, d]) => d.public).map(([k]) => [k, map[k]]));
  }

  async set(key: string, value: unknown) {
    const def = SETTINGS[key];
    if (!def) throw new BadRequestException('Paramètre inconnu');
    if (!def.validate(value)) throw new BadRequestException(`Valeur invalide. ${def.hint}`);
    this.cache = null;
    return this.prisma.setting.upsert({ where: { key }, create: { key, value: value as Prisma.InputJsonValue }, update: { value: value as Prisma.InputJsonValue } });
  }
}
