'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { btTime, StatusBadge } from '@/components/consultation/parts';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import type { Consultation } from '@/lib/types';
import { useApi, useRequireAuth } from '@/lib/use-api';

export default function MesConsultationsPage() {
  const { ready } = useRequireAuth('/espace/consultations');
  const { data, error, loading, reload } = useApi<Consultation[]>(ready ? '/consultations/mine' : null);

  return (
    <div>
      <PageHeader
        title="Mes consultations"
        breadcrumb={[{ label: 'Mon espace', href: '/espace' }, { label: 'Consultations' }]}
        actions={<ButtonLink href="/consultations/reserver" size="sm" shape="console">Nouvelle consultation</ButtonLink>}
      />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : !data.length ? (
        <EmptyState title="Aucune consultation pour le moment" description="Ta première consultation est offerte." action={<ButtonLink href="/consultations/reserver?offre=FIRST_FREE">Utiliser ma consultation offerte</ButtonLink>} />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
          {data.map((c) => (
            <li key={c.id}>
              <Link href={`/espace/consultations/${c.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-bg-subtle">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] text-text">{c.offer.title}</span>
                    <StatusBadge status={c.status} />
                    {c.ebos.some((e) => e.status === 'PROPOSED') && <span className="text-[12px] text-warning">Ebo proposé</span>}
                  </div>
                  <p className="mt-1 truncate text-[13px] text-text-muted">« {c.question} »</p>
                  <p className="mt-1 text-[12px] text-text-faint">{c.slot ? `${btTime(c.slot.startsAt)} (heure du Bénin)` : `Demande du ${btTime(c.createdAt, { dateStyle: 'long' })}`}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-text-faint" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
