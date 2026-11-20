import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() @MinLength(1) @MaxLength(80) firstName: string;
  @IsOptional() @IsString() @MaxLength(80) lastName?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() phone?: string;
  /** Acceptation des CGU et de la politique de confidentialité (preuve dans ConsentLog). */
  @IsIn([true]) acceptCgu: boolean;
  /** Portrait « Connais-toi » anonyme à rattacher au nouveau compte (il ne se connecte qu'après confirmation). */
  @IsOptional() @IsString() @MaxLength(40) readingId?: string;
}

export class ResendDto {
  @IsEmail() email: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

export class ForgotDto {
  @IsEmail() email: string;
}

export class ResetDto {
  @IsString() token: string;
  @IsString() @MinLength(8) password: string;
}
