import type { Metadata } from 'next';
import { Container } from '@/components/site/editorial';
import { PaymentResult } from './payment-result';

export const metadata: Metadata = { title: 'Paiement', robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ pid?: string; dev?: string; annule?: string }> }) {
  const { pid, dev, annule } = await searchParams;
  return (
    <Container className="py-16 lg:py-24">
      <PaymentResult pid={pid ?? ''} dev={dev === '1'} cancelled={annule === '1'} />
    </Container>
  );
}
