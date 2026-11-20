'use client';

import { isLibraryKind } from '@ona/core';
import { use } from 'react';
import { LibraryList } from '@/components/admin/library-admin';
import { EmptyState } from '@/components/ui/primitives';

export default function Page({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = use(params);
  return isLibraryKind(kind) ? <LibraryList kind={kind} /> : <EmptyState title="Section inconnue" />;
}
