'use client';

import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CloudinaryUpload, ListEditor, OduPicker } from '@/components/admin/editors';
import { btTime, EBO_STATUS, EboItemsTable, ReportView, StatusBadge } from '@/components/consultation/parts';
import { Alert } from '@/components/ui/alert';
import { Button, IconButton } from '@/components/ui/button';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/field';
import { ConfirmDialog, Tabs } from '@/components/ui/overlay';
import { Badge, Card, CardHeader, EmptyState, ErrorState, KeyValue, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { eur } from '@/lib/cn';
import type { Consultation, Ebo, EboItem, FollowUp } from '@/lib/types';
import { useApi } from '@/lib/use-api';

type Tab = 'preparation' | 'compte-rendu' | 'ebo' | 'suivis';

export function AdminConsultation({ id }: { id: string }) {
  const { data: c, error, reload } = useApi<Consultation>(`/consultations/${id}`);
  const [tab, setTab] = useState<Tab>('preparation');
  const [cancelOpen, setCancelOpen] = useState(false);
  const { token } = useAuth();
  const toast = useToast();

  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!c) return <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-72 w-full" /></div>;
  const toReply = c.followUps.filter((f) => f.answeredAt && !f.priestReply).length;

  return (
    <>
      <PageHeader
        title={`${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''} · ${c.offer.title}`}
        description={c.slot ? `${btTime(c.slot.startsAt)} (heure du Bénin)` : 'Consultation par écrit'}
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Consultations', href: '/admin/consultations' }, { label: c.user?.firstName ?? 'Consultation' }]}
        actions={<StatusBadge status={c.status} />}
      />
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[
        { value: 'preparation', label: 'Préparation' },
        { value: 'compte-rendu', label: c.report?.publishedAt ? 'Compte rendu (publié)' : 'Compte rendu' },
        { value: 'ebo', label: 'Ebo', count: c.ebos.length || undefined },
        { value: 'suivis', label: 'Suivis', count: toReply || undefined },
      ]} />
      <div className="mt-6">
        {tab === 'preparation' && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <Card>
              <CardHeader title="La demande" />
              <div className="p-5"><KeyValue items={[
                { label: 'Question', value: <span className="italic">« {c.question} »</span> },
                { label: 'Contexte', value: c.context ? <span className="whitespace-pre-line">{c.context}</span> : '—' },
                { label: 'Portrait', value: c.readingId ? <Link href={`/connais-toi/portrait/${c.readingId}`} target="_blank" className="inline-flex items-center gap-1 text-primary underline underline-offset-4">Ouvrir le portrait <ExternalLink size={13} /></Link> : 'Aucun' },
              ]} /></div>
            </Card>
            <div className="space-y-6">
              <Card>
                <CardHeader title="Client" />
                <div className="p-5"><KeyValue items={[
                  { label: 'Nom', value: `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}` },
                  { label: 'Email', value: c.user?.email },
                  { label: 'Pays', value: c.user?.country ?? '—' },
                  { label: 'Prix', value: c.isFirstFree ? 'Offerte' : eur(c.priceCents, c.currency) },
                ]} /></div>
              </Card>
              {c.roomUrl && c.status === 'CONFIRMED' && (
                <a href={c.roomUrl} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary-hover">Ouvrir la salle de visio <ExternalLink size={15} /></a>
              )}
              {c.status !== 'CANCELLED' && c.status !== 'COMPLETED' && <Button variant="ghost" size="sm" shape="console" onClick={() => setCancelOpen(true)}>Annuler la consultation</Button>}
              <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} danger confirmLabel="Annuler" title="Annuler cette consultation ?" message="Le créneau sera libéré. Un remboursement éventuel se fait depuis le moyen de paiement, selon les CGV."
                onConfirm={async () => { await apiSend(`/admin/consultations/${c.id}`, { status: 'CANCELLED' }, 'PATCH', token); toast('Consultation annulée'); reload(); }} />
            </div>
          </div>
        )}
        {tab === 'compte-rendu' && <ReportEditor c={c} onSaved={reload} />}
        {tab === 'ebo' && <EboTab c={c} onChanged={reload} />}
        {tab === 'suivis' && (
          c.followUps.length ? <div className="max-w-3xl space-y-4">{c.followUps.map((f) => <FollowUpReply key={f.id} f={f} onSaved={reload} />)}</div>
            : <EmptyState title="Pas encore de suivis" description="Ils sont créés automatiquement à la publication du compte rendu (J+7, J+30, J+90)." />
        )}
      </div>
    </>
  );
}

function ReportEditor({ c, onSaved }: { c: Consultation; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const r = c.report;
  const [oduId, setOduId] = useState<number | null>(r?.oduId ?? null);
  const [orientation, setOrientation] = useState<'IRE' | 'IBI'>(r?.orientation ?? 'IRE');
  const [oriDetail, setOriDetail] = useState(r?.oriDetail ?? '');
  const [ese, setEse] = useState(r?.ese ?? '');
  const [message, setMessage] = useState(r?.message ?? '');
  const [actionPlan, setActionPlan] = useState<string[]>(r?.actionPlan?.length ? r.actionPlan : ['', '', '']);
  const [ewo, setEwo] = useState<string[]>(r?.ewo ?? []);
  const [notes, setNotes] = useState(r?.privateNotes ?? '');
  const [busy, setBusy] = useState<'draft' | 'publish' | null>(null);
  const [confirm, setConfirm] = useState(false);
  const published = !!r?.publishedAt;

  const payload = (publish: boolean) => ({
    oduId: oduId ?? -1, orientation, oriDetail: oriDetail || undefined, ese, message,
    actionPlan: actionPlan.map((a) => a.trim()).filter(Boolean), ewo: ewo.map((w) => w.trim()).filter(Boolean),
    privateNotes: notes || undefined, publish,
  });
  const missing = oduId === null ? 'Choisis l\'Odu sorti.' : !message.trim() ? 'Écris le message.' : !ese.trim() ? 'Écris l\'ese.' : null;

  async function save(publish: boolean) {
    if (missing) { toast(missing, 'error'); return; }
    setBusy(publish ? 'publish' : 'draft');
    try {
      await apiSend(`/admin/consultations/${c.id}/report`, payload(publish), 'PUT', token);
      toast(publish ? 'Compte rendu publié : le client est prévenu, les suivis J+7/30/90 sont programmés' : 'Brouillon enregistré');
      onSaved();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(null); }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <Card className="p-6">
        {published && <div className="mb-6"><Alert tone="success" title={`Publié le ${btTime(r!.publishedAt!, { dateStyle: 'long' })}`}>Les modifications enregistrées restent visibles par le client.</Alert></div>}
        <div className="space-y-8">
          <Field label="L'Odu sorti"><OduPicker value={oduId} onChange={setOduId} /></Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Orientation">
              <div className="flex gap-2">
                {(['IRE', 'IBI'] as const).map((o) => (
                  <button key={o} type="button" onClick={() => setOrientation(o)} className={`h-10 flex-1 rounded-[var(--radius-md)] border text-[14px] ${orientation === o ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong text-text-muted'}`}>
                    {o === 'IRE' ? 'Ire' : 'Ibi'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Précision" htmlFor="od" hint="Ex. : ire owó, ibi ikú…"><Input id="od" value={oriDetail} onChange={(e) => setOriDetail(e.target.value)} /></Field>
          </div>
          <Field label="L'ese (la parole d'Ifá)" htmlFor="ese"><Textarea id="ese" rows={6} value={ese} onChange={(e) => setEse(e.target.value)} /></Field>
          <Field label="Le message pour le client" htmlFor="msg"><Textarea id="msg" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
          <Field label="Plan d'action (3 à 5 actions concrètes)"><ListEditor items={actionPlan} onChange={setActionPlan} placeholder="Une action concrète, dans la vie réelle" max={8} /></Field>
          <Field label="Ewọ̀ (interdits) à consigner"><ListEditor items={ewo} onChange={setEwo} placeholder="Ex. : ne pas consommer d'huile de palme" max={20} /></Field>
          <Field label="Notes privées" htmlFor="pn" hint="Jamais visibles par le client."><Textarea id="pn" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        </div>
        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
          <Button variant="secondary" shape="console" loading={busy === 'draft'} onClick={() => save(false)}>{published ? 'Enregistrer les modifications' : 'Enregistrer le brouillon'}</Button>
          {!published && <Button shape="console" loading={busy === 'publish'} onClick={() => (missing ? toast(missing, 'error') : setConfirm(true))}>Publier</Button>}
        </div>
        <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} confirmLabel="Publier" title="Publier ce compte rendu ?"
          message="Le client reçoit un email, la consultation passe à « Compte rendu publié », les ewọ̀ sont ajoutés à son dossier et les suivis J+7, J+30, J+90 sont programmés."
          onConfirm={() => save(true)} />
      </Card>
      <div className="xl:sticky xl:top-24">
        <Card>
          <CardHeader title="Aperçu client" />
          <div className="p-6">
            {oduId !== null ? <ReportView report={{ oduId, orientation, oriDetail, ese, message, actionPlan: actionPlan.filter(Boolean), ewo: ewo.filter(Boolean) }} /> : <p className="text-[14px] text-text-muted">Choisis l&apos;Odu pour voir l&apos;aperçu.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EboTab({ c, onChanged }: { c: Consultation; onChanged: () => void }) {
  const [creating, setCreating] = useState(c.ebos.length === 0);
  return (
    <div className="max-w-4xl space-y-6">
      {c.ebos.map((e) => <EboAdminCard key={e.id} ebo={e} onChanged={onChanged} />)}
      {creating ? <EboForm consultationId={c.id} onDone={() => { setCreating(false); onChanged(); }} onCancel={c.ebos.length ? () => setCreating(false) : undefined} />
        : <Button variant="secondary" shape="console" onClick={() => setCreating(true)}><Plus size={15} /> Proposer un ebo</Button>}
    </div>
  );
}

function EboAdminCard({ ebo, onChanged }: { ebo: Ebo; onChanged: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const s = EBO_STATUS[ebo.status];
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-[17px] text-text">{ebo.title}</h3><p className="mt-1 text-[13px] text-text-muted">{ebo.purpose}</p></div>
        <Badge tone={s.tone}>{s.label.replace('ta réponse', 'la réponse du client')}</Badge>
      </div>
      <div className="mt-5"><EboItemsTable ebo={ebo} /></div>
      {ebo.status === 'PAID' && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-3 text-[14px] text-text">Ebo payé. Filme sa réalisation (nom du client prononcé, date), puis envoie la vidéo : il passera à « Réalisé ».</p>
          <CloudinaryUpload folder="ifaolade/ebo-proofs" accept="video/*" label="Envoyer la vidéo de preuve" token={token}
            onUploaded={async ({ url, publicId }) => {
              try { await apiSend(`/admin/ebos/${ebo.id}`, { proofVideoUrl: url, proofPublicId: publicId }, 'PATCH', token); toast('Preuve envoyée, le client est prévenu'); onChanged(); } catch (e) { toast((e as Error).message, 'error'); }
            }} />
        </div>
      )}
      {ebo.status === 'PERFORMED' && ebo.proofVideoUrl && <video controls preload="metadata" className="mt-6 w-full max-w-xl rounded-[var(--radius-md)] bg-black" src={ebo.proofVideoUrl} />}
    </Card>
  );
}

function EboForm({ consultationId, onDone, onCancel }: { consultationId: string; onDone: () => void; onCancel?: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [items, setItems] = useState<(Omit<EboItem, 'unitCents'> & { unit: string })[]>([{ label: '', qty: 1, unit: '' }]);
  const [fee, setFee] = useState('');
  const [live, setLive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const cents = (v: string) => Math.round((Number(v.replace(',', '.')) || 0) * 100);
  const clean = items.filter((i) => i.label.trim()).map((i) => ({ label: i.label.trim(), qty: Math.max(1, Math.floor(i.qty)), unitCents: cents(i.unit) }));
  const materials = clean.reduce((s, i) => s + i.qty * i.unitCents, 0);
  const invalid = !title.trim() ? 'Donne un titre à l\'ebo.' : !purpose.trim() ? 'Explique l\'objet de l\'ebo.' : !clean.length ? 'Un ebo doit être détaillé ligne par ligne (règle 4.2).' : null;
  useEffect(() => { if (!items.length) setItems([{ label: '', qty: 1, unit: '' }]); }, [items]);

  return (
    <Card className="p-6">
      <h3 className="text-[17px] text-text">Proposer un ebo</h3>
      <p className="mt-1 text-[13px] text-text-muted">Chaque élément au coût réel. Ta rémunération s&apos;affiche à part. Le client est libre de refuser.</p>
      <div className="mt-6 space-y-6">
        <Field label="Titre" htmlFor="et"><Input id="et" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. : Ebo d'ouverture des chemins" /></Field>
        <Field label="Objet (pourquoi cet ebo)" htmlFor="ep"><Textarea id="ep" rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} /></Field>
        <div>
          <p className="mb-2 text-[13px] font-medium text-text">Le matériel, ligne par ligne</p>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1fr)_70px_110px_auto] items-center gap-2">
                <Input value={it.label} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Élément" aria-label="Élément" />
                <Input type="number" min={1} value={it.qty} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)))} aria-label="Quantité" />
                <Input inputMode="decimal" value={it.unit} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))} placeholder="Prix € / u." aria-label="Prix unitaire en euros" />
                <IconButton label="Retirer la ligne" type="button" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 size={15} /></IconButton>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" shape="console" className="mt-2" onClick={() => setItems([...items, { label: '', qty: 1, unit: '' }])}><Plus size={15} /> Ajouter une ligne</Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Ta rémunération (€)" htmlFor="ef"><Input id="ef" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0" /></Field>
          <div className="flex items-end pb-2"><Checkbox checked={live} onChange={setLive} label="Le client peut y assister en direct" /></div>
        </div>
        {clean.length > 0 && <div className="rounded-[var(--radius-md)] bg-bg-subtle p-4"><EboItemsTable ebo={{ items: clean, materialsCents: materials, priestFeeCents: cents(fee), currency: 'EUR' }} /></div>}
      </div>
      <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
        {onCancel && <Button variant="ghost" shape="console" onClick={onCancel}>Annuler</Button>}
        <Button shape="console" loading={busy} onClick={() => (invalid ? toast(invalid, 'error') : setConfirm(true))}>Envoyer la proposition</Button>
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} confirmLabel="Envoyer" title="Envoyer cette proposition au client ?"
        message={`Total : ${eur(materials + cents(fee))} (matériel ${eur(materials)}, rémunération ${eur(cents(fee))}). Le client reçoit un email et décide librement.`}
        onConfirm={async () => {
          setBusy(true);
          try { await apiSend(`/admin/consultations/${consultationId}/ebos`, { title, purpose, items: clean, priestFeeCents: cents(fee), liveAllowed: live }, 'POST', token); toast('Proposition envoyée'); onDone(); }
          catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
        }} />
    </Card>
  );
}

function FollowUpReply({ f, onSaved }: { f: FollowUp; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [reply, setReply] = useState(f.priestReply ?? '');
  const [busy, setBusy] = useState(false);
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between"><p className="text-[15px] text-text">Suivi J+{f.dayOffset}</p><span className="text-[12px] text-text-faint">Échéance {btTime(f.dueAt, { dateStyle: 'medium' })}</span></div>
      {f.answeredAt ? (
        <div className="mt-4 space-y-4">
          <p className="text-[14px] text-text-muted">Progression : <span className="tabular-nums text-text">{f.progress}/10</span>{f.note ? <> · « {f.note} »</> : null}</p>
          <Field label="Ta réponse" htmlFor={`r-${f.id}`}><Textarea id={`r-${f.id}`} rows={3} value={reply} onChange={(e) => setReply(e.target.value)} /></Field>
          <Button size="sm" shape="console" loading={busy} disabled={!reply.trim()}
            onClick={async () => { setBusy(true); try { await apiSend(`/admin/follow-ups/${f.id}`, { priestReply: reply }, 'PATCH', token); toast('Réponse envoyée au client'); onSaved(); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); } }}>
            {f.priestReply ? 'Mettre à jour la réponse' : 'Répondre'}
          </Button>
        </div>
      ) : <p className="mt-3 text-[13px] text-text-muted">Le client n&apos;a pas encore répondu.</p>}
    </Card>
  );
}
