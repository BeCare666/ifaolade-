import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { JwtUser, STAFF } from './auth';
import { PrismaService } from './prisma.service';

type Loader = (p: PrismaService, id: string) => Promise<unknown>;
interface Rule { re: RegExp; entity: string; load?: Loader }

/** Routes admin → entité concernée et lecture de son état AVANT la modification. */
const RULES: Rule[] = [
  { re: /^\/api\/admin\/consultations\/([^/]+)\/report$/, entity: 'compte rendu', load: (p, id) => p.consultationReport.findUnique({ where: { consultationId: id } }) },
  { re: /^\/api\/admin\/consultations\/([^/]+)\/ebos$/, entity: 'ebo' },
  { re: /^\/api\/admin\/consultations\/([^/]+)$/, entity: 'consultation', load: (p, id) => p.consultation.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/ebos\/([^/]+)$/, entity: 'ebo', load: (p, id) => p.ebo.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/follow-ups\/([^/]+)$/, entity: 'suivi', load: (p, id) => p.followUp.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/slots\/([^/]+)$/, entity: 'créneau', load: (p, id) => p.slot.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/slots$/, entity: 'créneau' },
  { re: /^\/api\/admin\/offers\/([^/]+)$/, entity: 'offre', load: (p, id) => p.consultationOffer.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/odu\/(\d+\/domains\/[a-z]+)$/, entity: 'odu × domaine', load: (p, k) => { const [id, , domain] = k.split('/'); return p.oduDomainText.findUnique({ where: { oduId_domain: { oduId: Number(id), domain } } }); } },
  { re: /^\/api\/admin\/odu\/(\d+)$/, entity: 'contenu odu', load: (p, id) => p.oduContent.findUnique({ where: { oduId: Number(id) } }) },
  { re: /^\/api\/admin\/portrait-texts\/([^/]+)$/, entity: 'texte du portrait', load: (p, id) => p.portraitText.findUnique({ where: { key: decodeURIComponent(id) } }) },
  { re: /^\/api\/admin\/programs\/([^/]+)\/sessions$/, entity: 'session' },
  { re: /^\/api\/admin\/programs\/([^/]+)$/, entity: 'programme', load: (p, id) => p.program.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/programs$/, entity: 'programme' },
  { re: /^\/api\/admin\/sessions\/([^/]+)$/, entity: 'session', load: (p, id) => p.programSession.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/events\/([^/]+)$/, entity: 'événement', load: (p, id) => p.event.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/events$/, entity: 'événement' },
  { re: /^\/api\/admin\/articles\/([^/]+)$/, entity: 'article', load: (p, id) => p.article.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/articles$/, entity: 'article' },
  { re: /^\/api\/admin\/registrations\/([^/]+)\/checkin$/, entity: 'billet', load: (p, id) => p.eventRegistration.findUnique({ where: { id } }) },
  { re: /^\/api\/admin\/settings\/([^/]+)$/, entity: 'paramètre', load: (p, id) => p.setting.findUnique({ where: { key: decodeURIComponent(id) } }) },
];

const SECRET_KEYS = /password|hash|token|secret|signature/i;
const ACTIONS: Record<string, string> = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };

/** Retire les secrets et coupe les très longs textes avant enregistrement. */
function clean(v: unknown, depth = 0): unknown {
  if (v === null || v === undefined || depth > 4) return v ?? null;
  if (typeof v === 'string') return v.length > 4000 ? `${v.slice(0, 4000)}…` : v;
  if (Array.isArray(v)) return v.slice(0, 100).map((x) => clean(x, depth + 1));
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([k]) => !SECRET_KEYS.test(k)).map(([k, x]) => [k, clean(x, depth + 1)]));
  }
  return v;
}

/** Étape 2.3 : chaque écriture admin est inscrite dans AuditLog. Un échec d'audit ne bloque jamais l'action. */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private log = new Logger('Audit');
  private names = new Map<string, string>();
  constructor(private prisma: PrismaService) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: JwtUser }>();
    const action = ACTIONS[req.method];
    const path = (req.originalUrl || req.url).split('?')[0];
    const user = req.user;
    if (!action || !path.startsWith('/api/admin/') || path.startsWith('/api/admin/media/')) return next.handle();

    const rule = RULES.find((r) => r.re.test(path));
    const entityId = rule ? path.match(rule.re)?.[1] ?? null : null;
    let before: unknown = null;
    if (rule?.load && entityId && action !== 'CREATE') before = await rule.load(this.prisma, entityId).catch(() => null);

    return next.handle().pipe(tap({
      next: (result) => {
        // req.user n'est posé qu'après la garde : on le relit ici.
        const actor = (req as Request & { user?: JwtUser }).user ?? user;
        if (!actor || !STAFF.includes(actor.role)) return;
        const createdId = action === 'CREATE' && result && typeof result === 'object' && 'id' in result ? String((result as { id: unknown }).id) : null;
        void this.write(actor, action, rule?.entity ?? 'autre', createdId ?? entityId, path, before, action === 'DELETE' ? null : (result ?? req.body), req.ip);
      },
    }));
  }

  private async write(actor: JwtUser, action: string, entity: string, entityId: string | null, path: string, before: unknown, after: unknown, ip?: string) {
    try {
      let name = this.names.get(actor.sub);
      if (!name) {
        const u = await this.prisma.user.findUnique({ where: { id: actor.sub }, select: { firstName: true, lastName: true } });
        name = u ? `${u.firstName} ${u.lastName ?? ''}`.trim() : actor.email;
        this.names.set(actor.sub, name);
      }
      const json = (v: unknown) => (v === null || v === undefined ? Prisma.JsonNull : (clean(v) as Prisma.InputJsonValue));
      await this.prisma.auditLog.create({
        data: { actorId: actor.sub, actorName: name, actorRole: actor.role, action, entity, entityId, path, before: json(before), after: json(after), ip: ip ?? null },
      });
    } catch (e) {
      this.log.error(`Écriture d'audit impossible : ${(e as Error).message}`);
    }
  }
}
