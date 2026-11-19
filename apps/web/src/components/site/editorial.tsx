'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

/** Apparition douce au défilement (0,9 s, une seule fois), plan §6.5. */
export function Reveal({ children, delay = 0, y = 24, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Cadre photo : coins 28 px, zoom lent au survol (1,6 s). */
export function PhotoFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('group/photo relative overflow-hidden rounded-[var(--radius-photo)] bg-bg-subtle', className)}>{children}</div>;
}
export const photoClass = 'object-cover transition-transform duration-[1600ms] ease-out group-hover/photo:scale-[1.04]';

export function SectionIntro({
  overline, title, text, align = 'left', className,
}: { overline?: string; title: React.ReactNode; text?: React.ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <Reveal className={cn(align === 'center' && 'mx-auto text-center', 'max-w-3xl', className)}>
      {overline && <p className="text-overline">{overline}</p>}
      <h2 className="text-section mt-4 text-text">{title}</h2>
      {text && <p className={cn('text-body mt-6 max-w-xl', align === 'center' && 'mx-auto')}>{text}</p>}
    </Reveal>
  );
}

/** Ligne numérotée « 01 / 02 / 03 » avec filet fin au-dessus. */
export function NumberedRow({
  index, icon: Icon, title, text,
}: { index: number; icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string; text: string }) {
  return (
    <Reveal delay={index * 0.06} y={18}>
      <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 border-t border-border py-9">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-text-muted transition-colors duration-500 group-hover:border-accent group-hover:text-accent">
          {Icon ? <Icon size={19} strokeWidth={1.5} /> : <span className="text-[13px] tabular-nums">{index}</span>}
        </span>
        <div>
          <p className="text-[12px] font-medium tracking-[0.2em] text-text-faint tabular-nums">{String(index).padStart(2, '0')}</p>
          <h3 className="text-card-title mt-1.5 text-text">{title}</h3>
          <p className="mt-3 max-w-md text-[15px] leading-[1.75] text-text-muted">{text}</p>
        </div>
      </div>
    </Reveal>
  );
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8', className)}>{children}</div>;
}
