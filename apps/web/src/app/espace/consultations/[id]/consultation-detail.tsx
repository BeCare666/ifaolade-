'use client';

import { CreditCard, Printer, Smartphone, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { btTime, EBO_STATUS, EboItemsTable, FollowUpScale, ReportView, StatusBadge } from '@/components/consultation/parts';
import { Alert } from '@/components/ui/alert';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { ConfirmDialog, Tabs } from '@/components/ui/overlay';
import { Badge, Card, EmptyState, ErrorState, KeyValue, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { eur, fcfa } from '@/lib/cn';
import { startPayment, type Provider } from '@/lib/payments';
import type { Consultation, Ebo, FollowUp } from '@/lib/types';
import { useApi, useRequireAuth } from '@/lib/use-api';

type Tab = 'resume' | 'compte-rendu' | 'ebo' | 'suivi';

export function ConsultationDetail({ id, isNew }: { id: string; isNew: boolean }) {
  const { ready } = useRequireAuth(`/espace/consultations/${id}`);
  const { token } = useAuth();
  const toast = useToast();
  const { data: c, error, status, reload } = useApi<Consultation>(ready ? `/consultations/${id}` : null);
  const [tab, setTab] = useState<Tab>('resume');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);

  if (status === 404 || status === 403) return <div><EmptyState title="Consultation introuvable" action={<ButtonLink href="/espace/consultations">Mes consultations</ButtonLink>} /></div>;
  if (error) return <div><ErrorState description={error} onRetry={reload} /></div>;
  if (!c) return <div><Skeleton className="h-10 w-1/2" /><Skeleton className="mt-6 h-64 w-full" /></div>;

  const start = c.slot ? new Date(c.slot.startsAt).getTime() : null;
  const end = c.slot ? new Date(c.slot.endsAt).getTime() : null;
  const roomOpen = !!c.roomUrl && c.status === 'CONFIRMED' && start !== null && end !== null && now >= start - 10 * 60_000 && now <= end + 30 * 60_000;
  const canCancel = c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && (!start || start > now);
  const pendingEbo = c.ebos.filter((e) => e.status === 'PROPOSED').length;
  const openFollowUps = c.followUps.filter((f) => !f.answeredAt && new Date(f.dueAt).getTime() <= now + 86400_000).length;

  async function pay(purpose: 'CONSULTATION' | 'EBO', refId: string, provider: Provider) {
    setPaying(`${refId}:${provider}`);
    try { await startPayment(purpose, refId, provider, token); } catch (e) { toast((e as Error).message, 'error'); setPaying(null); }
  }

  return (
    <div>
      <PageHeader
        title={c.offer.title}
        description={`Demande du ${btTime(c.createdAt, { dateStyle: 'long' })}`}
        breadcrumb={[{ label: 'Mon espace', href: '/espace' }, { label: 'Consultations', href: '/espace/consultations' }, { label: c.offer.title }]}
        actions={<StatusBadge status={c.status} />}
      />
      {isNew && <div className="mb-8 no-print"><Alert tone="success" title="Ta demande est enregistrée">Tu as reçu une confirmation par email. Tout se passe ici : rendez-vous, compte rendu, suivi.</Alert></div>}

      <div className="no-print">
        <Tabs<Tab> value={tab} onChange={setTab} tabs={[
          { value: 'resume', label: 'Résumé' },
          { value: 'compte-rendu', label: 'Compte rendu' },
          { value: 'ebo', label: 'Ebo', count: c.ebos.length || undefined },
          { value: 'suivi', label: 'Suivi', count: openFollowUps || undefined },
        ]} />
      </div>

      <div className="mt-8 max-w-3xl">
        {tab === 'resume' && (
          <div className="space-y-6">
            {c.status === 'AWAITING_PAYMENT' && (
              <Card className="p-6">
                <p className="text-[15px] text-text">Paiement en attente : {eur(c.priceCents, c.currency)} <span className="text-text-faint">({fcfa(c.priceCents)})</span></p>
                <p className="mt-1 text-[13px] text-text-muted">Sans paiement dans les 15 minutes suivant la demande, le créneau est libéré.</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" shape="console" loading={paying === `${c.id}:FEEXPAY`} onClick={() => pay('CONSULTATION', c.id, 'FEEXPAY')}><Smartphone size={16} /> Mobile Money</Button>
                  <Button variant="secondary" shape="console" loading={paying === `${c.id}:STRIPE`} onClick={() => pay('CONSULTATION', c.id, 'STRIPE')}><CreditCard size={16} /> Carte bancaire</Button>
                </div>
              </Card>
            )}
            {c.slot && c.status !== 'CANCELLED' && (
              <Card className="p-6">
                <p className="text-[13px] text-text-faint">Rendez-vous en visio</p>
                <p className="mt-1 text-[18px] tracking-[-0.01em] text-text">{btTime(c.slot.startsAt)} <span className="text-[14px] text-text-faint">(heure du Bénin)</span></p>
                <p className="mt-1 text-[13px] text-text-muted">Chez toi : {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(c.slot.startsAt))}</p>
                <div className="mt-5">
                  {roomOpen ? (
                    <a href={c.roomUrl!} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[14px] font-medium text-primary-foreground hover:bg-primary-hover"><Video size={16} /> Rejoindre la visio</a>
                  ) : c.status === 'CONFIRMED' ? (
                    <p className="text-[13px] text-text-muted">Le bouton « Rejoindre la visio » s&apos;active 10 minutes avant l&apos;heure. Prépare un endroit calme.</p>
                  ) : null}
                </div>
              </Card>
            )}
            {!c.slot && c.status === 'CONFIRMED' && <Alert tone="info" title="Consultation par écrit">Ta réponse sera déposée ici, dans l&apos;onglet Compte rendu, sous 72 heures.</Alert>}
            {pendingEbo > 0 && <Alert tone="warning" title="Une proposition d'ebo t'attend">Consulte l&apos;onglet Ebo. Tu es libre d&apos;accepter ou de refuser.</Alert>}
            <Card className="p-6">
              <KeyValue items={[
                { label: 'Ta question', value: <span className="italic">« {c.question} »</span> },
                ...(c.context ? [{ label: 'Contexte', value: <span className="whitespace-pre-line">{c.context}</span> }] : []),
                { label: 'Prix', value: c.isFirstFree ? 'Offerte' : `${eur(c.priceCents, c.currency)} (prix fixé à la réservation)` },
              ]} />
            </Card>
            {canCancel && <Button variant="ghost" size="sm" onClick={() => setCancelOpen(true)}>Annuler cette consultation</Button>}
            <ConfirmDialog
              open={cancelOpen} onClose={() => setCancelOpen(false)} danger confirmLabel="Annuler la consultation"
              title="Annuler cette consultation ?"
              message={c.status === 'CONFIRMED' && !c.isFirstFree ? 'Le créneau sera libéré. Le remboursement suit les conditions générales de vente.' : 'Le créneau sera libéré.'}
              onConfirm={async () => { await apiSend(`/consultations/${c.id}/cancel`, {}, 'POST', token); toast('Consultation annulée'); reload(); }}
            />
          </div>
        )}

        {tab === 'compte-rendu' && (
          c.report ? (
            <div>
              <div className="no-print mb-6 flex justify-end"><Button variant="secondary" shape="console" size="sm" onClick={() => window.print()}><Printer size={15} /> Imprimer ou enregistrer en PDF</Button></div>
              <div className="print-only mb-8"><p className="text-[20px]">Ifaôladé · Compte rendu de consultation</p><p className="text-[13px]">{btTime(c.report.publishedAt ?? c.createdAt, { dateStyle: 'long' })} · « {c.question} »</p></div>
              <ReportView report={c.report} />
            </div>
          ) : (
            <EmptyState title="Ton compte rendu est en préparation" description={c.status === 'CONFIRMED' ? 'Il sera déposé ici après ta consultation, et tu recevras un email.' : 'Il sera disponible après ta consultation.'} />
          )
        )}

        {tab === 'ebo' && (
          c.ebos.length ? (
            <div className="space-y-6">{c.ebos.map((e) => <EboCard key={e.id} ebo={e} onChanged={reload} onPay={(p) => pay('EBO', e.id, p)} paying={paying} />)}</div>
          ) : (
            <EmptyState title="Aucun ebo proposé" description="Si Ifá demande un ebo, tu recevras ici une proposition détaillée, que tu seras libre de refuser." />
          )
        )}

        {tab === 'suivi' && (
          c.followUps.length ? (
            <div className="space-y-6">{c.followUps.map((f) => <FollowUpCard key={f.id} f={f} now={now} onSaved={reload} />)}</div>
          ) : (
            <EmptyState title="Le suivi commence après ton compte rendu" description="Nous reviendrons vers toi à J+7, J+30 et J+90." />
          )
        )}
      </div>
    </div>
  );
}

function EboCard({ ebo, onChanged, onPay, paying }: { ebo: Ebo; onChanged: () => void; onPay: (p: Provider) => void; paying: string | null }) {
  const { token } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);
  const s = EBO_STATUS[ebo.status];
  const decide = async (accept: boolean) => {
    setBusy(accept ? 'accept' : 'decline');
    try { await apiSend(`/ebos/${ebo.id}/${accept ? 'accept' : 'decline'}`, {}, 'POST', token); toast(accept ? 'Ebo accepté' : 'Ebo refusé'); onChanged(); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(null); }
  };
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-[18px] tracking-[-0.01em] text-text">{ebo.title}</h3>
        <Badge tone={s.tone}>{s.label}</Badge>
      </div>
      <p className="mt-3 text-[15px] leading-[1.75] text-text-muted">{ebo.purpose}</p>
      <div className="mt-6"><EboItemsTable ebo={ebo} /></div>
      {ebo.liveAllowed && ebo.status !== 'PERFORMED' && ebo.status !== 'DECLINED' && <p className="mt-4 text-[13px] text-text-muted">Tu peux demander à assister à l&apos;ebo en direct, en visio.</p>}

      {ebo.status === 'PROPOSED' && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-[14px] text-text">Tu es entièrement libre. Refuser ne change rien à ton accompagnement.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" shape="console" loading={busy === 'accept'} onClick={() => decide(true)}>J&apos;accepte cet ebo</Button>
            <Button variant="secondary" shape="console" loading={busy === 'decline'} onClick={() => decide(false)}>Je refuse</Button>
          </div>
        </div>
      )}
      {ebo.status === 'ACCEPTED' && (
        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
          <Button variant="secondary" shape="console" loading={paying === `${ebo.id}:FEEXPAY`} onClick={() => onPay('FEEXPAY')}><Smartphone size={16} /> Payer en Mobile Money</Button>
          <Button variant="secondary" shape="console" loading={paying === `${ebo.id}:STRIPE`} onClick={() => onPay('STRIPE')}><CreditCard size={16} /> Payer par carte</Button>
        </div>
      )}
      {ebo.status === 'PAID' && <p className="mt-6 border-t border-border pt-6 text-[14px] text-text-muted">Paiement reçu. L&apos;ebo sera réalisé et filmé ; la vidéo apparaîtra ici.</p>}
      {ebo.status === 'PERFORMED' && ebo.proofVideoUrl && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-[14px] text-text">Preuve vidéo{ebo.performedAt ? `, ${btTime(ebo.performedAt, { dateStyle: 'long' })}` : ''}</p>
          <video controls preload="metadata" className="mt-4 w-full rounded-[var(--radius-md)] bg-black" src={ebo.proofVideoUrl} />
        </div>
      )}
    </Card>
  );
}

function FollowUpCard({ f, now, onSaved }: { f: FollowUp; now: number; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [progress, setProgress] = useState<number | null>(f.progress);
  const [note, setNote] = useState(f.note ?? '');
  const [busy, setBusy] = useState(false);
  const open = !f.answeredAt && new Date(f.dueAt).getTime() <= now + 86400_000;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[16px] text-text">Suivi J+{f.dayOffset}</p>
        <span className="text-[13px] text-text-faint">{f.answeredAt ? 'Répondu' : open ? 'À remplir' : `À partir du ${btTime(f.dueAt, { dateStyle: 'long' })}`}</span>
      </div>
      {f.answeredAt ? (
        <div className="mt-4 space-y-3">
          <p className="text-[14px] text-text-muted">Ta progression : <span className="tabular-nums text-text">{f.progress}/10</span></p>
          {f.note && <p className="whitespace-pre-line text-[14px] text-text-muted">« {f.note} »</p>}
          {f.priestReply && <div className="rounded-[var(--radius-md)] bg-bg-subtle p-4"><p className="text-[12px] text-text-faint">Réponse du prêtre</p><p className="mt-1 whitespace-pre-line text-[14px] text-text">{f.priestReply}</p></div>}
        </div>
      ) : open ? (
        <form
          className="mt-5 space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (progress === null) { toast('Choisis un chiffre de 0 à 10', 'error'); return; }
            setBusy(true);
            try { await apiSend(`/follow-ups/${f.id}/answer`, { progress, note: note || undefined }, 'POST', token); toast('Merci, ton suivi est enregistré'); onSaved(); } catch (err) { toast((err as Error).message, 'error'); } finally { setBusy(false); }
          }}
        >
          <p className="text-[15px] text-text">Qu&apos;est-ce qui a changé depuis ta consultation ?</p>
          <FollowUpScale value={progress} onChange={setProgress} />
          <Field label="En quelques mots" htmlFor={`n-${f.id}`}><Textarea id={`n-${f.id}`} rows={3} maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <Button type="submit" shape="console" loading={busy}>Envoyer mon suivi</Button>
        </form>
      ) : null}
    </Card>
  );
}
