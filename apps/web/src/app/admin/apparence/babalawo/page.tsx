'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CloudinaryUpload } from '@/components/admin/editors';
import { Button } from '@/components/ui/button';
import { Field, Input, Switch, Textarea } from '@/components/ui/field';
import { Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { UserAvatar } from '@/components/ui/user-avatar';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';

interface P { id: string; name: string; title: string | null; lineage: string | null; initiatedYear: number | null; languages: string | null; bio: string | null; photoUrl: string | null; order: number; active: boolean }

/** REFONTE §8.2 : les babaláwo présentés sur l'accueil. Seul ce qui est saisi ici est affiché. */
export default function BabalawoPage() {
  const { data, error, reload } = useApi<P[]>('/admin/practitioners');
  const { token } = useAuth();
  const toast = useToast();
  return (
    <>
      <PageHeader
        title="Babaláwo"
        description="Les fiches affichées sur l'accueil, section « Ton babaláwo ». Si aucune fiche n'est active, la section est masquée."
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Apparence' }, { label: 'Babaláwo' }]}
        actions={<Button shape="console" onClick={async () => {
          try { await apiSend('/admin/practitioners', { name: 'Nouveau babaláwo', active: false, order: (data?.length ?? 0) + 1 }, 'POST', token); reload(); } catch (e) { toast((e as Error).message, 'error'); }
        }}><Plus size={15} /> Ajouter une fiche</Button>}
      />
      {error ? <ErrorState description={error} onRetry={reload} /> : !data ? <Skeleton className="h-96" /> : !data.length ? (
        <EmptyState title="Aucune fiche" description="Ajoute ta fiche : ton nom, ton titre, ta lignée et ta vraie photo." />
      ) : <div className="space-y-6">{data.map((p) => <PractitionerCard key={p.id} p={p} onSaved={reload} />)}</div>}
    </>
  );
}

function PractitionerCard({ p, onSaved }: { p: P; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ ...p, initiatedYear: p.initiatedYear ? String(p.initiatedYear) : '' });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean | null) => setF((s) => ({ ...s, [k]: v }));

  const save = async (patch: Partial<typeof f> = {}) => {
    const n = { ...f, ...patch };
    setBusy(true);
    try {
      await apiSend(`/admin/practitioners/${p.id}`, {
        name: n.name.trim(), title: n.title || undefined, lineage: n.lineage || undefined,
        initiatedYear: n.initiatedYear ? Number(n.initiatedYear) : undefined, languages: n.languages || undefined,
        bio: n.bio || undefined, photoUrl: n.photoUrl || undefined, order: Number(n.order) || 0, active: n.active,
      }, 'PUT', token);
      toast('Fiche enregistrée');
      onSaved();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  };

  return (
    <Card className="p-6">
      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <UserAvatar name={f.name} src={f.photoUrl} size={140} />
          <CloudinaryUpload folder="ifaolade/site" accept="image/jpeg,image/png,image/webp" label="Photo" token={token}
            onUploaded={({ url }) => { set('photoUrl', url); void save({ photoUrl: url }); }} />
          <Switch checked={f.active} onChange={(v) => set('active', v)} label="Affichée sur le site" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom" htmlFor={`n-${p.id}`}><Input id={`n-${p.id}`} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Titre" htmlFor={`t-${p.id}`} hint="ex. Babaláwo, Bokɔnɔ"><Input id={`t-${p.id}`} value={f.title ?? ''} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="Lignée" htmlFor={`l-${p.id}`}><Input id={`l-${p.id}`} value={f.lineage ?? ''} onChange={(e) => set('lineage', e.target.value)} /></Field>
          <Field label="Année d'initiation" htmlFor={`y-${p.id}`}><Input id={`y-${p.id}`} inputMode="numeric" value={f.initiatedYear} onChange={(e) => set('initiatedYear', e.target.value.replace(/\D/g, '').slice(0, 4))} /></Field>
          <Field label="Langues" htmlFor={`g-${p.id}`} hint="ex. français, fon, yoruba"><Input id={`g-${p.id}`} value={f.languages ?? ''} onChange={(e) => set('languages', e.target.value)} /></Field>
          <Field label="Ordre d'affichage" htmlFor={`o-${p.id}`}><Input id={`o-${p.id}`} inputMode="numeric" value={String(f.order)} onChange={(e) => set('order', e.target.value.replace(/\D/g, ''))} /></Field>
          <div className="sm:col-span-2"><Field label="Présentation" htmlFor={`b-${p.id}`}><Textarea id={`b-${p.id}`} rows={5} value={f.bio ?? ''} onChange={(e) => set('bio', e.target.value)} /></Field></div>
          <div className="flex flex-wrap justify-between gap-3 sm:col-span-2">
            <Button variant="ghost" shape="console" onClick={async () => {
              try { await apiSend(`/admin/practitioners/${p.id}`, undefined, 'DELETE', token); toast('Fiche supprimée'); onSaved(); } catch (e) { toast((e as Error).message, 'error'); }
            }}><Trash2 size={14} /> Supprimer</Button>
            <Button shape="console" loading={busy} onClick={() => save()} disabled={!f.name.trim()}>Enregistrer</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
