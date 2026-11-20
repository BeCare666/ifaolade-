'use client';

import { allOdu, defaultLore, oduById, oduFromMarks, oduText, type Mark, type Odu } from '@ona/core';
import { ArrowLeft, ArrowRight, Hand, HelpCircle, RotateCcw, Search, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { OduElements } from '@/components/odu/odu-elements';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { FrenchContentNote } from '@/components/site/blocks';
import { ImmersiveStage } from '@/components/site/immersive-stage';
import { Markdown } from '@/components/site/markdown';
import { Button, buttonClass } from '@/components/ui/button';
import { tpl } from '@/i18n';
import { useI18n } from '@/i18n/client';
import { apiGet } from '@/lib/api';
import { cn } from '@/lib/cn';
import { ODU_DOMAINS, type OduDomain, type OduLecture } from '@/lib/odu-domains';
import { pick } from '@/lib/site-data-shared';
import { useSiteData } from '@/lib/site-data';

/*
 * « J'ai déjà mon Odu » (plan, étape 5.9), en plein écran sans distraction (REFONTE §11 quinquies, étape R16).
 * 1. Carte lumineuse de 8 cercles seule au centre (touché = II, non touché = I) ; démonstration au premier plan
 *    au premier passage ; recherche par nom dans un tiroir.  2. Domaine.  3. Explication guidée, une étape à la fois.
 * Rien n'est inventé : les textes par domaine viennent du prêtre (publiés), sinon la page le dit.
 */

// Couleurs fixes de la carte (indigo et kaolin de la charte), identiques en mode clair et sombre.
const CARD_BG = '#1F2A44';
const KAOLIN = '#FAF8F4';
const GLOW = '0 0 0 1px rgba(250,248,244,0.9), 0 0 22px 4px rgba(250,248,244,0.35)';
const spring = { type: 'spring' as const, stiffness: 320, damping: 26 };
const DEMO_KEY = 'ifaolade:myodu-demo-seen';

type Leg = [Mark, Mark, Mark, Mark];
const EMPTY: Leg = [1, 1, 1, 1];
const strip = (s: string) => s.normalize('NFD').replace(/[̀-̣ͯ]/g, '').toLowerCase().replace(/[^a-zɛɔ]/g, '');

type Phase = 'card' | 'domain' | 'explain';

export function MyOdu() {
  const { d: dict } = useI18n();
  const d = dict.myOdu;
  const [phase, setPhase] = useState<Phase>('card');
  const [right, setRight] = useState<Leg>(EMPTY);
  const [left, setLeft] = useState<Leg>(EMPTY);
  const [odu, setOdu] = useState<Odu | null>(null);
  const [domain, setDomain] = useState<OduDomain | null>(null);
  const [step, setStep] = useState(0);
  const [demo, setDemo] = useState(false);
  const [search, setSearch] = useState(false);
  const total = d.steps.length;

  // La démonstration s'ouvre d'elle-même au premier passage seulement.
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(DEMO_KEY) === '1'; } catch { /* rien */ }
    if (!seen) setDemo(true);
  }, []);
  const closeDemo = () => { setDemo(false); try { localStorage.setItem(DEMO_KEY, '1'); } catch { /* rien */ } };

  const restart = () => { setRight(EMPTY); setLeft(EMPTY); setOdu(null); setDomain(null); setStep(0); setPhase('card'); };
  const progress = phase === 'card' ? 0.15 : phase === 'domain' ? 0.35 : 0.35 + (0.65 * (step + 1)) / total;
  const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

  const actions = phase === 'card' ? (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-2">
        <IconButton label={d.reset} onClick={() => { setRight(EMPTY); setLeft(EMPTY); }}><RotateCcw size={17} /></IconButton>
        <IconButton label={d.searchOpen} onClick={() => setSearch(true)}><Search size={17} /></IconButton>
        <IconButton label={d.demoReplay} onClick={() => setDemo(true)}><HelpCircle size={17} /></IconButton>
      </div>
      <button type="button" onClick={() => { setOdu(oduFromMarks(right, left)); setPhase('domain'); }}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-kaolin px-6 text-[15px] font-medium text-night transition-colors hover:bg-kaolin/90">
        {d.reveal} <ArrowRight size={16} />
      </button>
    </div>
  ) : phase === 'domain' ? (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" onClick={restart}><ArrowLeft size={16} /> {d.changeOdu}</Button>
      <Button size="lg" onClick={() => { setStep(0); setPhase('explain'); }}>{d.start} <ArrowRight size={16} /></Button>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-3">
      {step > 0
        ? <Button variant="ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {d.prev}</Button>
        : <Button variant="ghost" onClick={() => setPhase('domain')}><ArrowLeft size={16} /> {d.prev}</Button>}
      {step < total - 1
        ? <Button size="lg" onClick={() => setStep(step + 1)}>{d.next} <ArrowRight size={16} /></Button>
        : <Button variant="secondary" onClick={restart}><RotateCcw size={14} /> {d.restart}</Button>}
    </div>
  );

  return (
    <ImmersiveStage tone={phase === 'card' ? 'night' : 'light'} progress={progress} actions={actions}>
      <AnimatePresence mode="wait">
        {phase === 'card' && (
          <motion.div key="card" {...fade}><OduCard right={right} left={left} setRight={setRight} setLeft={setLeft} /></motion.div>
        )}
        {phase === 'domain' && odu && (
          <motion.div key="domain" {...fade}>
            <Revealed odu={odu} />
            <h2 className="mt-8 text-center text-[20px] text-text">{d.domainTitle}</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {ODU_DOMAINS.map((k) => (
                <button key={k} type="button" onClick={() => setDomain(k)} aria-pressed={domain === k}
                  className={cn('rounded-[var(--radius-md)] border px-4 py-3 text-left text-[15px] transition',
                    domain === k ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface text-text hover:border-text-faint')}>
                  {d.domains[k]}
                </button>
              ))}
              <button type="button" onClick={() => setDomain(null)} aria-pressed={domain === null}
                className={cn('rounded-[var(--radius-md)] border px-4 py-3 text-left text-[15px] transition',
                  domain === null ? 'border-primary bg-primary-soft text-text' : 'border-border bg-surface text-text-muted hover:border-text-faint')}>
                {d.domainUnknown}
              </button>
            </div>
          </motion.div>
        )}
        {phase === 'explain' && odu && (
          <motion.div key="explain" {...fade}><Explanation odu={odu} domain={domain} step={step} /></motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {demo && phase === 'card' && <Demo onClose={closeDemo} />}
        {search && phase === 'card' && (
          <SearchDrawer onClose={() => setSearch(false)} onPick={(o) => { setRight([...o.marks.right] as Leg); setLeft([...o.marks.left] as Leg); setSearch(false); }} />
        )}
      </AnimatePresence>
      <p className="sr-only" aria-live="polite">{odu ? odu.name : ''}</p>
    </ImmersiveStage>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      className="grid h-12 w-12 place-items-center rounded-full border border-kaolin/25 text-kaolin transition-colors hover:bg-kaolin/10">
      {children}
    </button>
  );
}

/* ---------------- Démonstration au premier plan (comme une vidéo) ---------------- */

function Demo({ onClose }: { onClose: () => void }) {
  const { d: dict } = useI18n();
  const d = dict.myOdu;
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  // Défile seule, en boucle, comme une courte vidéo.
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % d.tuto.length), 3200);
    return () => clearInterval(t);
  }, [d.tuto.length]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const demoLit = i === 1 || i === 2;

  return (
    <motion.div role="dialog" aria-modal="true" aria-label={d.demoLabel}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-night/92 px-6 text-center text-kaolin backdrop-blur-md">
      <button type="button" onClick={onClose} aria-label={d.demoGot} className="absolute right-4 top-[max(14px,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full border border-kaolin/25 sm:right-8 sm:top-6"><X size={18} /></button>
      <p className="text-[11px] uppercase tracking-[0.22em] text-kaolin/60">{d.demoLabel} · {tpl(d.stepOf, { n: i + 1, total: d.tuto.length })}</p>

      <div className="relative mt-6 w-[min(78vw,300px)] rounded-[32px] p-7 ring-1 ring-kaolin/15" style={{ background: CARD_BG }} aria-hidden>
        <div className="grid grid-cols-2 justify-items-center gap-x-8 gap-y-5">
          {[0, 1, 2, 3].map((row) => [0, 1].map((col) => {
            const target = row === 0 && col === 1;
            const lit = target && demoLit;
            const highlight = i === 0 && col === 1;
            return (
              <motion.span key={`${row}-${col}`}
                animate={{ boxShadow: lit ? GLOW : '0 0 0 1px rgba(250,248,244,0.22)', backgroundColor: lit ? KAOLIN : 'rgba(250,248,244,0.04)', scale: highlight && !reduce ? [1, 1.07, 1] : 1 }}
                transition={highlight ? { duration: 1.4, repeat: Infinity } : spring}
                className="relative grid h-14 w-14 place-items-center rounded-full">
                <span className="font-mono text-[13px] tracking-[0.2em]" style={{ color: lit ? CARD_BG : 'rgba(250,248,244,0.5)' }}>{lit ? 'II' : 'I'}</span>
                {target && (i === 1 || i === 3) && (
                  <motion.span key={`hand-${i}`} initial={{ x: 46, y: 46, opacity: 0 }} animate={{ x: 12, y: 16, opacity: [0, 1, 1, 0.9] }}
                    transition={{ duration: reduce ? 0 : 1.1, ease: 'easeOut' }}
                    className="absolute grid h-10 w-10 place-items-center rounded-full text-osun"><Hand size={30} strokeWidth={1.6} fill="#F6E7E1" /></motion.span>
                )}
              </motion.span>
            );
          }))}
        </div>
        <div className="mt-5 flex justify-between text-[10px] uppercase tracking-[0.16em] text-kaolin/60"><span>{d.leftLeg}</span><span>{d.rightLeg}</span></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          className="mt-8 min-h-[4.5rem] max-w-md font-display text-[20px] leading-[1.4] sm:text-[23px]">{d.tuto[i]}</motion.p>
      </AnimatePresence>
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {d.tuto.map((_, k) => <span key={k} className={cn('h-1 w-8 rounded-full transition', k === i ? 'bg-kaolin' : 'bg-kaolin/20')} />)}
      </div>
      <button type="button" onClick={onClose} autoFocus className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-kaolin px-7 text-[15px] font-medium text-night">{d.demoGot}</button>
    </motion.div>
  );
}

/* ---------------- Carte lumineuse des 8 cercles (seule au centre) ---------------- */

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
    const lit = (leg === 'r' ? right : left)[row] === 2;
    const legName = leg === 'r' ? d.rightLeg : d.leftLeg;
    return (
      <motion.button
        key={leg + row} type="button"
        onPointerDown={(e) => { e.preventDefault(); toggle(leg, row); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(leg, row); } }}
        aria-pressed={lit}
        aria-label={tpl(d.circleLabel, { leg: legName, n: row + 1, marks: lit ? d.twoMarks : d.oneMark })}
        whileTap={{ scale: 0.92 }}
        animate={{ boxShadow: lit ? GLOW : '0 0 0 1px rgba(250,248,244,0.22)', backgroundColor: lit ? KAOLIN : 'rgba(250,248,244,0.04)' }}
        transition={spring}
        className="grid h-[min(17vw,11dvh,84px)] w-[min(17vw,11dvh,84px)] touch-manipulation select-none place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#E08C72]"
      >
        <span className="font-mono text-[15px] tracking-[0.25em]" style={{ color: lit ? CARD_BG : 'rgba(250,248,244,0.55)' }}>{lit ? 'II' : 'I'}</span>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[360px] rounded-[32px] px-8 pb-6 pt-8 ring-1 ring-kaolin/15" style={{ background: CARD_BG }}>
        <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-[min(3dvh,20px)]">
          {[0, 1, 2, 3].map((row) => [circle('l', row), circle('r', row)])}
        </div>
        <div className="mt-5 flex justify-between text-[11px] uppercase tracking-[0.16em] text-kaolin/65"><span>{d.leftLeg}</span><span>{d.rightLeg}</span></div>
      </div>
      <p className="mt-6 font-display text-[24px] text-kaolin">{preview.name}</p>
      <p className="text-[13px] text-kaolin/60">{preview.fonName}</p>
    </div>
  );
}

function SearchDrawer({ onClose, onPick }: { onClose: () => void; onPick: (o: Odu) => void }) {
  const { d: dict } = useI18n();
  const d = dict.myOdu;
  const [q, setQ] = useState('');
  const all = useMemo(() => allOdu(), []);
  const s = strip(q);
  const hits = s.length < 2 ? [] : all.filter((o) => strip(o.name).includes(s) || strip(o.fonName).includes(s)).slice(0, 8);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label={dict.wizard.quit} onClick={onClose} className="absolute inset-0 bg-night/50" />
      <motion.div role="dialog" aria-modal="true" aria-label={d.byName}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="relative w-full rounded-t-[28px] bg-surface px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 text-text sm:mx-auto sm:max-w-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong" aria-hidden />
        <label htmlFor="odu-name" className="text-[14px] text-text-muted">{d.byName}</label>
        <div className="relative mt-2">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <input id="odu-name" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.byNamePlaceholder} aria-label={d.byNameLabel}
            className="h-12 w-full rounded-[var(--radius-md)] border border-border bg-bg pl-10 pr-3 text-[16px] text-text outline-none focus:border-primary" />
        </div>
        <div className="mt-3 max-h-[40dvh] space-y-1 overflow-y-auto">
          {hits.map((o) => (
            <button key={o.id} type="button" onClick={() => onPick(o)}
              className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[15px] text-text hover:bg-bg-subtle">
              <OduGlyph right={o.marks.right} left={o.marks.left} size="xs" label={o.name} /> {o.name} <span className="text-text-faint">· {o.fonName}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Odu sorti ---------------- */

function Revealed({ odu }: { odu: Odu }) {
  const { lang, d: dict } = useI18n();
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
        className="flex h-36 w-36 items-center justify-center rounded-[28px] sm:h-44 sm:w-44" style={{ background: CARD_BG }}>
        <OduGlyph right={odu.marks.right} left={odu.marks.left} size="sm" animate activeColor={KAOLIN} label={odu.name} />
      </motion.div>
      <h2 className="mt-5 font-display text-[32px] leading-tight text-text sm:text-[40px]">{odu.name}</h2>
      <p className="mt-1 text-[14px] text-text-muted">{tpl(dict.odu.inFa, { name: odu.fonName })} · {odu.isMeji ? dict.odu.meji : dict.odu.omo}</p>
      <p className="mt-3 flex flex-wrap justify-center gap-1.5">
        {oduText(odu, lang).keywords.map((k) => <span key={k} className="rounded-full border border-border-strong px-2.5 py-0.5 text-[12px] text-text-muted">{k}</span>)}
      </p>
    </div>
  );
}

/* ---------------- Explication guidée, une étape à la fois ---------------- */

interface Detail { essence: string; teaching: string | null }

function Explanation({ odu, domain, step }: { odu: Odu; domain: OduDomain | null; step: number }) {
  const { lang, d: dict, href } = useI18n();
  const site = useSiteData();
  const d = dict.myOdu;
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
  // R13 : enseignement de départ si l'API ne répond pas.
  const teaching = detail?.teaching || defaultLore(odu).teaching;
  const domainLabel = domain ? d.domains[domain].toLowerCase() : '';

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
            <p className="text-body mb-6">{pick(site, 'odu.elementsText', dict.odu.elementsText)}</p>
            <OduElements elements={odu.elements} lang={lang} labels={{ manifest: site.texts['odu.manifest'], balance: site.texts['odu.balance'], latent: site.texts['odu.latent'] }} />
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
        return <><Markdown source={teaching} /><FrenchContentNote lang={lang} /></>;
      default:
        return (
          <>
            <h3 className="text-card-title text-text">{d.limitsTitle}</h3>
            <ul className="mt-4 space-y-3">
              {d.limits.map((l) => <li key={l} className="text-body border-l-2 border-accent pl-4">{l}</li>)}
            </ul>
            <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
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
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-11 shrink-0 place-items-center rounded-[14px]" style={{ background: CARD_BG }}>
          <OduGlyph right={odu.marks.right} left={odu.marks.left} size="xs" activeColor={KAOLIN} label={odu.name} />
        </span>
        <div className="min-w-0">
          <p className="text-[17px] text-text">{odu.name}</p>
          <p className="text-[12px] text-text-faint">{odu.fonName}{domain ? ` · ${d.domains[domain]}` : ''}</p>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.section key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-7">
          <p className="text-overline">{tpl(d.stepOf, { n: step + 1, total: d.steps.length })}</p>
          <h2 className="mt-2 font-display text-[28px] leading-tight text-text sm:text-[34px]">{d.steps[step]}</h2>
          <div className="mt-5">{body}</div>
          {step === 3 && (domain === 'sante' || domain === 'enfants') && (
            <p className="mt-6 rounded-[var(--radius-md)] border border-info/25 bg-info-soft px-4 py-3 text-[14px] text-text">{d.medical}</p>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
