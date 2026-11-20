import type { Metadata } from 'next';
import { LibraryIndex, libraryIndexMeta } from '@/components/site/library-pages';
import { pageLang } from '@/i18n/server';

export const revalidate = 300;
type P = { params: Promise<{ lang: string }>; searchParams: Promise<{ categorie?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return libraryIndexMeta(await pageLang(params), 'divinite');
}

/** Bibliothèque spirituelle (REFONTE R21). */
export default async function Page({ params, searchParams }: P) {
  const lang = await pageLang(params);
  const { categorie } = await searchParams;
  return <LibraryIndex lang={lang} kind="divinite" category={categorie} />;
}
