import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { slugify } from '../common/util';

export const ARTICLE_CATEGORIES = ['comprendre-ifa', 'arnaques', 'vodoun', 'astrologie', 'diaspora'] as const;

class ArticleDto {
  @IsString() @MaxLength(200) title: string;
  @IsOptional() @IsString() slug?: string;
  @IsString() excerpt: string;
  @IsString() body: string; // Markdown, nettoyé à l'affichage côté web
  @IsOptional() @IsString() coverUrl?: string;
  @IsIn(ARTICLE_CATEGORIES as unknown as string[]) category: string;
  @IsOptional() @IsBoolean() published?: boolean;
}

@Controller()
export class ArticlesController {
  constructor(private prisma: PrismaService) {}

  @Get('articles')
  list(@Query('category') category?: string, @Query('limit') limit?: string) {
    return this.prisma.article.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(50, Number(limit) || 50),
      select: { id: true, slug: true, title: true, excerpt: true, coverUrl: true, category: true, publishedAt: true },
    });
  }

  @Get('articles/:slug')
  async one(@Param('slug') slug: string) {
    const a = await this.prisma.article.findUnique({ where: { slug } });
    if (!a || !a.published) throw new NotFoundException('Article introuvable');
    return a;
  }

  @Staff() @Get('admin/articles')
  adminList() {
    return this.prisma.article.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  @Staff() @Post('admin/articles')
  create(@Body() dto: ArticleDto) {
    const published = dto.published ?? false;
    return this.prisma.article.create({
      data: { ...dto, slug: slugify(dto.slug || dto.title), published, publishedAt: published ? new Date() : null },
    });
  }

  @Staff() @Put('admin/articles/:id')
  async update(@Param('id') id: string, @Body() dto: ArticleDto) {
    const current = await this.prisma.article.findUnique({ where: { id } });
    if (!current) throw new NotFoundException();
    const published = dto.published ?? current.published;
    return this.prisma.article.update({
      where: { id },
      data: {
        ...dto, slug: slugify(dto.slug || dto.title), published,
        publishedAt: published ? current.publishedAt ?? new Date() : null,
      },
    });
  }

  @Staff() @Delete('admin/articles/:id')
  async remove(@Param('id') id: string) {
    await this.prisma.article.delete({ where: { id } });
    return { ok: true };
  }
}
