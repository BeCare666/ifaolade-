import type { Metadata } from 'next';
import { AuthShell } from '@/components/site/auth-shell';
import { VerifyEmail } from './verify-email';

export const metadata: Metadata = { title: 'Confirmer mon email', robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell overline="Confirmation" title="Confirmation de ton email.">
      <VerifyEmail token={token} />
    </AuthShell>
  );
}
