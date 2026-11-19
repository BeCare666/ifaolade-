import { ELEMENT_INFO, elementName, type Element } from '@ona/core';
import type { Lang } from '@/i18n';

const BAR: Record<Element, string> = { fire: 'bg-fire', earth: 'bg-earth', air: 'bg-air', water: 'bg-water' };

export function ElementBalance({ elements, lang = 'fr' }: { elements: Record<Element, number>; lang?: Lang }) {
  const total = Object.values(elements).reduce((a, b) => a + b, 0) || 1;
  const order: Element[] = ['fire', 'earth', 'air', 'water'];
  return (
    <div className="space-y-4">
      {order.map((k) => {
        const pct = Math.round((elements[k] / total) * 100);
        const name = elementName(k, lang);
        return (
          <div key={k}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-text">{name}{name !== ELEMENT_INFO[k].yoruba && <span className="text-text-faint"> · {ELEMENT_INFO[k].yoruba}</span>}</span>
              <span className="tabular-nums text-text-muted">{pct} %</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-subtle"><div className={`h-full rounded-full ${BAR[k]}`} style={{ width: `${pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}
