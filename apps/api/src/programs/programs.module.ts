import { Module } from '@nestjs/common';
import { BookingsTasks } from './bookings.tasks';
import { ProgramsController } from './programs.controller';

@Module({ controllers: [ProgramsController], providers: [BookingsTasks] })
export class ProgramsModule {}
