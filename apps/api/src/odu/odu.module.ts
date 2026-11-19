import { Module } from '@nestjs/common';
import { OduController } from './odu.controller';

@Module({ controllers: [OduController] })
export class OduModule {}
