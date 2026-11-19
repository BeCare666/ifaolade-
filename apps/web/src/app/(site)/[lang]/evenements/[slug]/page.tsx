import { Calendar, MapPin, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fmtDate, FrenchContentNote, Photo } from '@/components/site/blocks';
import { Container, Reveal } from '@/components/site/editorial';
import { ButtonLink } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/primitives';
import { getDict, isLang, lp, tpl, type Lang } from '@/i18n';
import { pageMeta } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import { eur, fcfa } from '@/lib/cn';
import type { EventItem } from '@/lib/types';

export const revalidate = 120;
type P = { params: Promise<{ lang: string; slug: string }> };
const langOf = (l: string): Lang => (isLang(l) ? l : 'fr');

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const e = await apiGet<EventItem>(`/events/${slug}`);
  return e ? pageMeta(langOf(lang), `/evenements/${slug}`, e.title, e.subtitle ?? e.description.slice(0, 150)) : {};
}

export default async function EventPage({ params }: P) {
  const { lang: l, slug } = await params;
  const lang = langOf(l);
  const D = getDict(lang);
  const d = D.events;
  const e = await apiGet<EventItem>(`/events/${slug}`);
  if (!e) notFound();
  const full = e.seatsLeft <= 0;

  return (
    <Container className="pb-28 pt-12 lg:pt-16">
      <Breadcrumb items={[{ label: D.nav.evenements, href: lp(lang, '/evenements') }, { label: e.title }]} />
      <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <div>
          <Reveal>
            <h1 className="text-hero text-text">{e.title}</h1>
            {e.subtitle && <p className="mt-5 text-[18px] text-text-muted">{e.subtitle}</p>}
            <FrenchContentNote lang={lang} />
          </Reveal>
          <Reveal delay={0.05}><Photo lang={lang} src={e.coverUrl} alt={e.title} expected={d.photo} className="mt-12 aspect-[16/10]" priority /></Reveal>
          <Reveal className="mt-14"><p className="text-body max-w-2xl whitespace-pre-line">{e.description}</p></Reveal>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-7">
            <ul className="space-y-4 text-[14px] text-text">
              <li className="flex gap-3"><Calendar size={16} strokeWidth={1.5} className="mt-0.5 text-text-faint" />{tpl(d.dates, { from: fmtDate(lang, e.startsAt), to: fmtDate(lang, e.endsAt) })}</li>
              <li className="flex gap-3"><MapPin size={16} strokeWidth={1.5} className="mt-0.5 text-text-faint" />{e.location}</li>
              <li className="flex gap-3"><Users size={16} strokeWidth={1.5} className="mt-0.5 text-text-faint" /><span className="tabular-nums">{full ? D.common.full : tpl(D.common.seatsLeft, { n: e.seatsLeft })}</span></li>
            </ul>
            <div className="mt-6 border-t border-border pt-6">
              {e.priceCents > 0 ? (
                <>
                  <p className="text-[34px] tracking-[-0.03em] tabular-nums text-text">{eur(e.priceCents, e.currency)}</p>
                  <p className="text-[13px] tabular-nums text-text-faint">{tpl(d.perSeat, { amount: fcfa(e.priceCents) })}</p>
                </>
              ) : <p className="text-[20px] text-text">{d.freeEntry}</p>}
            </div>
            {!full && <ButtonLink href={`/espace/evenements/inscription?evenement=${e.slug}`} className="mt-6 w-full">{d.register}</ButtonLink>}
          </div>
        </aside>
      </div>
    </Container>
  );
}
