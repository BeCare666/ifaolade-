const test = require('node:test');
const assert = require('node:assert');
const { makeDivinityLinker } = require('../dist');

const refs = [
  { slug: 'orunmila', title: 'Ọ̀rúnmìlà', otherNames: 'Ifá, Àgbọnnìrègún, Fá (Bénin)' },
  { slug: 'ogun', title: 'Ògún', otherNames: 'Ògún Onírè, Gu (Fon)' },
  { slug: 'sango', title: 'Ṣàngó', otherNames: 'Jàkúta, Hɛvioso (Xɛbioso, Fon)' },
  { slug: 'egungun', title: 'Egúngún', subtitle: 'Kúvitó au Bénin · les ancêtres qui reviennent', otherNames: 'Egún, Kúvitó (Fon), les Revenants' },
  { slug: 'iyami', title: 'Ìyàmí Ọ̀ṣọ̀rọ̀ngà', subtitle: 'Les Mères, les oiseaux de la nuit', otherNames: 'Àwọn Ìyá wa, Àjẹ́' },
  { slug: 'hevioso', title: 'Hɛvioso', otherNames: 'Xɛbioso, Sogbo' },
  { slug: 'onile', title: 'Onílẹ̀ · Ayí', subtitle: 'La Terre, mère qui porte tout', otherNames: 'Onílẹ̀, Ilẹ̀, Ayé (yoruba), Ayí (fon)' },
];

test('les noms cités dans les Odu mènent à la bonne divinité', () => {
  const link = makeDivinityLinker(refs);
  assert.strictEqual(link('Fá'), 'orunmila');
  assert.strictEqual(link('Ọ̀rúnmìlà (Fá)'), 'orunmila');
  assert.strictEqual(link('Gu'), 'ogun');
  assert.strictEqual(link('Hɛvioso'), 'hevioso', 'la fiche propre passe avant les autres noms');
  assert.strictEqual(link('Les mères (Ìyàmí)'), 'iyami');
  assert.strictEqual(link('Kúvitó (les revenants)'), 'egungun');
  assert.strictEqual(link('La Terre (Ilẹ̀, Ayí)'), 'onile');
  assert.strictEqual(link('Inconnu'), undefined);
});
