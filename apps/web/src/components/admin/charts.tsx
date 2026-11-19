/** Graphiques sobres, couleurs prises dans les tokens (plan §5.3 : pas de couleurs en dur). */

export function BarList({ data, format = (n) => String(n) }: { data: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="text-[13px] text-text-faint">Pas encore de données.</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between text-[13px]"><span className="text-text">{d.label}</span><span className="tabular-nums text-text-muted">{format(d.value)}</span></div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-subtle"><div className="h-full rounded-full bg-primary" style={{ width: `${(d.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

/** Entonnoir : chaque étape, son volume et son taux de passage depuis l'étape précédente. */
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(1, steps[0]?.value ?? 1);
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].value : null;
        const rate = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div>
              <div className="flex items-baseline justify-between text-[13px]"><span className="text-text">{s.label}</span><span className="tabular-nums text-text">{s.value}</span></div>
              <div className="mt-1.5 h-6 overflow-hidden rounded-[var(--radius-sm)] bg-bg-subtle">
                <div className="h-full rounded-[var(--radius-sm)] bg-primary/80" style={{ width: `${Math.max(2, (s.value / max) * 100)}%` }} />
              </div>
            </div>
            <span className="w-14 text-right text-[12px] tabular-nums text-text-faint">{rate === null ? '' : `${rate} %`}</span>
          </li>
        );
      })}
    </ol>
  );
}
