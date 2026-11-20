import type { Metadata } from 'next';
import { LibraryDetail, libraryEntryMeta } from '@/components/site/library-pages';
import { isLang, type Lang } from '@/i18n';

export const revalidate = 300;
type P = { params: Promise<{ lang: string; slug: string }> };
const langOf = (l: string): Lang => (isLang(l) ? l : 'fr');

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  return libraryEntryMeta(langOf(lang), 'wasu', slug);
}

export default async function Page({ params }: P) {
  const { lang, slug } = await params;
  return <LibraryDetail lang={langOf(lang)} kind="wasu" slug={slug} />;
}
