import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../common/prisma.service';
import { money } from '../common/util';
import { ConsultationsService } from '../consultations/consultations.service';
import { sendTicket } from '../events/tickets';
import { NotificationsService } from '../common/notifications.service';
import { SettingsService } from '../common/settings.service';
import { MailService } from '../mail/mail.service';
import { fetchFeexPayTransaction, paymentRefused } from './feexpay';

export type Purpose = 'CONSULTATION' | 'EBO' | 'BOOKING' | 'EVENT';
export type Provider = 'STRIPE' | 'FEEXPAY';

@Injectable()
export class PaymentsService {
  private log = new Logger('Paiements');
  private stripe: Stripe | null;

  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
    private mail: MailService,
    private consultations: ConsultationsService,
    private settings: SettingsService,
    private notify: NotificationsService,
  ) {
    const key = this.cfg.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key) : null;
  }

  /** Taux et acompte : Admin › Paramètres (étape 2.1), la variable d'environnement sert de valeur par défaut. */
  async toXof(cents: number): Promise<number> {
    return Math.round((cents / 100) * Number(await this.settings.get('money.eurToXof')));
  }

  /** Montant et libellé selon l'objet. Vérifie que l'utilisateur est bien le propriétaire et que l'état le permet. */
  private async resolve(userId: string, purpose: Purpose, refId: string): Promise<{ amountCents: number; currency: string; label: string }> {
    switch (purpose) {
      case 'CONSULTATION': {
        const c = await this.prisma.consultation.findUnique({ where: { id: refId }, include: { offer: true } });
        if (!c || c.userId !== userId) throw new NotFoundException('Consultation introuvable');
        if (c.status !== 'AWAITING_PAYMENT') throw new BadRequestException('Cette consultation ne nécessite pas de paiement');
        return { amountCents: c.priceCents, currency: c.currency, label: c.offer.title };
      }
      case 'EBO': {
        const e = await this.prisma.ebo.findUnique({ where: { id: refId }, include: { consultation: true } });
        if (!e || e.consultation.userId !== userId) throw new NotFoundException('Ebo introuvable');
        if (e.status !== 'ACCEPTED') throw new BadRequestException("L'ebo doit être accepté avant le paiement");
        return { amountCents: e.materialsCents + e.priestFeeCents, currency: e.currency, label: `Ebo : ${e.title}` };
      }
      case 'BOOKING': {
        const b = await this.prisma.booking.findUnique({ where: { id: refId }, include: { session: { include: { program: true } } } });
        if (!b || b.userId !== userId) throw new NotFoundException('Réservation introuvable');
        if (b.status === 'PAID' || b.status === 'CANCELLED') throw new BadRequestException('Rien à payer sur cette réservation');
        const rate = Number(await this.settings.get('booking.depositRate'));
        const amount = b.paidCents === 0 ? Math.round(b.totalCents * rate) : b.totalCents - b.paidCents;
        const kind = b.paidCents === 0 ? 'Acompte' : 'Solde';
        return { amountCents: amount, currency: b.currency, label: `${kind} : ${b.session.program.title}` };
      }
      case 'EVENT': {
        const r = await this.prisma.eventRegistration.findUnique({ where: { id: refId }, include: { event: true } });
        if (!r || r.userId !== userId) throw new NotFoundException('Inscription introuvable');
        if (r.status !== 'PENDING') throw new BadRequestException('Rien à payer sur cette inscription');
        return { amountCents: r.totalCents, currency: r.event.currency, label: `Billet : ${r.event.title}` };
      }
      default:
        throw new BadRequestException('Objet de paiement inconnu');
    }
  }

  async checkout(userId: string, purpose: Purpose, refId: string, provider: Provider) {
    const { amountCents, currency, label } = await this.resolve(userId, purpose, refId);
    if (amountCents <= 0) throw new BadRequestException('Montant nul');
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const payment = await this.prisma.payment.create({
      data: { userId, purpose, refId, amountCents, currency, provider },
    });
    const web = this.mail.web;

    if (provider === 'STRIPE') {
      if (!this.stripe) return this.devFallback(payment);
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: user.email,
        line_items: [{ quantity: 1, price_data: { currency: currency.toLowerCase(), unit_amount: amountCents, product_data: { name: label } } }],
        metadata: { paymentId: payment.id },
        success_url: `${web}/paiement/resultat?pid=${payment.id}`,
        cancel_url: `${web}/paiement/resultat?pid=${payment.id}&annule=1`,
      });
      await this.prisma.payment.update({ where: { id: payment.id }, data: { providerRef: session.id } });
      return { paymentId: payment.id, provider, url: session.url };
    }

    // FeexPay : le navigateur ouvre le widget avec ce montant, puis renvoie la référence (confirmFeexPay).
    if (!this.cfg.get('FEEXPAY_API_KEY')) return this.devFallback(payment);
    return {
      paymentId: payment.id,
      provider,
      amountXof: await this.toXof(amountCents),
      description: label,
      customer: { firstName: user.firstName, lastName: user.lastName ?? '', email: user.email, phone: user.phone ?? '' },
    };
  }

  /** Hors production, sans clés : paiement simulé pour tester les parcours. */
  private devFallback(payment: Payment) {
    if (process.env.NODE_ENV === 'production') throw new BadRequestException('Moyen de paiement non configuré');
    return { paymentId: payment.id, provider: payment.provider, dev: true, url: `${this.mail.web}/paiement/resultat?pid=${payment.id}&dev=1` };
  }

  async devConfirm(paymentId: string, userId: string) {
    if (process.env.NODE_ENV === 'production') throw new ForbiddenException();
    const p = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!p || p.userId !== userId) throw new NotFoundException();
    return this.markSucceeded(p.id, `dev-${p.id}`);
  }

  async confirmFeexPay(paymentId: string, userId: string, reference: string) {
    const p = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!p || p.userId !== userId || p.provider !== 'FEEXPAY') throw new NotFoundException('Paiement introuvable');
    if (p.status === 'SUCCEEDED') return this.status(p.id, userId);
    const tx = await fetchFeexPayTransaction(reference);
    if (tx.status === 'PENDING') throw paymentRefused('Paiement en cours de confirmation chez FeexPay : réessaie dans un instant.');
    if (tx.status !== 'SUCCESSFUL' && tx.status !== 'SUCCESS') throw paymentRefused('Paiement non confirmé par FeexPay.');
    if (tx.reference && tx.reference !== reference.trim()) throw paymentRefused('Référence de paiement incohérente.');
    if (!Number.isFinite(tx.amount) || tx.amount < (await this.toXof(p.amountCents))) throw paymentRefused('Le montant payé ne couvre pas le total.');
    const reused = await this.prisma.payment.findFirst({ where: { providerRef: reference.trim(), status: 'SUCCEEDED' } });
    if (reused) throw new ConflictException('Ce paiement a déjà été utilisé.');
    await this.markSucceeded(p.id, reference.trim());
    return this.status(p.id, userId);
  }

  async stripeWebhook(rawBody: Buffer | undefined, signature: string | undefined) {
    const secret = this.cfg.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.stripe || !secret || !rawBody || !signature) throw new BadRequestException('Webhook non configuré');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Signature invalide');
    }
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.payment_status === 'paid' && s.metadata?.paymentId) await this.markSucceeded(s.metadata.paymentId, s.id);
    }
    return { received: true };
  }

  /** Statut, avec re-vérification Stripe si le webhook n'est pas encore arrivé. */
  async status(paymentId: string, userId: string) {
    let p = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!p || p.userId !== userId) throw new NotFoundException('Paiement introuvable');
    if (p.status === 'PENDING' && p.provider === 'STRIPE' && this.stripe && p.providerRef) {
      const s = await this.stripe.checkout.sessions.retrieve(p.providerRef);
      if (s.payment_status === 'paid') {
        await this.markSucceeded(p.id, s.id);
        p = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
      }
    }
    return { id: p.id, status: p.status, purpose: p.purpose, refId: p.refId, amountCents: p.amountCents, currency: p.currency, provider: p.provider };
  }

  mine(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  /** Idempotent : un paiement validé deux fois ne déclenche la suite qu'une fois. */
  async markSucceeded(paymentId: string, providerRef: string) {
    const changed = await this.prisma.payment.updateMany({
      where: { id: paymentId, status: { not: 'SUCCEEDED' } },
      data: { status: 'SUCCEEDED', providerRef },
    });
    if (changed.count === 0) return { ok: true, already: true };
    const p = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { user: true } });

    switch (p.purpose as Purpose) {
      case 'CONSULTATION':
        await this.prisma.consultation.update({ where: { id: p.refId }, data: { status: 'CONFIRMED' } });
        await this.consultations.sendConfirmed(p.refId);
        break;
      case 'EBO':
        await this.prisma.ebo.update({ where: { id: p.refId }, data: { status: 'PAID' } });
        break;
      case 'BOOKING': {
        const b = await this.prisma.booking.findUniqueOrThrow({ where: { id: p.refId } });
        const paid = b.paidCents + p.amountCents;
        await this.prisma.booking.update({
          where: { id: b.id },
          data: { paidCents: paid, status: paid >= b.totalCents ? 'PAID' : 'DEPOSIT_PAID' },
        });
        break;
      }
      case 'EVENT':
        await this.prisma.eventRegistration.update({ where: { id: p.refId }, data: { status: 'PAID' } });
        await sendTicket(this.prisma, this.mail, p.refId);
        break;
    }

    await this.mail.send(p.user.email, 'Paiement reçu', this.mail.layout(
      'Paiement reçu, merci',
      `<p>Montant : <b>${money(p.amountCents, p.currency)}</b>.</p><p>Ton reçu est disponible dans ton espace, rubrique Paiements.</p>`,
      { label: 'Mon espace', url: `${this.mail.web}/espace` },
    ), p.user.firstName);
    await this.mail.notifyAdmin('Paiement reçu', `<p>${p.purpose} · ${money(p.amountCents, p.currency)} · ${p.user.firstName}</p>`);
    await this.notify.toUser(p.userId, `Paiement reçu : ${money(p.amountCents, p.currency)}`, '/espace/paiements');
    await this.notify.toStaff(`Paiement reçu : ${money(p.amountCents, p.currency)} (${p.user.firstName})`, '/admin/paiements', p.purpose);
    this.log.log(`Paiement ${p.id} validé (${p.purpose})`);
    return { ok: true };
  }
}
