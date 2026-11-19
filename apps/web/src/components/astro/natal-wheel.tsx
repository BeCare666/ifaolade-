import { SIGNS, type NatalChart } from '@ona/core';

const ELEMENT_FILL: Record<string, string> = {
  fire: 'var(--color-fire)', earth: 'var(--color-earth)', air: 'var(--color-air)', water: 'var(--color-water)',
};
const TEXT = '︎'; // force le rendu texte des glyphes (pas d'émoji)

/**
 * Roue du thème natal (plan §6.4). Ascendant à gauche quand il est connu, sinon 0° Bélier à gauche.
 * Sobre : filets fins, encre dominante, éléments en teinte très légère.
 * Aspects tendus en osùn, harmonieux en indigo. Les conjonctions ne sont pas tracées.
 */
export function NatalWheel({ chart, size = 420 }: { chart: Pick<NatalChart, 'planets' | 'ascendant' | 'midheaven' | 'aspects'>; size?: number }) {
  const c = size / 2;
  const R = size / 2 - 4;
  const rSignIn = R * 0.82;
  const rPlanet = R * 0.66;
  const rAspect = R * 0.48;
  const ref = chart.ascendant?.longitude ?? 0;

  const pos = (lon: number, r: number) => {
    const theta = ((180 + (lon - ref)) * Math.PI) / 180;
    return { x: c + r * Math.cos(theta), y: c - r * Math.sin(theta) };
  };

  // Écarte les planètes trop proches pour la lisibilité (8° minimum à l'affichage).
  const sorted = [...chart.planets].sort((a, b) => a.longitude - b.longitude);
  const display = new Map<string, number>();
  let last = -999;
  for (const p of sorted) {
    let lon = p.longitude;
    if (lon - last < 8) lon = last + 8;
    display.set(p.key, lon);
    last = lon;
  }
  const byKey = new Map(chart.planets.map((p) => [p.key, p]));

  const sector = (i: number) => {
    const a0 = pos(i * 30, R);
    const a1 = pos((i + 1) * 30, R);
    const b1 = pos((i + 1) * 30, rSignIn);
    const b0 = pos(i * 30, rSignIn);
    return `M ${a0.x} ${a0.y} A ${R} ${R} 0 0 0 ${a1.x} ${a1.y} L ${b1.x} ${b1.y} A ${rSignIn} ${rSignIn} 0 0 1 ${b0.x} ${b0.y} Z`;
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[420px]" role="img" aria-label="Roue du thème natal">
      {SIGNS.map((s, i) => {
        const mid = pos(i * 30 + 15, (R + rSignIn) / 2);
        return (
          <g key={s.key}>
            <path d={sector(i)} fill={ELEMENT_FILL[s.element]} fillOpacity={0.07} stroke="var(--color-border-strong)" strokeWidth={0.75} />
            <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.04} fill={ELEMENT_FILL[s.element]}>
              {s.glyph}{TEXT}
            </text>
          </g>
        );
      })}
      <circle cx={c} cy={c} r={rSignIn} fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth={0.75} />
      <circle cx={c} cy={c} r={rAspect} fill="none" stroke="var(--color-border)" strokeWidth={0.75} />

      {chart.aspects.filter((a) => a.type !== 'conjunction').map((a, i) => {
        const pa = byKey.get(a.a);
        const pb = byKey.get(a.b);
        if (!pa || !pb) return null;
        const p1 = pos(pa.longitude, rAspect);
        const p2 = pos(pb.longitude, rAspect);
        return (
          <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={a.nature === 'hard' ? 'var(--color-accent)' : 'var(--color-primary)'}
            strokeWidth={0.9} strokeOpacity={a.nature === 'hard' ? 0.7 : 0.45} strokeDasharray={a.type === 'sextile' ? '3 3' : undefined} />
        );
      })}

      {chart.ascendant && (() => {
        const a = pos(chart.ascendant.longitude, R);
        const b = pos(chart.ascendant.longitude + 180, R);
        return (
          <g>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-text)" strokeWidth={1} strokeOpacity={0.35} />
            <text x={a.x + 6} y={a.y - 8} fontSize={size * 0.028} fill="var(--color-text-muted)">ASC</text>
          </g>
        );
      })()}
      {chart.midheaven && (() => {
        const a = pos(chart.midheaven.longitude, R);
        return <text x={a.x} y={a.y - 6} textAnchor="middle" fontSize={size * 0.028} fill="var(--color-text-muted)">MC</text>;
      })()}

      {chart.planets.map((p) => {
        const dp = pos(display.get(p.key) ?? p.longitude, rPlanet);
        const tick1 = pos(p.longitude, rSignIn);
        const tick2 = pos(p.longitude, rSignIn - 8);
        return (
          <g key={p.key}>
            <line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} stroke="var(--color-text)" strokeWidth={1} />
            <text x={dp.x} y={dp.y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.045} fill="var(--color-text)">
              {p.glyph}{TEXT}
            </text>
            {p.retrograde && <text x={dp.x + size * 0.03} y={dp.y + size * 0.025} fontSize={size * 0.022} fill="var(--color-accent)">R</text>}
          </g>
        );
      })}
    </svg>
  );
}
