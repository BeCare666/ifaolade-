/** Icône provisoire : les marques d'Ogbè Méjì (I I I I · I I I I) en kaolin sur indigo. Le logo définitif arrive à l'étape 1.1. */
export function IconMark({ scale }: { scale: number }) {
  const bar = { width: 22 * scale, height: 64 * scale, borderRadius: 11 * scale, background: '#FAF8F4' };
  const col = { display: 'flex', flexDirection: 'column' as const, gap: 22 * scale };
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70 * scale, background: '#1F2A44' }}>
      {[0, 1].map((c) => <div key={c} style={col}>{[0, 1, 2, 3].map((r) => <div key={r} style={bar} />)}</div>)}
    </div>
  );
}
