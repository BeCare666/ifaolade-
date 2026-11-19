import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';
import { Staff } from '../common/auth';
import { PortraitTextsService } from './portrait-texts.service';

class UpdateTextDto {
  @IsString() @MinLength(5) @MaxLength(4000) value: string;
  @IsBoolean() validated: boolean;
}

@Staff()
@Controller('admin/portrait-texts')
export class PortraitTextsController {
  constructor(private texts: PortraitTextsService) {}

  @Get()
  list() {
    return this.texts.list();
  }

  @Put(':key')
  update(@Param('key') key: string, @Body() dto: UpdateTextDto) {
    return this.texts.update(key, dto.value, dto.validated);
  }

  /** Revenir au texte par défaut du moteur. */
  @Delete(':key')
  reset(@Param('key') key: string) {
    return this.texts.reset(key);
  }
}
