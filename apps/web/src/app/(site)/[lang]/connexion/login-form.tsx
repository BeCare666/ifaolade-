'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/primitives';
import { useI18n } from '@/i18n/client';
import { ApiError, apiSend } from '@/lib/api';
import { safeNext, useAuth } from '@/lib/auth';

export function LoginForm({ next, portrait, staffOnly = false }: { next?: string; portrait?: string; staffOnly?: boolean }) {
  const { login, logout } = useAuth();
  const router = useRouter();
  const { d: D, href } = useI18n();
  const d = D.auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);
  const qs = new URLSearchParams({ ...(next ? { suite: next } : {}), ...(portrait ? { portrait } : {}) }).toString();

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          setUnverified(false);
          const session = await login(email, password);
          const staff = session.user.role === 'ADMIN' || session.user.role === 'PRIEST';
          if (staffOnly && !staff) { await logout(); setError(d.consoleDenied); setBusy(false); return; }
          if (staff && (staffOnly || !next)) { router.push(next && next.startsWith('/admin') ? next : '/admin'); return; }
          if (portrait) {
            await apiSend(`/readings/${portrait}/claim`, {}, 'POST', session.token).catch(() => undefined);
            router.push(href(`/connais-toi/portrait/${portrait}`));
          } else {
            router.push(safeNext(next));
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 403) setUnverified(true);
          else setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <Field label={d.email} htmlFor="email"><Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label={d.password} htmlFor="password"><Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      {unverified && (
        <Alert tone="warning" title={d.notVerifiedTitle}>
          {d.notVerifiedText}{' '}
          {resent ? <strong>{d.resent}</strong> : (
            <button type="button" className="font-medium underline underline-offset-4" onClick={async () => {
              await apiSend('/auth/resend', { email }).catch(() => undefined);
              setResent(true);
            }}>{d.resend}</button>
          )}
        </Alert>
      )}
      {error && <ErrorState title={d.loginError} description={error} />}
      <Button type="submit" size="lg" loading={busy} className="w-full">{d.login}</Button>
      <div className="flex flex-col gap-2 text-[14px] text-text-muted sm:flex-row sm:justify-between">
        <Link href={href('/mot-de-passe-oublie')} className="hover:text-text">{d.forgot}</Link>
        <Link href={href(`/inscription${qs ? `?${qs}` : ''}`)} className="text-primary hover:underline">{d.create}</Link>
      </div>
    </form>
  );
}
