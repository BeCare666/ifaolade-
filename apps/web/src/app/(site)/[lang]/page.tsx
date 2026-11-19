import { castOpele, MEJI } from '@ona/core';
import {
  ArrowRight, BadgeCheck, CalendarCheck, CircleDot, Clock, Coins, Gift, Hand, HeartHandshake, Lock, MessageCircleQuestion, Plane,
  Receipt, Repeat, ScrollText, ShieldCheck, Sparkles, Users, type LucideIcon,
} from 'lucide-react';
import { Seal } from '@/components/brand/logo';
import { OponRing } from '@/components/brand/opon-ring';
import { Adire } from '@/components/brand/patterns';
import { SitePhoto } from '@/components/site/site-photo';
import { pick } from '@/lib/site-data-shared';
import { getSiteData } from '@/lib/site-data.server';
import Link from 'next/link';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { ArticleCard, CtaBand, EventCard } from '@/components/site/blocks';
import { Container, NumberedRow, Reveal, SectionIntro } from '@/components/site/editorial';
import { Faq } from '@/components/site/faq';
import { InstallSection } from '@/components/site/install-section';
import { ButtonLink } from '@/components/ui/button';
import { getDict, lp, tpl } from '@/i18n';
import { pageLang, type LangParams } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import type { ArticleBrief, EventItem } from '@/lib/types';

export const revalidate = 300;

export default async function HomePage({ params }: LangParams) {
  const lang = await pageLang(params);
  const d = getDict(lang);
  const h = d.home;
  const L = (p: string) => lp(lang, p);
  const h2 = d.home2;
  const [events, articles, site, stats] = await Promise.all([
    apiGet<EventItem[]>('/events'), apiGet<ArticleBrief[]>('/articles?limit=3'), getSiteData(lang), apiGet<{ consultations: number; followUps: number }>('/site/stats', 300),
  ]);
  const nextEvent = events?.[0];
  // Glyphe décoratif du héros : tirage à graine fixe, pour que le rendu serveur et client concordent.
  const hero = castOpele(seeded(14));
  const icons = [Clock, Gift, Lock];

  return (
    <>
      {/* 1. Héros : se vendre dès le premier regard (REFONTE §6) */}
      <section className="relative overflow-hidden bg-night text-kaolin">
        <Adire kind="grid" opacity={0.055} />
        <Container className="relative grid items-center gap-14 pb-20 pt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:pb-28 lg:pt-20">
          <Reveal>
            <p className="inline-flex items-center gap-2.5 rounded-full border border-kaolin/20 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.18em] text-kaolin/80">
              <span className="h-1.5 w-1.5 rounded-full bg-osun" /> {pick(site, 'home.heroOverline', h2.overline)}
            </p>
            <h1 className="text-hero mt-7 text-kaolin">{pick(site, 'home.heroTitle', h2.title)}</h1>
            <p className="mt-7 max-w-xl text-[17px] leading-[1.75] text-kaolin/75 lg:text-[18px]">
              {pick(site, 'home.heroText', h2.text)} <strong className="font-medium text-kaolin">{h2.strong}</strong>
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href={L('/consultations/reserver?offre=FIRST_FREE')} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-osun px-8 text-[15px] font-medium text-kaolin transition-colors hover:bg-osun-hover">
                <Gift size={18} strokeWidth={1.7} /> {pick(site, 'home.heroCta', h2.cta)}
              </Link>
              <Link href={L('/connais-toi')} className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-kaolin/30 px-8 text-[15px] text-kaolin transition-colors hover:bg-kaolin hover:text-night">
                <Sparkles size={17} strokeWidth={1.7} /> {pick(site, 'home.heroCta2', h2.cta2)}
              </Link>
            </div>
            <ul className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4">
              {h2.guarantees.map((g, i) => {
                const I = [BadgeCheck, Receipt, ShieldCheck, CalendarCheck][i];
                return (
                  <li key={g} className="flex items-center gap-3 text-[14px] text-kaolin/85">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-kaolin/20 text-kaolin"><I size={16} strokeWidth={1.6} /></span>{g}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.12} className="relative mx-auto w-full max-w-[440px]">
            <SitePhoto slot="home.hero" lang={lang} alt={h.heroAlt} expected={h.heroPhoto} className="aspect-[4/5] rounded-t-[999px]! border border-kaolin/15 bg-night-soft" priority sizes="(min-width: 1024px) 36vw, 90vw" />
            <div className="absolute -right-3 top-10 hidden rounded-[var(--radius-lg)] border border-kaolin/15 bg-night p-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] sm:block">
              <OduGlyph right={hero.marks.right} left={hero.marks.left} size="sm" animate activeColor="#FAF8F4" label={hero.name} />
            </div>
            <div className="absolute -bottom-7 left-1/2 w-[86%] -translate-x-1/2 rounded-[var(--radius-lg)] bg-kaolin p-5 text-text shadow-[0_24px_48px_-24px_rgba(0,0,0,0.55)] sm:-left-6 sm:w-auto sm:translate-x-0">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-osun text-kaolin"><Gift size={20} strokeWidth={1.6} /></span>
                <div>
                  <p className="font-display text-[22px] font-semibold leading-tight">{pick(site, 'home.offerTitle', h2.offerTitle)}</p>
                  <p className="text-[13px] text-text-muted">{h2.offerMeta}</p>
                  <p className="text-[12px] text-text-faint">{h2.offerNote}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 2. Réassurance : chiffres réels uniquement, masqués à zéro */}
      {stats && (stats.consultations > 0 || stats.followUps > 0) && (
        <section className="border-b border-border bg-sand/60">
          <Container className="flex flex-wrap items-center justify-center gap-x-14 gap-y-4 py-7">
            {stats.consultations > 0 && <p className="flex items-baseline gap-3"><span className="font-display text-[34px] font-semibold text-text">{stats.consultations}</span><span className="text-[14px] text-text-muted">{h2.stats.consultations}</span></p>}
            {stats.followUps > 0 && <p className="flex items-baseline gap-3"><span className="font-display text-[34px] font-semibold text-text">{stats.followUps}</span><span className="text-[14px] text-text-muted">{h2.stats.followUps}</span></p>}
          </Container>
        </section>
      )}

      {/* 3. Ce que tu vis */}
      <section className="pt-16">
        <Container className="py-20 lg:py-28">
          <SectionIntro overline={h2.livesOverline} title={pick(site, 'home.livesTitle', h2.livesTitle)} text={h2.livesText} />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LIVES.map(([key, Icon], i) => (
              <Reveal key={key} delay={i * 0.04}>
                <Link href={L(`/consultations/reserver?offre=FIRST_FREE&domaine=${key}`)} className="group flex h-full items-start gap-5 rounded-[var(--radius-lg)] border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-soft)]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon size={21} strokeWidth={1.5} /></span>
                  <span className="min-w-0">
                    <span className="font-display block text-[22px] font-semibold leading-tight text-text">{h2.lives[key][0]}</span>
                    <span className="mt-1.5 block text-[14px] leading-relaxed text-text-muted">{h2.lives[key][1]}</span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-osun">{h2.cta} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. La consultation offerte en 3 étapes */}
      <section className="relative overflow-hidden bg-sand/70">
        <Container className="py-20 lg:py-28">
          <SectionIntro overline={h2.stepsOverline} title={pick(site, 'home.stepsTitle', h2.stepsTitle)} />
          <ol className="mt-14 grid gap-6 lg:grid-cols-3">
            {h2.steps.map(([title, text], i) => {
              const I = [MessageCircleQuestion, CircleDot, ScrollText][i];
              return (
                <Reveal key={title} delay={i * 0.06}>
                  <li className="relative h-full rounded-[var(--radius-lg)] border border-border bg-surface p-7">
                    <span className="font-display absolute right-6 top-4 text-[64px] font-semibold leading-none text-primary/10">{i + 1}</span>
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-night text-kaolin"><I size={20} strokeWidth={1.5} /></span>
                    <h3 className="text-card-title mt-6 text-text">{title}</h3>
                    <p className="mt-3 text-[15px] leading-[1.75] text-text-muted">{text}</p>
                  </li>
                </Reveal>
              );
            })}
          </ol>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={L('/consultations/reserver?offre=FIRST_FREE')} size="lg">{h2.cta}</ButtonLink>
            <ButtonLink href={L('/protocole')} variant="secondary" size="lg">{h.protocolCta}</ButtonLink>
          </div>
        </Container>
      </section>

      {/* 5. Le(s) babaláwo : uniquement ce que le prêtre a saisi dans l'admin */}
      {site.practitioners.length > 0 && (
        <section>
          <Container className="py-20 lg:py-28">
            <SectionIntro overline={h2.priestOverline} title={pick(site, 'home.priestTitle', h2.priestTitle)} />
            <div className={`mt-14 grid gap-8 ${site.practitioners.length > 1 ? 'md:grid-cols-2' : 'max-w-4xl'}`}>
              {site.practitioners.map((p) => (
                <Reveal key={p.id}>
                  <article className="grid items-center gap-8 rounded-[var(--radius-photo)] border border-border bg-surface p-7 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-9">
                    <OponRing className="mx-auto h-[180px] w-[180px]">
                      {p.photoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
                        : <span className="grid h-full w-full place-items-center bg-night text-kaolin"><Seal size={72} inverse /></span>}
                    </OponRing>
                    <div>
                      <h3 className="font-display text-[32px] font-semibold leading-tight text-text">{p.name}</h3>
                      {p.title && <p className="mt-1 text-[15px] text-osun">{p.title}</p>}
                      <ul className="mt-4 space-y-1.5 text-[14px] text-text-muted">
                        {p.lineage && <li>{p.lineage}</li>}
                        {p.initiatedYear && <li>{tpl(h2.priestInitiated, { year: p.initiatedYear })}</li>}
                        {p.languages && <li>{tpl(h2.priestLanguages, { l: p.languages })}</li>}
                      </ul>
                      {p.bio && <p className="mt-4 line-clamp-4 text-[15px] leading-[1.75] text-text-muted">{p.bio}</p>}
                      <Link href={L('/a-propos')} className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-primary">{h2.priestCta} <ArrowRight size={14} /></Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 3. Connais-toi */}
      <section className="bg-bg-subtle">
        <Container className="grid items-center gap-14 py-24 lg:grid-cols-2 lg:gap-24 lg:py-32">
          <div>
            <SectionIntro overline={h.knowOverline} title={h.knowTitle} text={h.knowText} />
            <Reveal delay={0.1}>
              <ul className="mt-10 grid gap-4 sm:grid-cols-3">
                {h.knowPoints.map((t, i) => {
                  const I = icons[i];
                  return (
                    <li key={t} className="flex items-center gap-3 text-[14px] text-text">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-text-muted"><I size={16} strokeWidth={1.5} /></span>{t}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-10"><ButtonLink href={L('/connais-toi')} size="lg">{h.knowCta}</ButtonLink></div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="rounded-[var(--radius-photo)] border border-border bg-surface p-8 sm:p-10" aria-hidden>
              <p className="text-overline">{h.sampleOverline}</p>
              <p className="text-card-title mt-5 text-text">{h.sampleTitle}</p>
              <p className="mt-1 text-[13px] text-text-faint">{h.sampleSub}</p>
              <p className="mt-5 text-[15px] leading-[1.8] text-text-muted">{h.sampleText}</p>
              <div className="mt-6 space-y-2 select-none blur-[5px]">
                {h.sampleBlur.map((s) => <p key={s} className="text-[15px] leading-[1.8] text-text-muted">{s}</p>)}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* J'ai déjà mon Odu */}
      <section className="relative overflow-hidden bg-night text-kaolin">
        <Adire kind="dots" opacity={0.06} />
        <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-kaolin/60">{h2.myOduOverline}</p>
            <h2 className="text-section mt-5 text-kaolin">{h2.myOduTitle}</h2>
            <p className="mt-5 max-w-lg text-[16px] leading-[1.8] text-kaolin/75">{h2.myOduText}</p>
            <Link href={L('/mon-odu')} className="mt-9 inline-flex h-13 items-center gap-2 rounded-full bg-kaolin px-7 py-3.5 text-[15px] font-medium text-night transition-colors hover:bg-sand">
              <Hand size={17} strokeWidth={1.7} /> {h2.myOduCta}
            </Link>
          </div>
          <div className="mx-auto grid w-[280px] grid-cols-2 gap-x-8 gap-y-5 rounded-[32px] border border-kaolin/10 p-8" aria-hidden>
            {[2, 1, 1, 2, 1, 2, 2, 1].map((m, i) => (
              <span key={i} className={`grid h-[70px] w-[70px] place-items-center rounded-full font-mono text-[14px] tracking-[0.25em] ${m === 2 ? 'bg-kaolin text-night shadow-[0_0_0_1px_rgba(250,248,244,0.9),0_0_22px_4px_rgba(250,248,244,0.3)]' : 'text-kaolin/50 shadow-[0_0_0_1px_rgba(250,248,244,0.22)]'}`}>{m === 2 ? 'II' : 'I'}</span>
            ))}
          </div>
        </Container>
      </section>

      {/* 2. Le constat */}
      <section className="bg-surface">
        <Container className="grid gap-14 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24 lg:py-32">
          <SectionIntro className="lg:sticky lg:top-28 lg:self-start" overline={h.painOverline} title={h.painTitle} text={h.painText} />
          <div>{d.site.pains.map((p, i) => <NumberedRow key={p.title} index={i + 1} title={p.title} text={p.text} />)}</div>
        </Container>
      </section>

      {/* 4. Le protocole */}
      <section>
        <Container className="py-24 lg:py-32">
          <SectionIntro overline={h.protocolOverline} title={h.protocolTitle} text={h.protocolText} />
          <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {d.site.protocol.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <li className="border-t border-border pt-6">
                  <p className="text-[12px] font-medium tracking-[0.2em] tabular-nums text-accent">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="text-card-title mt-3 text-text">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-[1.75] text-text-muted">{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <div className="mt-14"><ButtonLink href={L('/protocole')} variant="secondary">{h.protocolCta}</ButtonLink></div>
        </Container>
      </section>

      {/* 5. La charte */}
      <section className="bg-surface">
        <Container className="grid gap-14 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24 lg:py-32">
          <SectionIntro className="lg:sticky lg:top-28 lg:self-start" overline={h.charterOverline} title={h.charterTitle} text={h.charterText} />
          <div>
            {d.site.charter.slice(0, 5).map((c, i) => <NumberedRow key={c.title} index={i + 1} title={c.title} text={c.text} />)}
            <div className="border-t border-border pt-8"><ButtonLink href={L('/charte')} variant="secondary">{h.charterCta}</ButtonLink></div>
          </div>
        </Container>
      </section>

      {/* 6. Les 16 Odu majeurs */}
      <section>
        <Container className="py-24 lg:py-32">
          <SectionIntro overline={h.oduOverline} title={h.oduTitle} text={h.oduText} />
          <div className="mt-16 grid grid-cols-4 gap-x-4 gap-y-10 sm:grid-cols-8">
            {MEJI.map((m, i) => (
              <Reveal key={m.index} delay={(i % 8) * 0.03}>
                <Link href={L(`/odu/${m.ascii}-meji`)} className="group flex flex-col items-center text-center">
                  <OduGlyph right={m.marks} left={m.marks} size="sm" label={`${m.name} Méjì`} />
                  <span className="mt-3 text-[14px] text-text transition-colors group-hover:text-primary">{m.name}</span>
                  <span className="text-[12px] text-text-faint">{m.fon}</span>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-14"><ButtonLink href={L('/odu')} variant="secondary">{h.oduCta}</ButtonLink></div>
        </Container>
      </section>

      {/* 7. Le Bénin */}
      <section className="bg-bg-subtle">
        <Container className="grid gap-14 py-24 lg:grid-cols-2 lg:gap-24 lg:py-32">
          <div className="grid grid-cols-2 gap-4">
            <SitePhoto slot="home.benin.1" lang={lang} alt={h.beninPhotos[0]} expected={h.beninPhotos[0]} className="aspect-[3/4]" sizes="25vw" />
            <SitePhoto slot="home.benin.2" lang={lang} alt={h.beninPhotos[1]} expected={h.beninPhotos[1]} className="mt-12 aspect-[3/4]" sizes="25vw" />
          </div>
          <div className="lg:pt-10">
            <SectionIntro overline={h.beninOverline} title={h.beninTitle} text={h.beninText} />
            <Reveal delay={0.1} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={L('/initiation')}>{h.beninCta1}</ButtonLink>
              <ButtonLink href={L('/circuits')} variant="secondary">{h.beninCta2}</ButtonLink>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 8. Événement à venir */}
      {nextEvent && (
        <section>
          <Container className="py-24 lg:py-28">
            <SectionIntro overline={h.eventOverline} title={h.eventTitle} />
            <div className="mt-12 max-w-4xl"><EventCard event={nextEvent} lang={lang} /></div>
          </Container>
        </section>
      )}

      {/* 9. Enseignements */}
      {articles && articles.length > 0 && (
        <section className={nextEvent ? 'bg-surface' : ''}>
          <Container className="py-24 lg:py-28">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionIntro overline={h.teachOverline} title={h.teachTitle} />
              <ButtonLink href={L('/enseignements')} variant="secondary">{h.teachCta}</ButtonLink>
            </div>
            <div className="mt-14 grid gap-10 md:grid-cols-3">{articles.map((a) => <ArticleCard key={a.id} article={a} lang={lang} />)}</div>
          </Container>
        </section>
      )}

      {/* 10. Questions fréquentes */}
      <section>
        <Container className="grid gap-14 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24 lg:py-32">
          <SectionIntro className="lg:sticky lg:top-28 lg:self-start" overline={h.faqOverline} title={h.faqTitle} />
          <div>
            <Faq items={[...d.site.faq.slice(0, 6)]} />
            <div className="mt-8"><ButtonLink href={L('/faq')} variant="ghost">{h.faqCta}</ButtonLink></div>
          </div>
        </Container>
      </section>

      {/* 12. Installer l'application (plan étape 8.4) */}
      <InstallSection />

      {/* 11. Bandeau d'appel */}
      <CtaBand title={pick(site, 'home.ctaTitle', h.ctaTitle)} text={pick(site, 'home.ctaText', h.ctaText)} href={L('/connais-toi')} label={d.cta.discover} />
    </>
  );
}

/** Tuiles « Ce que tu vis » : clé de domaine → icône. */
const LIVES: ['blocage' | 'installation' | 'amour' | 'argent' | 'famille' | 'spirituel', LucideIcon][] = [
  ['blocage', Repeat], ['installation', Plane], ['amour', HeartHandshake], ['argent', Coins], ['famille', Users], ['spirituel', ShieldCheck],
];

/** Générateur pseudo-aléatoire déterministe (même glyphe au rendu serveur et client). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
