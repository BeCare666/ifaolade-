'use client';

import { MEJI } from '@ona/core';
import { Globe, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { ButtonLink, IconButton } from '@/components/ui/button';
import { Drawer } from '@/components/ui/overlay';
import { LANG_LABELS, LANGS, lp, splitPath } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { SITE_NAME } from '@/lib/site';
import { mainNav, secondaryNav } from './nav-links';

export function BrandMark() {
  const ogbe = MEJI[0].marks;
  return (
    <span className="flex items-center gap-2.5">
      <OduGlyph right={ogbe} left={ogbe} size="xs" label="" />
      <span className="text-[17px] font-medium tracking-[-0.01em] text-text">{SITE_NAME}</span>
    </span>
  );
}

/** Sélecteur de langue : même page, autre langue (étape 6.4). */
function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname() || '/';
  const { lang, d } = useI18n();
  const { path } = splitPath(pathname);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (compact) {
    return (
      <div className="flex gap-2" aria-label={d.nav.language}>
        {LANGS.map((l) => (
          <Link key={l} href={lp(l, path)} hrefLang={l} className={cn('rounded-full border px-3 py-1.5 text-[13px]', l === lang ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong text-text-muted')}>
            {LANG_LABELS[l]}
          </Link>
        ))}
      </div>
    );
  }
  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={d.nav.language} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-text-muted transition-colors hover:bg-bg-subtle hover:text-text">
        <Globe size={16} strokeWidth={1.6} /> {lang.toUpperCase()}
      </button>
      {open && (
        <ul className="absolute right-0 z-[60] mt-2 w-40 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface py-1 shadow-[var(--shadow-elevated)]">
          {LANGS.map((l) => (
            <li key={l}>
              <Link href={lp(l, path)} hrefLang={l} onClick={() => setOpen(false)} className={cn('block px-4 py-2 text-[14px]', l === lang ? 'font-medium text-primary' : 'text-text-muted hover:bg-bg-subtle hover:text-text')}>
                {LANG_LABELS[l]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || '/';
  const { path } = splitPath(pathname);
  const { d, href } = useI18n();
  const { user } = useAuth();
  const spaceHref = user ? '/espace' : href('/connexion');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className={cn('sticky top-0 z-50 transition-colors duration-300', scrolled ? 'border-b border-border bg-bg/85 backdrop-blur-md' : 'border-b border-transparent bg-bg')}>
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href={href('/')} aria-label={`${SITE_NAME}, ${d.nav.home}`}><BrandMark /></Link>
          <nav aria-label={d.nav.main} className="hidden items-center gap-7 xl:flex">
            {mainNav(d).map((n) => (
              <Link key={n.href} href={href(n.href)} className={cn('text-[14px] transition-colors', path.startsWith(n.href) ? 'text-text' : 'text-text-muted hover:text-text')}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <span className="hidden md:block"><LangSwitcher /></span>
            <ButtonLink href={spaceHref} variant="ghost" size="sm" className="hidden sm:inline-flex">{d.cta.space}</ButtonLink>
            <ButtonLink href={href('/connais-toi')} size="sm">{d.cta.discover}</ButtonLink>
            <IconButton label={d.nav.openMenu} className="xl:hidden" onClick={() => setOpen(true)}><Menu size={20} /></IconButton>
          </div>
        </div>
      </header>
      <Drawer open={open} onClose={() => setOpen(false)} side="right" label={d.nav.menu}>
        <div className="flex h-18 items-center justify-between px-6">
          <BrandMark />
          <IconButton label={d.nav.closeMenu} onClick={() => setOpen(false)}><X size={18} /></IconButton>
        </div>
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-6 pb-8">
          <ul className="space-y-1">
            {[...mainNav(d), ...secondaryNav(d)].map((n) => (
              <li key={n.href}>
                <Link href={href(n.href)} className={cn('block border-b border-border py-3.5 text-[16px]', path.startsWith(n.href) ? 'text-text' : 'text-text-muted')}>{n.label}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-6"><LangSwitcher compact /></div>
          <div className="mt-8 grid gap-3">
            <ButtonLink href={href('/connais-toi')}>{d.cta.discover}</ButtonLink>
            <ButtonLink href={spaceHref} variant="secondary">{d.cta.space}</ButtonLink>
          </div>
        </nav>
      </Drawer>
    </>
  );
}
