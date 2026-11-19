'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { DataTable, dt, FilterChips, useUrlState } from '@/components/admin/list';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import type { FollowUp } from '@/lib/types';
import { useApi } from '@/lib/use-api';

type Row = FollowUp & { consultation: { id: string; question: string; user: { firstName: string; lastName: string | null } } };

export default function Page() { return <Suspense fallback={<Skeleton className="h-64" />}><Suivis /></Suspense>; }

function Suivis() {
  const router = useRouter();
  const [etat, setEtat] = useUrlState('etat', 'answered');
  const { data, error, loading, reload } = useApi<Row[]>(`/admin/follow-ups?state=${etat || 'all'}`);
  return (
    <>
      <PageHeader title="Suivis" description="J+7, J+30, J+90 : ce que les clients répondent." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Suivis' }]} />
      <div className="mb-5"><FilterChips value={etat} onChange={setEtat} options={[['answered', 'À répondre'], ['late', 'Sans réponse du client'], ['all', 'Tous']]} /></div>
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.length ? (
        <EmptyState variant="no-results" title={etat === 'answered' ? 'Aucun suivi en attente de ta réponse' : 'Aucun suivi'} />
      ) : (
        <DataTable
          rows={data} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/admin/consultations/${r.consultation.id}`)}
          columns={[
            { key: 'c', label: 'Client', render: (r) => <span className="text-text">{r.consultation.user.firstName} {r.consultation.user.lastName}</span> },
            { key: 'j', label: 'Suivi', render: (r) => <span className="tabular-nums">J+{r.dayOffset}</span> },
            { key: 'p', label: 'Progression', render: (r) => (r.progress !== null ? <span className="tabular-nums text-text">{r.progress}/10</span> : <span className="text-text-faint">—</span>) },
            { key: 'n', label: 'Note', render: (r) => <span className="line-clamp-2 text-[13px] text-text-muted">{r.note ?? ''}</span> },
            { key: 's', label: 'État', render: (r) => (r.priestReply ? <Badge tone="success">Répondu</Badge> : r.answeredAt ? <Badge tone="warning">À répondre</Badge> : <Badge>Échéance {dt(r.dueAt, false)}</Badge>) },
          ]}
          mobile={(r) => (
            <div>
              <div className="flex items-center justify-between"><span className="text-[14px] text-text">{r.consultation.user.firstName} · J+{r.dayOffset}</span>{r.progress !== null && <span className="tabular-nums text-[13px]">{r.progress}/10</span>}</div>
              {r.note && <p className="mt-1 line-clamp-2 text-[12px] text-text-muted">{r.note}</p>}
            </div>
          )}
        />
      )}
    </>
  );
}
