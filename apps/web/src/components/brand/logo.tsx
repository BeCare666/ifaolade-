import { cn } from '@/lib/cn';

/*
 * Logo Ifaôladé (REFONTE_DESIGN §2). SVG pur, aucune image.
 * Le sceau : couronne d'ọpọ́n à 16 encoches (les 16 Méjì), un point osùn au sommet,
 * et au centre les deux jambes d'Ogbè Méjì (8 marques simples : la lumière, le premier Odu).
 * Aucune représentation de divinité, aucun doré, aucun dégradé.
 */

const INK = 'currentColor';
const OSUN = '#9E3B26';

export function Seal({ size = 40, className, inverse = false, title }: { size?: number; className?: string; inverse?: boolean; title?: string }) {
  const notches = Array.from({ length: 16 }, (_, i) => i).filter((i) => i !== 0);
  const ink = inverse ? '#FAF8F4' : INK;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={cn('shrink-0', className)} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <circle cx="50" cy="50" r="47" fill="none" stroke={ink} strokeWidth="2.4" />
      <circle cx="50" cy="50" r="35.5" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.55" />
      {notches.map((i) => {
        const a = (i * Math.PI * 2) / 16 - Math.PI / 2;
        const cx = 50 + Math.cos(a) * 41.2;
        const cy = 50 + Math.sin(a) * 41.2;
        const deg = (i * 360) / 16;
        return <rect key={i} x={cx - 2.1} y={cy - 2.1} width="4.2" height="4.2" fill={ink} transform={`rotate(${deg + 45} ${cx} ${cy})`} />;
      })}
      <circle cx="50" cy="8.8" r="4.4" fill={OSUN} />
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <line x1="41" x2="41" y1={29 + row * 12} y2={35.5 + row * 12} stroke={ink} strokeWidth="3.4" strokeLinecap="round" />
          <line x1="59" x2="59" y1={29 + row * 12} y2={35.5 + row * 12} stroke={ink} strokeWidth="3.4" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/** Variantes : full (sceau + nom + signature), compact (sceau + nom), seal (sceau seul). */
export function Logo({ variant = 'compact', inverse = false, className, size = 'md' }: {
  variant?: 'full' | 'compact' | 'seal'; inverse?: boolean; className?: string; size?: 'sm' | 'md' | 'lg';
}) {
  const s = { sm: { seal: 30, name: 'text-[21px]', tag: 'text-[8px]' }, md: { seal: 38, name: 'text-[26px]', tag: 'text-[8.5px]' }, lg: { seal: 56, name: 'text-[38px]', tag: 'text-[10px]' } }[size];
  if (variant === 'seal') return <Seal size={s.seal} inverse={inverse} className={cn(inverse ? '' : 'text-primary', className)} title="Ifaôladé" />;
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Seal size={s.seal} inverse={inverse} className={inverse ? '' : 'text-primary'} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display font-semibold tracking-[0.01em]', s.name, inverse ? 'text-kaolin' : 'text-text')}>Ifaôladé</span>
        {variant === 'full' && (
          <span className={cn('mt-1.5 font-medium uppercase tracking-[0.32em]', s.tag, inverse ? 'text-kaolin/60' : 'text-text-faint')}>Ifá · Ọ̀rúnmìlà</span>
        )}
      </span>
    </span>
  );
}
