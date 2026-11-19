import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Auth, CurrentUser, JwtUser, Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { slugify } from '../common/util';
import { NotificationsService } from '../common/notifications.service';
import { MailService } from '../mail/mail.service';
import { sendTicket } from './tickets';

class EventDto {
  @IsString() @MaxLength(160) title: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsString() description: string;
  @IsString() location: string;
  @IsDateString() startsAt: string;
  @IsDateString() endsAt: string;
  @IsOptional() @IsString() coverUrl?: string;
  @IsInt() @Min(0) priceCents: number;
  @IsInt() @Min(1) capacity: number;
  @IsOptional() @IsBoolean() published?: boolean;
}

class RegisterDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(10) seats: number;
}

const toData = (d: EventDto) => ({
  title: d.title, slug: d.slug ? slugify(d.slug) : slugify(d.title), subtitle: d.subtitle, description: d.description,
  location: d.location, startsAt: new Date(d.startsAt), endsAt: new Date(d.endsAt), coverUrl: d.coverUrl,
  priceCents: d.priceCents, capacity: d.capacity, published: d.published ?? true,
});

@Controller()
export class EventsController {
  constructor(private prisma: PrismaService, private mail: MailService, private notify: NotificationsService) {}

  private async seatsLeft(eventId: string, capacity: number) {
    const agg = await this.prisma.eventRegistration.aggregate({
      where: { eventId, status: { not: 'CANCELLED' } }, _sum: { seats: true },
    });
    return capacity - (agg._sum.seats ?? 0);
  }

  @Get('events')
  async list() {
    const events = await this.prisma.event.findMany({
      where: { published: true, endsAt: { gt: new Date() } }, orderBy: { startsAt: 'asc' },
    });
    return Promise.all(events.map(async (e) => ({ ...e, seatsLeft: await this.seatsLeft(e.id, e.capacity) })));
  }

  @Get('events/:slug')
  async one(@Param('slug') slug: string) {
    const e = await this.prisma.event.findUnique({ where: { slug } });
    if (!e || !e.published) throw new NotFoundException('Événement introuvable');
    return { ...e, seatsLeft: await this.seatsLeft(e.id, e.capacity) };
  }

  @Auth()
  @Get('events/registrations/mine')
  mine(@CurrentUser() u: JwtUser) {
    return this.prisma.eventRegistration.findMany({
      where: { userId: u.sub }, orderBy: { createdAt: 'desc' }, include: { event: true },
    });
  }

  @Auth()
  @Post('events/:id/register')
  async register(@Param('id') id: string, @CurrentUser() u: JwtUser, @Body() dto: RegisterDto) {
    const e = await this.prisma.event.findUnique({ where: { id } });
    if (!e || !e.published || e.endsAt < new Date()) throw new NotFoundException('Événement indisponible');
    if ((await this.seatsLeft(e.id, e.capacity)) < dto.seats) throw new BadRequestException('Plus assez de places');
    const total = e.priceCents * dto.seats;
    const reg = await this.prisma.eventRegistration.create({
      data: { eventId: e.id, userId: u.sub, seats: dto.seats, totalCents: total, status: total === 0 ? 'PAID' : 'PENDING' },
    });
    if (reg.status === 'PAID') await sendTicket(this.prisma, this.mail, reg.id);
    await this.mail.notifyAdmin('Inscription événement', `<p>${e.title} · ${dto.seats} place(s)</p>`);
    await this.notify.toStaff(`Inscription : ${e.title}`, `/admin/evenements/${e.id}`, `${dto.seats} place(s)`);
    return reg;
  }

  /** Contrôle à l'entrée (QR code = identifiant de l'inscription). */
  @Staff()
  @Get('admin/registrations/:id/check')
  async check(@Param('id') id: string) {
    const r = await this.prisma.eventRegistration.findUnique({
      where: { id }, include: { event: true, user: { select: { firstName: true, lastName: true } } },
    });
    if (!r) throw new NotFoundException('Billet inconnu');
    return { valid: r.status === 'PAID', alreadyIn: !!r.checkedInAt, ...r };
  }

  /** Enregistre l'entrée : un billet ne peut servir qu'une fois. */
  @Staff()
  @Post('admin/registrations/:id/checkin')
  async checkin(@Param('id') id: string) {
    const r = await this.prisma.eventRegistration.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Billet inconnu');
    if (r.status !== 'PAID') throw new BadRequestException('Billet non payé ou annulé');
    const done = await this.prisma.eventRegistration.updateMany({ where: { id, checkedInAt: null }, data: { checkedInAt: new Date() } });
    if (done.count === 0) throw new BadRequestException(`Billet déjà utilisé le ${r.checkedInAt?.toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' })}`);
    return { ok: true };
  }

  @Staff() @Get('admin/events')
  adminList() {
    return this.prisma.event.findMany({ orderBy: { startsAt: 'desc' } });
  }

  @Staff() @Get('admin/events/:id/registrations')
  registrations(@Param('id') id: string) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId: id }, orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    });
  }

  @Staff() @Post('admin/events')
  create(@Body() dto: EventDto) {
    return this.prisma.event.create({ data: toData(dto) });
  }

  @Staff() @Put('admin/events/:id')
  update(@Param('id') id: string, @Body() dto: EventDto) {
    return this.prisma.event.update({ where: { id }, data: toData(dto) });
  }

  @Staff() @Delete('admin/events/:id')
  async remove(@Param('id') id: string) {
    if (await this.prisma.eventRegistration.count({ where: { eventId: id, status: { not: 'CANCELLED' } } })) {
      throw new BadRequestException('Cet événement a des inscrits : dépublie-le plutôt');
    }
    await this.prisma.event.delete({ where: { id } });
    return { ok: true };
  }
}
