import { AlertCircle, Inbox, SearchX } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/* ---------- Badge (6 tons) ---------- */
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
const tones: Record<Tone, string> = {
  neutral: 'bg-bg-subtle text-text-muted border-border',
  primary: 'bg-primary-soft text-primary border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  info: 'bg-info-soft text-info border-transparent',
  accent: 'bg-accent-soft text-accent border-transparent',
};
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap', tones[tone], className)}>
      {children}
    </span>
  );
}

/* ---------- Card ---------- */
export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]', className)} {...rest}>
      {children}
    </div>
  );
}
export function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-text">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- StatCard (console) ---------- */
export function StatCard({
  label, value, hint, delta, icon: Icon,
}: { label: string; value: string | number; hint?: string; delta?: number | null; icon?: React.ComponentType<{ size?: number; strokeWidth?: number }> }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-text-muted">{label}</p>
        {Icon && <span className="text-text-faint"><Icon size={18} strokeWidth={1.5} /></span>}
      </div>
      <p className="mt-3 text-[28px] font-semibold tracking-[-0.02em] tabular-nums text-text">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-[12px]">
        {typeof delta === 'number' && (
          <span className={cn('tabular-nums font-medium', delta >= 0 ? 'text-success' : 'text-danger')}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
        {hint && <span className="text-text-faint">{hint}</span>}
      </div>
    </Card>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[var(--radius-sm)] bg-bg-subtle', className)} aria-hidden />;
}

/* ---------- États vides / erreur (« aucune donnée » ≠ « aucun résultat ») ---------- */
export function EmptyState({
  title, description, action, variant = 'empty',
}: { title: string; description?: string; action?: React.ReactNode; variant?: 'empty' | 'no-results' }) {
  const Icon = variant === 'empty' ? Inbox : SearchX;
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border-strong px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-faint"><Icon size={18} strokeWidth={1.5} /></span>
      <p className="mt-4 text-[15px] font-medium text-text">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Une erreur est survenue', description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-danger/20 bg-danger-soft px-5 py-4">
      <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-danger">{title}</p>
        {description && <p className="mt-0.5 text-[13px] text-text-muted">{description}</p>}
      </div>
      {onRetry && <button onClick={onRetry} className="text-[13px] font-medium text-danger underline underline-offset-4">Réessayer</button>}
    </div>
  );
}

/* ---------- Breadcrumb + PageHeader (toutes les pages console en ont un) ---------- */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-[12px] text-text-faint">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>/</span>}
          {it.href ? <Link href={it.href} className="hover:text-text">{it.label}</Link> : <span className="text-text-muted">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title, description, breadcrumb, actions,
}: { title: string; description?: string; breadcrumb?: { label: string; href?: string }[]; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb && <div className="mb-2"><Breadcrumb items={breadcrumb} /></div>}
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-text sm:text-[24px]">{title}</h1>
        {description && <p className="mt-1 text-[14px] text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ---------- Avatar à initiales ---------- */
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-bg-subtle font-medium text-text-muted"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {initials || '·'}
    </span>
  );
}

/* ---------- KeyValue ---------- */
export function KeyValue({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[160px_minmax(0,1fr)]">
      {items.map((it) => (
        <div key={it.label} className="contents">
          <dt className="text-[13px] text-text-faint">{it.label}</dt>
          <dd className="text-[14px] text-text">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Stepper ---------- */
export function Stepper({ steps, current, label }: { steps: string[]; current: number; label?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] text-text-faint">
        <span>{label ?? `Étape ${current + 1} sur ${steps.length}`}</span>
        <span className="text-text-muted">{steps[current]}</span>
      </div>
      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-bg-subtle">
        <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-[var(--ease-out-soft)]" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  );
}
