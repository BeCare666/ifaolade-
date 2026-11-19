'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { FilterChips, useUrlState } from '@/components/admin/list';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { Input } from '@/components/ui/field';
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useApi } from '@/lib/use-api';

interface OduRow { id: number; slug: string; name: string; fonName: string; isMeji: boolean; rank: number; marks: { right: (1 | 2)[]; left: (1 | 2)[] }; hasTeaching: boolean }
const norm = (s: string) => s.normalize('NFD').replace(/[̀-̣ͯ]/g, '').toLowerCase();

export default function Page() { return <Suspense fallback={<Skeleton className="h-64" />}><OduAdmin /></Suspense>; }

function OduAdmin() {
  const { data, error, loading, reload } = useApi<OduRow[]>('/odu');
  const [kind, setKind] = useUrlState('type');
  const [q, setQ] = useUrlState('q');
  const list = useMemo(() => (data ?? []).filter((o) =>
    (!kind || (kind === 'meji' ? o.isMeji : kind === 'redige' ? o.hasTeaching : kind === 'a-rediger' ? !o.hasTeaching : true))
    && (!q || norm(`${o.name} ${o.fonName}`).includes(norm(q)))), [data, kind, q]);
  const written = (data ?? []).filter((o) => o.hasTeaching).length;

  return (
    <>
      <PageHeader title="Bibliothèque Odu" description={data ? `${written} enseignement(s) rédigé(s) sur 256.` : undefined} breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Odu' }]} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <FilterChips value={kind} onChange={setKind} options={[['', 'Tous'], ['meji', 'Les 16 Méjì'], ['redige', 'Rédigés'], ['a-rediger', 'À rédiger']]} />
        <div className="relative lg:ml-auto lg:w-72">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom yoruba ou fon" className="h-9 pl-9" aria-label="Rechercher un Odu" />
        </div>
      </div>
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !list.length ? <EmptyState variant="no-results" title="Aucun Odu ne correspond" /> : (
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((o) => (
            <Link key={o.id} href={`/admin/odu/${o.slug}`} className="flex items-center gap-4 bg-surface px-4 py-3.5 transition-colors hover:bg-bg-subtle">
              <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} />
              <span className="min-w-0 flex-1"><span className="block truncate text-[14px] text-text">{o.name}</span><span className="block truncate text-[12px] text-text-faint">{o.fonName} · rang {o.rank}</span></span>
              {o.hasTeaching ? <Badge tone="success">Rédigé</Badge> : <Badge>À rédiger</Badge>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
