import { allOdu } from '@ona/core';
import type { MetadataRoute } from 'next';
import { LANGS, lp } from '@/i18n';
import { apiGet } from '@/lib/api';
import type { ArticleBrief, EventItem, Program } from '@/lib/types';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ifaolade.com';
export const revalidate = 3600;

const STATIC = [
  ['/', 1], ['/connais-toi', 0.9], ['/consultations', 0.9], ['/protocole', 0.7], ['/charte', 0.7], ['/odu', 0.8], ['/mon-odu', 0.8],
  ['/astrologie', 0.6], ['/initiation', 0.8], ['/circuits', 0.7], ['/evenements', 0.7], ['/enseignements', 0.7],
  ['/a-propos', 0.6], ['/faq', 0.5], ['/contact', 0.4], ['/mentions-legales', 0.1], ['/cgv', 0.1], ['/confidentialite', 0.1], ['/cookies', 0.1],
] as const;

/** Chaque page en français, anglais et yoruba, avec les variantes hreflang (étape 6.4). */
function entry(path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LANGS.map((l) => [l, `${SITE}${lp(l, path)}`]));
  return LANGS.map((l) => ({ url: `${SITE}${lp(l, path)}`, priority, lastModified, alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, events, articles] = await Promise.all([apiGet<Program[]>('/programs'), apiGet<EventItem[]>('/events'), apiGet<ArticleBrief[]>('/articles')]);
  return [
    ...STATIC.flatMap(([p, pr]) => entry(p, pr)),
    ...allOdu().flatMap((o) => entry(`/odu/${o.slug}`, o.isMeji ? 0.6 : 0.4)),
    ...(programs ?? []).flatMap((p) => entry(`/programmes/${p.slug}`, 0.7)),
    ...(events ?? []).flatMap((e) => entry(`/evenements/${e.slug}`, 0.6)),
    ...(articles ?? []).flatMap((a) => entry(`/enseignements/${a.slug}`, 0.6, a.publishedAt ?? undefined)),
  ];
}
