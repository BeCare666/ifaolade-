'use client';

import { allOdu, oduById } from '@ona/core';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { Button, IconButton } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { apiSend } from '@/lib/api';
import { cn } from '@/lib/cn';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-̣ͯ]/g, '').toLowerCase();

/** Choix de l'Odu sorti parmi les 256 (recherche yoruba / fon), avec aperçu des marques. */
export function OduPicker({ value, onChange }: { value: number | null; onChange: (id: number) => void }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const n = norm(q.trim());
    return allOdu().filter((o) => !n || norm(o.name).includes(n) || norm(o.fonName).includes(n)).slice(0, 40);
  }, [q]);
  const current = value !== null ? oduById(value) : null;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher l'Odu : Ogbè Ọ̀yẹ̀kú, Gbè-Yɛ̀kú…" aria-label="Chercher un Odu" />
        <ul className="scrollbar-thin mt-2 max-h-64 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface">
          {list.map((o) => (
            <li key={o.id}>
              <button type="button" onClick={() => onChange(o.id)} className={cn('flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] transition-colors', value === o.id ? 'bg-primary-soft text-primary' : 'hover:bg-bg-subtle')}>
                <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} />
                <span className="flex-1">{o.name}</span>
                <span className="text-[12px] text-text-faint">{o.fonName}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface p-5 text-center">
        {current ? (
          <>
            <OduGlyph right={current.marks.right} left={current.marks.left} size="sm" label={current.name} />
            <p className="mt-3 text-[15px] text-text">{current.name}</p>
            <p className="text-[12px] text-text-faint">{current.fonName}</p>
          </>
        ) : <p className="text-[13px] text-text-faint">Aucun Odu choisi</p>}
      </div>
    </div>
  );
}

/** Liste de textes modifiable (plan d'action, ewọ̀). */
export function ListEditor({ items, onChange, placeholder, max = 12 }: { items: string[]; onChange: (v: string[]) => void; placeholder: string; max?: number }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 text-right text-[12px] tabular-nums text-text-faint">{i + 1}</span>
          <Input value={it} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} />
          <IconButton label="Retirer" type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 size={15} /></IconButton>
        </div>
      ))}
      {items.length < max && (
        <Button type="button" variant="ghost" size="sm" shape="console" onClick={() => onChange([...items, ''])}><Plus size={15} /> Ajouter</Button>
      )}
    </div>
  );
}

interface Signature { signature: string; apiKey: string; cloudName: string; timestamp: number; folder: string; [k: string]: string | number | undefined }

/** Envoi direct à Cloudinary avec signature de l'API (plan §14.3). Renvoie l'URL et l'identifiant public. */
export function CloudinaryUpload({
  folder, accept, label, token, onUploaded, signaturePath, className,
}: { folder: string; accept: string; label: string; token: string | null; onUploaded: (r: { url: string; publicId: string }) => void; signaturePath?: string; className?: string }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setProgress(0);
    try {
      const sig = await apiSend<Signature>(signaturePath ?? `/admin/media/signature?folder=${encodeURIComponent(folder)}`, undefined, 'GET', token);
      const kind = file.type.startsWith('video/') ? 'video' : 'image';
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('signature', sig.signature);
      // Tous les paramètres signés par l'API (dossier, horodatage, type, transformation imposée…) sont renvoyés tels quels.
      for (const [k, v] of Object.entries(sig)) if (!['signature', 'apiKey', 'cloudName'].includes(k) && v !== undefined) fd.append(k, String(v));
      const res = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/${kind}/upload`);
        xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => (xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error(JSON.parse(xhr.responseText)?.error?.message || 'Envoi refusé par Cloudinary')));
        xhr.onerror = () => reject(new Error('Cloudinary est injoignable.'));
        xhr.send(fd);
      });
      onUploaded({ url: res.secure_url, publicId: res.public_id });
      setProgress(null);
    } catch (e) {
      setError((e as Error).message);
      setProgress(null);
    }
  }

  return (
    <div className={className}>
      <label className={cn('inline-flex h-10 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-border-strong bg-surface px-4 text-[14px] text-text transition-colors hover:border-text-faint', progress !== null && 'pointer-events-none opacity-60')}>
        <Upload size={15} /> {progress !== null ? `Envoi… ${progress} %` : label}
        <input type="file" accept={accept} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
      </label>
      {progress !== null && <div className="mt-2 h-1 w-64 overflow-hidden rounded-full bg-bg-subtle"><div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div>}
      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
    </div>
  );
}
