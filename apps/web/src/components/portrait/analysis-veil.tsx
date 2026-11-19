'use client';

import type { Mark } from '@ona/core';
import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Adire } from '@/components/brand/patterns';
import { cn } from '@/lib/cn';

/*
 * Vue d'analyse du portrait (REFONTE §11 bis, étape R12).
 * Plein écran au-dessus de toute la plateforme, kaolin lumineux, motif adire en filigrane.
 * Le sceau d'ọpọ́n s'allume encoche par encoche, puis les 8 marques de la signature se tracent.
 * Chaque ligne cochée correspond à un calcul réellement fait par le moteur : rien n'est décoratif.
 */

const OSUN = '#9E3B26';
const INK = '#1F2A44';

export function AnalysisVeil({ name, right, left, steps, title, live }: {
  name: string; right: Mark[]; left: Mark[]; steps: string[]; title: string; live: string;
}) {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(0); // encoches allumées (0 à 16)
  const [done, setDone] = useState(0); // étapes cochées
  const total = 6000; // durée minimale (le parent attend aussi ce délai)

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t1 = setInterval(() => setLit((n) => Math.min(16, n + 1)), reduce ? 60 : 210);
    const per = (total - 600) / steps.length;
    const t2 = setInterval(() => setDone((n) => Math.min(steps.length, n + 1)), reduce ? 200 : per);
    return () => { clearInterval(t1); clearInterval(t2); document.body.style.overflow = prev; };
  }, [steps.length, reduce]);

  const marks: { x: number; y: number; order: number }[] = [];
  const legs: [Mark[], number, number][] = [[right, 62, 0], [left, 38, 4]];
  for (const [leg, cx, offset] of legs) {
    leg.forEach((m, row) => {
      const y = 33 + row * 9.5;
      if (m === 1) marks.push({ x: cx, y, order: offset + row });
      else marks.push({ x: cx - 3.2, y, order: offset + row }, { x: cx + 3.2, y, order: offset + row });
    });
  }

  return (
    <motion.div
      role="status" aria-live="polite" aria-label={live}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-kaolin px-6 text-center"
    >
      <Adire kind="grid" color={INK} opacity={0.045} />
      {/* Halo de lumière : un simple disque clair, sans dégradé */}
      <motion.span aria-hidden className="absolute h-[560px] w-[560px] rounded-full bg-white"
        animate={reduce ? undefined : { scale: [0.94, 1.04, 0.94], opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative">
        <svg viewBox="0 0 100 100" className="h-[260px] w-[260px] sm:h-[300px] sm:w-[300px]" aria-hidden>
          <circle cx="50" cy="50" r="47" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.9" />
          <circle cx="50" cy="50" r="36" fill="none" stroke={INK} strokeWidth="0.6" opacity="0.35" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i * Math.PI * 2) / 16 - Math.PI / 2;
            const x = 50 + Math.cos(a) * 41.5;
            const y = 50 + Math.sin(a) * 41.5;
            const on = i < lit;
            return i === 0
              ? <motion.circle key={i} cx={x} cy={y} r="3.4" fill={OSUN} animate={{ opacity: on ? 1 : 0.25 }} />
              : <motion.rect key={i} x={x - 2} y={y - 2} width="4" height="4" fill={INK} transform={`rotate(${i * 22.5 + 45} ${x} ${y})`}
                  animate={{ opacity: on ? 1 : 0.15 }} transition={{ duration: 0.3 }} />;
          })}
          {/* Ọ̀pẹ̀lẹ̀ : les marques de la signature se tracent quand le sceau est complet */}
          {marks.map((m, i) => (
            <motion.line key={i} x1={m.x} x2={m.x} y1={m.y} y2={m.y + 5.2} stroke={INK} strokeWidth="2.2" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={lit >= 16 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : m.order * 0.12 }} />
          ))}
        </svg>
      </div>

      <p className="relative mt-8 text-[11px] font-medium uppercase tracking-[0.3em] text-text-faint">{live}</p>
      <h2 className="font-display relative mt-3 text-[34px] font-semibold leading-tight text-text sm:text-[44px]">{title.replace('{name}', name)}</h2>

      <ul className="relative mt-8 w-full max-w-sm space-y-2.5 text-left">
        {steps.map((s, i) => {
          const ok = i < done;
          const now = i === done;
          return (
            <li key={s} className={cn('flex items-center gap-3 text-[14px] transition-colors duration-300', ok ? 'text-text' : now ? 'text-text-muted' : 'text-text-faint/70')}>
              <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300', ok ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong')}>
                {ok ? <Check size={13} /> : now ? <motion.span className="h-1.5 w-1.5 rounded-full bg-osun" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} /> : null}
              </span>
              {s}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
