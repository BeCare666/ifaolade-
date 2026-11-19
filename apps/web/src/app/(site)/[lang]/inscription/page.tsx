import type { Metadata } from 'next';
import { AuthShell, TrustAside } from '@/components/site/auth-shell';
import { getDict } from '@/i18n';
import { pageLang } from '@/i18n/server';
import { RegisterForm } from './register-form';

type P = { params: Promise<{ lang: string }>; searchParams: Promise<{ suite?: string; portrait?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDict(await pageLang(params)).auth.create, robots: { index: false } };
}

export default async function InscriptionPage({ params, searchParams }: P) {
  const lang = await pageLang(params);
  const d = getDict(lang).auth;
  const { suite, portrait } = await searchParams;
  return (
    <AuthShell
      overline={d.freeAccount}
      title={portrait ? d.registerTitlePortrait : d.registerTitle}
      text={portrait ? d.registerTextPortrait : d.registerText}
      aside={<TrustAside lang={lang} />}
    >
      <RegisterForm next={suite} portrait={portrait} />
    </AuthShell>
  );
}
