'use client';

import { allOdu } from '@ona/core';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { OduMatrix } from '@/components/odu/odu-matrix';
import { Input } from '@/components/ui/field';
import { Tabs } from '@/components/ui/overlay';
import { EmptyState } from '@/components/ui/primitives';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/cn';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-̣ͯ]/g, '').toLowerCase();

export function OduExplorer() {
  const { d: D, href } = useI18n();
  const d = D.odu;
  const [view, setView] = useState<'grille' | 'liste'>('grille');
  const [kind, setKind] = useState<'tous' | 'meji' | 'omo'>('tous');
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const nq = norm(q.trim());
    return allOdu().filter((o) => {
      if (kind === 'meji' && !o.isMeji) return false;
      if (kind === 'omo' && o.isMeji) return false;
      return !nq || norm(o.name).includes(nq) || norm(o.fonName).includes(nq) || o.slug.includes(nq);
    });
  }, [q, kind]);

  return (
    <div>
      <Tabs value={view} onChange={setView} tabs={[{ value: 'grille', label: d.grid }, { value: 'liste', label: d.list, count: 256 }]} />
      {view === 'grille' ? (
        <div className="mt-10"><OduMatrix /></div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.search} className="pl-10" aria-label={d.searchLabel} />
            </div>
            <div className="flex gap-2">
              {([['tous', d.all], ['meji', d.meji], ['omo', d.omo]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setKind(v)} className={cn('h-9 rounded-full border px-4 text-[13px] transition-colors', kind === v ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong text-text-muted hover:text-text')}>{l}</button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-[13px] tabular-nums text-text-faint">{tpl(d.count, { n: list.length })}</p>
          {list.length ? (
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((o) => (
                <li key={o.id}>
                  <Link href={href(`/odu/${o.slug}`)} className="group flex items-center gap-4 border-t border-border py-4">
                    <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-text group-hover:text-primary">{o.name}</span>
                      <span className="block truncate text-[12px] text-text-faint">{o.fonName}</span>
                    </span>
                    <span className="text-[12px] tabular-nums text-text-faint">{o.rank}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6"><EmptyState variant="no-results" title={d.noResult} description={d.noResultText} /></div>
          )}
        </div>
      )}
    </div>
  );
}
