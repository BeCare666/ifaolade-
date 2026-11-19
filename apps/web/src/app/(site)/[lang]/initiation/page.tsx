import type { Metadata } from 'next';
import { CtaBand, FrenchContentNote, PageHero, Photo, ProgramCard } from '@/components/site/blocks';
import { Container, NumberedRow, Reveal, SectionIntro } from '@/components/site/editorial';
import { EmptyState } from '@/components/ui/primitives';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import type { Program } from '@/lib/types';

export const revalidate = 300;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).initiation;
  return pageMeta(lang, '/initiation', d.metaTitle, d.metaDesc);
}

export default async function InitiationPage({ params }: LangParams) {
  const lang = await pageLang(params);
  const D = getDict(lang);
  const d = D.initiation;
  const programs = await apiGet<Program[]>('/programs');
  const list = (programs ?? []).filter((p) => p.kind === 'INITIATION' || p.kind === 'RETREAT');

  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {d.photos.map((p, i) => <Photo key={p} lang={lang} alt={p} expected={p} className={`aspect-[3/4]${i === 1 ? ' sm:mt-16' : ''}`} sizes="33vw" priority={i === 0} />)}
        </div>
      </Container>

      <section className="bg-surface">
        <Container className="grid gap-14 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          <SectionIntro className="lg:sticky lg:top-28 lg:self-start" overline={d.stepsOverline} title={d.stepsTitle} />
          <div>{d.steps.map((s, i) => <NumberedRow key={s.title} index={i + 1} title={s.title} text={s.text} />)}</div>
        </Container>
      </section>

      <section>
        <Container className="py-24">
          <SectionIntro overline={d.programsOverline} title={d.programsTitle} />
          <div className="mt-14">
            {list.length ? (
              <>
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProgramCard key={p.id} program={p} lang={lang} />)}</div>
                <FrenchContentNote lang={lang} />
              </>
            ) : <EmptyState title={d.emptyTitle} description={d.emptyText} />}
          </div>
          <Reveal className="mt-16 max-w-3xl rounded-[var(--radius-lg)] border border-border bg-surface p-7">
            <p className="text-[15px] font-medium text-text">{d.beforeTitle}</p>
            <ul className="mt-4 space-y-2 text-[14px] leading-[1.7] text-text-muted">{d.before.map((b) => <li key={b}>{b}</li>)}</ul>
          </Reveal>
        </Container>
      </section>
      <CtaBand title={d.ctaTitle} href={lp(lang, '/contact')} label={D.cta.write} />
    </>
  );
}
