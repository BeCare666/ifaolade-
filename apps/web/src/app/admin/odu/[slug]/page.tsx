import { OduEditor } from './odu-editor';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <OduEditor slug={(await params).slug} />;
}
