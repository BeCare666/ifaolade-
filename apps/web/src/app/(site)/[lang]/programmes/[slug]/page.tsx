import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CtaBand, fmtDate, FrenchContentNote, Photo } from '@/components/site/blocks';
import { Container, Reveal } from '@/components/site/editorial';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Breadcrumb, EmptyState } from '@/components/ui/primitives';
import { getDict, isLang, lp, tpl, type Lang } from '@/i18n';
import { pageMeta } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import { eur, fcfa } from '@/lib/cn';
import type { Program } from '@/lib/types';

export const revalidate = 120;
type P = { params: Promise<{ lang: string; slug: string }> };
const langOf = (l: string): Lang => (isLang(l) ? l : 'fr');

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await apiGet<Program>(`/programs/${slug}`);
  return p ? pageMeta(langOf(lang), `/programmes/${slug}`, p.title, p.subtitle ?? p.description.slice(0, 150)) : {};
}

export default async function ProgramPage({ params }: P) {
  const { lang: l, slug } = await params;
  const lang = langOf(l);
  const D = getDict(lang);
  const d = D.program;
  const p = await apiGet<Program>(`/programs/${slug}`);
  if (!p) notFound();
  const tour = p.kind === 'TOUR';
  const deposit = Math.round(p.priceCents * 0.3);
  const L = (x: string) => lp(lang, x);

  return (
    <>
      <Container className="pt-12 lg:pt-16">
        <Breadcrumb items={[{ label: tour ? d.backTours : d.backInitiation, href: L(tour ? '/circuits' : '/initiation') }, { label: p.title }]} />
        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
          <div>
            <Reveal>
              <Badge tone="primary">{tpl(d.kindDays, { kind: d.kinds[p.kind], n: p.durationDays })}</Badge>
              <h1 className="text-hero mt-6 text-text">{p.title}</h1>
              {p.subtitle && <p className="mt-5 text-[18px] text-text-muted">{p.subtitle}</p>}
              <FrenchContentNote lang={lang} />
            </Reveal>
            <Reveal delay={0.05}><Photo lang={lang} src={p.coverUrl} alt={p.title} expected={d.photoMain} className="mt-12 aspect-[16/10]" priority /></Reveal>
            <Reveal className="mt-14"><p className="text-body max-w-2xl whitespace-pre-line">{p.description}</p></Reveal>

            {p.itinerary && p.itinerary.length > 0 && (
              <section className="mt-16">
                <h2 className="text-card-title text-text">{d.dayByDay}</h2>
                <ol className="mt-8">
                  {p.itinerary.map((x) => (
                    <li key={`${x.day}-${x.title}`} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-t border-border py-6">
                      <span className="text-[13px] font-medium tracking-[0.15em] tabular-nums text-accent">{tpl(d.day, { n: x.day })}</span>
                      <div><p className="text-[16px] text-text">{x.title}</p><p className="mt-1.5 text-[14px] leading-[1.75] text-text-muted">{x.text}</p></div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {p.gallery && p.gallery.length > 0 && (
              <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {p.gallery.map((src) => <Photo key={src} lang={lang} src={src} alt="" expected="" className="aspect-square" sizes="33vw" />)}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-7">
              <p className="text-[13px] text-text-faint">{d.perPerson}</p>
              <p className="mt-1 text-[34px] tracking-[-0.03em] tabular-nums text-text">{eur(p.priceCents, p.currency)}</p>
              <p className="text-[13px] tabular-nums text-text-faint">{tpl(D.common.or, { amount: fcfa(p.priceCents) })}</p>
              <p className="mt-4 text-[14px] text-text-muted">{tpl(d.deposit, { amount: eur(deposit, p.currency) })}</p>
              {p.includes && p.includes.length > 0 && (
                <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
                  {p.includes.map((i) => <li key={i} className="flex gap-3 text-[14px] text-text"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />{i}</li>)}
                </ul>
              )}
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-[14px] font-medium text-text">{d.sessions}</p>
                {p.sessions.length ? (
                  <ul className="mt-4 space-y-3">
                    {p.sessions.map((s) => {
                      const left = s.seatsLeft ?? s.capacity;
                      return (
                        <li key={s.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border p-4">
                          <div>
                            <p className="text-[14px] text-text">{tpl(D.common.dateRange, { from: fmtDate(lang, s.startDate, { day: 'numeric', month: 'long' }), to: fmtDate(lang, s.endDate) })}</p>
                            <p className="text-[12px] tabular-nums text-text-faint">{left > 0 ? tpl(D.common.seatsLeft, { n: left }) : D.common.full}</p>
                          </div>
                          {left > 0 && <ButtonLink href={`/espace/reserver-voyage?programme=${p.slug}&session=${s.id}`} size="sm">{D.common.book}</ButtonLink>}
                        </li>
                      );
                    })}
                  </ul>
                ) : <div className="mt-4"><EmptyState title={d.noSession} description={d.noSessionText} /></div>}
              </div>
            </div>
          </aside>
        </div>
      </Container>
      <div className="mt-24"><CtaBand title={d.ctaTitle} href={L('/contact')} label={D.cta.write} /></div>
    </>
  );
}
