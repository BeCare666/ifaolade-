import type { Metadata } from 'next';
import { CtaBand, PageHero } from '@/components/site/blocks';
import { SitePhoto } from '@/components/site/site-photo';
import { Container, Reveal, SectionIntro } from '@/components/site/editorial';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).apropos;
  return pageMeta(lang, '/a-propos', d.metaTitle, d.metaDesc);
}

/**
 * ⚠️ Plan §17, point 2 : biographie, lignée, initiation, temple et titres sont à fournir par le prêtre.
 * Les passages entre crochets sont des emplacements à remplacer, jamais à publier tels quels.
 */
export default async function AProposPage({ params }: LangParams) {
  const lang = await pageLang(params);
  const D = getDict(lang);
  const d = D.apropos;
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="grid gap-14 pb-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SitePhoto slot="about.main" lang={lang} alt={d.photoMain} expected={d.photoMain} className="aspect-[4/5]" priority sizes="(min-width: 1024px) 40vw, 100vw" />
        </Reveal>
        <div className="space-y-16">
          {d.blocks.map((b) => (
            <div key={b.title}>
              <SectionIntro title={b.title} />
              <Reveal delay={0.05}><p className="text-body mt-6 max-w-2xl">{b.text}</p></Reveal>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <SitePhoto slot="about.opon" lang={lang} alt={d.photoOpon} expected={d.photoOpon} className="aspect-square" sizes="25vw" />
            <SitePhoto slot="about.temple" lang={lang} alt={d.photoTemple} expected={d.photoTemple} className="aspect-square" sizes="25vw" />
          </div>
        </div>
      </Container>
      <CtaBand title={d.ctaTitle} text={d.ctaText} href={lp(lang, '/consultations')} label={D.cta.consult} />
    </>
  );
}
