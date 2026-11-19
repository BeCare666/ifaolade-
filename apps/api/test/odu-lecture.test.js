/* Plan étape 5.9 : « J'ai déjà mon Odu ». Seuls les textes PUBLIÉS par le prêtre sont montrés ; rien n'est inventé. */
process.env.NODE_ENV = 'test';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { BadRequestException, NotFoundException } = require('@nestjs/common');
const core = require('@ona/core');
const { OduController } = require('../dist/odu/odu.controller');

// Base simulée : la requête filtre déjà published: true, on vérifie que le filtre est bien demandé.
function fakePrisma(rows) {
  const calls = [];
  return {
    calls,
    oduDomainText: {
      findMany: async ({ where }) => {
        calls.push(where);
        return rows.filter((r) => where.oduId.in.includes(r.oduId) && r.domain === where.domain && (!where.published || r.published));
      },
      upsert: async (a) => a,
    },
  };
}
const meji = (i) => core.oduById(i * 17);
const omo = core.allOdu().find((o) => !o.isMeji);

test('lecture : le texte propre publié est renvoyé', async () => {
  const o = meji(0);
  const c = new OduController(fakePrisma([{ oduId: o.id, domain: 'amour', text: 'Texte du prêtre', published: true }]));
  const r = await c.lecture(o.slug, 'amour');
  assert.equal(r.own, 'Texte du prêtre');
  assert.equal(r.right, null);
});

test('lecture : un brouillon non publié n’est jamais montré', async () => {
  const o = meji(1);
  const p = fakePrisma([{ oduId: o.id, domain: 'argent', text: 'Brouillon', published: false }]);
  const r = await new OduController(p).lecture(o.slug, 'argent');
  assert.equal(r.own, null);
  assert.equal(p.calls[0].published, true);
});

test('lecture : un Ọmọ Odù sans texte propre renvoie les textes des deux Méjì, présentés à part', async () => {
  const rightId = omo.right.index * 17, leftId = omo.left.index * 17;
  const c = new OduController(fakePrisma([
    { oduId: rightId, domain: 'famille', text: 'Droite', published: true },
    { oduId: leftId, domain: 'famille', text: 'Gauche', published: true },
  ]));
  const r = await c.lecture(omo.slug, 'famille');
  assert.deepEqual([r.own, r.right, r.left], [null, 'Droite', 'Gauche']);
});

test('lecture : domaine inconnu ou Odu inconnu refusés', async () => {
  const c = new OduController(fakePrisma([]));
  await assert.rejects(c.lecture(meji(0).slug, 'loterie'), (e) => e instanceof BadRequestException);
  await assert.rejects(c.lecture('odu-imaginaire', 'amour'), (e) => e instanceof NotFoundException);
});

test('admin : un texte vide ne peut pas être publié', async () => {
  const c = new OduController(fakePrisma([]));
  await assert.rejects(c.saveDomain(0, 'amour', { text: '   ', published: true }), (e) => e instanceof BadRequestException);
  const ok = await c.saveDomain(0, 'amour', { text: ' Texte ', published: false });
  assert.equal(ok.create.text, 'Texte');
});
