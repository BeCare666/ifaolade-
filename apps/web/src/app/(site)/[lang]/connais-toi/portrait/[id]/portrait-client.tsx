'use client';

import type { Reading } from '@ona/core';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PortraitView } from '@/components/portrait/portrait-view';
import { Container } from '@/components/site/editorial';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/primitives';
import { useI18n } from '@/i18n/client';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const LOCAL_READING_KEY = 'ifaolade:local-reading';
interface ReadingView { id: string; full: boolean; claimed: boolean; reading: Reading }

export function PortraitClient({ id, welcome }: { id: string; welcome: boolean }) {
  const { token, ready, user } = useAuth();
  const { d: D, href } = useI18n();
  const d = D.portrait;
  const [data, setData] = useState<ReadingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (id === 'local') {
      try {
        const r = JSON.parse(sessionStorage.getItem(LOCAL_READING_KEY) || 'null') as Reading | null;
        if (!r) { setMissing(true); return; }
        // Même règle que l'API : seules les sections d'aperçu sont visibles sans compte.
        setData({ id: 'local', full: false, claimed: false, reading: { ...r, sections: r.sections.map((s) => (s.preview ? s : { ...s, paragraphs: [], locked: true })) } as Reading });
      } catch { setMissing(true); }
      return;
    }
    apiSend<ReadingView>(`/readings/${id}`, undefined, 'GET', token)
      .then(setData)
      .catch((e) => { if (e.status === 404 || e.status === 403) setMissing(true); else setError(e.message); });
  }, [id, token, ready]);

  return (
    <Container className="py-12 lg:py-20">
      {welcome && data?.full && (
        <div className="mb-12 flex items-start gap-3 rounded-[var(--radius-lg)] border border-success/20 bg-success-soft p-5">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success" />
          <p className="text-[14px] leading-relaxed text-text">{d.welcome}{user && !user.emailVerified ? d.welcomeVerify : ''}</p>
        </div>
      )}
      {missing ? (
        <EmptyState title={d.missing} description={d.missingText} action={<ButtonLink href={href('/connais-toi')}>{D.cta.portrait}</ButtonLink>} />
      ) : error ? (
        <ErrorState title={d.errorTitle} description={error} onRetry={() => location.reload()} />
      ) : !data ? (
        <div className="space-y-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-3/4" />
          <div className="grid gap-12 pt-8 lg:grid-cols-2"><Skeleton className="aspect-square w-full" /><Skeleton className="h-80 w-full" /></div>
        </div>
      ) : (
        <PortraitView reading={data.reading} full={data.full} readingId={data.id === 'local' ? null : data.id} />
      )}
    </Container>
  );
}
