import type { OduLore } from '@ona/core';
import { Apple, Ban, Check, Compass, Flame, Palette, Sparkles, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import type { Dict } from '@/i18n';
import { cn } from '@/lib/cn';

type L = Dict['odu']['lore'];

/** Noms de couleurs (texte de départ en français) → pastille. Une couleur inconnue n'a simplement pas de pastille. */
const SWATCH: Record<string, string> = {
  blanc: '#F7F4EE', noir: '#16161A', rouge: '#9E3B26', vert: '#2F5D3A', jaune: '#D9A62E', bleu: '#1F2A44',
  brun: '#6B4A2F', ocre: '#B07A3A', bordeaux: '#5E1F2A', ambre: '#C7882B',
};

/** href(name) : lien vers la fiche d'une divinité, si elle existe (R22). */
function List({ items, tone, href }: { items: string[]; tone: 'do' | 'dont' | 'plain'; href?: (name: string) => string | undefined }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5 text-[15px] leading-[1.7] text-text-muted">
          {tone === 'do' ? <Check size={16} className="mt-1 shrink-0 text-success" /> : tone === 'dont' ? <X size={16} className="mt-1 shrink-0 text-osun" /> : <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-text-faint" />}
          {href?.(t) ? <Link href={href(t)!} className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">{t}</Link> : <span>{t}</span>}
        </li>
      ))}
    </ul>
  );
}

function Block({ icon, title, children, className }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-6', className)}>
      <p className="flex items-center gap-2.5 text-[14px] font-medium text-text">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary">{icon}</span>{title}
      </p>
      {children}
    </div>
  );
}

/** Lecture « signe de naissance » : fiche de l'Odu et portrait (règles 4.6 et 4.7 : rien n'est promis, la signature est symbolique). */
export function BirthReading({ lore, l, href }: { lore: OduLore; l: L; href?: (name: string) => string | undefined }) {
  const b = lore.birth;
  return (
    <div className="space-y-4">
      <Block icon={<UserRound size={16} strokeWidth={1.6} />} title={l.nature}><p className="mt-3 text-[15px] leading-[1.8] text-text-muted">{b.nature}</p></Block>
      <Block icon={<Compass size={16} strokeWidth={1.6} />} title={l.path}><p className="mt-3 text-[15px] leading-[1.8] text-text-muted">{b.path}</p></Block>
      <div className="grid gap-4 md:grid-cols-2">
        <Block icon={<Check size={16} strokeWidth={1.6} />} title={l.todo}><List items={b.todo} tone="do" /></Block>
        <Block icon={<Ban size={16} strokeWidth={1.6} />} title={l.avoid}><List items={b.avoid} tone="dont" /></Block>
        <Block icon={<Apple size={16} strokeWidth={1.6} />} title={l.eat}><List items={b.eat} tone="do" /></Block>
        <Block icon={<X size={16} strokeWidth={1.6} />} title={l.noEat}><List items={b.noEat} tone="dont" /></Block>
        <Block icon={<Flame size={16} strokeWidth={1.6} />} title={l.divinities}><List items={b.divinities} tone="plain" href={href} /></Block>
        <Block icon={<Palette size={16} strokeWidth={1.6} />} title={l.colors}>
          <ul className="mt-3 flex flex-wrap gap-2">
            {b.colors.map((c) => {
              const sw = SWATCH[c.toLowerCase().split(/[\s(]/)[0]];
              return (
                <li key={c} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[13px] text-text-muted">
                  {sw && <span className="h-3.5 w-3.5 rounded-full border border-border-strong" style={{ background: sw }} />}{c}
                </li>
              );
            })}
          </ul>
        </Block>
      </div>
      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-text-faint"><Sparkles size={13} className="mt-0.5 shrink-0" /> {l.birthNote}</p>
    </div>
  );
}

/** Éloge, Òrìṣà et Vodun qui parlent, leçons de vie (fiche de l'Odu). */
export function LoreIntro({ lore, l, href }: { lore: OduLore; l: L; href?: (name: string) => string | undefined }) {
  return (
    <>
      <blockquote className="font-display text-[22px] leading-[1.5] text-text sm:text-[26px]">{lore.oriki}</blockquote>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Block icon={<Flame size={16} strokeWidth={1.6} />} title={l.orisha}><List items={lore.orisha} tone="plain" href={href} /></Block>
        <Block icon={<Flame size={16} strokeWidth={1.6} />} title={l.vodun}><List items={lore.vodun} tone="plain" href={href} /></Block>
      </div>
    </>
  );
}

export function Lessons({ lore }: { lore: OduLore }) {
  return (
    <ol className="space-y-4">
      {lore.lessons.map((t, i) => (
        <li key={t} className="flex items-start gap-4">
          <span className="font-display text-[26px] leading-none text-osun">{String(i + 1).padStart(2, '0')}</span>
          <span className="pt-1 text-[16px] leading-[1.75] text-text-muted">{t}</span>
        </li>
      ))}
    </ol>
  );
}
