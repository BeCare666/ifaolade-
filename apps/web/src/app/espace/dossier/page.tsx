'use client';

import { oduById } from '@ona/core';
import Link from 'next/link';
import { btTime, EBO_STATUS } from '@/components/consultation/parts';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card, CardHeader, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { eur } from '@/lib/cn';
import type { Dossier } from '@/lib/types';
import { useApi, useRequireAuth } from '@/lib/use-api';

/** Plan étape 5.8 : chronologie des Odu reçus, ewọ̀ permanents, ebo et preuves. */
export default function DossierPage() {
  const { ready } = useRequireAuth('/espace/dossier');
  const { data, error, loading, reload } = useApi<Dossier>(ready ? '/me/dossier' : null);

  const reports = (data?.consultations ?? [])
    .filter((c) => c.report?.publishedAt)
    .sort((a, b) => +new Date(b.report!.publishedAt!) - +new Date(a.report!.publishedAt!));
  const ebos = (data?.consultations ?? []).flatMap((c) => c.ebos.map((e) => ({ ...e, consultationId: c.id })));

  return (
    <div>
      <PageHeader title="Mon dossier spirituel" description="Tout ce qu'Ifá t'a dit, au même endroit." breadcrumb={[{ label: 'Mon espace', href: '/espace' }, { label: 'Dossier' }]} />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"><Skeleton className="h-96" /><Skeleton className="h-64" /></div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Card>
            <CardHeader title="Les Odu reçus" description="Du plus récent au plus ancien" />
            {reports.length ? (
              <ol className="divide-y divide-border">
                {reports.map((c) => {
                  const odu = oduById(c.report!.oduId);
                  return (
                    <li key={c.id}>
                      <Link href={`/espace/consultations/${c.id}`} className="flex items-center gap-5 px-5 py-5 transition-colors hover:bg-bg-subtle">
                        {odu && <OduGlyph right={odu.marks.right} left={odu.marks.left} size="xs" label={odu.name} />}
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] text-text">{odu?.name} <span className="text-text-faint">· {odu?.fonName}</span></p>
                          <p className="mt-0.5 truncate text-[13px] text-text-muted">« {c.question} »</p>
                        </div>
                        <div className="text-right">
                          <Badge tone={c.report!.orientation === 'IRE' ? 'success' : 'accent'}>{c.report!.orientation === 'IRE' ? 'Ire' : 'Ibi'}</Badge>
                          <p className="mt-1 text-[12px] text-text-faint">{btTime(c.report!.publishedAt!, { dateStyle: 'medium' })}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="p-5"><EmptyState title="Aucun Odu reçu pour le moment" description="Après ta première consultation, l'Odu qui a parlé pour toi apparaîtra ici." action={<ButtonLink href="/consultations/reserver?offre=FIRST_FREE" size="sm">Ma consultation offerte</ButtonLink>} /></div>
            )}
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Mes ewọ̀" description="Les interdits à respecter, consignés à chaque consultation" />
              {data.ewos.length ? (
                <ul className="divide-y divide-border">
                  {data.ewos.map((w) => (
                    <li key={w.id} className="px-5 py-3.5">
                      <p className="text-[14px] text-text">{w.text}</p>
                      {w.source && <p className="mt-0.5 text-[12px] text-text-faint">{w.source}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="px-5 py-6 text-[14px] text-text-muted">Aucun ewọ̀ consigné.</p>}
            </Card>

            <Card>
              <CardHeader title="Mes ebo" />
              {ebos.length ? (
                <ul className="divide-y divide-border">
                  {ebos.map((e) => (
                    <li key={e.id}>
                      <Link href={`/espace/consultations/${e.consultationId}`} className="block px-5 py-4 transition-colors hover:bg-bg-subtle">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[14px] text-text">{e.title}</p>
                          <span className="text-[13px] tabular-nums text-text-muted">{eur(e.materialsCents + e.priestFeeCents, e.currency)}</span>
                        </div>
                        <div className="mt-2"><Badge tone={EBO_STATUS[e.status].tone}>{EBO_STATUS[e.status].label}</Badge></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="px-5 py-6 text-[14px] text-text-muted">Aucun ebo.</p>}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
