import type { Metadata } from 'next';
import { getDict, type Lang } from '@/i18n';
import { pageMeta } from '@/i18n/server';
import { Container } from './editorial';

export type LegalKey = 'mentions' | 'cgv' | 'confidentialite' | 'cookies';
export const LEGAL_PATH: Record<LegalKey, string> = { mentions: '/mentions-legales', cgv: '/cgv', confidentialite: '/confidentialite', cookies: '/cookies' };

export const legalMeta = (lang: Lang, key: LegalKey): Metadata => pageMeta(lang, LEGAL_PATH[key], getDict(lang).legal[key].title);

/** Gabarit des pages légales. Les passages [entre crochets] sont à compléter AVANT la mise en ligne (plan §15.3, étape 8.2). */
export function LegalPage({ lang, page }: { lang: Lang; page: LegalKey }) {
  const D = getDict(lang);
  const { title, sections } = D.legal[page];
  return (
    <Container className="pb-28 pt-16 lg:pt-24">
      <div className="max-w-3xl">
        <p className="text-overline">{D.common.infoOverline}</p>
        <h1 className="text-section mt-5 text-text">{title}</h1>
        <p className="mt-4 text-[13px] text-text-faint">{D.common.updated.replace('{date}', D.legal.placeholderDate)}</p>
        <div className="mt-14 space-y-12">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-[20px] tracking-[-0.01em] text-text">{s.h}</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-[1.85] text-text-muted">{s.p.map((p, i) => <p key={i}>{p}</p>)}</div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
