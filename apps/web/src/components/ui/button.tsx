import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-surface text-text border border-border-strong hover:border-text-faint',
  ghost: 'text-text-muted hover:text-text hover:bg-bg-subtle',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-6 text-[14px]',
  lg: 'h-13 px-8 text-[15px]',
};

interface Common {
  variant?: Variant;
  size?: Size;
  /** Pilule en vitrine, rayon md en console (plan §6.2). */
  shape?: 'pill' | 'console';
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function buttonClass({ variant = 'primary', size = 'md', shape = 'pill', className }: Omit<Common, 'children' | 'loading'>) {
  return cn(base, variants[variant], sizes[size], shape === 'pill' ? 'rounded-full' : 'rounded-[var(--radius-md)]', className);
}

export function Button({
  variant, size, shape, loading, className, children, ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass({ variant, size, shape, className })} disabled={loading || rest.disabled} {...rest}>
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({ href, variant, size, shape, className, children }: Common & { href: string }) {
  return (
    <Link href={href} className={buttonClass({ variant, size, shape, className })}>
      {children}
    </Link>
  );
}

export function IconButton({ label, className, children, ...rest }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn('inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-subtle hover:text-text', className)}
      {...rest}
    >
      {children}
    </button>
  );
}
