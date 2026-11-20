'use client';

import {
  BookHeart, BookOpen, CalendarClock, CalendarRange, ChevronDown, ExternalLink, Film, Flame, FolderKanban, Image as ImageIcon, Inbox, LayoutDashboard, LogOut, Menu,
  History, MessageCircleReply, MessageSquareText, PlaneTakeoff, Search, Settings, Share2, Sparkles, Sun, Ticket, Type, UserRound, Users, Wallet, X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { Adire } from '@/components/brand/patterns';
import { IconButton } from '@/components/ui/button';
import { Drawer, Modal } from '@/components/ui/overlay';
import { NotificationsBell } from '@/components/ui/notifications-bell';
import { EmptyState, Skeleton } from '@/components/ui/primitives';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useRequireAuth } from '@/lib/use-api';

type Icon = React.ComponentType<{ size?: number; strokeWidth?: number }>;
type NavLink = { href: string; label: string; icon: Icon; exact?: boolean };

/** Plan §9 : groupes du menu admin. */
export const ADMIN_GROUPS: { title?: string; links: NavLink[] }[] = [
  { links: [{ href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true }] },
  {
    title: 'Accompagnement',
    links: [
      { href: '/admin/consultations', label: 'Consultations', icon: MessageSquareText },
      { href: '/admin/creneaux', label: 'Agenda et créneaux', icon: CalendarClock },
      { href: '/admin/ebo', label: 'Ebo', icon: Film },
      { href: '/admin/suivis', label: 'Suivis', icon: MessageCircleReply },
      { href: '/admin/clients', label: 'Clients', icon: Users },
    ],
  },
  {
    title: 'Contenus',
    links: [
      { href: '/admin/odu', label: 'Bibliothèque Odu', icon: BookOpen },
      { href: '/admin/textes-portrait', label: 'Textes du portrait', icon: Sparkles },
      { href: '/admin/enseignements', label: 'Enseignements', icon: FolderKanban },
    ],
  },
  {
    title: 'Bibliothèque',
    links: [
      { href: '/admin/bibliotheque/rituel', label: 'Rituels', icon: Flame },
      { href: '/admin/bibliotheque/wasu', label: 'Wáàsù', icon: BookHeart },
      { href: '/admin/bibliotheque/divinite', label: 'Divinités', icon: Sun },
    ],
  },
  {
    title: 'Bénin',
    links: [
      { href: '/admin/programmes', label: 'Programmes et sessions', icon: PlaneTakeoff },
      { href: '/admin/reservations', label: 'Réservations', icon: CalendarRange },
      { href: '/admin/evenements', label: 'Événements', icon: Ticket },
    ],
  },
  {
    title: 'Finances et messages',
    links: [
      { href: '/admin/paiements', label: 'Paiements', icon: Wallet },
      { href: '/admin/messages', label: 'Messages de contact', icon: Inbox },
    ],
  },
  {
    title: 'Apparence',
    links: [
      { href: '/admin/apparence/images', label: 'Images du site', icon: ImageIcon },
      { href: '/admin/apparence/babalawo', label: 'Babaláwo', icon: UserRound },
      { href: '/admin/apparence/textes', label: 'Textes de la vitrine', icon: Type },
      { href: '/admin/apparence/reseaux', label: 'Réseaux et contacts', icon: Share2 },
    ],
  },
  {
    title: 'Système',
    links: [
      { href: '/admin/audit', label: "Journal d'audit", icon: History },
      { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
    ],
  },
];
const ALL_LINKS = ADMIN_GROUPS.flatMap((g) => g.links);

function Nav({ path }: { path: string }) {
  return (
    <nav className="space-y-6 px-3 py-4">
      {ADMIN_GROUPS.map((g, i) => (
        <div key={i}>
          {g.title && <p className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-text-faint">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.links.map((l) => {
              const active = l.exact ? path === l.href : path.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link href={l.href} className={cn('group relative flex items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-1.5 text-[14px] transition-colors', active ? 'bg-primary text-primary-foreground' : 'text-text-muted hover:bg-bg-subtle hover:text-text')}>
                    {active && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-osun" />}
                    <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors', active ? 'bg-kaolin/15' : 'bg-bg-subtle text-text-muted group-hover:bg-primary-soft group-hover:text-primary')}><l.icon size={16} strokeWidth={1.6} /></span>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Recherche rapide Ctrl+K (comme dps) : aller à n'importe quel module au clavier. */
function QuickSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => ALL_LINKS.filter((l) => l.label.toLowerCase().includes(q.toLowerCase())), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => input.current?.focus(), 50); } }, [open]);

  const go = (href: string) => { setOpen(false); router.push(href); };
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex h-9 w-full max-w-sm items-center gap-2 rounded-[var(--radius-md)] border border-border bg-bg-subtle px-3 text-[13px] text-text-faint transition-colors hover:border-border-strong">
        <Search size={15} /> <span className="flex-1 text-left">Aller à…</span>
        <kbd className="hidden rounded border border-border-strong px-1.5 text-[11px] sm:inline">Ctrl K</kbd>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Aller à">
        <input
          ref={input} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === 'Enter' && results[active]) go(results[active].href);
          }}
          placeholder="Consultations, clients, Odu…" aria-label="Rechercher un module"
          className="h-11 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-3.5 text-[14px] focus:border-primary focus:outline-none"
        />
        <ul className="mt-3">
          {results.map((l, i) => (
            <li key={l.href}>
              <button onClick={() => go(l.href)} onMouseEnter={() => setActive(i)} className={cn('flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[14px]', i === active ? 'bg-bg-subtle text-text' : 'text-text-muted')}>
                <l.icon size={16} strokeWidth={1.5} />{l.label}
              </button>
            </li>
          ))}
          {!results.length && <li className="px-3 py-3 text-[13px] text-text-faint">Aucun module ne correspond.</li>}
        </ul>
      </Modal>
    </>
  );
}

/** Menu du compte dans l'en-tête admin : avatar rond, photo modifiable depuis le profil. */
function AdminAccount({ name, src, onLogout }: { name: string; src?: string | null; onLogout: () => void }) {
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
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Mon compte" className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 hover:bg-bg-subtle">
        <UserAvatar name={name} src={src} size={36} /><ChevronDown size={14} className="text-text-faint" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-2 shadow-[var(--shadow-elevated)]">
          <Link href="/espace/profil" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text hover:bg-bg-subtle"><UserRound size={15} /> Ma photo et mon profil</Link>
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text hover:bg-bg-subtle"><ExternalLink size={15} /> Voir le site</Link>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text-muted hover:bg-bg-subtle"><LogOut size={15} /> Se déconnecter</button>
        </div>
      )}
    </div>
  );
}

/** Coquille admin (plan §9, sur le modèle de l'AppShell de dps). Accès réservé PRIEST / ADMIN, vérifié aussi par l'API. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { ready, allowed, user } = useRequireAuth(path, true);
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  if (!ready) return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;
  if (!allowed) return <div className="mx-auto max-w-lg p-8 pt-24"><EmptyState title="Accès réservé" description="Cet espace est réservé au prêtre et à l'administration." /></div>;

  return (
    <div className="min-h-screen bg-bg-subtle">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] flex-col border-r border-border bg-surface md:flex">
        <div className="relative flex h-[76px] shrink-0 items-center overflow-hidden bg-night px-5"><Adire kind="zigzag" opacity={0.07} /><Link href="/admin" className="relative"><Logo variant="full" size="sm" inverse /></Link></div>
        <div className="scrollbar-thin flex-1 overflow-y-auto"><Nav path={path} /></div>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-bg-subtle p-3">
            <UserAvatar name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} src={user?.avatarUrl} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-text">{user?.firstName} {user?.lastName}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-faint">{user?.role === 'ADMIN' ? 'Administration' : 'Prêtre'}</p>
            </div>
            <Link href="/" aria-label="Voir le site" className="grid h-8 w-8 place-items-center rounded-lg text-text-muted hover:bg-surface hover:text-text"><ExternalLink size={15} /></Link>
          </div>
        </div>
      </aside>
      <header className="fixed left-0 right-0 top-0 z-20 flex h-[76px] items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6 md:left-[17rem] lg:px-8">
        <IconButton label="Ouvrir le menu" className="md:hidden" onClick={() => setOpen(true)}><Menu size={20} /></IconButton>
        <QuickSearch />
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <NotificationsBell />
          <Link href="/" className="hidden h-9 items-center gap-2 rounded-full border border-border-strong px-3.5 text-[13px] text-text-muted transition-colors hover:text-text lg:inline-flex"><ExternalLink size={14} /> Voir le site</Link>
          <AdminAccount name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} src={user?.avatarUrl} onLogout={() => { void logout().then(() => { window.location.href = '/'; }); }} />
        </div>
      </header>
      <footer className="fixed bottom-0 left-0 right-0 z-20 hidden h-11 items-center justify-between border-t border-border bg-surface px-8 text-[12px] text-text-faint md:left-[17rem] md:flex">
        <span>© {new Date().getFullYear()} Ifaôladé · Administration</span><span>Heure du Bénin (UTC+1)</span>
      </footer>
      <Drawer open={open} onClose={() => setOpen(false)} label="Menu admin">
        <div className="relative flex h-[76px] items-center justify-between overflow-hidden bg-night px-5"><Adire kind="zigzag" opacity={0.07} /><span className="relative"><Logo variant="full" size="sm" inverse /></span><button aria-label="Fermer" onClick={() => setOpen(false)} className="relative grid h-9 w-9 place-items-center rounded-full border border-kaolin/25 text-kaolin"><X size={17} /></button></div>
        <div className="flex-1 overflow-y-auto"><Nav path={path} /></div>
      </Drawer>
      <main className="px-4 pb-20 pt-28 sm:px-6 md:pl-[calc(17rem+1.5rem)] lg:px-8 lg:pl-[calc(17rem+2rem)]">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
