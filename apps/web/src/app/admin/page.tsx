'use client';

import {
  CalendarClock, CircleDollarSign, Coins, FileText, Film, Inbox, MessageCircleReply, PlaneTakeoff, Sparkles, TrendingUp, UserPlus, Video,
} from 'lucide-react';
import Link from 'next/link';
import { BarList, Funnel } from '@/components/admin/charts';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardHeader, ErrorState, PageHeader, Skeleton, StatCard } from '@/components/ui/primitives';
import { eur } from '@/lib/cn';
import { useApi } from '@/lib/use-api';

interface Todo { today: number; drafts: number; toPerform: number; performedNoProof: number; answeredFollowUps: number; depositPaid: number; messages: number }
interface Period { readings: number; users: number; freeConsults: number; paidConsults: number; revenueCents: number; avgProgress: number | null }
interface Stats { current: Period; previous: Period; byDomain: Record<string, number> }
interface Activity { at: string; kind: string; text: string; href: string | null }

const DOMAINS: Record<string, string> = {
  adogo: 'Adɔ̀gò Fá', afojete: 'Afɔ̀jɛ́tɛ́',
  amour: 'Amour / couple', argent: 'Argent / travail', sante: 'Santé', famille: 'Famille',
  installation: 'Papiers / installation', spirituel: 'Spiritualité / protection', enfants: 'Enfants / fertilité', 'non précisé': 'Non précisé',
};
const delta = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : null);

/** Accueil admin (plan §9.1) : à traiter, indicateurs 30 j vs 30 j précédents, entonnoir, domaines, activité. */
export default function AdminHome() {
  const todo = useApi<Todo>('/admin/todo');
  const stats = useApi<Stats>('/admin/stats');
  const activity = useApi<Activity[]>('/admin/activity');
  const t = todo.data;
  const items = t ? [
    { n: t.today, icon: Video, label: "Consultations aujourd'hui", href: '/admin/consultations?statut=CONFIRMED' },
    { n: t.drafts, icon: FileText, label: 'Comptes rendus à publier', href: '/admin/consultations?statut=CONFIRMED' },
    { n: t.toPerform, icon: CircleDollarSign, label: 'Ebo payés à réaliser', href: '/admin/ebo?statut=PAID' },
    { n: t.performedNoProof, icon: Film, label: 'Ebo sans vidéo de preuve', href: '/admin/ebo?statut=PERFORMED' },
    { n: t.answeredFollowUps, icon: MessageCircleReply, label: 'Suivis en attente de ta réponse', href: '/admin/suivis' },
    { n: t.depositPaid, icon: PlaneTakeoff, label: 'Voyages : solde dû', href: '/admin/reservations?statut=DEPOSIT_PAID' },
    { n: t.messages, icon: Inbox, label: 'Messages reçus (7 j)', href: '/admin/messages' },
  ].filter((i) => i.n > 0) : [];
  const s = stats.data;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description={new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: 'Africa/Porto-Novo' }).format(new Date())}
        actions={<ButtonLink href="/admin/creneaux" size="sm" shape="console"><CalendarClock size={15} /> Ouvrir des créneaux</ButtonLink>}
      />

      <Card className="mb-6">
        <CardHeader title="À traiter" description="Triés par urgence" />
        {todo.error ? <div className="p-5"><ErrorState description={todo.error} onRetry={todo.reload} /></div> : !t ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : items.length ? (
          <ul className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
            {items.map(({ n, icon: I, label, href }) => (
              <li key={label} className="sm:border-b sm:border-border">
                <Link href={href} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-bg-subtle">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><I size={16} strokeWidth={1.5} /></span>
                  <span className="flex-1 text-[14px] text-text">{label}</span>
                  <span className="text-[18px] font-semibold tabular-nums text-text">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="px-5 py-8 text-[14px] text-text-muted">Rien d&apos;urgent. Tout est à jour.</p>}
      </Card>

      {stats.error ? <ErrorState description={stats.error} onRetry={stats.reload} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!s ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />) : (
            <>
              <StatCard label="Portraits (30 j)" value={s.current.readings} delta={delta(s.current.readings, s.previous.readings)} hint="vs 30 j précédents" icon={Sparkles} />
              <StatCard label="Comptes créés" value={s.current.users} delta={delta(s.current.users, s.previous.users)} hint="vs 30 j précédents" icon={UserPlus} />
              <StatCard label="Chiffre d'affaires" value={eur(s.current.revenueCents)} delta={delta(s.current.revenueCents, s.previous.revenueCents)} hint="paiements confirmés" icon={Coins} />
              <StatCard label="Progression moyenne" value={s.current.avgProgress !== null ? `${s.current.avgProgress.toFixed(1)}/10` : '—'} hint="réponses aux suivis" icon={TrendingUp} />
            </>
          )}
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Entonnoir (30 j)" description="Taux de passage d'une étape à l'autre" />
          <div className="p-5">{s ? <Funnel steps={[
            { label: 'Portraits réalisés', value: s.current.readings },
            { label: 'Comptes créés', value: s.current.users },
            { label: 'Consultations offertes', value: s.current.freeConsults },
            { label: 'Consultations payantes', value: s.current.paidConsults },
          ]} /> : <Skeleton className="h-40" />}</div>
        </Card>
        <Card>
          <CardHeader title="Domaines de vie (30 j)" description="Ce qui amène les gens" />
          <div className="p-5">{s ? <BarList data={Object.entries(s.byDomain).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: DOMAINS[k] ?? k, value: v }))} /> : <Skeleton className="h-40" />}</div>
        </Card>
        <Card>
          <CardHeader title="Activité récente" />
          {activity.error ? <div className="p-5"><ErrorState description={activity.error} /></div> : !activity.data ? <div className="p-5"><Skeleton className="h-40" /></div> : !activity.data.length ? (
            <p className="px-5 py-6 text-[14px] text-text-muted">Aucune activité pour le moment.</p>
          ) : (
            <ol className="divide-y divide-border">
              {activity.data.map((a, i) => {
                const body = (
                  <>
                    <p className="text-[13px] text-text">{a.text}</p>
                    <p className="mt-0.5 text-[11.5px] tabular-nums text-text-faint">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Porto-Novo' }).format(new Date(a.at))}</p>
                  </>
                );
                return <li key={i}>{a.href ? <Link href={a.href} className="block px-5 py-3 hover:bg-bg-subtle">{body}</Link> : <div className="px-5 py-3">{body}</div>}</li>;
              })}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
