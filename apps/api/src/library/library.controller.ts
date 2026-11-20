import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { isLibraryKind, LIBRARY_CATEGORIES, LIBRARY_META, LibraryKind, oduBySlug } from '@ona/core';
import { LibraryEntry, Prisma } from '@prisma/client';
import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { slugify } from '../common/util';

class EntryDto {
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @IsOptional() @IsString() @MaxLength(300) subtitle?: string;
  @IsString() @MaxLength(2000) excerpt!: string;
  @IsString() body!: string;
  @IsOptional() @IsString() privateBody?: string;
  @IsString() category!: string;
  @IsOptional() @IsObject() meta?: Record<string, unknown>;
  @IsOptional() @IsArray() oduIds?: unknown[];
  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsInt() order?: number;
}

const kindOf = (k: string): LibraryKind => {
  if (!isLibraryKind(k)) throw new NotFoundException('Type inconnu');
  return k;
};

/** Ne garde que les champs prévus pour ce type, en textes courts. */
export function cleanMeta(kind: LibraryKind, raw: unknown): Record<string, string> {
  const src = (raw ?? {}) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const k of LIBRARY_META[kind]) {
    const v = src[k];
    if (typeof v === 'string' && v.trim()) out[k] = v.trim().slice(0, 1000);
  }
  return out;
}
export const cleanOduIds = (raw: unknown): number[] =>
  Array.isArray(raw) ? [...new Set(raw.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 255))].slice(0, 64) : [];

/** Vue publique : jamais le contenu privé (matériel et quantités des rituels). */
const pub = ({ privateBody: _p, ...e }: LibraryEntry) => e;
const brief = (e: LibraryEntry) => ({
  id: e.id, kind: e.kind, slug: e.slug, title: e.title, subtitle: e.subtitle, excerpt: e.excerpt,
  category: e.category, coverUrl: e.coverUrl, meta: e.meta, oduIds: e.oduIds,
});

@Controller()
export class LibraryController {
  constructor(private prisma: PrismaService) {}

  @Get('library/:kind')
  async list(@Param('kind') k: string, @Query('category') category?: string) {
    const kind = kindOf(k);
    const rows = await this.prisma.libraryEntry.findMany({
      where: { kind, published: true, ...(category ? { category } : {}) },
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
    });
    return rows.map(brief);
  }

  @Get('library/:kind/:slug')
  async one(@Param('kind') k: string, @Param('slug') slug: string) {
    const kind = kindOf(k);
    const e = await this.prisma.libraryEntry.findUnique({ where: { kind_slug: { kind, slug } } });
    if (!e || !e.published) throw new NotFoundException('Introuvable');
    return pub(e);
  }

  /** Rituels, wáàsù et divinités liés à un Odu (fiche de l'Odu). */
  @Get('odu/:slug/library')
  async forOdu(@Param('slug') slug: string) {
    const o = oduBySlug(slug);
    if (!o) throw new NotFoundException('Odu introuvable');
    // Les Méjì qui composent l'Odu comptent aussi : un rituel lié à Ogbè Méjì éclaire Ogbè Ọ̀yẹ̀kú.
    const ids = new Set([o.id, o.right.index * 17, o.left.index * 17]);
    const rows = await this.prisma.libraryEntry.findMany({ where: { published: true }, orderBy: [{ order: 'asc' }, { title: 'asc' }] });
    return rows.filter((e) => ((e.oduIds as number[] | null) ?? []).some((id) => ids.has(id))).map(brief);
  }

  @Staff() @Get('admin/library/:kind')
  adminList(@Param('kind') k: string) {
    return this.prisma.libraryEntry.findMany({ where: { kind: kindOf(k) }, orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }] });
  }

  @Staff() @Post('admin/library/:kind')
  create(@Param('kind') k: string, @Body() dto: EntryDto) {
    const kind = kindOf(k);
    return this.prisma.libraryEntry.create({ data: { kind, ...this.data(kind, dto) } });
  }

  @Staff() @Put('admin/library/:kind/:id')
  async update(@Param('kind') k: string, @Param('id') id: string, @Body() dto: EntryDto) {
    const kind = kindOf(k);
    const cur = await this.prisma.libraryEntry.findUnique({ where: { id } });
    if (!cur || cur.kind !== kind) throw new NotFoundException();
    return this.prisma.libraryEntry.update({ where: { id }, data: this.data(kind, dto) });
  }

  @Staff() @Delete('admin/library/:kind/:id')
  async remove(@Param('kind') k: string, @Param('id') id: string) {
    const cur = await this.prisma.libraryEntry.findUnique({ where: { id } });
    if (!cur || cur.kind !== kindOf(k)) throw new NotFoundException();
    await this.prisma.libraryEntry.delete({ where: { id } });
    return { ok: true };
  }

  private data(kind: LibraryKind, dto: EntryDto) {
    if (!LIBRARY_CATEGORIES[kind].includes(dto.category)) throw new BadRequestException('Catégorie inconnue');
    const title = dto.title.trim();
    if (!title || !dto.excerpt.trim() || !dto.body.trim()) throw new BadRequestException('Titre, résumé et texte sont nécessaires');
    return {
      title,
      slug: slugify(dto.slug || title),
      subtitle: dto.subtitle?.trim() || null,
      excerpt: dto.excerpt.trim(),
      body: dto.body,
      privateBody: kind === 'rituel' ? dto.privateBody?.trim() || null : null,
      category: dto.category,
      meta: cleanMeta(kind, dto.meta) as Prisma.InputJsonValue,
      oduIds: cleanOduIds(dto.oduIds) as Prisma.InputJsonValue,
      coverUrl: dto.coverUrl?.trim() || null,
      published: dto.published ?? false,
      order: dto.order ?? 0,
    };
  }
}
