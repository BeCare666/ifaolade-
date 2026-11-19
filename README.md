# Ifaôladé

Plateforme Ifá : vitrine, portrait « Connais-toi », consultations transparentes, dossier spirituel, initiation et voyages au Bénin.

**Document de référence : [`dossier_production/PLAN_APP_IFA.md`](dossier_production/PLAN_APP_IFA.md).** Rien ne se construit hors de ce plan.

## Structure

| Dossier | Rôle |
|---|---|
| `packages/core` | Moteurs déterministes (sans IA) : 256 Odu, thème natal astronomique, questionnaire, portrait |
| `apps/api` | NestJS 11 + Prisma + TiDB Cloud, Brevo, Cloudinary, Stripe, FeexPay |
| `apps/web` | Next.js 15 + Tailwind 4 (design system « kaolin, indigo, osùn ») |

## Démarrer

```bash
npm install
npm run build:core                 # à refaire après chaque modification de packages/core
npm test -w @ona/core              # 9 tests, dont 3 thèmes de référence

# API
cp apps/api/.env.example apps/api/.env   # remplir DATABASE_URL (TiDB), JWT_SECRET, clés…
npm run db:push                    # crée les tables dans TiDB
npm run db:seed                    # admin, offres, programmes, événement, articles (prix provisoires)
npm run dev:api                    # http://localhost:4000/api

# Web
cp apps/web/.env.example apps/web/.env.local
npm run dev:web                    # http://localhost:3000 ; catalogue : /design
```

Sans clés Stripe ni FeexPay, et hors production, les paiements sont **simulés** pour tester les parcours. Sans clé Brevo, les emails sont écrits dans la console.
