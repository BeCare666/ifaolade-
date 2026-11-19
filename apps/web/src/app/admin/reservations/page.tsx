'use client';

import { Suspense } from 'react';
import { DataTable, dt, FilterChips, useUrlState } from '@/components/admin/list';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton, type Tone } from '@/components/ui/primitives';
import { eur } from '@/lib/cn';
import { useApi } from '@/lib/use-api';

interface Row {
  id: string; status: string; participants: number; notes: string | null; totalCents: number; paidCents: number; currency: string; createdAt: string;
  user: { firstName: string; lastName: string | null; email: string; phone: string | null; country: string | null };
  session: { startDate: string; program: { title: string } };
}
const BOOKING_STATUS: Record<string, { l: string; t: Tone }> = {
  PENDING: { l: 'Acompte attendu', t: 'warning' }, DEPOSIT_PAID: { l: 'Acompte payé, solde dû', t: 'info' }, PAID: { l: 'Soldé', t: 'success' }, CANCELLED: { l: 'Annulée', t: 'neutral' },
};

export default function Page() { return <Suspense fallback={<Skeleton className="h-64" />}><Reservations /></Suspense>; }

function Reservations() {
  const [statut, setStatut] = useUrlState('statut');
  const { data, error, loading, reload } = useApi<Row[]>(`/admin/bookings${statut ? `?status=${statut}` : ''}`);
  return (
    <>
      <PageHeader title="Réservations" description="Initiations, circuits et retraites." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Réservations' }]} />
      <div className="mb-5"><FilterChips value={statut} onChange={setStatut} options={[['', 'Toutes'], ...Object.entries(BOOKING_STATUS).map(([k, v]) => [k, v.l] as [string, string])]} /></div>
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.length ? (
        <EmptyState variant={statut ? 'no-results' : 'empty'} title="Aucune réservation" />
      ) : (
        <DataTable rows={data} rowKey={(r) => r.id}
          columns={[
            { key: 'c', label: 'Voyageur', render: (r) => <><span className="text-text">{r.user.firstName} {r.user.lastName}</span><p className="text-[12px] text-text-faint">{r.user.email}{r.user.phone ? ` · ${r.user.phone}` : ''}</p></> },
            { key: 'p', label: 'Programme', render: (r) => <><span className="text-text-muted">{r.session.program.title}</span><p className="text-[12px] tabular-nums text-text-faint">départ {dt(r.session.startDate, false)} · {r.participants} pers.</p></> },
            { key: 'm', label: 'Payé', className: 'text-right', render: (r) => <span className="tabular-nums">{eur(r.paidCents, r.currency)} <span className="text-text-faint">/ {eur(r.totalCents, r.currency)}</span></span> },
            { key: 's', label: 'Statut', render: (r) => <Badge tone={BOOKING_STATUS[r.status]?.t ?? 'neutral'}>{BOOKING_STATUS[r.status]?.l ?? r.status}</Badge> },
            { key: 'n', label: 'Notes', render: (r) => <span className="line-clamp-2 text-[13px] text-text-muted">{r.notes ?? ''}</span> },
          ]}
          mobile={(r) => (
            <div>
              <div className="flex items-center justify-between gap-2"><span className="text-[14px] text-text">{r.user.firstName} {r.user.lastName}</span><Badge tone={BOOKING_STATUS[r.status]?.t ?? 'neutral'}>{BOOKING_STATUS[r.status]?.l}</Badge></div>
              <p className="mt-1 text-[12px] text-text-faint">{r.session.program.title} · {eur(r.paidCents, r.currency)} / {eur(r.totalCents, r.currency)}</p>
            </div>
          )}
        />
      )}
    </>
  );
}
