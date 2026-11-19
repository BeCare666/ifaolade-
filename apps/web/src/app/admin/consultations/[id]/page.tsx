import { AdminConsultation } from './admin-consultation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminConsultation id={(await params).id} />;
}
