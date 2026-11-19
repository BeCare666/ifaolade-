import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuditInterceptor } from './audit.interceptor';
import { AuthGuard } from './auth';
import { ConsentService } from './consent.service';
import { NotificationsService } from './notifications.service';
import { PlatformController } from './platform.controller';
import { PrismaService } from './prisma.service';
import { SettingsService } from './settings.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.get('JWT_SECRET', 'dev-secret'),
        // Étape 2.2 : jeton d'accès court ; le renouvellement passe par le cookie httpOnly.
        signOptions: { expiresIn: c.get('JWT_EXPIRES', '15m') },
      }),
    }),
  ],
  controllers: [PlatformController],
  providers: [PrismaService, AuthGuard, SettingsService, NotificationsService, ConsentService, AuditInterceptor],
  exports: [PrismaService, AuthGuard, SettingsService, NotificationsService, ConsentService, AuditInterceptor],
})
export class CommonModule {}
