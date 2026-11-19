import type { Metadata } from 'next';
import { Voyages } from '@/components/espace/voyages';

export const metadata: Metadata = { title: 'Mes voyages' };

export default function Page() {
  return <Voyages />;
}
