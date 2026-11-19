import {
  BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Query, Req,
} from '@nestjs/common';
import { EboStatus, Prisma } from '@prisma/client';
import { Auth, CurrentUser, JwtUser, Staff } from '../common/auth';
import { ConsentService } from '../common/consent.service';
import { PrismaService } from '../common/prisma.service';
import { Request } from 'express';
import {
  AnswerFollowUpDto, CreateConsultationDto, CreateEboDto, CreateSlotsDto, ReplyFollowUpDto,
  ReportDto, UpdateEboDto, UpdateOfferDto, UpdateStatusDto,
} from './consultations.dto';
import { ConsultationsService } from './consultations.service';

const page = (p?: string) => Math.max(1, Number(p) || 1);
const size = (s?: string) => Math.min(100, Math.max(5, Number(s) || 20));

/** Routes publiques et client. */
@Controller()
export class ConsultationsController {
  constructor(private svc: ConsultationsService, private prisma: PrismaService, private consent: ConsentService) {}

  @Get('offers')
  offers() {
    return this.prisma.consultationOffer.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  }

  @Get('slots')
  slots(@Query('from') from?: string, @Query('to') to?: string) {
    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date(Date.now() + 30 * 86400_000);
    return this.prisma.slot.findMany({
      where: { isBooked: false, startsAt: { gte: start < new Date() ? new Date() : start, lte: end } },
      orderBy: { startsAt: 'asc' },
      select: { id: true, startsAt: true, endsAt: true },
    });
  }

  @Auth()
  @Post('consultations')
  async create(@CurrentUser() u: JwtUser, @Body() dto: CreateConsultationDto, @Req() req: Request) {
    const c = await this.svc.create(u.sub, dto);
    await this.consent.record('CONSULTATION', req, u.sub, c.id);
    return c;
  }

  @Auth()
  @Get('consultations/mine')
  mine(@CurrentUser() u: JwtUser) {
    return this.svc.mine(u.sub);
  }

  @Auth()
  @Get('consultations/:id')
  get(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.svc.get(id, u);
  }

  @Auth()
  @Post('consultations/:id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.svc.cancel(id, u);
  }

  @Auth()
  @Post('ebos/:id/accept')
  accept(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.svc.decideEbo(id, u, true);
  }

  @Auth()
  @Post('ebos/:id/decline')
  decline(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.svc.decideEbo(id, u, false);
  }

  @Auth()
  @Get('follow-ups/mine')
  followUps(@CurrentUser() u: JwtUser) {
    return this.svc.mineFollowUps(u.sub);
  }

  @Auth()
  @Post('follow-ups/:id/answer')
  answer(@Param('id') id: string, @CurrentUser() u: JwtUser, @Body() dto: AnswerFollowUpDto) {
    return this.svc.answerFollowUp(id, u, dto);
  }
}

/** Routes du prêtre / admin. */
@Staff()
@Controller('admin')
export class ConsultationsAdminController {
  constructor(private svc: ConsultationsService, private prisma: PrismaService) {}

  @Get('consultations')
  list(@Query('status') status?: string, @Query('q') q?: string, @Query('page') p?: string, @Query('pageSize') s?: string) {
    return this.svc.listAdmin({ status, q, page: page(p), pageSize: size(s) });
  }

  @Patch('consultations/:id')
  status(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.svc.setStatus(id, dto.status);
  }

  @Put('consultations/:id/report')
  report(@Param('id') id: string, @Body() dto: ReportDto) {
    return this.svc.upsertReport(id, dto);
  }

  @Post('consultations/:id/ebos')
  createEbo(@Param('id') id: string, @Body() dto: CreateEboDto) {
    return this.svc.createEbo(id, dto);
  }

  @Patch('ebos/:id')
  updateEbo(@Param('id') id: string, @Body() dto: UpdateEboDto) {
    return this.svc.updateEbo(id, dto);
  }

  @Get('ebos')
  ebos(@Query('status') status?: string) {
    return this.prisma.ebo.findMany({
      where: status ? { status: status as EboStatus } : {},
      orderBy: { updatedAt: 'desc' },
      include: { consultation: { select: { id: true, user: { select: { firstName: true, lastName: true } } } } },
      take: 200,
    });
  }

  @Get('follow-ups')
  followUps(@Query('state') state?: 'answered' | 'late' | 'all') {
    const where: Prisma.FollowUpWhereInput =
      state === 'answered' ? { answeredAt: { not: null }, priestReply: null }
        : state === 'late' ? { dueAt: { lt: new Date() }, answeredAt: null }
          : {};
    return this.prisma.followUp.findMany({
      where, orderBy: { dueAt: 'asc' }, take: 200,
      include: { consultation: { select: { id: true, question: true, user: { select: { firstName: true, lastName: true } } } } },
    });
  }

  @Patch('follow-ups/:id')
  reply(@Param('id') id: string, @Body() dto: ReplyFollowUpDto) {
    return this.svc.replyFollowUp(id, dto);
  }

  @Get('slots')
  slots(@Query('from') from?: string, @Query('to') to?: string) {
    return this.prisma.slot.findMany({
      where: {
        startsAt: { gte: from ? new Date(from) : new Date(Date.now() - 7 * 86400_000), lte: to ? new Date(to) : new Date(Date.now() + 60 * 86400_000) },
      },
      orderBy: { startsAt: 'asc' },
      include: { consultation: { select: { id: true, status: true, user: { select: { firstName: true, lastName: true } } } } },
    });
  }

  @Post('slots')
  async createSlots(@Body() dto: CreateSlotsDto) {
    const data = dto.slots.map((s) => ({ startsAt: new Date(s.startsAt), endsAt: new Date(s.endsAt) }));
    if (data.some((s) => s.endsAt <= s.startsAt)) throw new BadRequestException('Créneau invalide');
    const res = await this.prisma.slot.createMany({ data });
    return { created: res.count };
  }

  @Delete('slots/:id')
  async deleteSlot(@Param('id') id: string) {
    const slot = await this.prisma.slot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundException();
    if (slot.isBooked) throw new BadRequestException('Un créneau réservé ne peut pas être supprimé');
    await this.prisma.slot.delete({ where: { id } });
    return { ok: true };
  }

  @Get('offers')
  offers() {
    return this.prisma.consultationOffer.findMany({ orderBy: { order: 'asc' } });
  }

  @Put('offers/:id')
  updateOffer(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    const { features, ...rest } = dto;
    return this.prisma.consultationOffer.update({
      where: { id },
      data: { ...rest, ...(features ? { features: features as Prisma.InputJsonValue } : {}) },
    });
  }
}
