import type { Metadata } from 'next';
import { PageHero } from '@/components/site/blocks';
import { Container } from '@/components/site/editorial';
import { getDict } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { MyOdu } from './my-odu';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).myOdu;
  return pageMeta(lang, '/mon-odu', d.metaTitle, d.metaDesc);
}

/** « J'ai déjà mon Odu » (plan, étape 5.9). */
export default async function MyOduPage({ params }: LangParams) {
  const d = getDict(await pageLang(params)).myOdu;
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="pb-28"><MyOdu /></Container>
    </>
  );
}
