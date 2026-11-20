'use client';

import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Adire, OduRule } from '@/components/brand/patterns';
import { SocialLinks } from '@/components/brand/social-icons';
import { useI18n } from '@/i18n/client';
import { SITE_NAME } from '@/lib/site';
import { useSiteData } from '@/lib/site-data';
import { LangSwitcher } from './header';
import { legalNav, menuGroups } from './nav-links';

/** Pied de page (REFONTE §5) : bande d'appel, logo, réseaux, contacts, 4 colonnes avec icônes, mentions. */
export function SiteFooter() {
  const { d, href } = useI18n();
  const { settings } = useSiteData();
  const groups = menuGroups(d);
  const cols = [groups[0], { ...groups[1], items: [...groups[1].items, ...groups[2].items] }, groups[3], groups[4]];
  const place = typeof settings['contact.place'] === 'string' && settings['contact.place'] ? settings['contact.place'] : d.footer.place;

  return (
    <footer>
      {/* Bande d'appel */}
      <section className="relative overflow-hidden bg-night text-kaolin">
        <Adire kind="grid" opacity={0.06} />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:py-16">
          <div className="max-w-2xl">
            <OduRule className="text-osun/80" />
            <p className="font-display mt-5 text-[36px] font-semibold leading-[1.05] lg:text-[48px]">{d.menu.footerCtaTitle}</p>
            <p className="mt-4 text-[16px] leading-relaxed text-kaolin/70">{d.menu.footerCtaText}</p>
          </div>
          <Link href={href('/consultations/reserver?offre=FIRST_FREE')} className="inline-flex h-13 shrink-0 items-center gap-2 rounded-full bg-osun px-7 py-3.5 text-[15px] font-medium text-kaolin transition-colors hover:bg-osun-hover">
            {d.menu.offerCta} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Corps */}
      <div className="border-t border-border bg-sand/60">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div>
            <Logo variant="full" size="md" />
            <p className="mt-6 max-w-sm text-[14px] leading-[1.8] text-text-muted">{d.footer.tagline}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-[13px] text-text-muted"><MapPin size={14} strokeWidth={1.7} /> {place}</p>
            <SocialLinks className="mt-6" />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {cols.map((g) => (
              <div key={g.key}>
                <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-text">
                  <g.icon size={14} strokeWidth={1.7} className="text-osun" /> {g.title}
                </p>
                <ul className="mt-5 space-y-3">
                  {g.items.map((it) => (
                    <li key={it.href}><Link href={href(it.href)} className="text-[14px] text-text-muted transition-colors hover:text-text">{it.title}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-[12px] text-text-faint sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span>© {new Date().getFullYear()} {SITE_NAME}. {d.footer.rights}</span>
              {legalNav(d).map((l) => <Link key={l.href} href={href(l.href)} className="transition-colors hover:text-text">{l.label}</Link>)}
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden xl:inline">{d.footer.promise}</span>
              <LangSwitcher up />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
