import type { Metadata } from 'next';
import { CtaBand, PageHero } from '@/components/site/blocks';
import { Container, Reveal } from '@/components/site/editorial';
import { getDict, lp } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).protocole;
  return pageMeta(lang, '/protocole', d.metaTitle, d.metaDesc);
}

export default async function ProtocolePage({ params }: LangParams) {
  const lang = await pageLang(params);
  const D = getDict(lang);
  const d = D.protocole;
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="pb-28">
        <ol className="max-w-4xl">
          {D.site.protocol.map((s, i) => (
            <Reveal key={s.title}>
              <li className="grid gap-6 border-t border-border py-12 sm:grid-cols-[120px_minmax(0,1fr)]">
                <p className="text-[44px] font-normal leading-none tracking-[-0.04em] tabular-nums text-accent">{String(i + 1).padStart(2, '0')}</p>
                <div>
                  <h2 className="text-card-title text-text">{s.title}</h2>
                  <p className="mt-3 text-[16px] leading-[1.8] text-text-muted">{s.text}</p>
                  <ul className="mt-6 space-y-2.5">
                    {D.site.protocolDetails[i].map((x) => (
                      <li key={x} className="flex gap-3 text-[15px] leading-[1.7] text-text"><span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-text-faint" />{x}</li>
                    ))}
                  </ul>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
      <CtaBand title={d.ctaTitle} href={lp(lang, '/connais-toi')} label={D.cta.portrait} />
    </>
  );
}
