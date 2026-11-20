const test = require('node:test');
const assert = require('node:assert');
const { buildReading, classifyImprint, cleanImprint, portraitTextCatalog } = require('../dist');

const base = { firstName: 'Ama', gender: 'f', birthDate: '1990-05-12', birthTime: '08:30', latitude: 6.37, longitude: 2.39, timezone: 'Africa/Porto-Novo', answers: { domaine: 'argent' } };

test('empreinte : classement des trois mesures', () => {
  assert.deepStrictEqual(classifyImprint({ hesitationMs: 800, jitterPx: 1.2, lifts: 0 }), { stability: 'stable', approach: 'direct', interrupted: false });
  assert.deepStrictEqual(classifyImprint({ hesitationMs: 3000, jitterPx: 6, lifts: 0 }), { stability: 'mobile', approach: 'reflechi', interrupted: false });
  assert.deepStrictEqual(classifyImprint({ hesitationMs: 9000, jitterPx: 25, lifts: 2 }), { stability: 'agite', approach: 'hesitant', interrupted: true });
});

test('empreinte : valeurs illisibles refusées, valeurs bornées', () => {
  assert.strictEqual(cleanImprint(null), null);
  assert.strictEqual(cleanImprint({ hesitationMs: 'x', jitterPx: 1, lifts: 0 }), null);
  assert.deepStrictEqual(cleanImprint({ hesitationMs: -5, jitterPx: 99999, lifts: 3.4 }), { hesitationMs: 0, jitterPx: 1000, lifts: 3 });
});

test('portrait sans empreinte : aucune section empreinte', () => {
  const r = buildReading(base);
  assert.ok(!r.sections.some((s) => s.key === 'empreinte'));
});

test('portrait avec empreinte : section visible sans compte, placée après les aperçus, mention toujours présente', () => {
  for (const locale of ['fr', 'en', 'yo']) {
    const r = buildReading({ ...base, imprint: { hesitationMs: 9000, jitterPx: 20, lifts: 1 } }, {}, locale);
    const i = r.sections.findIndex((s) => s.key === 'empreinte');
    assert.ok(i > 0, locale);
    const s = r.sections[i];
    assert.strictEqual(s.preview, true);
    assert.ok(r.sections.slice(0, i).every((x) => x.preview), 'seules des sections d’aperçu avant');
    assert.ok(s.paragraphs.length >= 4, locale);
    assert.ok(s.subtitle.includes('20'), locale);
  }
  const fr = buildReading({ ...base, imprint: { hesitationMs: 500, jitterPx: 1, lifts: 0 } });
  const s = fr.sections.find((x) => x.key === 'empreinte');
  assert.ok(s.paragraphs.some((p) => p.includes('prête')), 'accord féminin');
  assert.ok(s.paragraphs.at(-1).includes('pas tes pensées'));
});

test('empreinte : textes modifiables par le prêtre', () => {
  const keys = portraitTextCatalog().filter((t) => t.group === 'Empreinte du moment').map((t) => t.key);
  assert.strictEqual(keys.length, 9);
  const r = buildReading({ ...base, imprint: { hesitationMs: 500, jitterPx: 1, lifts: 0 } }, { 'imprint.stable': 'Texte du prêtre.' });
  assert.strictEqual(r.sections.find((x) => x.key === 'empreinte').paragraphs[0], 'Texte du prêtre.');
});
