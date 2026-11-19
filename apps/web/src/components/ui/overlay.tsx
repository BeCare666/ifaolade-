'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button, IconButton } from './button';

function useLock(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

export function Modal({
  open, onClose, title, children, footer, size = 'md',
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; size?: 'md' | 'lg' }) {
  useLock(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#17150F]/35" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn('relative w-full rounded-t-[var(--radius-lg)] bg-surface shadow-[var(--shadow-elevated)] sm:rounded-[var(--radius-lg)]', size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md')}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[16px] font-semibold text-text">{title}</h2>
              <IconButton label="Fermer" onClick={onClose}><X size={18} /></IconButton>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Toute action sensible passe par une confirmation (plan §5.3). */
export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirmer', danger = false,
}: { open: boolean; onClose: () => void; onConfirm: () => Promise<void> | void; title: string; message: React.ReactNode; confirmLabel?: string; danger?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open} onClose={onClose} title={title}
      footer={
        <>
          <Button variant="secondary" shape="console" size="sm" onClick={onClose}>Annuler</Button>
          <Button
            variant={danger ? 'danger' : 'primary'} shape="console" size="sm" loading={busy}
            onClick={async () => { setBusy(true); try { await onConfirm(); onClose(); } finally { setBusy(false); } }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[14px] leading-relaxed text-text-muted">{message}</div>
    </Modal>
  );
}

export function Drawer({ open, onClose, children, side = 'left', label }: { open: boolean; onClose: () => void; children: React.ReactNode; side?: 'left' | 'right'; label: string }) {
  useLock(open, onClose);
  const x = side === 'left' ? -320 : 320;
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-[#17150F]/30" onClick={onClose} />
          <motion.aside
            aria-label={label}
            initial={{ x }} animate={{ x: 0 }} exit={{ x }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn('fixed inset-y-0 z-[70] flex w-80 max-w-[85vw] flex-col bg-surface shadow-[var(--shadow-elevated)]', side === 'left' ? 'left-0 border-r border-border' : 'right-0 border-l border-border')}
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value} role="tab" aria-selected={active} onClick={() => onChange(t.value)}
            className={cn('relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[14px] transition-colors', active ? 'border-primary font-medium text-text' : 'border-transparent text-text-muted hover:text-text')}
          >
            {t.label}
            {typeof t.count === 'number' && <span className="rounded-full bg-bg-subtle px-1.5 text-[11px] tabular-nums text-text-muted">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
