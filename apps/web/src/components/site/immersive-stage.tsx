'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Seal } from '@/components/brand/logo';
import { Adire } from '@/components/brand/patterns';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/cn';

/**
 * Plein écran sans distraction (REFONTE §11 quinquies, étape R16) : recouvre l'en-tête, le pied de page et la
 * barre basse ; la page ne défile pas. En haut : sceau, progression fine, « Quitter ». Au centre : une seule chose.
 * En bas : les actions, toujours à la même place. Seul un contenu trop long défile, dans son cadre.
 */
export function ImmersiveStage({ tone = 'light', progress, children, actions, quitHref = '/' }: {
  tone?: 'light' | 'night';
  /** 0 à 1 ; absent = pas de barre. */
  progress?: number;
  children: React.ReactNode;
  actions?: React.ReactNode;
  quitHref?: string;
}) {
  const { d, href } = useI18n();
  const night = tone === 'night';

  useEffect(() => {
    const html = document.documentElement;
    const prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => { html.style.overflow = prev[0]; document.body.style.overflow = prev[1]; };
  }, []);

  return (
    <div className={cn('fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-hidden', night ? 'bg-night text-kaolin' : 'bg-bg text-text')}>
      {night && <Adire kind="zigzag" opacity={0.05} />}
      <header className="relative flex items-center gap-4 px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
        <Seal size={30} inverse={night} className={night ? '' : 'text-primary'} />
        <div className="flex-1">
          {progress !== undefined && (
            <div role="progressbar" aria-label={d.wizard.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
              className={cn('mx-auto h-1 max-w-md overflow-hidden rounded-full', night ? 'bg-kaolin/15' : 'bg-border')}>
              <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', night ? 'bg-kaolin' : 'bg-primary')} style={{ width: `${Math.max(3, progress * 100)}%` }} />
            </div>
          )}
        </div>
        <Link href={href(quitHref)} aria-label={d.wizard.quit}
          className={cn('grid h-10 w-10 place-items-center rounded-full border transition-colors', night ? 'border-kaolin/25 text-kaolin hover:bg-kaolin/10' : 'border-border text-text-muted hover:bg-bg-subtle hover:text-text')}>
          <X size={18} />
        </Link>
      </header>
      <main className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-5 py-6 sm:px-8">{children}</div>
      </main>
      {actions && (
        <footer className="relative mx-auto w-full max-w-2xl px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 sm:px-8 sm:pb-8">{actions}</footer>
      )}
    </div>
  );
}
