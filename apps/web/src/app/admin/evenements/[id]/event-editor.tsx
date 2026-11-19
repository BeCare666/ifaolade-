'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CloudinaryUpload } from '@/components/admin/editors';
import { dt } from '@/components/admin/list';
import { Button } from '@/components/ui/button';
import { Field, Input, Switch, Textarea } from '@/components/ui/field';
import { ConfirmDialog } from '@/components/ui/overlay';
import { Badge, Card, CardHeader, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { EventItem } from '@/lib/types';
import { useApi } from '@/lib/use-api';

type Row = EventItem & { published: boolean };
interface Reg { id: string; seats: number; status: string; createdAt: string; user: { firstName: string; lastName: string | null; email: string; phone: string | null } }
const toLocal = (iso: string) => new Date(new Date(iso).getTime() + 3600_000).toISOString().slice(0, 16); // affichage heure du Bénin

export function EventEditor({ id }: { id: string }) {
  const isNew = id === 'nouveau';
  const router = useRouter();
  const { token } = useAuth();
  const toast = useToast();
  const list = useApi<Row[]>(isNew ? null : '/admin/events');
  const regs = useApi<Reg[]>(isNew ? null : `/admin/events/${id}/registrations`);
  const current = list.data?.find((e) => e.id === id);
  const [f, setF] = useState({ title: '', slug: '', subtitle: '', description: '', location: 'Ouidah, Bénin', startsAt: '', endsAt: '', price: '0', capacity: 30, coverUrl: '', published: false });
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (current) setF({ title: current.title, slug: current.slug, subtitle: current.subtitle ?? '', description: current.description, location: current.location, startsAt: toLocal(current.startsAt), endsAt: toLocal(current.endsAt), price: String(current.priceCents / 100), capacity: current.capacity, coverUrl: current.coverUrl ?? '', published: current.published });
  }, [current]);

  if (!isNew && list.error) return <ErrorState description={list.error} onRetry={list.reload} />;
  if (!isNew && !current) return <Skeleton className="h-96" />;

  async function save() {
    if (!f.title.trim() || !f.description.trim() || !f.startsAt || !f.endsAt) { toast('Titre, description et dates sont nécessaires.', 'error'); return; }
    setBusy(true);
    try {
      const payload = {
        title: f.title, slug: f.slug || undefined, subtitle: f.subtitle || undefined, description: f.description, location: f.location,
        startsAt: `${f.startsAt}:00+01:00`, endsAt: `${f.endsAt}:00+01:00`, priceCents: Math.round((Number(f.price.replace(',', '.')) || 0) * 100),
        capacity: Number(f.capacity) || 1, coverUrl: f.coverUrl || undefined, published: f.published,
      };
      const saved = await apiSend<Row>(isNew ? '/admin/events' : `/admin/events/${id}`, payload, isNew ? 'POST' : 'PUT', token);
      toast('Événement enregistré');
      if (isNew) router.replace(`/admin/evenements/${saved.id}`); else list.reload();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title={isNew ? 'Nouvel événement' : f.title} breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Événements', href: '/admin/evenements' }, { label: isNew ? 'Nouveau' : 'Modifier' }]} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="space-y-6 p-6">
            <Field label="Titre" htmlFor="t"><Input id="t" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="Sous-titre" htmlFor="st"><Input id="st" value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} /></Field>
            <Field label="Description" htmlFor="d"><Textarea id="d" rows={6} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Début (heure du Bénin)" htmlFor="s"><Input id="s" type="datetime-local" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} /></Field>
              <Field label="Fin (heure du Bénin)" htmlFor="e"><Input id="e" type="datetime-local" value={f.endsAt} onChange={(e) => setF({ ...f, endsAt: e.target.value })} /></Field>
              <Field label="Lieu" htmlFor="l"><Input id="l" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prix / place (€)" htmlFor="p" hint="0 = gratuit"><Input id="p" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
                <Field label="Places" htmlFor="c"><Input id="c" type="number" min={1} value={f.capacity} onChange={(e) => setF({ ...f, capacity: Number(e.target.value) })} /></Field>
              </div>
            </div>
          </Card>
          {!isNew && (
            <Card>
              <CardHeader title="Inscrits" description={regs.data ? `${regs.data.filter((r) => r.status !== 'CANCELLED').reduce((s, r) => s + r.seats, 0)} place(s) réservée(s) sur ${f.capacity}` : undefined} />
              {regs.error ? <div className="p-5"><ErrorState description={regs.error} /></div> : !regs.data ? <div className="p-5"><Skeleton className="h-20" /></div> : !regs.data.length ? (
                <p className="px-5 py-6 text-[14px] text-text-muted">Aucun inscrit.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {regs.data.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                      <span><span className="text-[14px] text-text">{r.user.firstName} {r.user.lastName}</span><span className="block text-[12px] text-text-faint">{r.user.email} · {dt(r.createdAt, false)} · code {r.id}</span></span>
                      <span className="flex items-center gap-2 text-[13px] tabular-nums">{r.seats} pl. <Badge tone={r.status === 'PAID' ? 'success' : r.status === 'CANCELLED' ? 'neutral' : 'warning'}>{r.status === 'PAID' ? 'Confirmé' : r.status === 'CANCELLED' ? 'Annulé' : 'Paiement attendu'}</Badge></span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
        <div className="space-y-6 xl:sticky xl:top-24">
          <Card className="space-y-5 p-5">
            <Switch checked={f.published} onChange={(v) => setF({ ...f, published: v })} label={f.published ? 'En ligne' : 'Non publié'} />
            <Field label="Adresse (slug)" htmlFor="sl"><Input id="sl" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="auto" /></Field>
            <Field label="Photo">
              {f.coverUrl && <img src={f.coverUrl} alt="" className="mb-3 aspect-video w-full rounded-[var(--radius-md)] object-cover" />}
              <CloudinaryUpload folder="ifaolade/events" accept="image/*" label={f.coverUrl ? 'Changer' : 'Ajouter'} token={token} onUploaded={({ url }) => setF((x) => ({ ...x, coverUrl: url }))} />
            </Field>
            <Button shape="console" className="w-full" loading={busy} onClick={save}>Enregistrer</Button>
          </Card>
          {!isNew && <Button variant="ghost" size="sm" shape="console" onClick={() => setDel(true)}>Supprimer l&apos;événement</Button>}
        </div>
      </div>
      <ConfirmDialog open={del} onClose={() => setDel(false)} danger confirmLabel="Supprimer" title="Supprimer cet événement ?" message="Impossible s'il a des inscrits : dans ce cas, dépublie-le."
        onConfirm={async () => { try { await apiSend(`/admin/events/${id}`, undefined, 'DELETE', token); toast('Événement supprimé'); router.replace('/admin/evenements'); } catch (e) { toast((e as Error).message, 'error'); } }} />
    </>
  );
}
