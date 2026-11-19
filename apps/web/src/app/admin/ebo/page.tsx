'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { DataTable, dt, FilterChips, useUrlState } from '@/components/admin/list';
import { EBO_STATUS } from '@/components/consultation/parts';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { eur } from '@/lib/cn';
import type { Ebo } from '@/lib/types';
import { useApi } from '@/lib/use-api';

type Row = Ebo & { consultation: { id: string; user: { firstName: string; lastName: string | null } } };

export default function Page() { return <Suspense fallback={<Skeleton className="h-64" />}><EboList /></Suspense>; }

function EboList() {
  const router = useRouter();
  const [statut, setStatut] = useUrlState('statut');
  const { data, error, loading, reload } = useApi<Row[]>(`/admin/ebos${statut ? `?status=${statut}` : ''}`);
  return (
    <>
      <PageHeader title="Ebo" description="Toutes les propositions, avec leur statut." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Ebo' }]} />
      <div className="mb-5"><FilterChips value={statut} onChange={setStatut} options={[['', 'Tous'], ...Object.entries(EBO_STATUS).map(([k, v]) => [k, v.label.split(',')[0]] as [string, string])]} /></div>
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.length ? (
        <EmptyState variant={statut ? 'no-results' : 'empty'} title={statut ? 'Aucun ebo avec ce statut' : 'Aucun ebo pour le moment'} />
      ) : (
        <DataTable
          rows={data} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/admin/consultations/${r.consultation.id}`)}
          columns={[
            { key: 'c', label: 'Client', render: (r) => <span className="text-text">{r.consultation.user.firstName} {r.consultation.user.lastName}</span> },
            { key: 't', label: 'Ebo', render: (r) => <span className="text-text-muted">{r.title}</span> },
            { key: 'm', label: 'Montant', className: 'text-right', render: (r) => <span className="tabular-nums">{eur(r.materialsCents + r.priestFeeCents, r.currency)}</span> },
            { key: 's', label: 'Statut', render: (r) => <Badge tone={EBO_STATUS[r.status].tone}>{EBO_STATUS[r.status].label.split(',')[0]}</Badge> },
            { key: 'd', label: 'Mis à jour', render: (r) => <span className="text-[13px] tabular-nums text-text-faint">{dt(r.createdAt)}</span> },
          ]}
          mobile={(r) => (
            <div>
              <div className="flex items-center justify-between gap-2"><span className="text-[14px] text-text">{r.title}</span><Badge tone={EBO_STATUS[r.status].tone}>{EBO_STATUS[r.status].label.split(',')[0]}</Badge></div>
              <p className="mt-1 text-[12px] text-text-faint">{r.consultation.user.firstName} · {eur(r.materialsCents + r.priestFeeCents, r.currency)}</p>
            </div>
          )}
        />
      )}
    </>
  );
}
