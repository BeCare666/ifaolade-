'use client';

import { ArrowRight, ChevronDown, Gift, LayoutDashboard, LogIn, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { Adire } from '@/components/brand/patterns';
import { SocialLinks } from '@/components/brand/social-icons';
import { UserAvatar } from '@/components/ui/user-avatar';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { LangSwitcher } from './header';
import { legalNav, menuGroups } from './nav-links';

/**
 * Menu mobile (REFONTE §4) : plein écran sur téléphone, 420 px sur tablette. Groupes en accordéon avec icônes,
 * deux actions en tuiles, langues, réseaux sociaux et liens légaux. Se ferme au glissement vers la droite.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { d, href } = useI18n();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>('consult');
  const groups = menuGroups(d);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', esc); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-night/50" onClick={onClose} />
          <motion.aside
            role="dialog" aria-modal="true" aria-label={d.nav.menu}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.6 }}
            onDragEnd={(_, info) => { if (info.offset.x > 110 || info.velocity.x > 600) onClose(); }}
            className="fixed inset-y-0 right-0 z-[95] flex w-full flex-col bg-bg sm:w-[420px] sm:border-l sm:border-border"
          >
            {/* En-tête */}
            <div className="relative overflow-hidden bg-night px-5 pb-5 pt-4 text-kaolin">
              <Adire kind="grid" opacity={0.07} />
              <div className="relative flex items-center justify-between">
                <Logo variant="full" size="sm" inverse />
                <button onClick={onClose} aria-label={d.nav.closeMenu} className="grid h-10 w-10 place-items-center rounded-full border border-kaolin/25 transition-colors hover:bg-kaolin/10"><X size={18} /></button>
              </div>
              {user ? (
                <Link href="/espace" onClick={onClose} className="relative mt-5 flex items-center gap-3 rounded-[var(--radius-lg)] border border-kaolin/15 bg-kaolin/5 p-3">
                  <UserAvatar name={`${user.firstName} ${user.lastName ?? ''}`} src={user.avatarUrl} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="font-display block truncate text-[19px] font-semibold">{tpl(d.menu.hello, { name: user.firstName })}</span>
                    <span className="block text-[12px] text-kaolin/65">{d.menu.mySpace}</span>
                  </span>
                  <LayoutDashboard size={18} className="text-kaolin/70" />
                </Link>
              ) : (
                <Link href={href('/connexion')} onClick={onClose} className="relative mt-5 flex items-center justify-center gap-2 rounded-full border border-kaolin/25 py-2.5 text-[14px]">
                  <LogIn size={15} /> {d.menu.login}
                </Link>
              )}
            </div>

            <nav className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-6 pt-5">
              {/* Actions principales */}
              <div className="grid grid-cols-2 gap-3">
                <Link href={href('/consultations/reserver?offre=FIRST_FREE')} onClick={onClose} className="relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] bg-osun p-4 text-kaolin">
                  <Gift size={20} strokeWidth={1.6} />
                  <span className="mt-6 text-[14px] font-medium leading-tight">{d.menu.offerCta}</span>
                </Link>
                <Link href={href('/connais-toi')} onClick={onClose} className="flex flex-col justify-between rounded-[var(--radius-lg)] bg-sand p-4 text-text">
                  <Sparkles size={20} strokeWidth={1.6} className="text-primary" />
                  <span className="mt-6 text-[14px] font-medium leading-tight">{d.menu.items.portrait[0]}</span>
                </Link>
              </div>

              {/* Groupes */}
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {groups.map((g) => {
                  const isOpen = expanded === g.key;
                  return (
                    <li key={g.key}>
                      <button type="button" onClick={() => setExpanded(isOpen ? null : g.key)} aria-expanded={isOpen} className="flex w-full items-center gap-3.5 py-4 text-left">
                        <span className={cn('grid h-10 w-10 place-items-center rounded-xl transition-colors', isOpen ? 'bg-primary text-primary-foreground' : 'bg-primary-soft text-primary')}><g.icon size={18} strokeWidth={1.6} /></span>
                        <span className="font-display flex-1 text-[21px] font-semibold text-text">{g.title}</span>
                        <ChevronDown size={18} className={cn('text-text-faint transition-transform duration-200', isOpen && 'rotate-180')} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                            {g.items.map((it) => (
                              <li key={it.href}>
                                <Link href={href(it.href)} onClick={onClose} className="flex items-center gap-3.5 rounded-[var(--radius-md)] py-2.5 pl-1.5 pr-2 transition-colors active:bg-bg-subtle">
                                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-text-muted"><it.icon size={16} strokeWidth={1.6} /></span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[15px] text-text">{it.title}</span>
                                    <span className="block truncate text-[12px] text-text-faint">{it.text}</span>
                                  </span>
                                  <ArrowRight size={14} className="text-text-faint" />
                                </Link>
                              </li>
                            ))}
                            <li className="h-3" />
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              <p className="text-overline mt-7">{d.nav.language}</p>
              <div className="mt-3"><LangSwitcher compact /></div>

              <p className="text-overline mt-7">{d.menu.follow}</p>
              <SocialLinks className="mt-3" />
            </nav>

            {/* Pied */}
            <div className="border-t border-border bg-bg-subtle px-5 py-4">
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-text-faint">
                {legalNav(d).map((l) => <li key={l.href}><Link href={href(l.href)} onClick={onClose} className="hover:text-text">{l.label}</Link></li>)}
              </ul>
              <p className="mt-2 text-[11px] text-text-faint">© {new Date().getFullYear()} Ifaôladé · {d.footer.promise}</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
