'use client';

import {
  CalendarPlus, CreditCard, FolderHeart, Home, LogOut, Menu, MessageSquareText, PanelLeftClose, PanelLeftOpen,
  PlaneTakeoff, Sparkles, Ticket, UserRound, X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/site/header';
import { IconButton } from '@/components/ui/button';
import { Drawer } from '@/components/ui/overlay';
import { NotificationsBell } from '@/components/ui/notifications-bell';
import { Avatar, Skeleton } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useRequireAuth } from '@/lib/use-api';

type Icon = React.ComponentType<{ size?: number; strokeWidth?: number }>;
export const CLIENT_MENU: { href: string; label: string; icon: Icon; exact?: boolean }[] = [
  { href: '/espace', label: 'Accueil', icon: Home, exact: true },
  { href: '/espace/portrait', label: 'Mon portrait', icon: Sparkles },
  { href: '/espace/consultations', label: 'Mes consultations', icon: MessageSquareText },
  { href: '/espace/dossier', label: 'Mon dossier spirituel', icon: FolderHeart },
  { href: '/consultations/reserver', label: 'Réserver', icon: CalendarPlus },
  { href: '/espace/voyages', label: 'Mes voyages', icon: PlaneTakeoff },
  { href: '/espace/evenements', label: 'Événements', icon: Ticket },
  { href: '/espace/paiements', label: 'Paiements', icon: CreditCard },
  { href: '/espace/profil', label: 'Profil et confidentialité', icon: UserRound },
];
const BOTTOM = [CLIENT_MENU[0], CLIENT_MENU[2], CLIENT_MENU[3]];

/** Repli de la barre latérale mémorisé dans ce navigateur seulement (comme DashboardFrame d'edoto). */
function useCollapsed() {
  const [c, setC] = useState(false);
  useEffect(() => { try { setC(localStorage.getItem('ifaolade:espace-collapsed') === '1'); } catch { /* rien */ } }, []);
  const toggle = () => setC((v) => { try { localStorage.setItem('ifaolade:espace-collapsed', v ? '0' : '1'); } catch { /* rien */ } return !v; });
  return [c, toggle] as const;
}

const isActive = (path: string, href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

/** Espace client (plan §8), sur le modèle du DashboardFrame d'edoto, aux couleurs d'Ifaôladé. */
export function ClientFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { ready, user } = useRequireAuth(path);
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, toggle] = useCollapsed();
  useEffect(() => setOpen(false), [path]);

  if (!ready || !user) return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;
  const name = `${user.firstName} ${user.lastName ?? ''}`.trim();

  const nav = (compact: boolean) => (
    <ul className="space-y-0.5 px-3">
      {CLIENT_MENU.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href} title={compact ? l.label : undefined}
            className={cn('flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] transition-colors', compact && 'justify-center px-0',
              isActive(path, l.href, l.exact) ? 'bg-primary-soft font-medium text-primary' : 'text-text-muted hover:bg-bg-subtle hover:text-text')}
          >
            <l.icon size={18} strokeWidth={1.5} />{!compact && l.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const identity = (compact: boolean) => (
    <div className={cn('mx-4 mb-4 rounded-[var(--radius-md)] border border-border bg-bg-subtle px-3 py-2.5', compact && 'mx-auto w-fit border-0 bg-transparent p-0')}>
      <div className="flex items-center gap-3">
        <Avatar name={name} size={34} />
        {!compact && <div className="min-w-0"><p className="truncate text-[13px] font-medium text-text">{name}</p><p className="truncate text-[11.5px] text-text-faint">{user.email}</p></div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-subtle">
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-surface transition-[width] duration-300 lg:flex', collapsed ? 'w-[84px]' : 'w-72')}>
        <div className={cn('flex h-18 shrink-0 items-center px-6', collapsed && 'justify-center px-0')}>
          <Link href="/" aria-label="Retour au site">{collapsed ? <span className="text-[17px] font-medium">I</span> : <BrandMark />}</Link>
        </div>
        {!collapsed && <p className="-mt-1 mb-3 px-6 text-[10px] font-medium uppercase tracking-[0.22em] text-text-faint">Mon espace</p>}
        {identity(collapsed)}
        <div className="scrollbar-thin flex-1 overflow-y-auto">{nav(collapsed)}</div>
        <div className="space-y-1 border-t border-border p-3">
          <button onClick={toggle} className={cn('flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-text-muted hover:bg-bg-subtle hover:text-text', collapsed && 'justify-center')}>
            {collapsed ? <PanelLeftOpen size={17} /> : <><PanelLeftClose size={17} /> Réduire</>}
          </button>
          <button onClick={() => { void logout().then(() => { window.location.href = '/'; }); }} className={cn('flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-text-muted hover:bg-bg-subtle hover:text-text', collapsed && 'justify-center')}>
            <LogOut size={17} />{!collapsed && 'Se déconnecter'}
          </button>
        </div>
      </aside>

      <header className={cn('sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-md sm:px-6 lg:hidden')}>
        <IconButton label="Ouvrir le menu" onClick={() => setOpen(true)}><Menu size={20} /></IconButton>
        <Link href="/"><BrandMark /></Link>
        <span className="ml-auto flex items-center gap-1"><NotificationsBell /><Avatar name={name} size={30} /></span>
      </header>

      <Drawer open={open} onClose={() => setOpen(false)} label="Mon espace">
        <div className="flex h-16 items-center justify-between px-6"><BrandMark /><IconButton label="Fermer le menu" onClick={() => setOpen(false)}><X size={18} /></IconButton></div>
        {identity(false)}
        <div className="flex-1 overflow-y-auto">{nav(false)}</div>
        <div className="border-t border-border p-3">
          <button onClick={() => { void logout().then(() => { window.location.href = '/'; }); }} className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text-muted"><LogOut size={17} /> Se déconnecter</button>
        </div>
      </Drawer>

      <main className={cn('pb-28 transition-[padding] duration-300 lg:pb-12', collapsed ? 'lg:pl-[84px]' : 'lg:pl-72')}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="-mt-4 mb-4 hidden justify-end lg:flex"><NotificationsBell /></div>
          {children}
        </div>
      </main>

      {/* Barre basse mobile (plan §8) */}
      <nav aria-label="Navigation rapide" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-surface/95 backdrop-blur-md lg:hidden">
        {BOTTOM.map((l) => (
          <Link key={l.href} href={l.href} className={cn('flex flex-col items-center gap-1 py-2.5 text-[11px]', isActive(path, l.href, l.exact) ? 'text-primary' : 'text-text-muted')}>
            <l.icon size={20} strokeWidth={1.5} />{l.label.replace('Mon dossier spirituel', 'Dossier').replace('Mes consultations', 'Consultations')}
          </Link>
        ))}
        <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-text-muted"><Menu size={20} strokeWidth={1.5} />Menu</button>
      </nav>
    </div>
  );
}
