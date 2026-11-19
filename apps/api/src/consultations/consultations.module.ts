import { Module } from '@nestjs/common';
import { ConsultationsAdminController, ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsTasks } from './consultations.tasks';

@Module({
  controllers: [ConsultationsController, ConsultationsAdminController],
  providers: [ConsultationsService, ConsultationsTasks],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
