'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { DataTable, dt, useUrlState } from '@/components/admin/list';
import { Input } from '@/components/ui/field';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useApi } from '@/lib/use-api';

interface Row {
  avatarUrl?: string | null;
  id: string; firstName: string; lastName: string | null; email: string; country: string | null; role: string; emailVerified: boolean; createdAt: string;
  _count: { consultations: number; readings: number; bookings: number };
}

export default function Page() { return <Suspense fallback={<Skeleton className="h-64" />}><Clients /></Suspense>; }

function Clients() {
  const router = useRouter();
  const [q, setQ] = useUrlState('q');
  const [page, setPage] = useUrlState('page', '1');
  const [search, setSearch] = useState(q);
  useEffect(() => { const t = setTimeout(() => { if (search !== q) { setQ(search); } }, 350); return () => clearTimeout(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [search]);
  const { data, error, loading, reload } = useApi<{ items: Row[]; total: number }>(`/admin/users?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
  const pages = data ? Math.max(1, Math.ceil(data.total / 25)) : 1;
  const p = Number(page) || 1;

  return (
    <>
      <PageHeader title="Clients" description={data ? `${data.total} compte(s)` : undefined} breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Clients' }]} />
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, prénom, email…" className="h-9 pl-9" aria-label="Rechercher un client" />
      </div>
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.items.length ? (
        <EmptyState variant={q ? 'no-results' : 'empty'} title={q ? 'Aucun client ne correspond' : 'Aucun client pour le moment'} />
      ) : (
        <>
          <DataTable
            rows={data.items} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/admin/clients/${r.id}`)}
            columns={[
              { key: 'n', label: 'Client', render: (r) => <span className="flex items-center gap-3"><UserAvatar src={r.avatarUrl} name={`${r.firstName} ${r.lastName ?? ''}`} size={30} /><span><span className="block text-text">{r.firstName} {r.lastName}</span><span className="text-[12px] text-text-faint">{r.email}</span></span></span> },
              { key: 'p', label: 'Pays', render: (r) => <span className="text-text-muted">{r.country ?? '—'}</span> },
              { key: 'c', label: 'Activité', render: (r) => <span className="text-[13px] tabular-nums text-text-muted">{r._count.readings} portrait · {r._count.consultations} consult. · {r._count.bookings} voyage</span> },
              { key: 'v', label: 'Email', render: (r) => (r.emailVerified ? <Badge tone="success">Vérifié</Badge> : <Badge tone="warning">Non vérifié</Badge>) },
              { key: 'r', label: 'Rôle', render: (r) => (r.role === 'CLIENT' ? <span className="text-[13px] text-text-faint">Client</span> : <Badge tone="primary">{r.role === 'PRIEST' ? 'Prêtre' : 'Admin'}</Badge>) },
              { key: 'd', label: 'Inscrit le', render: (r) => <span className="text-[13px] tabular-nums text-text-faint">{dt(r.createdAt, false)}</span> },
            ]}
            mobile={(r) => (
              <div className="flex items-center gap-3">
                <UserAvatar src={r.avatarUrl} name={`${r.firstName} ${r.lastName ?? ''}`} size={34} />
                <div className="min-w-0"><p className="truncate text-[14px] text-text">{r.firstName} {r.lastName}</p><p className="truncate text-[12px] text-text-faint">{r.email}</p></div>
              </div>
            )}
          />
          <div className="mt-4 flex items-center justify-end gap-2 text-[13px] text-text-muted">
            <button disabled={p <= 1} onClick={() => setPage(String(p - 1))} className="rounded-[var(--radius-sm)] border border-border-strong px-3 py-1 disabled:opacity-40">Précédent</button>
            <span className="tabular-nums">{p} / {pages}</span>
            <button disabled={p >= pages} onClick={() => setPage(String(p + 1))} className="rounded-[var(--radius-sm)] border border-border-strong px-3 py-1 disabled:opacity-40">Suivant</button>
          </div>
        </>
      )}
    </>
  );
}
