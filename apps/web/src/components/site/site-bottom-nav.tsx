'use client';

import { Gift, Grid3x3, Home, Sparkles, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserAvatar } from '@/components/ui/user-avatar';
import { splitPath } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';

/**
 * Barre basse mobile de la vitrine, identique à celle de l'espace client : visible sur TOUTES les pages
 * de la vitrine sous 1024 px. Au centre, la consultation offerte.
 */
export function SiteBottomNav() {
  const { d, href } = useI18n();
  const { user } = useAuth();
  const { path } = splitPath(usePathname() || '/');
  const b = d.menu.bottom;
  const on = (p: string) => (p === '/' ? path === '/' : path.startsWith(p));
  const item = (p: string, label: string, icon: React.ReactNode, to = href(p)) => (
    <Link href={to} className={cn('relative flex flex-col items-center gap-1 py-2.5 text-[11px]', on(p) ? 'text-primary' : 'text-text-muted')}>
      {on(p) && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-osun" />}
      {icon}{label}
    </Link>
  );
  return (
    <>
      {/* Réserve la place de la barre sous le pied de page */}
      <div aria-hidden className="h-[76px] lg:hidden" />
      <nav aria-label={d.nav.main} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-5 items-end">
          {item('/', b.home, <Home size={21} strokeWidth={1.5} />)}
          {item('/odu', b.odu, <Grid3x3 size={21} strokeWidth={1.5} />)}
          <Link href={href('/consultations/reserver?offre=FIRST_FREE')} className="-mt-5 flex flex-col items-center gap-1 pb-2 text-[11px] text-text">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-osun text-kaolin shadow-[0_10px_24px_-10px_rgba(158,59,38,0.7)] ring-4 ring-surface"><Gift size={22} strokeWidth={1.6} /></span>
            {b.offer}
          </Link>
          {item('/connais-toi', b.portrait, <Sparkles size={21} strokeWidth={1.5} />)}
          {user
            ? item('/espace', b.space, <UserAvatar name={`${user.firstName} ${user.lastName ?? ''}`} src={user.avatarUrl} size={22} className="ring-1" />, '/espace')
            : item('/connexion', b.account, <UserRound size={21} strokeWidth={1.5} />)}
        </div>
      </nav>
    </>
  );
}
