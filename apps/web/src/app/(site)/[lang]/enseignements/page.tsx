import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleCard, FrenchContentNote, PageHero } from '@/components/site/blocks';
import { Container } from '@/components/site/editorial';
import { EmptyState } from '@/components/ui/primitives';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { ArticleBrief } from '@/lib/types';

export const revalidate = 300;
type P = { params: Promise<{ lang: string }>; searchParams: Promise<{ categorie?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).teach;
  return pageMeta(lang, '/enseignements', d.metaTitle, d.metaDesc);
}

export default async function EnseignementsPage({ params, searchParams }: P) {
  const lang = await pageLang(params);
  const D = getDict(lang);
  const d = D.teach;
  const cats = D.site.categories;
  const { categorie } = await searchParams;
  const valid = categorie && cats[categorie] ? categorie : undefined;
  const articles = await apiGet<ArticleBrief[]>(`/articles${valid ? `?category=${valid}` : ''}`);
  const base = lp(lang, '/enseignements');

  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="pb-28">
        <nav aria-label={d.categories} className="flex flex-wrap gap-2">
          <Chip href={base} active={!valid}>{d.all}</Chip>
          {Object.entries(cats).map(([k, l]) => <Chip key={k} href={`${base}?categorie=${k}`} active={valid === k}>{l}</Chip>)}
        </nav>
        <div className="mt-12">
          {articles && articles.length ? (
            <>
              <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{articles.map((a) => <ArticleCard key={a.id} article={a} lang={lang} />)}</div>
              <FrenchContentNote lang={lang} />
            </>
          ) : <EmptyState variant={valid ? 'no-results' : 'empty'} title={valid ? d.emptyCat : d.empty} />}
        </div>
      </Container>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn('inline-flex h-9 items-center rounded-full border px-4 text-[13px] transition-colors', active ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong text-text-muted hover:text-text')}>
      {children}
    </Link>
  );
}
