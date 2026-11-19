'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/primitives';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { apiSend } from '@/lib/api';

export function ContactForm() {
  const { d: D } = useI18n();
  const d = D.contact;
  const [form, setForm] = useState({ name: '', email: '', subject: d.subjects[0], message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (sent) {
    return (
      <div className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-8">
        <CheckCircle2 className="mt-1 shrink-0 text-success" size={22} />
        <div>
          <p className="text-card-title text-text">{d.sentTitle}</p>
          <p className="mt-2 text-[15px] text-text-muted">{tpl(d.sentText, { name: form.name, email: form.email })}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try { await apiSend('/contact', form); setSent(true); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={d.name} htmlFor="name"><Input id="name" required minLength={2} value={form.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label={d.email} htmlFor="email"><Input id="email" type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></Field>
      </div>
      <Field label={d.subject} htmlFor="subject">
        <Select id="subject" value={form.subject} onChange={set('subject')}>{d.subjects.map((s) => <option key={s}>{s}</option>)}</Select>
      </Field>
      <Field label={d.message} htmlFor="message" hint={d.messageHint}>
        <Textarea id="message" required minLength={10} rows={7} value={form.message} onChange={set('message')} />
      </Field>
      {error && <ErrorState title={d.errorTitle} description={error} />}
      <Button type="submit" size="lg" loading={busy}>{d.send}</Button>
    </form>
  );
}
