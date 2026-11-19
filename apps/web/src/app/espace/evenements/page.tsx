import type { Metadata } from 'next';
import { MesEvenements } from '@/components/espace/more';

export const metadata: Metadata = { title: 'Événements' };

export default function Page() {
  return <MesEvenements />;
}
