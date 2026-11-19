import { Body, Controller, Get, Headers, Param, Post, Query, RawBodyRequest, Req } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { IsIn, IsString } from 'class-validator';
import { Auth, CurrentUser, JwtUser, Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { PaymentsService, Provider, Purpose } from './payments.service';

class CheckoutDto {
  @IsIn(['CONSULTATION', 'EBO', 'BOOKING', 'EVENT']) purpose: Purpose;
  @IsString() refId: string;
  @IsIn(['STRIPE', 'FEEXPAY']) provider: Provider;
}

class FeexPayConfirmDto {
  @IsString() reference: string;
}

@Controller()
export class PaymentsController {
  constructor(private svc: PaymentsService, private prisma: PrismaService) {}

  @Auth()
  @Post('payments/checkout')
  checkout(@CurrentUser() u: JwtUser, @Body() dto: CheckoutDto) {
    return this.svc.checkout(u.sub, dto.purpose, dto.refId, dto.provider);
  }

  @Auth()
  @Get('payments/mine')
  mine(@CurrentUser() u: JwtUser) {
    return this.svc.mine(u.sub);
  }

  @Auth()
  @Get('payments/:id')
  status(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.svc.status(id, u.sub);
  }

  @Auth()
  @Post('payments/:id/feexpay')
  feexpay(@Param('id') id: string, @CurrentUser() u: JwtUser, @Body() dto: FeexPayConfirmDto) {
    return this.svc.confirmFeexPay(id, u.sub, dto.reference);
  }

  @Auth()
  @Post('payments/:id/dev-confirm')
  devConfirm(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.svc.devConfirm(id, u.sub);
  }

  @SkipThrottle()
  @Post('payments/webhooks/stripe')
  stripe(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig?: string) {
    return this.svc.stripeWebhook(req.rawBody, sig);
  }

  @Staff()
  @Get('admin/payments')
  async list(@Query('status') status?: string, @Query('page') p?: string) {
    const page = Math.max(1, Number(p) || 1);
    const where = status ? { status: status as 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 50, take: 50,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { items, total };
  }
}
