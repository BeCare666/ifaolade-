'use client';

import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { btTime } from '@/components/consultation/parts';
import { Button, IconButton } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { ConfirmDialog } from '@/components/ui/overlay';
import { Badge, Card, CardHeader, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useApi } from '@/lib/use-api';

interface AdminSlot { id: string; startsAt: string; endsAt: string; isBooked: boolean; consultation: { id: string; user: { firstName: string; lastName: string | null } } | null }

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
/** Le Bénin est à UTC+1 toute l'année (pas d'heure d'été) : conversion exacte. */
const beninIso = (date: string, time: string) => new Date(`${date}T${time}:00+01:00`).toISOString();

export default function CreneauxPage() {
  const { token } = useAuth();
  const toast = useToast();
  const { data, error, loading, reload } = useApi<AdminSlot[]>('/admin/slots');
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(new Date(Date.now() + 13 * 86400_000).toISOString().slice(0, 10));
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [times, setTimes] = useState('09:00, 10:00, 11:00, 15:00, 16:00');
  const [duration, setDuration] = useState(45);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<AdminSlot | null>(null);

  const preview = useMemo(() => {
    const list: { startsAt: string; endsAt: string }[] = [];
    const ts = times.split(/[,\s]+/).filter((t) => /^\d{1,2}:\d{2}$/.test(t)).map((t) => t.padStart(5, '0'));
    if (!from || !to || from > to) return list;
    for (let d = new Date(`${from}T12:00:00Z`); d <= new Date(`${to}T12:00:00Z`); d = new Date(d.getTime() + 86400_000)) {
      const dow = (d.getUTCDay() + 6) % 7; // 0 = lundi
      if (!days.includes(dow)) continue;
      const date = d.toISOString().slice(0, 10);
      for (const t of ts) {
        const start = beninIso(date, t);
        if (new Date(start) <= new Date()) continue;
        list.push({ startsAt: start, endsAt: new Date(new Date(start).getTime() + duration * 60_000).toISOString() });
      }
    }
    return list;
  }, [from, to, days, times, duration]);

  const grouped = useMemo(() => {
    const m = new Map<string, AdminSlot[]>();
    for (const s of (data ?? []).filter((x) => new Date(x.endsAt) > new Date())) {
      const k = btTime(s.startsAt, { weekday: 'long', day: 'numeric', month: 'long' });
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    return [...m.entries()];
  }, [data]);

  return (
    <>
      <PageHeader title="Agenda et créneaux" description="Toutes les heures sont à l'heure du Bénin (UTC+1)." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Agenda' }]} />
      <div className="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Ouvrir des créneaux en série" />
          <div className="space-y-5 p-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Du" htmlFor="f"><Input id="f" type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
              <Field label="Au" htmlFor="t"><Input id="t" type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
            </div>
            <Field label="Jours">
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d, i) => (
                  <button key={d} type="button" onClick={() => setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i])}
                    className={cn('h-9 w-12 rounded-[var(--radius-sm)] border text-[13px]', days.includes(i) ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong text-text-muted')}>{d}</button>
                ))}
              </div>
            </Field>
            <Field label="Heures de début" htmlFor="h" hint="Séparées par des virgules, ex. 09:00, 14:30"><Input id="h" value={times} onChange={(e) => setTimes(e.target.value)} /></Field>
            <Field label="Durée" htmlFor="du">
              <Select id="du" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {[20, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}
              </Select>
            </Field>
            <Button shape="console" className="w-full" loading={busy} disabled={!preview.length}
              onClick={async () => {
                setBusy(true);
                try { const r = await apiSend<{ created: number }>('/admin/slots', { slots: preview }, 'POST', token); toast(`${r.created} créneau(x) ouvert(s)`); reload(); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
              }}>
              Ouvrir {preview.length} créneau{preview.length > 1 ? 'x' : ''}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Créneaux à venir" />
          {error ? <div className="p-5"><ErrorState description={error} onRetry={reload} /></div> : loading ? <div className="space-y-2 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div> : !grouped.length ? (
            <div className="p-5"><EmptyState title="Aucun créneau à venir" description="Ouvre des créneaux avec le formulaire : ils apparaîtront aussitôt aux clients." /></div>
          ) : (
            <div className="divide-y divide-border">
              {grouped.map(([day, list]) => (
                <div key={day} className="px-5 py-4">
                  <p className="text-[13px] font-medium capitalize text-text">{day}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {list.map((s) => (
                      <span key={s.id} className={cn('inline-flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-1.5 text-[13px] tabular-nums', s.isBooked ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border-strong text-text')}>
                        {btTime(s.startsAt, { timeStyle: 'short' })}
                        {s.isBooked ? <Badge tone="primary">{s.consultation?.user.firstName ?? 'Réservé'}</Badge> : (
                          <IconButton label="Supprimer ce créneau" className="h-6 w-6" onClick={() => setToDelete(s)}><Trash2 size={13} /></IconButton>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} danger confirmLabel="Supprimer" title="Supprimer ce créneau ?"
        message={toDelete ? `${btTime(toDelete.startsAt)} (heure du Bénin). Il ne sera plus proposé aux clients.` : ''}
        onConfirm={async () => { if (!toDelete) return; await apiSend(`/admin/slots/${toDelete.id}`, undefined, 'DELETE', token); toast('Créneau supprimé'); reload(); }} />
    </>
  );
}
