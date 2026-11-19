import { MailService } from '../mail/mail.service';
import { money } from '../common/util';

export const PREPARATION = [
  'Passeport valide au moins 6 mois après la date de retour',
  'Visa ou e-visa pour le Bénin, selon ta nationalité',
  'Vaccin contre la fièvre jaune : obligatoire pour entrer au Bénin',
  'Assurance voyage couvrant les frais médicaux et le rapatriement',
  'Traitement préventif contre le paludisme : à voir avec ton médecin',
];

const list = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

/** Plan §10.6 : réservation enregistrée, montant de l'acompte, liste de préparation. */
export function bookingCreatedHtml(mail: MailService, b: { title: string; start: Date; participants: number; totalCents: number; depositCents: number; currency: string }) {
  return mail.layout(
    'Ta réservation est enregistrée',
    `<p><b>${b.title}</b>, départ le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Porto-Novo' }).format(b.start)}, ${b.participants} personne(s).</p>
     <p>Total : ${money(b.totalCents, b.currency)}. Pour confirmer ta place, règle l'acompte de 30 % (${money(b.depositCents, b.currency)}) depuis ton espace. Le solde sera demandé 30 jours avant le départ.</p>
     <p><b>Pour préparer ton voyage :</b></p>${list(PREPARATION)}`,
    { label: 'Payer mon acompte', url: `${mail.web}/espace/voyages` },
  );
}

export function balanceReminderHtml(mail: MailService, b: { title: string; start: Date; dueCents: number; currency: string }) {
  return mail.layout(
    'Ton départ approche',
    `<p><b>${b.title}</b> commence le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Porto-Novo' }).format(b.start)}.</p>
     <p>Le solde de ${money(b.dueCents, b.currency)} est à régler maintenant, depuis ton espace.</p>
     <p><b>Vérifie aussi :</b></p>${list(PREPARATION)}`,
    { label: 'Régler le solde', url: `${mail.web}/espace/voyages` },
  );
}
