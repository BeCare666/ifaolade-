import { EventEditor } from './event-editor';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EventEditor id={(await params).id} />;
}
