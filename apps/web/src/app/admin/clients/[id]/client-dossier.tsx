'use client';

import { oduById } from '@ona/core';
import Link from 'next/link';
import { useState } from 'react';
import { dt } from '@/components/admin/list';
import { EBO_STATUS, StatusBadge } from '@/components/consultation/parts';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { Tabs } from '@/components/ui/overlay';
import { Badge, Card, CardHeader, EmptyState, ErrorState, KeyValue, PageHeader, Skeleton } from '@/components/ui/primitives';
import { eur } from '@/lib/cn';
import type { Consultation, Ewo } from '@/lib/types';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useApi } from '@/lib/use-api';

interface Dossier {
  user: { id: string; email: string; firstName: string; lastName: string | null; phone: string | null; country: string | null; emailVerified: boolean; createdAt: string };
  readings: { id: string; oduId: number; sunSign: string; createdAt: string }[];
  consultations: Consultation[];
  ewos: Ewo[];
  bookings: { id: string; status: string; participants: number; totalCents: number; paidCents: number; currency: string; session: { startDate: string; program: { title: string } } }[];
  registrations: { id: string; status: string; seats: number; event: { title: string; startsAt: string } }[];
}
type Tab = 'dossier' | 'portraits' | 'consultations' | 'voyages';

/** Fiche client (plan §9.3) : en-tête d'entité + onglets. Vue prêtre : brouillons et notes privées inclus. */
export function ClientDossier({ id }: { id: string }) {
  const { data, error, reload } = useApi<Dossier>(`/admin/users/${id}`);
  const [tab, setTab] = useState<Tab>('dossier');
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <Skeleton className="h-96" />;
  const u = data.user;
  const name = `${u.firstName} ${u.lastName ?? ''}`.trim();
  const reports = data.consultations.filter((c) => c.report?.publishedAt);

  return (
    <>
      <PageHeader title={name} breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Clients', href: '/admin/clients' }, { label: name }]} />
      <Card className="mb-6 flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <UserAvatar name={name} src={(u as { avatarUrl?: string | null }).avatarUrl} size={64} />
        <div className="grid flex-1 gap-4 sm:grid-cols-4">
          {[['Email', u.email], ['Téléphone', u.phone ?? '—'], ['Pays', u.country ?? '—'], ['Inscrit le', dt(u.createdAt, false)]].map(([l, v]) => (
            <div key={l}><p className="text-[12px] text-text-faint">{l}</p><p className="truncate text-[14px] text-text">{v}</p></div>
          ))}
        </div>
        <div className="flex gap-6 text-center">
          {[['Consultations', data.consultations.length], ['Odu reçus', reports.length], ['Ewọ̀', data.ewos.length]].map(([l, v]) => (
            <div key={l as string}><p className="text-[22px] font-semibold tabular-nums text-text">{v}</p><p className="text-[12px] text-text-faint">{l}</p></div>
          ))}
        </div>
      </Card>

      <Tabs<Tab> value={tab} onChange={setTab} tabs={[
        { value: 'dossier', label: 'Dossier spirituel' }, { value: 'portraits', label: 'Portraits', count: data.readings.length },
        { value: 'consultations', label: 'Consultations', count: data.consultations.length }, { value: 'voyages', label: 'Voyages et événements' },
      ]} />
      <div className="mt-6">
        {tab === 'dossier' && (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Odu reçus" />
              {reports.length ? <ul className="divide-y divide-border">{reports.map((c) => {
                const o = oduById(c.report!.oduId);
                return (
                  <li key={c.id}><Link href={`/admin/consultations/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-subtle">
                    {o && <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} />}
                    <span className="flex-1"><span className="block text-[14px] text-text">{o?.name}</span><span className="block truncate text-[12px] text-text-faint">« {c.question} »</span></span>
                    <Badge tone={c.report!.orientation === 'IRE' ? 'success' : 'accent'}>{c.report!.orientation === 'IRE' ? 'Ire' : 'Ibi'}</Badge>
                  </Link></li>
                );
              })}</ul> : <p className="px-5 py-6 text-[14px] text-text-muted">Aucun compte rendu publié.</p>}
            </Card>
            <Card>
              <CardHeader title="Ewọ̀ consignés" />
              {data.ewos.length ? <ul className="divide-y divide-border">{data.ewos.map((w) => <li key={w.id} className="px-5 py-3"><p className="text-[14px] text-text">{w.text}</p><p className="text-[12px] text-text-faint">{w.source}</p></li>)}</ul>
                : <p className="px-5 py-6 text-[14px] text-text-muted">Aucun ewọ̀.</p>}
            </Card>
          </div>
        )}
        {tab === 'portraits' && (data.readings.length ? (
          <Card><ul className="divide-y divide-border">{data.readings.map((r) => (
            <li key={r.id}><Link href={`/connais-toi/portrait/${r.id}`} target="_blank" className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-subtle">
              <span className="text-[14px] text-text">Portrait du {dt(r.createdAt, false)}</span>
              <span className="text-[13px] text-text-muted">Signature : {oduById(r.oduId)?.name}</span>
            </Link></li>
          ))}</ul></Card>
        ) : <EmptyState title="Aucun portrait" />)}
        {tab === 'consultations' && (data.consultations.length ? (
          <Card><ul className="divide-y divide-border">{data.consultations.map((c) => (
            <li key={c.id}><Link href={`/admin/consultations/${c.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-bg-subtle">
              <span className="flex-1 text-[14px] text-text">{c.offer.title}<span className="block truncate text-[12px] text-text-faint">« {c.question} »</span></span>
              {c.ebos.map((e) => <Badge key={e.id} tone={EBO_STATUS[e.status].tone}>Ebo</Badge>)}
              <StatusBadge status={c.status} />
            </Link></li>
          ))}</ul></Card>
        ) : <EmptyState title="Aucune consultation" />)}
        {tab === 'voyages' && (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card><CardHeader title="Réservations" />
              {data.bookings.length ? <div className="divide-y divide-border">{data.bookings.map((b) => (
                <div key={b.id} className="px-5 py-3.5"><KeyValue items={[
                  { label: 'Programme', value: b.session.program.title }, { label: 'Départ', value: dt(b.session.startDate, false) },
                  { label: 'Payé', value: `${eur(b.paidCents, b.currency)} sur ${eur(b.totalCents, b.currency)}` }, { label: 'Statut', value: b.status },
                ]} /></div>
              ))}</div> : <p className="px-5 py-6 text-[14px] text-text-muted">Aucune réservation.</p>}
            </Card>
            <Card><CardHeader title="Événements" />
              {data.registrations.length ? <ul className="divide-y divide-border">{data.registrations.map((r) => (
                <li key={r.id} className="flex justify-between px-5 py-3.5 text-[14px]"><span className="text-text">{r.event.title} · {r.seats} place(s)</span><span className="text-text-muted">{r.status === 'PAID' ? 'Confirmé' : r.status}</span></li>
              ))}</ul> : <p className="px-5 py-6 text-[14px] text-text-muted">Aucune inscription.</p>}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
