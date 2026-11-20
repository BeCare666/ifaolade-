'use client';

import { CalendarHeart, Fingerprint, ScanSearch, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Adire } from '@/components/brand/patterns';
import { JogbeIcon } from '@/components/site/site-bottom-nav';
import { splitPath } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/cn';

const KEY = 'ifaolade:welcome-last';
/** R18 : la fenêtre revient toutes les 5 minutes de navigation sur la vitrine. */
const EVERY_MS = 5 * 60 * 1000;
/** Pages où la fenêtre gênerait un parcours en cours (REFONTE §11 quater, point 3). */
const SKIP = ['/connais-toi', '/mon-odu', '/connexion', '/inscription', '/console', '/verifier-email', '/mot-de-passe-oublie', '/reinitialiser', '/paiement'];

/**
 * Fenêtre d'accueil (étapes R14 et R18) : un demi-cercle translucide monte du bas avec quatre grands
 * boutons disposés sur l'arc. À la première visite, puis toutes les 5 minutes (onglet visible).
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
    const last = () => { try { return Number(localStorage.getItem(KEY) || 0); } catch { return Date.now(); } };
    const due = () => document.visibilityState === 'visible' && Date.now() - last() >= EVERY_MS;
    const show = () => { setOpen(true); try { localStorage.setItem(KEY, String(Date.now())); } catch { /* rien */ } };
    const first = setTimeout(() => { if (due()) show(); }, 700);
    const every = setInterval(() => { if (due()) show(); }, 20_000);
    return () => { clearTimeout(first); clearInterval(every); };
  }, [path]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* rien */ }
  };

  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Angles sur le demi-cercle, de gauche à droite ; la consultation et « J'ai déjà mon Odu » au sommet.
  const at = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { left: `${50 + 39 * Math.cos(a)}%`, bottom: `${27 + 50 * Math.sin(a)}%` };
  };
  const items = [
    { to: '/connais-toi', label: w.know, icon: <Fingerprint size={28} strokeWidth={1.4} />, style: at(164), accent: false },
    { to: '/consultations/reserver?offre=FIRST_FREE', label: w.consult, sub: w.free, icon: <CalendarHeart size={28} strokeWidth={1.4} />, style: at(116), accent: true },
    { to: '/mon-odu', label: w.mine, icon: <ScanSearch size={28} strokeWidth={1.4} />, style: at(64), accent: false },
    { to: '/odu', label: w.odu, icon: <JogbeIcon size={30} />, style: at(16), accent: false },
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
            <div className="relative h-[clamp(330px,88vw,420px)] overflow-hidden rounded-t-[999px] border border-b-0 border-kaolin/20 bg-night/70 text-kaolin backdrop-blur-xl">
              <Adire kind="zigzag" opacity={0.07} />
              {/* Couronne d'ọpọ́n : le demi-cercle intérieur sur lequel reposent les boutons */}
              <div aria-hidden className="absolute inset-x-[9%] bottom-0 top-[16%] rounded-t-[999px] border border-dashed border-kaolin/15" />
              {items.map((it, i) => (
                <motion.div
                  key={it.to}
                  className="absolute -translate-x-1/2 translate-y-1/2" style={it.style}
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: reduce ? 0 : 0.18 + i * 0.08, duration: 0.3 }}
                >
                  <Link ref={i === 0 ? first : undefined} href={href(it.to)} onClick={close} className="group flex w-[96px] flex-col items-center gap-2 text-center sm:w-[140px]">
                    <span className={cn(
                      'grid place-items-center rounded-full ring-4 transition-transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1',
                      it.accent ? 'h-[64px] w-[64px] bg-osun text-kaolin ring-osun/25 sm:h-[88px] sm:w-[88px]' : 'h-[64px] w-[64px] bg-kaolin text-primary ring-kaolin/15 sm:h-[88px] sm:w-[88px]',
                    )}>{it.icon}</span>
                    <span className="font-display text-[16px] leading-tight sm:text-[21px]">{it.label}</span>
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
