import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReadingsModule } from './readings/readings.module';
import { OduModule } from './odu/odu.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { ProgramsModule } from './programs/programs.module';
import { EventsModule } from './events/events.module';
import { ArticlesModule } from './articles/articles.module';
import { PaymentsModule } from './payments/payments.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { AuditInterceptor } from './common/audit.interceptor';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    CommonModule,
    MailModule,
    AuthModule,
    UsersModule,
    ReadingsModule,
    OduModule,
    ConsultationsModule,
    ProgramsModule,
    EventsModule,
    ArticlesModule,
    PaymentsModule,
    MediaModule,
    AdminModule,
    ContactModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
})
export class AppModule {}
