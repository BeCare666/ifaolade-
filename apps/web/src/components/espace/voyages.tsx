'use client';

import { CreditCard, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { btTime } from '@/components/consultation/parts';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { ConfirmDialog } from '@/components/ui/overlay';
import { Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton, type Tone } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { eur, fcfa } from '@/lib/cn';
import { startPayment, type Provider } from '@/lib/payments';
import type { Program } from '@/lib/types';
import { useApi } from '@/lib/use-api';

const STATUS: Record<string, { l: string; t: Tone }> = {
  PENDING: { l: 'Acompte à payer', t: 'warning' }, DEPOSIT_PAID: { l: 'Acompte payé, solde à J-30', t: 'info' }, PAID: { l: 'Soldé', t: 'success' }, CANCELLED: { l: 'Annulée', t: 'neutral' },
};
interface Booking { id: string; status: string; participants: number; totalCents: number; paidCents: number; currency: string; session: { id: string; startDate: string; endDate: string; program: Program } }

const CHECKLIST = [
  'Passeport valide au moins 6 mois après le retour',
  'Visa ou e-visa pour le Bénin, selon ta nationalité',
  'Carnet de vaccination : fièvre jaune obligatoire',
  'Assurance voyage (frais médicaux et rapatriement)',
  'Traitement préventif contre le paludisme, à voir avec ton médecin',
  'Tenue blanche et effets demandés par le prêtre pour une initiation',
];

/** Plan §8 et §10.6 : mes voyages, acompte puis solde, liste de préparation. */
export function Voyages() {
  const { token } = useAuth();
  const toast = useToast();
  const { data, error, loading, reload } = useApi<Booking[]>('/bookings/mine');
  const [paying, setPaying] = useState<string | null>(null);
  const [cancel, setCancel] = useState<Booking | null>(null);

  const pay = async (id: string, p: Provider) => {
    setPaying(`${id}:${p}`);
    try { await startPayment('BOOKING', id, p, token); } catch (e) { toast((e as Error).message, 'error'); setPaying(null); }
  };

  return (
    <>
      <PageHeader title="Mes voyages" description="Initiations, circuits et retraites au Bénin." actions={<ButtonLink href="/initiation" variant="secondary" size="sm" shape="console">Voir les programmes</ButtonLink>} />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-48" /> : !data.length ? (
        <EmptyState title="Aucun voyage réservé" description="Initiation en forêt sacrée, circuits Vodoun, Vodun Days à Ouidah." action={<ButtonLink href="/initiation">Découvrir les programmes</ButtonLink>} />
      ) : (
        <div className="space-y-6">
          {data.map((b) => {
            const due = b.totalCents - b.paidCents;
            const next = b.paidCents === 0 ? Math.round(b.totalCents * 0.3) : due;
            return (
              <Card key={b.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[18px] tracking-[-0.01em] text-text">{b.session.program.title}</h2>
                    <p className="mt-1 text-[13px] text-text-muted">{btTime(b.session.startDate, { dateStyle: 'long' })} au {btTime(b.session.endDate, { dateStyle: 'long' })} · {b.participants} personne(s)</p>
                  </div>
                  <Badge tone={STATUS[b.status]?.t ?? 'neutral'}>{STATUS[b.status]?.l ?? b.status}</Badge>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {[['Total', b.totalCents], ['Déjà payé', b.paidCents], ['Reste à payer', due]].map(([l, v]) => (
                    <div key={l as string} className="rounded-[var(--radius-md)] bg-bg-subtle p-4"><p className="text-[12px] text-text-faint">{l}</p><p className="mt-1 text-[18px] tabular-nums text-text">{eur(v as number, b.currency)}</p></div>
                  ))}
                </div>
                {(b.status === 'PENDING' || b.status === 'DEPOSIT_PAID') && (
                  <div className="mt-6 border-t border-border pt-6">
                    <p className="text-[14px] text-text">{b.paidCents === 0 ? 'Acompte de 30 %' : 'Solde'} : <span className="tabular-nums">{eur(next, b.currency)}</span> <span className="text-text-faint">({fcfa(next)})</span></p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Button variant="secondary" shape="console" loading={paying === `${b.id}:FEEXPAY`} onClick={() => pay(b.id, 'FEEXPAY')}><Smartphone size={16} /> Mobile Money</Button>
                      <Button variant="secondary" shape="console" loading={paying === `${b.id}:STRIPE`} onClick={() => pay(b.id, 'STRIPE')}><CreditCard size={16} /> Carte bancaire</Button>
                      <Button variant="ghost" size="sm" onClick={() => setCancel(b)}>Annuler</Button>
                    </div>
                  </div>
                )}
                {b.status !== 'CANCELLED' && (
                  <details className="mt-6 border-t border-border pt-5">
                    <summary className="cursor-pointer text-[14px] text-text">Préparer mon voyage</summary>
                    <ul className="mt-4 space-y-2">{CHECKLIST.map((c) => <li key={c} className="flex gap-3 text-[14px] text-text-muted"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />{c}</li>)}</ul>
                  </details>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <ConfirmDialog open={!!cancel} onClose={() => setCancel(null)} danger confirmLabel="Annuler la réservation" title="Annuler cette réservation ?"
        message="Les sommes déjà versées sont remboursées selon les conditions générales de vente."
        onConfirm={async () => { if (!cancel) return; await apiSend(`/bookings/${cancel.id}/cancel`, {}, 'POST', token); toast('Réservation annulée'); reload(); }} />
    </>
  );
}

/** Réserver une session (lien depuis la fiche programme). */
export function ReserverVoyage({ slug, sessionId }: { slug?: string; sessionId?: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const { data: p, error } = useApi<Program>(slug ? `/programs/${slug}` : null);
  const [participants, setParticipants] = useState(1);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const session = p?.sessions.find((s) => s.id === sessionId);

  if (!slug || !sessionId) return <EmptyState title="Choisis d'abord une session" action={<ButtonLink href="/initiation">Voir les programmes</ButtonLink>} />;
  if (error) return <ErrorState description={error} />;
  if (!p) return <Skeleton className="h-64" />;
  if (!session) return <EmptyState title="Cette session n'est plus disponible" action={<ButtonLink href={`/programmes/${slug}`}>Revenir au programme</ButtonLink>} />;
  const total = p.priceCents * participants;

  return (
    <div className="max-w-2xl">
      <PageHeader title={p.title} description={`${btTime(session.startDate, { dateStyle: 'long' })} au ${btTime(session.endDate, { dateStyle: 'long' })}`} />
      <Card className="space-y-6 p-6">
        <Field label="Nombre de personnes" htmlFor="n" hint={`${session.seatsLeft ?? session.capacity} place(s) restante(s)`}>
          <Input id="n" type="number" min={1} max={Math.min(20, session.seatsLeft ?? session.capacity)} value={participants} onChange={(e) => setParticipants(Math.max(1, Number(e.target.value)))} />
        </Field>
        <Field label="À savoir pour t'accueillir" htmlFor="no" hint="Facultatif : santé, régime alimentaire, questions…"><Textarea id="no" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        <div className="rounded-[var(--radius-md)] bg-bg-subtle p-4 text-[14px]">
          <p className="flex justify-between"><span className="text-text-muted">Total</span><span className="tabular-nums text-text">{eur(total, p.currency)}</span></p>
          <p className="mt-1 flex justify-between"><span className="text-text-muted">Acompte de 30 % aujourd&apos;hui</span><span className="tabular-nums text-text">{eur(Math.round(total * 0.3), p.currency)}</span></p>
          <p className="mt-1 text-[12px] text-text-faint">Le solde est demandé 30 jours avant le départ.</p>
        </div>
        {err && <ErrorState description={err} />}
        <Button size="lg" className="w-full" loading={busy} onClick={async () => {
          setBusy(true); setErr(null);
          try { await apiSend('/bookings', { sessionId: session.id, participants, notes: notes || undefined }, 'POST', token); router.push('/espace/voyages'); }
          catch (e) { setErr((e as Error).message); setBusy(false); }
        }}>Réserver, puis payer l&apos;acompte</Button>
      </Card>
    </div>
  );
}
