import type { Metadata } from 'next';
import { CtaBand, EventCard, FrenchContentNote, PageHero } from '@/components/site/blocks';
import { Container } from '@/components/site/editorial';
import { EmptyState } from '@/components/ui/primitives';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import type { EventItem } from '@/lib/types';

export const revalidate = 300;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).events;
  return pageMeta(lang, '/evenements', d.metaTitle, d.metaDesc);
}

export default async function EvenementsPage({ params }: LangParams) {
  const lang = await pageLang(params);
  const d = getDict(lang).events;
  const events = await apiGet<EventItem[]>('/events');
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="pb-28">
        {events && events.length ? (
          <div className="max-w-4xl">
            <div className="grid gap-6">{events.map((e) => <EventCard key={e.id} event={e} lang={lang} />)}</div>
            <FrenchContentNote lang={lang} />
          </div>
        ) : <EmptyState title={d.emptyTitle} description={d.emptyText} />}
      </Container>
      <CtaBand title={d.ctaTitle} href={lp(lang, '/circuits')} label={d.ctaLabel} />
    </>
  );
}
