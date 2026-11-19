'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable, dt } from '@/components/admin/list';
import { ButtonLink } from '@/components/ui/button';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { ARTICLE_CATEGORIES } from '@/lib/site';
import type { Article } from '@/lib/types';
import { useApi } from '@/lib/use-api';

type Row = Article & { published: boolean; updatedAt: string };

export default function EnseignementsAdmin() {
  const router = useRouter();
  const { data, error, loading, reload } = useApi<Row[]>('/admin/articles');
  return (
    <>
      <PageHeader title="Enseignements" breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Enseignements' }]}
        actions={<ButtonLink href="/admin/enseignements/nouveau" size="sm" shape="console"><Plus size={15} /> Nouvel article</ButtonLink>} />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.length ? (
        <EmptyState title="Aucun article" action={<ButtonLink href="/admin/enseignements/nouveau" size="sm" shape="console">Écrire le premier</ButtonLink>} />
      ) : (
        <DataTable rows={data} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/admin/enseignements/${r.id}`)}
          columns={[
            { key: 't', label: 'Titre', render: (r) => <span className="text-text">{r.title}</span> },
            { key: 'c', label: 'Catégorie', render: (r) => <span className="text-text-muted">{ARTICLE_CATEGORIES[r.category] ?? r.category}</span> },
            { key: 's', label: 'Statut', render: (r) => (r.published ? <Badge tone="success">Publié</Badge> : <Badge tone="warning">Brouillon</Badge>) },
            { key: 'd', label: 'Modifié', render: (r) => <span className="text-[13px] tabular-nums text-text-faint">{dt(r.updatedAt)}</span> },
          ]}
          mobile={(r) => <div className="flex items-center justify-between gap-2"><span className="text-[14px] text-text">{r.title}</span>{r.published ? <Badge tone="success">Publié</Badge> : <Badge tone="warning">Brouillon</Badge>}</div>}
        />
      )}
    </>
  );
}
