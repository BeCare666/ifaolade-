'use client';

import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-b border-border">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className="border-t border-border">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="text-[17px] tracking-[-0.01em] text-text sm:text-[19px]">{it.q}</span>
              <Plus size={18} strokeWidth={1.5} className={cn('shrink-0 text-text-muted transition-transform duration-300', isOpen && 'rotate-45')} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 text-[15px] leading-[1.8] text-text-muted">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
