import {
  applyDecorators, CanActivate, createParamDecorator, ExecutionContext, ForbiddenException,
  Injectable, SetMetadata, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

export type RoleName = 'CLIENT' | 'PRIEST' | 'ADMIN';
export interface JwtUser { sub: string; role: RoleName; email: string }

const ROLES_KEY = 'roles';
const OPTIONAL_KEY = 'optionalAuth';
export const STAFF: RoleName[] = ['ADMIN', 'PRIEST'];

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const targets = [ctx.getHandler(), ctx.getClass()];
    const optional = this.reflector.getAllAndOverride<boolean>(OPTIONAL_KEY, targets);
    const roles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, targets);
    const header: string | undefined = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      try {
        req.user = await this.jwt.verifyAsync<JwtUser>(token);
      } catch {
        if (!optional) throw new UnauthorizedException('Session expirée, reconnecte-toi');
      }
    }
    if (!req.user) {
      if (optional) return true;
      throw new UnauthorizedException('Connexion requise');
    }
    if (roles?.length && !roles.includes(req.user.role)) throw new ForbiddenException('Accès réservé');
    return true;
  }
}

export const Auth = (...roles: RoleName[]) => applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(AuthGuard));
export const Staff = () => Auth(...STAFF);
export const OptionalAuth = () => applyDecorators(SetMetadata(OPTIONAL_KEY, true), UseGuards(AuthGuard));

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtUser | undefined => {
  return ctx.switchToHttp().getRequest().user;
});

export const isStaff = (u?: JwtUser) => !!u && STAFF.includes(u.role);
