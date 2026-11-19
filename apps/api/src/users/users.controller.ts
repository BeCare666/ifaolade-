import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Patch, Put } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { publicUser } from '../auth/auth.service';
import { Auth, CurrentUser, JwtUser } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { UsersService } from './users.service';

class AvatarDto { @IsString() @MaxLength(500) url!: string }

/** Refonte §7 : photo de profil, recadrée en carré sur le visage par Cloudinary (transformation imposée par la signature). */
const AVATAR = { folder: 'ifaolade/avatars', transformation: 'c_fill,g_face,w_400,h_400', allowed_formats: 'jpg,jpeg,png,webp' };

class UpdateMeDto {
  @IsOptional() @IsString() @MaxLength(80) firstName?: string;
  @IsOptional() @IsString() @MaxLength(80) lastName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
}

@Auth()
@Controller('me')
export class UsersController {
  constructor(private prisma: PrismaService, private users: UsersService, private cfg: ConfigService) {}

  @Get('avatar/signature')
  avatarSignature() {
    const secret = this.cfg.get<string>('CLOUDINARY_API_SECRET');
    const apiKey = this.cfg.get<string>('CLOUDINARY_API_KEY');
    const cloudName = this.cfg.get<string>('CLOUDINARY_CLOUD_NAME');
    if (!secret || !apiKey || !cloudName) throw new BadRequestException('Envoi de photo indisponible pour le moment.');
    const params = { ...AVATAR, timestamp: Math.round(Date.now() / 1000) };
    return { ...params, signature: cloudinary.utils.api_sign_request(params, secret), apiKey, cloudName };
  }

  @Put('avatar')
  async setAvatar(@CurrentUser() u: JwtUser, @Body() dto: AvatarDto) {
    const cloud = this.cfg.get<string>('CLOUDINARY_CLOUD_NAME');
    if (!cloud || !dto.url.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`) || !dto.url.includes('/ifaolade/avatars/')) {
      throw new BadRequestException('Photo refusée.');
    }
    return publicUser(await this.prisma.user.update({ where: { id: u.sub }, data: { avatarUrl: dto.url } }));
  }

  @Delete('avatar')
  async removeAvatar(@CurrentUser() u: JwtUser) {
    return publicUser(await this.prisma.user.update({ where: { id: u.sub }, data: { avatarUrl: null } }));
  }

  @Get()
  async me(@CurrentUser() u: JwtUser) {
    const user = await this.prisma.user.findUnique({ where: { id: u.sub } });
    if (!user) throw new NotFoundException();
    return publicUser(user);
  }

  @Patch()
  async update(@CurrentUser() u: JwtUser, @Body() dto: UpdateMeDto) {
    return publicUser(await this.prisma.user.update({ where: { id: u.sub }, data: dto }));
  }

  @Get('dossier')
  dossier(@CurrentUser() u: JwtUser) {
    return this.users.dossier(u.sub, false);
  }

  /** Droit d'accès / portabilité (RGPD art. 15 et 20). */
  @Get('export')
  async export(@CurrentUser() u: JwtUser) {
    const [dossier, payments] = await Promise.all([
      this.users.dossier(u.sub, false),
      this.prisma.payment.findMany({ where: { userId: u.sub } }),
    ]);
    return { exportedAt: new Date().toISOString(), ...dossier, payments };
  }

  /** Droit à l'effacement : anonymisation (les paiements restent pour la comptabilité). */
  @Delete()
  async remove(@CurrentUser() u: JwtUser) {
    await this.users.anonymize(u.sub);
    return { ok: true };
  }
}
