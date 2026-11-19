import type { Metadata } from 'next';
import { ClientFrame } from '@/components/espace/client-frame';

export const metadata: Metadata = { title: { default: 'Mon espace', template: '%s · Mon espace' }, robots: { index: false, follow: false } };

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  return <ClientFrame>{children}</ClientFrame>;
}
