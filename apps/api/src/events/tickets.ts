import { PrismaService } from '../common/prisma.service';
import { frDate } from '../common/util';
import { MailService } from '../mail/mail.service';

/** Email du billet (plan §10.7) : envoyé quand l'inscription est confirmée (gratuite ou payée). */
export async function sendTicket(prisma: PrismaService, mail: MailService, registrationId: string) {
  const r = await prisma.eventRegistration.findUnique({ where: { id: registrationId }, include: { event: true, user: true } });
  if (!r || r.status !== 'PAID') return;
  await mail.send(
    r.user.email,
    `Ton billet : ${r.event.title}`,
    mail.layout(
      'Ton billet est confirmé',
      `<p><b>${r.event.title}</b><br/>${frDate(r.event.startsAt)}<br/>${r.event.location}</p>
       <p>${r.seats} place(s). Code du billet, à présenter à l'entrée :</p>
       <p style="font-family:monospace;font-size:18px;letter-spacing:.08em;color:#17150F">${r.id}</p>
       <p>Le QR code de ton billet est aussi disponible dans ton espace.</p>`,
      { label: 'Voir mon billet', url: `${mail.web}/espace/evenements` },
    ),
    r.user.firstName,
  );
}
