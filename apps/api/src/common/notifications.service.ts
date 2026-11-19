import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Étape 2.1 : la cloche. Une notification ne doit jamais faire échouer l'action qui la déclenche. */
@Injectable()
export class NotificationsService {
  private log = new Logger('Notifications');
  constructor(private prisma: PrismaService) {}

  async toUser(userId: string, title: string, href?: string, body?: string) {
    try {
      await this.prisma.notification.create({ data: { userId, title, href, body } });
    } catch (e) {
      this.log.error(`Notification non créée : ${(e as Error).message}`);
    }
  }

  async toStaff(title: string, href?: string, body?: string) {
    try {
      const staff = await this.prisma.user.findMany({ where: { role: { in: ['ADMIN', 'PRIEST'] } }, select: { id: true } });
      if (staff.length) await this.prisma.notification.createMany({ data: staff.map((s) => ({ userId: s.id, title, href, body })) });
    } catch (e) {
      this.log.error(`Notification équipe non créée : ${(e as Error).message}`);
    }
  }
}
