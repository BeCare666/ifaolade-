'use client';

import { allOdu, LIBRARY_CATEGORIES, LIBRARY_META, oduById, type LibraryKind } from '@ona/core';
import { Lock, Plus, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CloudinaryUpload } from '@/components/admin/editors';
import { DataTable, dt } from '@/components/admin/list';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { Markdown } from '@/components/site/markdown';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/field';
import { ConfirmDialog, Tabs } from '@/components/ui/overlay';
import { Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { fr } from '@/i18n/fr';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { LibraryEntry } from '@/lib/types';
import { useApi } from '@/lib/use-api';

/* Admin › Bibliothèque (REFONTE R21) : rituels, wáàsù et divinités, ajoutables et modifiables. */

const L = fr.library;
export const KIND_ADMIN: Record<LibraryKind, { label: string; one: string; newLabel: string; publicPath: string }> = {
  rituel: { label: 'Rituels', one: 'rituel', newLabel: 'Nouveau rituel', publicPath: '/rituels' },
  wasu: { label: 'Wáàsù', one: 'wáàsù', newLabel: 'Nouveau wáàsù', publicPath: '/wasu' },
  divinite: { label: 'Divinités', one: 'divinité', newLabel: 'Nouvelle divinité', publicPath: '/divinites' },
};
const catLabel = (kind: LibraryKind, c: string) => (L.categories[kind] as Record<string, string>)[c] ?? c;
const metaLabel = (m: string) => L.meta[m as keyof typeof L.meta] ?? m;

export function LibraryList({ kind }: { kind: LibraryKind }) {
  const router = useRouter();
  const k = KIND_ADMIN[kind];
  const { data, error, loading, reload } = useApi<LibraryEntry[]>(`/admin/library/${kind}`);
  const base = `/admin/bibliotheque/${kind}`;
  return (
    <>
      <PageHeader title={k.label} breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Bibliothèque' }, { label: k.label }]}
        description={kind === 'rituel' ? 'Le texte public explique le sens et le déroulé général. Le matériel et les quantités vont dans la partie privée, jamais affichée sur le site.' : undefined}
        actions={<ButtonLink href={`${base}/nouveau`} size="sm" shape="console"><Plus size={15} /> {k.newLabel}</ButtonLink>} />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.length ? (
        <EmptyState title={`Aucun ${k.one} pour le moment`} action={<ButtonLink href={`${base}/nouveau`} size="sm" shape="console">{k.newLabel}</ButtonLink>} />
      ) : (
        <DataTable rows={data} rowKey={(r) => r.id} onRowClick={(r) => router.push(`${base}/${r.id}`)}
          columns={[
            { key: 't', label: 'Titre', render: (r) => <span className="text-text">{r.title}</span> },
            { key: 'c', label: 'Catégorie', render: (r) => <span className="text-text-muted">{catLabel(kind, r.category)}</span> },
            { key: 'o', label: 'Odu liés', render: (r) => <span className="tabular-nums text-text-muted">{(r.oduIds ?? []).length}</span> },
            { key: 's', label: 'Statut', render: (r) => (r.published ? <Badge tone="success">Publié</Badge> : <Badge tone="warning">Brouillon</Badge>) },
            { key: 'd', label: 'Modifié', render: (r) => <span className="text-[13px] tabular-nums text-text-faint">{dt(r.updatedAt)}</span> },
          ]}
          mobile={(r) => <div className="flex items-center justify-between gap-2"><span className="text-[14px] text-text">{r.title}</span>{r.published ? <Badge tone="success">Publié</Badge> : <Badge tone="warning">Brouillon</Badge>}</div>}
        />
      )}
    </>
  );
}

interface Form {
  title: string; slug: string; subtitle: string; excerpt: string; body: string; privateBody: string;
  category: string; meta: Record<string, string>; oduIds: number[]; coverUrl: string; published: boolean; order: number;
}

export function LibraryEditor({ kind, id }: { kind: LibraryKind; id: string }) {
  const isNew = id === 'nouveau';
  const router = useRouter();
  const { token } = useAuth();
  const toast = useToast();
  const k = KIND_ADMIN[kind];
  const base = `/admin/bibliotheque/${kind}`;
  const list = useApi<LibraryEntry[]>(isNew ? null : `/admin/library/${kind}`);
  const current = list.data?.find((a) => a.id === id);
  const empty: Form = { title: '', slug: '', subtitle: '', excerpt: '', body: '', privateBody: '', category: LIBRARY_CATEGORIES[kind][0], meta: {}, oduIds: [], coverUrl: '', published: false, order: 0 };
  const [f, setF] = useState<Form>(empty);
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (current) setF({
      title: current.title, slug: current.slug, subtitle: current.subtitle ?? '', excerpt: current.excerpt, body: current.body,
      privateBody: current.privateBody ?? '', category: current.category, meta: current.meta ?? {}, oduIds: current.oduIds ?? [],
      coverUrl: current.coverUrl ?? '', published: current.published, order: current.order,
    });
  }, [current]);

  if (!isNew && list.error) return <ErrorState description={list.error} onRetry={list.reload} />;
  if (!isNew && !current) return list.data ? <EmptyState title="Introuvable" /> : <Skeleton className="h-96" />;

  async function save() {
    if (!f.title.trim() || !f.excerpt.trim() || !f.body.trim()) { toast('Titre, résumé et texte sont nécessaires.', 'error'); return; }
    setBusy(true);
    try {
      const payload = { ...f, slug: f.slug || undefined, subtitle: f.subtitle || undefined, privateBody: f.privateBody || undefined, coverUrl: f.coverUrl || undefined };
      const saved = await apiSend<LibraryEntry>(isNew ? `/admin/library/${kind}` : `/admin/library/${kind}/${id}`, payload, isNew ? 'POST' : 'PUT', token);
      toast(f.published ? 'Publié. Le site se met à jour sous 5 minutes.' : 'Brouillon enregistré');
      if (isNew) router.replace(`${base}/${saved.id}`); else list.reload();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title={isNew ? k.newLabel : f.title || k.label}
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: k.label, href: base }, { label: isNew ? 'Nouveau' : 'Modifier' }]}
        actions={!isNew && f.published ? <a href={`${k.publicPath}/${f.slug}`} target="_blank" rel="noreferrer" className="text-[13px] text-primary">Voir sur le site</a> : undefined} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <Field label={kind === 'divinite' ? 'Nom' : 'Titre'} htmlFor="t"><Input id="t" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
              <Field label="Sous-titre" htmlFor="st" hint="Facultatif. Ex. : « Le maître du fer et des chemins »"><Input id="st" value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} /></Field>
              <Field label="Résumé" htmlFor="e" hint="Deux ou trois phrases, affichées dans les listes et en tête de page."><Textarea id="e" rows={3} value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} /></Field>
              <div>
                <Tabs value={view} onChange={setView} tabs={[{ value: 'edit', label: kind === 'rituel' ? 'Texte public (sens et déroulé)' : 'Texte' }, { value: 'preview', label: 'Aperçu' }]} />
                <div className="mt-4">{view === 'edit'
                  ? <Textarea rows={22} className="font-mono text-[13px]" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder={'## Titre\n\nTexte…\n\n- un point\n\n> Une parole'} />
                  : f.body.trim() ? <Markdown source={f.body} /> : <p className="text-[14px] text-text-faint">Rien à prévisualiser.</p>}</div>
                <p className="mt-2 text-[12px] text-text-faint">Mise en forme : ## titre, ### sous-titre, - liste, 1. liste, &gt; citation, **gras**, *italique*.</p>
              </div>
            </div>
          </Card>
          {kind === 'rituel' && (
            <Card className="p-6">
              <p className="flex items-center gap-2 text-[15px] font-medium text-text"><Lock size={16} className="text-primary" /> Partie privée : matériel, quantités, étapes détaillées</p>
              <p className="mt-1 text-[13px] text-text-muted">Jamais affichée sur le site. Elle sert au prêtre pour préparer le rituel.</p>
              <Textarea rows={12} className="mt-4 font-mono text-[13px]" value={f.privateBody} onChange={(e) => setF({ ...f, privateBody: e.target.value })} />
            </Card>
          )}
          <OduPicker value={f.oduIds} onChange={(oduIds) => setF({ ...f, oduIds })} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <Card className="space-y-5 p-5">
            <Switch checked={f.published} onChange={(v) => setF({ ...f, published: v })} label={f.published ? 'Publié' : 'Brouillon'} />
            <Field label="Catégorie" htmlFor="c">
              <Select id="c" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {LIBRARY_CATEGORIES[kind].map((c) => <option key={c} value={c}>{catLabel(kind, c)}</option>)}
              </Select>
            </Field>
            {LIBRARY_META[kind].map((m) => (
              <Field key={m} label={metaLabel(m)} htmlFor={`m-${m}`}>
                {m === 'quote' || m === 'role' || m === 'offerings'
                  ? <Textarea id={`m-${m}`} rows={3} value={f.meta[m] ?? ''} onChange={(e) => setF({ ...f, meta: { ...f.meta, [m]: e.target.value } })} />
                  : <Input id={`m-${m}`} value={f.meta[m] ?? ''} onChange={(e) => setF({ ...f, meta: { ...f.meta, [m]: e.target.value } })} />}
              </Field>
            ))}
            <Field label="Ordre d'affichage" htmlFor="o" hint="Plus petit = plus haut"><Input id="o" type="number" value={f.order} onChange={(e) => setF({ ...f, order: Number(e.target.value) || 0 })} /></Field>
            <Field label="Adresse (slug)" htmlFor="s" hint="Laisse vide pour la créer depuis le titre"><Input id="s" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} /></Field>
            <Field label="Image">
              {f.coverUrl && <img src={f.coverUrl} alt="" className="mb-3 aspect-video w-full rounded-[var(--radius-md)] object-cover" />}
              <CloudinaryUpload folder="ifaolade/bibliotheque" accept="image/*" label={f.coverUrl ? "Changer l'image" : 'Ajouter une image'} token={token} onUploaded={({ url }) => setF((x) => ({ ...x, coverUrl: url }))} />
            </Field>
            <Button shape="console" className="w-full" loading={busy} onClick={save}>Enregistrer</Button>
          </Card>
          {!isNew && <Button variant="ghost" size="sm" shape="console" onClick={() => setDel(true)}>Supprimer</Button>}
        </div>
      </div>
      <ConfirmDialog open={del} onClose={() => setDel(false)} danger confirmLabel="Supprimer définitivement" title={`Supprimer ce ${k.one} ?`}
        message="Cette action est définitive. Pour le retirer du site sans le perdre, repasse-le plutôt en brouillon."
        onConfirm={async () => { await apiSend(`/admin/library/${kind}/${id}`, undefined, 'DELETE', token); toast('Supprimé'); router.replace(base); }} />
    </>
  );
}

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-zɛɔ]/g, '');

function OduPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const [q, setQ] = useState('');
  const all = useMemo(() => allOdu(), []);
  const s = strip(q);
  const hits = s.length < 2 ? [] : all.filter((o) => !value.includes(o.id) && (strip(o.name).includes(s) || strip(o.fonName).includes(s))).slice(0, 8);
  return (
    <Card className="p-6">
      <p className="text-[15px] font-medium text-text">Odu liés</p>
      <p className="mt-1 text-[13px] text-text-muted">Affiché sur la fiche de ces Odu. Lier un Méjì le montre aussi sur les Ọmọ Odù dont il est une jambe.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {value.map((id) => {
          const o = oduById(id);
          return o ? (
            <span key={id} className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface py-1 pl-2 pr-1 text-[13px] text-text">
              <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} /> {o.name}
              <button type="button" aria-label={`Retirer ${o.name}`} onClick={() => onChange(value.filter((x) => x !== id))} className="grid h-6 w-6 place-items-center rounded-full hover:bg-bg-subtle"><X size={12} /></button>
            </span>
          ) : null;
        })}
        {!value.length && <span className="text-[13px] text-text-faint">Aucun Odu lié.</span>}
      </div>
      <div className="relative mt-4">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
        <Input className="pl-9" placeholder="Ajouter un Odu : Ogbè, Ọ̀sá Méjì, Gbè…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {hits.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {hits.map((o) => (
            <button key={o.id} type="button" onClick={() => { onChange([...value, o.id]); setQ(''); }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[13px] text-text hover:border-text-faint">
              <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} /> {o.name}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
