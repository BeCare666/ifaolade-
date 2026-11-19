import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { getDict, isLang, LANGS } from '@/i18n';
import { LangProvider } from '@/i18n/client';
import { pageMeta } from '@/i18n/server';
import { SiteDataProvider } from '@/lib/site-data';
import { getSiteData } from '@/lib/site-data.server';

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || 'Ifaôladé';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = getDict(lang);
  return { ...pageMeta(lang, '/', `${SITE} · ${d.meta.title}`, d.meta.description), title: { default: `${SITE} · ${d.meta.title}`, template: `%s · ${SITE}` } };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = getDict(lang);
  const site = await getSiteData(lang);
  return (
    <LangProvider lang={lang}>
      <SiteDataProvider value={site}>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
        {d.nav.skip}
      </a>
      <SiteHeader />
      <main id="contenu">{children}</main>
      <SiteFooter />
      </SiteDataProvider>
    </LangProvider>
  );
}
