'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable, dt } from '@/components/admin/list';
import { ButtonLink } from '@/components/ui/button';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { eur } from '@/lib/cn';
import type { Program } from '@/lib/types';
import { useApi } from '@/lib/use-api';

const KIND_LABEL: Record<Program['kind'], string> = { INITIATION: 'Initiation', TOUR: 'Circuit', RETREAT: 'Retraite' };
type Row = Program & { published: boolean };

export default function ProgrammesAdmin() {
  const router = useRouter();
  const { data, error, loading, reload } = useApi<Row[]>('/admin/programs');
  return (
    <>
      <PageHeader title="Programmes et sessions" description="Initiation en forêt, circuits, retraites." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Programmes' }]}
        actions={<ButtonLink href="/admin/programmes/nouveau" size="sm" shape="console"><Plus size={15} /> Nouveau programme</ButtonLink>} />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.length ? <EmptyState title="Aucun programme" /> : (
        <DataTable rows={data} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/admin/programmes/${r.id}`)}
          columns={[
            { key: 't', label: 'Programme', render: (r) => <><span className="text-text">{r.title}</span><p className="text-[12px] text-text-faint">{KIND_LABEL[r.kind]} · {r.durationDays} jours</p></> },
            { key: 'p', label: 'Prix / pers.', className: 'text-right', render: (r) => <span className="tabular-nums">{eur(r.priceCents, r.currency)}</span> },
            { key: 'n', label: 'Prochaine session', render: (r) => { const s = r.sessions.find((x) => new Date(x.startDate) > new Date()); return <span className="text-[13px] tabular-nums text-text-muted">{s ? dt(s.startDate, false) : 'Aucune'}</span>; } },
            { key: 's', label: 'Statut', render: (r) => (r.published ? <Badge tone="success">En ligne</Badge> : <Badge tone="warning">Non publié</Badge>) },
          ]}
          mobile={(r) => <div className="flex items-center justify-between gap-2"><span className="text-[14px] text-text">{r.title}</span>{r.published ? <Badge tone="success">En ligne</Badge> : <Badge tone="warning">Non publié</Badge>}</div>}
        />
      )}
    </>
  );
}
