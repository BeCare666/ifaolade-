'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/primitives';
import { useI18n } from '@/i18n/client';
import { apiSend } from '@/lib/api';
import { safeNext, useAuth } from '@/lib/auth';

export function LoginForm({ next, portrait }: { next?: string; portrait?: string }) {
  const { login } = useAuth();
  const router = useRouter();
  const { d: D, href } = useI18n();
  const d = D.auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qs = new URLSearchParams({ ...(next ? { suite: next } : {}), ...(portrait ? { portrait } : {}) }).toString();

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const session = await login(email, password);
          if (portrait) {
            await apiSend(`/readings/${portrait}/claim`, {}, 'POST', session.token).catch(() => undefined);
            router.push(href(`/connais-toi/portrait/${portrait}`));
          } else {
            router.push(safeNext(next));
          }
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <Field label={d.email} htmlFor="email"><Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label={d.password} htmlFor="password"><Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      {error && <ErrorState title={d.loginError} description={error} />}
      <Button type="submit" size="lg" loading={busy} className="w-full">{d.login}</Button>
      <div className="flex flex-col gap-2 text-[14px] text-text-muted sm:flex-row sm:justify-between">
        <Link href={href('/mot-de-passe-oublie')} className="hover:text-text">{d.forgot}</Link>
        <Link href={href(`/inscription${qs ? `?${qs}` : ''}`)} className="text-primary hover:underline">{d.create}</Link>
      </div>
    </form>
  );
}
