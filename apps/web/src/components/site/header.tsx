'use client';

import { ArrowRight, ChevronDown, Globe, LayoutDashboard, LogOut, Menu, MessageSquareText, Shield, UserRound } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { Adire } from '@/components/brand/patterns';
import { whatsappHref } from '@/components/brand/social-icons';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LANG_LABELS, LANGS, lp, splitPath, tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { SITE_NAME } from '@/lib/site';
import { useSiteData } from '@/lib/site-data';
import { MobileMenu } from './mobile-menu';
import { menuGroups, type MenuGroup } from './nav-links';

/** Logo de la maison (REFONTE §2), utilisé par la vitrine, l'espace client et l'admin. */
export function BrandMark({ inverse = false, variant = 'compact' }: { inverse?: boolean; variant?: 'compact' | 'full' }) {
  return <Logo variant={variant} inverse={inverse} size="sm" />;
}

/** Sélecteur de langue : même page, autre langue (étape 6.4). */
export function LangSwitcher({ compact = false, dark = false, up = false }: { compact?: boolean; dark?: boolean; up?: boolean }) {
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
      <div className="grid grid-cols-3 gap-2" aria-label={d.nav.language}>
        {LANGS.map((l) => (
          <Link key={l} href={lp(l, path)} hrefLang={l} className={cn('rounded-full border py-2 text-center text-[13px] transition-colors', l === lang ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong text-text-muted hover:border-text-faint')}>
            {LANG_LABELS[l]}
          </Link>
        ))}
      </div>
    );
  }
  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={d.nav.language}
        className={cn('inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium tracking-[0.08em] transition-colors', dark ? 'text-kaolin/75 hover:bg-kaolin/10 hover:text-kaolin' : 'text-text-muted hover:bg-bg-subtle hover:text-text')}>
        <Globe size={14} strokeWidth={1.7} /> {lang.toUpperCase()} <ChevronDown size={12} />
      </button>
      {open && (
        <ul className={cn('absolute right-0 z-[80] w-44 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface py-1 shadow-[var(--shadow-elevated)]', up ? 'bottom-full mb-2' : 'mt-2')}>
          {LANGS.map((l) => (
            <li key={l}>
              <Link href={lp(l, path)} hrefLang={l} onClick={() => setOpen(false)} className={cn('flex items-center justify-between px-4 py-2.5 text-[14px]', l === lang ? 'font-medium text-primary' : 'text-text-muted hover:bg-bg-subtle hover:text-text')}>
                {LANG_LABELS[l]} <span className="text-[11px] tracking-[0.1em] text-text-faint">{l.toUpperCase()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Menu du compte : avatar rond (photo ou initiales). */
function AccountMenu() {
  const { user, logout } = useAuth();
  const { d } = useI18n();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  if (!user) return null;
  const name = `${user.firstName} ${user.lastName ?? ''}`.trim();
  const staff = user.role === 'ADMIN' || user.role === 'PRIEST';
  const links = [
    { href: '/espace', label: d.menu.mySpace, icon: LayoutDashboard },
    { href: '/espace/consultations', label: d.menu.myConsultations, icon: MessageSquareText },
    { href: '/espace/profil', label: d.menu.profile, icon: UserRound },
    ...(staff ? [{ href: '/admin', label: 'Console du prêtre', icon: Shield }] : []),
  ];
  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={d.menu.account} className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 transition-colors hover:bg-bg-subtle">
        <UserAvatar name={name} src={user.avatarUrl} size={36} />
        <ChevronDown size={14} className={cn('text-text-faint transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.16 }}
            className="absolute right-0 z-[80] mt-3 w-72 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-elevated)]">
            <div className="relative flex items-center gap-3 overflow-hidden bg-night px-5 py-4">
              <Adire kind="dots" opacity={0.08} />
              <UserAvatar name={name} src={user.avatarUrl} size={44} className="relative" />
              <div className="relative min-w-0">
                <p className="font-display truncate text-[19px] font-semibold text-kaolin">{tpl(d.menu.hello, { name: user.firstName })}</p>
                <p className="truncate text-[12px] text-kaolin/60">{user.email}</p>
              </div>
            </div>
            <ul className="p-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text transition-colors hover:bg-bg-subtle">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary"><l.icon size={15} strokeWidth={1.7} /></span>{l.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-border pt-1">
                <button onClick={() => { setOpen(false); void logout(); }} className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] text-text-muted transition-colors hover:bg-bg-subtle hover:text-text">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-bg-subtle"><LogOut size={15} strokeWidth={1.7} /></span>{d.menu.logout}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Panneau d'un méga-menu : liens avec pastilles d'icône + carte mise en avant (image modifiable dans l'admin). */
function MegaPanel({ g, onNavigate }: { g: MenuGroup; onNavigate: () => void }) {
  const { href } = useI18n();
  const { images } = useSiteData();
  const img = images[g.image];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 top-full z-[60] border-b border-border bg-surface shadow-[0_24px_48px_-24px_rgba(20,27,46,0.35)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className={cn('grid content-start gap-1.5', g.items.length > 3 ? 'grid-cols-2' : 'grid-cols-1 max-w-md')}>
          {g.items.map((it) => (
            <li key={it.href}>
              <Link href={href(it.href)} onClick={onNavigate} className="group flex items-start gap-4 rounded-[var(--radius-lg)] p-3.5 transition-colors hover:bg-bg-subtle">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <it.icon size={19} strokeWidth={1.6} />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="flex items-center gap-1.5 text-[15px] font-medium text-text">{it.title}<ArrowRight size={13} className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" /></span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-text-muted">{it.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={href(g.featured.href)} onClick={onNavigate} className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] bg-night p-6 text-kaolin">
          {img
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={img.url} alt={img.alt ?? ''} className="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-105" />
            : <Adire kind="grid" opacity={0.09} />}
          <span className="absolute left-6 top-6 grid h-10 w-10 place-items-center rounded-full border border-kaolin/25"><g.icon size={18} strokeWidth={1.6} /></span>
          <span className="relative font-display text-[26px] font-semibold leading-tight">{g.featured.title}</span>
          <span className="relative mt-2 text-[14px] leading-relaxed text-kaolin/75">{g.featured.text}</span>
          <span className="relative mt-4 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.04em]">{g.featured.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </div>
    </motion.div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname() || '/';
  const { path } = splitPath(pathname);
  const { d, href } = useI18n();
  const { user, ready } = useAuth();
  const { settings } = useSiteData();
  const groups = menuGroups(d);
  const wa = whatsappHref(settings['contact.whatsapp']);
  const freeHref = href('/consultations/reserver?offre=FIRST_FREE');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setDrawer(false); setOpenKey(null); }, [pathname]);
  useEffect(() => {
    if (!openKey) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpenKey(null);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [openKey]);

  const hoverOpen = (k: string) => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpenKey(k), 110); };
  const hoverClose = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpenKey(null), 160); };
  const isGroupActive = (g: MenuGroup) => g.items.some((it) => { const p = it.href.split('?')[0]; return p !== '/' && path.startsWith(p); });

  return (
    <>
      {/* Barre de service */}
      <div className="relative z-[55] hidden bg-night text-kaolin sm:block">
        <Adire kind="zigzag" opacity={0.06} />
        <div className="relative mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-8">
          <Link href={freeHref} className="inline-flex items-center gap-2 text-[12px] tracking-[0.04em] text-kaolin/85 transition-colors hover:text-kaolin">
            <span className="h-1.5 w-1.5 rounded-full bg-osun" /> {d.menu.offerPill} <ArrowRight size={12} />
          </Link>
          <div className="flex items-center gap-4 text-[12px] text-kaolin/70">
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="hidden transition-colors hover:text-kaolin md:inline">WhatsApp</a>}
            {typeof settings['contact.email'] === 'string' && settings['contact.email'] && <a href={`mailto:${settings['contact.email']}`} className="hidden transition-colors hover:text-kaolin md:inline">{settings['contact.email']}</a>}
            <LangSwitcher dark />
          </div>
        </div>
      </div>

      <header
        className={cn('sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300', scrolled || openKey ? 'border-b border-border bg-bg/92 shadow-[0_8px_24px_-20px_rgba(20,27,46,0.45)] backdrop-blur-md' : 'border-b border-transparent bg-bg')}
        onMouseLeave={hoverClose}
      >
        <div className={cn('mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 transition-[height] duration-300 sm:px-8', scrolled ? 'h-16' : 'h-[76px]')}>
          <Link href={href('/')} aria-label={`${SITE_NAME}, ${d.nav.home}`} className="shrink-0"><Logo variant="full" size="sm" /></Link>

          <nav aria-label={d.nav.main} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {groups.map((g) => {
                const open = openKey === g.key;
                return (
                  <li key={g.key} onMouseEnter={() => hoverOpen(g.key)}>
                    <button
                      type="button" aria-expanded={open} aria-haspopup="true"
                      onClick={() => setOpenKey(open ? null : g.key)}
                      className={cn('relative inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] transition-colors',
                        open ? 'bg-bg-subtle text-text' : isGroupActive(g) ? 'text-text' : 'text-text-muted hover:text-text')}
                    >
                      {g.title}
                      <ChevronDown size={14} className={cn('transition-transform duration-200', open && 'rotate-180')} />
                      {isGroupActive(g) && <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-osun" />}
                    </button>
                    <AnimatePresence>{open && <MegaPanel g={g} onNavigate={() => setOpenKey(null)} />}</AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href={freeHref} className="hidden h-10 items-center gap-2 rounded-full bg-osun px-5 text-[14px] font-medium text-kaolin transition-colors hover:bg-osun-hover sm:inline-flex">
              {d.menu.offerCta}
            </Link>
            {ready && (user ? <AccountMenu /> : (
              <Link href={href('/connexion')} className="hidden h-10 items-center gap-2 rounded-full border border-border-strong px-4 text-[14px] text-text transition-colors hover:border-text-faint md:inline-flex">
                <UserRound size={15} strokeWidth={1.7} /> {d.menu.login}
              </Link>
            ))}
            <button type="button" aria-label={d.nav.openMenu} onClick={() => setDrawer(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border-strong text-text transition-colors hover:border-text-faint lg:hidden">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}
