import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from './prisma.service';

/** Versions des textes de consentement : à incrémenter quand le texte affiché change. */
export const CONSENT_VERSION = { PORTRAIT: 'portrait-v1', CONSULTATION: 'consultation-v1', CGU: 'cgu-v1' } as const;
export type ConsentKind = keyof typeof CONSENT_VERSION;

/** Plan §15.2 : preuve horodatée de chaque consentement (données sensibles, CGU). */
@Injectable()
export class ConsentService {
  constructor(private prisma: PrismaService) {}

  record(kind: ConsentKind, req: Request, userId?: string | null, refId?: string | null) {
    return this.prisma.consentLog.create({
      data: {
        kind, version: CONSENT_VERSION[kind], userId: userId ?? null, refId: refId ?? null,
        ip: req.ip ?? null, userAgent: String(req.headers['user-agent'] ?? '').slice(0, 500) || null,
      },
    });
  }

  /** Rattache les consentements anonymes (portrait) au compte créé ensuite. */
  claim(refId: string, userId: string) {
    return this.prisma.consentLog.updateMany({ where: { refId, userId: null }, data: { userId } });
  }
}
