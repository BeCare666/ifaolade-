'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';

/** État de filtre stocké dans l'URL (plan §5.3 : partageable, survit au rechargement). */
export function useUrlState(key: string, fallback = '') {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const value = params.get(key) ?? fallback;
  const set = (v: string) => {
    const next = new URLSearchParams(params.toString());
    if (v) next.set(key, v); else next.delete(key);
    router.replace(`${path}${next.toString() ? `?${next}` : ''}`);
  };
  return [value, set] as const;
}

export function FilterChips({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="scrollbar-thin flex gap-2 overflow-x-auto">
      {options.map(([k, l]) => (
        <button key={k || 'all'} onClick={() => onChange(k)} className={cn('h-8 shrink-0 rounded-full border px-3.5 text-[13px] transition-colors', value === k ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong bg-surface text-text-muted hover:text-text')}>
          {l}
        </button>
      ))}
    </div>
  );
}

export interface Column<T> { key: string; label: string; render: (row: T) => React.ReactNode; className?: string }

/** Table sur ordinateur, cartes sur mobile (jamais de défilement horizontal forcé). */
export function DataTable<T>({ rows, columns, rowKey, onRowClick, mobile }: {
  rows: T[]; columns: Column<T>[]; rowKey: (r: T) => string; onRowClick?: (r: T) => void; mobile: (r: T) => React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
      <table className="hidden w-full text-[14px] md:table">
        <thead>
          <tr className="border-b border-border bg-bg-subtle text-left text-[12px] text-text-faint">
            {columns.map((c) => <th key={c.key} className={cn('px-4 py-2.5 font-medium', c.className)}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={rowKey(r)} className={cn(onRowClick && 'cursor-pointer transition-colors hover:bg-bg-subtle')} onClick={() => onRowClick?.(r)}>
              {columns.map((c) => <td key={c.key} className={cn('px-4 py-3 align-top', c.className)}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-border md:hidden">
        {rows.map((r) => <li key={rowKey(r)} className={cn('px-4 py-3.5', onRowClick && 'cursor-pointer')} onClick={() => onRowClick?.(r)}>{mobile(r)}</li>)}
      </ul>
    </div>
  );
}

export const dt = (d: string | Date, withTime = true) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', ...(withTime ? { timeStyle: 'short' } : {}), timeZone: 'Africa/Porto-Novo' }).format(new Date(d));
