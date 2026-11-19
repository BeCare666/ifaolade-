import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString,
  Max, MaxLength, Min, MinLength, ValidateNested,
} from 'class-validator';

export class CreateConsultationDto {
  @IsString() offerCode: string;
  @IsOptional() @IsString() slotId?: string;
  @IsString() @MinLength(5) @MaxLength(1000) question: string;
  @IsOptional() @IsString() @MaxLength(4000) context?: string;
  @IsOptional() @IsString() readingId?: string;
  @IsIn([true]) consent: boolean;
}

export class ReportDto {
  @IsInt() @Min(0) @Max(255) oduId: number;
  @IsIn(['IRE', 'IBI']) orientation: 'IRE' | 'IBI';
  @IsOptional() @IsString() @MaxLength(120) oriDetail?: string;
  @IsString() ese: string;
  @IsString() message: string;
  @IsArray() @ArrayMaxSize(12) @IsString({ each: true }) actionPlan: string[];
  @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) ewo: string[];
  @IsOptional() @IsString() privateNotes?: string;
  @IsBoolean() publish: boolean;
}

export class EboItemDto {
  @IsString() @MaxLength(160) label: string;
  @IsInt() @Min(1) qty: number;
  @IsInt() @Min(0) unitCents: number;
}

export class CreateEboDto {
  @IsString() @MaxLength(160) title: string;
  @IsString() purpose: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => EboItemDto) items: EboItemDto[];
  @IsInt() @Min(0) priestFeeCents: number;
  @IsOptional() @IsBoolean() liveAllowed?: boolean;
}

export class UpdateEboDto {
  @IsOptional() @IsString() proofVideoUrl?: string;
  @IsOptional() @IsString() proofPublicId?: string;
}

export class AnswerFollowUpDto {
  @IsInt() @Min(0) @Max(10) progress: number;
  @IsOptional() @IsString() @MaxLength(4000) note?: string;
}

export class ReplyFollowUpDto {
  @IsString() @MaxLength(4000) priestReply: string;
}

export class SlotInputDto {
  @IsDateString() startsAt: string;
  @IsDateString() endsAt: string;
}

export class CreateSlotsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => SlotInputDto) slots: SlotInputDto[];
}

export class UpdateOfferDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(5) durationMin?: number;
  @IsOptional() @IsInt() @Min(0) priceCents?: number;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
}

export class UpdateStatusDto {
  @IsIn(['REQUESTED', 'AWAITING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
  status: 'REQUESTED' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}
