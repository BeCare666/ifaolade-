'use client';

import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { ButtonLink } from '@/components/ui/button';
import { useI18n } from '@/i18n/client';

/** 404 dans la langue de l'adresse (étape 6.4). */
export default function NotFound() {
  const { d, href } = useI18n();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-32 sm:px-8">
        <p className="text-overline">{d.common.notFoundOverline}</p>
        <h1 className="text-section mt-5 text-text">{d.common.notFoundTitle}</h1>
        <p className="text-body mt-6 max-w-xl">{d.common.notFoundText}</p>
        <div className="mt-10"><ButtonLink href={href('/')}>{d.common.backHome}</ButtonLink></div>
      </main>
      <SiteFooter />
    </>
  );
}
