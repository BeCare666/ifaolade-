import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

/** Polices proposées dans Admin › Paramètres (plan §6.3 : une seule famille, modifiable comme sur edoto). */
export const ALLOWED_FONTS = ['Inter', 'Manrope', 'DM Sans', 'Work Sans', 'IBM Plex Sans', 'Source Sans 3', 'Nunito Sans', 'Poppins'];

interface Def { label: string; default: number | string; validate: (v: unknown) => boolean; hint: string; public?: boolean }

/** Étape 2.1 : paramètres modifiables. La valeur d'environnement sert de valeur par défaut. */
export const SETTINGS: Record<string, Def> = {
  'site.font': {
    label: 'Police du site', default: 'Inter', public: true,
    validate: (v) => typeof v === 'string' && ALLOWED_FONTS.includes(v),
    hint: `Une parmi : ${ALLOWED_FONTS.join(', ')}. Doit afficher correctement les diacritiques yoruba.`,
  },
  'money.eurToXof': {
    label: 'Taux EUR → FCFA', default: Number(process.env.EUR_TO_XOF || 655.957),
    validate: (v) => typeof v === 'number' && v > 100 && v < 2000, hint: 'Parité fixe : 655,957.',
  },
  'booking.depositRate': {
    label: 'Acompte des voyages (part du total)', default: Number(process.env.BOOKING_DEPOSIT_RATE || 0.3),
    validate: (v) => typeof v === 'number' && v > 0 && v <= 1, hint: 'Entre 0 et 1, ex. 0,3 pour 30 %.',
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
    return Object.entries(SETTINGS).map(([key, d]) => ({ key, label: d.label, hint: d.hint, value: map[key], default: d.default }));
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
