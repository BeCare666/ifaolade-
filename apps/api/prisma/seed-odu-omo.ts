/**
 * REFONTE R22 : un texte propre pour chacun des 240 Ọmọ Odù dans les 7 domaines (brouillons publiés, décision du 2026-11-20).
 * Texte = message du Méjì qui gouverne (jambe droite : le texte publié en base, donc celui du prêtre s'il l'a modifié)
 *       + nuance propre au Méjì de la jambe gauche (odu-nuances.data.js).
 * Ne crée QUE les textes absents : un texte déjà écrit ou modifié par le prêtre n'est jamais écrasé.
 * Lancer : npm run db:seed-odu-omo -w @ona/api
 */
import { allOdu, MEJI } from '@ona/core';
import { PrismaClient } from '@prisma/client';
import { ODU_DOMAIN_TEXTS, type Domain } from './odu-domains.data';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const NUANCES: Record<string, Record<Domain, string>> = require('./odu-nuances.data.js');

const DOMAINS: Domain[] = ['amour', 'argent', 'sante', 'famille', 'installation', 'spirituel', 'enfants'];

async function main() {
  const prisma = new PrismaClient();
  const existing = await prisma.oduDomainText.findMany({ select: { oduId: true, domain: true, text: true, published: true } });
  const key = (id: number, d: string) => `${id}:${d}`;
  const have = new Set(existing.map((r) => key(r.oduId, r.domain)));
  const mejiText = (index: number, d: Domain) => {
    const row = existing.find((r) => r.oduId === index * 17 && r.domain === d && r.published && r.text.trim());
    return row?.text ?? ODU_DOMAIN_TEXTS[MEJI[index].ascii][d];
  };
  const rows: { oduId: number; domain: string; text: string; published: boolean }[] = [];
  for (const o of allOdu()) {
    if (o.isMeji) continue;
    for (const d of DOMAINS) {
      if (have.has(key(o.id, d))) continue;
      const nuance = NUANCES[o.left.ascii]?.[d];
      if (!nuance) throw new Error(`Nuance manquante : ${o.left.ascii} / ${d}`);
      const text = `${o.name} se lit d'abord par ${o.right.name}, la jambe droite, qui donne la direction.\n\n${mejiText(o.right.index, d)}\n\n${o.left.name}, la jambe gauche, vient préciser ce message : ${nuance}`;
      rows.push({ oduId: o.id, domain: d, text, published: true });
    }
  }
  for (let i = 0; i < rows.length; i += 200) await prisma.oduDomainText.createMany({ data: rows.slice(i, i + 200), skipDuplicates: true });
  console.log(`créés : ${rows.length}, déjà présents (non touchés) : ${have.size}`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
