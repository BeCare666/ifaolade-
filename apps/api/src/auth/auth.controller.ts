import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ForgotDto, LoginDto, RegisterDto, ResetDto } from './auth.dto';
import { AuthService } from './auth.service';

@Throttle({ default: { ttl: 60_000, limit: 10 } })
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) { return this.auth.register(dto, req, res); }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) { return this.auth.login(dto, res); }

  /** Renouvellement du jeton d'accès via le cookie httpOnly (étape 2.2). */
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) { return this.auth.refresh(req, res); }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) { return this.auth.logout(req, res); }

  @Get('verify') verify(@Query('token') t: string) { return this.auth.verify(t); }
  @Post('forgot') forgot(@Body() dto: ForgotDto) { return this.auth.forgot(dto); }
  @Post('reset') reset(@Body() dto: ResetDto) { return this.auth.reset(dto); }
}
