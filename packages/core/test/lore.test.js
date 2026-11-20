const test = require('node:test');
const assert = require('node:assert');
const { allOdu, defaultLore, mergeLore, MEJI, MEJI_LORE } = require('../dist');

test('les 16 Méjì ont un contenu traditionnel complet', () => {
  for (const m of MEJI) {
    const l = MEJI_LORE[m.ascii];
    assert.ok(l, m.ascii);
    assert.ok(l.oriki && l.teaching && l.orisha.length && l.vodun.length && l.lessons.length >= 4, m.ascii);
    for (const k of ['todo', 'avoid', 'eat', 'noEat', 'divinities', 'colors']) assert.ok(l.birth[k].length, `${m.ascii}.${k}`);
    assert.ok(l.birth.nature && l.birth.path, m.ascii);
  }
});

test('les 256 Odu ont un contenu de départ, sans champ vide', () => {
  for (const o of allOdu()) {
    const l = defaultLore(o);
    assert.ok(l.oriki.includes(o.right.name), o.slug);
    assert.ok(l.orisha.length && l.vodun.length && l.lessons.length && l.teaching, o.slug);
    for (const v of Object.values(l.birth)) assert.ok(v.length, o.slug);
  }
});

test('une modification du prêtre remplace seulement les champs remplis', () => {
  const base = defaultLore(allOdu()[0]);
  const m = mergeLore(base, { oriki: 'Mon éloge', orisha: [], birth: { colors: ['Blanc', 'Argent'], nature: '  ' } });
  assert.strictEqual(m.oriki, 'Mon éloge');
  assert.deepStrictEqual(m.orisha, base.orisha);
  assert.deepStrictEqual(m.birth.colors, ['Blanc', 'Argent']);
  assert.strictEqual(m.birth.nature, base.birth.nature);
});

test('enseignements approfondis : les 256 Odu ont un texte complet et propre', () => {
  const { MEJI_TEACHING } = require('../dist');
  for (const m of MEJI) {
    const t = MEJI_TEACHING[m.ascii];
    assert.ok(t && t.intro.length === 2 && t.story.text && t.teaches.length >= 4 && t.asks.length >= 4 && t.warns.length >= 3 && t.word && t.question, m.ascii);
  }
  const seen = new Set();
  for (const o of allOdu()) {
    const md = defaultLore(o).teaching;
    assert.ok(md.length > 1200, `${o.slug} trop court`);
    assert.ok(md.includes('## '), o.slug);
    assert.ok(/Un récit d'Ifá|Une parabole/.test(md), `${o.slug} : récit non qualifié`);
    if (!o.isMeji) assert.ok(md.includes(o.right.name) && md.includes(o.left.name), o.slug);
    assert.ok(!seen.has(md), `${o.slug} : enseignement identique à un autre`);
    seen.add(md);
  }
});
