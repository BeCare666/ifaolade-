'use client';

import { Plus, ScanLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable, dt } from '@/components/admin/list';
import { TicketScanner } from '@/components/admin/ticket-scanner';
import { Button, ButtonLink } from '@/components/ui/button';
import { Modal } from '@/components/ui/overlay';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { eur } from '@/lib/cn';
import type { EventItem } from '@/lib/types';
import { useApi } from '@/lib/use-api';

type Row = EventItem & { published: boolean };

export default function EvenementsAdmin() {
  const router = useRouter();
  const { data, error, loading, reload } = useApi<Row[]>('/admin/events');
  const [checkOpen, setCheckOpen] = useState(false);

  return (
    <>
      <PageHeader title="Événements" breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Événements' }]}
        actions={<>
          <Button variant="secondary" size="sm" shape="console" onClick={() => setCheckOpen(true)}><ScanLine size={15} /> Contrôle à l&apos;entrée</Button>
          <ButtonLink href="/admin/evenements/nouveau" size="sm" shape="console"><Plus size={15} /> Nouvel événement</ButtonLink>
        </>} />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.length ? <EmptyState title="Aucun événement" /> : (
        <DataTable rows={data} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/admin/evenements/${r.id}`)}
          columns={[
            { key: 't', label: 'Événement', render: (r) => <><span className="text-text">{r.title}</span><p className="text-[12px] text-text-faint">{r.location}</p></> },
            { key: 'd', label: 'Dates', render: (r) => <span className="text-[13px] tabular-nums text-text-muted">{dt(r.startsAt, false)} → {dt(r.endsAt, false)}</span> },
            { key: 'p', label: 'Prix', className: 'text-right', render: (r) => <span className="tabular-nums">{r.priceCents ? eur(r.priceCents, r.currency) : 'Gratuit'}</span> },
            { key: 's', label: 'Statut', render: (r) => (r.published ? <Badge tone="success">En ligne</Badge> : <Badge tone="warning">Non publié</Badge>) },
          ]}
          mobile={(r) => <div className="flex items-center justify-between gap-2"><span className="text-[14px] text-text">{r.title}</span><span className="text-[12px] text-text-faint">{dt(r.startsAt, false)}</span></div>}
        />
      )}
      <Modal open={checkOpen} onClose={() => setCheckOpen(false)} title="Contrôle à l'entrée">
        {checkOpen && <TicketScanner />}
      </Modal>
    </>
  );
}
