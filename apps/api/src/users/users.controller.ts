import { Body, Controller, Delete, Get, NotFoundException, Patch } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { publicUser } from '../auth/auth.service';
import { Auth, CurrentUser, JwtUser } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { UsersService } from './users.service';

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
  constructor(private prisma: PrismaService, private users: UsersService) {}

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
