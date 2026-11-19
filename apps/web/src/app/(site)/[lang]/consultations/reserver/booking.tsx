'use client';

import { ArrowLeft, ArrowRight, CalendarPlus, Check, ChevronLeft, ChevronRight, CreditCard, PenLine, Smartphone, Video } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { btTime, localTime } from '@/components/consultation/parts';
import { Alert } from '@/components/ui/alert';
import { Button, ButtonLink, buttonClass } from '@/components/ui/button';
import { Checkbox, Field, Textarea } from '@/components/ui/field';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/primitives';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn, eur, fcfa } from '@/lib/cn';
import { startPayment, type Provider } from '@/lib/payments';
import type { Consultation, Offer, Slot } from '@/lib/types';
import { useApi } from '@/lib/use-api';

/*
 * Réservation (plan, étape 5.1 bis), sur le modèle de la prise de rendez-vous d'edoto :
 * 1. Consultation  2. Date et heure (grille de la semaine)  3. Ta question  4. Confirmation (ou paiement).
 * Tout se choisit AVANT la connexion : le brouillon est gardé 30 minutes dans le navigateur et repris après.
 * Les heures sont celles du Bénin (Africa/Porto-Novo) ; l'heure locale de la personne est indiquée dessous.
 */

const TZ = 'Africa/Porto-Novo';
const DRAFT_KEY = 'ifaolade_booking_draft';
const STEPS = ['Consultation', 'Date et heure', 'Ta question', 'Confirmation'] as const;
type Step = 0 | 1 | 2 | 3;

interface Draft { code?: string; written: boolean; slotId: string | null; question: string; context: string; readingId?: string; saved: number }
const saveDraft = (d: Omit<Draft, 'saved'>) => { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, saved: Date.now() })); } catch { /* navigation privée */ } };
const readDraft = (): Draft | null => {
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null') as Draft | null;
    return d && Date.now() - d.saved < 30 * 60_000 ? d : null;
  } catch { return null; }
};
const clearDraft = () => { try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* rien */ } };

// Jours au format AAAA-MM-JJ, à l'heure du Bénin
const dayKey = (iso: string | Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const addDay = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const mondayOf = (d: string) => addDay(d, -((new Date(`${d}T00:00:00Z`).getUTCDay() + 6) % 7));
const dayFmt = (d: string, opts: Intl.DateTimeFormatOptions) => new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', { timeZone: 'UTC', ...opts });
const benHour = (iso: string) => Number(new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', hour12: false }).format(new Date(iso)).slice(0, 2));

function groupTimes(list: Slot[]) {
  const g: Record<string, Slot[]> = { Matin: [], 'Après-midi': [], Soir: [] };
  for (const s of list) { const h = benHour(s.startsAt); (h < 12 ? g.Matin : h < 17 ? g['Après-midi'] : g.Soir).push(s); }
  return Object.entries(g).filter(([, v]) => v.length);
}

function downloadIcs(c: Consultation) {
  if (!c.slot) return;
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const space = `${window.location.origin}/espace/consultations/${c.id}`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ifaolade//Consultation//FR', 'BEGIN:VEVENT',
    `UID:${c.id}@ifaolade`, `DTSTAMP:${fmt(new Date().toISOString())}`, `DTSTART:${fmt(c.slot.startsAt)}`, `DTEND:${fmt(c.slot.endsAt)}`,
    `SUMMARY:Consultation d'Ifá (${c.offer.title})`,
    `DESCRIPTION:La salle de visio s'ouvre 10 minutes avant dans ton espace : ${space}`, `URL:${space}`,
    'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:Consultation dans 15 minutes', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
  a.download = `consultation-ifaolade.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function Booking({ initialOffer, readingId: initialReading }: { initialOffer?: string; readingId?: string }) {
  const { token, user, ready, refresh } = useAuth();
  const offers = useApi<Offer[]>('/offers');
  const [to] = useState(() => new Date(Date.now() + 60 * 86_400_000).toISOString());
  const slots = useApi<Slot[]>(`/slots?to=${encodeURIComponent(to)}`);

  const [step, setStep] = useState<Step>(0);
  const [code, setCode] = useState<string | undefined>(initialOffer);
  const [written, setWritten] = useState(false); // consultation offerte : par écrit
  const [slotId, setSlotId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [readingId, setReadingId] = useState<string | undefined>(initialReading);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Consultation | null>(null);
  const [paying, setPaying] = useState<Provider | null>(null);
  const [week, setWeek] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);

  useEffect(() => { if (user) refresh(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Retour de la connexion : le brouillon est repris (le consentement, lui, se coche à nouveau).
  useEffect(() => {
    if (!ready || !user) return;
    const d = readDraft();
    if (!d) return;
    setCode(d.code); setWritten(d.written); setSlotId(d.slotId); setQuestion(d.question); setContext(d.context); setReadingId(d.readingId);
    clearDraft();
    setStep(2);
  }, [ready, user]);

  const offer = offers.data?.find((o) => o.code === code);
  const needsSlot = !!offer && (offer.requiresSlot || (offer.isFree && !written));
  const slot = slots.data?.find((s) => s.id === slotId) ?? null;

  // Créneaux par jour, semaine affichée (lundi à dimanche)
  const byDay = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots.data ?? []) { const k = dayKey(s.startsAt); m.set(k, [...(m.get(k) ?? []), s]); }
    return m;
  }, [slots.data]);
  const firstDay = slots.data?.length ? dayKey(slots.data[0].startsAt) : null;
  const lastDay = slots.data?.length ? dayKey(slots.data[slots.data.length - 1].startsAt) : null;
  useEffect(() => {
    if (!firstDay || week) return;
    const sel = slot ? dayKey(slot.startsAt) : firstDay;
    setWeek(mondayOf(sel)); setDay(sel);
  }, [firstDay, week, slot]);
  const weekDays = week ? Array.from({ length: 7 }, (_, i) => addDay(week, i)) : [];
  const thisMonday = mondayOf(dayKey(new Date()));
  const canPrev = !!week && week > thisMonday;
  const canNext = !!week && !!lastDay && addDay(week, 7) <= lastDay;
  const shiftWeek = (n: number) => {
    if (!week) return;
    const w = addDay(week, 7 * n);
    setWeek(w);
    setDay(Array.from({ length: 7 }, (_, i) => addDay(w, i)).find((x) => byDay.has(x)) ?? w);
  };

  const go = (s: Step) => { setError(null); setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const nextFromOffer = () => {
    if (!offer) return setError('Choisis une consultation.');
    go(needsSlot ? 1 : 2);
  };
  const nextFromDate = () => (slotId ? go(2) : setError('Choisis une heure.'));

  async function submit() {
    if (!offer) return go(0);
    if (needsSlot && !slotId) return go(1);
    if (question.trim().length < 5) return setError('Écris ta question.');
    if (!user) return; // le bloc de connexion est affiché à la place du bouton
    if (!consent) return setError('Coche la case de consentement.');
    setBusy(true); setError(null);
    try {
      const c = await apiSend<Consultation>('/consultations', {
        offerCode: offer.code, slotId: needsSlot ? slotId : undefined, question, context: context || undefined,
        readingId: readingId || undefined, consent: true,
      }, 'POST', token);
      setCreated(c);
      go(3);
    } catch (e) {
      setError((e as Error).message);
      slots.reload();
    } finally { setBusy(false); }
  }

  async function pay(provider: Provider) {
    if (!created) return;
    setPaying(provider); setError(null);
    try { await startPayment('CONSULTATION', created.id, provider, token); } catch (e) { setError((e as Error).message); setPaying(null); }
  }

  const suite = `/consultations/reserver${code ? `?offre=${code}` : ''}`;
  const toAuth = (path: '/connexion' | '/inscription') => {
    saveDraft({ code, written, slotId, question, context, readingId });
    window.location.assign(`${path}?suite=${encodeURIComponent(suite)}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-overline">Réservation</p>
          <h1 className="mt-4 text-[34px] font-normal leading-[1.05] tracking-[-0.035em] text-text lg:text-[42px]">Réserve ta consultation.</h1>
        </div>
        <Steps current={step} skipDate={!!offer && !needsSlot} />
      </div>

      {/* Récapitulatif de ce qui est déjà choisi */}
      {step > 0 && step < 3 && offer && (
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[var(--radius-lg)] border border-border bg-surface px-5 py-4 text-[14px]">
          <span className="text-text">{offer.title}</span>
          <span className="tabular-nums text-text-muted">{offer.isFree ? 'Offerte' : eur(offer.priceCents, offer.currency)}</span>
          {offer.isFree && <span className="text-text-muted">{written ? 'Par écrit' : 'En visio'}</span>}
          {slot && <span className="tabular-nums text-text-muted">{btTime(slot.startsAt, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} (Bénin)</span>}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="mt-10">
          {/* 1. Consultation */}
          {step === 0 && (
            <section>
              <h2 className="text-card-title text-text">Quelle consultation ?</h2>
              <div className="mt-6">
                {offers.loading ? <Skeleton className="h-40 w-full" /> : offers.error ? <ErrorState description={offers.error} onRetry={offers.reload} /> : (
                  <div className="grid gap-3">
                    {offers.data!.map((o) => (
                      <button
                        key={o.id} type="button" aria-pressed={code === o.code}
                        onClick={() => { setCode(o.code); setSlotId(null); setError(null); }}
                        className={cn('flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border p-5 text-left transition-colors', code === o.code ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:border-border-strong')}
                      >
                        <span className="flex items-center gap-4">
                          <Radio on={code === o.code} />
                          <span>
                            <span className="block text-[16px] text-text">{o.title}</span>
                            <span className="block text-[13px] text-text-faint">{o.durationMin} minutes</span>
                          </span>
                        </span>
                        <span className="text-right tabular-nums">
                          <span className="block text-[18px] text-text">{o.isFree ? 'Offerte' : eur(o.priceCents, o.currency)}</span>
                          {!o.isFree && <span className="block text-[12px] text-text-faint">{fcfa(o.priceCents)}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {offer?.isFree && (
                <div className="mt-6">
                  <p className="text-[14px] text-text-muted">Comment veux-tu la recevoir ?</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ModeButton active={!written} icon={Video} title="En visio" text="Sur un créneau, 20 minutes" onClick={() => setWritten(false)} />
                    <ModeButton active={written} icon={PenLine} title="Par écrit" text="Réponse dans ton espace sous 72 h" onClick={() => { setWritten(true); setSlotId(null); }} />
                  </div>
                </div>
              )}
              <Nav error={error} right={<Button onClick={nextFromOffer} disabled={!offer}>Continuer <ArrowRight size={16} /></Button>} left={<Link href="/consultations" className="text-[14px] text-text-muted hover:text-text">Retour aux consultations</Link>} />
            </section>
          )}

          {/* 2. Date et heure */}
          {step === 1 && (
            <section>
              <h2 className="text-card-title text-text">Choisis ton heure</h2>
              <p className="mt-2 text-[14px] text-text-muted">Heures du Bénin (UTC+1). Ton heure locale est indiquée sous chaque horaire.</p>
              <div className="mt-6">
                {slots.loading ? <Skeleton className="h-64 w-full" /> : slots.error ? <ErrorState description={slots.error} onRetry={slots.reload} /> : !slots.data?.length || !week ? (
                  <EmptyState title="Aucun créneau disponible pour le moment" description="De nouveaux créneaux sont ouverts chaque semaine. Écris-nous si c'est urgent." action={<ButtonLink href="/contact" variant="secondary" size="sm">Nous écrire</ButtonLink>} />
                ) : (
                  <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-text-faint">Semaine</p>
                        <p className="mt-1 text-[15px] text-text">{dayFmt(weekDays[0], { day: 'numeric', month: 'long' })} au {dayFmt(weekDays[6], { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="flex gap-2">
                        <WeekArrow label="Semaine précédente" disabled={!canPrev} onClick={() => shiftWeek(-1)}><ChevronLeft size={17} /></WeekArrow>
                        <WeekArrow label="Semaine suivante" disabled={!canNext} onClick={() => shiftWeek(1)}><ChevronRight size={17} /></WeekArrow>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-7 gap-1.5">
                      {weekDays.map((dd) => {
                        const n = byDay.get(dd)?.length ?? 0;
                        const on = dd === day;
                        return (
                          <button
                            key={dd} type="button" disabled={!n} onClick={() => setDay(dd)} aria-pressed={on}
                            aria-label={`${dayFmt(dd, { weekday: 'long', day: 'numeric', month: 'long' })}, ${n} heure${n > 1 ? 's' : ''} libre${n > 1 ? 's' : ''}`}
                            className={cn('flex flex-col items-center rounded-[var(--radius-md)] border py-2.5 transition',
                              on ? 'border-primary bg-primary text-primary-foreground' : n ? 'border-border bg-bg hover:border-text-faint' : 'border-transparent text-text-faint opacity-50')}
                          >
                            <span className="text-[11px] uppercase tracking-[0.08em]">{dayFmt(dd, { weekday: 'short' }).replace('.', '')}</span>
                            <span className="mt-0.5 text-[17px] tabular-nums">{dayFmt(dd, { day: 'numeric' })}</span>
                            <span className={cn('mt-1 h-1 w-1 rounded-full', n ? (on ? 'bg-primary-foreground' : 'bg-accent') : 'bg-transparent')} />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 min-h-[8rem]">
                      {day && byDay.get(day)?.length ? (
                        <>
                          <p className="text-[14px] capitalize text-text">{dayFmt(day, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                          <div className="mt-4 space-y-5">
                            {groupTimes(byDay.get(day)!).map(([label, list]) => (
                              <div key={label}>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-text-faint">{label}</p>
                                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                                  {list.map((s) => {
                                    const on = slotId === s.id;
                                    return (
                                      <button
                                        key={s.id} type="button" aria-pressed={on} onClick={() => { setSlotId(s.id); setError(null); }}
                                        className={cn('rounded-[var(--radius-md)] border py-2 text-center transition-colors', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong bg-surface hover:border-text-faint')}
                                      >
                                        <span className="block text-[14px] tabular-nums">{btTime(s.startsAt, { timeStyle: 'short' })}</span>
                                        <span className={cn('block text-[10px] tabular-nums', on ? 'text-primary-foreground/70' : 'text-text-faint')}>chez toi {localTime(s.startsAt)}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : <p className="text-[14px] text-text-faint">Aucune heure libre ce jour-là.</p>}
                    </div>
                  </div>
                )}
              </div>
              <Nav error={error} left={<Button variant="secondary" onClick={() => go(0)}><ArrowLeft size={16} /> Retour</Button>} right={<Button onClick={nextFromDate} disabled={!slotId}>Continuer <ArrowRight size={16} /></Button>} />
            </section>
          )}

          {/* 3. Question */}
          {step === 2 && (
            <section>
              <h2 className="text-card-title text-text">Ta question</h2>
              <p className="mt-2 text-[14px] text-text-muted">Une seule question, précise. C&apos;est elle qui sera posée à Ifá.</p>
              <div className="mt-6 space-y-6">
                <Field label="Ta question" htmlFor="q"><Textarea id="q" rows={3} maxLength={1000} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Par exemple : quel chemin prendre pour régulariser ma situation en France ?" /></Field>
                <Field label="Le contexte" htmlFor="c" hint="Facultatif : ce que tu vis, ce que tu as déjà tenté."><Textarea id="c" rows={5} maxLength={4000} value={context} onChange={(e) => setContext(e.target.value)} /></Field>
                {readingId && <p className="text-[13px] text-text-muted">Ton portrait sera joint à ta demande pour éclairer le contexte.</p>}
                {user && (
                  <Checkbox
                    checked={consent} onChange={setConsent}
                    label="J'accepte que ma question et mon contexte soient traités pour ma consultation."
                    description="Données sensibles, strictement confidentielles. Aucun résultat n'est garanti."
                  />
                )}
                {offer?.isFree && user && !user.emailVerified && (
                  <Alert tone="warning" title="Confirme d'abord ton email">Ta consultation offerte s&apos;active quand ton email est confirmé. Regarde ta boîte de réception (et tes indésirables).</Alert>
                )}
              </div>

              {ready && !user ? (
                <div className="mt-10 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
                  <p className="text-[16px] text-text">Pour confirmer, connecte-toi ou crée ton compte.</p>
                  <p className="mt-1 text-[14px] text-text-muted">Tes choix sont gardés : tu reviens ici directement, sans rien ressaisir.</p>
                  {error && <p className="mt-3 text-[14px] text-danger">{error}</p>}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={() => (question.trim().length < 5 ? setError('Écris ta question.') : toAuth('/inscription'))}>Créer mon compte</Button>
                    <Button variant="secondary" onClick={() => (question.trim().length < 5 ? setError('Écris ta question.') : toAuth('/connexion'))}>J&apos;ai déjà un compte</Button>
                  </div>
                </div>
              ) : (
                <Nav
                  error={error}
                  left={<Button variant="secondary" onClick={() => go(needsSlot ? 1 : 0)}><ArrowLeft size={16} /> Retour</Button>}
                  right={<Button size="lg" loading={busy} onClick={submit} disabled={!offer || !ready || (offer.isFree && !user?.emailVerified)}>{offer && !offer.isFree ? 'Continuer vers le paiement' : 'Confirmer ma demande'}</Button>}
                />
              )}
            </section>
          )}

          {/* 4. Confirmation ou paiement */}
          {step === 3 && created && (created.status === 'AWAITING_PAYMENT' ? (
            <section>
              <h2 className="text-card-title text-text">Paiement</h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-text-muted">
                {created.offer.title}{created.slot ? `, ${btTime(created.slot.startsAt)} (heure du Bénin)` : ''}. Ton créneau est réservé pendant 15 minutes.
              </p>
              <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
                <p className="text-[34px] tracking-[-0.03em] tabular-nums text-text">{eur(created.priceCents, created.currency)}</p>
                <p className="text-[13px] tabular-nums text-text-faint">soit {fcfa(created.priceCents)}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <PayButton icon={Smartphone} title="Mobile Money" text="MTN, Moov (FCFA)" busy={paying === 'FEEXPAY'} onClick={() => pay('FEEXPAY')} />
                <PayButton icon={CreditCard} title="Carte bancaire" text="Visa, Mastercard (EUR)" busy={paying === 'STRIPE'} onClick={() => pay('STRIPE')} />
              </div>
              {error && <div className="mt-6"><ErrorState title="Le paiement n'a pas démarré" description={error} /></div>}
              <p className="mt-6 text-[12px] text-text-faint">Le paiement est confirmé par le serveur, jamais par ton navigateur. Tu reçois un reçu par email.</p>
            </section>
          ) : (
            <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-success-soft text-success"><Check size={22} /></span>
              <h2 className="text-section mt-5 text-text">Ta demande est enregistrée.</h2>
              <p className="mt-3 text-[15px] leading-[1.8] text-text-muted">
                {created.slot
                  ? <>Rendez-vous le <span className="text-text">{btTime(created.slot.startsAt)}</span> (heure du Bénin), soit {localTime(created.slot.startsAt)} chez toi. Le bouton « Rejoindre la visio » s&apos;active dans ton espace 10 minutes avant. Tu reçois un rappel 24 h et 1 h avant.</>
                  : <>Le prêtre te répond par écrit dans ton espace sous 72 h. Tu reçois un email dès que la réponse est publiée.</>}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/espace/consultations/${created.id}?nouvelle=1`} className={buttonClass({})}>Voir dans mon espace</Link>
                {created.slot && <Button variant="secondary" onClick={() => downloadIcs(created)}><CalendarPlus size={16} /> Ajouter à mon agenda</Button>}
              </div>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Steps({ current, skipDate }: { current: number; skipDate: boolean }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Étapes">
      {STEPS.map((label, i) => {
        const done = i < current || (skipDate && i === 1 && current > 1);
        return (
          <li key={label} className="flex items-center gap-2">
            <span className={cn('grid h-6 w-6 place-items-center rounded-full text-[11px] font-medium transition',
              done ? 'bg-primary text-primary-foreground' : i === current ? 'border border-primary text-primary' : 'border border-border-strong text-text-faint')}>
              {done ? <Check size={12} /> : i + 1}
            </span>
            <span className={cn('hidden text-[12px] lg:inline', i === current ? 'text-text' : 'text-text-faint', skipDate && i === 1 && 'line-through')}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-border-strong lg:w-6" />}
          </li>
        );
      })}
    </ol>
  );
}

function Nav({ left, right, error }: { left: React.ReactNode; right: React.ReactNode; error: string | null }) {
  return (
    <>
      {error && <p className="mt-8 text-[14px] text-danger" role="alert">{error}</p>}
      <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">{left}{right}</div>
    </>
  );
}

function Radio({ on }: { on: boolean }) {
  return <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full border transition', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong')}>{on && <Check size={11} />}</span>;
}

function WeekArrow({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-text transition hover:border-text-faint disabled:opacity-30">{children}</button>
  );
}

function ModeButton({ active, icon: Icon, title, text, onClick }: { active: boolean; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('flex items-center gap-4 rounded-[var(--radius-lg)] border p-4 text-left transition-colors', active ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:border-border-strong')}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-text-muted"><Icon size={17} strokeWidth={1.5} /></span>
      <span><span className="block text-[15px] text-text">{title}</span><span className="block text-[12px] text-text-faint">{text}</span></span>
    </button>
  );
}

function PayButton({ icon: Icon, title, text, busy, onClick }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string; text: string; busy: boolean; onClick: () => void }) {
  return (
    <Button variant="secondary" shape="console" className="h-auto justify-start gap-4 p-5 text-left" loading={busy} onClick={onClick}>
      {!busy && <Icon size={20} strokeWidth={1.5} />}
      <span><span className="block text-[15px] text-text">{title}</span><span className="block text-[12px] font-normal text-text-faint">{text}</span></span>
    </Button>
  );
}
