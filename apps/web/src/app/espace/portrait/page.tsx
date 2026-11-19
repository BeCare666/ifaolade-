'use client';

import type { Reading } from '@ona/core';
import { SIGNS } from '@ona/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PortraitView } from '@/components/portrait/portrait-view';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { frDate } from '@/lib/site';

interface ReadingView { id: string; createdAt: string; full: boolean; reading: Reading }

/** Plan étape 4.3 : le portrait complet dans l'espace client, avec l'historique. La coquille ClientFrame arrive en phase 6. */
export default function MonPortraitPage() {
  const { token, ready } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<ReadingView[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!token) { router.replace('/connexion?suite=/espace/portrait'); return; }
    apiSend<ReadingView[]>('/readings/mine', undefined, 'GET', token).then(setList).catch((e) => setError(e.message));
  }, [ready, token, router]);

  return (
    <div>
      <PageHeader
        title="Mon portrait"
        breadcrumb={[{ label: 'Mon espace', href: '/espace' }, { label: 'Mon portrait' }]}
        actions={<ButtonLink href="/connais-toi" variant="secondary" size="sm" shape="console">Refaire un portrait</ButtonLink>}
      />
      {error ? (
        <ErrorState description={error} onRetry={() => location.reload()} />
      ) : !list ? (
        <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-96 w-full" /></div>
      ) : !list.length ? (
        <EmptyState title="Tu n'as pas encore de portrait" description="Quatre minutes suffisent." action={<ButtonLink href="/connais-toi">Faire mon portrait</ButtonLink>} />
      ) : (
        <>
          {list.length > 1 && (
            <div className="scrollbar-thin mb-12 flex gap-2 overflow-x-auto">
              {list.map((r, i) => (
                <button
                  key={r.id} onClick={() => setCurrent(i)}
                  className={cn('shrink-0 rounded-full border px-4 py-2 text-[13px] transition-colors', i === current ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong text-text-muted hover:text-text')}
                >
                  {frDate(r.createdAt)} · Soleil en {SIGNS[r.reading.chart.planets[0].sign].name}
                </button>
              ))}
            </div>
          )}
          <PortraitView reading={list[current].reading} full readingId={list[current].id} mode="espace" />
        </>
      )}
    </div>
  );
}
