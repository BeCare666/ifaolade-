import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CtaBand, fmtDate, FrenchContentNote, Photo } from '@/components/site/blocks';
import { Container } from '@/components/site/editorial';
import { Markdown } from '@/components/site/markdown';
import { Breadcrumb } from '@/components/ui/primitives';
import { getDict, isLang, lp, type Lang } from '@/i18n';
import { pageMeta } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import type { Article } from '@/lib/types';

export const revalidate = 300;
type P = { params: Promise<{ lang: string; slug: string }> };
const langOf = (l: string): Lang => (isLang(l) ? l : 'fr');

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = await apiGet<Article>(`/articles/${slug}`);
  return a ? pageMeta(langOf(lang), `/enseignements/${slug}`, a.title, a.excerpt) : {};
}

export default async function ArticlePage({ params }: P) {
  const { lang: l, slug } = await params;
  const lang = langOf(l);
  const D = getDict(lang);
  const a = await apiGet<Article>(`/articles/${slug}`);
  if (!a) notFound();
  return (
    <>
      <Container className="pb-24 pt-12 lg:pt-16">
        <div className="mx-auto max-w-3xl">
          <Breadcrumb items={[{ label: D.nav.enseignements, href: lp(lang, '/enseignements') }, { label: D.site.categories[a.category] ?? a.category }]} />
          <h1 className="text-section mt-8 text-text">{a.title}</h1>
          <p className="mt-6 text-[18px] leading-[1.7] text-text-muted">{a.excerpt}</p>
          {a.publishedAt && <p className="mt-6 text-[13px] text-text-faint">{fmtDate(lang, a.publishedAt)}</p>}
          <FrenchContentNote lang={lang} />
        </div>
        {a.coverUrl && <div className="mx-auto mt-12 max-w-5xl"><Photo lang={lang} src={a.coverUrl} alt={a.title} expected="" className="aspect-[16/9]" priority /></div>}
        <article className="mx-auto mt-14 max-w-3xl"><Markdown source={a.body} /></article>
      </Container>
      <CtaBand title={D.teach.ctaTitle} href={lp(lang, '/consultations')} label={D.cta.consult} />
    </>
  );
}
