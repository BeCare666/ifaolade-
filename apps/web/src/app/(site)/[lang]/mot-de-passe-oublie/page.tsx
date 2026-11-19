'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { AuthShell } from '@/components/site/auth-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/primitives';
import { apiSend } from '@/lib/api';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthShell overline="Mot de passe" title="Mot de passe oublié." text="Indique ton email : si un compte existe, tu recevras un lien valable une heure.">
      {sent ? (
        <p className="flex items-start gap-3 text-[15px] text-text"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success" />Si un compte existe pour {email}, un email vient de partir. Pense à regarder dans tes indésirables.</p>
      ) : (
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true); setError(null);
            try { await apiSend('/auth/forgot', { email }); setSent(true); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
          }}
        >
          <Field label="Email" htmlFor="email"><Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          {error && <ErrorState description={error} />}
          <Button type="submit" size="lg" loading={busy} className="w-full">Recevoir le lien</Button>
        </form>
      )}
    </AuthShell>
  );
}
