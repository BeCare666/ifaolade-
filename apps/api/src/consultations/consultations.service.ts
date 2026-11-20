import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SETTINGS, SettingsService } from '../common/settings.service';
import { oduById } from '@ona/core';
import { ConsultationStatus, Prisma } from '@prisma/client';
import { isStaff, JwtUser } from '../common/auth';
import { PrismaService } from '../common/prisma.service';
import { frDate, money, roomUrl } from '../common/util';
import { NotificationsService } from '../common/notifications.service';
import { MailService } from '../mail/mail.service';
import { sanitizeConsultation } from '../users/users.service';
import {
  AnswerFollowUpDto, CreateConsultationDto, CreateEboDto, ReplyFollowUpDto, ReportDto, UpdateEboDto,
} from './consultations.dto';

export const FOLLOW_UP_DAYS = [7, 30, 90];
export const SLOT_HOLD_MINUTES = 15;

const fullInclude = {
  offer: true,
  slot: true,
  report: true,
  ebos: { orderBy: { createdAt: 'asc' as const } },
  followUps: { orderBy: { dueAt: 'asc' as const } },
  user: { select: { id: true, firstName: true, lastName: true, email: true, country: true } },
};

@Injectable()
export class ConsultationsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private notify: NotificationsService,
    private settings?: SettingsService,
  ) {}

  /** Début le plus proche réservable : maintenant + délai minimum (Admin › Paramètres). */
  async earliestStart(): Promise<Date> {
    const h = Number(this.settings ? await this.settings.get('booking.minLeadHours') : SETTINGS['booking.minLeadHours'].default);
    return new Date(Date.now() + Math.max(0, h) * 3_600_000);
  }

  // ---------- Client ----------

  async create(userId: string, dto: CreateConsultationDto) {
    const offer = await this.prisma.consultationOffer.findUnique({ where: { code: dto.offerCode } });
    if (!offer || !offer.active) throw new NotFoundException('Offre indisponible');
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (offer.isFree) {
      if (!user.emailVerified) throw new BadRequestException('Confirme ton email pour utiliser ta consultation offerte');
      const used = await this.prisma.consultation.count({
        where: { userId, isFirstFree: true, status: { not: 'CANCELLED' } },
      });
      if (used) throw new BadRequestException('Ta consultation offerte a déjà été utilisée');
    }
    if (offer.requiresSlot && !dto.slotId) throw new BadRequestException('Choisis un créneau');

    if (dto.slotId) {
      // Réservation atomique : seul un créneau libre et futur peut être pris.
      const taken = await this.prisma.slot.updateMany({
        where: { id: dto.slotId, isBooked: false, startsAt: { gt: await this.earliestStart() } },
        data: { isBooked: true },
      });
      if (taken.count !== 1) {
        const s = await this.prisma.slot.findUnique({ where: { id: dto.slotId } });
        if (s && !s.isBooked && s.startsAt > new Date()) throw new BadRequestException('Ce créneau est trop proche. Choisis un créneau plus tard, pour que le prêtre puisse préparer ta consultation.');
        throw new BadRequestException("Ce créneau n'est plus disponible");
      }
    }

    const status: ConsultationStatus = offer.isFree || offer.priceCents === 0 ? 'CONFIRMED' : 'AWAITING_PAYMENT';
    const c = await this.prisma.consultation.create({
      data: {
        userId,
        offerId: offer.id,
        slotId: dto.slotId ?? null,
        status,
        question: dto.question.trim(),
        context: dto.context?.trim(),
        readingId: dto.readingId,
        roomUrl: dto.slotId ? roomUrl() : null,
        priceCents: offer.priceCents,
        currency: offer.currency,
        isFirstFree: offer.isFree,
      },
      include: fullInclude,
    });

    if (status === 'CONFIRMED') await this.sendConfirmed(c.id);
    await this.mail.notifyAdmin('Nouvelle demande de consultation', `<p>${user.firstName} — ${offer.title}</p><p>« ${c.question} »</p>`);
    await this.notify.toStaff(`Nouvelle consultation : ${user.firstName}`, `/admin/consultations/${c.id}`, offer.title);
    return sanitizeConsultation(c, false);
  }

  async sendConfirmed(id: string) {
    const c = await this.prisma.consultation.findUniqueOrThrow({ where: { id }, include: fullInclude });
    const when = c.slot ? `<p><b>Rendez-vous :</b> ${frDate(c.slot.startsAt)}</p><p>Le lien de la visio sera actif 10 minutes avant, dans ton espace.</p>` : '<p>Tu recevras ta réponse écrite dans ton espace sous 72 heures.</p>';
    await this.mail.send(
      c.user.email,
      'Ta consultation est confirmée',
      this.mail.layout('Consultation confirmée', `<p>${c.offer.title}</p>${when}<p>Ta question : « ${c.question} »</p>`, {
        label: 'Ouvrir mon espace', url: `${this.mail.web}/espace/consultations/${c.id}`,
      }),
      c.user.firstName,
    );
    await this.notify.toUser(c.userId, 'Ta consultation est confirmée', `/espace/consultations/${c.id}`, c.offer.title);
  }

  mine(userId: string) {
    return this.prisma.consultation
      .findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: fullInclude })
      .then((list) => list.map((c) => sanitizeConsultation(c, false)));
  }

  async get(id: string, u: JwtUser) {
    const c = await this.prisma.consultation.findUnique({ where: { id }, include: fullInclude });
    if (!c) throw new NotFoundException('Consultation introuvable');
    if (c.userId !== u.sub && !isStaff(u)) throw new ForbiddenException();
    return sanitizeConsultation(c, isStaff(u));
  }

  async cancel(id: string, u: JwtUser) {
    const c = await this.prisma.consultation.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    if (c.userId !== u.sub && !isStaff(u)) throw new ForbiddenException();
    if (c.status === 'COMPLETED' || c.status === 'CANCELLED') throw new BadRequestException('Consultation déjà terminée');
    await this.releaseAndCancel(c.id, c.slotId);
    await this.mail.notifyAdmin('Consultation annulée', `<p>Consultation ${c.id} annulée.</p>`);
    await this.notify.toStaff('Consultation annulée', `/admin/consultations/${c.id}`);
    return { ok: true };
  }

  private async releaseAndCancel(id: string, slotId: string | null) {
    await this.prisma.$transaction([
      this.prisma.consultation.update({ where: { id }, data: { status: 'CANCELLED', slotId: null } }),
      ...(slotId ? [this.prisma.slot.update({ where: { id: slotId }, data: { isBooked: false } })] : []),
    ]);
  }

  /** Libère les créneaux des consultations non payées après SLOT_HOLD_MINUTES. */
  async releaseUnpaid() {
    const limit = new Date(Date.now() - SLOT_HOLD_MINUTES * 60_000);
    const stale = await this.prisma.consultation.findMany({
      where: { status: 'AWAITING_PAYMENT', createdAt: { lt: limit } },
      select: { id: true, slotId: true },
    });
    for (const c of stale) await this.releaseAndCancel(c.id, c.slotId);
    return stale.length;
  }

  async decideEbo(eboId: string, u: JwtUser, accept: boolean) {
    const ebo = await this.prisma.ebo.findUnique({ where: { id: eboId }, include: { consultation: true } });
    if (!ebo) throw new NotFoundException('Ebo introuvable');
    if (ebo.consultation.userId !== u.sub) throw new ForbiddenException();
    if (ebo.status !== 'PROPOSED') throw new BadRequestException('Cet ebo a déjà reçu une réponse');
    const updated = await this.prisma.ebo.update({ where: { id: eboId }, data: { status: accept ? 'ACCEPTED' : 'DECLINED' } });
    await this.mail.notifyAdmin(accept ? 'Ebo accepté' : 'Ebo refusé', `<p>${ebo.title}</p>`);
    await this.notify.toStaff(accept ? 'Ebo accepté par le client' : 'Ebo refusé par le client', `/admin/consultations/${ebo.consultationId}`, ebo.title);
    return updated;
  }

  mineFollowUps(userId: string) {
    return this.prisma.followUp.findMany({
      where: { consultation: { userId } },
      orderBy: { dueAt: 'asc' },
      include: { consultation: { select: { id: true, question: true, offer: { select: { title: true } } } } },
    });
  }

  async answerFollowUp(id: string, u: JwtUser, dto: AnswerFollowUpDto) {
    const f = await this.prisma.followUp.findUnique({ where: { id }, include: { consultation: true } });
    if (!f) throw new NotFoundException();
    if (f.consultation.userId !== u.sub) throw new ForbiddenException();
    if (f.dueAt > new Date(Date.now() + 86400_000)) throw new BadRequestException("Ce suivi n'est pas encore ouvert");
    const updated = await this.prisma.followUp.update({
      where: { id }, data: { progress: dto.progress, note: dto.note, answeredAt: new Date() },
    });
    await this.mail.notifyAdmin(`Suivi J+${f.dayOffset} reçu`, `<p>Progression : ${dto.progress}/10</p><p>${dto.note ?? ''}</p>`);
    await this.notify.toStaff(`Suivi J+${f.dayOffset} reçu : ${dto.progress}/10`, `/admin/consultations/${f.consultationId}`);
    return updated;
  }

  // ---------- Admin / prêtre ----------

  listAdmin(params: { status?: string; q?: string; page: number; pageSize: number }) {
    const where: Prisma.ConsultationWhereInput = {};
    if (params.status) where.status = params.status as ConsultationStatus;
    if (params.q) {
      where.OR = [
        { question: { contains: params.q } },
        { user: { firstName: { contains: params.q } } },
        { user: { lastName: { contains: params.q } } },
        { user: { email: { contains: params.q } } },
      ];
    }
    return this.prisma.$transaction([
      this.prisma.consultation.findMany({
        where, include: fullInclude, orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize, take: params.pageSize,
      }),
      this.prisma.consultation.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  async setStatus(id: string, status: ConsultationStatus) {
    const c = await this.prisma.consultation.findUnique({ where: { id } });
    if (!c) throw new NotFoundException();
    if (status === 'CANCELLED') {
      await this.releaseAndCancel(id, c.slotId);
      return { ok: true };
    }
    return this.prisma.consultation.update({ where: { id }, data: { status } });
  }

  async upsertReport(id: string, dto: ReportDto) {
    const c = await this.prisma.consultation.findUnique({ where: { id }, include: { report: true, user: true } });
    if (!c) throw new NotFoundException();
    if (!oduById(dto.oduId)) throw new BadRequestException('Odu invalide');
    const alreadyPublished = !!c.report?.publishedAt;
    const publishNow = dto.publish && !alreadyPublished;
    const data = {
      oduId: dto.oduId,
      orientation: dto.orientation,
      oriDetail: dto.oriDetail,
      ese: dto.ese,
      message: dto.message,
      actionPlan: dto.actionPlan as Prisma.InputJsonValue,
      ewo: dto.ewo as Prisma.InputJsonValue,
      privateNotes: dto.privateNotes,
      ...(publishNow ? { publishedAt: new Date() } : {}),
    };
    const report = await this.prisma.consultationReport.upsert({
      where: { consultationId: id }, create: { consultationId: id, ...data }, update: data,
    });

    if (publishNow) {
      const now = Date.now();
      const existing = await this.prisma.followUp.count({ where: { consultationId: id } });
      await this.prisma.$transaction([
        this.prisma.consultation.update({ where: { id }, data: { status: 'COMPLETED' } }),
        ...(existing
          ? []
          : FOLLOW_UP_DAYS.map((d) =>
              this.prisma.followUp.create({ data: { consultationId: id, dayOffset: d, dueAt: new Date(now + d * 86400_000) } }),
            )),
        ...dto.ewo.filter((t) => t.trim()).map((text) =>
          this.prisma.ewo.create({
            data: { userId: c.userId, text: text.trim(), source: `Consultation du ${new Date().toLocaleDateString('fr-FR')}` },
          }),
        ),
      ]);
      const odu = oduById(dto.oduId)!;
      await this.mail.send(
        c.user.email,
        'Ton compte rendu est disponible',
        this.mail.layout(
          'Ton compte rendu est prêt',
          `<p>L'Odu qui a parlé pour toi : <b>${odu.name}</b> (${odu.fonName}).</p><p>Tu trouveras le message, l'ese, ton plan d'action et tes ewọ̀ dans ton espace. Ton suivi commence : nous te recontacterons à J+7, J+30 et J+90.</p>`,
          { label: 'Lire mon compte rendu', url: `${this.mail.web}/espace/consultations/${id}` },
        ),
        c.user.firstName,
      );
      await this.notify.toUser(c.userId, 'Ton compte rendu est disponible', `/espace/consultations/${id}`, `L'Odu qui a parlé pour toi : ${odu.name}`);
    }
    return report;
  }

  async createEbo(consultationId: string, dto: CreateEboDto) {
    const c = await this.prisma.consultation.findUnique({ where: { id: consultationId }, include: { user: true } });
    if (!c) throw new NotFoundException();
    if (!dto.items.length) throw new BadRequestException('Un ebo doit être détaillé ligne par ligne'); // règle 4.2
    const materialsCents = dto.items.reduce((s, i) => s + i.qty * i.unitCents, 0);
    const ebo = await this.prisma.ebo.create({
      data: {
        consultationId,
        title: dto.title,
        purpose: dto.purpose,
        items: dto.items as unknown as Prisma.InputJsonValue,
        materialsCents,
        priestFeeCents: dto.priestFeeCents,
        currency: c.currency,
        liveAllowed: dto.liveAllowed ?? true,
      },
    });
    await this.mail.send(
      c.user.email,
      "Proposition d'ebo",
      this.mail.layout(
        "Une proposition d'ebo t'attend",
        `<p><b>${ebo.title}</b></p><p>Matériel : ${money(materialsCents, ebo.currency)} · Rémunération du prêtre : ${money(ebo.priestFeeCents, ebo.currency)}</p><p>Chaque ligne est détaillée dans ton espace. Tu es entièrement libre d'accepter ou de refuser.</p>`,
        { label: 'Voir le détail', url: `${this.mail.web}/espace/consultations/${consultationId}` },
      ),
      c.user.firstName,
    );
    await this.notify.toUser(c.userId, "Une proposition d'ebo t'attend", `/espace/consultations/${consultationId}`, ebo.title);
    return ebo;
  }

  async updateEbo(id: string, dto: UpdateEboDto) {
    const ebo = await this.prisma.ebo.findUnique({ where: { id }, include: { consultation: { include: { user: true } } } });
    if (!ebo) throw new NotFoundException();
    if (dto.proofVideoUrl) {
      // Règle 4.4 : « Réalisé » uniquement avec une preuve vidéo, et seulement après paiement.
      if (ebo.status !== 'PAID' && ebo.status !== 'PERFORMED') throw new BadRequestException("L'ebo doit être payé avant d'être réalisé");
      const updated = await this.prisma.ebo.update({
        where: { id },
        data: { proofVideoUrl: dto.proofVideoUrl, proofPublicId: dto.proofPublicId, status: 'PERFORMED', performedAt: new Date() },
      });
      const u = ebo.consultation.user;
      await this.mail.send(
        u.email,
        'Ton ebo a été réalisé',
        this.mail.layout('Ton ebo a été réalisé', `<p>${ebo.title}</p><p>La vidéo de l'ebo est disponible dans ton dossier.</p>`, {
          label: 'Voir la preuve', url: `${this.mail.web}/espace/consultations/${ebo.consultationId}`,
        }),
        u.firstName,
      );
      await this.notify.toUser(u.id, 'Ton ebo a été réalisé : la preuve vidéo est disponible', `/espace/consultations/${ebo.consultationId}`, ebo.title);
      return updated;
    }
    return ebo;
  }

  async replyFollowUp(id: string, dto: ReplyFollowUpDto) {
    const f = await this.prisma.followUp.findUnique({ where: { id }, include: { consultation: { include: { user: true } } } });
    if (!f) throw new NotFoundException();
    const updated = await this.prisma.followUp.update({ where: { id }, data: { priestReply: dto.priestReply } });
    const u = f.consultation.user;
    await this.mail.send(u.email, 'Réponse à ton suivi', this.mail.layout('Le prêtre t\'a répondu', `<p>${dto.priestReply}</p>`, {
      label: 'Ouvrir mon suivi', url: `${this.mail.web}/espace/consultations/${f.consultationId}`,
    }), u.firstName);
    await this.notify.toUser(u.id, 'Le prêtre a répondu à ton suivi', `/espace/consultations/${f.consultationId}`);
    return updated;
  }

  // ---------- Tâches planifiées ----------

  async sendDueFollowUps() {
    const due = await this.prisma.followUp.findMany({
      where: { dueAt: { lte: new Date() }, reminderSentAt: null, answeredAt: null },
      include: { consultation: { include: { user: true } } },
      take: 200,
    });
    for (const f of due) {
      const u = f.consultation.user;
      await this.mail.send(u.email, `Ton suivi J+${f.dayOffset}`, this.mail.layout(
        "Qu'est-ce qui a changé ?",
        `<p>Cela fait ${f.dayOffset} jours depuis ta consultation. Dis-nous honnêtement où tu en es, de 0 à 10. Ta réponse nous permet d'ajuster l'accompagnement.</p>`,
        { label: 'Répondre au suivi', url: `${this.mail.web}/espace/consultations/${f.consultationId}` },
      ), u.firstName);
      await this.notify.toUser(u.id, `Ton suivi J+${f.dayOffset} est ouvert`, `/espace/consultations/${f.consultationId}`);
      await this.prisma.followUp.update({ where: { id: f.id }, data: { reminderSentAt: new Date() } });
    }
    return due.length;
  }

  async sendAppointmentReminders() {
    const now = Date.now();
    const windows = [
      { label: 'demain', from: now + 23.5 * 3600_000, to: now + 24.5 * 3600_000 },
      { label: 'dans une heure', from: now + 0.5 * 3600_000, to: now + 1.5 * 3600_000 },
    ];
    let count = 0;
    for (const w of windows) {
      const list = await this.prisma.consultation.findMany({
        where: { status: 'CONFIRMED', slot: { startsAt: { gte: new Date(w.from), lt: new Date(w.to) } } },
        include: { slot: true, user: true, offer: true },
      });
      for (const c of list) {
        await this.mail.send(c.user.email, `Rappel : ta consultation ${w.label}`, this.mail.layout(
          `Ta consultation, ${w.label}`,
          `<p>${c.offer.title} — ${frDate(c.slot!.startsAt)}</p><p>Prépare un endroit calme. Le lien de la visio est dans ton espace.</p>`,
          { label: 'Ouvrir mon espace', url: `${this.mail.web}/espace/consultations/${c.id}` },
        ), c.user.firstName);
        count++;
      }
    }
    return count;
  }
}
