'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { btTime, CONSULTATION_STATUS, StatusBadge } from '@/components/consultation/parts';
import { Input } from '@/components/ui/field';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import type { Consultation, ConsultationStatus } from '@/lib/types';
import { useApi } from '@/lib/use-api';

export default function Page() {
  return <Suspense fallback={<Skeleton className="h-64 w-full" />}><AdminConsultations /></Suspense>;
}

function AdminConsultations() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const statut = params.get('statut') ?? '';
  const q = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [search, setSearch] = useState(q);

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    if (!('page' in patch)) next.delete('page');
    router.replace(`${path}?${next.toString()}`);
  };
  useEffect(() => {
    const t = setTimeout(() => { if (search !== q) set({ q: search }); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const qs = new URLSearchParams({ ...(statut ? { status: statut } : {}), ...(q ? { q } : {}), page: String(page), pageSize: '20' }).toString();
  const { data, error, loading, reload } = useApi<{ items: Consultation[]; total: number }>(`/admin/consultations?${qs}`);
  const pages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1;
  const filtered = !!(statut || q);

  return (
    <>
      <PageHeader title="Consultations" description="Toutes les demandes, de la plus récente à la plus ancienne." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Consultations' }]} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[['', 'Toutes'], ...Object.entries(CONSULTATION_STATUS).map(([k, v]) => [k, v.label])].map(([k, l]) => (
            <button key={k} onClick={() => set({ statut: k })} className={cn('h-8 rounded-full border px-3.5 text-[13px] transition-colors', statut === k ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong bg-surface text-text-muted hover:text-text')}>{l}</button>
          ))}
        </div>
        <div className="relative lg:w-80">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Client, email, question…" className="h-9 pl-9" aria-label="Rechercher" />
        </div>
      </div>

      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : !data.items.length ? (
        <EmptyState variant={filtered ? 'no-results' : 'empty'} title={filtered ? 'Aucun résultat pour ces filtres' : 'Aucune consultation pour le moment'} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
          <table className="hidden w-full text-[14px] md:table">
            <thead>
              <tr className="border-b border-border bg-bg-subtle text-left text-[12px] text-text-faint">
                <th className="px-4 py-2.5 font-medium">Client</th><th className="px-4 py-2.5 font-medium">Offre</th>
                <th className="px-4 py-2.5 font-medium">Rendez-vous (Bénin)</th><th className="px-4 py-2.5 font-medium">Statut</th><th className="px-4 py-2.5 font-medium">Ebo / suivis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((c) => (
                <tr key={c.id} className="cursor-pointer transition-colors hover:bg-bg-subtle" onClick={() => router.push(`/admin/consultations/${c.id}`)}>
                  <td className="px-4 py-3"><Link href={`/admin/consultations/${c.id}`} className="text-text" onClick={(e) => e.stopPropagation()}>{c.user?.firstName} {c.user?.lastName}</Link><p className="text-[12px] text-text-faint">{c.user?.country ?? c.user?.email}</p></td>
                  <td className="px-4 py-3 text-text-muted">{c.offer.title}</td>
                  <td className="px-4 py-3 tabular-nums text-text-muted">{c.slot ? btTime(c.slot.startsAt, { dateStyle: 'medium', timeStyle: 'short' }) : 'Par écrit'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status as ConsultationStatus} /></td>
                  <td className="px-4 py-3 text-[13px] tabular-nums text-text-muted">{c.ebos.length} ebo · {c.followUps.filter((f) => f.answeredAt && !f.priestReply).length} à répondre</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y divide-border md:hidden">
            {data.items.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/consultations/${c.id}`} className="block px-4 py-3.5">
                  <div className="flex items-center justify-between gap-2"><span className="text-[14px] text-text">{c.user?.firstName} {c.user?.lastName}</span><StatusBadge status={c.status as ConsultationStatus} /></div>
                  <p className="mt-1 text-[12px] text-text-faint">{c.offer.title} · {c.slot ? btTime(c.slot.startsAt, { dateStyle: 'short', timeStyle: 'short' }) : 'Par écrit'}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px] text-text-muted">
            <span className="tabular-nums">{data.total} consultation{data.total > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => set({ page: String(page - 1) })} className="rounded-[var(--radius-sm)] border border-border-strong px-3 py-1 disabled:opacity-40">Précédent</button>
              <span className="tabular-nums">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => set({ page: String(page + 1) })} className="rounded-[var(--radius-sm)] border border-border-strong px-3 py-1 disabled:opacity-40">Suivant</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
