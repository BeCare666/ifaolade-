import { useId } from 'react';
import { cn } from '@/lib/cn';

/*
 * Motifs adire (REFONTE_DESIGN §1.2) : tissu yoruba teint à l'indigo, motifs réservés (eleko) faits de
 * carreaux, de points et de zigzags. Dessinés à la main en SVG, toujours très discrets (4 à 8 % d'opacité).
 */

type Kind = 'grid' | 'dots' | 'zigzag';

export function Adire({ kind = 'grid', className, opacity = 0.07, color = '#FAF8F4' }: { kind?: Kind; className?: string; opacity?: number; color?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} style={{ opacity }}>
      <defs>
        {kind === 'grid' && (
          <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
            <rect x="0.75" y="0.75" width="54.5" height="54.5" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="28" cy="28" r="9" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="28" cy="28" r="2.4" fill={color} />
            <path d="M0 0 L10 10 M56 0 L46 10 M0 56 L10 46 M56 56 L46 46" stroke={color} strokeWidth="1.5" />
          </pattern>
        )}
        {kind === 'dots' && (
          <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="5.5" cy="5.5" r="1.8" fill={color} />
            <circle cx="16.5" cy="16.5" r="1.8" fill={color} />
          </pattern>
        )}
        {kind === 'zigzag' && (
          <pattern id={id} width="36" height="18" patternUnits="userSpaceOnUse">
            <path d="M0 13 L9 5 L18 13 L27 5 L36 13" fill="none" stroke={color} strokeWidth="1.5" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Frise de marques d'Odu (I et II) servant de séparateur. */
export function OduRule({ className }: { className?: string }) {
  const marks = [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1];
  return (
    <span aria-hidden className={cn('flex items-center gap-2.5', className)}>
      {marks.map((m, i) => (
        <span key={i} className="flex gap-[3px]">
          {Array.from({ length: m }, (_, k) => <span key={k} className="h-3 w-[2px] rounded-full bg-current" />)}
        </span>
      ))}
    </span>
  );
}
