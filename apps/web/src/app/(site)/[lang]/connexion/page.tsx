import type { Metadata } from 'next';
import { AuthShell, TrustAside } from '@/components/site/auth-shell';
import { getDict } from '@/i18n';
import { pageLang } from '@/i18n/server';
import { LoginForm } from './login-form';

type P = { params: Promise<{ lang: string }>; searchParams: Promise<{ suite?: string; portrait?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDict(await pageLang(params)).auth.login, robots: { index: false } };
}

export default async function ConnexionPage({ params, searchParams }: P) {
  const lang = await pageLang(params);
  const d = getDict(lang).auth;
  const { suite, portrait } = await searchParams;
  return (
    <AuthShell overline={d.space} title={d.loginTitle} aside={<TrustAside lang={lang} />}>
      <LoginForm next={suite} portrait={portrait} />
    </AuthShell>
  );
}
