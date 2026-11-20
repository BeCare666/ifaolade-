'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/primitives';
import { useI18n } from '@/i18n/client';
import { safeNext, useAuth } from '@/lib/auth';

export function RegisterForm({ next, portrait }: { next?: string; portrait?: string }) {
  const { register } = useAuth();
  const router = useRouter();
  const { d: D, href } = useI18n();
  const d = D.auth;
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', country: '' });
  const [cgu, setCgu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Pré-remplit le prénom depuis le portrait en cours (stocké seulement dans ce navigateur).
  useEffect(() => {
    try {
      const dr = JSON.parse(localStorage.getItem('ifaolade:portrait-draft') || '{}');
      if (dr?.firstName) setForm((f) => ({ ...f, firstName: f.firstName || dr.firstName, lastName: f.lastName || dr.lastName || '' }));
    } catch { /* rien */ }
  }, []);

  const qs = new URLSearchParams({ ...(next ? { suite: next } : {}), ...(portrait ? { portrait } : {}) }).toString();
  const [before, mid] = d.accept.split('{cgv}');
  const [middle, after] = (mid ?? '').split('{privacy}');

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!cgu) { setError(d.acceptError); return; }
        setBusy(true);
        setError(null);
        try {
          const r = await register({
            email: form.email, password: form.password, firstName: form.firstName,
            lastName: form.lastName || undefined, country: form.country || undefined, readingId: portrait || undefined,
          });
          // L'adresse n'est jamais mise dans l'URL : elle reste dans ce navigateur, le temps de la confirmation.
          try { sessionStorage.setItem('ifaolade:pending-email', r.email); } catch { /* navigation privée */ }
          const after = portrait ? `/connais-toi/portrait/${portrait}` : safeNext(next);
          router.push(href(`/verifier-email/envoye?suite=${encodeURIComponent(after)}`));
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={d.firstName} htmlFor="firstName"><Input id="firstName" required autoComplete="given-name" value={form.firstName} onChange={set('firstName')} /></Field>
        <Field label={d.lastName} htmlFor="lastName"><Input id="lastName" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} /></Field>
      </div>
      <Field label={d.email} htmlFor="email"><Input id="email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} /></Field>
      <Field label={d.password} htmlFor="password" hint={d.passwordHint}>
        <Input id="password" type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set('password')} />
      </Field>
      <Field label={d.country} htmlFor="country" hint={d.countryHint}>
        <Input id="country" autoComplete="country-name" value={form.country} onChange={set('country')} placeholder={d.countryPlaceholder} />
      </Field>
      <Checkbox
        checked={cgu} onChange={setCgu}
        label={<>{before}<Link href={href('/cgv')} className="text-primary underline underline-offset-4">{d.cgvLink}</Link>{middle}<Link href={href('/confidentialite')} className="text-primary underline underline-offset-4">{d.privacyLink}</Link>{after}</>}
      />
      {error && <ErrorState title={d.registerError} description={error} />}
      <Button type="submit" size="lg" loading={busy} className="w-full">{d.submit}</Button>
      <p className="text-[14px] text-text-muted">{d.already} <Link href={href(`/connexion${qs ? `?${qs}` : ''}`)} className="text-primary hover:underline">{d.login}</Link></p>
    </form>
  );
}
