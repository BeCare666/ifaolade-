import type { Metadata } from 'next';
import { LegalPage, legalMeta } from '@/components/site/legal';
import { pageLang, type LangParams } from '@/i18n/server';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return legalMeta(await pageLang(params), 'cookies');
}

export default async function Page({ params }: LangParams) {
  return <LegalPage lang={await pageLang(params)} page="cookies" />;
}
