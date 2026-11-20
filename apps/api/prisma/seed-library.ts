/**
 * REFONTE R22 : contenus de départ de la bibliothèque (rituels, wáàsù, divinités), publiés.
 * Ne crée QUE les entrées absentes (même type + même adresse) : une entrée modifiée dans l'admin n'est jamais écrasée.
 * Lancer : npm run db:seed-library -w @ona/api
 */
import { LIBRARY_CATEGORIES } from '@ona/core';
import { PrismaClient } from '@prisma/client';
import { LIBRARY } from './library.data';
import { LIBRARY_MORE } from './library-more.data';
import { LIBRARY_PANTHEON } from './library-pantheon.data';

async function main() {
  const prisma = new PrismaClient();
  let created = 0, kept = 0;
  for (const s of [...LIBRARY, ...LIBRARY_MORE, ...LIBRARY_PANTHEON]) {
    if (!LIBRARY_CATEGORIES[s.kind].includes(s.category)) throw new Error(`Catégorie inconnue : ${s.slug}`);
    const exists = await prisma.libraryEntry.findUnique({ where: { kind_slug: { kind: s.kind, slug: s.slug } } });
    if (exists) { kept++; continue; }
    await prisma.libraryEntry.create({
      data: {
        kind: s.kind, slug: s.slug, title: s.title, subtitle: s.subtitle ?? null, excerpt: s.excerpt, body: s.body,
        privateBody: s.privateBody ?? null, category: s.category, meta: s.meta ?? {}, oduIds: s.oduIds ?? [],
        published: true, order: s.order ?? 0,
      },
    });
    created++;
  }
  console.log(`créées : ${created}, déjà présentes (non touchées) : ${kept}`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
