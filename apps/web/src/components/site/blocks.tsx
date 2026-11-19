import { ArrowUpRight, Camera, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import { getDict, INTL, lp, tpl, type Lang } from '@/i18n';
import { eur, fcfa } from '@/lib/cn';
import type { ArticleBrief, EventItem, Offer, Program } from '@/lib/types';
import { Container, PhotoFrame, photoClass, Reveal } from './editorial';

export const fmtDate = (lang: Lang, d: string | Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat(INTL[lang], { ...opts, timeZone: 'Africa/Porto-Novo' }).format(new Date(d));

/**
 * Plan §6.6 : uniquement les VRAIES photos du prêtre. Tant qu'une photo n'est pas fournie,
 * ce cadre indique précisément laquelle est attendue (plan §17, point 3).
 */
export function Photo({ src, alt, expected, className, sizes = '(min-width: 1024px) 48vw, 100vw', priority, lang = 'fr' }: {
  src?: string | null; alt: string; expected: string; className?: string; sizes?: string; priority?: boolean; lang?: Lang;
}) {
  return (
    <PhotoFrame className={className}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={photoClass} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-border-strong p-6 text-center">
          <Camera size={20} strokeWidth={1.5} className="text-text-faint" />
          <p className="max-w-[220px] text-[12px] leading-relaxed text-text-faint">{tpl(getDict(lang).common.photoExpected, { what: expected })}</p>
        </div>
      )}
    </PhotoFrame>
  );
}

export function CtaBand({ title, text, href, label }: { title: string; text?: string; href: string; label: string }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <Container className="flex flex-col items-start gap-8 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-24">
        <div className="max-w-2xl">
          <h2 className="text-[36px] font-normal leading-[1.05] tracking-[-0.035em] lg:text-[52px]">{title}</h2>
          {text && <p className="mt-5 text-[16px] leading-[1.8] text-primary-foreground/70">{text}</p>}
        </div>
        <Link href={href} className="inline-flex h-13 shrink-0 items-center gap-2 rounded-full bg-bg px-8 text-[15px] font-medium text-text transition-colors hover:bg-surface">
          {label} <ArrowUpRight size={16} />
        </Link>
      </Container>
    </section>
  );
}

export function PageHero({ overline, title, text, children }: { overline: string; title: React.ReactNode; text?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Container className="pb-16 pt-16 lg:pb-24 lg:pt-24">
      <Reveal className="max-w-4xl">
        <p className="text-overline">{overline}</p>
        <h1 className="text-hero mt-5 text-text">{title}</h1>
        {text && <p className="text-body mt-7 max-w-2xl">{text}</p>}
        {children && <div className="mt-10">{children}</div>}
      </Reveal>
    </Container>
  );
}

export function OfferCard({ offer, highlight, lang = 'fr' }: { offer: Offer; highlight?: boolean; lang?: Lang }) {
  const d = getDict(lang);
  return (
    <div className={`flex h-full flex-col rounded-[var(--radius-lg)] border p-7 ${highlight ? 'border-primary bg-surface shadow-[var(--shadow-soft)]' : 'border-border bg-surface'}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-card-title text-text">{offer.title}</h3>
        {offer.isFree && <Badge tone="accent">{d.common.free}</Badge>}
      </div>
      <p className="mt-2 text-[13px] text-text-faint">{tpl(d.common.minutes, { n: offer.durationMin })}</p>
      <div className="mt-6">
        {offer.isFree ? (
          <p className="text-[34px] font-normal tracking-[-0.03em] text-text">{d.common.freeAmount}</p>
        ) : (
          <>
            <p className="text-[34px] font-normal tracking-[-0.03em] tabular-nums text-text">{eur(offer.priceCents, offer.currency)}</p>
            <p className="text-[13px] tabular-nums text-text-faint">{tpl(d.common.or, { amount: fcfa(offer.priceCents) })}</p>
          </>
        )}
      </div>
      <p className="mt-6 text-[14px] leading-[1.75] text-text-muted">{offer.description}</p>
      {offer.features && (
        <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
          {offer.features.map((f) => (
            <li key={f} className="flex gap-3 text-[14px] text-text"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />{f}</li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-8">
        <ButtonLink href={lp(lang, `/consultations/reserver?offre=${offer.code}`)} variant={highlight ? 'primary' : 'secondary'} className="w-full">
          {offer.isFree ? d.common.useFree : d.common.book}
        </ButtonLink>
      </div>
    </div>
  );
}

export function ProgramCard({ program, lang = 'fr' }: { program: Program; lang?: Lang }) {
  const d = getDict(lang);
  const next = program.sessions?.[0];
  return (
    <Link href={lp(lang, `/programmes/${program.slug}`)} className="group block">
      <Photo lang={lang} src={program.coverUrl} alt={program.title} expected={program.kind === 'INITIATION' ? d.program.photoForest : d.program.photoPlace} className="aspect-[4/3]" sizes="(min-width: 1024px) 33vw, 100vw" />
      <div className="mt-5">
        <p className="text-overline">{tpl(d.common.days, { n: program.durationDays })}{next ? ` · ${tpl(d.common.fromDate, { date: fmtDate(lang, next.startDate, { day: 'numeric', month: 'long' }) })}` : ''}</p>
        <h3 className="text-card-title mt-2 text-text transition-colors group-hover:text-primary">{program.title}</h3>
        {program.subtitle && <p className="mt-2 text-[14px] text-text-muted">{program.subtitle}</p>}
        <p className="mt-3 text-[14px] tabular-nums text-text">{tpl(d.common.fromPrice, { price: eur(program.priceCents, program.currency) })}</p>
      </div>
    </Link>
  );
}

export function EventCard({ event, lang = 'fr' }: { event: EventItem; lang?: Lang }) {
  const d = getDict(lang);
  return (
    <Link href={lp(lang, `/evenements/${event.slug}`)} className="group grid gap-6 rounded-[var(--radius-lg)] border border-border bg-surface p-5 transition-colors hover:border-border-strong sm:grid-cols-[200px_minmax(0,1fr)]">
      <Photo lang={lang} src={event.coverUrl} alt={event.title} expected={d.events.photo} className="aspect-[4/3] sm:aspect-square" sizes="200px" />
      <div className="flex flex-col py-1">
        <h3 className="text-card-title text-text group-hover:text-primary">{event.title}</h3>
        {event.subtitle && <p className="mt-2 text-[14px] text-text-muted">{event.subtitle}</p>}
        <div className="mt-auto space-y-1.5 pt-5 text-[13px] text-text-muted">
          <p className="flex items-center gap-2"><Calendar size={14} strokeWidth={1.5} /> {tpl(d.common.dateRange, { from: fmtDate(lang, event.startsAt), to: fmtDate(lang, event.endsAt) })}</p>
          <p className="flex items-center gap-2"><MapPin size={14} strokeWidth={1.5} /> {event.location}</p>
          <p className="tabular-nums text-text">{event.seatsLeft > 0 ? tpl(d.common.seatsLeft, { n: event.seatsLeft }) : d.common.full}</p>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCard({ article, lang = 'fr' }: { article: ArticleBrief; lang?: Lang }) {
  const d = getDict(lang);
  return (
    <Link href={lp(lang, `/enseignements/${article.slug}`)} className="group block border-t border-border pt-6">
      <p className="text-overline">{d.site.categories[article.category] ?? article.category}</p>
      <h3 className="text-card-title mt-3 text-text transition-colors group-hover:text-primary">{article.title}</h3>
      <p className="mt-3 line-clamp-3 text-[14px] leading-[1.75] text-text-muted">{article.excerpt}</p>
      {article.publishedAt && <p className="mt-4 text-[12px] text-text-faint">{fmtDate(lang, article.publishedAt)}</p>}
    </Link>
  );
}

/** Rappel honnête : les contenus saisis dans l'admin restent en français (plan, étape 6.4). */
export function FrenchContentNote({ lang }: { lang: Lang }) {
  if (lang === 'fr') return null;
  return <p className="mt-4 text-[12px] text-text-faint">{getDict(lang).common.contentFr}</p>;
}
