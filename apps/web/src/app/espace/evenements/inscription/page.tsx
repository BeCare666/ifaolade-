import type { Metadata } from 'next';
import { InscriptionEvenement } from '@/components/espace/more';

export const metadata: Metadata = { title: 'Inscription' };

export default async function Page({ searchParams }: { searchParams: Promise<{ evenement?: string }> }) {
  return <InscriptionEvenement slug={(await searchParams).evenement} />;
}
