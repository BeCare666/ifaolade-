import type { Metadata } from 'next';
import { AuthShell } from '@/components/site/auth-shell';
import { ResetForm } from './reset-form';

export const metadata: Metadata = { title: 'Nouveau mot de passe', robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell overline="Mot de passe" title="Choisis un nouveau mot de passe.">
      <ResetForm token={token ?? ''} />
    </AuthShell>
  );
}
