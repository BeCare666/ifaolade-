'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch, Textarea } from '@/components/ui/field';
import { Tabs } from '@/components/ui/overlay';
import { Badge, Card, CardHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DOMAIN_LABELS_FR, ODU_DOMAINS, type OduDomain } from '@/lib/odu-domains';
import { useApi } from '@/lib/use-api';

interface Row { oduId: number; domain: OduDomain; text: string; published: boolean }

/**
 * Interprétations d'un Odu par domaine de vie (plan, étape 5.9), écrites par le prêtre.
 * Un texte n'est visible du public (« J'ai déjà mon Odu ») que lorsqu'il est publié.
 */
export function OduDomainEditor({ oduId, isMeji }: { oduId: number; isMeji: boolean }) {
  const { data, reload } = useApi<Row[]>(`/admin/odu/${oduId}/domains`);
  const { token } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<OduDomain>('amour');
  const [drafts, setDrafts] = useState<Record<string, { text: string; published: boolean }>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    const next: Record<string, { text: string; published: boolean }> = {};
    for (const d of ODU_DOMAINS) {
      const r = data.find((x) => x.domain === d);
      next[d] = { text: r?.text ?? '', published: r?.published ?? false };
    }
    setDrafts(next);
  }, [data]);

  if (!data || !drafts[tab]) return <Skeleton className="h-72" />;
  const cur = drafts[tab];
  const saved = data.find((x) => x.domain === tab);
  const set = (patch: Partial<{ text: string; published: boolean }>) => setDrafts((s) => ({ ...s, [tab]: { ...s[tab], ...patch } }));

  return (
    <Card className="p-6">
      <CardHeader
        title="Interprétations par domaine"
        description={isMeji
          ? 'Ce que dit cet Odu dans chaque domaine. Pour les Ọmọ Odù sans texte propre, la page publique montre les textes des deux Méjì qui les composent, présentés comme tels.'
          : 'Texte propre à cet Ọmọ Odù. Tant qu’il manque, la page publique montre les textes publiés des Méjì de la jambe droite et de la jambe gauche, présentés comme tels.'}
      />
      <div className="mt-5">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={ODU_DOMAINS.map((d) => ({ value: d, label: DOMAIN_LABELS_FR[d] + (data.find((x) => x.domain === d)?.published ? ' ✓' : '') }))}
        />
      </div>
      <div className="mt-5 space-y-4">
        <Textarea
          rows={12}
          value={cur.text}
          onChange={(e) => set({ text: e.target.value })}
          placeholder={`Ce que cet Odu dit en ${DOMAIN_LABELS_FR[tab].toLowerCase()} : l'enseignement, ce qu'il demande, ce qu'il interdit…`}
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Switch checked={cur.published} onChange={(v) => set({ published: v })} label="Publié (visible du public)" />
            {saved ? <Badge tone={saved.published ? 'success' : 'warning'}>{saved.published ? 'En ligne' : 'Brouillon'}</Badge> : <Badge>Non rédigé</Badge>}
          </div>
          <Button shape="console" loading={busy} onClick={async () => {
            if (cur.published && !cur.text.trim()) { toast('Un texte vide ne peut pas être publié.', 'error'); return; }
            setBusy(true);
            try {
              await apiSend(`/admin/odu/${oduId}/domains/${tab}`, { text: cur.text, published: cur.published }, 'PUT', token);
              toast(cur.published ? 'Interprétation publiée.' : 'Brouillon enregistré, invisible du public.');
              reload();
            } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
          }}>Enregistrer ce domaine</Button>
        </div>
        <p className="text-[12px] text-text-faint">La plateforme ne dit jamais si l&apos;Odu est venu en ire ou en ibi : écris le texte de façon à ce qu&apos;il reste juste dans les deux cas, ou distingue-les explicitement.</p>
      </div>
    </Card>
  );
}
