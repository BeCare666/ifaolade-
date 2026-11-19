'use client';

import { ChevronDown } from 'lucide-react';
import { Suspense, useState } from 'react';
import { dt, FilterChips, useUrlState } from '@/components/admin/list';
import { Field, Input, Select } from '@/components/ui/field';
import { Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton, type Tone } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { useApi } from '@/lib/use-api';

interface Entry { id: string; actorName: string; actorRole: string; action: string; entity: string; entityId: string | null; path: string; before: Record<string, unknown> | null; after: Record<string, unknown> | null; createdAt: string }
interface Page { items: Entry[]; total: number; pageSize: number; entities: string[]; actors: { actorId: string; actorName: string }[] }

const ACTION: Record<string, { l: string; t: Tone }> = { CREATE: { l: 'Création', t: 'success' }, UPDATE: { l: 'Modification', t: 'info' }, DELETE: { l: 'Suppression', t: 'danger' } };
const HIDDEN = new Set(['id', 'createdAt', 'updatedAt']);

const show = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'oui' : 'non';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return dt(v);
  if (typeof v === 'object') return JSON.stringify(v, null, 1);
  return String(v);
};

/** Avant / après, champ par champ (plan §9.3 : jamais de JSON brut). */
function Diff({ before, after }: { before: Entry['before']; after: Entry['after'] }) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].filter((k) => !HIDDEN.has(k));
  const rows = keys.map((k) => ({ k, b: before?.[k], a: after?.[k], changed: JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]) }));
  const changed = before ? rows.filter((r) => r.changed) : rows;
  if (!changed.length) return <p className="text-[13px] text-text-faint">Aucun champ modifié.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-[13px]">
        <thead><tr className="text-left text-[12px] text-text-faint"><th className="py-1.5 pr-4 font-normal">Champ</th>{before && <th className="py-1.5 pr-4 font-normal">Avant</th>}<th className="py-1.5 font-normal">{before ? 'Après' : 'Valeur'}</th></tr></thead>
        <tbody>
          {changed.map((r) => (
            <tr key={r.k} className="border-t border-border align-top">
              <td className="py-2 pr-4 font-mono text-[12px] text-text-muted">{r.k}</td>
              {before && <td className="max-w-[320px] whitespace-pre-wrap break-words py-2 pr-4 text-danger/90 line-through decoration-danger/30">{show(r.b)}</td>}
              <td className="max-w-[320px] whitespace-pre-wrap break-words py-2 text-text">{show(r.a)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() { return <Suspense fallback={<Skeleton className="h-64" />}><Audit /></Suspense>; }

function Audit() {
  const [entity, setEntity] = useUrlState('element');
  const [actor, setActor] = useUrlState('auteur');
  const [action, setAction] = useUrlState('action');
  const [from, setFrom] = useUrlState('du');
  const [to, setTo] = useUrlState('au');
  const [page, setPage] = useUrlState('page', '1');
  const [open, setOpen] = useState<string | null>(null);
  const qs = new URLSearchParams({ page, ...(entity && { entity }), ...(actor && { actor }), ...(action && { action }), ...(from && { from }), ...(to && { to }) }).toString();
  const { data, error, loading, reload } = useApi<Page>(`/admin/audit?${qs}`);
  const p = Number(page) || 1;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageHeader title="Journal d'audit" description="Chaque modification faite dans l'administration : qui, quoi, quand, avant et après." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Journal d\'audit' }]} />
      <Card className="mb-5 p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_160px_160px]">
          <Field label="Élément"><FilterChips value={entity} onChange={(v) => { setEntity(v); setPage(''); }} options={[['', 'Tous'], ...(data?.entities ?? []).map((e) => [e, e] as [string, string])]} /></Field>
          <Field label="Auteur" htmlFor="au">
            <Select id="au" value={actor} onChange={(e) => { setActor(e.target.value); setPage(''); }}>
              <option value="">Tous</option>{(data?.actors ?? []).map((a) => <option key={a.actorId} value={a.actorId}>{a.actorName}</option>)}
            </Select>
          </Field>
          <Field label="Du" htmlFor="du"><Input id="du" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(''); }} /></Field>
          <Field label="Au" htmlFor="au2"><Input id="au2" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(''); }} /></Field>
        </div>
        <div className="mt-3"><FilterChips value={action} onChange={(v) => { setAction(v); setPage(''); }} options={[['', 'Toutes les actions'], ...Object.entries(ACTION).map(([k, v]) => [k, v.l] as [string, string])]} /></div>
      </Card>

      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.items.length ? (
        <EmptyState variant={qs.length > 6 ? 'no-results' : 'empty'} title="Aucune entrée" description="Les modifications faites dans l'admin apparaîtront ici." />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {data.items.map((e) => (
              <li key={e.id}>
                <button onClick={() => setOpen(open === e.id ? null : e.id)} aria-expanded={open === e.id} className="flex w-full flex-wrap items-center gap-3 px-5 py-3.5 text-left hover:bg-bg-subtle">
                  <span className="w-36 shrink-0 text-[12px] tabular-nums text-text-faint">{dt(e.createdAt)}</span>
                  <Badge tone={ACTION[e.action]?.t ?? 'neutral'}>{ACTION[e.action]?.l ?? e.action}</Badge>
                  <span className="text-[14px] text-text">{e.entity}</span>
                  {e.entityId && <span className="font-mono text-[11px] text-text-faint">{e.entityId.slice(0, 10)}</span>}
                  <span className="ml-auto text-[13px] text-text-muted">{e.actorName}</span>
                  <ChevronDown size={15} className={cn('text-text-faint transition-transform', open === e.id && 'rotate-180')} />
                </button>
                {open === e.id && (
                  <div className="border-t border-border bg-bg-subtle px-5 py-4">
                    <p className="mb-3 font-mono text-[11px] text-text-faint">{e.path}</p>
                    <Diff before={e.before} after={e.after} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[13px] text-text-muted">
            <span className="tabular-nums">{data.total} entrée(s)</span>
            <div className="flex items-center gap-2">
              <button disabled={p <= 1} onClick={() => setPage(String(p - 1))} className="rounded-[var(--radius-sm)] border border-border-strong px-3 py-1 disabled:opacity-40">Précédent</button>
              <span className="tabular-nums">{p} / {pages}</span>
              <button disabled={p >= pages} onClick={() => setPage(String(p + 1))} className="rounded-[var(--radius-sm)] border border-border-strong px-3 py-1 disabled:opacity-40">Suivant</button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
