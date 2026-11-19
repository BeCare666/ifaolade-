import { Body, Controller, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Allow } from 'class-validator';
import { Auth, CurrentUser, JwtUser, Staff } from './auth';
import { PrismaService } from './prisma.service';
import { SettingsService } from './settings.service';

class SettingDto {
  @Allow() value: unknown;
}

@Controller()
export class PlatformController {
  constructor(private prisma: PrismaService, private settings: SettingsService) {}

  // ---------- Paramètres (étape 2.1) ----------
  @Get('settings/public')
  publicSettings() {
    return this.settings.publicValues();
  }

  @Staff() @Get('admin/settings')
  listSettings() {
    return this.settings.list();
  }

  @Staff() @Put('admin/settings/:key')
  setSetting(@Param('key') key: string, @Body() dto: SettingDto) {
    return this.settings.set(key, dto.value);
  }

  // ---------- Notifications (étape 2.1) ----------
  @Auth() @Get('notifications')
  async notifications(@CurrentUser() u: JwtUser) {
    const [items, unread] = await Promise.all([
      this.prisma.notification.findMany({ where: { userId: u.sub }, orderBy: { createdAt: 'desc' }, take: 30 }),
      this.prisma.notification.count({ where: { userId: u.sub, readAt: null } }),
    ]);
    return { items, unread };
  }

  @Auth() @Post('notifications/read-all')
  async readAll(@CurrentUser() u: JwtUser) {
    await this.prisma.notification.updateMany({ where: { userId: u.sub, readAt: null }, data: { readAt: new Date() } });
    return { ok: true };
  }

  @Auth() @Post('notifications/:id/read')
  async readOne(@CurrentUser() u: JwtUser, @Param('id') id: string) {
    const r = await this.prisma.notification.updateMany({ where: { id, userId: u.sub }, data: { readAt: new Date() } });
    if (!r.count) throw new NotFoundException();
    return { ok: true };
  }

  // ---------- Journal d'audit (étape 2.3) : filtres + pagination serveur ----------
  @Staff() @Get('admin/audit')
  async audit(
    @Query('entity') entity?: string, @Query('actor') actor?: string, @Query('action') action?: string,
    @Query('from') from?: string, @Query('to') to?: string, @Query('page') p?: string,
  ) {
    const page = Math.max(1, Number(p) || 1);
    const where: Prisma.AuditLogWhereInput = {
      ...(entity ? { entity } : {}), ...(actor ? { actorId: actor } : {}), ...(action ? { action } : {}),
      ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}) } } : {}),
    };
    const [items, total, entities, actors] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 30, take: 30 }),
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({ distinct: ['entity'], select: { entity: true } }),
      this.prisma.auditLog.findMany({ distinct: ['actorId'], select: { actorId: true, actorName: true } }),
    ]);
    return { items, total, pageSize: 30, entities: entities.map((e) => e.entity), actors };
  }
}
