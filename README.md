# Tech Memory KB — Moteur de Mémoire Technique & Base d'Incidents

> **« J’ai déjà rencontré ce problème. Comment est-ce que je l’avais résolu ? »**

Tech Memory KB est un moteur de mémoire technique personnel haute performance conçu pour capitaliser sur les problèmes rencontrés, leurs symptômes, leurs causes racines, les investigations menées et surtout les solutions reproductibles permettant de les résoudre rapidement lorsqu’un problème similaire réapparaît.

---

## 1. Vision Produit & Piliers

La plateforme combine 4 dimensions clés :
1. **Base de connaissances structurée** : Fiches d'incidents techniques enrichies avec classification hiérarchique.
2. **Vue Quick Fix immédiate** : Affichage prioritaire *Symptôme $\rightarrow$ Cause $\rightarrow$ Solution $\rightarrow$ Commandes copibales* pour un dépannage en moins de 60 secondes.
3. **Moteur "J'ai déjà vu ça" & Détection de Doublons** : Algorithme pondéré de similarité textuelle multi-critères.
4. **Calculateur de Score Qualité (0-100%)** : Évaluation objective de la complétude et de la valeur actionnable de chaque fiche.

```mermaid
graph TD
    A[Incident Technique Survenu] --> B{Recherche Immédiate Ctrl+K}
    B -->|Problème Déjà Vu| C[Vue Quick Fix & Runbook]
    C --> D[Copie des Commandes 1-Clic]
    D --> E[Vérification & Log du Test]
    B -->|Nouveau Problème| F[Quick Capture 60s]
    F --> G[Investigation & Analyse Racine]
    G --> H[Enrichissement & Score Qualité 100%]
```

---

## 2. Fonctionnalités Principales

### 2.1 Vue "Quick Fix" & Mode Runbook
- **Bannière de synthèse haute** : Symptôme, message d'erreur brut, cause racine catégorisée, solution définitive et statut de validation.
- **Blocs de commandes exécutables** : Snippets avec coloration, description du contexte, sortie attendue et bouton de copie instantanée avec feedback visuel.
- **Timeline d'investigation** : Historique ordonné des hypothèses formulées, commandes de diagnostic exécutées et conclusions tirées.
- **Étapes de résolution pas-à-pas** : Runbook numéroté avec actions et résultats escomptés.

### 2.2 Moteur de Similarité & Détection de Doublons
- **Nettoyage linguistique** : Tokenisation bilingue (français / anglais), suppression des stop-words techniques (`erreur`, `error`, `failed`, `les`, `des`, `avec`).
- **Pondération multi-champs** :
  - **35%** : Messages d'erreur et logs bruts (Jaccard + sous-chaîne n-gram).
  - **25%** : Titre du problème.
  - **20%** : Symptômes observés.
  - **10%** : Stack technologique.
  - **10%** : Cause racine.
- **Alertes en temps réel** : Détection proactive des doublons lors de la saisie d'une fiche ou d'un import de fichier.

### 2.3 Score de Qualité & Complétude
Calcul automatique sur 9 critères d'exigence technique :
1. Titre clair et explicite (+10 pts)
2. Symptômes détaillés (+10 pts)
3. Message d'erreur exact ou code retour (+15 pts)
4. Cause racine documentée (+15 pts)
5. Solution rapide renseignée (+15 pts)
6. Commandes de remédiation fournies (+15 pts)
7. Étapes de résolution ordonnées (+10 pts)
8. Démarche d'investigation consignée (+5 pts)
9. Test de validation exécuté avec succès (+5 pts)

### 2.4 Authentification & Sécurité
- **Provisionnement manuel** : Inscription publique désactivée pour préserver l'intégrité de la base.
- **Mots de passe hachés** : `bcryptjs` avec salt rounds = 10.
- **Session JWT Stateless** : Signature `jose` (`HS256`, 7 jours) stockée dans un cookie `HttpOnly`, `Secure`, `SameSite: Lax`.
- **Middleware Edge** : Protection de l'intégralité des routes applicatives et APIs privées.

### 2.5 Import / Export Multi-Formats
- **Export Markdown (`.md`)** : Génération de runbooks formatés exploitables hors-ligne ou dans un dépôt Git/Obsidian.
- **Export Excel (`.xlsx`) & CSV (`.csv`)** : Tableaux de bord exploitables avec métadonnées complètes.
- **Export JSON (`.json`)** : Schéma complet avec relations pour sauvegardes et migrations.
- **Import avec Détection de Doublons** : Prévisualisation, validation des champs obligatoires et rapport d'anomalies.

---

## 3. Stack Technique

- **Frontend & App Router** : [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript, TailwindCSS, Lucide Icons.
- **Base de Données** : [Neon PostgreSQL](https://neon.tech/) (PostgreSQL Serverless avec SSL obligatoire).
- **ORM** : [Prisma 6](https://www.prisma.io/) avec migrations déclaratives.
- **Sécurité & Auth** : `bcryptjs`, `jose` (JWT Edge-compatible).
- **Parsers & Tableurs** : `xlsx`, `papaparse`.

---

## 4. Guide de Démarrage Rapide

### Prérequis
- Node.js 18+ ou 20+
- Compte Neon PostgreSQL (ou instance PostgreSQL 14+)

### 1. Installation
```bash
git clone https://github.com/Nerd658/tech-knowledge-base.git
cd tech-knowledge-base
npm install
```

### 2. Configuration (`.env`)
Créez un fichier `.env` basé sur `.env.example` :
```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-dry-night-axbkaqi0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secure-secret-key-32-chars-minimum"
NEXT_PUBLIC_APP_NAME="Tech Memory KB"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="production"
```

### 3. Synchronisation & Seed de la Base
```bash
# Pousser le schéma Prisma vers Neon
npm run prisma:push

# Peupler la base avec les catégories, tags, admin et incidents modèles
npm run prisma:seed
```

### 4. Build de Production
```bash
npm run build
npm run start
```

---

## 5. Identifiants Développeur par Défaut

Lors de l'initialisation (`npm run prisma:seed`), l'accès administrateur suivant est créé :

- **Email** : `admin@knowledge.local`
- **Mot de passe** : `AdminPassword123!`
- **Rôle** : `ADMIN`

---

## 6. Déploiement sur Vercel

Le projet est configuré avec un hook `"postinstall": "prisma generate"` dans `package.json` pour un déploiement instantané sur Vercel.

1. Poussez votre dépôt sur GitHub / GitLab.
2. Rendez-vous sur [Vercel](https://vercel.com/new) et importez le dépôt.
3. Configurez les variables d'environnement dans l'interface Vercel :
   - `DATABASE_URL` : Chaîne de connexion PostgreSQL Neon.
   - `JWT_SECRET` : Clé secrète JWT.
   - `NODE_ENV` : `production`
4. Cliquez sur **Deploy**.

---

## 7. Structure du Projet

```text
tech-knowledge-base/
├── prisma/
│   ├── schema.prisma       # Modélisation relationnelle (14 entités)
│   └── seed.ts             # Script de peuplement de la base Neon
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout racine (Sidebar, Header, CommandPalette)
│   │   ├── page.tsx        # Dashboard, Hero Search, KPIs
│   │   ├── login/          # Page de connexion
│   │   ├── entries/        # Explorateur multi-critères & [id] fiche détaillée
│   │   ├── commands/       # Bibliothèque transversale de commandes
│   │   ├── categories/     # Gestionnaire des catégories
│   │   ├── import-export/  # Centre d'importation et d'exportation
│   │   ├── audit/          # Traçabilité & journal d'audit
│   │   └── api/            # 15 Route Handlers RESTful
│   ├── components/
│   │   ├── entries/        # QuickFixCard, QualityBadge, CopyButton, Timelines
│   │   ├── layout/         # Sidebar, Header
│   │   ├── search/         # CommandPalette (Ctrl+K), SimilarityWarning
│   │   └── forms/          # QuickCaptureModal
│   ├── lib/
│   │   ├── auth.ts         # Hachage bcrypt, JWT, sessions
│   │   ├── prisma.ts       # Singleton PrismaClient
│   │   ├── similarity.ts   # Moteur de calcul de similarité
│   │   ├── quality.ts      # Moteur de score qualité (9 critères)
│   │   └── export-import.ts# Moteurs de conversion MD, XLSX, CSV, JSON
│   ├── middleware.ts       # Middleware Edge de protection des routes
│   └── types/              # Définitions et interfaces TypeScript
├── tests/
│   ├── auth.test.ts        # Tests unitaires authentification
│   ├── similarity.test.ts  # Tests unitaires similarité
│   ├── quality.test.ts     # Tests unitaires score qualité
│   └── export-import.test.ts # Tests unitaires conversion formats
├── ARCHITECTURE.md         # Architecture logicielle et flux de données
├── API.md                  # Spécification détaillée des endpoints REST
├── SCHEMA.md               # Schéma des données et dictionnaire de champs
└── commit.txt              # Journal de livraison
```

---

## 8. Exécution des Tests

```bash
# Exécuter l'ensemble de la suite de tests unitaires
npx tsx tests/auth.test.ts
npx tsx tests/similarity.test.ts
npx tsx tests/quality.test.ts
npx tsx tests/export-import.test.ts
```

---

## 9. Licence

Projet personnel open-source sous licence MIT.
