/* Tests de l'étape 0.2 du plan. Lancer : npm test -w @ona/core (après build). */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const core = require('../dist');

test('256 Odu uniques, 16 Méjì en tête', () => {
  const all = core.allOdu();
  assert.equal(all.length, 256);
  assert.equal(new Set(all.map((o) => o.id)).size, 256);
  assert.equal(new Set(all.map((o) => o.slug)).size, 256);
  assert.equal(new Set(all.map((o) => o.binary)).size, 256);
  assert.ok(all.slice(0, 16).every((o) => o.isMeji));
  assert.equal(all[0].slug, 'ogbe-meji');
  assert.equal(all[1].slug, 'oyeku-meji');
});

test('les 16 Méjì ont des marques distinctes', () => {
  assert.equal(new Set(core.MEJI.map((m) => m.marks.join(''))).size, 16);
});

test('oduFromMarks retrouve le bon Odu', () => {
  const o = core.oduFromMarks([1, 1, 1, 1], [2, 2, 2, 2]);
  assert.equal(o.name, 'Ogbè Ọ̀yẹ̀kú');
});

test('signature de naissance stable et reproductible', () => {
  const input = { firstName: 'Kofi', lastName: 'Mensah', birthDate: '1990-05-17', birthTime: '08:30' };
  const a = core.birthSignature(input);
  const b = core.birthSignature(input);
  assert.equal(a.id, b.id);
  assert.notEqual(core.birthSignature({ ...input, birthDate: '1990-05-18' }).id === a.id && core.birthSignature({ ...input, firstName: 'Ama' }).id === a.id, true);
});

// Thèmes de référence publiés (Astrodatabank, données classées AA). Écart toléré : 0,5°.
const sign = (name) => core.SIGNS.findIndex((s) => s.name === name);
const lon = (signName, deg, min) => sign(signName) * 30 + deg + min / 60;
const diff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const REFERENCES = [
  {
    name: 'A. Einstein, 14/03/1879 11:30 TL, Ulm',
    input: { birthDate: '1879-03-14', birthTime: '10:50', timezone: 'UTC', latitude: 48.4, longitude: 10.0 }, // TL Ulm = UTC + 0h40
    sun: lon('Poissons', 23, 30), moon: lon('Sagittaire', 14, 32), asc: lon('Cancer', 11, 38),
  },
  {
    name: 'B. Obama, 04/08/1961 19:24 HST, Honolulu',
    input: { birthDate: '1961-08-04', birthTime: '19:24', timezone: 'Pacific/Honolulu', latitude: 21.3069, longitude: -157.8583 },
    sun: lon('Lion', 12, 33), moon: lon('Gémeaux', 3, 21), asc: lon('Verseau', 18, 3),
  },
  {
    name: 'Diana Spencer, 01/07/1961 19:45 BST, Sandringham',
    input: { birthDate: '1961-07-01', birthTime: '19:45', timezone: 'Europe/London', latitude: 52.8333, longitude: 0.5 },
    sun: lon('Cancer', 9, 40), moon: lon('Verseau', 25, 2), asc: lon('Sagittaire', 18, 24),
  },
];

for (const ref of REFERENCES) {
  test(`thème de référence : ${ref.name}`, () => {
    const c = core.computeChart(ref.input);
    const sun = c.planets.find((p) => p.key === 'sun').longitude;
    const moon = c.planets.find((p) => p.key === 'moon').longitude;
    assert.ok(diff(sun, ref.sun) < 0.5, `Soleil ${sun.toFixed(2)} ≠ ${ref.sun.toFixed(2)}`);
    assert.ok(diff(moon, ref.moon) < 0.5, `Lune ${moon.toFixed(2)} ≠ ${ref.moon.toFixed(2)}`);
    assert.ok(diff(c.ascendant.longitude, ref.asc) < 0.5, `Ascendant ${c.ascendant.longitude.toFixed(2)} ≠ ${ref.asc.toFixed(2)}`);
  });
}

test('heure inconnue : pas d\'ascendant, pas de maisons', () => {
  const c = core.computeChart({ birthDate: '1990-05-17', timezone: 'Africa/Porto-Novo', latitude: 6.37, longitude: 2.39 });
  assert.equal(c.timeKnown, false);
  assert.equal(c.ascendant, null);
  assert.ok(c.planets.every((p) => p.house === null));
});

test('portrait complet : sections, aperçu, mention symbolique', () => {
  const r = core.buildReading({
    firstName: 'Ama', birthDate: '1988-11-02', birthTime: '06:15', timezone: 'Europe/Paris', latitude: 48.85, longitude: 2.35,
    answers: { blessure: 'garde', famille: 'pilier', repetition: 'souvent', trahison: 'plusieurs', domaine: 'installation', duree: 'long', intention: 'Avoir enfin mes papiers' },
  });
  const keys = r.sections.map((s) => s.key);
  assert.deepEqual(keys.slice(0, 3), ['essence', 'emotions', 'masque']);
  assert.ok(r.sections.filter((s) => s.preview).length === 3);
  assert.ok(r.topDimensions.length >= 1);
  const odu = r.sections.find((s) => s.key === 'odu');
  assert.ok(odu.paragraphs.some((p) => p.includes('Kpɔ̀lí')), 'la mention symbolique (règle 4.7) doit être présente');
  assert.ok(r.sections.find((s) => s.key === 'maintenant').paragraphs[0].includes('Avoir enfin mes papiers'));
});

test('catalogue des textes du portrait : clés uniques et non vides', () => {
  const cat = core.portraitTextCatalog();
  assert.ok(cat.length > 100);
  assert.equal(new Set(cat.map((t) => t.key)).size, cat.length);
  assert.ok(cat.every((t) => t.default && t.default.length > 5));
});

test('un texte validé par le prêtre remplace le texte par défaut', () => {
  const input = { firstName: 'Ama', birthDate: '1988-11-02', birthTime: '06:15', timezone: 'Europe/Paris', latitude: 48.85, longitude: 2.35, answers: {} };
  const base = core.buildReading(input);
  const sunKey = core.SIGNS[base.chart.planets[0].sign].key;
  const custom = core.buildReading(input, { [`sign.${sunKey}.sun`]: 'Texte écrit par le prêtre.' });
  assert.equal(custom.sections[0].paragraphs[0], 'Ama, texte écrit par le prêtre.');
  assert.notEqual(base.sections[0].paragraphs[0], custom.sections[0].paragraphs[0]);
});

// ---------- Étape 6.4 : anglais et yoruba ----------
for (const loc of ['en', 'yo']) {
  test(`pack ${loc} : couvre tous les signes, questions, réponses, aspects et Méjì`, () => {
    const p = core.corePack(loc);
    for (const s of core.SIGNS) for (const f of ['name', 'sun', 'moon', 'asc']) assert.ok(p.signs[s.key][f], `${loc} signe ${s.key}.${f}`);
    for (const q of core.QUESTIONS) {
      assert.ok(p.questions[q.id]?.title, `${loc} question ${q.id}`);
      for (const o of q.options ?? []) assert.ok(p.questions[q.id].options?.[o.value], `${loc} réponse ${q.id}.${o.value}`);
    }
    const aspectKeys = core.portraitTextCatalog().filter((t) => t.key.startsWith('aspect.')).map((t) => t.key.slice(7));
    for (const k of aspectKeys) assert.ok(p.aspects[k], `${loc} aspect ${k}`);
    assert.equal(p.meji.length, 16);
  });

  test(`portrait complet en ${loc}`, () => {
    const r = core.buildReading({ firstName: 'Ama', birthDate: '1988-11-02', birthTime: '06:15', timezone: 'Europe/Paris', latitude: 48.85, longitude: 2.35, answers: { blessure: 'garde', famille: 'pilier', repetition: 'souvent', domaine: 'installation', duree: 'long', intention: 'Avoir la paix' } }, {}, loc);
    assert.equal(r.locale, loc);
    assert.ok(r.sections.every((s) => s.title && s.paragraphs.every((x) => x && !/\{\w+\}/.test(x))), 'aucun gabarit non rempli');
    const fr = core.buildReading({ firstName: 'Ama', birthDate: '1988-11-02', birthTime: '06:15', timezone: 'Europe/Paris', latitude: 48.85, longitude: 2.35, answers: {} });
    assert.notEqual(r.sections[0].paragraphs[0], fr.sections[0].paragraphs[0]);
    assert.ok(r.sections.find((s) => s.key === 'odu').paragraphs.some((x) => x.includes('Kpɔ̀lí')), 'mention symbolique (règle 4.7)');
    assert.ok(core.questionsFor(loc).every((q) => q.title !== core.QUESTIONS.find((x) => x.id === q.id).title));
  });
}

test('les textes du prêtre (français) ne s\'appliquent pas aux autres langues', () => {
  const input = { firstName: 'Ama', birthDate: '1988-11-02', answers: {} };
  const key = `sign.${core.SIGNS[core.buildReading(input).chart.planets[0].sign].key}.sun`;
  const r = core.buildReading(input, { [key]: 'Texte du prêtre.' }, 'en');
  assert.ok(!r.sections[0].paragraphs[0].includes('Texte du prêtre'));
});

// ---------- Corrections du portrait (six points relevés sur l'exemple d'Afi) ----------
const AFI = {
  firstName: 'Afi', lastName: 'Houénou', gender: 'f', birthDate: '1992-03-08', birthTime: '05:40',
  latitude: 6.3654, longitude: 2.4183, timezone: 'Africa/Porto-Novo',
  answers: { blessure: 'garde', famille: 'pilier', repetition: 'souvent', trahison: 'une', reves: 'premonitoires', argent: 'fuit', manque: 'paix', chezsoi: 'pas-vraiment', ambiance: 'immediat', trop: 'gentil', domaine: 'installation', duree: 'long', intention: 'Obtenir mes papiers en France et retrouver la paix avec ma mère' },
};
const text = (r) => r.sections.map((s) => s.paragraphs.join(' ')).join(' ');

test('correction 1 : transition quand le Soleil et l’élément dominant diffèrent', () => {
  const r = core.buildReading(AFI);
  const p = r.sections[0].paragraphs;
  assert.ok(p.some((x) => x.startsWith("Ton Soleil appartient à l'élément Eau")), p.join(' | '));
});

test('correction 2 : toutes les dimensions fortes sont gardées (intuition, pilier)', () => {
  const r = core.buildReading(AFI);
  assert.ok(r.topDimensions.includes('intuition') && r.topDimensions.includes('porteur'), r.topDimensions.join(','));
  assert.ok(r.topDimensions.length <= 5);
});

test('correction 3 : la phrase qui parle de la mère ajoute le texte « famille »', () => {
  const r = core.buildReading(AFI);
  const now = r.sections.find((s) => s.key === 'maintenant').paragraphs.join(' ');
  assert.ok(now.includes('Ta phrase touche aussi') && now.includes('lignée'), now);
  assert.deepEqual(core.domainsInText('Je veux être une femme libre'), []);
});

test('correction 4 : la signature Odu dit qu’elle ne parle pas de la situation', () => {
  const r = core.buildReading(AFI);
  assert.ok(r.sections.find((s) => s.key === 'odu').paragraphs.some((x) => x.includes('papiers et installation')));
});

test('correction 5 : une phrase lourde n’apparaît pas sans réponse qui l’appuie', () => {
  const calm = { ...AFI, answers: { domaine: 'argent' } };
  assert.ok(!/toxiques/.test(text(core.buildReading(calm))));
});

test('correction 6 : accords au féminin et au masculin', () => {
  assert.equal(core.genderize('original·e, indépendant·e, vif·ve, doux·ce, sérieux·se, franc·che, rationnel·le, discret·e, un·e', 'f'),
    'originale, indépendante, vive, douce, sérieuse, franche, rationnelle, discrète, une');
  assert.equal(core.genderize('original·e, vif·ve, doux·ce, un·e', 'm'), 'original, vif, doux, un');
  assert.equal(core.genderize('original·e', null), 'original·e');
  assert.ok(!/\p{L}·\p{L}/u.test(text(core.buildReading(AFI))), 'plus aucune forme inclusive quand le genre est connu');
});
