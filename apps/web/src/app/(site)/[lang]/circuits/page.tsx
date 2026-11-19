import type { Metadata } from 'next';
import { CtaBand, FrenchContentNote, PageHero, Photo, ProgramCard } from '@/components/site/blocks';
import { Container, Reveal, SectionIntro } from '@/components/site/editorial';
import { EmptyState } from '@/components/ui/primitives';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import { pick } from '@/lib/site-data-shared';
import { getSiteData } from '@/lib/site-data.server';
import type { Program } from '@/lib/types';

export const revalidate = 300;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).circuits;
  return pageMeta(lang, '/circuits', d.metaTitle, d.metaDesc);
}


export default async function CircuitsPage({ params }: LangParams) {
  const lang = await pageLang(params);
  const d = getDict(lang).circuits;
  const programs = await apiGet<Program[]>('/programs?kind=TOUR');
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <section className="bg-surface">
        <Container className="py-24">
          <SectionIntro overline={d.placesOverline} title={d.placesTitle} />
          <div className="mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {d.places.map((p, i) => (
              <Reveal key={p.name} delay={(i % 3) * 0.05}>
                <Photo lang={lang} alt={p.name} expected={p.name} className="aspect-[4/3]" sizes="(min-width: 1024px) 33vw, 50vw" />
                <h3 className="text-card-title mt-5 text-text">{p.name}</h3>
                <p className="mt-2 text-[14px] leading-[1.75] text-text-muted">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <section>
        <Container className="py-24">
          <SectionIntro overline={d.programsOverline} title={d.programsTitle} />
          <div className="mt-14">
            {programs && programs.length ? (
              <>
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">{programs.map((p) => <ProgramCard key={p.id} program={p} lang={lang} />)}</div>
                <FrenchContentNote lang={lang} />
              </>
            ) : <EmptyState title={pick(await getSiteData(lang), 'circuits.emptyTitle', d.emptyTitle)} description={d.emptyText} />}
          </div>
        </Container>
      </section>
      <CtaBand title={d.ctaTitle} text={d.ctaText} href={lp(lang, '/evenements')} label={d.ctaLabel} />
    </>
  );
}
