'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { Card, CardHeader, ErrorState, PageHeader, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';

interface Setting { key: string; label: string; hint: string; value: string | number; default: string | number }
const FONTS = ['Inter', 'Manrope', 'DM Sans', 'Work Sans', 'IBM Plex Sans', 'Source Sans 3', 'Nunito Sans', 'Poppins'];
const SAMPLE = 'Ọ̀rúnmìlà · Ọ̀ṣẹ́ Òtúrá · Ìwòrì Méjì · Kpɔ̀lí · Èṣù';

/** Étape 2.1 : Admin › Paramètres (police, taux FCFA, acompte). Chaque changement est inscrit au journal d'audit. */
export default function ParametresPage() {
  const { data, error, reload } = useApi<Setting[]>('/admin/settings');
  return (
    <>
      <PageHeader title="Paramètres" description="Chaque modification est inscrite au journal d'audit." breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Paramètres' }]} />
      {error ? <ErrorState description={error} onRetry={reload} /> : !data ? <Skeleton className="h-64" /> : (
        <div className="max-w-3xl space-y-6">{data.map((s) => <SettingCard key={s.key} s={s} onSaved={reload} />)}</div>
      )}
    </>
  );
}

function SettingCard({ s, onSaved }: { s: Setting; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const [value, setValue] = useState(String(s.value));
  const [busy, setBusy] = useState(false);
  const isFont = s.key === 'site.font';
  useEffect(() => {
    if (!isFont || value === 'Inter') return;
    const id = 'font-preview';
    document.getElementById(id)?.remove();
    const l = Object.assign(document.createElement('link'), { id, rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(value)}:wght@400;500;600&display=swap` });
    document.head.appendChild(l);
  }, [isFont, value]);

  return (
    <Card>
      <CardHeader title={s.label} description={s.hint} />
      <div className="space-y-4 p-5">
        {isFont ? (
          <>
            <Field label="Police" htmlFor={s.key}>
              <Select id={s.key} value={value} onChange={(e) => setValue(e.target.value)}>{FONTS.map((f) => <option key={f}>{f}</option>)}</Select>
            </Field>
            <div className="rounded-[var(--radius-md)] border border-border p-4" style={{ fontFamily: `'${value}', sans-serif` }}>
              <p className="text-[28px] tracking-[-0.02em] text-text">La vérité d&apos;Ifá</p>
              <p className="mt-1 text-[15px] text-text-muted">{SAMPLE}</p>
            </div>
            <p className="text-[12px] text-text-faint">Vérifie que les accents et points souscrits yoruba s&apos;affichent correctement avant d&apos;enregistrer.</p>
          </>
        ) : (
          <Field label="Valeur" htmlFor={s.key} hint={`Par défaut : ${s.default}`}>
            <Input id={s.key} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
        )}
        <Button shape="console" size="sm" loading={busy} disabled={value === String(s.value)} onClick={async () => {
          setBusy(true);
          try {
            const v = isFont ? value : Number(value.replace(',', '.'));
            await apiSend(`/admin/settings/${encodeURIComponent(s.key)}`, { value: v }, 'PUT', token);
            toast(isFont ? 'Police enregistrée : le site l\'affiche sous 5 minutes' : 'Paramètre enregistré');
            onSaved();
          } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
        }}>Enregistrer</Button>
      </div>
    </Card>
  );
}
