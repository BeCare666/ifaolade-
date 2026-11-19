'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/primitives';
import { apiSend } from '@/lib/api';

export function ResetForm({ token }: { token: string }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : 'Lien incomplet : redemande un email depuis « Mot de passe oublié ».');

  if (done) {
    return (
      <div>
        <p className="flex items-center gap-3 text-[16px] text-text"><CheckCircle2 size={20} className="text-success" /> Ton mot de passe est changé.</p>
        <div className="mt-8"><ButtonLink href="/connexion">Se connecter</ButtonLink></div>
      </div>
    );
  }
  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pw !== pw2) { setError('Les deux mots de passe ne sont pas identiques.'); return; }
        setBusy(true); setError(null);
        try { await apiSend('/auth/reset', { token, password: pw }); setDone(true); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
      }}
    >
      <Field label="Nouveau mot de passe" htmlFor="pw" hint="8 caractères minimum"><Input id="pw" type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <Field label="Confirme-le" htmlFor="pw2"><Input id="pw2" type="password" required minLength={8} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
      {error && <ErrorState description={error} />}
      <Button type="submit" size="lg" loading={busy} disabled={!token} className="w-full">Enregistrer</Button>
    </form>
  );
}
