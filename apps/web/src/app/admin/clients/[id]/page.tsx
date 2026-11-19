import { ClientDossier } from './client-dossier';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ClientDossier id={(await params).id} />;
}
