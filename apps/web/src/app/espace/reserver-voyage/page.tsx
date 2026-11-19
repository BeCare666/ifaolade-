import type { Metadata } from 'next';
import { ReserverVoyage } from '@/components/espace/voyages';

export const metadata: Metadata = { title: 'Réserver un voyage' };

export default async function Page({ searchParams }: { searchParams: Promise<{ programme?: string; session?: string }> }) {
  const { programme, session } = await searchParams;
  return <ReserverVoyage slug={programme} sessionId={session} />;
}
