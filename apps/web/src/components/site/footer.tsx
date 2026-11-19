'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/client';
import { SITE_NAME } from '@/lib/site';
import { BrandMark } from './header';
import { legalNav, mainNav, secondaryNav } from './nav-links';

export function SiteFooter() {
  const { d, href } = useI18n();
  return (
    <footer className="border-t border-border bg-bg-subtle">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-sm text-[14px] leading-[1.8] text-text-muted">{d.footer.tagline}</p>
          <p className="mt-6 text-[13px] text-text-faint">{d.footer.place}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <FooterCol title={d.footer.discover} links={mainNav(d)} href={href} />
          <FooterCol title={d.footer.house} links={secondaryNav(d)} href={href} />
          <FooterCol title={d.footer.info} links={legalNav(d)} href={href} />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[12px] text-text-faint sm:flex-row sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} {SITE_NAME}. {d.footer.rights}</span>
          <span>{d.footer.promise}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, href }: { title: string; links: { href: string; label: string }[]; href: (p: string) => string }) {
  return (
    <div>
      <p className="text-overline">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}><Link href={href(l.href)} className="text-[14px] text-text-muted transition-colors hover:text-text">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
