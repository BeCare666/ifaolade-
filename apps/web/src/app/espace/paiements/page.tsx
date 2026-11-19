import type { Metadata } from 'next';
import { MesPaiements } from '@/components/espace/more';

export const metadata: Metadata = { title: 'Paiements' };

export default function Page() {
  return <MesPaiements />;
}
