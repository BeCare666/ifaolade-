import { elementName, modalityName, SIGNS, signKeywords, signName } from '@ona/core';
import type { Metadata } from 'next';
import { CtaBand, PageHero } from '@/components/site/blocks';
import { Container, Reveal, SectionIntro } from '@/components/site/editorial';
import { ButtonLink } from '@/components/ui/button';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { SkyToday } from './sky-today';

const ELEMENT_DOT: Record<string, string> = { fire: 'bg-fire', earth: 'bg-earth', air: 'bg-air', water: 'bg-water' };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).astro;
  return pageMeta(lang, '/astrologie', d.metaTitle, d.metaDesc);
}

export default async function AstrologiePage({ params }: LangParams) {
  const lang = await pageLang(params);
  const D = getDict(lang);
  const d = D.astro;
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text}>
        <ButtonLink href={lp(lang, '/connais-toi')} size="lg">{d.cta}</ButtonLink>
      </PageHero>
      <Container className="pb-24"><SkyToday /></Container>

      <section className="bg-surface">
        <Container className="py-24 lg:py-28">
          <SectionIntro overline={d.signsOverline} title={d.signsTitle} />
          <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {SIGNS.map((s) => (
              <div key={s.key} className="bg-surface p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[26px] leading-none text-text-muted">{s.glyph}{'︎'}</span>
                  <span className={`h-2 w-2 rounded-full ${ELEMENT_DOT[s.element]}`} aria-hidden />
                </div>
                <p className="mt-5 text-[18px] tracking-[-0.01em] text-text">{signName(s.index, lang)}</p>
                <p className="mt-1 text-[12px] text-text-faint">{elementName(s.element, lang)} · {modalityName(s.modality, lang)} · {s.ruler}</p>
                <p className="mt-4 text-[13px] text-text-muted">{signKeywords(s.index, lang).join(' · ')}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-14 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24 lg:py-28">
          <SectionIntro className="lg:sticky lg:top-28 lg:self-start" overline={d.ifaOverline} title={d.ifaTitle} />
          <Reveal className="space-y-6 text-[16px] leading-[1.85] text-text-muted">{d.ifaText.map((p) => <p key={p}>{p}</p>)}</Reveal>
        </Container>
      </section>

      <CtaBand title={d.ctaTitle} text={d.ctaText} href={lp(lang, '/connais-toi')} label={D.cta.portrait} />
    </>
  );
}
