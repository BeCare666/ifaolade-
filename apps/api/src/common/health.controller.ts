import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';

/** Sonde de santé pour Render (plan étape 8.3) : l'API répond ET la base est joignable. */
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, db: 'ok', at: new Date().toISOString() };
    } catch {
      throw new ServiceUnavailableException({ ok: false, db: 'injoignable' });
    }
  }
}
