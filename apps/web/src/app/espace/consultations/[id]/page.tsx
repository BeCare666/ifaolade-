import type { Metadata } from 'next';
import { ConsultationDetail } from './consultation-detail';

export const metadata: Metadata = { title: 'Ma consultation', robots: { index: false } };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nouvelle?: string }> }) {
  const [{ id }, { nouvelle }] = await Promise.all([params, searchParams]);
  return <ConsultationDetail id={id} isNew={nouvelle === '1'} />;
}
