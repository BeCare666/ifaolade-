import { ButtonLink } from '@/components/ui/button';
import { Container } from './editorial';

/** Page d'attente pour les parcours des phases suivantes (plan §16). À supprimer à mesure qu'ils sont livrés. */
export function ComingSoon({ overline, title, text }: { overline: string; title: string; text: string }) {
  return (
    <Container className="py-28 lg:py-36">
      <div className="max-w-2xl">
        <p className="text-overline">{overline}</p>
        <h1 className="text-section mt-5 text-text">{title}</h1>
        <p className="text-body mt-6">{text}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/consultations" variant="secondary">Voir les consultations</ButtonLink>
          <ButtonLink href="/contact" variant="ghost">Nous écrire</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
