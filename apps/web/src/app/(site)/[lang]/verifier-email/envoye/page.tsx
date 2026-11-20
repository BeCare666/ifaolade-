import type { Metadata } from 'next';
import { AuthShell } from '@/components/site/auth-shell';
import { getDict } from '@/i18n';
import { pageLang } from '@/i18n/server';
import { EmailSent } from './email-sent';

type P = { params: Promise<{ lang: string }>; searchParams: Promise<{ suite?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDict(await pageLang(params)).auth.sentOverline, robots: { index: false } };
}

/** Après l'inscription : la personne doit confirmer son email avant de pouvoir se connecter. */
export default async function Page({ params, searchParams }: P) {
  const d = getDict(await pageLang(params)).auth;
  const { suite } = await searchParams;
  return (
    <AuthShell overline={d.sentOverline} title={d.sentTitle}>
      <EmailSent next={suite} />
    </AuthShell>
  );
}
