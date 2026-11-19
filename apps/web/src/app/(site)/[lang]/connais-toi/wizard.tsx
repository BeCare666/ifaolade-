'use client';

import { birthSignature, buildReading, questionsFor } from '@ona/core';
import { ArrowLeft, ArrowRight, Clock, Gift, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AnalysisVeil } from '@/components/portrait/analysis-veil';
import { Container } from '@/components/site/editorial';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input, RadioCards, Select, Textarea } from '@/components/ui/field';
import { ErrorState, Stepper } from '@/components/ui/primitives';
import { PlaceCombobox, type Place } from '@/components/ui/place-combobox';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { ApiError, apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Draft {
  firstName: string;
  lastName: string;
  gender: '' | 'f' | 'm' | 'x';
  birthDate: string;
  birthTime: string;
  timeUnknown: boolean;
  place: Place | null;
  answers: Record<string, string>;
}

const EMPTY: Draft = { firstName: '', lastName: '', gender: '', birthDate: '', birthTime: '', timeUnknown: false, place: null, answers: {} };
const DRAFT_KEY = 'ifaolade:portrait-draft';
const LOCAL_READING_KEY = 'ifaolade:local-reading';

export function Wizard() {
  const router = useRouter();
  const { token } = useAuth();
  const { lang, d: D, href } = useI18n();
  const d = D.wizard;
  const QUESTIONS = useMemo(() => questionsFor(lang), [lang]);
  const STEPS = useMemo(() => ['intro', 'identite', 'naissance', ...QUESTIONS.map((q) => q.id)], [QUESTIONS]);
  const [dr, setD] = useState<Draft>(EMPTY);
  const [i, setI] = useState(0);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [dir, setDir] = useState(1);

  // Brouillon gardé dans ce navigateur uniquement (si on recharge la page).
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); if (saved) setD({ ...EMPTY, ...saved }); } catch { /* rien */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(dr)); } catch { /* rien */ }
  }, [dr]);

  const step = STEPS[i];
  const question = QUESTIONS.find((q) => q.id === step);
  const labels: Record<string, string> = { identite: d.steps.identite, naissance: d.steps.naissance };
  const progressSteps = STEPS.slice(1).map((s) => labels[s] ?? d.steps.questions);

  const stepError = useMemo(() => {
    if (step === 'intro') return consent ? null : d.errors.consent;
    if (step === 'identite') return dr.firstName.trim() ? null : d.errors.firstName;
    if (step === 'naissance') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dr.birthDate)) return d.errors.date;
      const y = Number(dr.birthDate.slice(0, 4));
      if (y < 1900 || new Date(dr.birthDate) > new Date()) return d.errors.dateInvalid;
      if (!dr.timeUnknown && !/^\d{2}:\d{2}$/.test(dr.birthTime)) return d.errors.time;
      if (!dr.place) return d.errors.place;
      return null;
    }
    if (question?.type === 'single') return dr.answers[question.id] ? null : d.errors.answer;
    return null;
  }, [step, consent, dr, question, d]);

  const go = (delta: number) => { setError(null); setDir(delta); setI((x) => Math.max(0, Math.min(STEPS.length - 1, x + delta))); };
  const next = () => {
    if (stepError) { setError(stepError); return; }
    if (i === STEPS.length - 1) submit();
    else go(1);
  };

  const input = () => ({
    firstName: dr.firstName.trim(),
    lastName: dr.lastName.trim() || undefined,
    gender: dr.gender || undefined,
    birthDate: dr.birthDate,
    birthTime: dr.timeUnknown ? undefined : dr.birthTime,
    birthPlace: dr.place?.label,
    latitude: dr.place?.latitude,
    longitude: dr.place?.longitude,
    timezone: dr.place?.timezone,
    answers: dr.answers,
  });

  async function submit() {
    setReading(true);
    const started = Date.now();
    // REFONTE R12 : la vue d'analyse reste au moins 6 secondes, même si le calcul est plus rapide.
    const wait = () => new Promise((r) => setTimeout(r, Math.max(0, 6200 - (Date.now() - started))));
    try {
      const res = await apiSend<{ id: string }>('/readings', { ...input(), consent: true, locale: lang }, 'POST', token);
      try { localStorage.setItem('ifaolade:last-reading', res.id); } catch { /* rien */ }
      await wait();
      router.replace(href(`/connais-toi/portrait/${res.id}`));
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) {
        // API injoignable : le portrait est calculé ici même, sans être enregistré.
        try { sessionStorage.setItem(LOCAL_READING_KEY, JSON.stringify(buildReading(input(), {}, lang))); } catch { /* rien */ }
        await wait();
        router.replace(href('/connais-toi/portrait/local'));
      } else {
        setReading(false);
        setError((e as Error).message);
      }
    }
  }

  if (reading) return <ReadingScreen dr={dr} />;
  const icons = [Clock, Gift, Lock];

  return (
    <Container className="py-12 lg:py-20">
      <div className="mx-auto max-w-2xl">
        {step !== 'intro' && <div className="mb-12"><Stepper steps={progressSteps} current={i - 1} label={tpl(d.step, { n: i, total: progressSteps.length })} /></div>}

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') { e.preventDefault(); next(); } }}
          >
            {step === 'intro' && (
              <div>
                <p className="text-overline">{d.overline}</p>
                <h1 className="text-hero mt-5 text-text">{d.title}</h1>
                <p className="text-body mt-7">{d.intro}</p>
                <ul className="mt-10 grid gap-4 sm:grid-cols-3">
                  {d.points.map((t, k) => {
                    const I = icons[k];
                    return <li key={t} className="flex items-center gap-3 text-[14px] text-text"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-text-muted"><I size={16} strokeWidth={1.5} /></span>{t}</li>;
                  })}
                </ul>
                <div className="mt-12 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
                  <Checkbox checked={consent} onChange={setConsent} label={d.consent} description={d.consentHint} />
                  <p className="mt-4 text-[12px] text-text-faint">
                    {d.privacy.split('{link}')[0]}<Link href={href('/confidentialite')} className="underline underline-offset-4">{d.privacyLink}</Link>{d.privacy.split('{link}')[1]}
                  </p>
                </div>
              </div>
            )}

            {step === 'identite' && (
              <StepFrame title={d.identityTitle} hint={d.identityHint}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label={d.firstName} htmlFor="fn"><Input id="fn" autoFocus autoComplete="given-name" value={dr.firstName} onChange={(e) => setD({ ...dr, firstName: e.target.value })} /></Field>
                  <Field label={d.lastName} htmlFor="ln" hint={d.optional}><Input id="ln" autoComplete="family-name" value={dr.lastName} onChange={(e) => setD({ ...dr, lastName: e.target.value })} /></Field>
                </div>
                <div className="mt-6 max-w-xs">
                  <Field label={d.youAre} htmlFor="g" hint={d.optional}>
                    <Select id="g" value={dr.gender} onChange={(e) => setD({ ...dr, gender: e.target.value as Draft['gender'] })}>
                      <option value="">{d.genders.none}</option>
                      <option value="f">{d.genders.f}</option>
                      <option value="m">{d.genders.m}</option>
                      <option value="x">{d.genders.x}</option>
                    </Select>
                  </Field>
                </div>
              </StepFrame>
            )}

            {step === 'naissance' && (
              <StepFrame title={d.birthTitle} hint={d.birthHint}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label={d.birthDate} htmlFor="bd">
                    <Input id="bd" type="date" max={new Date().toISOString().slice(0, 10)} min="1900-01-01" value={dr.birthDate} onChange={(e) => setD({ ...dr, birthDate: e.target.value })} />
                  </Field>
                  <Field label={d.birthTime} htmlFor="bt" hint={d.birthTimeHint}>
                    <Input id="bt" type="time" disabled={dr.timeUnknown} value={dr.birthTime} onChange={(e) => setD({ ...dr, birthTime: e.target.value })} />
                  </Field>
                </div>
                <div className="mt-4"><Checkbox checked={dr.timeUnknown} onChange={(v) => setD({ ...dr, timeUnknown: v, birthTime: v ? '' : dr.birthTime })} label={d.timeUnknown} /></div>
                <div className="mt-8"><Field label={d.birthPlace} htmlFor="pl"><PlaceCombobox id="pl" value={dr.place} onChange={(p) => setD({ ...dr, place: p })} /></Field></div>
              </StepFrame>
            )}

            {question?.type === 'single' && (
              <StepFrame title={question.title} hint={question.hint}>
                <RadioCards
                  name={question.title}
                  options={question.options!.map((o) => ({ value: o.value, label: o.label }))}
                  value={dr.answers[question.id]}
                  onChange={(v) => {
                    setD({ ...dr, answers: { ...dr.answers, [question.id]: v } });
                    setError(null);
                    setTimeout(() => { setDir(1); setI((x) => Math.min(STEPS.length - 1, x + 1)); }, 260);
                  }}
                />
              </StepFrame>
            )}

            {question?.type === 'text' && (
              <StepFrame title={question.title} hint={question.hint}>
                <Textarea autoFocus rows={4} maxLength={400} placeholder={d.intentionPlaceholder} value={dr.answers[question.id] ?? ''} onChange={(e) => setD({ ...dr, answers: { ...dr.answers, [question.id]: e.target.value } })} />
                <p className="mt-2 text-right text-[12px] tabular-nums text-text-faint">{(dr.answers[question.id] ?? '').length} / 400</p>
              </StepFrame>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <div className="mt-8"><ErrorState title={d.errors.missingTitle} description={error} /></div>}

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-8">
          {i > 0 ? <Button variant="ghost" onClick={() => go(-1)}><ArrowLeft size={16} /> {d.back}</Button> : <span />}
          {(step === 'intro' || step === 'identite' || step === 'naissance' || question?.type === 'text' || dr.answers[step]) && (
            <Button size="lg" onClick={next}>{step === 'intro' ? d.start : i === STEPS.length - 1 ? d.reveal : d.next} <ArrowRight size={16} /></Button>
          )}
        </div>
      </div>
    </Container>
  );
}

function StepFrame({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[30px] font-normal leading-[1.1] tracking-[-0.03em] text-text sm:text-[38px]">{title}</h2>
      {hint && <p className="mt-4 text-[15px] leading-[1.75] text-text-muted">{hint}</p>}
      <div className="mt-10">{children}</div>
    </div>
  );
}

/** Écran de lecture : l'ọ̀pẹ̀lẹ̀ montre la signature calculée (jamais présentée comme une divination). */
function ReadingScreen({ dr }: { dr: Draft }) {
  const { d } = useI18n();
  const odu = useMemo(
    () => birthSignature({ firstName: dr.firstName, lastName: dr.lastName, birthDate: dr.birthDate, birthTime: dr.timeUnknown ? null : dr.birthTime }),
    [dr],
  );
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <AnalysisVeil name={dr.firstName} right={odu.marks.right} left={odu.marks.left} steps={[...d.wizard.analysisSteps]} title={d.wizard.analysisTitle} live={d.wizard.analysisLive} />
    </Container>
  );
}
