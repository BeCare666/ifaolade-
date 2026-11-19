import type { Metadata } from 'next';
import { PageHero } from '@/components/site/blocks';
import { Container } from '@/components/site/editorial';
import { getDict } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { OduExplorer } from './odu-explorer';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).odu;
  return pageMeta(lang, '/odu', d.metaTitle, d.metaDesc);
}

export default async function OduPage({ params }: LangParams) {
  const d = getDict(await pageLang(params)).odu;
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="pb-28"><OduExplorer /></Container>
    </>
  );
}
