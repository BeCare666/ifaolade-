'use client';

import { oduById } from '@ona/core';
import { ArrowRight, CalendarClock, CalendarPlus, FolderHeart, Gift, Hand, MessageCircleQuestion, Sparkles, Video } from 'lucide-react';
import { Adire } from '@/components/brand/patterns';
import { UserAvatar } from '@/components/ui/user-avatar';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { btTime, StatusBadge } from '@/components/consultation/parts';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { Alert } from '@/components/ui/alert';
import { ButtonLink } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/field';
import { Card, CardHeader, ErrorState, Skeleton } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth';
import type { Dossier } from '@/lib/types';
import { useApi } from '@/lib/use-api';

/** Plan §8 : prochain rendez-vous, suivi à remplir, plan d'action en cours (cases à cocher), dernier Odu. */
export function EspaceHome() {
  const { user } = useAuth();
  const { data, error, reload } = useApi<Dossier>('/me/dossier');
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem('ifaolade:plan-done') || '{}')); } catch { /* rien */ } }, []);
  const toggle = (k: string, v: boolean) => setDone((d) => { const n = { ...d, [k]: v }; try { localStorage.setItem('ifaolade:plan-done', JSON.stringify(n)); } catch { /* rien */ } return n; });

  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-48" /></div>;

  const now = Date.now();
  const upcoming = data.consultations
    .filter((c) => c.slot && c.status === 'CONFIRMED' && new Date(c.slot.endsAt).getTime() > now)
    .sort((a, b) => +new Date(a.slot!.startsAt) - +new Date(b.slot!.startsAt))[0];
  const unpaid = data.consultations.find((c) => c.status === 'AWAITING_PAYMENT');
  const followUp = data.consultations.flatMap((c) => c.followUps.map((f) => ({ ...f, cid: c.id })))
    .find((f) => !f.answeredAt && new Date(f.dueAt).getTime() <= now + 86400_000);
  const proposedEbo = data.consultations.find((c) => c.ebos.some((e) => e.status === 'PROPOSED'));
  const last = data.consultations.filter((c) => c.report?.publishedAt).sort((a, b) => +new Date(b.report!.publishedAt!) - +new Date(a.report!.publishedAt!))[0];
  const odu = last ? oduById(last.report!.oduId) : null;
  const roomOpen = upcoming && now >= new Date(upcoming.slot!.startsAt).getTime() - 10 * 60_000;
  const hasFree = !data.consultations.some((c) => c.isFirstFree && c.status !== 'CANCELLED');

  return (
    <div>
      {/* Bannière de bienvenue (REFONTE §10.4) */}
      <section className="relative overflow-hidden rounded-[var(--radius-photo)] bg-night p-6 text-kaolin sm:p-8">
        <Adire kind="grid" opacity={0.06} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user && <UserAvatar name={`${user.firstName} ${user.lastName ?? ''}`} src={user.avatarUrl} size={64} />}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-kaolin/55">Ẹ kú àbọ̀</p>
              <h1 className="font-display text-[34px] font-semibold leading-tight sm:text-[40px]">{user?.firstName}</h1>
              <p className="text-[14px] text-kaolin/70">
                {upcoming ? <>Prochain rendez-vous : {btTime(upcoming.slot!.startsAt, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</> : 'Aucun rendez-vous à venir.'}
              </p>
            </div>
          </div>
          <Link href={hasFree ? '/consultations/reserver?offre=FIRST_FREE' : '/consultations/reserver'} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-osun px-6 text-[14px] font-medium text-kaolin hover:bg-osun-hover">
            {hasFree ? <><Gift size={16} /> Ma consultation offerte</> : <><CalendarPlus size={16} /> Réserver</>}
          </Link>
        </div>
      </section>

      {/* Actions rapides */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { href: '/espace/consultations', label: 'Mes consultations', icon: MessageCircleQuestion },
          { href: '/espace/dossier', label: 'Mon dossier spirituel', icon: FolderHeart },
          { href: '/espace/portrait', label: 'Mon portrait', icon: Sparkles },
          { href: '/mon-odu', label: "J'ai déjà mon Odu", icon: Hand },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><a.icon size={18} strokeWidth={1.6} /></span>
            <span className="text-[14px] leading-tight text-text">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {user && !user.emailVerified && <Alert tone="warning" title="Confirme ton email">Un lien t&apos;a été envoyé à {user.email}. Il active ta consultation offerte.</Alert>}
        {unpaid && <Alert tone="warning" title="Un paiement est en attente"><Link href={`/espace/consultations/${unpaid.id}`} className="underline underline-offset-4">Finaliser {unpaid.offer.title}</Link></Alert>}
        {proposedEbo && <Alert tone="info" title="Une proposition d'ebo t'attend"><Link href={`/espace/consultations/${proposedEbo.id}`} className="underline underline-offset-4">Voir le détail et décider librement</Link></Alert>}
        {followUp && <Alert tone="info" title={`Ton suivi J+${followUp.dayOffset} est ouvert`}><Link href={`/espace/consultations/${followUp.cid}`} className="underline underline-offset-4">Dis-nous ce qui a changé</Link></Alert>}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Prochain rendez-vous" />
          <div className="p-5">
            {upcoming ? (
              <>
                <p className="text-[18px] tracking-[-0.01em] text-text">{btTime(upcoming.slot!.startsAt)}</p>
                <p className="text-[13px] text-text-faint">heure du Bénin · {upcoming.offer.title}</p>
                <div className="mt-5">
                  {roomOpen && upcoming.roomUrl
                    ? <a href={upcoming.roomUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[14px] font-medium text-primary-foreground"><Video size={16} /> Rejoindre la visio</a>
                    : <ButtonLink href={`/espace/consultations/${upcoming.id}`} variant="secondary" size="sm">Voir le rendez-vous</ButtonLink>}
                </div>
              </>
            ) : (
              <div className="flex items-start gap-4">
                <CalendarClock size={20} strokeWidth={1.5} className="mt-0.5 text-text-faint" />
                <div>
                  <p className="text-[14px] text-text-muted">Aucun rendez-vous prévu.</p>
                  <div className="mt-4"><ButtonLink href={hasFree ? '/consultations/reserver?offre=FIRST_FREE' : '/consultations/reserver'} size="sm">{hasFree ? 'Utiliser ma consultation offerte' : 'Réserver une consultation'}</ButtonLink></div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Le dernier Odu reçu" />
          <div className="p-5">
            {last && odu ? (
              <Link href={`/espace/consultations/${last.id}`} className="flex items-center gap-5">
                <OduGlyph right={odu.marks.right} left={odu.marks.left} size="sm" label={odu.name} />
                <div className="min-w-0">
                  <p className="text-[18px] tracking-[-0.01em] text-text">{odu.name}</p>
                  <p className="text-[13px] text-text-faint">{btTime(last.report!.publishedAt!, { dateStyle: 'long' })}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-[13px] text-primary">Relire le compte rendu <ArrowRight size={13} /></p>
                </div>
              </Link>
            ) : (
              <div className="flex items-start gap-4">
                <Sparkles size={20} strokeWidth={1.5} className="mt-0.5 text-text-faint" />
                <p className="text-[14px] text-text-muted">L&apos;Odu qui parle pour toi apparaîtra ici après ta première consultation. En attendant, <Link href="/espace/portrait" className="text-primary underline underline-offset-4">relis ton portrait</Link>.</p>
              </div>
            )}
          </div>
        </Card>

        {last && last.report!.actionPlan.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader title="Mon plan d'action" description="Coche ce que tu as accompli (gardé sur cet appareil)" />
            <ul className="space-y-3 p-5">
              {last.report!.actionPlan.map((a, i) => {
                const k = `${last.id}:${i}`;
                return <li key={k}><Checkbox checked={!!done[k]} onChange={(v) => toggle(k, v)} label={<span className={done[k] ? 'text-text-faint line-through' : ''}>{a}</span>} /></li>;
              })}
            </ul>
          </Card>
        )}

        {data.consultations.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader title="Mes consultations" action={<Link href="/espace/consultations" className="text-[13px] text-primary">Tout voir</Link>} />
            <ul className="divide-y divide-border">
              {data.consultations.slice(0, 3).map((c) => (
                <li key={c.id}><Link href={`/espace/consultations/${c.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-subtle">
                  <MessageCircleQuestion size={17} strokeWidth={1.5} className="shrink-0 text-text-faint" />
                  <span className="min-w-0 flex-1 truncate text-[14px] text-text">{c.offer.title} · <span className="text-text-muted">« {c.question} »</span></span>
                  <StatusBadge status={c.status} />
                </Link></li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
