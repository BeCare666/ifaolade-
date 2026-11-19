import { castOpele, MEJI } from '@ona/core';
import { Clock, Gift, Lock } from 'lucide-react';
import Link from 'next/link';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { ArticleCard, CtaBand, EventCard, Photo } from '@/components/site/blocks';
import { Container, NumberedRow, Reveal, SectionIntro } from '@/components/site/editorial';
import { Faq } from '@/components/site/faq';
import { InstallSection } from '@/components/site/install-section';
import { ButtonLink } from '@/components/ui/button';
import { getDict, lp } from '@/i18n';
import { pageLang, type LangParams } from '@/i18n/server';
import { apiGet } from '@/lib/api';
import type { ArticleBrief, EventItem } from '@/lib/types';

export const revalidate = 300;

export default async function HomePage({ params }: LangParams) {
  const lang = await pageLang(params);
  const d = getDict(lang);
  const h = d.home;
  const L = (p: string) => lp(lang, p);
  const [events, articles] = await Promise.all([apiGet<EventItem[]>('/events'), apiGet<ArticleBrief[]>('/articles?limit=3')]);
  const nextEvent = events?.[0];
  // Glyphe décoratif du héros : tirage à graine fixe, pour que le rendu serveur et client concordent.
  const hero = castOpele(seeded(14));
  const icons = [Clock, Gift, Lock];

  return (
    <>
      {/* 1. Héros */}
      <Container className="grid items-center gap-14 pb-20 pt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20 lg:pb-28 lg:pt-16">
        <Reveal>
          <p className="text-overline">{h.overline}</p>
          <h1 className="text-hero mt-6 text-text">{h.title}</h1>
          <p className="text-body mt-8 max-w-xl">{h.text}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={L('/connais-toi')} size="lg">{d.cta.discover}</ButtonLink>
            <ButtonLink href={L('/consultations')} variant="secondary" size="lg">{d.cta.consult}</ButtonLink>
          </div>
          <p className="mt-6 text-[13px] text-text-faint">{h.freeNote}</p>
        </Reveal>
        <Reveal delay={0.1} className="relative">
          <Photo lang={lang} alt={h.heroAlt} expected={h.heroPhoto} className="aspect-[4/5]" priority sizes="(min-width: 1024px) 40vw, 100vw" />
          <div className="absolute -bottom-6 -left-6 hidden rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] sm:block">
            <OduGlyph right={hero.marks.right} left={hero.marks.left} size="sm" animate label={hero.name} />
          </div>
        </Reveal>
      </Container>

      {/* 2. Le constat */}
      <section className="bg-surface">
        <Container className="grid gap-14 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24 lg:py-32">
          <SectionIntro className="lg:sticky lg:top-28 lg:self-start" overline={h.painOverline} title={h.painTitle} text={h.painText} />
          <div>{d.site.pains.map((p, i) => <NumberedRow key={p.title} index={i + 1} title={p.title} text={p.text} />)}</div>
        </Container>
      </section>

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
            <Photo lang={lang} alt={h.beninPhotos[0]} expected={h.beninPhotos[0]} className="aspect-[3/4]" sizes="25vw" />
            <Photo lang={lang} alt={h.beninPhotos[1]} expected={h.beninPhotos[1]} className="mt-12 aspect-[3/4]" sizes="25vw" />
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
      <CtaBand title={h.ctaTitle} text={h.ctaText} href={L('/connais-toi')} label={d.cta.discover} />
    </>
  );
}

/** Générateur pseudo-aléatoire déterministe (même glyphe au rendu serveur et client). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
