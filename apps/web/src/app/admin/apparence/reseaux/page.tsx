'use client';

import { AtSign, MapPin } from 'lucide-react';
import { useState } from 'react';
import { siFacebook, siInstagram, siTiktok, siWhatsapp, siX, siYoutube, type SimpleIcon } from 'simple-icons';
import { BrandIcon } from '@/components/brand/social-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Card, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';

interface Setting { key: string; label: string; hint: string; type: string; value: string | number }

const ICONS: Record<string, SimpleIcon | 'email' | 'place'> = {
  'social.facebook': siFacebook, 'social.instagram': siInstagram, 'social.youtube': siYoutube, 'social.tiktok': siTiktok,
  'social.x': siX, 'contact.whatsapp': siWhatsapp, 'contact.email': 'email', 'contact.place': 'place',
};

/** REFONTE §8.3 : réseaux sociaux et contacts affichés dans l'en-tête, le menu mobile et le pied de page. */
export default function ReseauxPage() {
  const { data, error, reload } = useApi<Setting[]>('/admin/settings');
  const rows = data?.filter((s) => s.key.startsWith('social.') || s.key.startsWith('contact.'));
  return (
    <>
      <PageHeader
        title="Réseaux et contacts"
        description="Une icône n'apparaît sur le site que si son lien est renseigné. Chaque modification est inscrite au journal d'audit."
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Apparence' }, { label: 'Réseaux et contacts' }]}
      />
      {error ? <ErrorState description={error} onRetry={reload} /> : !rows ? <Skeleton className="h-96" /> : (
        <Card className="max-w-3xl divide-y divide-border">{rows.map((s) => <Row key={s.key} s={s} onSaved={reload} />)}</Card>
      )}
    </>
  );
}

function Row({ s, onSaved }: { s: Setting; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [v, setV] = useState(String(s.value ?? ''));
  const [busy, setBusy] = useState(false);
  const icon = ICONS[s.key];
  return (
    <div className="grid items-center gap-4 p-5 sm:grid-cols-[44px_minmax(0,1fr)_auto]">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-soft text-primary">
        {icon === 'email' ? <AtSign size={18} /> : icon === 'place' ? <MapPin size={18} /> : icon ? <BrandIcon icon={icon} size={17} /> : null}
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-text">{s.label}</p>
        <Input className="mt-2" value={v} onChange={(e) => setV(e.target.value)} placeholder={s.hint} />
        <p className="mt-1 text-[12px] text-text-faint">{s.hint}</p>
      </div>
      <Button size="sm" shape="console" disabled={v === String(s.value ?? '')} loading={busy} onClick={async () => {
        setBusy(true);
        try { await apiSend(`/admin/settings/${encodeURIComponent(s.key)}`, { value: v.trim() }, 'PUT', token); toast('Enregistré'); onSaved(); }
        catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
      }}>Enregistrer</Button>
    </div>
  );
}
