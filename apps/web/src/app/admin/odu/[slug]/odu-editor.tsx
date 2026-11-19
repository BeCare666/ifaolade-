'use client';

import { oduBySlug } from '@ona/core';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { OduDomainEditor } from '@/components/admin/odu-domain-editor';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { Markdown } from '@/components/site/markdown';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Tabs } from '@/components/ui/overlay';
import { Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';

interface Detail { id: number; essence: string; teaching: string | null; keywords: string[] }

/** Contenu d'un Odu rédigé par le prêtre (plan §9.3). Le texte par défaut du moteur sert de point de départ. */
export function OduEditor({ slug }: { slug: string }) {
  const odu = oduBySlug(slug);
  const { data, error, reload } = useApi<Detail>(odu ? `/odu/${slug}` : null);
  const { token } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [body, setBody] = useState('');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    setSummary(data.essence);
    setKeywords(data.keywords.join(', '));
    setBody(data.teaching ?? '');
  }, [data]);

  if (!odu) return <EmptyState title="Odu introuvable" />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title={odu.name}
        description={`Fá : ${odu.fonName} · rang ${odu.rank} sur 256`}
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Odu', href: '/admin/odu' }, { label: odu.name }]}
        actions={<Link href={`/odu/${slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-[13px] text-primary">Voir la fiche publique <ExternalLink size={13} /></Link>}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <Field label="Essence (résumé public)" htmlFor="s"><Textarea id="s" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
            <Field label="Mots-clés" htmlFor="k" hint="Séparés par des virgules"><Input id="k" value={keywords} onChange={(e) => setKeywords(e.target.value)} /></Field>
            <div>
              <Tabs value={view} onChange={setView} tabs={[{ value: 'edit', label: 'Enseignement' }, { value: 'preview', label: 'Aperçu' }]} />
              <div className="mt-4">
                {view === 'edit' ? (
                  <Textarea rows={18} value={body} onChange={(e) => setBody(e.target.value)} placeholder={'## Ce que dit cet Odu\n\nTexte de l\'enseignement…\n\n- un point\n- un autre point\n\n> Une parole d\'Ifá en citation'} className="font-mono text-[13px]" />
                ) : body.trim() ? <Markdown source={body} /> : <p className="text-[14px] text-text-faint">Rien à prévisualiser.</p>}
              </div>
              <p className="mt-2 text-[12px] text-text-faint">Mise en forme : ## titre, ### sous-titre, - liste, 1. liste numérotée, &gt; citation, **gras**, *italique*, [lien](https://…).</p>
            </div>
          </div>
          <div className="mt-8 flex justify-end border-t border-border pt-6">
            <Button shape="console" loading={busy} onClick={async () => {
              setBusy(true);
              try {
                await apiSend(`/admin/odu/${odu.id}`, { summary: summary.trim() || undefined, keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean), body: body.trim() || undefined }, 'PUT', token);
                toast('Enseignement enregistré. La fiche publique se met à jour sous 10 minutes.');
                reload();
              } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
            }}>Enregistrer</Button>
          </div>
        </Card>
        <OduDomainEditor oduId={odu.id} isMeji={odu.isMeji} />
        </div>
        <Card className="flex flex-col items-center p-6 text-center lg:sticky lg:top-24">
          <OduGlyph right={odu.marks.right} left={odu.marks.left} size="md" label={odu.name} />
          <p className="mt-4 text-[15px] text-text">{odu.name}</p>
          <p className="font-mono text-[11px] tracking-[0.2em] text-text-faint">{odu.binary}</p>
        </Card>
      </div>
    </>
  );
}
