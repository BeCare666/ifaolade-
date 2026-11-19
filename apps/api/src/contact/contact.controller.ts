import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Staff } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { NotificationsService } from '../common/notifications.service';
import { MailService } from '../mail/mail.service';

class ContactDto {
  @IsString() @MinLength(2) @MaxLength(120) name: string;
  @IsEmail() email: string;
  @IsString() @MaxLength(160) subject: string;
  @IsString() @MinLength(10) @MaxLength(5000) message: string;
}

const escape = (s: string) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!);

@Controller()
export class ContactController {
  constructor(private prisma: PrismaService, private mail: MailService, private notify: NotificationsService) {}

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('contact')
  async send(@Body() dto: ContactDto) {
    await this.prisma.contactMessage.create({ data: dto });
    await this.mail.notifyAdmin(`Message : ${escape(dto.subject)}`, `<p><b>${escape(dto.name)}</b> (${escape(dto.email)})</p><p>${escape(dto.message)}</p>`);
    await this.notify.toStaff(`Message : ${dto.subject}`, '/admin/messages', dto.name);
    return { ok: true };
  }

  @Staff()
  @Get('admin/contact')
  list() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }
}
