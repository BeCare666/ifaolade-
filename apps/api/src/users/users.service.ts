import { Injectable, NotFoundException } from '@nestjs/common';
import { publicUser } from '../auth/auth.service';
import { PrismaService } from '../common/prisma.service';
import { token } from '../common/util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Dossier spirituel complet. `staff` = vue prêtre (inclut notes privées et brouillons). */
  async dossier(userId: string, staff: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Client introuvable');
    const [readings, consultations, ewos, bookings, registrations] = await Promise.all([
      this.prisma.reading.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' },
        select: { id: true, oduId: true, sunSign: true, createdAt: true },
      }),
      this.prisma.consultation.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' },
        include: { offer: true, slot: true, report: true, ebos: true, followUps: { orderBy: { dueAt: 'asc' } } },
      }),
      this.prisma.ewo.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.booking.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' },
        include: { session: { include: { program: { select: { title: true, slug: true, kind: true } } } } },
      }),
      this.prisma.eventRegistration.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' },
        include: { event: { select: { title: true, slug: true, startsAt: true, location: true } } },
      }),
    ]);
    return {
      user: publicUser(user),
      readings,
      consultations: consultations.map((c) => sanitizeConsultation(c, staff)),
      ewos,
      bookings,
      registrations,
    };
  }

  async anonymize(userId: string) {
    const ghost = `supprime-${token(6)}@anonyme.invalid`;
    await this.prisma.$transaction([
      this.prisma.reading.deleteMany({ where: { userId } }),
      this.prisma.ewo.deleteMany({ where: { userId } }),
      this.prisma.notification.deleteMany({ where: { userId } }),
      this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          email: ghost, firstName: 'Compte supprimé', lastName: null, phone: null, country: null, city: null, avatarUrl: null,
          passwordHash: token(32), emailToken: null, resetToken: null, resetExpires: null,
        },
      }),
    ]);
  }
}

type AnyConsultation = {
  report: { privateNotes: string | null; publishedAt: Date | null } | null;
  [k: string]: unknown;
};

/** Règle 4.9 : les notes privées et les brouillons ne sortent jamais vers le client. */
export function sanitizeConsultation<T extends AnyConsultation>(c: T, staff: boolean): T {
  if (staff) return c;
  const report = c.report && c.report.publishedAt ? { ...c.report, privateNotes: null } : null;
  return { ...c, report };
}
