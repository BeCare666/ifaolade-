/**
 * Données de départ. ⚠️ Les PRIX et DATES sont PROVISOIRES : à valider par le prêtre
 * (plan §17, points 7 à 11), puis à modifier depuis l'admin.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@exemple.com').toLowerCase();
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMoi!2026', 11),
      firstName: process.env.ADMIN_FIRSTNAME || 'Babalawo',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const offers = [
    {
      code: 'FIRST_FREE', order: 1, title: 'Première consultation offerte', mode: 'VIDEO', isFree: true, requiresSlot: false,
      durationMin: 20, priceCents: 0,
      description: 'Une question, un Odu nommé et son message. En visio sur créneau, ou par écrit sous 72 heures.',
      features: ['20 minutes en visio ou réponse écrite', 'Une question précise', "L'Odu nommé et expliqué", 'Une seule fois par personne'],
    },
    {
      code: 'VIDEO', order: 2, title: 'Consultation visio', mode: 'VIDEO', isFree: false, requiresSlot: true,
      durationMin: 45, priceCents: 4500,
      description: 'Consultation complète en visio, compte rendu écrit, plan d\'action et suivi à J+7.',
      features: ['45 minutes en visio', 'Compte rendu écrit (Odu, ese, message)', "Plan d'action concret", 'Ewọ̀ (interdits) consignés', 'Suivi J+7, J+30, J+90'],
    },
    {
      code: 'ASSISTED', order: 3, title: 'Accompagnement complet', mode: 'ASSISTED', isFree: false, requiresSlot: true,
      durationMin: 60, priceCents: 15000,
      description: 'Consultation approfondie, ebo supervisé par le prêtre (matériel facturé au réel, à part), preuve vidéo ou présence en direct, 90 jours d\'accompagnement.',
      features: ['60 minutes en visio', 'Ebo supervisé (matériel détaillé, à part)', 'Preuve vidéo ou présence en direct', 'Suivis J+7, J+30, J+90', 'Échange écrit pendant 90 jours'],
    },
  ];
  for (const o of offers) {
    await prisma.consultationOffer.upsert({ where: { code: o.code }, update: {}, create: o });
  }

  const initiation = await prisma.program.upsert({
    where: { slug: 'initiation-ifa-foret-sacree' },
    update: {},
    create: {
      slug: 'initiation-ifa-foret-sacree', kind: 'INITIATION',
      title: 'Initiation à Ifá en forêt sacrée', subtitle: 'Itẹ̀fá / Fá : découvre ton Kpɔ̀lí au Bénin',
      description: "Une initiation traditionnelle encadrée par le prêtre, dans la forêt, au Bénin. Préparation en amont, accompagnement sur place, suivi après le retour. Le déroulé exact, les conditions et les interdits sont communiqués avant la réservation.",
      durationDays: 7, priceCents: 250000, published: false,
      includes: ['Accueil à l\'aéroport de Cotonou', 'Hébergement et repas', 'Cérémonies et matériel rituel', 'Accompagnement du prêtre', 'Suivi après le retour'],
      itinerary: [
        { day: 1, title: 'Arrivée et accueil', text: 'Accueil à Cotonou, installation, échange de préparation.' },
        { day: 2, title: 'Préparation', text: 'À compléter par le prêtre.' },
      ],
    },
  });

  const tour = await prisma.program.upsert({
    where: { slug: 'immersion-benin-vodoun' },
    update: {},
    create: {
      slug: 'immersion-benin-vodoun', kind: 'TOUR',
      title: 'Immersion Bénin : sur les traces du Vodoun', subtitle: 'Cotonou · Ouidah · Abomey · Porto-Novo · Ganvié',
      description: 'Un circuit pour comprendre le Bénin, son histoire et ses cultes, accompagné du prêtre et de guides locaux.',
      durationDays: 10, priceCents: 180000, published: false,
      includes: ['Transport sur place', 'Hébergement', 'Guides locaux', 'Entrées des sites', 'Rencontres avec des dignitaires'],
      itinerary: [
        { day: 1, title: 'Cotonou', text: 'Arrivée, marché Dantokpa, Fondation Zinsou.' },
        { day: 2, title: 'Ouidah', text: 'Route des Esclaves, Porte du Non-Retour, Temple des Pythons, Forêt sacrée de Kpassè.' },
        { day: 4, title: 'Abomey', text: 'Palais royaux, patrimoine mondial de l\'UNESCO.' },
        { day: 6, title: 'Porto-Novo', text: 'Musée da Silva, Jardin des plantes et de la nature.' },
        { day: 7, title: 'Ganvié', text: 'Cité lacustre sur le lac Nokoué.' },
        { day: 8, title: 'Grand-Popo et Possotomè', text: 'Bouche du Roy, lac Ahémé.' },
      ],
    },
  });

  for (const p of [initiation, tour]) {
    if (!(await prisma.programSession.count({ where: { programId: p.id } }))) {
      await prisma.programSession.create({
        data: { programId: p.id, startDate: new Date('2027-03-08T08:00:00Z'), endDate: new Date(Date.UTC(2027, 2, 8 + p.durationDays)), capacity: 8 },
      });
    }
  }

  await prisma.event.upsert({
    where: { slug: 'vodun-days-ouidah-2027' },
    update: {},
    create: {
      slug: 'vodun-days-ouidah-2027', title: 'Vodun Days 2027 à Ouidah', subtitle: 'La fête nationale des religions endogènes',
      description: 'Séjour accompagné autour du 10 janvier à Ouidah : cérémonies, rencontres, découverte. Dates officielles à confirmer.',
      location: 'Ouidah, Bénin', startsAt: new Date('2027-01-08T09:00:00Z'), endsAt: new Date('2027-01-11T18:00:00Z'),
      priceCents: 0, capacity: 30, published: false,
    },
  });

  const articles = [
    { slug: '7-signes-faux-babalawo', category: 'arnaques', title: "7 signes d'un faux babalawo" },
    { slug: 'combien-coute-vraiment-un-ebo', category: 'arnaques', title: 'Combien coûte vraiment un ebo ?' },
    { slug: 'ce-que-ifa-ne-te-demandera-jamais', category: 'comprendre-ifa', title: "Ce qu'Ifá ne te demandera jamais" },
    { slug: 'kpoli-ton-signe-de-fa', category: 'vodoun', title: 'Kpɔ̀lí : ton signe de Fá' },
    { slug: 'les-16-odu-majeurs', category: 'comprendre-ifa', title: 'Les 16 Odu majeurs' },
  ];
  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: { ...a, excerpt: 'Article à rédiger par le prêtre.', body: '_Brouillon — à rédiger._', published: false },
    });
  }

  console.log('Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
