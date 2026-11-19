/* Plan étape 8.1 : tests de sécurité et de règles métier, sur l'API compilée (dist), base simulée.
   Lancer : npm run build -w @ona/api && npm test -w @ona/api */
process.env.NODE_ENV = 'test';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { BadRequestException, ConflictException, ForbiddenException, HttpException, UnauthorizedException } = require('@nestjs/common');
const { JwtService } = require('@nestjs/jwt');
const Stripe = require('stripe');
const core = require('@ona/core');

const { sanitizeConsultation } = require('../dist/users/users.service');
const { ConsultationsService } = require('../dist/consultations/consultations.service');
const { PaymentsService } = require('../dist/payments/payments.service');
const { AuthGuard } = require('../dist/common/auth');
const { ReadingsController } = require('../dist/readings/readings.controller');

const mail = { send: async () => {}, notifyAdmin: async () => {}, layout: () => '', web: 'http://localhost:3000' };
const notify = { toUser: async () => {}, toStaff: async () => {} };
const settings = { get: async (k) => ({ 'money.eurToXof': 655.957, 'booking.depositRate': 0.3 })[k] };
const CLIENT_A = { sub: 'A', role: 'CLIENT', email: 'a@x.io' };
const CLIENT_B = { sub: 'B', role: 'CLIENT', email: 'b@x.io' };
const PRIEST = { sub: 'P', role: 'PRIEST', email: 'p@x.io' };
const is = (Cls) => (e) => e instanceof Cls;

function consultationRow(over = {}) {
  return {
    id: 'C1', userId: 'A', status: 'COMPLETED', ebos: [], followUps: [], offer: {}, slot: null, user: {},
    report: { privateNotes: 'note secrète du prêtre', publishedAt: new Date() }, ...over,
  };
}

// ---------- Notes privées et brouillons (règle 4.9) ----------
test('sanitizeConsultation : notes privées masquées pour le client, visibles pour le prêtre', () => {
  const c = consultationRow();
  assert.equal(sanitizeConsultation(c, false).report.privateNotes, null);
  assert.equal(sanitizeConsultation(c, true).report.privateNotes, 'note secrète du prêtre');
});

test('sanitizeConsultation : un compte rendu non publié n\'est jamais envoyé au client', () => {
  const c = consultationRow({ report: { privateNotes: 'x', publishedAt: null, message: 'brouillon' } });
  assert.equal(sanitizeConsultation(c, false).report, null);
});

// ---------- Cloisonnement des dossiers ----------
test('un client ne peut pas lire la consultation d\'un autre client', async () => {
  const prisma = { consultation: { findUnique: async () => consultationRow() } };
  const svc = new ConsultationsService(prisma, mail, notify);
  await assert.rejects(svc.get('C1', CLIENT_B), is(ForbiddenException));
  const own = await svc.get('C1', CLIENT_A);
  assert.equal(own.report.privateNotes, null);
  const staff = await svc.get('C1', PRIEST);
  assert.equal(staff.report.privateNotes, 'note secrète du prêtre');
});

test('un client ne peut pas accepter l\'ebo d\'un autre, ni répondre deux fois', async () => {
  let ebo = { id: 'E1', status: 'PROPOSED', title: 't', consultation: { userId: 'A' } };
  const prisma = { ebo: { findUnique: async () => ebo, update: async ({ data }) => ({ ...ebo, ...data }) } };
  const svc = new ConsultationsService(prisma, mail, notify);
  await assert.rejects(svc.decideEbo('E1', CLIENT_B, true), is(ForbiddenException));
  ebo = { ...ebo, status: 'ACCEPTED' };
  await assert.rejects(svc.decideEbo('E1', CLIENT_A, false), is(BadRequestException));
});

test('un portrait rattaché à un compte est refusé aux autres ; un portrait anonyme est verrouillé', async () => {
  const result = core.buildReading({ firstName: 'Ama', birthDate: '1990-05-17', birthTime: '08:30', timezone: 'Europe/Paris', latitude: 48.85, longitude: 2.35, answers: { domaine: 'amour', intention: 'trouver la paix' } });
  let row = { id: 'R1', userId: 'A', result, createdAt: new Date() };
  const ctrl = new ReadingsController({ reading: { findUnique: async () => row } }, { validated: async () => ({}) });
  await assert.rejects(ctrl.get('R1', CLIENT_B), is(ForbiddenException));
  row = { ...row, userId: null };
  const anon = await ctrl.get('R1', undefined);
  assert.equal(anon.full, false);
  const locked = anon.reading.sections.filter((s) => !s.preview);
  assert.ok(locked.length > 0 && locked.every((s) => s.locked && s.paragraphs.length === 0), 'les sections hors aperçu doivent être vides');
  assert.ok(!JSON.stringify(anon).includes('trouver la paix'), 'la phrase libre ne doit pas fuiter dans l\'aperçu');
});

// ---------- Garde d'authentification et rôles ----------
test('AuthGuard : sans jeton refusé, client refusé sur une route prêtre, prêtre accepté', async () => {
  const jwt = new JwtService({ secret: 'test-secret' });
  const ctx = (token) => {
    const req = { headers: token ? { authorization: `Bearer ${token}` } : {} };
    return { switchToHttp: () => ({ getRequest: () => req }), getHandler: () => null, getClass: () => null };
  };
  const reflector = (roles, optional) => ({ getAllAndOverride: (key) => (key === 'roles' ? roles : optional) });
  const staffGuard = new AuthGuard(jwt, reflector(['ADMIN', 'PRIEST'], undefined));
  await assert.rejects(staffGuard.canActivate(ctx(null)), is(UnauthorizedException));
  await assert.rejects(staffGuard.canActivate(ctx(jwt.sign(CLIENT_A))), is(ForbiddenException));
  assert.equal(await staffGuard.canActivate(ctx(jwt.sign(PRIEST))), true);
  await assert.rejects(staffGuard.canActivate(ctx('jeton.falsifie.xyz')), is(UnauthorizedException));
  const optional = new AuthGuard(jwt, reflector(undefined, true));
  assert.equal(await optional.canActivate(ctx(null)), true);
});

// ---------- Consultation offerte et créneaux ----------
test('la consultation offerte : une seule fois, et seulement avec un email confirmé', async () => {
  let verified = true;
  let used = 1;
  const prisma = {
    consultationOffer: { findUnique: async () => ({ id: 'O', code: 'FIRST_FREE', isFree: true, active: true, requiresSlot: false, priceCents: 0, currency: 'EUR' }) },
    user: { findUniqueOrThrow: async () => ({ id: 'A', emailVerified: verified, firstName: 'Ama' }) },
    consultation: { count: async () => used },
  };
  const svc = new ConsultationsService(prisma, mail, notify);
  const dto = { offerCode: 'FIRST_FREE', question: 'Ma question', consent: true };
  await assert.rejects(svc.create('A', dto), (e) => e instanceof BadRequestException && /déjà été utilisée/.test(e.message));
  verified = false; used = 0;
  await assert.rejects(svc.create('A', dto), (e) => e instanceof BadRequestException && /email/.test(e.message));
});

test('un créneau déjà pris ne peut pas être réservé deux fois', async () => {
  const prisma = {
    consultationOffer: { findUnique: async () => ({ id: 'O', code: 'VIDEO', isFree: false, active: true, requiresSlot: true, priceCents: 4500, currency: 'EUR' }) },
    user: { findUniqueOrThrow: async () => ({ id: 'A', emailVerified: true }) },
    slot: { updateMany: async () => ({ count: 0 }) },
  };
  const svc = new ConsultationsService(prisma, mail, notify);
  await assert.rejects(svc.create('A', { offerCode: 'VIDEO', slotId: 'S1', question: 'Ma question', consent: true }), (e) => /plus disponible/.test(e.message));
});

// ---------- Compte rendu et suivis (règle 4.5) ----------
test('publier un compte rendu crée les suivis J+7, J+30, J+90 et consigne les ewọ̀', async () => {
  const created = { followUps: [], ewos: [] };
  const prisma = {
    consultation: { findUnique: async () => ({ id: 'C1', userId: 'A', report: null, user: { email: 'a@x.io', firstName: 'Ama' } }), update: async () => ({}) },
    consultationReport: { upsert: async ({ create }) => create },
    followUp: { count: async () => 0, create: async ({ data }) => created.followUps.push(data.dayOffset) },
    ewo: { create: async ({ data }) => created.ewos.push(data.text) },
    $transaction: async (ops) => Promise.all(ops),
  };
  const svc = new ConsultationsService(prisma, mail, notify);
  await svc.upsertReport('C1', { oduId: 0, orientation: 'IRE', ese: 'ese', message: 'message', actionPlan: ['agir'], ewo: ['ne pas manger de noix de coco', ' '], publish: true });
  assert.deepEqual(created.followUps.sort((a, b) => a - b), [7, 30, 90]);
  assert.deepEqual(created.ewos, ['ne pas manger de noix de coco']);
});

test('un ebo ne peut pas être proposé sans détail ligne par ligne (règle 4.2)', async () => {
  const prisma = { consultation: { findUnique: async () => ({ id: 'C1', currency: 'EUR', user: { email: 'a@x.io' } }) } };
  const svc = new ConsultationsService(prisma, mail, notify);
  await assert.rejects(svc.createEbo('C1', { title: 'Ebo', purpose: 'x', items: [], priestFeeCents: 1000 }), is(BadRequestException));
});

test('un ebo non payé ne peut pas être marqué « réalisé » (règle 4.4)', async () => {
  const prisma = { ebo: { findUnique: async () => ({ id: 'E1', status: 'ACCEPTED', consultation: { user: {} } }) } };
  const svc = new ConsultationsService(prisma, mail, notify);
  await assert.rejects(svc.updateEbo('E1', { proofVideoUrl: 'https://res.cloudinary.com/x.mp4' }), is(BadRequestException));
});

// ---------- Paiements ----------
function paymentsService(prismaOver = {}, env = {}) {
  const cfg = { get: (k, d) => (k in env ? env[k] : d) };
  const calls = { fulfilled: 0, marked: [] };
  const prisma = {
    payment: {
      updateMany: async ({ where }) => { calls.marked.push(where.id); return { count: calls.marked.length === 1 ? 1 : 0 }; },
      findUniqueOrThrow: async () => ({ id: 'PAY1', purpose: 'CONSULTATION', refId: 'C1', amountCents: 4500, currency: 'EUR', user: { email: 'a@x.io', firstName: 'Ama' } }),
      ...(prismaOver.payment ?? {}),
    },
    consultation: { update: async () => { calls.fulfilled++; } },
    ...prismaOver.rest,
  };
  const consultations = { sendConfirmed: async () => {} };
  return { svc: new PaymentsService(prisma, cfg, mail, consultations, settings, notify), calls };
}

test('un paiement validé deux fois ne déclenche la suite qu\'une seule fois (idempotence)', async () => {
  const { svc, calls } = paymentsService();
  await svc.markSucceeded('PAY1', 'ref');
  const second = await svc.markSucceeded('PAY1', 'ref');
  assert.equal(second.already, true);
  assert.equal(calls.fulfilled, 1);
});

test('webhook Stripe : signature falsifiée refusée, signature valide acceptée', async () => {
  const env = { STRIPE_SECRET_KEY: 'sk_test_123', STRIPE_WEBHOOK_SECRET: 'whsec_test_secret' };
  const { svc, calls } = paymentsService({}, env);
  const payload = JSON.stringify({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: { id: 'cs_1', payment_status: 'paid', metadata: { paymentId: 'PAY1' } } } });
  await assert.rejects(svc.stripeWebhook(Buffer.from(payload), 't=1,v1=falsifie'), is(BadRequestException));
  await assert.rejects(svc.stripeWebhook(undefined, undefined), is(BadRequestException));
  const header = new Stripe('sk_test_123').webhooks.generateTestHeaderString({ payload, secret: env.STRIPE_WEBHOOK_SECRET });
  await svc.stripeWebhook(Buffer.from(payload), header);
  assert.deepEqual(calls.marked, ['PAY1']);
});

test('FeexPay : montant insuffisant refusé, référence déjà utilisée refusée', async () => {
  process.env.FEEXPAY_API_KEY = 'test';
  const realFetch = global.fetch;
  let amount = 100;
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ reference: 'REF12345678', amount, status: 'SUCCESSFUL' }) });
  try {
    const pending = { id: 'PAY2', userId: 'A', provider: 'FEEXPAY', status: 'PENDING', amountCents: 4500 };
    let reused = null;
    const { svc } = paymentsService({ payment: { findUnique: async () => pending, findFirst: async () => reused } });
    await assert.rejects(svc.confirmFeexPay('PAY2', 'A', 'REF12345678'), (e) => e instanceof HttpException && e.getStatus() === 402);
    amount = 1_000_000;
    reused = { id: 'AUTRE' };
    await assert.rejects(svc.confirmFeexPay('PAY2', 'A', 'REF12345678'), is(ConflictException));
    await assert.rejects(svc.confirmFeexPay('PAY2', 'B', 'REF12345678'), (e) => e.getStatus() === 404);
  } finally {
    global.fetch = realFetch;
  }
});

test('le paiement simulé est interdit en production', async () => {
  const { svc } = paymentsService();
  process.env.NODE_ENV = 'production';
  try { await assert.rejects(svc.devConfirm('PAY1', 'A'), is(ForbiddenException)); } finally { process.env.NODE_ENV = 'test'; }
});

// ---------- Renouvellement de session (étape 2.2) ----------
const { AuthService, REFRESH_COOKIE } = require('../dist/auth/auth.service');
const { createHash } = require('crypto');
function authHarness(row) {
  const revoked = [];
  const created = [];
  const prisma = {
    refreshToken: {
      findUnique: async ({ where }) => (row && where.tokenHash === createHash('sha256').update('JETON').digest('hex') ? row : null),
      update: async ({ where }) => { revoked.push(where.id); },
      updateMany: async ({ where }) => { revoked.push('tous:' + where.userId); return { count: 1 }; },
      create: async ({ data }) => { created.push(data); },
    },
  };
  const svc = new AuthService(prisma, new JwtService({ secret: 's' }), mail, { record: async () => {} });
  const cookies = { set: [], cleared: 0 };
  const res = { cookie: (n, v, o) => cookies.set.push({ n, v, o }), clearCookie: () => { cookies.cleared++; } };
  const req = (c) => ({ headers: c ? { cookie: `${REFRESH_COOKIE}=${c}` } : {} });
  return { svc, revoked, created, cookies, res, req };
}

test('refresh : rotation du jeton, cookie httpOnly, ancien jeton révoqué', async () => {
  const user = { id: 'A', role: 'CLIENT', email: 'a@x.io', firstName: 'Ama' };
  const h = authHarness({ id: 'RT1', userId: 'A', revokedAt: null, expiresAt: new Date(Date.now() + 86400_000), user });
  const out = await h.svc.refresh(h.req('JETON'), h.res);
  assert.ok(out.token && out.user.id === 'A');
  assert.deepEqual(h.revoked, ['RT1']);
  assert.equal(h.created.length, 1);
  assert.equal(h.cookies.set[0].o.httpOnly, true);
  assert.notEqual(h.cookies.set[0].v, 'JETON');
  assert.ok(h.created[0].tokenHash !== h.cookies.set[0].v, 'le jeton est stocké haché, jamais en clair');
});

test('refresh : un jeton déjà révoqué réutilisé ferme toutes les sessions (vol probable)', async () => {
  const h = authHarness({ id: 'RT1', userId: 'A', revokedAt: new Date(), expiresAt: new Date(Date.now() + 86400_000), user: {} });
  await assert.rejects(h.svc.refresh(h.req('JETON'), h.res), is(UnauthorizedException));
  assert.deepEqual(h.revoked, ['tous:A']);
  assert.equal(h.cookies.cleared, 1);
  const none = authHarness(null);
  await assert.rejects(none.svc.refresh(none.req(null), none.res), is(UnauthorizedException));
});
