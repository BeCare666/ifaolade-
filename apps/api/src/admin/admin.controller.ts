import { Controller, Get, Param, Query } from '@nestjs/common';
import { Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { UsersService } from '../users/users.service';

const DAY = 86400_000;

@Staff()
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService, private users: UsersService) {}

  /** Bloc « À traiter » du tableau de bord (plan §9.1). */
  @Get('todo')
  async todo() {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + DAY);
    const [today, drafts, toPerform, performedNoProof, answeredFollowUps, depositPaid, messages] = await Promise.all([
      this.prisma.consultation.count({ where: { status: 'CONFIRMED', slot: { startsAt: { gte: startOfDay, lt: endOfDay } } } }),
      this.prisma.consultation.count({
        where: { status: 'CONFIRMED', OR: [{ report: null }, { report: { publishedAt: null } }], createdAt: { lt: now } },
      }),
      this.prisma.ebo.count({ where: { status: 'PAID' } }),
      this.prisma.ebo.count({ where: { status: 'PERFORMED', proofVideoUrl: null } }),
      this.prisma.followUp.count({ where: { answeredAt: { not: null }, priestReply: null } }),
      this.prisma.booking.count({ where: { status: 'DEPOSIT_PAID' } }),
      this.prisma.contactMessage.count({ where: { createdAt: { gt: new Date(now.getTime() - 7 * DAY) } } }),
    ]);
    return { today, drafts, toPerform, performedNoProof, answeredFollowUps, depositPaid, messages };
  }

  /** Indicateurs sur 30 jours, comparés aux 30 jours précédents. */
  @Get('stats')
  async stats() {
    const now = Date.now();
    const cur = { gte: new Date(now - 30 * DAY) };
    const prev = { gte: new Date(now - 60 * DAY), lt: new Date(now - 30 * DAY) };
    const period = async (createdAt: { gte: Date; lt?: Date }) => {
      const [readings, users, freeConsults, paidConsults, revenue, progress] = await Promise.all([
        this.prisma.reading.count({ where: { createdAt } }),
        this.prisma.user.count({ where: { createdAt, role: 'CLIENT' } }),
        this.prisma.consultation.count({ where: { createdAt, isFirstFree: true, status: { not: 'CANCELLED' } } }),
        this.prisma.consultation.count({ where: { createdAt, isFirstFree: false, status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
        this.prisma.payment.aggregate({ where: { createdAt, status: 'SUCCEEDED' }, _sum: { amountCents: true } }),
        this.prisma.followUp.aggregate({ where: { answeredAt: createdAt }, _avg: { progress: true } }),
      ]);
      return {
        readings, users, freeConsults, paidConsults,
        revenueCents: revenue._sum.amountCents ?? 0,
        avgProgress: progress._avg.progress ?? null,
      };
    };
    const [current, previous] = await Promise.all([period(cur), period(prev)]);

    const domains = await this.prisma.reading.findMany({ where: { createdAt: cur }, select: { input: true } });
    const byDomain: Record<string, number> = {};
    for (const r of domains) {
      const d = (r.input as { answers?: Record<string, string> })?.answers?.domaine ?? 'non précisé';
      byDomain[d] = (byDomain[d] ?? 0) + 1;
    }
    return { current, previous, byDomain };
  }

  @Get('activity')
  async activity() {
    const [consultations, payments, readings] = await Promise.all([
      this.prisma.consultation.findMany({ orderBy: { updatedAt: 'desc' }, take: 8, include: { user: { select: { firstName: true } }, offer: { select: { title: true } } } }),
      this.prisma.payment.findMany({ where: { status: 'SUCCEEDED' }, orderBy: { updatedAt: 'desc' }, take: 8, include: { user: { select: { firstName: true } } } }),
      this.prisma.reading.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, createdAt: true, sunSign: true, userId: true } }),
    ]);
    const items = [
      ...consultations.map((c) => ({ at: c.updatedAt, kind: 'consultation', text: `${c.user.firstName} · ${c.offer.title} · ${c.status}`, href: `/admin/consultations/${c.id}` })),
      ...payments.map((p) => ({ at: p.updatedAt, kind: 'payment', text: `${p.user.firstName} · paiement ${p.purpose} · ${(p.amountCents / 100).toFixed(2)} ${p.currency}`, href: '/admin/paiements' })),
      ...readings.map((r) => ({ at: r.createdAt, kind: 'reading', text: `Nouveau portrait (${r.sunSign})${r.userId ? '' : ' · anonyme'}`, href: null })),
    ];
    return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 15);
  }

  @Get('users')
  async list(@Query('q') q?: string, @Query('page') p?: string) {
    const page = Math.max(1, Number(p) || 1);
    const where = q
      ? { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { email: { contains: q } }] }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 25, take: 25,
        select: {
          id: true, firstName: true, lastName: true, email: true, country: true, role: true, emailVerified: true, createdAt: true,
          _count: { select: { consultations: true, readings: true, bookings: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  @Get('users/:id')
  dossier(@Param('id') id: string) {
    return this.users.dossier(id, true);
  }
}
