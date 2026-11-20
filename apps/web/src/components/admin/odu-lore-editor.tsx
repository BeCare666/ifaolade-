'use client';

import { defaultLore, type BirthLore, type LoreOverride, type Odu, type OduLore } from '@ona/core';
import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Badge, Card } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Form = Record<string, string>;
const LISTS: (keyof OduLore)[] = ['orisha', 'vodun', 'lessons'];
const BIRTH_LISTS: (keyof BirthLore)[] = ['todo', 'avoid', 'eat', 'noEat', 'divinities', 'colors'];

const toForm = (l: OduLore): Form => ({
  oriki: l.oriki,
  ...Object.fromEntries(LISTS.map((k) => [k, (l[k] as string[]).join('\n')])),
  'birth.nature': l.birth.nature,
  'birth.path': l.birth.path,
  ...Object.fromEntries(BIRTH_LISTS.map((k) => [`birth.${k}`, (l.birth[k] as string[]).join('\n')])),
});
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

/** Ne garde que ce qui diffère du texte de départ : un texte de départ amélioré plus tard profite aux champs non modifiés. */
function diff(form: Form, base: OduLore): LoreOverride {
  const out: LoreOverride = {};
  const birth: Partial<BirthLore> = {};
  if (form.oriki.trim() && form.oriki.trim() !== base.oriki) out.oriki = form.oriki.trim();
  for (const k of LISTS) { const v = lines(form[k]); if (v.length && v.join('\n') !== (base[k] as string[]).join('\n')) (out as Record<string, unknown>)[k] = v; }
  for (const k of ['nature', 'path'] as const) { const v = form[`birth.${k}`].trim(); if (v && v !== base.birth[k]) birth[k] = v; }
  for (const k of BIRTH_LISTS) { const v = lines(form[`birth.${k}`]); if (v.length && v.join('\n') !== (base.birth[k] as string[]).join('\n')) (birth as Record<string, unknown>)[k] = v; }
  if (Object.keys(birth).length) out.birth = birth;
  return out;
}

const FIELDS: { key: string; label: string; hint?: string; rows: number }[] = [
  { key: 'oriki', label: 'Éloge', rows: 4 },
  { key: 'orisha', label: 'Òrìṣà qui parlent dans cet Odu', hint: 'Un par ligne', rows: 3 },
  { key: 'vodun', label: 'Vodun qui parlent dans cet Odu (Fá)', hint: 'Un par ligne', rows: 3 },
  { key: 'lessons', label: 'Leçons de vie', hint: 'Une par ligne', rows: 5 },
];
const BIRTH_FIELDS: { key: string; label: string; hint?: string; rows: number }[] = [
  { key: 'birth.nature', label: 'Ce que la personne est', rows: 4 },
  { key: 'birth.path', label: 'Ce qui se dessine pour sa vie', hint: 'Des tendances, jamais une promesse (règle 4.6)', rows: 4 },
  { key: 'birth.todo', label: 'Ce qu’elle doit faire', hint: 'Un point par ligne', rows: 4 },
  { key: 'birth.avoid', label: 'Ce qu’elle doit éviter', hint: 'Un point par ligne', rows: 4 },
  { key: 'birth.eat', label: 'Ce qu’il lui est conseillé de manger', hint: 'Un aliment par ligne', rows: 4 },
  { key: 'birth.noEat', label: 'Interdits alimentaires (èèwọ̀)', hint: 'Un par ligne', rows: 4 },
  { key: 'birth.divinities', label: 'Divinités à honorer', hint: 'Une par ligne', rows: 3 },
  { key: 'birth.colors', label: 'Couleurs', hint: 'Une par ligne (Blanc, Rouge, Noir, Vert, Jaune, Bleu, Brun, Ocre, Bordeaux, Ambre ont une pastille)', rows: 3 },
];

export function OduLoreEditor({ odu, lore, override, onSaved }: { odu: Odu; lore: OduLore; override: LoreOverride | null; onSaved: () => void }) {
  const { token } = useAuth();
  const toast = useToast();
  const base = useMemo(() => defaultLore(odu), [odu]);
  const [form, setForm] = useState<Form>(() => toForm(lore));
  const [busy, setBusy] = useState(false);
  useEffect(() => { setForm(toForm(lore)); }, [lore]);
  const custom = !!override && Object.keys(override).length > 0;

  const send = async (payload: LoreOverride | null, msg: string) => {
    setBusy(true);
    try {
      await apiSend(`/admin/odu/${odu.id}`, { lore: payload }, 'PUT', token);
      toast(msg);
      onSaved();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  };
  const area = (f: { key: string; label: string; hint?: string; rows: number }) => (
    <Field key={f.key} label={f.label} htmlFor={`lore-${f.key}`} hint={f.hint}>
      <Textarea id={`lore-${f.key}`} rows={f.rows} value={form[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
    </Field>
  );

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[16px] font-medium text-text">Contenu traditionnel</p>
          <p className="text-[13px] text-text-muted">{odu.isMeji ? 'Texte de départ propre à ce Méjì.' : `Texte de départ composé de ${odu.right.name} (qui gouverne) et ${odu.left.name} (qui nuance).`} Un champ vidé reprend le texte de départ.</p>
        </div>
        <Badge tone={custom ? 'success' : 'neutral'}>{custom ? 'Modifié par toi' : 'Texte de départ'}</Badge>
      </div>
      <div className="mt-6 space-y-5">{FIELDS.map(area)}</div>
      <p className="mt-10 border-t border-border pt-6 text-[15px] font-medium text-text">Quand cet Odu est le signe de naissance</p>
      <p className="mt-1 text-[13px] text-text-muted">Affiché sur la fiche publique et dans le portrait, avec la mention « signature symbolique, ne remplace pas le Kpɔ̀lí ».</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2">{BIRTH_FIELDS.map(area)}</div>
      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
        {custom && (
          <Button variant="ghost" shape="console" disabled={busy} onClick={() => send(null, 'Texte de départ rétabli')}><RotateCcw size={14} /> Revenir au texte de départ</Button>
        )}
        <Button shape="console" loading={busy} onClick={() => {
          const d = diff(form, base);
          send(Object.keys(d).length ? d : null, 'Contenu traditionnel enregistré. La fiche publique se met à jour sous 10 minutes.');
        }}>Enregistrer</Button>
      </div>
    </Card>
  );
}
