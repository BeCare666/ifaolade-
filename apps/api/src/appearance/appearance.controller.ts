import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { IMAGE_SLOTS, LOCALES, TEXT_KEYS } from './keys';

class ImageDto {
  @IsString() @MaxLength(500) url!: string;
  @IsOptional() @IsString() @MaxLength(200) alt?: string;
  @IsOptional() @IsString() @MaxLength(200) credit?: string;
}
class TextDto { @IsString() @MaxLength(4000) value!: string }
class PractitionerDto {
  @IsString() @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(160) title?: string;
  @IsOptional() @IsString() @MaxLength(200) lineage?: string;
  @IsOptional() @IsInt() @Min(1900) @Max(2100) initiatedYear?: number;
  @IsOptional() @IsString() @MaxLength(160) languages?: string;
  @IsOptional() @IsString() @MaxLength(4000) bio?: string;
  @IsOptional() @IsString() @MaxLength(500) photoUrl?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

/**
 * Refonte §8 : apparence de la vitrine modifiable dans l'admin (images, babaláwo, textes).
 * Les images ne sont acceptées que depuis TON Cloudinary, ou depuis Unsplash / Pexels (images de départ, §9).
 */
@Controller()
export class AppearanceController {
  constructor(private prisma: PrismaService, private cfg: ConfigService) {}

  private checkUrl(url: string) {
    const cloud = this.cfg.get<string>('CLOUDINARY_CLOUD_NAME');
    const ok = (cloud && url.startsWith(`https://res.cloudinary.com/${cloud}/`))
      || url.startsWith('https://images.unsplash.com/') || url.startsWith('https://images.pexels.com/');
    if (!ok) throw new BadRequestException('Image refusée : elle doit venir de ton Cloudinary (ou d\'Unsplash / Pexels).');
  }

  /** Lecture publique : tout ce dont la vitrine a besoin, pour une langue. */
  @Get('site/appearance')
  async appearance(@Query('locale') locale = 'fr') {
    const loc = (LOCALES as readonly string[]).includes(locale) ? locale : 'fr';
    const [images, practitioners, texts] = await Promise.all([
      this.prisma.siteImage.findMany(),
      this.prisma.practitioner.findMany({ where: { active: true }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
      this.prisma.siteText.findMany({ where: { locale: loc } }),
    ]);
    return {
      images: Object.fromEntries(images.map((i) => [i.key, { url: i.url, alt: i.alt, credit: i.credit }])),
      practitioners: practitioners.map(({ createdAt, updatedAt, active, ...p }) => p),
      texts: Object.fromEntries(texts.filter((t) => t.value.trim()).map((t) => [t.key, t.value])),
    };
  }

  /** Chiffres réels pour le bandeau de réassurance (refonte §6.2). Jamais inventés : masqués à zéro côté site. */
  @Get('site/stats')
  async stats() {
    const [consultations, followUps] = await Promise.all([
      this.prisma.consultation.count({ where: { status: 'COMPLETED' } }),
      this.prisma.followUp.count({ where: { answeredAt: { not: null } } }),
    ]);
    return { consultations, followUps };
  }

  // ---------- Images ----------
  @Staff() @Get('admin/site-images')
  async images() {
    const rows = await this.prisma.siteImage.findMany();
    return Object.entries(IMAGE_SLOTS).map(([key, s]) => ({ key, ...s, image: rows.find((r) => r.key === key) ?? null }));
  }

  @Staff() @Put('admin/site-images/:key')
  async setImage(@Param('key') key: string, @Body() dto: ImageDto) {
    if (!IMAGE_SLOTS[key]) throw new NotFoundException('Emplacement inconnu');
    this.checkUrl(dto.url);
    const data = { url: dto.url, alt: dto.alt ?? null, credit: dto.credit ?? null };
    return this.prisma.siteImage.upsert({ where: { key }, create: { key, ...data }, update: data });
  }

  @Staff() @Delete('admin/site-images/:key')
  async removeImage(@Param('key') key: string) {
    await this.prisma.siteImage.deleteMany({ where: { key } });
    return { ok: true };
  }

  // ---------- Babaláwo ----------
  @Staff() @Get('admin/practitioners')
  practitioners() {
    return this.prisma.practitioner.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  }

  @Staff() @Post('admin/practitioners')
  async createPractitioner(@Body() dto: PractitionerDto) {
    if (dto.photoUrl) this.checkUrl(dto.photoUrl);
    return this.prisma.practitioner.create({ data: dto });
  }

  @Staff() @Put('admin/practitioners/:id')
  async updatePractitioner(@Param('id') id: string, @Body() dto: PractitionerDto) {
    if (dto.photoUrl) this.checkUrl(dto.photoUrl);
    if (!(await this.prisma.practitioner.findUnique({ where: { id } }))) throw new NotFoundException('Fiche introuvable');
    return this.prisma.practitioner.update({ where: { id }, data: { ...dto, photoUrl: dto.photoUrl || null } });
  }

  @Staff() @Delete('admin/practitioners/:id')
  async deletePractitioner(@Param('id') id: string) {
    await this.prisma.practitioner.deleteMany({ where: { id } });
    return { ok: true };
  }

  // ---------- Textes ----------
  @Staff() @Get('admin/site-texts')
  async texts() {
    const rows = await this.prisma.siteText.findMany();
    return Object.entries(TEXT_KEYS).map(([key, label]) => ({
      key, label, values: Object.fromEntries(LOCALES.map((l) => [l, rows.find((r) => r.key === key && r.locale === l)?.value ?? ''])),
    }));
  }

  @Staff() @Put('admin/site-texts/:key/:locale')
  async setText(@Param('key') key: string, @Param('locale') locale: string, @Body() dto: TextDto) {
    if (!TEXT_KEYS[key]) throw new NotFoundException('Texte inconnu');
    if (!(LOCALES as readonly string[]).includes(locale)) throw new BadRequestException('Langue inconnue');
    const value = dto.value.trim();
    if (!value) { await this.prisma.siteText.deleteMany({ where: { key, locale } }); return { key, locale, value: '' }; }
    return this.prisma.siteText.upsert({ where: { key_locale: { key, locale } }, create: { key, locale, value }, update: { value } });
  }
}
