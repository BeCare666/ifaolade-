import { allOdu, defaultLore, oduById, oduBySlug, oduText } from '@ona/core';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OduElements } from '@/components/odu/odu-elements';
import { BirthReading, Lessons, LoreIntro } from '@/components/odu/odu-lore';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { CtaBand, FrenchContentNote } from '@/components/site/blocks';
import { Container, Reveal } from '@/components/site/editorial';
import { Markdown } from '@/components/site/markdown';
import { Breadcrumb } from '@/components/ui/primitives';
import { getDict, isLang, lp, tpl, type Lang } from '@/i18n';
import { pageMeta } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import { pick } from '@/lib/site-data-shared';
import { getSiteData } from '@/lib/site-data.server';
import type { LibraryBrief, OduDomainReading, OduTeaching } from '@/lib/types';
import { EntryCard } from '@/components/site/library-pages';

export const revalidate = 600;
type P = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return allOdu().map((o) => ({ slug: o.slug }));
}

const langOf = (l: string): Lang => (isLang(l) ? l : 'fr');

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang: l, slug } = await params;
  const lang = langOf(l);
  const o = oduBySlug(slug);
  if (!o) return {};
  return pageMeta(lang, `/odu/${o.slug}`, `${o.name} (${o.fonName})`, `${o.name} : ${oduText(o, lang).keywords.join(', ')}.`);
}

export default async function OduDetail({ params }: P) {
  const { lang: l, slug } = await params;
  const lang = langOf(l);
  const D = getDict(lang);
  const d = D.odu;
  const lx = d.lore;
  const o = oduBySlug(slug);
  if (!o) notFound();
  // Le texte du prêtre (admin) est en français : il ne remplace le texte du moteur qu'en français.
  const [content, site, domains, linked] = await Promise.all([
    apiGet<OduTeaching>(`/odu/${o.slug}`, 600), getSiteData(lang), apiGet<OduDomainReading[]>(`/odu/${o.slug}/domaines`, 600),
    apiGet<LibraryBrief[]>(`/odu/${o.slug}/library`, 300),
  ]);
  // Texte de départ si l'API est injoignable : la fiche n'est jamais vide (R13).
  const lore = content?.lore ?? defaultLore(o);
  const teaching = content?.teaching || lore.teaching;
  const shownDomains = (domains ?? []).filter((x) => x.own || x.right || x.left);
  const txt = oduText(o, lang);
  const all = allOdu();
  const prev = o.rank > 1 ? all[o.rank - 2] : null;
  const next = o.rank < 256 ? all[o.rank] : null;
  const rightMeji = oduById(o.right.index * 17)!;
  const leftMeji = oduById(o.left.index * 17)!;
  const keywords = lang === 'fr' && content?.keywords?.length ? content.keywords : txt.keywords;
  const essence = lang === 'fr' ? content?.essence || o.essence : txt.essence;

  return (
    <>
      <Container className="pb-20 pt-12 lg:pt-16">
        <Breadcrumb items={[{ label: d.breadcrumb, href: lp(lang, '/odu') }, { label: o.name }]} />
        <div className="mt-10 grid items-start gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          <Reveal className="lg:sticky lg:top-28">
            <div className="flex aspect-[4/5] items-center justify-center rounded-[var(--radius-photo)] border border-border bg-surface">
              <OduGlyph right={o.marks.right} left={o.marks.left} size="lg" animate label={o.name} />
            </div>
            <div className="mt-4 flex justify-between px-2 text-[12px] text-text-faint">
              <span>{tpl(d.leftLeg, { name: o.left.name })}</span>
              <span>{tpl(d.rightLeg, { name: o.right.name })}</span>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-overline">{tpl(d.rankOf, { n: o.rank })} · {o.isMeji ? d.meji : d.omo}</p>
              <h1 className="text-hero mt-5 text-text">{o.name}</h1>
              <p className="mt-4 text-[17px] text-text-muted">{tpl(d.inFa, { name: o.fonName })}</p>
              <p className="mt-8 flex flex-wrap gap-2">
                {keywords.map((k) => <span key={k} className="rounded-full border border-border-strong px-3 py-1 text-[13px] text-text-muted">{k}</span>)}
              </p>
            </Reveal>

            <Reveal delay={0.05} className="mt-14 border-t border-border pt-10">
              <h2 className="text-card-title text-text">{lx.oriki}</h2>
              <div className="mt-6"><LoreIntro lore={lore} l={lx} /></div>
            </Reveal>

            <Reveal delay={0.05} className="mt-12 border-t border-border pt-10">
              <h2 className="text-card-title text-text">{d.essence}</h2>
              <p className="text-body mt-4">{essence}</p>
            </Reveal>

            {!o.isMeji && (
              <Reveal delay={0.05} className="mt-12 border-t border-border pt-10">
                <h2 className="text-card-title text-text">{d.legs}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[{ label: d.rightDominant, m: rightMeji }, { label: d.leftLegShort, m: leftMeji }].map(({ label, m }) => (
                    <Link key={label} href={lp(lang, `/odu/${m.slug}`)} className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5 transition-colors hover:border-border-strong">
                      <OduGlyph right={m.marks.right} left={m.marks.left} size="xs" label={m.name} />
                      <span><span className="block text-[12px] text-text-faint">{label}</span><span className="text-[15px] text-text">{m.name}</span></span>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal delay={0.05} className="mt-12 border-t border-border pt-10">
              <h2 className="text-card-title text-text">{d.elementsTitle}</h2>
              <p className="mt-3 text-[14px] text-text-muted">{pick(site, 'odu.elementsText', d.elementsText)}</p>
              <div className="mt-6"><OduElements elements={o.elements} lang={lang} labels={{ manifest: site.texts['odu.manifest'], balance: site.texts['odu.balance'], latent: site.texts['odu.latent'] }} /></div>
              <p className="mt-6 font-mono text-[12px] tracking-[0.25em] text-text-faint">{o.binary}</p>
            </Reveal>

            <Reveal delay={0.05} className="mt-12 border-t border-border pt-10">
              <h2 className="text-card-title text-text">{lx.lessons}</h2>
              <div className="mt-6"><Lessons lore={lore} /></div>
            </Reveal>

            <Reveal delay={0.05} className="mt-12 border-t border-border pt-10">
              <h2 className="text-card-title text-text">{d.teaching}</h2>
              <div className="mt-6"><Markdown source={teaching} /></div>
            </Reveal>

            {shownDomains.length > 0 && (
              <Reveal delay={0.05} className="mt-12 border-t border-border pt-10">
                <h2 className="text-card-title text-text">{lx.domains}</h2>
                <div className="mt-6 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
                  {shownDomains.map((x) => (
                    <details key={x.domain} className="group px-5 py-4 sm:px-6">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-text">
                        {D.myOdu.domains[x.domain as keyof typeof D.myOdu.domains] ?? x.domain}
                        <span className="text-text-faint transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <div className="mt-3 space-y-3 text-[15px] leading-[1.8] text-text-muted">
                        {x.own ? <p>{x.own}</p> : (
                          <>
                            <p className="text-[13px] text-text-faint">{lx.domainLegs}</p>
                            {x.right && <p><strong className="font-medium text-text">{o.right.name}.</strong> {x.right}</p>}
                            {x.left && <p><strong className="font-medium text-text">{o.left.name}.</strong> {x.left}</p>}
                          </>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal delay={0.05} className="mt-12 border-t border-border pt-10">
              <h2 className="text-card-title text-text">{lx.birthTitle}</h2>
              <div className="mt-6"><BirthReading lore={lore} l={lx} /></div>
              <p className="mt-6 text-[12px] text-text-faint">{lx.traditionNote}</p>
              <FrenchContentNote lang={lang} />
            </Reveal>

            {linked && linked.length > 0 && (
              <Reveal delay={0.05} className="mt-12 border-t border-border pt-10">
                <h2 className="text-card-title text-text">{D.library.related}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {linked.map((e) => <EntryCard key={e.id} e={e} lang={lang} kind={e.kind} cats={D.library.categories[e.kind] as Record<string, string>} />)}
                </div>
              </Reveal>
            )}

            <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-border pt-8" aria-label={d.neighbours}>
              {prev ? <Link href={lp(lang, `/odu/${prev.slug}`)} className="flex items-center gap-3 text-[14px] text-text-muted hover:text-text"><ArrowLeft size={16} /> {prev.name}</Link> : <span />}
              {next && <Link href={lp(lang, `/odu/${next.slug}`)} className="flex items-center justify-end gap-3 text-right text-[14px] text-text-muted hover:text-text">{next.name} <ArrowRight size={16} /></Link>}
            </nav>
          </div>
        </div>
      </Container>
      <CtaBand title={d.ctaTitle} text={d.ctaText} href={lp(lang, '/consultations')} label={getDict(lang).cta.consult} />
    </>
  );
}
