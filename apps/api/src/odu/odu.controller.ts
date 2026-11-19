import { BadRequestException, Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { allOdu, Odu, oduById, oduBySlug } from '@ona/core';
import { OduContent, Prisma } from '@prisma/client';
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';

class OduContentDto {
  @IsOptional() @IsString() summary?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) keywords?: string[];
  @IsOptional() @IsString() body?: string;
}

/** Domaines de vie d'une consultation (plan, étape 5.9). */
export const DOMAINS = ['amour', 'argent', 'sante', 'famille', 'installation', 'spirituel', 'enfants'] as const;
const isDomain = (d: string) => (DOMAINS as readonly string[]).includes(d);

class DomainTextDto {
  @IsString() @MaxLength(20000) text!: string;
  @IsBoolean() published!: boolean;
}

const brief = (o: Odu, c?: OduContent) => ({
  id: o.id, slug: o.slug, name: o.name, fonName: o.fonName, isMeji: o.isMeji, rank: o.rank,
  binary: o.binary, marks: o.marks, rightSlug: o.right.ascii, leftSlug: o.left.ascii,
  keywords: (c?.keywords as string[] | null) ?? o.keywords,
  hasTeaching: !!c?.body,
});

@Controller()
export class OduController {
  constructor(private prisma: PrismaService) {}

  @Get('odu')
  async list() {
    const contents = await this.prisma.oduContent.findMany();
    const map = new Map(contents.map((c) => [c.oduId, c]));
    return allOdu().map((o) => brief(o, map.get(o.id)));
  }

  @Get('odu/:slug')
  async one(@Param('slug') slug: string) {
    const o = oduBySlug(slug);
    if (!o) throw new NotFoundException('Odu introuvable');
    const c = await this.prisma.oduContent.findUnique({ where: { oduId: o.id } });
    const rightMeji = oduById(o.right.index * 16 + o.right.index)!;
    const leftMeji = oduById(o.left.index * 16 + o.left.index)!;
    return {
      ...brief(o, c ?? undefined),
      elements: o.elements,
      essence: c?.summary || o.essence,
      teaching: c?.body ?? null,
      right: { name: o.right.name, fon: o.right.fon, slug: rightMeji.slug },
      left: { name: o.left.name, fon: o.left.fon, slug: leftMeji.slug },
      prev: o.rank > 1 ? allOdu()[o.rank - 2].slug : null,
      next: o.rank < 256 ? allOdu()[o.rank].slug : null,
    };
  }

  /**
   * Lecture d'un Odu dans un domaine (« J'ai déjà mon Odu »). Uniquement des textes publiés par le prêtre.
   * Pour un Ọmọ Odù sans texte propre, on renvoie aussi les textes publiés des deux Méjì qui le composent,
   * présentés comme tels (jambe droite qui gouverne, jambe gauche qui nuance). Rien n'est inventé.
   */
  @Get('odu/:slug/lecture')
  async lecture(@Param('slug') slug: string, @Query('domain') domain: string) {
    const o = oduBySlug(slug);
    if (!o) throw new NotFoundException('Odu introuvable');
    if (!isDomain(domain)) throw new BadRequestException('Domaine inconnu');
    const rightId = o.right.index * 17;
    const leftId = o.left.index * 17;
    const ids = [...new Set([o.id, rightId, leftId])];
    const rows = await this.prisma.oduDomainText.findMany({ where: { oduId: { in: ids }, domain, published: true } });
    const pick = (id: number) => rows.find((r) => r.oduId === id)?.text ?? null;
    const own = pick(o.id);
    return {
      domain,
      own,
      right: !o.isMeji && !own ? pick(rightId) : null,
      left: !o.isMeji && !own && leftId !== rightId ? pick(leftId) : null,
    };
  }

  @Staff()
  @Get('admin/odu/:id/domains')
  async domains(@Param('id', ParseIntPipe) id: number) {
    if (!oduById(id)) throw new NotFoundException('Odu introuvable');
    return this.prisma.oduDomainText.findMany({ where: { oduId: id } });
  }

  @Staff()
  @Put('admin/odu/:id/domains/:domain')
  async saveDomain(@Param('id', ParseIntPipe) id: number, @Param('domain') domain: string, @Body() dto: DomainTextDto) {
    if (!oduById(id)) throw new NotFoundException('Odu introuvable');
    if (!isDomain(domain)) throw new BadRequestException('Domaine inconnu');
    const text = dto.text.trim();
    if (dto.published && !text) throw new BadRequestException('Un texte vide ne peut pas être publié');
    const data = { text, published: dto.published };
    return this.prisma.oduDomainText.upsert({ where: { oduId_domain: { oduId: id, domain } }, create: { oduId: id, domain, ...data }, update: data });
  }

  @Staff()
  @Put('admin/odu/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: OduContentDto) {
    if (!oduById(id)) throw new NotFoundException('Odu introuvable');
    const data = {
      summary: dto.summary,
      body: dto.body,
      keywords: dto.keywords as Prisma.InputJsonValue | undefined,
    };
    return this.prisma.oduContent.upsert({ where: { oduId: id }, create: { oduId: id, ...data }, update: data });
  }
}
