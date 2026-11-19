import type { Metadata } from 'next';
import { CtaBand, OfferCard, PageHero } from '@/components/site/blocks';
import { Container, NumberedRow, SectionIntro } from '@/components/site/editorial';
import { Faq } from '@/components/site/faq';
import { EmptyState } from '@/components/ui/primitives';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import type { Offer } from '@/lib/types';

export const revalidate = 300;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).consultations;
  return pageMeta(lang, '/consultations', d.metaTitle, d.metaDesc);
}

export default async function ConsultationsPage({ params }: LangParams) {
  const lang = await pageLang(params);
  const D = getDict(lang);
  const d = D.consultations;
  const offers = await apiGet<Offer[]>('/offers');
  // Questions de la FAQ liées à la consultation : 1, 2, 3, 4, 7, 9 (mêmes positions dans chaque langue).
  const faq = [0, 1, 2, 3, 6, 8].map((i) => D.site.faq[i]);

  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="pb-24">
        {offers && offers.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {offers.map((o) => <OfferCard key={o.id} offer={o} highlight={o.code === 'VIDEO'} lang={lang} />)}
          </div>
        ) : (
          <EmptyState title={d.unavailableTitle} description={d.unavailableText} />
        )}
        {lang !== 'fr' && offers?.length ? <p className="mt-4 text-[12px] text-text-faint">{d.offersDescNote}</p> : null}
        <p className="mt-8 max-w-3xl text-[13px] leading-relaxed text-text-faint">{d.note}</p>
      </Container>

      <section className="bg-surface">
        <Container className="grid gap-14 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          <SectionIntro className="lg:sticky lg:top-28 lg:self-start" overline={d.commitOverline} title={d.commitTitle} />
          <div>{D.site.charter.slice(0, 5).map((c, i) => <NumberedRow key={c.title} index={i + 1} title={c.title} text={c.text} />)}</div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-14 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          <SectionIntro className="lg:sticky lg:top-28 lg:self-start" overline={d.faqOverline} title={d.faqTitle} />
          <Faq items={faq} />
        </Container>
      </section>

      <CtaBand title={d.ctaTitle} text={d.ctaText} href={lp(lang, '/connais-toi')} label={D.cta.portrait} />
    </>
  );
}

