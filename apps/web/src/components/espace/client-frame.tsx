'use client';

import {
  CalendarPlus, ChevronDown, CreditCard, ExternalLink, FolderHeart, Home, LogOut, Menu, MessageSquareText, PanelLeftClose, PanelLeftOpen,
  PlaneTakeoff, Sparkles, Ticket, UserRound, X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo, Seal } from '@/components/brand/logo';
import { Adire } from '@/components/brand/patterns';
import { NotificationsBell } from '@/components/ui/notifications-bell';
import { Skeleton } from '@/components/ui/primitives';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useRequireAuth } from '@/lib/use-api';

type Icon = React.ComponentType<{ size?: number; strokeWidth?: number }>;
export const CLIENT_MENU: { href: string; label: string; short: string; icon: Icon; exact?: boolean }[] = [
  { href: '/espace', label: 'Accueil', short: 'Accueil', icon: Home, exact: true },
  { href: '/espace/portrait', label: 'Mon portrait', short: 'Portrait', icon: Sparkles },
  { href: '/espace/consultations', label: 'Mes consultations', short: 'Consultations', icon: MessageSquareText },
  { href: '/espace/dossier', label: 'Mon dossier spirituel', short: 'Dossier', icon: FolderHeart },
  { href: '/consultations/reserver', label: 'Réserver', short: 'Réserver', icon: CalendarPlus },
  { href: '/espace/voyages', label: 'Mes voyages', short: 'Voyages', icon: PlaneTakeoff },
  { href: '/espace/evenements', label: 'Événements', short: 'Événements', icon: Ticket },
  { href: '/espace/paiements', label: 'Paiements', short: 'Paiements', icon: CreditCard },
  { href: '/espace/profil', label: 'Profil et confidentialité', short: 'Profil', icon: UserRound },
];

/** Repli de la barre latérale mémorisé dans ce navigateur seulement (comme DashboardFrame d'edoto). */
function useCollapsed() {
  const [c, setC] = useState(false);
  useEffect(() => { try { setC(localStorage.getItem('ifaolade:espace-collapsed') === '1'); } catch { /* rien */ } }, []);
  const toggle = () => setC((v) => { try { localStorage.setItem('ifaolade:espace-collapsed', v ? '0' : '1'); } catch { /* rien */ } return !v; });
  return [c, toggle] as const;
}

const isActive = (path: string, href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));
const memberSince = (iso?: string) => (iso ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(iso)) : null);
const pageTitle = (path: string) => [...CLIENT_MENU].sort((a, b) => b.href.length - a.href.length).find((l) => isActive(path, l.href, l.exact))?.label ?? 'Mon espace';

/** Espace client premium (REFONTE §10) : barre latérale indigo nuit, carte profil avec photo, barre basse mobile. */
export function ClientFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { ready, user } = useRequireAuth(path);
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, toggle] = useCollapsed();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!ready || !user) return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;
  const name = `${user.firstName} ${user.lastName ?? ''}`.trim();
  const since = memberSince(user.createdAt);
  const signOut = () => { void logout().then(() => { window.location.href = '/'; }); };

  const nav = (compact: boolean, onNavigate?: () => void) => (
    <ul className="space-y-1 px-3">
      {CLIENT_MENU.map((l) => {
        const active = isActive(path, l.href, l.exact);
        const book = l.href === '/consultations/reserver';
        return (
          <li key={l.href}>
            <Link
              href={l.href} title={compact ? l.label : undefined} onClick={onNavigate}
              className={cn('group relative flex items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-[14px] transition-colors', compact && 'justify-center px-0',
                active ? 'bg-kaolin text-night' : book ? 'text-kaolin hover:bg-kaolin/10' : 'text-kaolin/70 hover:bg-kaolin/8 hover:text-kaolin')}
            >
              {active && !compact && <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-osun" />}
              <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors', active ? 'bg-night text-kaolin' : book ? 'bg-osun text-kaolin' : 'bg-kaolin/8')}>
                <l.icon size={17} strokeWidth={1.6} />
              </span>
              {!compact && <span className={cn(active && 'font-medium')}>{l.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const profileCard = (compact: boolean) => compact ? (
    <Link href="/espace/profil" className="mx-auto mb-5 block w-fit" title={name}><UserAvatar name={name} src={user.avatarUrl} size={44} /></Link>
  ) : (
    <Link href="/espace/profil" className="mx-4 mb-5 flex items-center gap-3 rounded-[var(--radius-lg)] border border-kaolin/12 bg-kaolin/5 p-3 transition-colors hover:bg-kaolin/10">
      <UserAvatar name={name} src={user.avatarUrl} size={46} />
      <span className="min-w-0">
        <span className="font-display block truncate text-[19px] font-semibold text-kaolin">{name}</span>
        <span className="block truncate text-[11.5px] text-kaolin/55">{since ? `Membre depuis ${since}` : user.email}</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-bg-subtle">
      {/* Barre latérale (ordinateur) */}
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden bg-night text-kaolin transition-[width] duration-300 lg:flex', collapsed ? 'w-[88px]' : 'w-[18rem]')}>
        <Adire kind="grid" opacity={0.045} />
        <div className={cn('relative flex h-[84px] shrink-0 items-center px-6', collapsed && 'justify-center px-0')}>
          <Link href="/" aria-label="Retour au site">{collapsed ? <Seal size={36} inverse /> : <Logo variant="full" size="sm" inverse />}</Link>
        </div>
        <div className="relative">{profileCard(collapsed)}</div>
        <div className="scrollbar-thin relative flex-1 overflow-y-auto pb-4">{nav(collapsed)}</div>
        <div className="relative space-y-1 border-t border-kaolin/10 p-3">
          <button onClick={toggle} className={cn('flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-kaolin/60 hover:bg-kaolin/8 hover:text-kaolin', collapsed && 'justify-center')}>
            {collapsed ? <PanelLeftOpen size={17} /> : <><PanelLeftClose size={17} /> Réduire le menu</>}
          </button>
          <button onClick={signOut} className={cn('flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-kaolin/60 hover:bg-kaolin/8 hover:text-kaolin', collapsed && 'justify-center')}>
            <LogOut size={17} />{!collapsed && 'Se déconnecter'}
          </button>
        </div>
      </aside>

      {/* En-tête */}
      <header className={cn('sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-md transition-[padding] duration-300', collapsed ? 'lg:pl-[88px]' : 'lg:pl-[18rem]')}>
        <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-3 px-4 sm:px-6 lg:h-[84px] lg:px-10">
          <Link href="/" className="lg:hidden"><Logo variant="compact" size="sm" /></Link>
          <div className="hidden min-w-0 lg:block">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-faint">Mon espace</p>
            <p className="font-display truncate text-[26px] font-semibold leading-tight text-text">{pageTitle(path)}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/consultations/reserver" className="hidden h-10 items-center gap-2 rounded-full bg-osun px-4 text-[13px] font-medium text-kaolin hover:bg-osun-hover sm:inline-flex"><CalendarPlus size={15} /> Réserver</Link>
            <NotificationsBell />
            <AccountMenu name={name} src={user.avatarUrl} email={user.email} onLogout={signOut} />
          </div>
        </div>
      </header>

      <main className={cn('pb-28 transition-[padding] duration-300 lg:pb-14', collapsed ? 'lg:pl-[88px]' : 'lg:pl-[18rem]')}>
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>

      {/* Menu mobile complet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-night/50 lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside
              role="dialog" aria-modal="true" aria-label="Mon espace"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0.6, right: 0 }}
              onDragEnd={(_, info) => { if (info.offset.x < -100 || info.velocity.x < -600) setOpen(false); }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[86vw] max-w-[360px] flex-col overflow-hidden bg-night text-kaolin lg:hidden"
            >
              <Adire kind="grid" opacity={0.045} />
              <div className="relative flex h-[72px] items-center justify-between px-5">
                <Logo variant="full" size="sm" inverse />
                <button aria-label="Fermer le menu" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-kaolin/25"><X size={18} /></button>
              </div>
              <div className="relative">{profileCard(false)}</div>
              <div className="scrollbar-thin relative flex-1 overflow-y-auto">{nav(false, () => setOpen(false))}</div>
              <div className="relative space-y-1 border-t border-kaolin/10 p-3">
                <Link href="/" className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-kaolin/70"><ExternalLink size={16} /> Retour au site</Link>
                <button onClick={signOut} className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-kaolin/70"><LogOut size={16} /> Se déconnecter</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Barre basse mobile : 5 icônes, « Réserver » au centre */}
      <nav aria-label="Navigation rapide" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-5 items-end">
          {[CLIENT_MENU[0], CLIENT_MENU[2]].map((l) => <BottomLink key={l.href} l={l} active={isActive(path, l.href, l.exact)} />)}
          <Link href="/consultations/reserver" className="-mt-5 flex flex-col items-center gap-1 pb-2 text-[11px] text-text">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-osun text-kaolin shadow-[0_10px_24px_-10px_rgba(158,59,38,0.7)] ring-4 ring-surface"><CalendarPlus size={22} strokeWidth={1.6} /></span>
            Réserver
          </Link>
          <BottomLink l={CLIENT_MENU[3]} active={isActive(path, CLIENT_MENU[3].href)} />
          <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-text-muted"><Menu size={21} strokeWidth={1.5} />Menu</button>
        </div>
      </nav>
    </div>
  );
}

function BottomLink({ l, active }: { l: (typeof CLIENT_MENU)[number]; active: boolean }) {
  return (
    <Link href={l.href} className={cn('relative flex flex-col items-center gap-1 py-2.5 text-[11px]', active ? 'text-primary' : 'text-text-muted')}>
      {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-osun" />}
      <l.icon size={21} strokeWidth={1.5} />{l.short}
    </Link>
  );
}

function AccountMenu({ name, src, email, onLogout }: { name: string; src?: string | null; email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Mon compte" className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 hover:bg-bg-subtle">
        <UserAvatar name={name} src={src} size={38} /><ChevronDown size={14} className="hidden text-text-faint sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-elevated)]">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-[14px] font-medium text-text">{name}</p>
            <p className="truncate text-[12px] text-text-faint">{email}</p>
          </div>
          <div className="p-2">
            <Link href="/espace/profil" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text hover:bg-bg-subtle"><UserRound size={15} /> Ma photo et mon profil</Link>
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text hover:bg-bg-subtle"><ExternalLink size={15} /> Retour au site</Link>
            <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text-muted hover:bg-bg-subtle"><LogOut size={15} /> Se déconnecter</button>
          </div>
        </div>
      )}
    </div>
  );
}
