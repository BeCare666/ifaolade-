'use client';

import { CreditCard, Download, Printer, Smartphone, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { btTime } from '@/components/consultation/parts';
import { Alert } from '@/components/ui/alert';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { ConfirmDialog, Modal } from '@/components/ui/overlay';
import { Badge, Card, CardHeader, EmptyState, ErrorState, PageHeader, Skeleton, type Tone } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { eur, fcfa } from '@/lib/cn';
import { startPayment, type Provider } from '@/lib/payments';
import type { EventItem } from '@/lib/types';
import { useApi } from '@/lib/use-api';
import { AvatarCard } from './avatar-card';
import { TicketQr } from './ticket-qr';

// ---------------- Événements ----------------
interface Reg { id: string; seats: number; status: string; totalCents: number; createdAt: string; event: EventItem }

export function MesEvenements() {
  const { token } = useAuth();
  const toast = useToast();
  const { data, error, loading, reload } = useApi<Reg[]>('/events/registrations/mine');
  const [paying, setPaying] = useState<string | null>(null);
  const pay = async (id: string, p: Provider) => { setPaying(`${id}:${p}`); try { await startPayment('EVENT', id, p, token); } catch (e) { toast((e as Error).message, 'error'); setPaying(null); } };
  return (
    <>
      <PageHeader title="Événements" description="Tes inscriptions et tes billets." actions={<ButtonLink href="/evenements" variant="secondary" size="sm" shape="console">Voir les événements</ButtonLink>} />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-40" /> : !data.length ? (
        <EmptyState title="Aucune inscription" action={<ButtonLink href="/evenements">Voir les événements</ButtonLink>} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {data.map((r) => (
            <Card key={r.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[17px] text-text">{r.event.title}</h2>
                <Badge tone={r.status === 'PAID' ? 'success' : r.status === 'CANCELLED' ? 'neutral' : 'warning'}>{r.status === 'PAID' ? 'Billet valide' : r.status === 'CANCELLED' ? 'Annulé' : 'Paiement attendu'}</Badge>
              </div>
              <p className="mt-1 text-[13px] text-text-muted">{btTime(r.event.startsAt, { dateStyle: 'long' })} · {r.event.location} · {r.seats} place(s)</p>
              {r.status === 'PAID' ? (
                <div className="mt-6 flex flex-col items-center rounded-[var(--radius-md)] border border-dashed border-border-strong p-5 text-center">
                  <TicketQr code={r.id} />
                  <p className="mt-3 flex items-center gap-1.5 text-[12px] text-text-faint"><Ticket size={14} strokeWidth={1.5} /> À présenter à l&apos;entrée</p>
                  <p className="mt-1 break-all font-mono text-[15px] tracking-[0.1em] text-text">{r.id}</p>
                </div>
              ) : r.status === 'PENDING' ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" shape="console" loading={paying === `${r.id}:FEEXPAY`} onClick={() => pay(r.id, 'FEEXPAY')}><Smartphone size={16} /> Mobile Money</Button>
                  <Button variant="secondary" shape="console" loading={paying === `${r.id}:STRIPE`} onClick={() => pay(r.id, 'STRIPE')}><CreditCard size={16} /> Carte · {eur(r.totalCents)}</Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function InscriptionEvenement({ slug }: { slug?: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const { data: e, error } = useApi<EventItem>(slug ? `/events/${slug}` : null);
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!slug) return <EmptyState title="Choisis d'abord un événement" action={<ButtonLink href="/evenements">Voir les événements</ButtonLink>} />;
  if (error) return <ErrorState description={error} />;
  if (!e) return <Skeleton className="h-48" />;
  return (
    <div className="max-w-xl">
      <PageHeader title={e.title} description={`${btTime(e.startsAt, { dateStyle: 'long' })} · ${e.location}`} />
      <Card className="space-y-6 p-6">
        <Field label="Nombre de places" htmlFor="s" hint={`${e.seatsLeft} place(s) restante(s)`}><Input id="s" type="number" min={1} max={Math.min(10, e.seatsLeft)} value={seats} onChange={(x) => setSeats(Math.max(1, Number(x.target.value)))} /></Field>
        <p className="text-[15px] text-text">Total : <span className="tabular-nums">{e.priceCents ? `${eur(e.priceCents * seats, e.currency)} (${fcfa(e.priceCents * seats)})` : 'gratuit'}</span></p>
        {err && <ErrorState description={err} />}
        <Button size="lg" className="w-full" loading={busy} onClick={async () => {
          setBusy(true); setErr(null);
          try { await apiSend(`/events/${e.id}/register`, { seats }, 'POST', token); router.push('/espace/evenements'); } catch (x) { setErr((x as Error).message); setBusy(false); }
        }}>{e.priceCents ? 'S\'inscrire, puis payer' : 'Confirmer mon inscription'}</Button>
      </Card>
    </div>
  );
}

// ---------------- Paiements ----------------
interface Pay { id: string; purpose: string; amountCents: number; currency: string; provider: string; providerRef: string | null; status: string; createdAt: string }
const PAY: Record<string, { l: string; t: Tone }> = { PENDING: { l: 'En attente', t: 'warning' }, SUCCEEDED: { l: 'Payé', t: 'success' }, FAILED: { l: 'Échoué', t: 'danger' }, REFUNDED: { l: 'Remboursé', t: 'neutral' } };
const PURPOSE: Record<string, string> = { CONSULTATION: 'Consultation', EBO: 'Ebo', BOOKING: 'Voyage', EVENT: 'Événement' };

export function MesPaiements() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useApi<Pay[]>('/payments/mine');
  const [receipt, setReceipt] = useState<Pay | null>(null);
  const list = (data ?? []).filter((p) => p.status !== 'PENDING');
  return (
    <>
      <PageHeader title="Paiements" description="Ton historique et tes reçus." />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-40" /> : !list.length ? <EmptyState title="Aucun paiement pour le moment" /> : (
        <Card>
          <ul className="divide-y divide-border">
            {list.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1"><p className="text-[14px] text-text">{PURPOSE[p.purpose] ?? p.purpose}</p><p className="text-[12px] tabular-nums text-text-faint">{btTime(p.createdAt, { dateStyle: 'medium', timeStyle: 'short' })} · {p.provider === 'FEEXPAY' ? 'Mobile Money' : 'Carte'}</p></div>
                <span className="tabular-nums text-[15px] text-text">{eur(p.amountCents, p.currency)}</span>
                <Badge tone={PAY[p.status]?.t ?? 'neutral'}>{PAY[p.status]?.l ?? p.status}</Badge>
                {p.status === 'SUCCEEDED' && <Button variant="ghost" size="sm" shape="console" onClick={() => setReceipt(p)}>Reçu</Button>}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Reçu de paiement" footer={<Button size="sm" shape="console" onClick={() => window.print()}><Printer size={15} /> Imprimer ou enregistrer en PDF</Button>}>
        {receipt && (
          <div className="space-y-2 text-[14px]">
            <p className="text-[18px] text-text">Ifaôladé</p>
            <p className="text-text-muted">Reçu n° {receipt.id}</p>
            <div className="mt-4 space-y-1.5 border-t border-border pt-4">
              <p className="flex justify-between"><span className="text-text-muted">Client</span><span>{user?.firstName} {user?.lastName}</span></p>
              <p className="flex justify-between"><span className="text-text-muted">Date</span><span className="tabular-nums">{btTime(receipt.createdAt, { dateStyle: 'long' })}</span></p>
              <p className="flex justify-between"><span className="text-text-muted">Objet</span><span>{PURPOSE[receipt.purpose]}</span></p>
              <p className="flex justify-between"><span className="text-text-muted">Moyen</span><span>{receipt.provider === 'FEEXPAY' ? 'Mobile Money (FeexPay)' : 'Carte bancaire (Stripe)'}</span></p>
              <p className="flex justify-between"><span className="text-text-muted">Référence</span><span className="font-mono text-[12px]">{receipt.providerRef ?? '—'}</span></p>
              <p className="flex justify-between border-t border-border pt-3 text-[16px]"><span>Montant</span><span className="tabular-nums">{eur(receipt.amountCents, receipt.currency)}</span></p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ---------------- Profil et confidentialité ----------------
export function Profil() {
  const { user, token, refresh, logout } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ firstName: '', lastName: '', phone: '', country: '', city: '' });
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);
  useEffect(() => { if (user) setF({ firstName: user.firstName, lastName: user.lastName ?? '', phone: user.phone ?? '', country: user.country ?? '', city: '' }); }, [user]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function exportData() {
    try {
      const data = await apiSend<unknown>('/me/export', undefined, 'GET', token);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = `ifaolade-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (e) { toast((e as Error).message, 'error'); }
  }

  return (
    <>
      <PageHeader title="Profil et confidentialité" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card>
          <CardHeader title="Mon profil" description={user?.email} />
          <form className="space-y-5 p-5" onSubmit={async (e) => {
            e.preventDefault(); setBusy(true);
            try { await apiSend('/me', { firstName: f.firstName, lastName: f.lastName || undefined, phone: f.phone || undefined, country: f.country || undefined }, 'PATCH', token); await refresh(); toast('Profil enregistré'); }
            catch (x) { toast((x as Error).message, 'error'); } finally { setBusy(false); }
          }}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Prénom" htmlFor="fn"><Input id="fn" required value={f.firstName} onChange={set('firstName')} /></Field>
              <Field label="Nom" htmlFor="ln"><Input id="ln" value={f.lastName} onChange={set('lastName')} /></Field>
              <Field label="Téléphone" htmlFor="ph" hint="Utile pour Mobile Money et les voyages"><Input id="ph" type="tel" value={f.phone} onChange={set('phone')} /></Field>
              <Field label="Pays de résidence" htmlFor="co"><Input id="co" value={f.country} onChange={set('country')} /></Field>
            </div>
            <Button type="submit" shape="console" loading={busy}>Enregistrer</Button>
          </form>
        </Card>
        <div className="space-y-6">
          <AvatarCard />
          <Card>
            <CardHeader title="Mes données" />
            <div className="space-y-4 p-5">
              <p className="text-[14px] leading-relaxed text-text-muted">Télécharge toutes tes données : profil, portraits, consultations, comptes rendus, ewọ̀, ebo, paiements.</p>
              <Button variant="secondary" shape="console" onClick={exportData}><Download size={15} /> Exporter mes données</Button>
            </div>
          </Card>
          <Card>
            <CardHeader title="Supprimer mon compte" />
            <div className="space-y-4 p-5">
              <Alert tone="warning">Tes portraits et tes ewọ̀ sont effacés et ton identité est anonymisée. Les paiements sont conservés sous forme anonyme pour la comptabilité. C&apos;est définitif.</Alert>
              <Button variant="ghost" shape="console" onClick={() => setDel(true)}>Supprimer mon compte</Button>
            </div>
          </Card>
        </div>
      </div>
      <ConfirmDialog open={del} onClose={() => setDel(false)} danger confirmLabel="Supprimer définitivement" title="Supprimer ton compte ?"
        message="Cette action ne peut pas être annulée. Pense à exporter tes données avant si tu veux les garder."
        onConfirm={async () => { await apiSend('/me', undefined, 'DELETE', token); await logout(); window.location.href = '/'; }} />
    </>
  );
}
