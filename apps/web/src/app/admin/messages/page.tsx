'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';
import { dt } from '@/components/admin/list';
import { Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { useApi } from '@/lib/use-api';

interface Msg { id: string; name: string; email: string; subject: string; message: string; createdAt: string }

export default function MessagesPage() {
  const { data, error, loading, reload } = useApi<Msg[]>('/admin/contact');
  const [current, setCurrent] = useState<string | null>(null);
  const msg = data?.find((m) => m.id === current) ?? data?.[0];

  return (
    <>
      <PageHeader title="Messages de contact" description="Formulaire de la page Contact." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Messages' }]} />
      {error ? <ErrorState description={error} onRetry={reload} /> : loading || !data ? <Skeleton className="h-64" /> : !data.length ? <EmptyState title="Aucun message" /> : (
        <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="overflow-hidden">
            <ul className="scrollbar-thin max-h-[70vh] divide-y divide-border overflow-y-auto">
              {data.map((m) => (
                <li key={m.id}>
                  <button onClick={() => setCurrent(m.id)} className={cn('block w-full px-4 py-3.5 text-left transition-colors', msg?.id === m.id ? 'bg-primary-soft' : 'hover:bg-bg-subtle')}>
                    <div className="flex justify-between gap-2"><span className="truncate text-[14px] text-text">{m.name}</span><span className="shrink-0 text-[11.5px] tabular-nums text-text-faint">{dt(m.createdAt, false)}</span></div>
                    <p className="truncate text-[13px] text-text-muted">{m.subject}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          {msg && (
            <Card className="p-6">
              <p className="text-[12px] text-text-faint">{dt(msg.createdAt)}</p>
              <h2 className="mt-1 text-[18px] text-text">{msg.subject}</h2>
              <p className="mt-1 text-[14px] text-text-muted">{msg.name} · {msg.email}</p>
              <p className="mt-6 whitespace-pre-line text-[15px] leading-[1.8] text-text">{msg.message}</p>
              <a href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`} className="mt-8 inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-[14px] font-medium text-primary-foreground hover:bg-primary-hover"><Mail size={15} /> Répondre par email</a>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
