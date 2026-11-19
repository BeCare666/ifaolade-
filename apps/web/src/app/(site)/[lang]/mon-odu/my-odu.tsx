'use client';

import { allOdu, oduById, oduFromMarks, oduText, type Mark, type Odu } from '@ona/core';
import { ArrowLeft, ArrowRight, Hand, RotateCcw, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { OduElements } from '@/components/odu/odu-elements';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { FrenchContentNote } from '@/components/site/blocks';
import { Markdown } from '@/components/site/markdown';
import { Button, buttonClass } from '@/components/ui/button';
import { Stepper } from '@/components/ui/primitives';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { apiGet } from '@/lib/api';
import { cn } from '@/lib/cn';
import { ODU_DOMAINS, type OduDomain, type OduLecture } from '@/lib/odu-domains';

/*
 * « J'ai déjà mon Odu » (plan, étape 5.9).
 * 1. Tutoriel  2. Carte lumineuse de 8 cercles (touché = II, non touché = I)  3. Domaine  4. Explication guidée.
 * Rien n'est inventé : les textes par domaine viennent du prêtre (publiés), sinon la page le dit.
 */

// Couleurs fixes de la carte (indigo et kaolin de la charte), identiques en mode clair et sombre.
const CARD_BG = '#1F2A44';
const KAOLIN = '#FAF8F4';
const GLOW = '0 0 0 1px rgba(250,248,244,0.9), 0 0 22px 4px rgba(250,248,244,0.35)';
const spring = { type: 'spring' as const, stiffness: 320, damping: 26 };

type Leg = [Mark, Mark, Mark, Mark];
const EMPTY: Leg = [1, 1, 1, 1];
const strip = (s: string) => s.normalize('NFD').replace(/[̀-̣ͯ]/g, '').toLowerCase().replace(/[^a-zɛɔ]/g, '');

type Phase = 'tuto' | 'card' | 'domain' | 'explain';

export function MyOdu() {
  const { d: dict } = useI18n();
  const d = dict.myOdu;
  const [phase, setPhase] = useState<Phase>('tuto');
  const [right, setRight] = useState<Leg>(EMPTY);
  const [left, setLeft] = useState<Leg>(EMPTY);
  const [odu, setOdu] = useState<Odu | null>(null);
  const [domain, setDomain] = useState<OduDomain | null>(null);

  const go = (p: Phase) => { setPhase(p); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const restart = () => { setRight(EMPTY); setLeft(EMPTY); setOdu(null); setDomain(null); go('card'); };

  return (
    <div className="mx-auto max-w-3xl">
      <AnimatePresence mode="wait">
        {phase === 'tuto' && (
          <motion.div key="tuto" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Tutorial onDone={() => go('card')} />
          </motion.div>
        )}

        {phase === 'card' && (
          <motion.div key="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <OduCard right={right} left={left} setRight={setRight} setLeft={setLeft} />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setRight(EMPTY); setLeft(EMPTY); }}><RotateCcw size={14} /> {d.reset}</Button>
                <Button variant="ghost" size="sm" onClick={() => go('tuto')}>{d.tutoReplay}</Button>
              </div>
              <Button onClick={() => { setOdu(oduFromMarks(right, left)); go('domain'); }}>{d.reveal} <ArrowRight size={16} /></Button>
            </div>
            <NameSearch onPick={(o) => { setRight([...o.marks.right] as Leg); setLeft([...o.marks.left] as Leg); }} />
          </motion.div>
        )}

        {phase === 'domain' && odu && (
          <motion.div key="domain" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Revealed odu={odu} />
            <section className="mt-12 border-t border-border pt-10">
              <h2 className="text-card-title text-text">{d.domainTitle}</h2>
              <p className="mt-2 text-[15px] text-text-muted">{d.domainText}</p>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {ODU_DOMAINS.map((k) => (
                  <button
                    key={k} type="button" onClick={() => setDomain(k)} aria-pressed={domain === k}
                    className={cn('rounded-[var(--radius-md)] border px-4 py-3.5 text-left text-[15px] transition',
                      domain === k ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface text-text hover:border-text-faint')}
                  >{d.domains[k]}</button>
                ))}
                <button
                  type="button" onClick={() => setDomain(null)} aria-pressed={domain === null}
                  className={cn('rounded-[var(--radius-md)] border px-4 py-3.5 text-left text-[15px] transition',
                    domain === null ? 'border-primary bg-primary-soft text-text' : 'border-border bg-surface text-text-muted hover:border-text-faint')}
                >{d.domainUnknown}</button>
              </div>
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <Button variant="secondary" onClick={() => go('card')}><ArrowLeft size={16} /> {d.changeOdu}</Button>
                <Button onClick={() => go('explain')}>{d.start} <ArrowRight size={16} /></Button>
              </div>
            </section>
          </motion.div>
        )}

        {phase === 'explain' && odu && (
          <motion.div key="explain" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Explanation odu={odu} domain={domain} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
      <p className="sr-only" aria-live="polite">{odu ? odu.name : ''}</p>
    </div>
  );
}

/* ---------------- Tutoriel ---------------- */

function Tutorial({ onDone }: { onDone: () => void }) {
  const { d: dict } = useI18n();
  const d = dict.myOdu;
  const [i, setI] = useState(0);
  const last = i === d.tuto.length - 1;
  // Carte de démonstration : l'étape 1 allume un cercle, l'étape 2 montre un cercle éteint, l'étape 3 l'éteint à nouveau.
  const demoLit = i === 1 || i === 2;
  return (
    <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <p className="text-overline">{tpl(d.stepOf, { n: i + 1, total: d.tuto.length })}</p>
        <h2 className="text-section mt-4 text-text">{d.tutoTitle}</h2>
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-body mt-6 min-h-[5.5rem]">
            {d.tuto[i]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-6 flex gap-1.5" aria-hidden>
          {d.tuto.map((_, k) => <span key={k} className={cn('h-1 w-8 rounded-full transition', k <= i ? 'bg-primary' : 'bg-bg-subtle')} />)}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {last
            ? <Button onClick={onDone}>{d.tutoStart} <ArrowRight size={16} /></Button>
            : <Button onClick={() => setI(i + 1)}>{d.tutoNext} <ArrowRight size={16} /></Button>}
          {!last && <Button variant="ghost" onClick={onDone}>{d.tutoSkip}</Button>}
        </div>
      </div>

      <div className="relative mx-auto w-[220px] rounded-[28px] p-6" style={{ background: CARD_BG }} aria-hidden>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[0, 1, 2, 3].map((row) => [0, 1].map((col) => {
            const target = row === 0 && col === 1; // cercle du haut de la jambe droite
            const lit = target && demoLit;
            const highlight = i === 0 && col === 1;
            return (
              <motion.span
                key={`${row}-${col}`}
                animate={{ boxShadow: lit ? GLOW : '0 0 0 1px rgba(250,248,244,0.22)', backgroundColor: lit ? KAOLIN : 'rgba(250,248,244,0.04)', scale: highlight ? [1, 1.06, 1] : 1 }}
                transition={highlight ? { duration: 1.4, repeat: Infinity } : spring}
                className="relative grid h-12 w-12 place-items-center rounded-full"
              >
                <span className="font-mono text-[12px] tracking-[0.2em]" style={{ color: lit ? CARD_BG : 'rgba(250,248,244,0.5)' }}>{lit ? 'II' : 'I'}</span>
                {target && (i === 1 || i === 3) && (
                  <motion.span
                    initial={{ x: 40, y: 40, opacity: 0 }} animate={{ x: 10, y: 14, opacity: [0, 1, 1, 0.9] }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className="absolute grid h-9 w-9 place-items-center rounded-full text-[#9E3B26]"
                  ><Hand size={26} strokeWidth={1.6} fill="#F6E7E1" /></motion.span>
                )}
              </motion.span>
            );
          }))}
        </div>
        <div className="mt-4 flex justify-between text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(250,248,244,0.6)' }}>
          <span>{d.leftLeg}</span><span>{d.rightLeg}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Carte lumineuse des 8 cercles ---------------- */

function OduCard({ right, left, setRight, setLeft }: { right: Leg; left: Leg; setRight: (l: Leg) => void; setLeft: (l: Leg) => void }) {
  const { d: dict } = useI18n();
  const d = dict.myOdu;
  const toggle = (leg: 'r' | 'l', row: number) => {
    const cur = leg === 'r' ? right : left;
    const next = [...cur] as Leg;
    next[row] = cur[row] === 2 ? 1 : 2;
    (leg === 'r' ? setRight : setLeft)(next);
  };
  const preview = oduFromMarks(right, left);

  const circle = (leg: 'r' | 'l', row: number) => {
    const m = (leg === 'r' ? right : left)[row];
    const lit = m === 2;
    const legName = leg === 'r' ? d.rightLeg : d.leftLeg;
    return (
      <motion.button
        key={leg + row}
        type="button"
        onPointerDown={(e) => { e.preventDefault(); toggle(leg, row); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(leg, row); } }}
        aria-pressed={lit}
        aria-label={tpl(d.circleLabel, { leg: legName, n: row + 1, marks: lit ? d.twoMarks : d.oneMark })}
        whileTap={{ scale: 0.92 }}
        animate={{ boxShadow: lit ? GLOW : '0 0 0 1px rgba(250,248,244,0.22)', backgroundColor: lit ? KAOLIN : 'rgba(250,248,244,0.04)' }}
        transition={spring}
        className="grid h-[72px] w-[72px] touch-manipulation select-none place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#E08C72] sm:h-20 sm:w-20"
      >
        <span className="font-mono text-[15px] tracking-[0.25em]" style={{ color: lit ? CARD_BG : 'rgba(250,248,244,0.55)' }}>{lit ? 'II' : 'I'}</span>
      </motion.button>
    );
  };

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_200px]">
      <div className="mx-auto w-full max-w-[340px] rounded-[32px] px-8 pb-6 pt-8" style={{ background: CARD_BG }}>
        <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-5">
          {[0, 1, 2, 3].map((row) => [circle('l', row), circle('r', row)])}
        </div>
        <div className="mt-5 flex justify-between text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(250,248,244,0.65)' }}>
          <span>{d.leftLeg}</span><span>{d.rightLeg}</span>
        </div>
      </div>
      <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-center">
        <p className="text-overline">{d.live}</p>
        <div className="mt-4"><OduGlyph right={right} left={left} size="sm" label={preview.name} /></div>
        <p className="mt-4 text-[15px] text-text">{preview.name}</p>
        <p className="text-[12px] text-text-faint">{preview.fonName}</p>
      </div>
    </div>
  );
}

function NameSearch({ onPick }: { onPick: (o: Odu) => void }) {
  const { d: dict } = useI18n();
  const d = dict.myOdu;
  const [q, setQ] = useState('');
  const all = useMemo(() => allOdu(), []);
  const s = strip(q);
  const hits = s.length < 2 ? [] : all.filter((o) => strip(o.name).includes(s) || strip(o.fonName).includes(s)).slice(0, 6);
  return (
    <div className="mt-10 border-t border-border pt-8">
      <label htmlFor="odu-name" className="text-[14px] text-text-muted">{d.byName}</label>
      <div className="relative mt-2">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          id="odu-name" value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.byNamePlaceholder} aria-label={d.byNameLabel}
          className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface pl-10 pr-3 text-[15px] text-text outline-none focus:border-primary"
        />
      </div>
      {hits.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {hits.map((o) => (
            <button key={o.id} type="button" onClick={() => { onPick(o); setQ(''); }}
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1.5 text-[13px] text-text hover:border-text-faint">
              <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} /> {o.name} <span className="text-text-faint">· {o.fonName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Odu sorti ---------------- */

function Revealed({ odu }: { odu: Odu }) {
  const { lang, d: dict } = useI18n();
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
        className="flex h-60 w-60 items-center justify-center rounded-[32px]" style={{ background: CARD_BG }}>
        <OduGlyph right={odu.marks.right} left={odu.marks.left} size="md" animate activeColor={KAOLIN} label={odu.name} />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-hero mt-8 text-text">{odu.name}</motion.h2>
      <p className="mt-3 text-[16px] text-text-muted">{tpl(dict.odu.inFa, { name: odu.fonName })} · {odu.isMeji ? dict.odu.meji : dict.odu.omo}</p>
      <p className="mt-4 flex flex-wrap justify-center gap-2">
        {oduText(odu, lang).keywords.map((k) => <span key={k} className="rounded-full border border-border-strong px-3 py-1 text-[13px] text-text-muted">{k}</span>)}
      </p>
    </div>
  );
}

/* ---------------- Explication guidée ---------------- */

interface Detail { essence: string; teaching: string | null }

function Explanation({ odu, domain, onRestart }: { odu: Odu; domain: OduDomain | null; onRestart: () => void }) {
  const { lang, d: dict, href } = useI18n();
  const d = dict.myOdu;
  const [step, setStep] = useState(0);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [lecture, setLecture] = useState<OduLecture | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      apiGet<Detail>(`/odu/${odu.slug}`, 600),
      domain ? apiGet<OduLecture>(`/odu/${odu.slug}/lecture?domain=${domain}`, 600) : Promise.resolve(null),
    ]).then(([det, lec]) => { if (alive) { setDetail(det); setLecture(lec); setLoaded(true); } });
    return () => { alive = false; };
  }, [odu.slug, domain]);

  const rightMeji = oduById(odu.right.index * 17)!;
  const leftMeji = oduById(odu.left.index * 17)!;
  const txt = oduText(odu, lang);
  // Le texte du prêtre est en français : il ne remplace celui du moteur qu'en français.
  const essence = lang === 'fr' && detail?.essence ? detail.essence : txt.essence;
  const domainLabel = domain ? d.domains[domain].toLowerCase() : '';
  const total = d.steps.length;

  const body = (() => {
    switch (step) {
      case 0:
        return (
          <>
            <p className="text-body">{odu.isMeji ? tpl(d.identityMeji, { name: odu.name }) : tpl(d.identityOmo, { name: odu.name, right: rightMeji.name, left: leftMeji.name })}</p>
            <p className="text-body mt-4">{tpl(d.identityRank, { fon: odu.fonName, n: odu.rank })}</p>
            <h3 className="text-card-title mt-8 text-text">{d.essence}</h3>
            <p className="text-body mt-3">{essence}</p>
          </>
        );
      case 1:
        return odu.isMeji ? (
          <>
            <h3 className="text-card-title text-text">{tpl(d.bothLegs, { name: odu.right.name })}</h3>
            <p className="text-body mt-3">{oduText(rightMeji, lang).essence}</p>
          </>
        ) : (
          <>
            <p className="text-body">{d.governsText}</p>
            <h3 className="text-card-title mt-8 text-text">{tpl(d.governs, { name: odu.right.name })}</h3>
            <p className="text-body mt-3">{oduText(rightMeji, lang).essence}</p>
            <h3 className="text-card-title mt-8 text-text">{tpl(d.nuances, { name: odu.left.name })}</h3>
            <p className="text-body mt-3">{oduText(leftMeji, lang).essence}</p>
          </>
        );
      case 2:
        return (
          <>
            <p className="text-body mb-6">{dict.odu.elementsText}</p>
            <OduElements elements={odu.elements} lang={lang} />
          </>
        );
      case 3:
        if (!domain) return <><p className="text-body">{d.domainNone}</p><p className="text-body mt-4">{essence}</p></>;
        if (!loaded) return <p className="text-body text-text-faint">…</p>;
        if (lecture?.own) {
          return (
            <>
              <h3 className="text-card-title text-text">{tpl(d.domainOwn, { name: odu.name, domain: domainLabel })}</h3>
              <div className="mt-4"><Markdown source={lecture.own} /></div>
              <FrenchContentNote lang={lang} />
            </>
          );
        }
        if (lecture?.right || lecture?.left) {
          return (
            <>
              <p className="text-body">{tpl(d.domainComposite, { name: odu.name })}</p>
              {lecture.right && (<><h3 className="text-card-title mt-8 text-text">{tpl(d.domainRight, { name: rightMeji.name, domain: domainLabel })}</h3><div className="mt-4"><Markdown source={lecture.right} /></div></>)}
              {lecture.left && (<><h3 className="text-card-title mt-8 text-text">{tpl(d.domainLeft, { name: leftMeji.name, domain: domainLabel })}</h3><div className="mt-4"><Markdown source={lecture.left} /></div></>)}
              <FrenchContentNote lang={lang} />
            </>
          );
        }
        return <><p className="text-body">{tpl(d.domainPending, { domain: domainLabel })}</p><p className="text-body mt-4">{essence}</p></>;
      case 4:
        return detail?.teaching && lang === 'fr'
          ? <Markdown source={detail.teaching} />
          : detail?.teaching
            ? <><Markdown source={detail.teaching} /><FrenchContentNote lang={lang} /></>
            : <p className="text-body">{d.teachingPending}</p>;
      default:
        return (
          <>
            <h3 className="text-card-title text-text">{d.limitsTitle}</h3>
            <ul className="mt-4 space-y-3">
              {d.limits.map((l) => <li key={l} className="text-body border-l-2 border-accent pl-4">{l}</li>)}
            </ul>
            <div className="mt-10 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
              <h3 className="text-card-title text-text">{d.ctaTitle}</h3>
              <p className="mt-2 text-[15px] text-text-muted">{d.ctaText}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={href('/consultations')} className={buttonClass({})}>{d.ctaConsult}</Link>
                <Link href={href(`/odu/${odu.slug}`)} className={buttonClass({ variant: 'secondary' })}>{d.ctaSheet}</Link>
              </div>
            </div>
          </>
        );
    }
  })();

  return (
    <div>
      <div className="flex items-center gap-5">
        <span className="grid h-20 w-16 shrink-0 place-items-center rounded-[18px]" style={{ background: CARD_BG }}>
          <OduGlyph right={odu.marks.right} left={odu.marks.left} size="sm" activeColor={KAOLIN} label={odu.name} />
        </span>
        <div className="min-w-0">
          <p className="text-[22px] text-text">{odu.name}</p>
          <p className="text-[13px] text-text-faint">{odu.fonName}{domain ? ` · ${d.domains[domain]}` : ''}</p>
        </div>
      </div>
      <div className="mt-8"><Stepper steps={[...d.steps]} current={step} label={tpl(d.stepOf, { n: step + 1, total })} /></div>
      <AnimatePresence mode="wait">
        <motion.section key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-10 min-h-[16rem]">
          <h2 className="text-section mb-6 text-text">{d.steps[step]}</h2>
          {body}
          {step === 3 && (domain === 'sante' || domain === 'enfants') && (
            <p className="mt-8 rounded-[var(--radius-md)] border border-info/25 bg-info-soft px-4 py-3 text-[14px] text-text">{d.medical}</p>
          )}
        </motion.section>
      </AnimatePresence>
      <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-border pt-6">
        {step > 0
          ? <Button variant="secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {d.prev}</Button>
          : <Button variant="ghost" onClick={onRestart}><RotateCcw size={14} /> {d.restart}</Button>}
        {step < total - 1
          ? <Button onClick={() => setStep(step + 1)}>{d.next} <ArrowRight size={16} /></Button>
          : <Button variant="ghost" onClick={onRestart}><RotateCcw size={14} /> {d.restart}</Button>}
      </div>
    </div>
  );
}
