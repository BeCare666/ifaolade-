'use client';

import type { Mark } from '@ona/core';
import { motion } from 'motion/react';
import { useEffect } from 'react';

/**
 * La chaîne d'ọ̀pẹ̀lẹ̀ (8 demi-graines, deux bras de 4) : animation unique de 1,8 s pendant la lecture (plan §10.1).
 * Face ouverte (creux visible) = I, face fermée = II. Le résultat montré est celui calculé, jamais présenté comme une divination.
 */
export function OpeleCast({ right, left, onDone, size = 220, label = 'Ọ̀pẹ̀lẹ̀ en cours de lecture' }: { right: Mark[]; left: Mark[]; onDone?: () => void; size?: number; label?: string }) {
  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  const w = size;
  const h = size * 1.15;
  const seedW = size * 0.16;
  const seedH = size * 0.2;
  const rows = [0, 1, 2, 3].map((i) => h * 0.2 + i * (h * 0.2));
  const xs = { right: w * 0.66, left: w * 0.34 };

  const Seed = ({ x, y, mark, i }: { x: number; y: number; mark: Mark; i: number }) => (
    <motion.g
      initial={{ rotateX: 0 }}
      animate={{ rotateX: [0, 540, 900, mark === 1 ? 1080 : 1260] }}
      transition={{ duration: 1.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' }}
    >
      <ellipse cx={x} cy={y} rx={seedW / 2} ry={seedH / 2} fill="var(--color-earth)" opacity={0.9} />
      {mark === 1 ? (
        <ellipse cx={x} cy={y} rx={seedW / 2 - 4} ry={seedH / 2 - 5} fill="var(--color-bg)" />
      ) : (
        <line x1={x} x2={x} y1={y - seedH / 2 + 4} y2={y + seedH / 2 - 4} stroke="var(--color-bg)" strokeWidth={1.5} opacity={0.6} />
      )}
    </motion.g>
  );

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ perspective: 600 }}>
      <path
        d={`M ${xs.left} ${rows[0] - seedH} Q ${w / 2} ${h * 0.02} ${xs.right} ${rows[0] - seedH}`}
        stroke="var(--color-border-strong)" strokeWidth={1.5} fill="none"
      />
      {rows.slice(0, 3).map((y, i) => (
        <g key={i}>
          <line x1={xs.left} x2={xs.left} y1={y + seedH / 2} y2={rows[i + 1] - seedH / 2} stroke="var(--color-border-strong)" strokeWidth={1.5} />
          <line x1={xs.right} x2={xs.right} y1={y + seedH / 2} y2={rows[i + 1] - seedH / 2} stroke="var(--color-border-strong)" strokeWidth={1.5} />
        </g>
      ))}
      {rows.map((y, i) => <Seed key={`r${i}`} x={xs.right} y={y} mark={right[i]} i={i} />)}
      {rows.map((y, i) => <Seed key={`l${i}`} x={xs.left} y={y} mark={left[i]} i={i + 4} />)}
    </svg>
  );
}
