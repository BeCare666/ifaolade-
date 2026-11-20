'use client';

import { IMPRINT_HOLD_S, type Imprint } from '@ona/core';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/cn';

/*
 * Empreinte du moment (REFONTE §11 sexies, étape R15).
 * Mesures réelles, prises pendant l'appui : hésitation avant le premier contact, déplacement moyen du doigt,
 * nombre de levers avant la fin. Aucune caméra, aucun capteur biométrique, aucune autorisation.
 */

const RIDGES = 11;
const HOLD_MS = IMPRINT_HOLD_S * 1000;

/** Sillons d'empreinte : arcs d'ellipses concentriques, ouverts en bas comme une vraie empreinte. */
function ridgePath(i: number) {
  const rx = 9 + i * 7.6;
  const ry = 11 + i * 9.2;
  const cx = 100;
  const cy = 112;
  const gap = 0.55 - Math.min(i, 8) * 0.035; // ouverture en bas (radians de chaque côté)
  const a0 = Math.PI / 2 + gap;
  const a1 = Math.PI / 2 - gap + Math.PI * 2;
  const p = (a: number) => `${(cx + rx * Math.cos(a)).toFixed(1)} ${(cy + ry * Math.sin(a)).toFixed(1)}`;
  return `M ${p(a0)} A ${rx} ${ry} 0 1 1 ${p(a1)}`;
}

export function FingerprintPad({ onDone, done }: { onDone: (i: Imprint) => void; done: boolean }) {
  const { d } = useI18n();
  const w = d.wizard;
  const shownAt = useRef(performance.now());
  const firstTouch = useRef<number | null>(null);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const sum = useRef({ dist: 0, n: 0 });
  const lifts = useRef(0);
  const raf = useRef(0);
  const [progress, setProgress] = useState(done ? 1 : 0);
  const [holding, setHolding] = useState(false);
  const [interrupted, setInterrupted] = useState(false);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const tick = () => {
    if (!start.current) return;
    const p = Math.min(1, (performance.now() - start.current.t) / HOLD_MS);
    setProgress(p);
    if (p >= 1) { finish(); return; }
    raf.current = requestAnimationFrame(tick);
  };

  const begin = (x: number, y: number) => {
    if (done) return;
    const now = performance.now();
    if (firstTouch.current === null) firstTouch.current = now;
    start.current = { x, y, t: now };
    sum.current = { dist: 0, n: 0 };
    setHolding(true);
    setInterrupted(false);
    try { navigator.vibrate?.(12); } catch { /* rien */ }
    raf.current = requestAnimationFrame(tick);
  };
  const move = (x: number, y: number) => {
    if (!start.current) return;
    sum.current.dist += Math.hypot(x - start.current.x, y - start.current.y);
    sum.current.n += 1;
  };
  const end = () => {
    if (!start.current) return;
    cancelAnimationFrame(raf.current);
    start.current = null;
    setHolding(false);
    lifts.current += 1;
    setInterrupted(true);
    setProgress(0);
  };
  function finish() {
    cancelAnimationFrame(raf.current);
    const jitter = sum.current.n ? sum.current.dist / sum.current.n : 0;
    start.current = null;
    setHolding(false);
    try { navigator.vibrate?.([18, 60, 18]); } catch { /* rien */ }
    onDone({
      hesitationMs: Math.round((firstTouch.current ?? performance.now()) - shownAt.current),
      jitterPx: Math.round(jitter * 10) / 10,
      lifts: lifts.current,
    });
  }

  const lit = done ? RIDGES : Math.floor(progress * RIDGES + 0.0001);
  const status = done ? w.imprintDone : holding ? w.imprintHold : interrupted ? w.imprintAgain : '';

  return (
    <div className="flex flex-col items-center">
      <div
        role="button" tabIndex={done ? -1 : 0} aria-label={tpl(w.imprintPad, { s: IMPRINT_HOLD_S })} aria-disabled={done}
        onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); begin(e.clientX, e.clientY); }}
        onPointerMove={(e) => move(e.clientX, e.clientY)}
        onPointerUp={end} onPointerCancel={end}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); begin(0, 0); } }}
        onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') end(); }}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          'relative grid h-[min(62vw,260px)] w-[min(62vw,260px)] touch-none select-none place-items-center rounded-full outline-none [-webkit-touch-callout:none]',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-bg',
          done ? 'bg-success-soft' : holding ? 'bg-primary-soft' : 'bg-surface',
          'border border-border transition-colors',
        )}
      >
        {/* Anneau de progression */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="48" fill="none" strokeWidth="1.2" className="stroke-border" />
          <circle cx="50" cy="50" r="48" fill="none" strokeWidth="1.6" strokeLinecap="round" className={done ? 'stroke-success' : 'stroke-osun'}
            pathLength={1} strokeDasharray="1" strokeDashoffset={1 - (done ? 1 : progress)} />
        </svg>
        <svg viewBox="0 0 200 230" className="h-[72%] w-[72%]" aria-hidden>
          {Array.from({ length: RIDGES }, (_, i) => (
            <path key={i} d={ridgePath(i)} fill="none" strokeWidth={3.2} strokeLinecap="round"
              className={cn('transition-[stroke,opacity] duration-300', i < lit ? (done ? 'stroke-success' : 'stroke-primary') : 'stroke-border-strong')}
              opacity={i < lit ? 1 : 0.55} />
          ))}
        </svg>
        {done && <span className="absolute bottom-6 grid h-9 w-9 place-items-center rounded-full bg-success text-primary-foreground"><Check size={18} /></span>}
      </div>
      <p className="mt-6 min-h-[1.5rem] text-center text-[14px] text-text-muted" aria-live="polite">{status}</p>
    </div>
  );
}
