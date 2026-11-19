'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { ErrorState, Skeleton } from '@/components/ui/primitives';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function VerifyEmail({ token }: { token?: string }) {
  const { refresh } = useAuth();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(token ? 'loading' : 'error');
  const [msg, setMsg] = useState('Lien incomplet.');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.message || 'Lien invalide ou déjà utilisé.');
        setState('ok');
        refresh();
      })
      .catch((e) => { setMsg((e as Error).message); setState('error'); });
  }, [token, refresh]);

  if (state === 'loading') return <div className="space-y-3"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-5 w-1/2" /></div>;
  if (state === 'error') return <ErrorState title="Confirmation impossible" description={msg} />;
  return (
    <div>
      <p className="flex items-center gap-3 text-[16px] text-text"><CheckCircle2 size={20} className="text-success" /> Ton email est confirmé.</p>
      <p className="mt-3 text-[15px] text-text-muted">Ta première consultation offerte est maintenant disponible.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/consultations/reserver?offre=FIRST_FREE">Utiliser ma consultation offerte</ButtonLink>
        <ButtonLink href="/espace/portrait" variant="secondary">Mon portrait</ButtonLink>
      </div>
    </div>
  );
}
