import { randomBytes } from 'crypto';

export const token = (n = 24) => randomBytes(n).toString('hex');
export const roomUrl = () => `${process.env.VIDEO_BASE_URL || 'https://meet.jit.si'}/ifaolade-${token(6)}`;
export const money = (cents: number, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(cents / 100);
export const frDate = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Porto-Novo' }).format(d) + ' (heure du Bénin)';
export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
