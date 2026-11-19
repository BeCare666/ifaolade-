import { ArticleEditor } from './article-editor';

/** /admin/enseignements/nouveau crée un article ; /admin/enseignements/<id> le modifie. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ArticleEditor id={(await params).id} />;
}
