import { Module } from '@nestjs/common';
import { PortraitTextsController } from './portrait-texts.controller';
import { PortraitTextsService } from './portrait-texts.service';
import { ReadingsController } from './readings.controller';

@Module({ controllers: [ReadingsController, PortraitTextsController], providers: [PortraitTextsService] })
export class ReadingsModule {}
