import { LIBRARY_CATEGORIES, LIBRARY_META, oduById, type LibraryKind } from '@ona/core';
import { ArrowUpRight, Info, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { CtaBand, FrenchContentNote, PageHero, Photo } from '@/components/site/blocks';
import { Container, Reveal } from '@/components/site/editorial';
import { Markdown } from '@/components/site/markdown';
import { Breadcrumb, EmptyState } from '@/components/ui/primitives';
import { getDict, lp, type Lang } from '@/i18n';
import { pageMeta } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { LibraryBrief, LibraryEntry } from '@/lib/types';

/*
 * Bibliothèque spirituelle (REFONTE R21) : pages publiques des rituels, wáàsù et divinités.
 * Le contenu privé des rituels (matériel, quantités) n'arrive jamais ici : l'API ne le renvoie pas.
 */

export const LIBRARY_PATH: Record<LibraryKind, string> = { rituel: '/rituels', wasu: '/wasu', divinite: '/divinites' };

export function libraryIndexMeta(lang: Lang, kind: LibraryKind): Metadata {
  const k = getDict(lang).library.kinds[kind];
  return pageMeta(lang, LIBRARY_PATH[kind], k.metaTitle, k.metaDesc);
}

export async function libraryEntryMeta(lang: Lang, kind: LibraryKind, slug: string): Promise<Metadata> {
  const e = await apiGet<LibraryEntry>(`/library/${kind}/${slug}`, 300);
  return e ? pageMeta(lang, `${LIBRARY_PATH[kind]}/${slug}`, e.title, e.excerpt) : {};
}

export async function LibraryIndex({ lang, kind, category }: { lang: Lang; kind: LibraryKind; category?: string }) {
  const D = getDict(lang);
  const L = D.library;
  const k = L.kinds[kind];
  const cats = L.categories[kind] as Record<string, string>;
  const valid = category && (LIBRARY_CATEGORIES[kind] as readonly string[]).includes(category) ? category : undefined;
  const rows = await apiGet<LibraryBrief[]>(`/library/${kind}${valid ? `?category=${valid}` : ''}`, 300);
  const base = lp(lang, LIBRARY_PATH[kind]);

  return (
    <>
      <PageHero overline={k.overline} title={k.title} text={k.text} />
      <Container className="pb-28">
        <nav aria-label={k.crumb} className="flex flex-wrap gap-2">
          <Chip href={base} active={!valid}>{L.all}</Chip>
          {LIBRARY_CATEGORIES[kind].map((c) => <Chip key={c} href={`${base}?categorie=${c}`} active={valid === c}>{cats[c]}</Chip>)}
        </nav>
        {kind === 'rituel' && (
          <p className="mt-6 flex max-w-3xl items-start gap-2.5 text-[13px] leading-relaxed text-text-muted"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" /> {L.defenseNote}</p>
        )}
        <div className="mt-12">
          {rows && rows.length ? (
            <div className={cn('grid gap-6', kind === 'divinite' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2')}>
              {rows.map((e, i) => <EntryCard key={e.id} e={e} lang={lang} kind={kind} cats={cats} delay={Math.min(i, 6) * 0.04} />)}
            </div>
          ) : <EmptyState variant={valid ? 'no-results' : 'empty'} title={L.empty} />}
          <FrenchContentNote lang={lang} />
        </div>
      </Container>
    </>
  );
}

export function EntryCard({ e, lang, kind, cats, delay = 0 }: { e: LibraryBrief; lang: Lang; kind: LibraryKind; cats: Record<string, string>; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link href={lp(lang, `${LIBRARY_PATH[kind]}/${e.slug}`)}
        className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface transition-colors hover:border-border-strong">
        {e.coverUrl && <Photo lang={lang} src={e.coverUrl} alt={e.title} expected="" className="aspect-[16/9] rounded-none!" sizes="(min-width: 1024px) 33vw, 100vw" />}
        <div className="flex flex-1 flex-col p-6">
          <p className="text-overline">{cats[e.category] ?? e.category}</p>
          <h2 className="mt-3 font-display text-[26px] leading-tight text-text">{e.title}</h2>
          {e.subtitle && <p className="mt-1 text-[14px] text-text-faint">{e.subtitle}</p>}
          <p className="mt-4 flex-1 text-[15px] leading-[1.7] text-text-muted">{e.excerpt}</p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-primary">{getDict(lang).library.read} <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export async function LibraryDetail({ lang, kind, slug }: { lang: Lang; kind: LibraryKind; slug: string }) {
  const D = getDict(lang);
  const L = D.library;
  const e = await apiGet<LibraryEntry>(`/library/${kind}/${slug}`, 300);
  if (!e) notFound();
  const cats = L.categories[kind] as Record<string, string>;
  const meta = LIBRARY_META[kind].filter((m) => e.meta?.[m]).map((m) => ({ key: m, label: L.meta[m as keyof typeof L.meta], value: e.meta![m] }));
  const odus = (e.oduIds ?? []).map((id) => oduById(id)).filter((o): o is NonNullable<typeof o> => !!o);

  return (
    <>
      <Container className="pb-24 pt-12 lg:pt-16">
        <div className="mx-auto max-w-3xl">
          <Breadcrumb items={[{ label: L.kinds[kind].crumb, href: lp(lang, LIBRARY_PATH[kind]) }, { label: cats[e.category] ?? e.category }]} />
          <p className="text-overline mt-10">{cats[e.category] ?? e.category}</p>
          <h1 className="text-section mt-4 text-text">{e.title}</h1>
          {e.subtitle && <p className="mt-3 text-[17px] text-text-faint">{e.subtitle}</p>}
          <p className="mt-6 text-[19px] leading-[1.7] text-text-muted">{e.excerpt}</p>
          {kind === 'wasu' && e.meta?.quote && (
            <blockquote className="mt-10 border-l-2 border-osun pl-6 font-display text-[24px] leading-[1.45] text-text">{e.meta.quote}</blockquote>
          )}
        </div>
        {e.coverUrl && <div className="mx-auto mt-12 max-w-5xl"><Photo lang={lang} src={e.coverUrl} alt={e.title} expected="" className="aspect-[16/9]" priority /></div>}

        <div className="mx-auto mt-14 grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            <Markdown source={e.body} />
            {kind === 'rituel' && (
              <div className="mt-10 flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-bg-subtle p-5 text-[14px] leading-[1.7] text-text-muted">
                <Info size={18} className="mt-0.5 shrink-0 text-primary" /> <span>{L.privateNote}{e.category === 'defense' ? ` ${L.defenseNote}` : ''}</span>
              </div>
            )}
            <FrenchContentNote lang={lang} />
          </article>
          {(meta.length > 0 || odus.length > 0) && (
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              {meta.length > 0 && (
                <dl className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
                  {meta.map((m) => (
                    <div key={m.key} className="px-5 py-4">
                      <dt className="text-[12px] uppercase tracking-[0.14em] text-text-faint">{m.label}</dt>
                      <dd className="mt-1.5 text-[15px] leading-[1.6] text-text">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {odus.length > 0 && (
                <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
                  <p className="text-[12px] uppercase tracking-[0.14em] text-text-faint">{L.relatedOdu}</p>
                  <ul className="mt-3 space-y-2">
                    {odus.map((o) => (
                      <li key={o.id}>
                        <Link href={lp(lang, `/odu/${o.slug}`)} className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 text-[15px] text-text hover:bg-bg-subtle">
                          <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} /> {o.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}
        </div>
      </Container>
      <CtaBand title={D.odu.ctaTitle} text={D.odu.ctaText} href={lp(lang, '/consultations/reserver?offre=FIRST_FREE')} label={kind === 'rituel' ? L.consult : D.cta.consult} />
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
