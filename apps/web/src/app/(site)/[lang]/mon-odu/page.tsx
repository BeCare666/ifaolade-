import type { Metadata } from 'next';
import { getDict } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { MyOdu } from './my-odu';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).myOdu;
  return pageMeta(lang, '/mon-odu', d.metaTitle, d.metaDesc);
}

/** « J'ai déjà mon Odu » (plan, étape 5.9), en plein écran sans distraction (REFONTE R16). */
export default function MyOduPage() {
  return <MyOdu />;
}
