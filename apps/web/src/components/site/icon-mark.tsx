/**
 * Icône de l'application (REFONTE §2, variante « sceau ») : couronne d'ọpọ́n à 16 encoches, point osùn au sommet,
 * marques d'Ogbè Méjì au centre. Kaolin sur indigo. SVG en ligne, compatible avec next/og.
 */
export function IconMark({ scale }: { scale: number }) {
  const s = 512 * scale;
  const ink = '#FAF8F4';
  const notches = Array.from({ length: 16 }, (_, i) => i).filter((i) => i !== 0).map((i) => {
    const a = (i * Math.PI * 2) / 16 - Math.PI / 2;
    const cx = 50 + Math.cos(a) * 41.2;
    const cy = 50 + Math.sin(a) * 41.2;
    return { cx, cy, deg: i * 22.5 + 45, i };
  });
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1F2A44' }}>
      <svg width={s * 0.78} height={s * 0.78} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="47" fill="none" stroke={ink} strokeWidth="2.6" />
        <circle cx="50" cy="50" r="35.5" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.55" />
        {notches.map((n) => <rect key={n.i} x={n.cx - 2.2} y={n.cy - 2.2} width="4.4" height="4.4" fill={ink} transform={`rotate(${n.deg} ${n.cx} ${n.cy})`} />)}
        <circle cx="50" cy="8.8" r="4.6" fill="#C2583F" />
        {[0, 1, 2, 3].map((row) => <line key={`r${row}`} x1="59" x2="59" y1={29 + row * 12} y2={35.5 + row * 12} stroke={ink} strokeWidth="3.6" strokeLinecap="round" />)}
        {[0, 1, 2, 3].map((row) => <line key={`l${row}`} x1="41" x2="41" y1={29 + row * 12} y2={35.5 + row * 12} stroke={ink} strokeWidth="3.6" strokeLinecap="round" />)}
      </svg>
    </div>
  );
}
