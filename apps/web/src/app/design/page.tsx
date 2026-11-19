'use client';

import { allOdu, buildReading, MEJI } from '@ona/core';
import { CalendarClock, Coins, Sparkle, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ElementBalance } from '@/components/astro/element-balance';
import { NatalWheel } from '@/components/astro/natal-wheel';
import { OduElements } from '@/components/odu/odu-elements';
import { OduGlyph } from '@/components/odu/odu-glyph';
import { OduMatrix } from '@/components/odu/odu-matrix';
import { OpeleCast } from '@/components/odu/opele-cast';
import { Container, NumberedRow, SectionIntro } from '@/components/site/editorial';
import { Button, ButtonLink } from '@/components/ui/button';
import { Checkbox, Field, Input, RadioCards, Select, Switch, Textarea } from '@/components/ui/field';
import { ConfirmDialog, Modal, Tabs } from '@/components/ui/overlay';
import {
  Avatar, Badge, Card, CardHeader, EmptyState, ErrorState, KeyValue, PageHeader, Skeleton, StatCard, Stepper,
} from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';

/** Catalogue interne du design system (plan, étapes 1.4 et 1.5). Non référencé publiquement. */
export default function DesignPage() {
  const toast = useToast();
  const [radio, setRadio] = useState<string>();
  const [check, setCheck] = useState(true);
  const [sw, setSw] = useState(false);
  const [tab, setTab] = useState<'a' | 'b' | 'c'>('a');
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [castKey, setCastKey] = useState(0);

  const reading = useMemo(
    () => buildReading({
      firstName: 'Ama', birthDate: '1988-11-02', birthTime: '06:15', timezone: 'Europe/Paris', latitude: 48.85, longitude: 2.35,
      answers: { blessure: 'garde', famille: 'pilier', repetition: 'souvent', domaine: 'installation', duree: 'long', intention: 'Avoir enfin mes papiers' },
    }),
    [],
  );
  const odu = allOdu().find((o) => o.id === reading.odu.id)!;

  return (
    <div className="pb-32">
      <Container className="py-16">
        <p className="text-overline">Interne</p>
        <h1 className="text-hero mt-4">Design system</h1>
        <p className="text-body mt-6 max-w-xl">Kaolin, indigo, osùn. Chaque écran est construit uniquement avec ces composants (plan §6.4).</p>
      </Container>

      <Section title="Couleurs">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {['bg', 'bg-subtle', 'surface', 'border', 'text', 'text-muted', 'text-faint', 'primary', 'primary-soft', 'accent', 'accent-soft', 'success', 'warning', 'danger', 'info', 'fire', 'earth', 'air', 'water'].map((t) => (
            <div key={t}>
              <div className="h-14 rounded-[var(--radius-md)] border border-border" style={{ background: `var(--color-${t})` }} />
              <p className="mt-1.5 text-[12px] text-text-muted">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie">
        <p className="text-overline">Sur-titre</p>
        <p className="text-hero mt-3">La vérité d'Ifá</p>
        <p className="text-section mt-3">Titre de section</p>
        <p className="text-card-title mt-3">Titre de carte</p>
        <p className="text-body mt-3 max-w-xl">Corps de texte, interlignage 1,8. Diacritiques yoruba : Ọ̀yẹ̀kú, Ìwòrì, Ọ̀wọ́nrín, Ọ̀kànràn, Òtúúrúpọ̀n, Ìrẹtẹ̀, Ọ̀ṣẹ́, Òfún, Ọ̀rúnmìlà, Èṣù, Kpɔ̀lí, Wɛ̀nlɛ̀n.</p>
        <p className="mt-3 text-[28px] font-semibold tabular-nums">1 234 567,89 €</p>
      </Section>

      <Section title="Boutons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Principal</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="ghost">Fantôme</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Chargement</Button>
          <Button disabled>Désactivé</Button>
          <Button size="sm" shape="console">Console sm</Button>
          <Button size="lg">Grand</Button>
          <ButtonLink href="/design" variant="secondary">Lien</ButtonLink>
        </div>
      </Section>

      <Section title="Badges, avatar, étapes">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutre</Badge><Badge tone="primary">Confirmée</Badge><Badge tone="success">Ebo réalisé</Badge>
          <Badge tone="warning">En attente de paiement</Badge><Badge tone="danger">Annulée</Badge><Badge tone="info">Information</Badge><Badge tone="accent">Ibi</Badge>
        </div>
        <div className="mt-6 flex items-center gap-3"><Avatar name="Ama Mensah" /><Avatar name="Kofi" size={48} /></div>
        <div className="mt-6 max-w-md"><Stepper steps={['Identité', 'Naissance', 'Questions', 'Ta phrase']} current={1} /></div>
      </Section>

      <Section title="Formulaires">
        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
          <Field label="Prénom" hint="Tel qu'on t'appelle"><Input placeholder="Ama" /></Field>
          <Field label="Email" error="Adresse invalide"><Input aria-invalid="true" defaultValue="ama@" /></Field>
          <Field label="Domaine"><Select defaultValue="amour"><option value="amour">Amour</option><option value="argent">Argent</option></Select></Field>
          <Field label="Désactivé"><Input disabled value="Lecture seule" readOnly /></Field>
          <div className="md:col-span-2"><Field label="Ta question"><Textarea placeholder="Écris ta question…" /></Field></div>
          <Checkbox checked={check} onChange={setCheck} label="J'accepte le traitement de mes données sensibles" description="Révocable à tout moment" />
          <Switch checked={sw} onChange={setSw} label="Notifications par email" />
        </div>
        <div className="mt-8 max-w-xl">
          <RadioCards name="exemple" value={radio} onChange={setRadio} options={[
            { value: 'a', label: 'Gardes tout pour toi et y repenses longtemps' },
            { value: 'b', label: 'Coupes les ponts net' },
            { value: 'c', label: "Cherches d'abord à comprendre l'autre" },
          ]} />
        </div>
      </Section>

      <Section title="Console">
        <PageHeader title="Consultations" description="Toutes les demandes, du plus récent au plus ancien." breadcrumb={[{ label: 'Admin', href: '/design' }, { label: 'Consultations' }]} actions={<Button size="sm" shape="console">Ouvrir des créneaux</Button>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Portraits (30 j)" value="1 284" delta={12} hint="vs 30 j précédents" icon={Sparkle} />
          <StatCard label="Comptes créés" value="412" delta={8} icon={Users} />
          <StatCard label="Consultations du jour" value="6" hint="prochaine à 14:00" icon={CalendarClock} />
          <StatCard label="Chiffre d'affaires" value="3 450 €" delta={-4} icon={Coins} />
        </div>
        <div className="mt-6"><Tabs value={tab} onChange={setTab} tabs={[{ value: 'a', label: 'Préparation' }, { value: 'b', label: 'Compte rendu' }, { value: 'c', label: 'Ebo', count: 2 }]} /></div>
        <Card className="mt-6">
          <CardHeader title="Résumé" description="Bloc d'information" action={<Badge tone="primary">Confirmée</Badge>} />
          <div className="p-5"><KeyValue items={[{ label: 'Client', value: 'Ama Mensah' }, { label: 'Offre', value: 'Consultation visio' }, { label: 'Rendez-vous', value: 'jeudi 26 novembre, 14:00 (heure du Bénin)' }]} /></div>
        </Card>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <EmptyState title="Aucune consultation pour le moment" description="Les nouvelles demandes apparaîtront ici." />
          <EmptyState variant="no-results" title="Aucun résultat pour ces filtres" action={<Button size="sm" variant="secondary" shape="console">Effacer les filtres</Button>} />
        </div>
        <div className="mt-4"><ErrorState description="Impossible de joindre l'API." onRetry={() => toast('Nouvel essai lancé', 'info')} /></div>
        <div className="mt-4 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-24 w-full" /></div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" shape="console" size="sm" onClick={() => setModal(true)}>Ouvrir la modale</Button>
          <Button variant="secondary" shape="console" size="sm" onClick={() => setConfirm(true)}>Action sensible</Button>
          <Button variant="secondary" shape="console" size="sm" onClick={() => toast('Compte rendu enregistré')}>Toast</Button>
        </div>
        <Modal open={modal} onClose={() => setModal(false)} title="Modale">Contenu de la modale.</Modal>
        <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} danger confirmLabel="Annuler la consultation" title="Annuler cette consultation ?" message="Le créneau sera libéré. Cette action est enregistrée dans le journal." onConfirm={() => toast('Consultation annulée')} />
      </Section>

      <Section title="Vitrine">
        <SectionIntro overline="Le constat" title="On vous a vendu la peur." text="Ce que vit la diaspora, et pourquoi la confiance a disparu." />
        <div className="mt-10 max-w-2xl">
          <NumberedRow index={1} title="On vous a vendu la peur" text="« Tu vas mourir si tu ne paies pas aujourd'hui. » Ifá ne parle jamais ainsi." />
          <NumberedRow index={2} title="Des prix qui changent sans cesse" text="Un ebo en appelle un autre, sans détail, sans fin." />
          <NumberedRow index={3} title="Personne après le paiement" text="Aucune preuve, aucun suivi, aucun compte rendu." />
        </div>
      </Section>

      <Section title="Odu">
        <div className="flex flex-wrap items-end gap-8">
          {MEJI.slice(0, 4).map((m) => (
            <div key={m.index} className="text-center">
              <OduGlyph right={m.marks} left={m.marks} size="sm" label={m.name} />
              <p className="mt-2 text-[13px] text-text">{m.name}</p>
              <p className="text-[12px] text-text-faint">{m.fon}</p>
            </div>
          ))}
          <div className="text-center">
            <OduGlyph key={castKey} right={odu.marks.right} left={odu.marks.left} size="lg" animate label={odu.name} />
            <p className="mt-2 text-[13px] text-text">{odu.name} (tracé animé)</p>
          </div>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div><p className="mb-4 text-[13px] text-text-muted">OduElements · {odu.name}</p><OduElements elements={odu.elements} /></div>
          <div className="flex flex-col items-center">
            <OpeleCast key={castKey} right={odu.marks.right} left={odu.marks.left} />
            <Button variant="ghost" size="sm" onClick={() => setCastKey((k) => k + 1)}>Rejouer</Button>
          </div>
        </div>
        <div className="mt-12"><OduMatrix /></div>
      </Section>

      <Section title="Astrologie (thème réel calculé)">
        <div className="grid items-start gap-10 md:grid-cols-[420px_minmax(0,1fr)]">
          <NatalWheel chart={reading.chart} />
          <div>
            <ElementBalance elements={reading.chart.elements} />
            <ul className="mt-8 space-y-1.5 text-[13px] text-text-muted">
              {reading.chart.planets.map((p) => (
                <li key={p.key} className="flex justify-between tabular-nums"><span>{p.glyph}{'︎'} {p.name}{p.retrograde ? ' (R)' : ''}</span><span>{p.degreeInSign.toFixed(1)}° · maison {p.house ?? '—'}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-14">
      <Container>
        <h2 className="mb-8 text-[13px] font-semibold uppercase tracking-[0.18em] text-text-faint">{title}</h2>
        {children}
      </Container>
    </section>
  );
}
