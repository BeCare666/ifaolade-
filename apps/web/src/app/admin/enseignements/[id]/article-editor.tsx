'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CloudinaryUpload } from '@/components/admin/editors';
import { Markdown } from '@/components/site/markdown';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/field';
import { ConfirmDialog, Tabs } from '@/components/ui/overlay';
import { Card, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ARTICLE_CATEGORIES } from '@/lib/site';
import type { Article } from '@/lib/types';
import { useApi } from '@/lib/use-api';

type Row = Article & { published: boolean };

export function ArticleEditor({ id }: { id: string }) {
  const isNew = id === 'nouveau';
  const router = useRouter();
  const { token } = useAuth();
  const toast = useToast();
  const list = useApi<Row[]>(isNew ? null : '/admin/articles');
  const current = list.data?.find((a) => a.id === id);
  const [f, setF] = useState({ title: '', slug: '', excerpt: '', body: '', coverUrl: '', category: 'comprendre-ifa', published: false });
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (current) setF({ title: current.title, slug: current.slug, excerpt: current.excerpt, body: current.body, coverUrl: current.coverUrl ?? '', category: current.category, published: current.published });
  }, [current]);

  if (!isNew && list.error) return <ErrorState description={list.error} onRetry={list.reload} />;
  if (!isNew && !current) return <Skeleton className="h-96" />;

  async function save() {
    if (!f.title.trim() || !f.excerpt.trim() || !f.body.trim()) { toast('Titre, résumé et texte sont nécessaires.', 'error'); return; }
    setBusy(true);
    try {
      const payload = { ...f, slug: f.slug || undefined, coverUrl: f.coverUrl || undefined };
      const saved = await apiSend<Row>(isNew ? '/admin/articles' : `/admin/articles/${id}`, payload, isNew ? 'POST' : 'PUT', token);
      toast(f.published ? 'Article publié' : 'Brouillon enregistré');
      if (isNew) router.replace(`/admin/enseignements/${saved.id}`); else list.reload();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title={isNew ? 'Nouvel article' : f.title || 'Article'} breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Enseignements', href: '/admin/enseignements' }, { label: isNew ? 'Nouveau' : 'Modifier' }]} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="p-6">
          <div className="space-y-6">
            <Field label="Titre" htmlFor="t"><Input id="t" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="Résumé" htmlFor="e" hint="Deux phrases, affichées dans les listes."><Textarea id="e" rows={3} value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} /></Field>
            <div>
              <Tabs value={view} onChange={setView} tabs={[{ value: 'edit', label: 'Texte' }, { value: 'preview', label: 'Aperçu' }]} />
              <div className="mt-4">{view === 'edit'
                ? <Textarea rows={22} className="font-mono text-[13px]" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
                : f.body.trim() ? <Markdown source={f.body} /> : <p className="text-[14px] text-text-faint">Rien à prévisualiser.</p>}</div>
            </div>
          </div>
        </Card>
        <div className="space-y-6 lg:sticky lg:top-24">
          <Card className="space-y-5 p-5">
            <Switch checked={f.published} onChange={(v) => setF({ ...f, published: v })} label={f.published ? 'Publié' : 'Brouillon'} />
            <Field label="Catégorie" htmlFor="c">
              <Select id="c" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {Object.entries(ARTICLE_CATEGORIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Adresse (slug)" htmlFor="s" hint="Laisse vide pour la créer depuis le titre"><Input id="s" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} /></Field>
            <Field label="Image de couverture">
              {f.coverUrl && <img src={f.coverUrl} alt="" className="mb-3 aspect-video w-full rounded-[var(--radius-md)] object-cover" />}
              <CloudinaryUpload folder="ifaolade/articles" accept="image/*" label={f.coverUrl ? 'Changer l\'image' : 'Ajouter une image'} token={token} onUploaded={({ url }) => setF((x) => ({ ...x, coverUrl: url }))} />
            </Field>
            <Button shape="console" className="w-full" loading={busy} onClick={save}>Enregistrer</Button>
          </Card>
          {!isNew && <Button variant="ghost" size="sm" shape="console" onClick={() => setDel(true)}>Supprimer l&apos;article</Button>}
        </div>
      </div>
      <ConfirmDialog open={del} onClose={() => setDel(false)} danger confirmLabel="Supprimer définitivement" title="Supprimer cet article ?" message="Cette action est définitive. Pour le retirer du site sans le perdre, repasse-le plutôt en brouillon."
        onConfirm={async () => { await apiSend(`/admin/articles/${id}`, undefined, 'DELETE', token); toast('Article supprimé'); router.replace('/admin/enseignements'); }} />
    </>
  );
}
