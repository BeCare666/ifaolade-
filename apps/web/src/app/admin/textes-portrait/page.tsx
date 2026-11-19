'use client';

import { RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox, Input, Textarea } from '@/components/ui/field';
import { Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useApi } from '@/lib/use-api';

interface Text { key: string; group: string; label: string; default: string; value: string | null; validated: boolean }

/** Étape 4.4 : le prêtre réécrit et valide chaque texte du portrait. Seuls les textes validés remplacent les textes par défaut. */
export default function TextesPortraitPage() {
  const { data, error, loading, reload } = useApi<Text[]>('/admin/portrait-texts');
  const [group, setGroup] = useState<string>('');
  const [q, setQ] = useState('');
  const groups = useMemo(() => [...new Set((data ?? []).map((t) => t.group))], [data]);
  const list = (data ?? []).filter((t) => (!group || t.group === group) && (!q || `${t.label} ${t.value ?? t.default}`.toLowerCase().includes(q.toLowerCase())));
  const validatedCount = (data ?? []).filter((t) => t.validated).length;

  return (
    <>
      <PageHeader
        title="Textes du portrait"
        description={data ? `${validatedCount} validé(s) sur ${data.length}. Tant qu'un texte n'est pas validé, la version par défaut s'affiche.` : undefined}
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Textes du portrait' }]}
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="scrollbar-thin flex gap-2 overflow-x-auto">
          {['', ...groups].map((g) => (
            <button key={g || 'tous'} onClick={() => setGroup(g)} className={cn('h-8 shrink-0 rounded-full border px-3.5 text-[13px]', group === g ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong bg-surface text-text-muted')}>{g || 'Tous'}</button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-72">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher" className="h-9 pl-9" aria-label="Rechercher un texte" />
        </div>
      </div>
      {error ? <ErrorState description={error} onRetry={reload} /> : loading ? <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
        : !list.length ? <EmptyState variant="no-results" title="Aucun texte ne correspond" />
          : <div className="space-y-4">{list.map((t) => <TextCard key={t.key} t={t} onSaved={reload} />)}</div>}
    </>
  );
}

function TextCard({ t, onSaved }: { t: Text; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [value, setValue] = useState(t.value ?? t.default);
  const [validated, setValidated] = useState(t.validated);
  const [busy, setBusy] = useState(false);
  const dirty = value !== (t.value ?? t.default) || validated !== t.validated;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[14px] font-medium text-text">{t.label}</p>
          <p className="font-mono text-[11px] text-text-faint">{t.key}</p>
        </div>
        {t.validated ? <Badge tone="success">Validé, en ligne</Badge> : t.value ? <Badge tone="warning">Brouillon</Badge> : <Badge>Texte par défaut</Badge>}
      </div>
      <Textarea className="mt-4" rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Checkbox checked={validated} onChange={setValidated} label="Validé par le prêtre (utilisé dans les nouveaux portraits)" />
        <div className="flex gap-2">
          {t.value && (
            <Button variant="ghost" size="sm" shape="console" onClick={async () => { await apiSend(`/admin/portrait-texts/${encodeURIComponent(t.key)}`, undefined, 'DELETE', token); toast('Texte par défaut rétabli'); setValue(t.default); setValidated(false); onSaved(); }}>
              <RotateCcw size={14} /> Rétablir
            </Button>
          )}
          <Button size="sm" shape="console" loading={busy} disabled={!dirty}
            onClick={async () => { setBusy(true); try { await apiSend(`/admin/portrait-texts/${encodeURIComponent(t.key)}`, { value, validated }, 'PUT', token); toast('Texte enregistré'); onSaved(); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); } }}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Card>
  );
}
