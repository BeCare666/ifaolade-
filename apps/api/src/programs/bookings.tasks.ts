import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { MailService } from '../mail/mail.service';
import { balanceReminderHtml } from './bookings.mail';

/** Plan §14.6 : rappel du solde des voyages à J-30, une seule fois par réservation. */
@Injectable()
export class BookingsTasks {
  private log = new Logger('Voyages');
  constructor(private prisma: PrismaService, private mail: MailService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM, { timeZone: 'Africa/Porto-Novo' })
  async balanceReminders() {
    const limit = new Date(Date.now() + 30 * 86400_000);
    const due = await this.prisma.booking.findMany({
      where: { status: 'DEPOSIT_PAID', balanceReminderAt: null, session: { startDate: { lte: limit, gt: new Date() } } },
      include: { user: true, session: { include: { program: true } } },
      take: 200,
    });
    for (const b of due) {
      await this.mail.send(b.user.email, `Solde à régler : ${b.session.program.title}`, balanceReminderHtml(this.mail, {
        title: b.session.program.title, start: b.session.startDate, dueCents: b.totalCents - b.paidCents, currency: b.currency,
      }), b.user.firstName);
      await this.prisma.booking.update({ where: { id: b.id }, data: { balanceReminderAt: new Date() } });
    }
    if (due.length) this.log.log(`${due.length} rappel(s) de solde envoyé(s)`);
  }
}
