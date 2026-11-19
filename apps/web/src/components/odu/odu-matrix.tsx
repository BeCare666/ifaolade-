'use client';

import { allOdu, MEJI, oduText, type Odu } from '@ona/core';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/cn';
import { OduGlyph } from './odu-glyph';

/**
 * Les 256 Odu en grille 16 × 16 (plan §6.4).
 * Ligne = jambe droite (dominante), colonne = jambe gauche. Diagonale = les 16 Méjì.
 */
export function OduMatrix() {
  const { lang, d, href } = useI18n();
  const byId = useMemo(() => new Map(allOdu().map((o) => [o.id, o])), []);
  const [hover, setHover] = useState<Odu | null>(null);
  const r = hover?.right.index ?? -1;
  const l = hover?.left.index ?? -1;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="scrollbar-thin overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-[repeat(16,minmax(0,1fr))] gap-[3px]" onMouseLeave={() => setHover(null)}>
          {MEJI.map((right) =>
            MEJI.map((left) => {
              const o = byId.get(right.index * 16 + left.index)!;
              const lit = right.index === r || left.index === l;
              return (
                <Link
                  key={o.id} href={href(`/odu/${o.slug}`)} onMouseEnter={() => setHover(o)} onFocus={() => setHover(o)} aria-label={o.name}
                  className={cn('flex aspect-square items-center justify-center rounded-[4px] border transition-colors duration-150',
                    o.isMeji ? 'border-border-strong bg-surface' : 'border-transparent bg-bg-subtle', lit && 'bg-primary-soft', hover?.id === o.id && 'border-primary bg-surface')}
                >
                  <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} activeColor={hover?.id === o.id ? 'var(--color-accent)' : undefined} />
                </Link>
              );
            }),
          )}
        </div>
      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        {hover ? (
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <p className="text-overline">{tpl(d.odu.rank, { n: hover.rank })} · {hover.isMeji ? d.odu.meji : d.odu.omo}</p>
            <div className="mt-5 flex items-center gap-5">
              <OduGlyph right={hover.marks.right} left={hover.marks.left} size="sm" label={hover.name} />
              <div>
                <p className="text-[20px] tracking-[-0.01em] text-text">{hover.name}</p>
                <p className="text-[13px] text-text-muted">{tpl(d.odu.fon, { name: hover.fonName })}</p>
              </div>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-text-muted">{oduText(hover, lang).keywords.join(' · ')}</p>
            <p className="mt-4 font-mono text-[12px] tracking-[0.2em] text-text-faint">{hover.binary}</p>
          </div>
        ) : (
          <p className="text-[14px] leading-relaxed text-text-muted">{d.odu.matrixHint}</p>
        )}
      </aside>
    </div>
  );
}
