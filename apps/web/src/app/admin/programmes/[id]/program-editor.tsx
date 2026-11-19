'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CloudinaryUpload, ListEditor } from '@/components/admin/editors';
import { dt } from '@/components/admin/list';
import { Button, IconButton } from '@/components/ui/button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/field';
import { ConfirmDialog } from '@/components/ui/overlay';
import { Card, CardHeader, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Program } from '@/lib/types';
import { useApi } from '@/lib/use-api';

type Row = Program & { published: boolean };
type Day = { day: number; title: string; text: string };

export function ProgramEditor({ id }: { id: string }) {
  const isNew = id === 'nouveau';
  const router = useRouter();
  const { token } = useAuth();
  const toast = useToast();
  const list = useApi<Row[]>(isNew ? null : '/admin/programs');
  const current = list.data?.find((p) => p.id === id);
  const [f, setF] = useState({ kind: 'INITIATION' as Program['kind'], title: '', slug: '', subtitle: '', description: '', durationDays: 7, price: '', coverUrl: '', published: false });
  const [gallery, setGallery] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<Day[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);
  const [session, setSession] = useState({ start: '', end: '', capacity: 8 });
  const [delSession, setDelSession] = useState<string | null>(null);

  useEffect(() => {
    if (!current) return;
    setF({ kind: current.kind, title: current.title, slug: current.slug, subtitle: current.subtitle ?? '', description: current.description, durationDays: current.durationDays, price: String(current.priceCents / 100), coverUrl: current.coverUrl ?? '', published: current.published });
    setGallery(current.gallery ?? []);
    setItinerary(current.itinerary ?? []);
    setIncludes(current.includes ?? []);
  }, [current]);

  if (!isNew && list.error) return <ErrorState description={list.error} onRetry={list.reload} />;
  if (!isNew && !current) return <Skeleton className="h-96" />;

  async function save() {
    if (!f.title.trim() || !f.description.trim()) { toast('Titre et description sont nécessaires.', 'error'); return; }
    setBusy(true);
    try {
      const payload = {
        kind: f.kind, title: f.title, slug: f.slug || undefined, subtitle: f.subtitle || undefined, description: f.description,
        durationDays: Number(f.durationDays) || 1, priceCents: Math.round((Number(f.price.replace(',', '.')) || 0) * 100),
        coverUrl: f.coverUrl || undefined, gallery, itinerary: itinerary.filter((d) => d.title.trim()), includes: includes.filter((i) => i.trim()), published: f.published,
      };
      const saved = await apiSend<Row>(isNew ? '/admin/programs' : `/admin/programs/${id}`, payload, isNew ? 'POST' : 'PUT', token);
      toast('Programme enregistré');
      if (isNew) router.replace(`/admin/programmes/${saved.id}`); else list.reload();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title={isNew ? 'Nouveau programme' : f.title} breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Programmes', href: '/admin/programmes' }, { label: isNew ? 'Nouveau' : 'Modifier' }]} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="space-y-6 p-6">
            <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
              <Field label="Type" htmlFor="k">
                <Select id="k" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Program['kind'] })}>
                  <option value="INITIATION">Initiation</option><option value="TOUR">Circuit</option><option value="RETREAT">Retraite</option>
                </Select>
              </Field>
              <Field label="Titre" htmlFor="t"><Input id="t" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            </div>
            <Field label="Sous-titre" htmlFor="st"><Input id="st" value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} /></Field>
            <Field label="Description" htmlFor="d"><Textarea id="d" rows={6} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
            <div className="grid gap-6 sm:grid-cols-3">
              <Field label="Durée (jours)" htmlFor="du"><Input id="du" type="number" min={1} value={f.durationDays} onChange={(e) => setF({ ...f, durationDays: Number(e.target.value) })} /></Field>
              <Field label="Prix par personne (€)" htmlFor="p"><Input id="p" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
              <Field label="Adresse (slug)" htmlFor="sl"><Input id="sl" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="auto" /></Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Déroulé jour par jour" />
            <div className="space-y-3 p-5">
              {itinerary.map((d, i) => (
                <div key={i} className="grid gap-2 rounded-[var(--radius-md)] border border-border p-3 sm:grid-cols-[80px_minmax(0,1fr)_auto]">
                  <Input type="number" min={1} value={d.day} onChange={(e) => setItinerary(itinerary.map((x, j) => (j === i ? { ...x, day: Number(e.target.value) } : x)))} aria-label="Jour" />
                  <div className="space-y-2">
                    <Input value={d.title} onChange={(e) => setItinerary(itinerary.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Titre du jour" />
                    <Textarea rows={2} value={d.text} onChange={(e) => setItinerary(itinerary.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} placeholder="Ce qui se passe ce jour-là" />
                  </div>
                  <IconButton label="Retirer ce jour" onClick={() => setItinerary(itinerary.filter((_, j) => j !== i))}><Trash2 size={15} /></IconButton>
                </div>
              ))}
              <Button variant="ghost" size="sm" shape="console" onClick={() => setItinerary([...itinerary, { day: (itinerary.at(-1)?.day ?? 0) + 1, title: '', text: '' }])}><Plus size={15} /> Ajouter un jour</Button>
            </div>
          </Card>

          <Card><CardHeader title="Ce qui est inclus" /><div className="p-5"><ListEditor items={includes} onChange={setIncludes} placeholder="Ex. : hébergement et repas" max={20} /></div></Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <Card className="space-y-5 p-5">
            <Switch checked={f.published} onChange={(v) => setF({ ...f, published: v })} label={f.published ? 'En ligne' : 'Non publié'} />
            <Field label="Photo principale">
              {f.coverUrl && <img src={f.coverUrl} alt="" className="mb-3 aspect-video w-full rounded-[var(--radius-md)] object-cover" />}
              <CloudinaryUpload folder="ifaolade/programs" accept="image/*" label={f.coverUrl ? 'Changer' : 'Ajouter'} token={token} onUploaded={({ url }) => setF((x) => ({ ...x, coverUrl: url }))} />
            </Field>
            <Field label="Galerie">
              <div className="mb-3 grid grid-cols-3 gap-2">
                {gallery.map((g) => (
                  <div key={g} className="relative">
                    <img src={g} alt="" className="aspect-square w-full rounded-[var(--radius-sm)] object-cover" />
                    <button onClick={() => setGallery(gallery.filter((x) => x !== g))} className="absolute right-1 top-1 rounded-full bg-surface/90 p-0.5" aria-label="Retirer"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <CloudinaryUpload folder="ifaolade/programs" accept="image/*" label="Ajouter une photo" token={token} onUploaded={({ url }) => setGallery((g) => [...g, url])} />
            </Field>
            <Button shape="console" className="w-full" loading={busy} onClick={save}>Enregistrer</Button>
          </Card>

          {!isNew && current && (
            <Card>
              <CardHeader title="Sessions" />
              <ul className="divide-y divide-border">
                {current.sessions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-[13px] tabular-nums text-text">{dt(s.startDate, false)} → {dt(s.endDate, false)} · {s.capacity} places</span>
                    <IconButton label="Supprimer la session" onClick={() => setDelSession(s.id)}><Trash2 size={14} /></IconButton>
                  </li>
                ))}
              </ul>
              <div className="space-y-3 border-t border-border p-5">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Début" htmlFor="ss"><Input id="ss" type="date" value={session.start} onChange={(e) => setSession({ ...session, start: e.target.value })} /></Field>
                  <Field label="Fin" htmlFor="se"><Input id="se" type="date" value={session.end} onChange={(e) => setSession({ ...session, end: e.target.value })} /></Field>
                </div>
                <Field label="Places" htmlFor="sc"><Input id="sc" type="number" min={1} value={session.capacity} onChange={(e) => setSession({ ...session, capacity: Number(e.target.value) })} /></Field>
                <Button variant="secondary" size="sm" shape="console" disabled={!session.start || !session.end || session.end < session.start}
                  onClick={async () => {
                    try {
                      await apiSend(`/admin/programs/${id}/sessions`, { startDate: `${session.start}T08:00:00+01:00`, endDate: `${session.end}T18:00:00+01:00`, capacity: session.capacity }, 'POST', token);
                      toast('Session ajoutée'); setSession({ start: '', end: '', capacity: 8 }); list.reload();
                    } catch (e) { toast((e as Error).message, 'error'); }
                  }}><Plus size={15} /> Ajouter la session</Button>
              </div>
            </Card>
          )}
          {!isNew && <Button variant="ghost" size="sm" shape="console" onClick={() => setDel(true)}>Supprimer le programme</Button>}
        </div>
      </div>
      <ConfirmDialog open={del} onClose={() => setDel(false)} danger confirmLabel="Supprimer" title="Supprimer ce programme ?" message="Impossible s'il a des réservations : dans ce cas, dépublie-le."
        onConfirm={async () => { try { await apiSend(`/admin/programs/${id}`, undefined, 'DELETE', token); toast('Programme supprimé'); router.replace('/admin/programmes'); } catch (e) { toast((e as Error).message, 'error'); } }} />
      <ConfirmDialog open={!!delSession} onClose={() => setDelSession(null)} danger confirmLabel="Supprimer" title="Supprimer cette session ?" message="Impossible si des personnes y sont inscrites."
        onConfirm={async () => { try { await apiSend(`/admin/sessions/${delSession}`, undefined, 'DELETE', token); toast('Session supprimée'); list.reload(); } catch (e) { toast((e as Error).message, 'error'); } }} />
    </>
  );
}
