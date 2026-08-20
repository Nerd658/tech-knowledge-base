# Tech Memory KB — Moteur de Mémoire Technique Personnel

> **« J’ai déjà rencontré ce problème. Comment est-ce que je l’avais résolu ? »**

Une plateforme moderne de capitalisation et de résolution rapide d'incidents techniques, conçue pour documenter un problème une seule fois et retrouver immédiatement la solution validée, les commandes exactes et les investigations plusieurs mois ou années plus tard.

---

## 🚀 Fonctionnalités Clés

### 1. Vue "Quick Fix" Immédiate
Quand vous ouvrez une fiche d'incident, l'essentiel s'affiche au premier coup d'œil pour une résolution en moins d'une minute :
1. **Symptôme & Message d'erreur exact**
2. **Cause Racine (Root Cause Analysis & Classification)**
3. **Solution Finale**
4. **Commandes Immédiates** avec bouton de copie en 1 clic
5. **Statut de Validation & Environnement testé**

### 2. Recherche Globale Ultra-Rapide (`Ctrl + K`)
* Recherche multi-critères : par symptôme, port, service, code d'erreur, technologie, outil ou commande.
* Modal global accessible depuis n'importe quelle page.
* Navigation clavier (`↑`, `↓`, `Entrée`, `Echap`) et aperçu instantané.

### 3. Détection de Doublons & "J'ai déjà vu ça"
* Algorithme de similarité pondéré analysant les messages d'erreurs (35%), symptômes (25%), titres (20%), technologies et causes (20%).
* Avertissement interactif en cours de saisie pour éviter les redondances.
* Bouton "Problèmes Similaires" sur chaque fiche pour explorer les incidents connexes.

### 4. Mode "+ Quick Capture"
* Formulaire rapide pour consigner un incident en moins de 60 secondes sur le terrain.
* La fiche peut être enrichie ultérieurement.

### 5. Bibliothèque de Commandes & Snippets
* Catalogue centralisé des commandes (Bash, PowerShell, Python, SQL, Docker, etc.).
* Filtrage par langage et copie instantanée dans le presse-papiers.

### 6. Score de Qualité & Complétude (0 à 100%)
* Checklist dynamique encourageant l'amélioration de la base (symptômes précis, cause renseignée, commandes fournies, tests validés, ressources associées).

### 7. Import / Export Multi-Formats
* **Export** : Markdown individuel ou global (.md), Excel (.xlsx), CSV (.csv), JSON (.json).
* **Import** : Transformation de tableaux Excel/CSV en fiches structurées avec détection de doublons et rapport de validation.

### 8. Traçabilité, Historique & Versions
* Historique des tests de résolution sur différents environnements (Production, Staging, Dev).
* Versioning immuable avec aperçu des modifications.
* Journal d'audit complet de toutes les actions (créations, modifications, exports, suppressions).

---

## 🛠️ Stack Technique

* **Frontend** : Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Lucide Icons.
* **Backend & API** : Next.js Server Components & Route Handlers typés.
* **Base de données** : PostgreSQL managé sur **Neon** (Serverless Postgres avec SSL & Connection Pooling).
* **ORM** : Prisma ORM 6 avec migrations et typage strict.

---

## 📦 Installation & Démarrage

### Prérequis
* Node.js v18+ ou v20+
* Chaîne de connexion PostgreSQL (Neon ou local)

### 1. Cloner et installer les dépendances
```bash
cd tech-knowledge-base
npm install
```

### 2. Configurer l'environnement
Copiez `.env.example` vers `.env` et ajustez `DATABASE_URL` :
```bash
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-your-instance.neon.tech/neondb?sslmode=require"
```

### 3. Initialiser la base de données
```bash
# Générer le client Prisma
npm run prisma:generate

# Pousser le schéma vers Neon
npm run prisma:push

# Injecter les données de démonstration (Wazuh, OpenSSL, etc.)
npm run prisma:seed
```

### 4. Lancer le projet
```bash
# Compiler le projet
npm run build

# Démarrer le serveur de production
npm run start
```
*Note : Pour lancer en mode développement (si souhaité) : `npm run dev`*

---

## 📂 Structure du Projet

```text
tech-knowledge-base/
├── prisma/
│   ├── schema.prisma       # Schéma PostgreSQL complet
│   └── seed.ts             # Données de démonstration réalistes
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout global (Sidebar, Header, CommandPalette)
│   │   ├── page.tsx        # Dashboard d'accueil & Hero Search
│   │   ├── entries/
│   │   │   ├── page.tsx    # Explorateur & Filtres avancés
│   │   │   ├── new/        # Formulaire complet d'incident
│   │   │   └── [id]/       # Vue Quick Fix, Investigation, Runbook
│   │   ├── commands/       # Bibliothèque des commandes & snippets
│   │   ├── categories/     # Explorateur des catégories
│   │   ├── import-export/  # Import/Export CSV, XLSX, JSON, Markdown
│   │   ├── audit/          # Journal d'audit et traçabilité
│   │   └── api/            # API Route Handlers RESTful
│   ├── components/
│   │   ├── entries/        # QuickFixCard, QualityBadge, CopyButton, Timelines
│   │   ├── layout/         # Sidebar, Header
│   │   ├── search/         # CommandPalette (Ctrl+K), SimilarityWarning
│   │   └── forms/          # QuickCaptureModal
│   ├── lib/
│   │   ├── prisma.ts       # Singleton Prisma Client
│   │   ├── similarity.ts   # Moteur de calcul de similarité & doublons
│   │   ├── quality.ts      # Calculateur de score de qualité
│   │   └── export-import.ts# Moteurs de conversion MD, XLSX, CSV, JSON
│   └── types/              # Définitions TypeScript
├── ARCHITECTURE.md         # Documentation d'architecture détaillée
├── API.md                  # Documentation des points d'API
├── SCHEMA.md               # Référence du modèle de données
└── commit.txt              # Fichier de suivi de livraison
```

---

## 🔒 Sécurité & Bonnes Pratiques

* Aucun secret ni jeton n'est stocké en clair sans précaution.
* Nettoyage automatique des balises et sanitisation des entrées.
* Chiffrement TLS/SSL obligatoire pour les connexions à distance Neon (`sslmode=require`).
* Journalisation d'audit immuable pour toutes les opérations critiques.
