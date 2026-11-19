import type { Metadata } from 'next';
import { getDict } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { Wizard } from './wizard';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).wizard;
  return pageMeta(lang, '/connais-toi', d.metaTitle, d.metaDesc);
}

export default function ConnaisToiPage() {
  return <Wizard />;
}
