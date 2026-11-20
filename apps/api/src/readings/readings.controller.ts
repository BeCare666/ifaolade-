import {
  BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Req,
} from '@nestjs/common';
import { buildReading, cleanImprint, Reading as CoreReading, SIGNS } from '@ona/core';
import { Prisma, Reading } from '@prisma/client';
import {
  IsIn, IsLatitude, IsLongitude, IsObject, IsOptional, IsString, Matches, MaxLength,
} from 'class-validator';
import { Auth, CurrentUser, isStaff, JwtUser, OptionalAuth } from '../common/auth';
import { Request } from 'express';
import { ConsentService } from '../common/consent.service';
import { PrismaService } from '../common/prisma.service';
import { PortraitTextsService } from './portrait-texts.service';

class CreateReadingDto {
  @IsString() @MaxLength(60) firstName: string;
  @IsOptional() @IsString() @MaxLength(60) lastName?: string;
  @IsOptional() @IsIn(['f', 'm', 'x']) gender?: 'f' | 'm' | 'x';
  @Matches(/^\d{4}-\d{2}-\d{2}$/) birthDate: string;
  @IsOptional() @Matches(/^\d{1,2}:\d{2}$/) birthTime?: string;
  @IsOptional() @IsString() @MaxLength(160) birthPlace?: string;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;
  @IsOptional() @IsString() @MaxLength(64) timezone?: string;
  @IsObject() answers: Record<string, string>;
  @IsIn([true]) consent: boolean; // consentement explicite, données sensibles (plan §15.2)
  @IsOptional() @IsIn(['fr', 'en', 'yo']) locale?: 'fr' | 'en' | 'yo'; // étape 6.4
  /** Empreinte du moment (R15) : trois mesures du geste, bornées par cleanImprint. */
  @IsOptional() @IsObject() imprint?: Record<string, unknown>;
}

@Controller('readings')
export class ReadingsController {
  constructor(private prisma: PrismaService, private texts: PortraitTextsService, private consent: ConsentService) {}

  @OptionalAuth()
  @Post()
  async create(@Body() dto: CreateReadingDto, @Req() req: Request, @CurrentUser() u?: JwtUser) {
    const year = Number(dto.birthDate.slice(0, 4));
    if (year < 1900 || new Date(dto.birthDate) > new Date()) throw new BadRequestException('Date de naissance invalide');
    const answers: Record<string, string> = {};
    for (const [k, v] of Object.entries(dto.answers || {})) answers[k] = String(v).slice(0, 400);

    const imprint = cleanImprint(dto.imprint);
    let result: CoreReading;
    try {
      result = buildReading({ ...dto, answers, imprint }, await this.texts.validated(), dto.locale ?? 'fr');
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
    const { consent: _c, ...input } = dto;
    const reading = await this.prisma.reading.create({
      data: {
        userId: u?.sub ?? null,
        input: { ...input, answers, imprint, consentAt: new Date().toISOString() } as unknown as Prisma.InputJsonValue,
        result: result as unknown as Prisma.InputJsonValue,
        oduId: result.odu.id,
        sunSign: SIGNS[result.chart.planets[0].sign].key,
      },
    });
    await this.consent.record('PORTRAIT', req, u?.sub, reading.id);
    return view(reading, !!u);
  }

  @Auth()
  @Get('mine')
  async mine(@CurrentUser() u: JwtUser) {
    const list = await this.prisma.reading.findMany({ where: { userId: u.sub }, orderBy: { createdAt: 'desc' } });
    return list.map((r) => view(r, true));
  }

  @OptionalAuth()
  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() u?: JwtUser) {
    const r = await this.prisma.reading.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Portrait introuvable');
    if (r.userId && r.userId !== u?.sub && !isStaff(u)) throw new ForbiddenException();
    return view(r, !!r.userId && (r.userId === u?.sub || isStaff(u)));
  }

  /** Après inscription : le portrait anonyme est rattaché au compte. */
  @Auth()
  @Post(':id/claim')
  async claim(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    const r = await this.prisma.reading.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Portrait introuvable');
    if (r.userId && r.userId !== u.sub) throw new ForbiddenException();
    const updated = await this.prisma.reading.update({ where: { id }, data: { userId: u.sub } });
    await this.consent.claim(id, u.sub);
    return view(updated, true);
  }
}

function view(r: Reading, full: boolean) {
  const result = r.result as unknown as CoreReading;
  const reading = full
    ? result
    : { ...result, sections: result.sections.map((s) => (s.preview ? s : { ...s, paragraphs: [], locked: true })) };
  return { id: r.id, createdAt: r.createdAt, claimed: !!r.userId, full, reading };
}
