import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

const STYLES = {
  info: { box: 'border-info/20 bg-info-soft', icon: Info, color: 'text-info' },
  warning: { box: 'border-warning/25 bg-warning-soft', icon: AlertTriangle, color: 'text-warning' },
  success: { box: 'border-success/20 bg-success-soft', icon: CheckCircle2, color: 'text-success' },
} as const;

export function Alert({ tone = 'info', title, children }: { tone?: keyof typeof STYLES; title?: string; children: React.ReactNode }) {
  const s = STYLES[tone];
  const Icon = s.icon;
  return (
    <div className={cn('flex items-start gap-3 rounded-[var(--radius-lg)] border p-4', s.box)}>
      <Icon size={18} className={cn('mt-0.5 shrink-0', s.color)} />
      <div className="text-[14px] leading-relaxed text-text">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? 'mt-0.5 text-text-muted' : ''}>{children}</div>
      </div>
    </div>
  );
}
