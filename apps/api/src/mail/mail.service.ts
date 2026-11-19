import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Emails transactionnels via l'API Brevo v3. Couleurs : kaolin / indigo (plan §6). */
@Injectable()
export class MailService {
  private log = new Logger('Mail');
  constructor(private cfg: ConfigService) {}

  get web(): string {
    return this.cfg.get<string>('WEB_URL', 'http://localhost:3000').split(',')[0];
  }

  layout(title: string, body: string, cta?: { label: string; url: string }): string {
    const button = cta
      ? `<p style="margin:32px 0"><a href="${cta.url}" style="background:#1F2A44;color:#FFFFFF;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:500">${cta.label}</a></p>`
      : '';
    return `<!doctype html><html><body style="margin:0;background:#FAF8F4;font-family:Inter,Arial,sans-serif;color:#17150F">
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
<div style="letter-spacing:.2em;color:#A39C90;font-size:12px;text-transform:uppercase">Ifaôladé</div>
<h1 style="font-weight:400;font-size:28px;letter-spacing:-.02em;margin:16px 0 24px">${title}</h1>
<div style="font-size:15px;line-height:1.75;color:#6A6359">${body}</div>
${button}
<hr style="border:none;border-top:1px solid #E8E2D8;margin:40px 0 16px"/>
<p style="font-size:12px;color:#A39C90">Prix affichés · Ebo détaillé et prouvé · Suivi J+7, J+30, J+90. Aucune promesse par la peur.</p>
</div></body></html>`;
  }

  async send(to: string, subject: string, html: string, name?: string): Promise<void> {
    const key = this.cfg.get<string>('BREVO_API_KEY');
    if (!key) {
      this.log.warn(`[DEV] Email non envoyé (BREVO_API_KEY absente) → ${to} : ${subject}`);
      return;
    }
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { email: this.cfg.get('MAIL_FROM_EMAIL'), name: this.cfg.get('MAIL_FROM_NAME', 'Ifaôladé') },
          to: [{ email: to, name }],
          subject,
          htmlContent: html,
        }),
      });
      if (!res.ok) this.log.error(`Brevo ${res.status} : ${await res.text()}`);
    } catch (e) {
      this.log.error(`Brevo injoignable : ${(e as Error).message}`);
    }
  }

  async notifyAdmin(subject: string, body: string): Promise<void> {
    const admin = this.cfg.get<string>('MAIL_ADMIN_EMAIL');
    if (admin) await this.send(admin, `[Admin] ${subject}`, this.layout(subject, body));
  }
}
