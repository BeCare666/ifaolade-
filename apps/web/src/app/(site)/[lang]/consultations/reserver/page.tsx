import type { Metadata } from 'next';
import { Container } from '@/components/site/editorial';
import { getDict } from '@/i18n';
import { Booking } from './booking';

export const metadata: Metadata = { title: 'Réserver une consultation', robots: { index: false } };

type Lives = ReturnType<typeof getDict>['home2']['lives'];

export default async function ReserverPage({ searchParams }: { searchParams: Promise<{ offre?: string; portrait?: string; domaine?: string }> }) {
  const { offre, portrait, domaine } = await searchParams;
  // Tuiles « Ce que tu vis » de l'accueil : le domaine choisi amorce la question (la réservation est en français).
  const lives = getDict('fr').home2.lives;
  const label = domaine && domaine in lives ? lives[domaine as keyof Lives][0] : null;
  return (
    <Container className="py-12 lg:py-20">
      <Booking initialOffer={offre} readingId={portrait} initialQuestion={label ? `${label} : ` : undefined} />
    </Container>
  );
}
