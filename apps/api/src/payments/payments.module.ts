import { Module } from '@nestjs/common';
import { ConsultationsModule } from '../consultations/consultations.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({ imports: [ConsultationsModule], controllers: [PaymentsController], providers: [PaymentsService] })
export class PaymentsModule {}
