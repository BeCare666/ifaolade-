import type { Metadata } from 'next';
import { AuthShell } from '@/components/site/auth-shell';
import { getDict } from '@/i18n';
import { pageLang } from '@/i18n/server';
import { LoginForm } from '../connexion/login-form';

type P = { params: Promise<{ lang: string }>; searchParams: Promise<{ suite?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDict(await pageLang(params)).auth.consoleOverline, robots: { index: false, follow: false } };
}

/** Connexion du prêtre et de l'administration : mène toujours à /admin ; un compte client est refusé. */
export default async function ConsolePage({ params, searchParams }: P) {
  const d = getDict(await pageLang(params)).auth;
  const { suite } = await searchParams;
  return (
    <AuthShell overline={d.consoleOverline} title={d.consoleTitle}>
      <LoginForm next={suite && suite.startsWith('/admin') ? suite : '/admin'} staffOnly />
    </AuthShell>
  );
}
