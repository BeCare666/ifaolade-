'use client';

import type { Lang } from '@/i18n';
import { useSiteData } from '@/lib/site-data';
import { Photo } from './blocks';

/** Photo dont l'image se choisit dans Admin › Apparence › Images (REFONTE §8.1). Sans image : le cadre « Photo à fournir ». */
export function SitePhoto({ slot, alt, expected, className, sizes, priority, lang }: {
  slot: string; alt: string; expected: string; className?: string; sizes?: string; priority?: boolean; lang?: Lang;
}) {
  const img = useSiteData().images[slot];
  return <Photo src={img?.url} alt={img?.alt || alt} expected={expected} className={className} sizes={sizes} priority={priority} lang={lang} />;
}
