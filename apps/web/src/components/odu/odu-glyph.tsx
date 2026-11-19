'use client';

import type { Mark } from '@ona/core';
import { motion } from 'motion/react';

const SIZES = { xs: 28, sm: 56, md: 112, lg: 200 } as const;

/**
 * Un Odu tracé à l'encre comme dans l'iyẹ̀rọ̀sùn sur l'ọpọ́n (plan §6.4).
 * Jambe droite à DROITE (lue en premier), jambe gauche à gauche.
 * 1 = une marque (I), 2 = deux marques (II). Tracé : jambe droite de haut en bas, puis gauche, 60 ms par marque.
 */
export function OduGlyph({
  right, left, size = 'md', animate = false, activeColor, label,
}: { right: Mark[]; left: Mark[]; size?: keyof typeof SIZES; animate?: boolean; activeColor?: string; label?: string }) {
  const h = SIZES[size];
  const w = h * 0.72;
  const rowH = h / 4;
  const stroke = Math.max(2, h * 0.045);
  const len = rowH * 0.5;
  const colX = { left: w * 0.27, right: w * 0.73 };
  const gap = w * 0.085;
  const ink = activeColor ?? 'var(--color-text)';

  const strokes: { x: number; y: number; order: number }[] = [];
  const draw = (marks: Mark[], cx: number, offset: number) => {
    marks.forEach((m, row) => {
      const y = row * rowH + (rowH - len) / 2;
      const order = offset + row;
      if (m === 1) strokes.push({ x: cx, y, order });
      else strokes.push({ x: cx - gap, y, order }, { x: cx + gap, y, order });
    });
  };
  draw(right, colX.right, 0);
  draw(left, colX.left, 4);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label ?? 'Odu'} className="shrink-0">
      {strokes.map((s, i) =>
        animate ? (
          <motion.line
            key={i} x1={s.x} x2={s.x} y1={s.y} y2={s.y + len} stroke={ink} strokeWidth={stroke} strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: s.order * 0.06, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <line key={i} x1={s.x} x2={s.x} y1={s.y} y2={s.y + len} stroke={ink} strokeWidth={stroke} strokeLinecap="round" />
        ),
      )}
    </svg>
  );
}
