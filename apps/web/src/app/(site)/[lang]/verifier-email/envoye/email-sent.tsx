'use client';

import { MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, buttonClass } from '@/components/ui/button';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { apiSend } from '@/lib/api';

export function EmailSent({ next }: { next?: string }) {
  const { d: D, href } = useI18n();
  const d = D.auth;
  const [email, setEmail] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { try { setEmail(sessionStorage.getItem('ifaolade:pending-email')); } catch { /* rien */ } }, []);
  const login = href(`/connexion${next ? `?suite=${encodeURIComponent(next)}` : ''}`);

  return (
    <div>
      <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary"><MailCheck size={28} strokeWidth={1.5} /></span>
      <p className="mt-6 text-[16px] leading-[1.75] text-text">{tpl(d.sentText, { email: email ?? '…' })}</p>
      <p className="mt-3 text-[14px] text-text-muted">{d.sentSpam}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={login} className={buttonClass({})}>{d.sentLogin}</Link>
        {email && (resent
          ? <p className="self-center text-[14px] text-success">{d.resent}</p>
          : <Button variant="secondary" loading={busy} onClick={async () => {
              setBusy(true);
              await apiSend('/auth/resend', { email }).catch(() => undefined);
              setResent(true); setBusy(false);
            }}>{d.resend}</Button>)}
      </div>
    </div>
  );
}
