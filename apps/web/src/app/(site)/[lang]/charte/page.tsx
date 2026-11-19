import type { Metadata } from 'next';
import { CtaBand, PageHero } from '@/components/site/blocks';
import { Container, NumberedRow } from '@/components/site/editorial';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).charte;
  return pageMeta(lang, '/charte', d.metaTitle, d.metaDesc);
}

export default async function ChartePage({ params }: LangParams) {
  const lang = await pageLang(params);
  const D = getDict(lang);
  const d = D.charte;
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="pb-28">
        <div className="max-w-3xl">{D.site.charter.map((c, i) => <NumberedRow key={c.title} index={i + 1} title={c.title} text={c.text} />)}</div>
      </Container>
      <CtaBand title={d.ctaTitle} text={d.ctaText} href={lp(lang, '/consultations')} label={D.cta.seeConsultations} />
    </>
  );
}
