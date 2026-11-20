'use client';

import { ArrowRight, Fingerprint, Gift, Home, UserRound, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Adire } from '@/components/brand/patterns';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { UserAvatar } from '@/components/ui/user-avatar';
import { splitPath } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';

/** Signe Jɔ̀gbɛ̀ (Gbè Méji, Ogbè Méjì) : deux jambes de quatre marques simples, l'icône des Odu. */
export function JogbeIcon({ size = 21, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
      {[0, 1, 2, 3].map((r) => [7.5, 16.5].map((x) => (
        <rect key={`${r}-${x}`} x={x - 1} y={3 + r * 5} width="2" height="3.4" rx="1" fill="currentColor" />
      )))}
    </svg>
  );
}

/**
 * Barre basse mobile de la vitrine : visible sur TOUTES les pages de la vitrine sous 1024 px.
 * Au centre, la consultation offerte. Le bouton « Odu » ouvre un panneau : Voir les Odu / Vérifier mon Odu (R19).
 */
export function SiteBottomNav() {
  const { d, href } = useI18n();
  const { user } = useAuth();
  const { path } = splitPath(usePathname() || '/');
  const [chooser, setChooser] = useState(false);
  const b = d.menu.bottom;
  const on = (p: string) => (p === '/' ? path === '/' : path.startsWith(p));
  const oduOn = on('/odu') || on('/mon-odu');
  const cls = (active: boolean) => cn('relative flex flex-col items-center gap-1 py-2.5 text-[11px]', active ? 'text-primary' : 'text-text-muted');
  const bar = <span className="absolute top-0 h-0.5 w-8 rounded-full bg-osun" />;
  const item = (p: string, label: string, icon: React.ReactNode, to = href(p)) => (
    <Link href={to} className={cls(on(p))}>{on(p) && bar}{icon}{label}</Link>
  );

  useEffect(() => { setChooser(false); }, [path]);

  return (
    <>
      {/* Réserve la place de la barre sous le pied de page */}
      <div aria-hidden className="h-[76px] lg:hidden" />
      <nav aria-label={d.nav.main} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-5 items-end">
          {item('/', b.home, <Home size={21} strokeWidth={1.5} />)}
          <button type="button" onClick={() => setChooser(true)} aria-haspopup="dialog" aria-expanded={chooser} className={cls(oduOn)}>
            {oduOn && bar}<JogbeIcon />{b.odu}
          </button>
          <Link href={href('/consultations/reserver?offre=FIRST_FREE')} className="-mt-5 flex flex-col items-center gap-1 pb-2 text-[11px] text-text">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-osun text-kaolin shadow-[0_10px_24px_-10px_rgba(158,59,38,0.7)] ring-4 ring-surface"><Gift size={22} strokeWidth={1.6} /></span>
            {b.offer}
          </Link>
          {item('/connais-toi', b.portrait, <Fingerprint size={21} strokeWidth={1.5} />)}
          {user
            ? item('/espace', b.space, <UserAvatar name={`${user.firstName} ${user.lastName ?? ''}`} src={user.avatarUrl} size={22} className="ring-1" />, '/espace')
            : item('/connexion', b.account, <UserRound size={21} strokeWidth={1.5} />)}
        </div>
      </nav>
      <AnimatePresence>{chooser && <OduChooser onClose={() => setChooser(false)} />}</AnimatePresence>
    </>
  );
}

/** Panneau « Odu » (R19) : deux grandes cartes, Voir les Odu et Vérifier mon Odu. */
function OduChooser({ onClose }: { onClose: () => void }) {
  const { d, href } = useI18n();
  const c = d.menu.oduChooser;
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cards = [
    {
      to: '/odu', title: c.library, text: c.libraryText,
      art: (
        <div className="grid grid-cols-4 gap-1.5 opacity-90" aria-hidden>
          {[[[1, 1, 1, 1], [1, 1, 1, 1]], [[2, 2, 2, 2], [2, 2, 2, 2]], [[2, 1, 1, 2], [2, 1, 1, 2]], [[1, 2, 2, 1], [1, 2, 2, 1]]].map(([r, l], i) => (
            <OduGlyph key={i} right={r as (1 | 2)[]} left={l as (1 | 2)[]} size="xs" activeColor="#FAF8F4" label="" />
          ))}
        </div>
      ),
    },
    {
      to: '/mon-odu', title: c.mine, text: c.mineText,
      art: (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5" aria-hidden>
          {[0, 1, 2, 3].map((r) => [0, 1].map((k) => (
            <span key={`${r}-${k}`} className={cn('h-4 w-4 rounded-full', (r + k) % 3 === 0 ? 'bg-kaolin shadow-[0_0_10px_2px_rgba(250,248,244,0.45)]' : 'border border-kaolin/35')} />
          )))}
        </div>
      ),
    },
  ];

  return (
    <motion.div className="fixed inset-0 z-[85] flex items-end lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label={c.close} onClick={onClose} className="absolute inset-0 bg-night/45 backdrop-blur-[2px]" />
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="odu-chooser-title"
        initial={reduce ? false : { y: '100%' }} animate={{ y: 0 }} exit={reduce ? undefined : { y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        drag={reduce ? false : 'y'} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 500) onClose(); }}
        className="relative w-full rounded-t-[28px] bg-surface px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" aria-hidden />
        <div className="mb-4 flex items-center justify-between px-1">
          <p id="odu-chooser-title" className="font-display text-[22px] text-text">{c.title}</p>
          <button type="button" onClick={onClose} aria-label={c.close} className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-muted"><X size={16} /></button>
        </div>
        <div className="grid gap-3">
          {cards.map((card, i) => (
            <motion.div key={card.to} initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.08 + i * 0.07 }}>
              <Link href={href(card.to)} onClick={onClose}
                className="group relative flex items-center gap-4 overflow-hidden rounded-[22px] bg-night p-5 text-kaolin transition-transform active:scale-[0.99]">
                <Adire kind={i ? 'dots' : 'grid'} opacity={0.07} />
                <span className="relative grid h-20 w-20 shrink-0 place-items-center rounded-[18px] bg-primary ring-1 ring-kaolin/15">{card.art}</span>
                <span className="relative min-w-0 flex-1">
                  <span className="block font-display text-[22px] leading-tight">{card.title}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-kaolin/70">{card.text}</span>
                </span>
                <ArrowRight size={18} className="relative shrink-0 text-kaolin/70 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
