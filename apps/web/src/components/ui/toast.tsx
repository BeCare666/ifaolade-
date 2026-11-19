'use client';

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, useCallback, useContext, useState } from 'react';

type Kind = 'success' | 'error' | 'info';
interface Toast { id: number; kind: Kind; message: string }

const Ctx = createContext<(message: string, kind?: Kind) => void>(() => {});
export const useToast = () => useContext(Ctx);

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
const colors = { success: 'text-success', error: 'text-danger', info: 'text-info' };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: Kind = 'success') => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, kind, message }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = icons[t.kind];
            return (
              <motion.div
                key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-elevated)]"
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${colors[t.kind]}`} />
                <p className="text-[14px] text-text">{t.message}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
