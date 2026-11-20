'use client';

import { isLibraryKind } from '@ona/core';
import { use } from 'react';
import { LibraryEditor } from '@/components/admin/library-admin';
import { EmptyState } from '@/components/ui/primitives';

export default function Page({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = use(params);
  return isLibraryKind(kind) ? <LibraryEditor kind={kind} id={id} /> : <EmptyState title="Section inconnue" />;
}
