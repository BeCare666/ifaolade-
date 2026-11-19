'use client';

import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';

interface Notif { id: string; title: string; body: string | null; href: string | null; readAt: string | null; createdAt: string }

const ago = (d: string) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60_000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(d));
};

/** Cloche (étape 2.1) : espaces client et admin. Rafraîchie toutes les 60 s. */
export function NotificationsBell() {
  const { token } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{ items: Notif[]; unread: number } | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try { setData(await apiSend('/notifications', undefined, 'GET', token)); } catch { /* silencieux : la cloche ne bloque rien */ }
  }, [token]);

  useEffect(() => { load(); const t = setInterval(load, 60_000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const openItem = async (n: Notif) => {
    setOpen(false);
    if (!n.readAt) await apiSend(`/notifications/${n.id}/read`, {}, 'POST', token).catch(() => undefined);
    load();
    if (n.href) router.push(n.href);
  };
  const unread = data?.unread ?? 0;

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `Notifications, ${unread} non lue(s)` : 'Notifications'}
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-subtle hover:text-text"
      >
        <Bell size={18} strokeWidth={1.6} />
        {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium tabular-nums text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-[60] mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-elevated)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-[14px] font-medium text-text">Notifications</p>
            {unread > 0 && (
              <button className="text-[12px] text-primary" onClick={async () => { await apiSend('/notifications/read-all', {}, 'POST', token).catch(() => undefined); load(); }}>
                Tout marquer comme lu
              </button>
            )}
          </div>
          <ul className="scrollbar-thin max-h-[60vh] divide-y divide-border overflow-y-auto">
            {data?.items.length ? data.items.map((n) => (
              <li key={n.id}>
                <button onClick={() => openItem(n)} className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-subtle', !n.readAt && 'bg-primary-soft/50')}>
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.readAt ? 'bg-transparent' : 'bg-accent')} />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] text-text">{n.title}</span>
                    {n.body && <span className="block truncate text-[12px] text-text-muted">{n.body}</span>}
                    <span className="mt-0.5 block text-[11.5px] text-text-faint">{ago(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            )) : <li className="px-4 py-8 text-center text-[13px] text-text-faint">Aucune notification.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
