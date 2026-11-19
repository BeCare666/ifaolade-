import type { Metadata } from 'next';
import { Container } from '@/components/site/editorial';
import { Booking } from './booking';

export const metadata: Metadata = { title: 'Réserver une consultation', robots: { index: false } };

export default async function ReserverPage({ searchParams }: { searchParams: Promise<{ offre?: string; portrait?: string }> }) {
  const { offre, portrait } = await searchParams;
  return (
    <Container className="py-12 lg:py-20">
      <Booking initialOffer={offre} readingId={portrait} />
    </Container>
  );
}
