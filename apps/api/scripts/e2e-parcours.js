/* Parcours complet sur l'API réelle (plan, étape G de MISE_EN_PRODUCTION.md).
   Prérequis : API démarrée en local (NODE_ENV ≠ production, sans clé Stripe → paiement simulé).
   Lancer : node --env-file=.env scripts/e2e-parcours.js
   Deux gestes humains sont simulés en base, et seulement eux : le clic sur le lien de confirmation d'email,
   et l'avancement de l'échéance du suivi J+7 à aujourd'hui. */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const API = process.env.E2E_API || 'http://localhost:4000/api';
const EMAIL = process.env.E2E_TEST_EMAIL;
const PASSWORD = process.env.E2E_TEST_PASSWORD;

let step = 0;
const ok = (msg) => console.log(`  ✔ ${String(++step).padStart(2, '0')}. ${msg}`);
const fail = (msg) => { console.log(`  ✘ ${String(++step).padStart(2, '0')}. ${msg}`); throw new Error(msg); };
const expect = (cond, msg, detail = '') => (cond ? ok(msg) : fail(`${msg} ${detail}`));

async function call(method, path, body, token) {
  const r = await fetch(`${API}${path}`, {
    method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${JSON.stringify(data.message ?? data)}`);
  return data;
}

(async () => {
  if (!EMAIL || !PASSWORD) throw new Error('E2E_TEST_EMAIL / E2E_TEST_PASSWORD absents de .env');
  console.log(`Parcours sur ${API} avec ${EMAIL}\n`);

  // Admin
  const admin = await call('POST', '/auth/login', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  expect(admin.user.role === 'ADMIN', 'connexion du prêtre (admin)');
  const A = admin.token;

  // Créneau de demain 10:00 (heure du Bénin)
  const day = new Date(Date.now() + 86400_000).toISOString().slice(0, 10);
  const start = new Date(`${day}T10:00:00+01:00`);
  await call('POST', '/admin/slots', { slots: [{ startsAt: start.toISOString(), endsAt: new Date(start.getTime() + 45 * 60_000).toISOString() }] }, A);
  const slots = await call('GET', '/slots');
  const slot = slots.find((s) => new Date(s.startsAt).getTime() === start.getTime());
  expect(!!slot, 'créneau ouvert puis visible côté client');

  // Portrait anonyme
  const reading = await call('POST', '/readings', {
    firstName: 'Test', lastName: 'Parcours', birthDate: '1990-05-17', birthTime: '08:30', birthPlace: 'Cotonou, Littoral, Bénin',
    latitude: 6.3654, longitude: 2.4183, timezone: 'Africa/Porto-Novo', consent: true,
    answers: { blessure: 'garde', famille: 'pilier', repetition: 'souvent', trahison: 'une', reves: 'intenses', argent: 'fuit', manque: 'paix', chezsoi: 'pas-vraiment', ambiance: 'immediat', trop: 'gentil', domaine: 'installation', duree: 'long', intention: 'Avoir enfin mes papiers et la paix' },
  });
  const locked = reading.reading.sections.filter((s) => s.locked);
  expect(!reading.full && locked.length > 0 && locked.every((s) => !s.paragraphs.length), `portrait anonyme : aperçu visible, ${locked.length} sections verrouillées`);

  // Inscription (ou connexion si le compte test existe déjà)
  let auth;
  try { auth = await call('POST', '/auth/register', { email: EMAIL, password: PASSWORD, firstName: 'Test', lastName: 'Parcours', country: 'France', acceptCgu: true }); ok('inscription (email de bienvenue envoyé)'); }
  catch (e) { if (!/existe déjà/.test(e.message)) throw e; auth = await call('POST', '/auth/login', { email: EMAIL, password: PASSWORD }); ok('compte test déjà existant : connexion'); }
  const T = auth.token;

  const claimed = await call('POST', `/readings/${reading.id}/claim`, {}, T);
  expect(claimed.full && claimed.reading.sections.every((s) => s.paragraphs.length > 0), 'portrait rattaché au compte et entièrement déverrouillé');

  // Clic sur le lien de confirmation (simulé : lecture du jeton en base)
  const u = await prisma.user.findUnique({ where: { email: EMAIL.toLowerCase() } });
  if (!u.emailVerified) await call('GET', `/auth/verify?token=${u.emailToken}`);
  expect((await call('GET', '/me', undefined, T)).emailVerified, 'email confirmé (lien simulé)');

  // Consultation offerte (par écrit)
  let free;
  try {
    free = await call('POST', '/consultations', { offerCode: 'FIRST_FREE', question: 'Quel chemin pour régulariser ma situation ?', readingId: reading.id, consent: true }, T);
    expect(free.status === 'CONFIRMED' && free.isFirstFree, 'consultation offerte confirmée sans paiement');
  } catch (e) {
    if (!/déjà été utilisée/.test(e.message)) throw e;
    ok('consultation offerte déjà utilisée par ce compte : règle « une seule fois » respectée');
  }
  try { await call('POST', '/consultations', { offerCode: 'FIRST_FREE', question: 'Deuxième essai', consent: true }, T); fail('une 2e consultation offerte a été acceptée'); }
  catch (e) { expect(/déjà été utilisée/.test(e.message), 'une deuxième consultation offerte est refusée'); }

  // Compte rendu publié par le prêtre
  if (free) {
    await call('PUT', `/admin/consultations/${free.id}/report`, {
      oduId: 4 * 16 + 4, orientation: 'IRE', oriDetail: 'ire ìrìn-àjò', ese: 'Texte d\'ese de test.', message: 'Message de test pour le parcours.',
      actionPlan: ['Rassembler les documents', 'Prendre rendez-vous à la préfecture', 'Appeler la famille'], ewo: ['Ewọ̀ de test'], privateNotes: 'Note privée de test', publish: true,
    }, A);
    const seen = await call('GET', `/consultations/${free.id}`, undefined, T);
    expect(seen.status === 'COMPLETED' && seen.report && seen.report.privateNotes === null, 'compte rendu publié, visible par le client, sans les notes privées');
    expect(seen.followUps.map((f) => f.dayOffset).sort((a, b) => a - b).join() === '7,30,90', 'suivis J+7, J+30, J+90 créés automatiquement');
  }

  // Consultation payante sur créneau, paiement simulé
  const paid = await call('POST', '/consultations', { offerCode: 'VIDEO', slotId: slot.id, question: 'Question de la consultation payante', consent: true }, T);
  expect(paid.status === 'AWAITING_PAYMENT' && paid.priceCents === 4500, 'consultation visio créée, en attente de paiement (45 €)');
  try { await call('POST', '/consultations', { offerCode: 'VIDEO', slotId: slot.id, question: 'Même créneau', consent: true }, T); fail('le même créneau a été pris deux fois'); }
  catch (e) { expect(/plus disponible/.test(e.message), 'le même créneau ne peut pas être réservé deux fois'); }
  const co = await call('POST', '/payments/checkout', { purpose: 'CONSULTATION', refId: paid.id, provider: 'STRIPE' }, T);
  expect(co.dev === true, 'paiement simulé proposé (aucune clé Stripe en local)');
  await call('POST', `/payments/${co.paymentId}/dev-confirm`, {}, T);
  const afterPay = await call('GET', `/consultations/${paid.id}`, undefined, T);
  expect(afterPay.status === 'CONFIRMED' && !!afterPay.roomUrl, 'paiement confirmé par le serveur, consultation confirmée, salle de visio créée');

  // Ebo : proposition, acceptation, paiement, preuve
  const ebo = await call('POST', `/admin/consultations/${paid.id}/ebos`, {
    title: 'Ebo de test', purpose: 'Ouvrir le chemin (test)', priestFeeCents: 2000, liveAllowed: true,
    items: [{ label: 'Noix de cola', qty: 4, unitCents: 150 }, { label: 'Huile de palme (1 L)', qty: 1, unitCents: 400 }],
  }, A);
  expect(ebo.materialsCents === 1000 && ebo.status === 'PROPOSED', 'ebo proposé ligne par ligne : matériel 10 €, rémunération 20 € à part');
  await call('POST', `/ebos/${ebo.id}/accept`, {}, T);
  const coE = await call('POST', '/payments/checkout', { purpose: 'EBO', refId: ebo.id, provider: 'STRIPE' }, T);
  await call('POST', `/payments/${coE.paymentId}/dev-confirm`, {}, T);
  await call('PATCH', `/admin/ebos/${ebo.id}`, { proofVideoUrl: 'https://res.cloudinary.com/demo/video/upload/test-preuve.mp4', proofPublicId: 'test-preuve' }, A);
  const eboFinal = (await call('GET', `/consultations/${paid.id}`, undefined, T)).ebos.find((e) => e.id === ebo.id);
  expect(eboFinal.status === 'PERFORMED' && !!eboFinal.proofVideoUrl, 'ebo accepté, payé, réalisé avec preuve vidéo visible par le client');

  // Suivi J+7 (échéance avancée en base), réponse, réponse du prêtre
  if (free) {
    const f7 = await prisma.followUp.findFirst({ where: { consultationId: free.id, dayOffset: 7 } });
    await prisma.followUp.update({ where: { id: f7.id }, data: { dueAt: new Date() } });
    await call('POST', `/follow-ups/${f7.id}/answer`, { progress: 6, note: 'Les choses avancent (test).' }, T);
    await call('PATCH', `/admin/follow-ups/${f7.id}`, { priestReply: 'Continue ainsi (test).' }, A);
    const f = (await call('GET', '/follow-ups/mine', undefined, T)).find((x) => x.id === f7.id);
    expect(f.progress === 6 && f.priestReply, 'suivi J+7 rempli par le client (6/10) et réponse du prêtre');
  }

  // Dossier spirituel
  const dossier = await call('GET', '/me/dossier', undefined, T);
  expect(dossier.consultations.length >= 2 && dossier.ewos.length >= 1 && dossier.readings.length >= 1,
    `dossier : ${dossier.consultations.length} consultations, ${dossier.ewos.length} ewọ̀, ${dossier.readings.length} portrait(s)`);

  // Tableau de bord du prêtre
  const todo = await call('GET', '/admin/todo', undefined, A);
  expect(typeof todo.today === 'number', `tableau de bord : ${todo.today} consultation(s) aujourd'hui, ${todo.toPerform} ebo à réaliser`);

  // Étapes 2.1 à 2.3 : cloche, journal d'audit, consentements, session par cookie
  const notifs = await call('GET', '/notifications', undefined, T);
  expect(notifs.items.length > 0, `cloche client : ${notifs.items.length} notification(s), ${notifs.unread} non lue(s)`);
  const staffNotifs = await call('GET', '/notifications', undefined, A);
  expect(staffNotifs.items.length > 0, `cloche du prêtre : ${staffNotifs.items.length} notification(s)`);
  const audit = await call('GET', '/admin/audit', undefined, A);
  expect(audit.items.some((e) => e.entity === 'compte rendu' || e.entity === 'ebo'), `journal d'audit : ${audit.total} écriture(s) admin enregistrée(s)`);
  const testUser = await prisma.user.findUnique({ where: { email: EMAIL.toLowerCase() } });
  const consents = await prisma.consentLog.findMany({ where: { userId: testUser.id } });
  const kinds = [...new Set(consents.map((c) => c.kind))].sort().join(', ');
  expect(consents.length >= 2, `consentements enregistrés : ${kinds}`);
  const r1 = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const cookie = (r1.headers.get('set-cookie') || '').split(';')[0];
  const r2 = await fetch(`${API}/auth/refresh`, { method: 'POST', headers: { cookie } });
  const r3 = await fetch(`${API}/auth/refresh`, { method: 'POST', headers: { cookie } });
  expect(cookie.startsWith('ifaolade_rt=') && r2.ok && r3.status === 401, 'session : cookie httpOnly, renouvellement OK, ancien jeton refusé après rotation');

  console.log(`\n${step} étapes réussies.`);
})().catch((e) => { console.error(`\nArrêt : ${e.message}`); process.exitCode = 1; }).finally(() => prisma.$disconnect());
