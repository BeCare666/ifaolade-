import { getDict, type Lang } from '@/i18n';
import { Container } from './editorial';

/** Cadre commun des pages de compte : colonne étroite, sobre. */
export function AuthShell({ overline, title, text, children, aside }: {
  overline: string; title: string; text?: string; children: React.ReactNode; aside?: React.ReactNode;
}) {
  return (
    <Container className="grid gap-14 py-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-24 lg:py-24">
      <div className="max-w-md">
        <p className="text-overline">{overline}</p>
        <h1 className="mt-4 text-[36px] font-normal leading-[1.05] tracking-[-0.035em] text-text lg:text-[44px]">{title}</h1>
        {text && <p className="mt-5 text-[15px] leading-[1.8] text-text-muted">{text}</p>}
        <div className="mt-10">{children}</div>
      </div>
      {aside && <aside className="hidden lg:block">{aside}</aside>}
    </Container>
  );
}

export function TrustAside({ lang = 'fr' }: { lang?: Lang }) {
  const items = getDict(lang).auth.trust;
  return (
    <div className="rounded-[var(--radius-photo)] border border-border bg-surface p-10">
      {items.map(([t, d], i) => (
        <div key={t} className={i ? 'mt-8 border-t border-border pt-8' : ''}>
          <p className="text-[12px] font-medium tracking-[0.2em] tabular-nums text-accent">{String(i + 1).padStart(2, '0')}</p>
          <p className="mt-2 text-[18px] tracking-[-0.01em] text-text">{t}</p>
          <p className="mt-2 text-[14px] leading-[1.75] text-text-muted">{d}</p>
        </div>
      ))}
    </div>
  );
}
