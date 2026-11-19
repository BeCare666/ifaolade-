'use client';

import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button, ButtonLink } from '@/components/ui/button';
import { ErrorState, Skeleton } from '@/components/ui/primitives';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { eur } from '@/lib/cn';

interface PaymentStatus { id: string; status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'; purpose: string; refId: string; amountCents: number; currency: string }

const TARGET: Record<string, (refId: string) => string> = {
  CONSULTATION: (id) => `/espace/consultations/${id}`,
  EBO: () => '/espace/consultations',
  BOOKING: () => '/espace/voyages',
  EVENT: () => '/espace/evenements',
};

export function PaymentResult({ pid, dev, cancelled }: { pid: string; dev: boolean; cancelled: boolean }) {
  const { token, ready } = useAuth();
  const [p, setP] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [simulating, setSimulating] = useState(false);

  const load = useCallback(async () => {
    try { setP(await apiSend<PaymentStatus>(`/payments/${pid}`, undefined, 'GET', token)); } catch (e) { setError((e as Error).message); }
  }, [pid, token]);

  useEffect(() => { if (ready && pid) load(); }, [ready, pid, load]);
  // Le webhook peut arriver quelques secondes après le retour : on revérifie 10 fois, toutes les 3 s.
  useEffect(() => {
    if (!p || p.status !== 'PENDING' || cancelled || dev || tries >= 10) return;
    const t = setTimeout(() => { setTries((n) => n + 1); load(); }, 3000);
    return () => clearTimeout(t);
  }, [p, tries, load, cancelled, dev]);

  if (!pid) return <ErrorState description="Référence de paiement absente." />;
  if (error) return <ErrorState title="Impossible de vérifier le paiement" description={error} onRetry={load} />;
  if (!p) return <div className="max-w-xl space-y-3"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-5 w-1/2" /></div>;

  const target = TARGET[p.purpose]?.(p.refId) ?? '/espace';

  return (
    <div className="max-w-xl">
      {p.status === 'SUCCEEDED' ? (
        <>
          <CheckCircle2 size={28} className="text-success" />
          <h1 className="mt-5 text-[36px] font-normal leading-[1.05] tracking-[-0.035em] text-text">Paiement reçu.</h1>
          <p className="mt-4 text-[15px] leading-[1.8] text-text-muted">{eur(p.amountCents, p.currency)} confirmés par le serveur. Un reçu t&apos;a été envoyé par email.</p>
          <div className="mt-8"><ButtonLink href={target} size="lg">Continuer</ButtonLink></div>
        </>
      ) : cancelled ? (
        <>
          <XCircle size={28} className="text-text-faint" />
          <h1 className="mt-5 text-[36px] font-normal leading-[1.05] tracking-[-0.035em] text-text">Paiement annulé.</h1>
          <p className="mt-4 text-[15px] leading-[1.8] text-text-muted">Rien n&apos;a été débité. Pour une consultation, le créneau reste réservé 15 minutes après la demande.</p>
          <div className="mt-8"><ButtonLink href={target} variant="secondary">Revenir</ButtonLink></div>
        </>
      ) : (
        <>
          <Clock size={28} className="text-warning" />
          <h1 className="mt-5 text-[36px] font-normal leading-[1.05] tracking-[-0.035em] text-text">Paiement en cours de confirmation.</h1>
          <p className="mt-4 text-[15px] leading-[1.8] text-text-muted">
            {tries >= 10 ? 'La confirmation prend plus de temps que prévu. Ne repaie pas : nous vérifions et tu recevras un email.' : 'Quelques secondes…'}
          </p>
          {dev && (
            <div className="mt-8 space-y-4">
              <Alert tone="info" title="Mode test">Aucun moyen de paiement n&apos;est configuré sur ce serveur de développement. Tu peux simuler un paiement réussi.</Alert>
              <Button
                loading={simulating}
                onClick={async () => {
                  setSimulating(true);
                  try { await apiSend(`/payments/${pid}/dev-confirm`, {}, 'POST', token); await load(); } catch (e) { setError((e as Error).message); } finally { setSimulating(false); }
                }}
              >
                Simuler le paiement (test)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
