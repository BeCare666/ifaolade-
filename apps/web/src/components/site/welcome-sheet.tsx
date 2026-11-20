'use client';

import { CalendarHeart, Grid3x3, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Adire } from '@/components/brand/patterns';
import { splitPath } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/cn';

const KEY = 'ifaolade:welcome-seen';
/** Pages où la fenêtre gênerait un parcours en cours (REFONTE §11 quater, point 3). */
const SKIP = ['/connexion', '/inscription', '/console', '/verifier-email', '/mot-de-passe-oublie', '/reinitialiser', '/paiement'];

/**
 * Fenêtre d'accueil (étape R14) : à la première visite, un demi-cercle translucide monte du bas
 * avec trois grands boutons disposés sur l'arc. Ne s'affiche qu'une fois par navigateur.
 */
export function WelcomeSheet() {
  const { d, href } = useI18n();
  const w = d.menu.welcome;
  const { path } = splitPath(usePathname() || '/');
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (SKIP.some((p) => path.startsWith(p))) return;
    let seen = true;
    try { seen = localStorage.getItem(KEY) === '1'; } catch { /* stockage bloqué : on n'insiste pas */ }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [path]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(KEY, '1'); } catch { /* rien */ }
  };

  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const items = [
    { to: '/connais-toi', label: w.know, icon: <Sparkles size={30} strokeWidth={1.4} />, pos: 'left-[17%] bottom-[30%]', accent: false },
    { to: '/consultations/reserver?offre=FIRST_FREE', label: w.consult, sub: w.free, icon: <CalendarHeart size={32} strokeWidth={1.4} />, pos: 'left-1/2 top-[9%]', accent: true },
    { to: '/odu', label: w.odu, icon: <Grid3x3 size={30} strokeWidth={1.4} />, pos: 'left-[83%] bottom-[30%]', accent: false },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center"
          role="dialog" aria-modal="true" aria-labelledby="welcome-title"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.25 }}
        >
          <button type="button" aria-label={w.close} onClick={close} className="absolute inset-0 bg-night/35 backdrop-blur-[3px]" />
          <motion.div
            className="relative w-full max-w-[720px] px-2"
            initial={reduce ? false : { y: '100%' }} animate={{ y: 0 }} exit={reduce ? undefined : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <button type="button" onClick={close} aria-label={w.close} className="absolute -top-14 right-4 grid h-11 w-11 place-items-center rounded-full border border-kaolin/25 bg-night/60 text-kaolin backdrop-blur-md transition-colors hover:bg-night/80">
              <X size={18} />
            </button>
            <div className="relative h-[clamp(300px,62vw,380px)] overflow-hidden rounded-t-[999px] border border-b-0 border-kaolin/20 bg-night/70 text-kaolin backdrop-blur-xl">
              <Adire kind="zigzag" opacity={0.07} />
              {/* Couronne d'ọpọ́n : le demi-cercle intérieur sur lequel reposent les boutons */}
              <div aria-hidden className="absolute inset-x-[9%] bottom-0 top-[16%] rounded-t-[999px] border border-dashed border-kaolin/15" />
              {items.map((it, i) => (
                <motion.div
                  key={it.to}
                  className={cn('absolute -translate-x-1/2', it.pos)}
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: reduce ? 0 : 0.18 + i * 0.08, duration: 0.3 }}
                >
                  <Link ref={i === 0 ? first : undefined} href={href(it.to)} onClick={close} className="group flex w-[118px] flex-col items-center gap-2.5 text-center sm:w-[150px]">
                    <span className={cn(
                      'grid place-items-center rounded-full ring-4 transition-transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1',
                      it.accent ? 'h-[88px] w-[88px] bg-osun text-kaolin ring-osun/25 sm:h-[104px] sm:w-[104px]' : 'h-[76px] w-[76px] bg-kaolin text-primary ring-kaolin/15 sm:h-[92px] sm:w-[92px]',
                    )}>{it.icon}</span>
                    <span className="font-display text-[19px] leading-tight sm:text-[22px]">{it.label}</span>
                    {it.sub && <span className="-mt-1.5 text-[11px] uppercase tracking-[0.18em] text-kaolin/70">{it.sub}</span>}
                  </Link>
                </motion.div>
              ))}
              <div className="absolute inset-x-0 bottom-5 text-center">
                <p className="text-[11px] uppercase tracking-[0.22em] text-kaolin/60">{w.overline}</p>
                <p id="welcome-title" className="mt-1 font-display text-[20px] text-kaolin sm:text-[24px]">{w.title}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
