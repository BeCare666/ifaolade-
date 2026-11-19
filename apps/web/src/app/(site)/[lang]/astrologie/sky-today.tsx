'use client';

import { computeChart, moonPhase, moonPhaseName, planetName, SIGNS, signName, type NatalChart } from '@ona/core';
import { useEffect, useState } from 'react';
import { NatalWheel } from '@/components/astro/natal-wheel';
import { Skeleton } from '@/components/ui/primitives';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';

/** Le ciel à cet instant, calculé dans le navigateur (plan §7.7). Rendu après montage : pas d'écart serveur/client. */
export function SkyToday() {
  const { lang, d, intl } = useI18n();
  const [state, setState] = useState<{ chart: NatalChart; phase: ReturnType<typeof moonPhase>; at: Date } | null>(null);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const iso = now.toISOString();
      setState({ chart: computeChart({ birthDate: iso.slice(0, 10), birthTime: iso.slice(11, 16), timezone: 'UTC' }), phase: moonPhase(now), at: now });
    };
    compute();
    const t = setInterval(compute, 60_000);
    return () => clearInterval(t);
  }, []);

  if (!state) {
    return (
      <div className="grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Skeleton className="aspect-square w-full max-w-[420px] rounded-full" />
        <div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
      </div>
    );
  }

  const { chart, phase, at } = state;
  return (
    <div className="grid items-start gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-20">
      <NatalWheel chart={chart} />
      <div>
        <p className="text-[13px] text-text-faint">{new Intl.DateTimeFormat(intl, { dateStyle: 'full', timeStyle: 'short' }).format(at)} {d.astro.localTime}</p>
        <div className="mt-6 flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
          <MoonIcon illumination={phase.illumination} waxing={phase.angle < 180} />
          <div>
            <p className="text-[16px] text-text">{moonPhaseName(phase.angle, lang)}</p>
            <p className="text-[13px] tabular-nums text-text-muted">{tpl(d.astro.lit, { n: Math.round(phase.illumination * 100) })}</p>
          </div>
        </div>
        <table className="mt-8 w-full text-[14px]">
          <tbody>
            {chart.planets.map((p) => (
              <tr key={p.key} className="border-t border-border">
                <td className="py-3 pr-4 text-text"><span className="mr-2 inline-block w-5 text-center text-text-muted">{p.glyph}{'︎'}</span>{planetName(p.key, lang)}</td>
                <td className="py-3 pr-4 text-text-muted">{SIGNS[p.sign].glyph}{'︎'} {signName(p.sign, lang)}</td>
                <td className="py-3 text-right tabular-nums text-text-muted">{Math.floor(p.degreeInSign)}°{String(Math.floor((p.degreeInSign % 1) * 60)).padStart(2, '0')}′{p.retrograde ? ' R' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MoonIcon({ illumination, waxing }: { illumination: number; waxing: boolean }) {
  const r = 18;
  const k = 1 - 2 * illumination;
  const rx = Math.abs(k) * r;
  const lit = waxing ? 1 : 0;
  return (
    <svg width={44} height={44} viewBox="-22 -22 44 44" aria-hidden>
      <circle r={r} fill="var(--color-bg-subtle)" stroke="var(--color-border-strong)" />
      <path d={`M 0 ${-r} A ${r} ${r} 0 0 ${lit} 0 ${r} A ${rx} ${r} 0 0 ${k > 0 ? 1 - lit : lit} 0 ${-r} Z`} fill="var(--color-text)" fillOpacity={0.85} />
    </svg>
  );
}
