/**
 * Importe les interprétations Méjì × domaine (plan, étape 5.9).
 * Ne crée QUE les textes absents : un texte déjà modifié par le prêtre n'est jamais écrasé.
 * Lancer : npm run db:seed-odu -w @ona/api
 */
import { MEJI } from '@ona/core';
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ODU_DOMAIN_TEXTS, type Domain } from './odu-domains.data';

const DOMAINS: Domain[] = ['amour', 'argent', 'sante', 'famille', 'installation', 'spirituel', 'enfants'];
const LABEL: Record<Domain, string> = { amour: 'Amour', argent: 'Argent et travail', sante: 'Santé', famille: 'Famille', installation: 'Papiers et installation', spirituel: 'Spirituel et protection', enfants: 'Enfants et fertilité' };

async function main() {
  const prisma = new PrismaClient();
  let created = 0, kept = 0;
  const md: string[] = ['# Interprétations des 16 Méjì par domaine', '', 'À relire par le prêtre. Chaque texte se modifie dans l’admin : Odu → fiche du Méjì → onglet du domaine.', ''];
  for (const m of MEJI) {
    const texts = ODU_DOMAIN_TEXTS[m.ascii];
    if (!texts) throw new Error(`Textes manquants pour ${m.ascii}`);
    const oduId = m.index * 17;
    md.push(`## ${m.name} (${m.fon})`, '');
    for (const d of DOMAINS) {
      const text = texts[d];
      if (!text) throw new Error(`Texte manquant : ${m.ascii} / ${d}`);
      md.push(`**${LABEL[d]}.** ${text}`, '');
      const exists = await prisma.oduDomainText.findUnique({ where: { oduId_domain: { oduId, domain: d } } });
      if (exists) { kept++; continue; }
      await prisma.oduDomainText.create({ data: { oduId, domain: d, text, published: true } });
      created++;
    }
  }
  writeFileSync(join(__dirname, '..', '..', '..', 'dossier_production', 'TEXTES_ODU_DOMAINES.md'), md.join('\n'));
  console.log(`créés : ${created}, déjà présents (non touchés) : ${kept}`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
