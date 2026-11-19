import { ProgramEditor } from './program-editor';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ProgramEditor id={(await params).id} />;
}
