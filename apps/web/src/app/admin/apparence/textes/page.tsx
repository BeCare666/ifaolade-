'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/field';
import { Tabs } from '@/components/ui/overlay';
import { Card, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { getDict, type Lang } from '@/i18n';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';

interface Row { key: string; label: string; values: Record<Lang, string> }

/** Texte du dictionnaire utilisé quand le champ est vide (affiché en exemple). */
function fallback(lang: Lang, key: string): string {
  const d = getDict(lang);
  const map: Record<string, string> = {
    'home.heroOverline': d.home2.overline, 'home.heroTitle': d.home2.title, 'home.heroText': d.home2.text,
    'home.heroCta': d.home2.cta, 'home.heroCta2': d.home2.cta2, 'home.offerTitle': d.home2.offerTitle,
    'home.livesTitle': d.home2.livesTitle, 'home.stepsTitle': d.home2.stepsTitle, 'home.priestTitle': d.home2.priestTitle,
    'home.ctaTitle': d.home.ctaTitle, 'home.ctaText': d.home.ctaText,
    'odu.elementsText': d.odu.elementsText, 'odu.manifest': d.odu.manifest, 'odu.balance': d.odu.balance, 'odu.latent': d.odu.latent,
    'odu.teachingPending': d.odu.teachingPending, 'initiation.emptyTitle': d.initiation.emptyTitle, 'circuits.emptyTitle': d.circuits.emptyTitle,
    'teach.empty': d.teach.empty,
  };
  return map[key] ?? '';
}

/** REFONTE §8.4 : textes de mise en avant, par langue. Un champ vide reprend le texte d'origine. */
export default function TextesPage() {
  const { data, error, reload } = useApi<Row[]>('/admin/site-texts');
  const [lang, setLang] = useState<Lang>('fr');
  return (
    <>
      <PageHeader
        title="Textes de la vitrine"
        description="Laisse un champ vide pour garder le texte d'origine (affiché en gris). Le site se met à jour sous 5 minutes."
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Apparence' }, { label: 'Textes' }]}
      />
      <div className="mb-6"><Tabs value={lang} onChange={setLang} tabs={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }, { value: 'yo', label: 'Yorùbá' }]} /></div>
      {error ? <ErrorState description={error} onRetry={reload} /> : !data ? <Skeleton className="h-96" /> : (
        <div className="max-w-4xl space-y-4">{data.map((r) => <TextRow key={`${r.key}-${lang}`} r={r} lang={lang} onSaved={reload} />)}</div>
      )}
    </>
  );
}

function TextRow({ r, lang, onSaved }: { r: Row; lang: Lang; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [v, setV] = useState(r.values[lang] ?? '');
  const [busy, setBusy] = useState(false);
  useEffect(() => setV(r.values[lang] ?? ''), [r, lang]);
  const changed = v !== (r.values[lang] ?? '');
  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[14px] font-medium text-text">{r.label}</p>
        <code className="text-[11px] text-text-faint">{r.key}</code>
      </div>
      <Textarea className="mt-3" rows={v.length > 120 ? 4 : 2} value={v} placeholder={fallback(lang, r.key)} onChange={(e) => setV(e.target.value)} />
      <div className="mt-3 flex justify-end">
        <Button size="sm" shape="console" disabled={!changed} loading={busy} onClick={async () => {
          setBusy(true);
          try {
            await apiSend(`/admin/site-texts/${encodeURIComponent(r.key)}/${lang}`, { value: v }, 'PUT', token);
            toast(v.trim() ? 'Texte enregistré' : 'Texte d\'origine rétabli');
            onSaved();
          } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
        }}>Enregistrer</Button>
      </div>
    </Card>
  );
}
