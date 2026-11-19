'use client';

import { SIGNS, signName, type Reading } from '@ona/core';
import { HeartPulse, Lock } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';
import { ElementBalance } from '@/components/astro/element-balance';
import { NatalWheel } from '@/components/astro/natal-wheel';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { Reveal } from '@/components/site/editorial';
import { ButtonLink } from '@/components/ui/button';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';

type Section = Reading['sections'][number] & { locked?: boolean };

/** Rend **gras** sans HTML injecté. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i} className="font-medium text-text">{p}</strong> : <Fragment key={i}>{p}</Fragment>))}</>;
}

export function PortraitView({
  reading, full, readingId, mode = 'public',
}: { reading: Reading; full: boolean; readingId: string | null; mode?: 'public' | 'espace' }) {
  const { lang, d: D, href } = useI18n();
  const d = D.portrait;
  // Le portrait est rédigé dans la langue choisie à sa création ; les libellés suivent la page.
  const { chart } = reading;
  const sun = chart.planets.find((p) => p.key === 'sun')!;
  const moon = chart.planets.find((p) => p.key === 'moon')!;
  const sections = reading.sections as Section[];
  const firstLocked = sections.findIndex((s) => s.locked);
  const unlockHref = href(readingId ? `/inscription?portrait=${readingId}` : '/inscription');
  const loginHref = href(readingId ? `/connexion?portrait=${readingId}` : '/connexion');
  const health = reading.domain === 'sante' || reading.domain === 'enfants';
  const deg = (x: number) => `${Math.floor(x)}°${String(Math.floor((x % 1) * 60)).padStart(2, '0')}′`;

  return (
    <div>
      <Reveal>
        <p className="text-overline">{tpl(d.overline, { name: reading.firstName })}</p>
        <h1 className="text-hero mt-5 max-w-4xl text-text">{tpl(d.title, { name: reading.firstName })}</h1>
      </Reveal>

      <div className="mt-14 grid items-start gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
        <Reveal delay={0.05} className="flex justify-center rounded-[var(--radius-photo)] border border-border bg-surface p-6 sm:p-10">
          <NatalWheel chart={chart} />
        </Reveal>
        <Reveal delay={0.1} className="space-y-8">
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border">
            {[
              { l: d.sun, s: sun.sign, dg: deg(sun.degreeInSign) },
              { l: d.moon, s: moon.sign, dg: deg(moon.degreeInSign) },
              { l: d.ascendant, s: chart.ascendant ? chart.ascendant.sign : null, dg: chart.ascendant ? deg(chart.ascendant.degreeInSign) : '' },
            ].map((x) => (
              <div key={x.l} className="bg-surface p-4">
                <dt className="text-[12px] text-text-faint">{x.l}</dt>
                <dd className="mt-2 text-[16px] text-text">{x.s !== null ? <>{SIGNS[x.s].glyph}{'︎'} {signName(x.s, lang)}</> : '—'}</dd>
                <dd className="text-[12px] tabular-nums text-text-faint">{x.s !== null ? x.dg : d.timeUnknown}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <p className="mb-5 text-[14px] font-medium text-text">{d.elements}</p>
            <ElementBalance elements={chart.elements} lang={lang} />
          </div>
          <div className="flex items-center gap-5 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <OduGlyph right={reading.odu.marks.right} left={reading.odu.marks.left} size="sm" animate label={reading.odu.name} />
            <div>
              <p className="text-[12px] text-text-faint">{d.signature}</p>
              <p className="mt-1 text-[18px] tracking-[-0.01em] text-text">{reading.odu.name}</p>
              <p className="text-[13px] text-text-muted">{tpl(d.fa, { name: reading.odu.fonName })}</p>
            </div>
          </div>
        </Reveal>
      </div>

      {health && (
        <div className="mt-14 flex items-start gap-4 rounded-[var(--radius-lg)] border border-info/20 bg-info-soft p-6">
          <HeartPulse size={20} className="mt-0.5 shrink-0 text-info" />
          <p className="text-[15px] leading-[1.75] text-text">{d.health}</p>
        </div>
      )}

      <div className="mt-20 max-w-3xl">
        {sections.map((s, idx) => (
          <Fragment key={s.key}>
            {idx === firstLocked && (
              <div className="my-4 rounded-[var(--radius-photo)] border border-primary/20 bg-primary-soft p-8 sm:p-10">
                <Lock size={20} strokeWidth={1.5} className="text-primary" />
                <p className="mt-5 text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-text">{d.lockTitle}</p>
                <p className="mt-4 text-[15px] leading-[1.8] text-text-muted">{d.lockText}</p>
                {readingId ? (
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <ButtonLink href={unlockHref} size="lg">{d.unlock}</ButtonLink>
                    <ButtonLink href={loginHref} variant="secondary" size="lg">{d.haveAccount}</ButtonLink>
                  </div>
                ) : <p className="mt-6 text-[14px] text-text-muted">{d.unavailable}</p>}
              </div>
            )}
            <section className="border-t border-border py-12">
              <h2 className="text-card-title text-text">{s.title}</h2>
              {s.subtitle && <p className="mt-1.5 text-[13px] text-text-faint">{s.subtitle}</p>}
              {s.locked ? (
                <div className="mt-6 select-none space-y-3 blur-[6px]" aria-hidden>{d.blur.map((b) => <p key={b} className="text-[16px] leading-[1.85] text-text-muted">{b}</p>)}</div>
              ) : (
                <div className="mt-6 space-y-5 text-[16px] leading-[1.85] text-text-muted">{s.paragraphs.map((p, i) => <p key={i}><Rich text={p} /></p>)}</div>
              )}
            </section>
          </Fragment>
        ))}
      </div>

      {full && (
        <div className="mt-10 max-w-3xl rounded-[var(--radius-photo)] bg-primary p-8 text-primary-foreground sm:p-10">
          <p className="text-[28px] font-normal leading-[1.1] tracking-[-0.03em]">{d.ctaTitle}</p>
          <p className="mt-4 text-[15px] leading-[1.8] text-primary-foreground/75">{d.ctaText}</p>
          <Link href={href(`/consultations/reserver?offre=FIRST_FREE${readingId ? `&portrait=${readingId}` : ''}`)} className="mt-8 inline-flex h-13 items-center rounded-full bg-bg px-8 text-[15px] font-medium text-text transition-colors hover:bg-surface">
            {D.common.useFree}
          </Link>
        </div>
      )}

      {mode === 'public' && (
        <p className="mt-12 max-w-3xl text-[12px] leading-relaxed text-text-faint">{d.footnote.replace('{time}', chart.timeKnown ? '' : d.footnoteNoTime)}</p>
      )}
    </div>
  );
}
