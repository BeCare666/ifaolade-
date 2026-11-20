'use client';

import { ImageOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CloudinaryUpload } from '@/components/admin/editors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Badge, Card, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { DEFAULT_IMAGES } from '@/lib/default-images';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';

interface Slot { key: string; label: string; ratio: string; image: { url: string; alt: string | null; credit: string | null } | null }

/** REFONTE §8.1 : chaque image de la vitrine se remplace ici (envoi direct vers ton Cloudinary). */
export default function ImagesPage() {
  const { data, error, reload } = useApi<Slot[]>('/admin/site-images');
  return (
    <>
      <PageHeader
        title="Images du site"
        description="Chaque emplacement a une image de départ (Unsplash, licence libre). Remplace-la par la tienne : le site l'affiche sous 5 minutes. Le portrait du prêtre doit être ta vraie photo."
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Apparence' }, { label: 'Images' }]}
      />
      {error ? <ErrorState description={error} onRetry={reload} /> : !data ? <Skeleton className="h-96" /> : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{data.map((s) => <SlotCard key={s.key} s={s} onSaved={reload} />)}</div>
      )}
    </>
  );
}

function SlotCard({ s, onSaved }: { s: Slot; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [alt, setAlt] = useState(s.image?.alt ?? '');
  const [credit, setCredit] = useState(s.image?.credit ?? '');
  const [busy, setBusy] = useState(false);
  const starter = DEFAULT_IMAGES[s.key];
  const shown = s.image ?? starter ?? null;

  const save = async (url: string) => {
    setBusy(true);
    try {
      await apiSend(`/admin/site-images/${encodeURIComponent(s.key)}`, { url, alt: alt || undefined, credit: credit || undefined }, 'PUT', token);
      toast('Image enregistrée');
      onSaved();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10] bg-bg-subtle">
        {shown
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={shown.url} alt={shown.alt ?? ''} className="h-full w-full object-cover" />
          : <div className="grid h-full place-items-center text-text-faint"><ImageOff size={28} strokeWidth={1.3} /></div>}
        <span className="absolute left-3 top-3"><Badge tone={s.image ? 'success' : starter ? 'neutral' : 'warning'}>{s.image ? 'Ton image' : starter ? 'Image de départ' : 'À fournir'}</Badge></span>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-[15px] font-medium text-text">{s.label}</p>
          <p className="text-[12px] text-text-faint">Format conseillé {s.ratio} · clé <code>{s.key}</code></p>
          {!s.image && starter && <p className="mt-1 text-[12px] text-text-faint">Image de départ : {starter.credit}</p>}
        </div>
        <Input placeholder="Description de l'image (accessibilité)" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <Input placeholder="Crédit (photographe, source)" value={credit} onChange={(e) => setCredit(e.target.value)} />
        <div className="flex flex-wrap items-center gap-2">
          <CloudinaryUpload folder="ifaolade/site" accept="image/jpeg,image/png,image/webp" label={s.image ? 'Remplacer' : 'Envoyer une image'} token={token} onUploaded={({ url }) => save(url)} />
          {s.image && (
            <>
              <Button size="sm" variant="secondary" shape="console" loading={busy} onClick={() => save(s.image!.url)}>Enregistrer les textes</Button>
              <Button size="sm" variant="ghost" shape="console" onClick={async () => {
                try { await apiSend(`/admin/site-images/${encodeURIComponent(s.key)}`, undefined, 'DELETE', token); toast('Image retirée'); onSaved(); } catch (e) { toast((e as Error).message, 'error'); }
              }}><Trash2 size={14} /> Revenir à l'image de départ</Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
