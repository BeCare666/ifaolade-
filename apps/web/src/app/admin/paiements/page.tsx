'use client';

import { Download } from 'lucide-react';
import { Suspense } from 'react';
import { DataTable, dt, FilterChips, useUrlState } from '@/components/admin/list';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton, type Tone } from '@/components/ui/primitives';
import { eur } from '@/lib/cn';
import { useApi } from '@/lib/use-api';

interface Pay { id: string; purpose: string; refId: string; amountCents: number; currency: string; provider: string; providerRef: string | null; status: string; createdAt: string; user: { firstName: string; lastName: string | null; email: string } }
const STATUS: Record<string, { l: string; t: Tone }> = { PENDING: { l: 'En attente', t: 'warning' }, SUCCEEDED: { l: 'Réussi', t: 'success' }, FAILED: { l: 'Échoué', t: 'danger' }, REFUNDED: { l: 'Remboursé', t: 'neutral' } };
const PURPOSE: Record<string, string> = { CONSULTATION: 'Consultation', EBO: 'Ebo', BOOKING: 'Voyage', EVENT: 'Événement' };

export default function Page() { return <Suspense fallback={<Skeleton className="h-64" />}><Paiements /></Suspense>; }

function Paiements() {
  const [statut, setStatut] = useUrlState('statut', 'SUCCEEDED');
  const { data, error, loading, reload } = useApi<{ items: Pay[]; total: number }>(`/admin/payments${statut ? `?status=${statut}` : ''}`);
  const total = (data?.items ?? []).filter((p) => p.status === 'SUCCEEDED').reduce((s, p) => s + p.amountCents, 0);

  /** Export CSV des lignes affichées (rapprochement comptable). */
  const exportCsv = () => {
    if (!data) return;
    const rows = [['date', 'client', 'email', 'objet', 'fournisseur', 'reference', 'montant', 'devise', 'statut'],
      ...data.items.map((p) => [dt(p.createdAt), `${p.user.firstName} ${p.user.lastName ?? ''}`.trim(), p.user.email, PURPOSE[p.purpose] ?? p.purpose, p.provider, p.providerRef ?? '', (p.amountCents / 100).toFixed(2), p.currency, p.status])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    a.download = `paiements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <>
      <PageHeader title="Paiements" description={data ? `${data.total} paiement(s) · ${eur(total)} encaissés sur cette page` : undefined} breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Paiements' }]}
        actions={<Button variant="secondary" size="sm" shape="console" onClick={exportCsv} disabled={!data?.items.length}><Download size={15} /> Exporter en CSV</Button>} />
      <div className="mb-5"><FilterChips value={statut} onChange={setStatut} options={[['', 'Tous'], ...Object.entries(STATUS).map(([k, v]) => [k, v.l] as [string, string])]} /></div>
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.items.length ? (
        <EmptyState variant={statut ? 'no-results' : 'empty'} title="Aucun paiement" />
      ) : (
        <DataTable
          rows={data.items} rowKey={(r) => r.id}
          columns={[
            { key: 'd', label: 'Date', render: (r) => <span className="text-[13px] tabular-nums text-text-muted">{dt(r.createdAt)}</span> },
            { key: 'c', label: 'Client', render: (r) => <><span className="text-text">{r.user.firstName} {r.user.lastName}</span><p className="text-[12px] text-text-faint">{r.user.email}</p></> },
            { key: 'o', label: 'Objet', render: (r) => PURPOSE[r.purpose] ?? r.purpose },
            { key: 'f', label: 'Fournisseur', render: (r) => <span className="text-[13px] text-text-muted">{r.provider === 'FEEXPAY' ? 'Mobile Money' : 'Carte'}</span> },
            { key: 'm', label: 'Montant', className: 'text-right', render: (r) => <span className="tabular-nums text-text">{eur(r.amountCents, r.currency)}</span> },
            { key: 's', label: 'Statut', render: (r) => <Badge tone={STATUS[r.status]?.t ?? 'neutral'}>{STATUS[r.status]?.l ?? r.status}</Badge> },
          ]}
          mobile={(r) => (
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[14px] text-text">{r.user.firstName} · {PURPOSE[r.purpose]}</p><p className="text-[12px] text-text-faint">{dt(r.createdAt)}</p></div>
              <div className="text-right"><p className="tabular-nums text-[14px]">{eur(r.amountCents, r.currency)}</p><Badge tone={STATUS[r.status]?.t ?? 'neutral'}>{STATUS[r.status]?.l}</Badge></div>
            </div>
          )}
        />
      )}
    </>
  );
}
