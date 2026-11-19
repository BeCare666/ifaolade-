import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { ConsultationsService } from './consultations.service';

/** Tâches planifiées (plan §14.6). */
@Injectable()
export class ConsultationsTasks {
  private log = new Logger('Tâches');
  constructor(private svc: ConsultationsService, private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async releaseUnpaid() {
    const n = await this.svc.releaseUnpaid();
    if (n) this.log.log(`${n} créneau(x) libéré(s) faute de paiement`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async hourly() {
    const reminders = await this.svc.sendAppointmentReminders();
    const followUps = await this.svc.sendDueFollowUps();
    if (reminders || followUps) this.log.log(`Rappels RDV : ${reminders} · Suivis : ${followUps}`);
  }

  /** Promesse faite au consentement : un portrait réalisé sans compte est supprimé après 90 jours. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeAnonymousReadings() {
    const { count } = await this.prisma.reading.deleteMany({
      where: { userId: null, createdAt: { lt: new Date(Date.now() - 90 * 86400_000) } },
    });
    if (count) this.log.log(`${count} portrait(s) anonyme(s) de plus de 90 jours supprimé(s)`);
  }
}
