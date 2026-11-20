'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { buttonClass } from '@/components/ui/button';
import { ErrorState, Skeleton } from '@/components/ui/primitives';
import { useI18n } from '@/i18n/client';
import { API_URL } from '@/lib/api';

/**
 * Confirmation de l'email. L'appel n'est fait qu'UNE fois (garde par référence) : avant, un second appel
 * déclenché par le rafraîchissement de session tombait sur un jeton déjà consommé et affichait « lien expiré ».
 * L'API est aussi devenue idempotente : recliquer sur le lien confirme sans erreur.
 */
export function VerifyEmail({ token }: { token?: string }) {
  const { d: D, href } = useI18n();
  const d = D.auth;
  const done = useRef(false);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(token ? 'loading' : 'error');
  const [msg, setMsg] = useState<string>(d.verifyMissing);

  useEffect(() => {
    if (!token || done.current) return;
    done.current = true;
    fetch(`${API_URL}/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.message || d.verifyError);
        try { sessionStorage.removeItem('ifaolade:pending-email'); } catch { /* rien */ }
        setState('ok');
      })
      .catch((e) => { setMsg((e as Error).message); setState('error'); });
  }, [token, d.verifyError]);

  if (state === 'loading') return <div className="space-y-3"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-5 w-1/2" /></div>;
  if (state === 'error') return <ErrorState title={d.verifyError} description={msg} />;
  return (
    <div>
      <p className="flex items-center gap-3 text-[17px] text-text"><CheckCircle2 size={22} className="text-success" /> {d.verifiedTitle}</p>
      <p className="mt-3 text-[15px] leading-[1.75] text-text-muted">{d.verifiedText}</p>
      <div className="mt-8"><Link href={href('/connexion')} className={buttonClass({ size: 'lg' })}>{d.verifiedLogin}</Link></div>
    </div>
  );
}
