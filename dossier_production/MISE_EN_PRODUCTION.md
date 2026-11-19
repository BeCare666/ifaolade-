# MISE EN PRODUCTION : Ifaôladé (plan, phase 8)

> Chaque étape : ce que tu fais, où, et le critère « Réussi quand ». Dans l'ordre. Rien d'autre.
> Les clés et mots de passe ne sont **jamais** écrits dans le code ni envoyés par message : seulement dans Render, Vercel et ton fichier `.env` local.

---

## Étape A. Base de données : TiDB Cloud

1. Sur tidbcloud.com, crée un cluster **Serverless**, région **Frankfurt (eu-central-1)**.
2. Dans *Connect*, choisis « Prisma » et copie la chaîne de connexion.
3. Ajoute `/ifaolade?sslaccept=strict` à la fin (nom de la base et TLS obligatoire).
4. Sur ton ordinateur, dans `apps/api/.env`, mets `DATABASE_URL="…"`.
5. Lance `npm run db:push`, puis `npm run db:seed`.

**Réussi quand** les tables apparaissent dans TiDB et que tu peux te connecter au site avec `ADMIN_EMAIL` et `ADMIN_PASSWORD`. Change ensuite ce mot de passe.

## Étape B. Emails : Brevo

1. Crée le compte Brevo et va dans *Expéditeurs et domaines*.
2. Ajoute ton domaine (ex. `ifaolade.com`).
3. Copie les enregistrements **SPF, DKIM et DMARC** chez ton registrar (là où tu as acheté le domaine).
4. Attends que Brevo affiche « authentifié ».
5. Dans *SMTP et API*, crée une clé API et note-la comme `BREVO_API_KEY`.
6. Renseigne `MAIL_FROM_EMAIL` (ex. `contact@ifaolade.com`) et `MAIL_ADMIN_EMAIL` (ton email, qui recevra les alertes).

**Réussi quand** un email d'inscription test arrive dans une boîte Gmail **hors des indésirables**.

## Étape C. Médias : Cloudinary

Dans le tableau de bord Cloudinary, note `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET`. Les dossiers `ifaolade/…` se créent tout seuls au premier envoi. Les preuves d'ebo sont stockées en mode **authenticated** (privé).

**Réussi quand**, depuis l'admin, une photo de programme s'envoie et s'affiche.

## Étape D. Paiements

**FeexPay (Mobile Money).** Dans ton espace FeexPay, récupère :
- la **clé API** (côté serveur) : `FEEXPAY_API_KEY` dans Render ;
- le **jeton public** et l'**identifiant de boutique** (côté site) : `NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY` et `NEXT_PUBLIC_FEEXPAY_SHOP_ID` dans Vercel.

C'est la même méthode que sur edoto.

**Stripe (carte, diaspora).**
1. Récupère la clé secrète et note-la comme `STRIPE_SECRET_KEY`.
2. Dans *Développeurs › Webhooks*, ajoute un point de terminaison : `https://<ton-api>.onrender.com/api/payments/webhooks/stripe`, avec l'événement `checkout.session.completed`.
3. Copie le **secret de signature** et note-le comme `STRIPE_WEBHOOK_SECRET`.

⚠️ Avant d'activer chaque fournisseur, lis ses conditions d'utilisation sur les services spirituels (plan §14.4).

**Réussi quand** un paiement réel de 1 € par chaque moyen confirme la consultation, puis est remboursé depuis le tableau de bord du fournisseur.

## Étape E. API sur Render

1. Pousse le dépôt sur GitHub (privé).
2. Sur Render, choisis *New › Blueprint* et sélectionne le dépôt : `render.yaml` est lu automatiquement.
3. Renseigne les variables marquées `sync: false` : `DATABASE_URL`, `WEB_URL` (`https://ifaolade.com`), `API_URL` et les clés des étapes B, C et D.
4. `JWT_SECRET` est généré automatiquement.

L'API **refuse de démarrer** si la configuration est dangereuse (secret trop court, base sans TLS, site sans https, Brevo absent) : lis alors le message dans les journaux Render.

**Réussi quand** `https://<ton-api>.onrender.com/api/health` répond `{"ok":true,"db":"ok"}`.

## Étape F. Site sur Vercel

1. Sur Vercel, importe le dépôt et règle *Root Directory* sur `apps/web`. `vercel.json` gère l'installation depuis la racine.
2. Variables :
   - `NEXT_PUBLIC_API_URL=https://<ton-api>.onrender.com/api`
   - `NEXT_PUBLIC_SITE_NAME=Ifaôladé`
   - `NEXT_PUBLIC_SITE_URL=https://ifaolade.com`
   - les deux variables FeexPay publiques.
3. Dans *Domains*, ajoute `ifaolade.com` et `www.ifaolade.com`, puis suis les instructions DNS.

**Réussi quand** le site s'ouvre en https sur ton domaine et que la page Consultations affiche les 3 offres.

## Étape G. Vérifications avant ouverture (étape 8.1)

- [ ] `npm test -w @ona/core` : tous les tests passent.
- [ ] `npm run build -w @ona/api && npm test -w @ona/api` : tous les tests de sécurité passent.
- [ ] Parcours complet sur le vrai site, avec un compte test :
  1. portrait ;
  2. inscription ;
  3. email confirmé ;
  4. consultation offerte ;
  5. tu publies le compte rendu ;
  6. consultation payante ;
  7. ebo proposé, accepté, payé ;
  8. vidéo de preuve ;
  9. suivi J+7 (modifie la date d'échéance en base pour le tester).
- [ ] Même parcours sur un téléphone (Android **et** iPhone).
- [ ] Réservation d'un voyage : acompte, puis solde.
- [ ] Inscription à un événement : billet QR, puis contrôle à l'entrée (scan avec le téléphone).
- [ ] Lighthouse supérieur à 90 (Chrome › Outils de développement › Lighthouse) sur l'accueil, Consultations et une fiche Odu.

## Étape H. Conformité (étape 8.2)

- [ ] Compléter **tous** les passages `[à compléter]` : mentions légales, CGV (règles d'annulation), confidentialité (email du délégué à la protection des données, durées), page À propos.
- [ ] Registre des traitements et désignation du délégué à la protection des données, sur le même modèle que les documents APDP d'edoto.
- [ ] Déclaration ou notification à l'**APDP** (Bénin).
- [ ] Bandeau cookies : **non nécessaire tant que** le site n'utilise que du stockage strictement nécessaire (connexion, brouillon du portrait, préférences), comme l'explique la page Cookies. À ajouter avant tout outil de mesure d'audience.
- [ ] Assurance responsabilité civile professionnelle pour les séjours ; contrats écrits avec les partenaires sur place.
- [ ] Dépôt de la marque « Ifaôladé » (OAPI pour l'Afrique ; INPI ou EUIPO pour l'Europe).

## Étape I. Sauvegardes et supervision

- TiDB Cloud : vérifie que les sauvegardes automatiques sont actives, puis **fais une restauration test une fois**.
- Render : active les alertes par email sur l'échec de la sonde `/api/health`.
- Supervision des erreurs (facultatif mais recommandé) : un compte Sentry (offre gratuite), à brancher sur l'API et le site. Dis-le-moi le moment venu, je l'intègre.

## Étape J. Lancement doux (étape 8.5)

1. Ouvre le site à **30 personnes** de ta communauté (lien direct, pas encore de publicité).
2. Pendant deux semaines, note chaque retour : un texte du portrait « juste », « à côté » ou « choquant », un bug, une question.
3. Corrige, puis ouvre au public et lance les contenus d'acquisition (plan §18).
