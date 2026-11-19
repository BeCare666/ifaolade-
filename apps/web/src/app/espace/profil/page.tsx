import type { Metadata } from 'next';
import { Profil } from '@/components/espace/more';

export const metadata: Metadata = { title: 'Profil et confidentialité' };

export default function Page() {
  return <Profil />;
}
