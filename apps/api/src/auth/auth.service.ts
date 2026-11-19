import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { Request, Response } from 'express';
import { ConsentService } from '../common/consent.service';
import { PrismaService } from '../common/prisma.service';
import { token } from '../common/util';
import { MailService } from '../mail/mail.service';
import { ForgotDto, LoginDto, RegisterDto, ResetDto } from './auth.dto';

export const publicUser = (u: User) => ({
  id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, phone: u.phone,
  country: u.country, city: u.city, role: u.role, emailVerified: u.emailVerified, createdAt: u.createdAt,
});

/** Étape 2.2 : cookie de renouvellement. Même site (api.<domaine>) → Lax ; domaines différents → None + Secure. */
export const REFRESH_COOKIE = 'ifaolade_rt';
const REFRESH_DAYS = 30;
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

function cookieOptions() {
  const prod = process.env.NODE_ENV === 'production';
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase() as 'lax' | 'strict' | 'none';
  return { httpOnly: true, secure: prod || sameSite === 'none', sameSite, path: '/api/auth', maxAge: REFRESH_DAYS * 86400_000 };
}

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private mail: MailService, private consent: ConsentService) {}

  private sign(u: User): string {
    return this.jwt.sign({ sub: u.id, role: u.role, email: u.email });
  }

  /** Crée un jeton de renouvellement (stocké haché) et le pose en cookie httpOnly. */
  private async issueRefresh(res: Response, userId: string) {
    const raw = token(48);
    await this.prisma.refreshToken.create({ data: { userId, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + REFRESH_DAYS * 86400_000) } });
    res.cookie(REFRESH_COOKIE, raw, cookieOptions());
  }

  private clearCookie(res: Response) {
    const { maxAge: _m, ...opts } = cookieOptions();
    res.clearCookie(REFRESH_COOKIE, opts);
  }

  private async session(u: User, res: Response) {
    await this.issueRefresh(res, u.id);
    return { token: this.sign(u), user: publicUser(u) };
  }

  async register(dto: RegisterDto, req: Request, res: Response) {
    const email = dto.email.toLowerCase().trim();
    if (await this.prisma.user.findUnique({ where: { email } })) throw new ConflictException('Un compte existe déjà avec cet email');
    const emailToken = token();
    const user = await this.prisma.user.create({
      data: {
        email, passwordHash: await bcrypt.hash(dto.password, 11), firstName: dto.firstName.trim(),
        lastName: dto.lastName?.trim(), country: dto.country, phone: dto.phone, emailToken,
      },
    });
    await this.consent.record('CGU', req, user.id);
    await this.mail.send(email, 'Bienvenue, confirme ton email', this.mail.layout(
      `Ẹ kú àbọ̀, ${user.firstName}`,
      '<p>Ton espace est créé. Confirme ton email pour sécuriser ton dossier spirituel et activer ta <b>première consultation offerte</b>.</p>',
      { label: 'Confirmer mon email', url: `${this.mail.web}/verifier-email?token=${emailToken}` },
    ), user.firstName);
    return this.session(user, res);
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Email ou mot de passe incorrect');
    return this.session(user, res);
  }

  /** Rotation : l'ancien jeton est révoqué, un nouveau est émis. Un jeton déjà révoqué réutilisé = vol probable. */
  async refresh(req: Request, res: Response) {
    const raw = readCookie(req, REFRESH_COOKIE);
    if (!raw) throw new UnauthorizedException('Session expirée');
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash: sha256(raw) }, include: { user: true } });
    if (!row) { this.clearCookie(res); throw new UnauthorizedException('Session expirée'); }
    if (row.revokedAt) {
      await this.prisma.refreshToken.updateMany({ where: { userId: row.userId, revokedAt: null }, data: { revokedAt: new Date() } });
      this.clearCookie(res);
      throw new UnauthorizedException('Session révoquée, reconnecte-toi');
    }
    if (row.expiresAt < new Date()) { this.clearCookie(res); throw new UnauthorizedException('Session expirée'); }
    await this.prisma.refreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });
    return this.session(row.user, res);
  }

  async logout(req: Request, res: Response) {
    const raw = readCookie(req, REFRESH_COOKIE);
    if (raw) await this.prisma.refreshToken.updateMany({ where: { tokenHash: sha256(raw), revokedAt: null }, data: { revokedAt: new Date() } });
    this.clearCookie(res);
    return { ok: true };
  }

  async verify(t: string) {
    if (!t) throw new BadRequestException('Lien invalide');
    const user = await this.prisma.user.findFirst({ where: { emailToken: t } });
    if (!user) throw new BadRequestException('Lien invalide ou déjà utilisé');
    await this.prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, emailToken: null } });
    return { ok: true };
  }

  async forgot(dto: ForgotDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (user) {
      const resetToken = token();
      await this.prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpires: new Date(Date.now() + 3600_000) } });
      await this.mail.send(user.email, 'Réinitialiser ton mot de passe', this.mail.layout(
        'Nouveau mot de passe', "<p>Ce lien est valable 1 heure. Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>",
        { label: 'Choisir un nouveau mot de passe', url: `${this.mail.web}/reinitialiser?token=${resetToken}` },
      ));
    }
    return { ok: true };
  }

  /** Nouveau mot de passe : toutes les sessions ouvertes sont fermées. */
  async reset(dto: ResetDto) {
    const user = await this.prisma.user.findFirst({ where: { resetToken: dto.token, resetExpires: { gt: new Date() } } });
    if (!user) throw new BadRequestException('Lien expiré ou invalide');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(dto.password, 11), resetToken: null, resetExpires: null } }),
      this.prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { ok: true };
  }
}
