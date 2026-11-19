import type { Metadata } from 'next';
import { CtaBand, PageHero } from '@/components/site/blocks';
import { Container } from '@/components/site/editorial';
import { Faq } from '@/components/site/faq';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).faqPage;
  return pageMeta(lang, '/faq', d.metaTitle, d.metaDesc);
}

export default async function FaqPage({ params }: LangParams) {
  const lang = await pageLang(params);
  const D = getDict(lang);
  return (
    <>
      <PageHero overline={D.faqPage.overline} title={D.faqPage.title} />
      <Container className="pb-28"><div className="max-w-3xl"><Faq items={[...D.site.faq]} /></div></Container>
      <CtaBand title={D.faqPage.ctaTitle} href={lp(lang, '/contact')} label={D.cta.write} />
    </>
  );
}
