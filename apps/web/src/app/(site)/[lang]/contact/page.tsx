import type { Metadata } from 'next';
import { PageHero } from '@/components/site/blocks';
import { Container } from '@/components/site/editorial';
import { getDict } from '@/i18n';
import { pageLang, pageMeta, type LangParams } from '@/i18n/server';
import { ContactForm } from './contact-form';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await pageLang(params);
  const d = getDict(lang).contact;
  return pageMeta(lang, '/contact', d.metaTitle, d.metaDesc);
}

export default async function ContactPage({ params }: LangParams) {
  const lang = await pageLang(params);
  const d = getDict(lang).contact;
  return (
    <>
      <PageHero overline={d.overline} title={d.title} text={d.text} />
      <Container className="grid gap-14 pb-28 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-24">
        <ContactForm />
        <aside className="space-y-8 text-[14px] leading-[1.8] text-text-muted">
          {[[d.delayTitle, d.delay], [d.tzTitle, d.tz], [d.urgentTitle, d.urgent]].map(([t, x]) => (
            <div key={t}><p className="text-overline">{t}</p><p className="mt-3">{x}</p></div>
          ))}
        </aside>
      </Container>
    </>
  );
}
