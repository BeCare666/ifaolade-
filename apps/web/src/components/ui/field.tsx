'use client';

import { Check } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

const control =
  'w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-3.5 text-[14px] text-text placeholder:text-text-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft disabled:opacity-60 aria-[invalid=true]:border-danger';

export function Field({
  label, hint, error, children, htmlFor,
}: { label: string; hint?: string; error?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-text">{label}</label>
      {children}
      {error ? <p className="text-[12px] text-danger">{error}</p> : hint ? <p className="text-[12px] text-text-faint">{hint}</p> : null}
    </div>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, 'h-11', className)} {...rest} />;
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-28 py-3 leading-relaxed', className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, 'h-11 pr-8', className)} {...rest}>{children}</select>;
}

export function Checkbox({ label, checked, onChange, description }: { label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span className={cn('mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors', checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong bg-surface')}>
        {checked && <Check size={12} strokeWidth={2.5} />}
      </span>
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-[14px] leading-snug text-text">
        {label}
        {description && <span className="mt-0.5 block text-[12px] text-text-faint">{description}</span>}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-3">
      <span className={cn('relative h-6 w-10 rounded-full transition-colors', checked ? 'bg-primary' : 'bg-border-strong')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-[var(--shadow-card)] transition-transform', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </span>
      <span className="text-[14px] text-text">{label}</span>
    </button>
  );
}

/** Cartes radio : questionnaire Connais-toi (plan §10.1). */
export function RadioCards<T extends string>({
  options, value, onChange, name,
}: { options: { value: T; label: string }[]; value?: T; onChange: (v: T) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-3">
      {options.map((o, i) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'group flex w-full items-center gap-4 rounded-[var(--radius-lg)] border px-5 py-4 text-left transition-colors duration-200',
              active ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:border-border-strong',
            )}
          >
            <span className={cn('text-[12px] font-medium tabular-nums tracking-[0.15em]', active ? 'text-primary' : 'text-text-faint')}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="flex-1 text-[15px] text-text">{o.label}</span>
            <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border', active ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong')}>
              {active && <Check size={12} strokeWidth={2.5} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
