import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, Query,
} from '@nestjs/common';
import { Prisma, ProgramKind } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min,
} from 'class-validator';
import { Auth, CurrentUser, isStaff, JwtUser, Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { slugify } from '../common/util';
import { NotificationsService } from '../common/notifications.service';
import { SettingsService } from '../common/settings.service';
import { MailService } from '../mail/mail.service';
import { bookingCreatedHtml } from './bookings.mail';

class ProgramDto {
  @IsIn(['INITIATION', 'TOUR', 'RETREAT']) kind: ProgramKind;
  @IsString() @MaxLength(160) title: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsString() description: string;
  @IsInt() @Min(1) durationDays: number;
  @IsInt() @Min(0) priceCents: number;
  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsArray() gallery?: string[];
  @IsOptional() @IsArray() itinerary?: { day: number; title: string; text: string }[];
  @IsOptional() @IsArray() includes?: string[];
  @IsOptional() @IsBoolean() published?: boolean;
}

class SessionDto {
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsInt() @Min(1) capacity: number;
}

class BookingDto {
  @IsString() sessionId: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(20) participants: number;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

const json = (v: unknown) => (v === undefined ? undefined : (v as Prisma.InputJsonValue));

function toData(dto: ProgramDto) {
  return {
    kind: dto.kind, title: dto.title, slug: dto.slug ? slugify(dto.slug) : slugify(dto.title),
    subtitle: dto.subtitle, description: dto.description, durationDays: dto.durationDays,
    priceCents: dto.priceCents, coverUrl: dto.coverUrl, published: dto.published ?? true,
    gallery: json(dto.gallery), itinerary: json(dto.itinerary), includes: json(dto.includes),
  };
}

async function seatsLeft(prisma: PrismaService, sessionId: string, capacity: number) {
  const agg = await prisma.booking.aggregate({
    where: { sessionId, status: { not: 'CANCELLED' } }, _sum: { participants: true },
  });
  return capacity - (agg._sum.participants ?? 0);
}

@Controller()
export class ProgramsController {
  constructor(private prisma: PrismaService, private mail: MailService, private settings: SettingsService, private notify: NotificationsService) {}

  // ---------- Public ----------
  @Get('programs')
  list(@Query('kind') kind?: string) {
    return this.prisma.program.findMany({
      where: { published: true, ...(kind ? { kind: kind as ProgramKind } : {}) },
      orderBy: { createdAt: 'asc' },
      include: { sessions: { where: { startDate: { gt: new Date() } }, orderBy: { startDate: 'asc' }, take: 1 } },
    });
  }

  @Get('programs/:slug')
  async one(@Param('slug') slug: string) {
    const p = await this.prisma.program.findUnique({
      where: { slug },
      include: { sessions: { where: { startDate: { gt: new Date() } }, orderBy: { startDate: 'asc' } } },
    });
    if (!p || !p.published) throw new NotFoundException('Programme introuvable');
    const sessions = await Promise.all(p.sessions.map(async (s) => ({ ...s, seatsLeft: await seatsLeft(this.prisma, s.id, s.capacity) })));
    return { ...p, sessions };
  }

  // ---------- Client ----------
  @Auth()
  @Post('bookings')
  async book(@CurrentUser() u: JwtUser, @Body() dto: BookingDto) {
    const s = await this.prisma.programSession.findUnique({ where: { id: dto.sessionId }, include: { program: true } });
    if (!s || !s.program.published || s.startDate < new Date()) throw new NotFoundException('Session indisponible');
    if ((await seatsLeft(this.prisma, s.id, s.capacity)) < dto.participants) throw new BadRequestException('Plus assez de places sur cette session');
    const booking = await this.prisma.booking.create({
      data: {
        sessionId: s.id, userId: u.sub, participants: dto.participants, notes: dto.notes,
        totalCents: s.program.priceCents * dto.participants, currency: s.program.currency,
      },
    });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: u.sub } });
    await this.mail.send(user.email, `Réservation : ${s.program.title}`, bookingCreatedHtml(this.mail, {
      title: s.program.title, start: s.startDate, participants: dto.participants,
      totalCents: booking.totalCents, depositCents: Math.round(booking.totalCents * Number(await this.settings.get('booking.depositRate'))), currency: booking.currency,
    }), user.firstName);
    await this.mail.notifyAdmin('Nouvelle réservation', `<p>${s.program.title} · ${dto.participants} participant(s) · ${user.firstName}</p>`);
    await this.notify.toStaff(`Nouvelle réservation : ${s.program.title}`, '/admin/reservations', `${user.firstName} · ${dto.participants} pers.`);
    return booking;
  }

  @Auth()
  @Get('bookings/mine')
  mine(@CurrentUser() u: JwtUser) {
    return this.prisma.booking.findMany({
      where: { userId: u.sub }, orderBy: { createdAt: 'desc' },
      include: { session: { include: { program: true } } },
    });
  }

  @Auth()
  @Post('bookings/:id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    const b = await this.prisma.booking.findUnique({ where: { id } });
    if (!b) throw new NotFoundException();
    if (b.userId !== u.sub && !isStaff(u)) throw new ForbiddenException();
    if (b.status === 'CANCELLED') return b;
    const updated = await this.prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
    await this.mail.notifyAdmin('Réservation annulée', `<p>Réservation ${id} (déjà payé : ${b.paidCents / 100} €) — remboursement selon CGV.</p>`);
    return updated;
  }

  // ---------- Admin ----------
  @Staff() @Get('admin/programs')
  adminList() {
    return this.prisma.program.findMany({ orderBy: { createdAt: 'desc' }, include: { sessions: { orderBy: { startDate: 'asc' } } } });
  }

  @Staff() @Post('admin/programs')
  create(@Body() dto: ProgramDto) {
    return this.prisma.program.create({ data: toData(dto) });
  }

  @Staff() @Put('admin/programs/:id')
  update(@Param('id') id: string, @Body() dto: ProgramDto) {
    return this.prisma.program.update({ where: { id }, data: toData(dto) });
  }

  @Staff() @Delete('admin/programs/:id')
  async remove(@Param('id') id: string) {
    const bookings = await this.prisma.booking.count({ where: { session: { programId: id }, status: { not: 'CANCELLED' } } });
    if (bookings) throw new BadRequestException('Ce programme a des réservations : dépublie-le plutôt');
    await this.prisma.programSession.deleteMany({ where: { programId: id } });
    await this.prisma.program.delete({ where: { id } });
    return { ok: true };
  }

  @Staff() @Post('admin/programs/:id/sessions')
  addSession(@Param('id') id: string, @Body() dto: SessionDto) {
    return this.prisma.programSession.create({
      data: { programId: id, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate), capacity: dto.capacity },
    });
  }

  @Staff() @Delete('admin/sessions/:id')
  async removeSession(@Param('id') id: string) {
    if (await this.prisma.booking.count({ where: { sessionId: id, status: { not: 'CANCELLED' } } })) {
      throw new BadRequestException('Cette session a des réservations');
    }
    await this.prisma.programSession.delete({ where: { id } });
    return { ok: true };
  }

  @Staff() @Get('admin/bookings')
  bookings(@Query('status') status?: string) {
    return this.prisma.booking.findMany({
      where: status ? { status: status as 'PENDING' | 'DEPOSIT_PAID' | 'PAID' | 'CANCELLED' } : {},
      orderBy: { createdAt: 'desc' }, take: 200,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, country: true } },
        session: { include: { program: { select: { title: true } } } },
      },
    });
  }
}
