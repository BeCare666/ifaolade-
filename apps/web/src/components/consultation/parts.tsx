'use client';

import { oduById } from '@ona/core';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { Badge, type Tone } from '@/components/ui/primitives';
import { cn, eur } from '@/lib/cn';
import type { ConsultationStatus, Ebo, EboStatus, Report } from '@/lib/types';

export const CONSULTATION_STATUS: Record<ConsultationStatus, { label: string; tone: Tone }> = {
  REQUESTED: { label: 'Demandée', tone: 'neutral' },
  AWAITING_PAYMENT: { label: 'En attente de paiement', tone: 'warning' },
  CONFIRMED: { label: 'Confirmée', tone: 'primary' },
  COMPLETED: { label: 'Compte rendu publié', tone: 'success' },
  CANCELLED: { label: 'Annulée', tone: 'danger' },
};

export const EBO_STATUS: Record<EboStatus, { label: string; tone: Tone }> = {
  PROPOSED: { label: 'Proposé, en attente de ta réponse', tone: 'warning' },
  ACCEPTED: { label: 'Accepté, en attente de paiement', tone: 'info' },
  DECLINED: { label: 'Refusé', tone: 'neutral' },
  PAID: { label: 'Payé, à réaliser', tone: 'primary' },
  PERFORMED: { label: 'Réalisé, preuve disponible', tone: 'success' },
};

export function StatusBadge({ status }: { status: ConsultationStatus }) {
  const s = CONSULTATION_STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export const btTime = (d: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: 'full', timeStyle: 'short' }) =>
  new Intl.DateTimeFormat('fr-FR', { ...opts, timeZone: 'Africa/Porto-Novo' }).format(new Date(d));
export const localTime = (d: string | Date) => new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' }).format(new Date(d));

/** Règle 4.2 : chaque ligne, puis le matériel, la rémunération du prêtre à part, et le total. */
export function EboItemsTable({ ebo }: { ebo: Pick<Ebo, 'items' | 'materialsCents' | 'priestFeeCents' | 'currency'> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-[14px]">
        <thead>
          <tr className="border-b border-border text-left text-[12px] text-text-faint">
            <th className="py-2 pr-4 font-normal">Élément</th>
            <th className="py-2 pr-4 text-right font-normal">Qté</th>
            <th className="py-2 pr-4 text-right font-normal">Prix unitaire</th>
            <th className="py-2 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {ebo.items.map((it, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-2.5 pr-4 text-text">{it.label}</td>
              <td className="py-2.5 pr-4 text-right tabular-nums text-text-muted">{it.qty}</td>
              <td className="py-2.5 pr-4 text-right tabular-nums text-text-muted">{eur(it.unitCents, ebo.currency)}</td>
              <td className="py-2.5 text-right tabular-nums text-text">{eur(it.qty * it.unitCents, ebo.currency)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="tabular-nums">
          <tr><td colSpan={3} className="pt-3 text-text-muted">Matériel (coût réel)</td><td className="pt-3 text-right text-text">{eur(ebo.materialsCents, ebo.currency)}</td></tr>
          <tr><td colSpan={3} className="pt-1.5 text-text-muted">Rémunération du prêtre</td><td className="pt-1.5 text-right text-text">{eur(ebo.priestFeeCents, ebo.currency)}</td></tr>
          <tr><td colSpan={3} className="pt-3 font-medium text-text">Total</td><td className="pt-3 text-right text-[16px] font-medium text-text">{eur(ebo.materialsCents + ebo.priestFeeCents, ebo.currency)}</td></tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Échelle « Qu'est-ce qui a changé ? » de 0 à 10. */
export function FollowUpScale({ value, onChange, disabled }: { value: number | null; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div>
      <div className="grid grid-cols-11 gap-1.5" role="radiogroup" aria-label="Progression de 0 à 10">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n} type="button" role="radio" aria-checked={value === n} disabled={disabled}
            onClick={() => onChange(n)}
            className={cn('h-10 rounded-[var(--radius-sm)] border text-[13px] tabular-nums transition-colors disabled:opacity-60',
              value === n ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong text-text-muted hover:text-text')}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-text-faint"><span>Rien n&apos;a changé</span><span>Tout a changé</span></div>
    </div>
  );
}

/** Compte rendu publié (vue client et aperçu prêtre). */
export function ReportView({ report }: { report: Pick<Report, 'oduId' | 'orientation' | 'oriDetail' | 'ese' | 'message' | 'actionPlan' | 'ewo'> }) {
  const odu = oduById(report.oduId);
  return (
    <div className="space-y-10">
      {odu && (
        <div className="flex items-center gap-6 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <OduGlyph right={odu.marks.right} left={odu.marks.left} size="sm" animate label={odu.name} />
          <div>
            <p className="text-[12px] text-text-faint">L&apos;Odu qui a parlé pour toi</p>
            <p className="mt-1 text-[24px] tracking-[-0.02em] text-text">{odu.name}</p>
            <p className="text-[13px] text-text-muted">Fá : {odu.fonName}</p>
            <div className="mt-3">
              <Badge tone={report.orientation === 'IRE' ? 'success' : 'accent'}>
                {report.orientation === 'IRE' ? 'Ire (bénéfique)' : 'Ibi (à corriger)'}{report.oriDetail ? ` · ${report.oriDetail}` : ''}
              </Badge>
            </div>
          </div>
        </div>
      )}
      <Block title="Le message">{report.message}</Block>
      <Block title="L'ese (la parole d'Ifá)"><span className="whitespace-pre-line italic">{report.ese}</span></Block>
      {report.actionPlan.length > 0 && (
        <div>
          <h3 className="text-[18px] tracking-[-0.01em] text-text">Ton plan d&apos;action</h3>
          <ol className="mt-4 space-y-3">
            {report.actionPlan.map((a, i) => (
              <li key={i} className="grid grid-cols-[32px_minmax(0,1fr)] gap-2 text-[15px] leading-[1.7] text-text">
                <span className="text-[12px] font-medium tabular-nums tracking-[0.15em] text-accent">{String(i + 1).padStart(2, '0')}</span>{a}
              </li>
            ))}
          </ol>
        </div>
      )}
      {report.ewo.length > 0 && (
        <div>
          <h3 className="text-[18px] tracking-[-0.01em] text-text">Tes ewọ̀ (interdits)</h3>
          <ul className="mt-4 space-y-2">
            {report.ewo.map((w, i) => <li key={i} className="flex gap-3 text-[15px] text-text"><span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-accent" />{w}</li>)}
          </ul>
        </div>
      )}
      <p className="text-[12px] leading-relaxed text-text-faint">Ifá éclaire et ouvre les chemins ; aucun résultat n&apos;est garanti. Ce compte rendu t&apos;appartient : tu peux le montrer à qui tu veux.</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[18px] tracking-[-0.01em] text-text">{title}</h3>
      <div className="mt-3 text-[16px] leading-[1.85] text-text-muted">{children}</div>
    </div>
  );
}
