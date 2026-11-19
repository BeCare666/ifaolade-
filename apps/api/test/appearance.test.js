/* Refonte §7 et §8 : images, textes et avatar modifiables, sans ouvrir de faille. */
process.env.NODE_ENV = 'test';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { BadRequestException, NotFoundException } = require('@nestjs/common');
const { AppearanceController } = require('../dist/appearance/appearance.controller');
const { UsersController } = require('../dist/users/users.controller');

const cfg = { get: (k) => ({ CLOUDINARY_CLOUD_NAME: 'moncloud', CLOUDINARY_API_SECRET: 's3cret', CLOUDINARY_API_KEY: 'k' })[k] };
const prisma = {
  siteImage: { upsert: async (a) => a.create, deleteMany: async () => ({}) },
  siteText: { upsert: async (a) => a.create, deleteMany: async () => ({ count: 1 }) },
  user: { update: async ({ data }) => ({ id: 'A', email: 'a@x.io', firstName: 'A', role: 'CLIENT', emailVerified: true, createdAt: new Date(), ...data }) },
};
const c = new AppearanceController(prisma, cfg);
const is = (C) => (e) => e instanceof C;

test('image : seules les sources autorisées passent (ton Cloudinary, Unsplash, Pexels)', async () => {
  assert.ok(await c.setImage('home.hero', { url: 'https://res.cloudinary.com/moncloud/image/upload/v1/ifaolade/site/a.jpg' }));
  assert.ok(await c.setImage('home.hero', { url: 'https://images.unsplash.com/photo-1' }));
  await assert.rejects(c.setImage('home.hero', { url: 'https://res.cloudinary.com/autrecloud/image/upload/a.jpg' }), is(BadRequestException));
  await assert.rejects(c.setImage('home.hero', { url: 'https://exemple.com/a.jpg' }), is(BadRequestException));
  await assert.rejects(c.setImage('emplacement.inconnu', { url: 'https://images.unsplash.com/x' }), is(NotFoundException));
});

test('textes : clé et langue contrôlées ; un texte vide rétablit celui d’origine', async () => {
  await assert.rejects(c.setText('cle.inconnue', 'fr', { value: 'x' }), is(NotFoundException));
  await assert.rejects(c.setText('home.heroTitle', 'de', { value: 'x' }), is(BadRequestException));
  assert.equal((await c.setText('home.heroTitle', 'fr', { value: '   ' })).value, '');
  assert.equal((await c.setText('home.heroTitle', 'yo', { value: ' Ọ̀rọ̀ ' })).value, 'Ọ̀rọ̀');
});

test('avatar : la signature impose le dossier et le recadrage ; une URL étrangère est refusée', async () => {
  const u = new UsersController(prisma, {}, cfg);
  const sig = u.avatarSignature();
  assert.equal(sig.folder, 'ifaolade/avatars');
  assert.equal(sig.transformation, 'c_fill,g_face,w_400,h_400');
  assert.ok(sig.signature && !('secret' in sig));
  const ok = await u.setAvatar({ sub: 'A' }, { url: 'https://res.cloudinary.com/moncloud/image/upload/v1/ifaolade/avatars/x.jpg' });
  assert.equal(ok.avatarUrl, 'https://res.cloudinary.com/moncloud/image/upload/v1/ifaolade/avatars/x.jpg');
  await assert.rejects(u.setAvatar({ sub: 'A' }, { url: 'https://res.cloudinary.com/moncloud/image/upload/v1/ifaolade/site/x.jpg' }), is(BadRequestException));
  await assert.rejects(u.setAvatar({ sub: 'A' }, { url: 'https://evil.io/ifaolade/avatars/x.jpg' }), is(BadRequestException));
});
